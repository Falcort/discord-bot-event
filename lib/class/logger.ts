import { configure, getLogger, Logger as LoggerObject } from 'log4js';
import { IConfig } from '../interfaces/config';
import { ILog } from '../interfaces/log';
import Logs from '../models/log';

const config: IConfig = require('../../config.json');

/**
 * Class of the logger
 */
export class Logger {

    public logger: LoggerObject; // The logger

    /**
     * Constructor that get the config and start the logger
     */
    constructor() {
        Logger.configureLogger();
        this.logger = getLogger();
    }

    /**
     * Function that configure the logger
     * it define that where should the log go in function of the conf file
     * and which logs to display
     */
    private static configureLogger(): void {
        let logLevel: string;
        if (process.env.GH_ACTIONS === 'true') {
            logLevel = 'off';
        } else {
            logLevel = config.log;
        }
        configure({
            appenders: {
                console: {
                    type: 'console',
                    layout: {
                        type: 'pattern',
                        pattern: '%[[%d{dd/MM/yyyy - hh:mm:ss}] - %p%] : %m',
                    }
                }
            },
            categories: {
                default: {
                    appenders: ['console'],
                    level: logLevel // which logs are displayed
                }
            }
        });
    }

    /**
     * This function send the log to DB
     * and display the log in the logger
     *
     * @param log -- ILog -- The actual log to log
     */
    public logAndDB(log: ILog): string {
        new Logs(log).save().catch();
        return this.logFromLevel(log.level, log);
    }

    /**
     * This function log and DB a ILog a level and a result
     * @param log -- The log to complete
     * @param level -- The level of the log
     * @param result -- The result of the log
     * @return any -- The log result
     */
    public logAndDBWithLevelAndResult(log: ILog, level: 'trace' | 'info' | 'success' | 'warn' | 'error' | 'fatal', result: any): any {
        log.level = level;
        log.result = result;

        this.logAndDB(log);
        return log.result;
    }

    /**
     * Function that get the good log level in function of the HTTP Code
     *
     * @param level -- The level of the code
     * @param message -- the message to log
     * TODO: Is this useful ?
     */
    public logFromLevel(level: string, message: string | object): string {

        switch (level) {
            case 'trace':
                this.logger.trace(message);
                return 'trace';
            case 'info':
                this.logger.info(message);
                return 'info';
            case 'warn':
                this.logger.warn(message);
                return 'warn';
            case 'error':
                this.logger.error(message);
                return 'error';
            case 'fatal':
                this.logger.fatal(message);
                return 'fatal';
            default:
                this.logger.info(message);
                return 'default';
        }

    }
}

export default new Logger();
