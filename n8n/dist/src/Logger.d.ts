import { ILogger, LogTypes } from 'n8n-workflow';
declare class Logger implements ILogger {
    private logger;
    constructor();
    log(type: LogTypes, message: string, meta?: object): void;
    debug(message: string, meta?: object): void;
    info(message: string, meta?: object): void;
    error(message: string, meta?: object): void;
    verbose(message: string, meta?: object): void;
    warn(message: string, meta?: object): void;
}
export declare function getLogger(): Logger;
export {};
