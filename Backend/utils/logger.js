/**
 * Logging Utility
 * Centralized logging for the application
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const logger = {
  info: (message, data = {}) => {
    const log = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      data,
    };
    console.log(`[${log.timestamp}] INFO: ${message}`, data);
    appendToLog('app.log', log);
  },

  error: (message, data = {}) => {
    const log = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      data,
    };
    console.error(`[${log.timestamp}] ERROR: ${message}`, data);
    appendToLog('error.log', log);
  },

  warn: (message, data = {}) => {
    const log = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      data,
    };
    console.warn(`[${log.timestamp}] WARN: ${message}`, data);
    appendToLog('app.log', log);
  },

  debug: (message, data = {}) => {
    if (process.env.DEBUG === 'true') {
      const log = {
        timestamp: new Date().toISOString(),
        level: 'DEBUG',
        message,
        data,
      };
      console.log(`[${log.timestamp}] DEBUG: ${message}`, data);
      appendToLog('debug.log', log);
    }
  },
};

const appendToLog = (filename, log) => {
  try {
    const logFile = path.join(LOG_DIR, filename);
    fs.appendFileSync(logFile, JSON.stringify(log) + '\n');
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
};

module.exports = logger;
