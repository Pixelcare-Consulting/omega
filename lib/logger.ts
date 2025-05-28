
// Unified Logger System for Omega Portal
// Supports console, file, and database logging with configurable levels

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';
type LogCategory = 'auth' | 'sap' | 'api' | 'system' | 'security' | 'database';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  metadata?: Record<string, any>;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

// Configuration
const LOG_CONFIG = {
  enableConsole: true, // Always enable console logging
  enableFile: true, // Always enable file logging (both dev and prod)
  enableDatabase: true,
  minLevel: (process.env.LOG_LEVEL as LogLevel) || 'info',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
};

// Log level hierarchy for filtering
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4,
};

// Check if we're in Edge Runtime
const isEdgeRuntime = typeof process === 'undefined' ||
  typeof process.cwd !== 'function' ||
  (typeof globalThis !== 'undefined' && 'EdgeRuntime' in globalThis);

class UnifiedLogger {
  private category: LogCategory;

  constructor(category: LogCategory) {
    this.category = category;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[LOG_CONFIG.minLevel];
  }

  private formatMessage(level: LogLevel, message: string, metadata?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const metaStr = metadata ? ` | ${JSON.stringify(metadata)}` : '';
    return `${timestamp} [${level.toUpperCase()}] [${this.category.toUpperCase()}] - ${message}${metaStr}`;
  }

  private async logToConsole(level: LogLevel, message: string, metadata?: Record<string, any>) {
    if (!LOG_CONFIG.enableConsole) return;

    const formattedMessage = this.formatMessage(level, message, metadata);

    switch (level) {
      case 'debug':
      case 'info':
        console.log(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
      case 'critical':
        console.error(formattedMessage);
        break;
    }
  }

  private async logToFile(level: LogLevel, message: string, metadata?: Record<string, any>) {
    if (!LOG_CONFIG.enableFile || isEdgeRuntime) {
      if (isEdgeRuntime) {
        console.warn('[LOGGER] File logging disabled in Edge Runtime');
      }
      return;
    }

    try {
      const fs = await import('fs');
      const path = await import('path');

      const LOGS_DIR = path.join(process.cwd(), 'logs');

      // Ensure logs directory exists
      if (!fs.existsSync(LOGS_DIR)) {
        fs.mkdirSync(LOGS_DIR, { recursive: true });
        console.log(`[LOGGER] Created logs directory: ${LOGS_DIR}`);
      }

      const logFileName = `${this.category}-${new Date().toISOString().split('T')[0]}.log`;
      const logFilePath = path.join(LOGS_DIR, logFileName);
      const formattedMessage = this.formatMessage(level, message, metadata) + '\n';

      // Check file size and rotate if necessary
      if (fs.existsSync(logFilePath)) {
        const stats = fs.statSync(logFilePath);
        if (stats.size > LOG_CONFIG.maxFileSize) {
          const rotatedPath = `${logFilePath}.${Date.now()}`;
          fs.renameSync(logFilePath, rotatedPath);
          console.log(`[LOGGER] Rotated log file: ${logFilePath} -> ${rotatedPath}`);
        }
      }

      fs.appendFileSync(logFilePath, formattedMessage);

      // Debug logging for first write to confirm it's working
      if (process.env.NODE_ENV === 'development' && level === 'info') {
        console.log(`[LOGGER] Successfully wrote to: ${logFilePath}`);
      }
    } catch (error) {
      console.error(`[LOGGER] Failed to write to log file: ${error}`);
      console.error(`[LOGGER] Current working directory: ${process.cwd()}`);
      console.error(`[LOGGER] Edge runtime check: ${isEdgeRuntime}`);
    }
  }

  private async logToDatabase(level: LogLevel, message: string, metadata?: Record<string, any>, context?: { userId?: string; ipAddress?: string; userAgent?: string }) {
    if (!LOG_CONFIG.enableDatabase || isEdgeRuntime) return;

    try {
      // Only import database logger when needed
      const { logActivity } = await import('./activity-logger');

      await logActivity({
        user: context?.userId || 'system',
        action: `${this.category.toUpperCase()}_${level.toUpperCase()}`,
        eventType: this.category === 'security' ? 'security' : 'system',
        severity: level === 'critical' ? 'critical' : level === 'error' ? 'error' : level === 'warn' ? 'warning' : 'info',
        details: message,
        metadata: metadata,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      });
    } catch (error) {
      console.error(`Failed to log to database: ${error}`);
    }
  }

  async log(level: LogLevel, message: string, metadata?: Record<string, any>, context?: { userId?: string; ipAddress?: string; userAgent?: string }) {
    if (!this.shouldLog(level)) return;

    // Log to all enabled outputs
    await Promise.all([
      this.logToConsole(level, message, metadata),
      this.logToFile(level, message, metadata),
      this.logToDatabase(level, message, metadata, context),
    ]);
  }

  debug(message: string, metadata?: Record<string, any>, context?: { userId?: string; ipAddress?: string; userAgent?: string }) {
    return this.log('debug', message, metadata, context);
  }

  info(message: string, metadata?: Record<string, any>, context?: { userId?: string; ipAddress?: string; userAgent?: string }) {
    return this.log('info', message, metadata, context);
  }

  warn(message: string, metadata?: Record<string, any>, context?: { userId?: string; ipAddress?: string; userAgent?: string }) {
    return this.log('warn', message, metadata, context);
  }

  error(message: string, metadata?: Record<string, any>, context?: { userId?: string; ipAddress?: string; userAgent?: string }) {
    return this.log('error', message, metadata, context);
  }

  critical(message: string, metadata?: Record<string, any>, context?: { userId?: string; ipAddress?: string; userAgent?: string }) {
    return this.log('critical', message, metadata, context);
  }
}

// Export category-specific loggers
export const sapLogger = new UnifiedLogger('sap');
export const authLogger = new UnifiedLogger('auth');
export const apiLogger = new UnifiedLogger('api');
export const systemLogger = new UnifiedLogger('system');
export const securityLogger = new UnifiedLogger('security');
export const databaseLogger = new UnifiedLogger('database');

// Export the logger class for custom categories
export { UnifiedLogger };
export type { LogLevel, LogCategory, LogEntry };
