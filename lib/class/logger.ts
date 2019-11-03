import { configure, getLogger, Logger as LoggerObject } from 'log4js';
import { IConfig } from '../interfaces/config';
import { ILog } from '../interfaces/log';
import Logs from '../models/log';
const config: IConfig = require('../../config.json');

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
                logger: {
                    type: 'console', // where logs are displayed
                    filename: 'app.log'
                }
            },
            categories: {
                default: {
                    appenders: ['logger'],
                    level: logLevel // which logs are displayed
                }
            }
        });
    }

    /**
     * This function send the log to DB
     * and display the log in the logger
     *
     * @param command -- The commadn to log
     * @param userID -- The ID of the user
     * @param level -- the level of the log
     * @param message -- The error;
     */
    public logAndDB(command: string, userID: string, level: string, message: string): void {
        const log = {
            command,
            userID,
            message,
            level
        } as ILog;

        const logMessage = `User : ${userID} used command : ${command} and have the message : ${message}`;

        // Remove of this line for hotfix-2.0.1
        // new Logs(log).save().finally();
        new Logs(log).save();
        this.logFromLevel(level, logMessage);
    }

    /**
     * Function that get the good log level in function of the HTTP Code
     *
     * @param level -- The level of the code
     * @param message -- the message to log
     */
    public logFromLevel(level: string, message: string): string {

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
