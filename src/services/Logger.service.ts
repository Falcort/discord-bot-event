import { configure, getLogger, Logger as LoggerObject } from 'log4js';

/**
 * Class of the logger
 */
class Logger {
  /**
   * The logger itself
   */
  public logger: LoggerObject;

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
    const logLevel = process.env.LOG_LEVEL || 'ALL';
    configure({
      appenders: {
        console: {
          type: 'console',
          layout: {
            type: 'pattern',
            pattern: '%[[%d{dd/MM/yyyy - hh:mm:ss}] - %p%] : %m',
          },
        },
      },
      categories: {
        default: {
          appenders: ['console'],
          level: logLevel, // which logs are displayed
        },
      },
    });
  }
}
export default new Logger().logger;
