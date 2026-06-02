/**
 * Structured logging utility
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logLevel = this.parseLogLevel(process.env.LOG_LEVEL || 'INFO');

  /**
   * Parse log level string
   */
  private parseLogLevel(level: string): LogLevel {
    const levels = {
      DEBUG: LogLevel.DEBUG,
      INFO: LogLevel.INFO,
      WARN: LogLevel.WARN,
      ERROR: LogLevel.ERROR,
    };
    return levels[level as keyof typeof levels] || LogLevel.INFO;
  }

  /**
   * Check if log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  /**
   * Format log entry
   */
  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp;
    const level = entry.level.padEnd(5);
    let message = `[${timestamp}] [${level}] ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      message += ` ${JSON.stringify(entry.context)}`;
    }

    if (entry.error) {
      message += `\nError: ${entry.error.name}: ${entry.error.message}`;
      if (this.isDevelopment && entry.error.stack) {
        message += `\n${entry.error.stack}`;
      }
    }

    return message;
  }

  /**
   * Output log entry
   */
  private output(level: LogLevel, message: string) {
    const consoleMethod = {
      [LogLevel.DEBUG]: console.debug,
      [LogLevel.INFO]: console.log,
      [LogLevel.WARN]: console.warn,
      [LogLevel.ERROR]: console.error,
    }[level];

    consoleMethod(message);
  }

  /**
   * Log message with context
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context && Object.keys(context).length > 0 ? context : undefined,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    const formatted = this.formatLogEntry(entry);
    this.output(level, formatted);
  }

  /**
   * Debug level log
   */
  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Info level log
   */
  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Warning level log
   */
  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Error level log
   */
  error(message: string, error?: Error, context?: LogContext) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log HTTP request
   */
  logRequest(method: string, path: string, context?: LogContext) {
    this.info(`[HTTP] ${method} ${path}`, context);
  }

  /**
   * Log HTTP response
   */
  logResponse(method: string, path: string, statusCode: number, duration: number, context?: LogContext) {
    this.info(`[HTTP] ${method} ${path} - ${statusCode} (${duration}ms)`, context);
  }

  /**
   * Log database operation
   */
  logDatabase(operation: string, collection: string, duration: number, context?: LogContext) {
    this.debug(`[DB] ${operation} on ${collection} (${duration}ms)`, context);
  }
}

// Export singleton instance
export const logger = new Logger();

export default logger;
