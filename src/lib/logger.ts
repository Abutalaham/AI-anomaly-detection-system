type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message), context ?? '');
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message), context ?? '');
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message), context ?? '');
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    console.error(this.formatMessage('error', message), {
      error,
      context,
    });
  }
}

export const logger = new Logger();
