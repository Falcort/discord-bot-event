import { expect } from 'chai';
import 'mocha';
import * as mongoose from 'mongoose';
import CalendarEvent from '../lib/class/calendar-event';
import { IConfig } from '../lib/interfaces/config';
import { II18n } from '../lib/interfaces/i18n';
import { ILog } from '../lib/interfaces/log';
import { getMongoDbConnectionString, parseLangMessage } from '../lib/utils/functions';

const config: IConfig = require('../config.json');
const lang: II18n = require(`../lib//i18n/${config.config.lang}.json`);


describe('Calendar event', () => {

    const partialLog = {} as ILog;

    // Before all test open a DB connection
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

    it('listAllEvents() : Should be ok', async () => {
        const command = `${config.config.prefix}listOpé`;
        const message = await CalendarEvent.listAllEvents(command, partialLog);
        expect(message).contain(lang.noEvents);
    });

    it('validateAndCreateOperation(): Should return succes', async () => {
        const message = await CalendarEvent.validateAndCreatOperation('22/03/2031',
            '21:00',
            'The league of explorers',
            'Explore the galaxy',
            '1',
            '1',
            partialLog);
        const operationID = message.match(/[a-z0-9]{24}/);
        expect(message).equal(parseLangMessage(lang.eventCreationSuccess, {eventID: operationID, userID: '1'}));
    });

    it('validateAndCreateOperation(): Should return error date', async () => {
        const message = await CalendarEvent.validateAndCreatOperation('01/01/1901',
            '21:00',
            'The War',
            'Go to war',
            '1',
            '1',
            partialLog);
        expect(message).equal(lang.eventCannotTakePlaceInPast);
    });

    it('validateAndCreateOperation(): Should return unknow error', async () => {
        const message = await CalendarEvent.validateAndCreatOperation('1901/02/03',
            '21:00',
            'The War',
            'Go to war',
            '1',
            '1',
            partialLog);
        expect(message).contain(lang.unknownError);
    });

});
