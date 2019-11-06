import { expect } from 'chai';
import 'mocha';
import * as mongoose from 'mongoose';
import { Logger } from '../../lib/class/logger';
import Log from '../../lib/models/log';
import { getMongoDbConnectionString } from '../../lib/utils/functions';


class LoggerForTest extends Logger {
    constructor() {
        super();
    }
}

const LoggerObject = new LoggerForTest();

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

        await LoggerObject.logAndDB('command', 'userID', 'info', '684768897987').then();

        // Try to find a log with the unique message
        await Log.findOne({message: '684768897987'}).then(
            result => {
                return expect(result).exist;
            }
        );
    });
});

