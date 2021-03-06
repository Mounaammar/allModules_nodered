/// <reference types="node" />
import { CreateTaggedFormatterOptions, Logger as BaseLogger, LoggerFormatter, LoggerLevelWeight } from '@ionic/cli-framework-output';
import { ILogger } from '../../definitions';
export declare class Logger extends BaseLogger implements ILogger {
    ok(msg: string): void;
    rawmsg(msg: string): void;
}
export declare function createFormatter(options?: CreateTaggedFormatterOptions): LoggerFormatter;
export declare function createDefaultLoggerHandlers(formatter?: LoggerFormatter): Set<import("@ionic/cli-framework-output").StreamHandler>;
export declare function createPrefixedWriteStream(log: ILogger, prefix: string, level?: LoggerLevelWeight): NodeJS.WritableStream;
