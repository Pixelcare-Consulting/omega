
// Edge Runtime compatible logger
// This logger works in both Edge Runtime and Node.js environments

// Check if we're in Edge Runtime
const isEdgeRuntime = typeof process === 'undefined' ||
  typeof process.cwd !== 'function' ||
  (typeof globalThis !== 'undefined' && 'EdgeRuntime' in globalThis);

// Console-only logger for Edge Runtime
const createConsoleLogger = (prefix: string) => ({
  info: (message: string) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} [${prefix.toUpperCase()}] [INFO] - ${message}`);
  },
  error: (message: string) => {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} [${prefix.toUpperCase()}] [ERROR] - ${message}`);
  },
});

// File logger for Node.js environment
const createFileLogger = (fileName: string) => {
  return {
    info: async (message: string) => {
      try {
        // Only import and use Node.js APIs when actually logging
        const fs = await import('fs');
        const path = await import('path');
        const LOGS_DIR = path.join(process.cwd(), 'logs');

        // Ensure the logs directory exists
        if (!fs.existsSync(LOGS_DIR)) {
          fs.mkdirSync(LOGS_DIR, { recursive: true });
        }

        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} [INFO] - ${message}\n`;
        const logFilePath = path.join(LOGS_DIR, fileName);

        fs.appendFile(logFilePath, logMessage, (err: any) => {
          if (err) {
            console.error(`Failed to write to log file ${fileName}:`, err);
          }
        });
      } catch (error) {
        // Fallback to console if file logging fails
        const timestamp = new Date().toISOString();
        console.log(`${timestamp} [${fileName.toUpperCase()}] [INFO] - ${message}`);
      }
    },
    error: async (message: string) => {
      try {
        // Only import and use Node.js APIs when actually logging
        const fs = await import('fs');
        const path = await import('path');
        const LOGS_DIR = path.join(process.cwd(), 'logs');

        // Ensure the logs directory exists
        if (!fs.existsSync(LOGS_DIR)) {
          fs.mkdirSync(LOGS_DIR, { recursive: true });
        }

        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} [ERROR] - ${message}\n`;
        const logFilePath = path.join(LOGS_DIR, fileName);

        fs.appendFile(logFilePath, logMessage, (err: any) => {
          if (err) {
            console.error(`Failed to write to log file ${fileName}:`, err);
          }
        });
      } catch (error) {
        // Fallback to console if file logging fails
        const timestamp = new Date().toISOString();
        console.error(`${timestamp} [${fileName.toUpperCase()}] [ERROR] - ${message}`);
      }
    },
  };
};

// Export loggers that work in both environments
export const sapLogger = isEdgeRuntime
  ? createConsoleLogger('sap')
  : createFileLogger('sap.log');

export const authLogger = isEdgeRuntime
  ? createConsoleLogger('auth')
  : createFileLogger('auth.log');

// Add other loggers as needed for different parts of the application
