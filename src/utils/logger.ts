/**
 * Logger utility for CLI output
 */

type ChalkInstance = typeof import('chalk').default;

let chalk: ChalkInstance | null = null;

async function getChalk(): Promise<ChalkInstance> {
  if (!chalk) {
    const module = await import('chalk');
    chalk = module.default;
  }
  return chalk;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

let currentLevel: LogLevel = 'info';
let isQuiet = false;

const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  success: 1,
};

function shouldLog(level: LogLevel): boolean {
  if (isQuiet && level !== 'error') {
    return false;
  }
  return levelPriority[level] >= levelPriority[currentLevel];
}

export const logger = {
  setLevel(level: LogLevel): void {
    currentLevel = level;
  },

  setQuiet(quiet: boolean): void {
    isQuiet = quiet;
  },

  async debug(message: string): Promise<void> {
    if (!shouldLog('debug')) return;
    const c = await getChalk();
    console.log(c.gray(`[debug] ${message}`));
  },

  async info(message: string): Promise<void> {
    if (!shouldLog('info')) return;
    const c = await getChalk();
    console.log(c.blue('ℹ'), message);
  },

  async warn(message: string): Promise<void> {
    if (!shouldLog('warn')) return;
    const c = await getChalk();
    console.log(c.yellow('⚠'), c.yellow(message));
  },

  async error(message: string): Promise<void> {
    if (!shouldLog('error')) return;
    const c = await getChalk();
    console.error(c.red('✖'), c.red(message));
  },

  async success(message: string): Promise<void> {
    if (!shouldLog('success')) return;
    const c = await getChalk();
    console.log(c.green('✔'), message);
  },

  // Sync versions for convenience (using console colors)
  debugSync(message: string): void {
    if (!shouldLog('debug')) return;
    console.log(`\x1b[90m[debug] ${message}\x1b[0m`);
  },

  infoSync(message: string): void {
    if (!shouldLog('info')) return;
    console.log(`\x1b[34mℹ\x1b[0m ${message}`);
  },

  warnSync(message: string): void {
    if (!shouldLog('warn')) return;
    console.log(`\x1b[33m⚠ ${message}\x1b[0m`);
  },

  errorSync(message: string): void {
    if (!shouldLog('error')) return;
    console.error(`\x1b[31m✖ ${message}\x1b[0m`);
  },

  successSync(message: string): void {
    if (!shouldLog('success')) return;
    console.log(`\x1b[32m✔\x1b[0m ${message}`);
  },
};

// Make async methods work synchronously for simpler usage
// This is a workaround since the original code uses sync logging
const originalDebug = logger.debug;
const originalInfo = logger.info;
const originalWarn = logger.warn;
const originalError = logger.error;
const originalSuccess = logger.success;

logger.debug = function(message: string): Promise<void> {
  logger.debugSync(message);
  return Promise.resolve();
};

logger.info = function(message: string): Promise<void> {
  logger.infoSync(message);
  return Promise.resolve();
};

logger.warn = function(message: string): Promise<void> {
  logger.warnSync(message);
  return Promise.resolve();
};

logger.error = function(message: string): Promise<void> {
  logger.errorSync(message);
  return Promise.resolve();
};

logger.success = function(message: string): Promise<void> {
  logger.successSync(message);
  return Promise.resolve();
};

// Keep async versions available
logger.debug = Object.assign(logger.debug, { async: originalDebug });
logger.info = Object.assign(logger.info, { async: originalInfo });
logger.warn = Object.assign(logger.warn, { async: originalWarn });
logger.error = Object.assign(logger.error, { async: originalError });
logger.success = Object.assign(logger.success, { async: originalSuccess });
