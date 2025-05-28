'use server'

import fs from 'fs';
import path from 'path';

// This file is intended to run only on the server (Node.js environment).
// Ensure that any components or API routes importing this file are also marked as server-only
// or are configured to run in a Node.js environment to avoid issues with the edge runtime.

const LOGS_DIR = path.join(process.cwd(), 'logs');

// Ensure the logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const logToFile = (fileName: string, level: string, message: string) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} [${level.toUpperCase()}] - ${message}\n`;
  const logFilePath = path.join(LOGS_DIR, fileName);

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error(`Failed to write to log file ${fileName}:`, err);
    }
  });
};

export const sapLogger = {
  info: (message: string) => logToFile('sap.log', 'info', message),
  error: (message: string) => logToFile('sap.log', 'error', message),
};

export const authLogger = {
  info: (message: string) => logToFile('auth.log', 'info', message),
  error: (message: string) => logToFile('auth.log', 'error', message),
};

// Add other loggers as needed for different parts of the application
