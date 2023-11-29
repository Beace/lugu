import { Logger } from '@artus/core';
import * as log4js from 'log4js';
import { NPMBookLoggerType } from './types';

export class NPMBookLogger extends Logger {
  private log4js: log4js.Logger;

  constructor(options: NPMBookLoggerType) {
    super();
    this.log4js = log4js.getLogger();
    this.log4js.level = options?.level || 'info';
  }

  trace(message: string, ...args: any[]) {
    this.log4js.trace(message, ...args);
  };

  debug(message: string, ...args: any[]) {
    this.log4js.debug(message, ...args);
  };

  info(message: string, ...args: any[]) {
    this.log4js.info(message, ...args);
  };

  warn(message: string, ...args: any[]) {
    this.log4js.warn(message, ...args);
  };

  error(message: string | Error, ...args: any[]) {
    this.log4js.error(message, ...args);
  };

  fatal(message: string | Error, ...args: any[]){
    this.log4js.fatal(message, ...args);
  };
}