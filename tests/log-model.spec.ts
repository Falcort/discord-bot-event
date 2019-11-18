import { expect } from 'chai';
import 'mocha';
import * as mongoose from 'mongoose';
import { ILog } from '../lib/interfaces/log';
import Log from '../lib/models/log';
import { getMongoDbConnectionString } from '../lib/utils/functions';

/**
 * Test file for Mongoose model of Logs
 */
describe('Log models', () => {

    // Connect to the database before each test
    before((done) => {
        const uri = getMongoDbConnectionString();
        mongoose.connect(uri, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        }).finally();
        mongoose.connection.once('open', () => {
            done();
        });
    });

    // After all test it close the DB
    after((done) => {
        mongoose.connection.close().finally(done);
    });

    // Test of model, this model cannot be created empty i should throw an error
    it('Should throw an error at empty creation', () => {
        const log = new Log();
        expect(log.validate).throw();
    });

    // This should creat a log in the database, waiting to get the ID to confirm
    it('Should creat a log in the database', async () => {
        const log = {
            command: 'TEST',
            userID: 'TEST',
            channelID: '1',
            serverID: '1',
            result: 'TEST',
            level: 'info'
        } as ILog;
        let assert = null;
        await new Log(log).save().then(result => {
            assert = result;
        });

        // tslint:disable:no-unused-expression
        expect(assert._id).exist;
    });

});
