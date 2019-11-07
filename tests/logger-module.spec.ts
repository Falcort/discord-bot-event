import { expect } from 'chai';
import 'mocha';
import * as mongoose from 'mongoose';
import { Logger } from '../lib/class/logger';
import { IConfig } from '../lib/interfaces/config';
import Log from '../lib/models/log';
import { getMongoDbConnectionString } from '../lib/utils/functions';
const config: IConfig = require('../config.json');


class LoggerForTest extends Logger {
    constructor() {
        super();
    }
}

/**
 * Test of public methods of the Log module
 */
describe('Logger Module', () => {

    // Connect to the database before each test
    before((done) => {
        const uri = getMongoDbConnectionString();
        mongoose.connect(uri, {
            useNewUrlParser: true,
            useCreateIndex: true
        }).finally();
        mongoose.connection.once('open', () => {
            done();
        });
    });

    // After all test it close the DB
    after((done) => {
        mongoose.connection.close().finally(done);
    });

    // Test the function that set the log in database and display it in the console
    it('logAndDB() : No args - Should be OK', async () => {
        const LoggerObject = new LoggerForTest();
        await LoggerObject.logAndDB('command', 'userID', 'info', '684768897987').then();

        // Try to find a log with the unique message
        await Log.findOne({message: '684768897987'}).then(
            result => {
                return expect(result).exist;
            }
        );
    });

    it('Logger Level : Github actions - Should return off', () => {
        process.env.GH_ACTIONS = 'true';
        const LoggerObject = new LoggerForTest();
        const level = LoggerObject.logger.level.toString().toLocaleLowerCase();
        process.env.GH_ACTIONS = 'false';
        expect(level).to.equal('off');
    });

    it('Logger Level : Normal environement - Should return config level', () => {
        const LoggerObject = new LoggerForTest();
        const level = LoggerObject.logger.level.toString().toLowerCase();
        expect(level).to.equal(config.log);
    });
});

