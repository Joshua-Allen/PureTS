// ============================================================
// utils/Logger.ts  —  Structured logger with severity levels.
//                     Silenced automatically when debug is off.
//                     Import and call directly — no EventBus needed.
//
// Usage:
//   Logger.info('PhysicsSystem', 'step called', { dt });
//   Logger.warn('Player', 'health below zero');
//   Logger.error('ApiClient', 'fetch failed', error);
// ============================================================

import { Config } from '../Config';

export type LogLevel = 'info' | 'warn' | 'error';

export class Logger {
  private static fmt(level: LogLevel, source: string, message: string): string {
    return `[${level.toUpperCase()}] [${source}] ${message}`;
  }

  static info(source: string, message: string, data?: unknown): void {
    if (!Config.debug) return;
    console.log(this.fmt('info', source, message), ...(data !== undefined ? [data] : []));
  }

  static warn(source: string, message: string, data?: unknown): void {
    if (!Config.debug) return;
    console.warn(this.fmt('warn', source, message), ...(data !== undefined ? [data] : []));
  }

  // Errors always log regardless of debug mode.
  static error(source: string, message: string, data?: unknown): void {
    console.error(this.fmt('error', source, message), ...(data !== undefined ? [data] : []));
  }
}
