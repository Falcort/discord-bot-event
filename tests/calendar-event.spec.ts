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
    let eventID;

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

    it('listAllEvents() : Should return no event', async () => {
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
        eventID = message.match(/[a-z0-9]{24}/);
        expect(message).contain(parseLangMessage(lang.eventCreationSuccess, {eventID, userID: '1'}));
        return eventID;
    });

    it('validateAndCreateOperation(): Should return error date', async () => {
        const message = await CalendarEvent.validateAndCreatOperation('01/01/1901',
            '21:00',
            'The War',
            'Go to war',
            '1',
            '1',
            partialLog);
        expect(message).contain(lang.eventCannotTakePlaceInPast);
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

    it('addParticipant(): Should be ok', async () => {
        const event = await CalendarEvent.validateAndCreatOperation('22/03/2031',
            '21:00',
            'The league of explorers',
            'Explore the galaxy',
            '1',
            '1',
            partialLog);
        eventID = event.match(/[a-z0-9]{24}/);
        const message = await CalendarEvent.addParticipant(eventID, '2', partialLog);
        expect(event).equals(parseLangMessage(lang.eventCreationSuccess, {eventID, userID: '1'}));
        expect(message).contain(parseLangMessage(lang.eventRegisterSuccess, {
            userID: 2,
            eventName: 'The league of explorers',
            date: '3/22/2031, 9:00 PM'
        }));
    });

    it('removeParticipant(): Should remove participant ok', async () => {
        const event = await CalendarEvent.validateAndCreatOperation('22/03/2031',
            '21:00',
            'The league of explorers',
            'Explore the galaxy',
            '1',
            '1',
            partialLog);
        eventID = event.match(/[a-z0-9]{24}/);
        const participant = await CalendarEvent.addParticipant(eventID, '2', partialLog);
        const message = await CalendarEvent.removeParticipant('2', eventID, partialLog);
        expect(event).contain(parseLangMessage(lang.eventCreationSuccess, {eventID, userID: '1'}));
        expect(participant).contain(parseLangMessage(lang.eventRegisterSuccess, {
            userID: 2,
            eventName: 'The league of explorers',
            date: '3/22/2031, 9:00 PM'
        }));
        expect(message).contain(parseLangMessage(lang.eventUnRegister, {
            userID: 2,
            eventName: 'The league of explorers',
            date: '3/22/2031, 9:00 PM'
        }));
    });

    it('deleteOperation(): Should be ok', async () => {
        const event = await CalendarEvent.validateAndCreatOperation('22/03/2031',
            '21:00',
            'The league of explorers',
            'Explore the galaxy',
            '1',
            '1',
            partialLog);
        eventID = event.match(/[a-z0-9]{24}/);
        const message = await CalendarEvent.deleteOperation(eventID, '1', partialLog);
        expect(event).contain(parseLangMessage(lang.eventCreationSuccess, {eventID, userID: '1'}));
        expect(message).contain(parseLangMessage(lang.eventDeleteSuccess, {eventID}));
    });

    it('deleteOperation(): Should return no event id', async () => {
        const message = await CalendarEvent.deleteOperation(eventID, '1', partialLog);
        expect(message).contain(parseLangMessage(lang.noEventWithID, {eventID}));
    });

    it('listAllEvents(): Should return a list of events', async () => {
        await CalendarEvent.validateAndCreatOperation('22/03/2031',
            '21:00',
            'The league of explorers',
            'Explore the galaxy',
            '1',
            '1',
            partialLog);
        const listAllEvents = await CalendarEvent.listAllEvents('command', partialLog);
        expect(listAllEvents).contain(lang.listEvent.listEvent);
    });

});
