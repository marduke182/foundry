import { moduleName } from './consts';

type LogLevel = 'info' | 'warn' | 'err' | 'debug' | 'off';

const showMessage = (logLevel: string) => {
  const setting = game.settings.get(moduleName, 'log-level');
  const logLevels = ['debug', 'info', 'warn', 'err', 'off'];

  const logLevelIndex = logLevels.indexOf(logLevel.toUpperCase());
  if (setting == 'OFF' || logLevelIndex === -1 || logLevelIndex < logLevels.indexOf(setting)) {
    return false;
  }
  return true;
};

const consoleBinded: Record<LogLevel, (msg: string, ...payload: any[]) => void> = {
  info: console.info.bind(console),
  debug: console.info.bind(console),
  warn: console.info.bind(console),
  err: console.info.bind(console),
  off() {},
};

function log(logLevel: LogLevel, msg: string, ...payload: any[]): void {
  if (!showMessage(logLevel)) {
    return;
  }

  if (payload) {
    consoleBinded[logLevel](msg, ...payload);
  } else {
    consoleBinded[logLevel](msg);
  }
}

export const info = log.bind(log, 'info');
export const debug = log.bind(log, 'debug');
export const warn = log.bind(log, 'warn');
export const err = log.bind(log, 'err');
