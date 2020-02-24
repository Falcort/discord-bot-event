import { expect } from 'chai';
import { Client, Message, User } from 'discord.js';
import { DateTime } from 'luxon';
import 'mocha';
import * as mongoose from 'mongoose';
import CalendarEvent from '../lib/class/calendar-event';
import { IConfig } from '../lib/interfaces/config';
import { IEvent } from '../lib/interfaces/event';
import { II18n } from '../lib/interfaces/i18n';
import { ILog } from '../lib/interfaces/log';
import { getMongoDbConnectionString, parseLangMessage } from '../lib/utils/functions';

const config: IConfig = require('../config.json');
const lang: II18n = require(`../lib//i18n/${config.config.lang}.json`);


describe('Calendar event', () => {

    const Event = new CalendarEvent({
        user: {
            username: 'bot',
            authorAvatarURL: 'url'
        } as unknown as Partial<User>,
        fetchUser: async (id: string, cache?: boolean): Promise<User> => {
            return await {} as User;
        }
    } as Client, 'fr-FR');

    const partialLog = {} as ILog;
    let eventID;

    // Before all test open a DB connection
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

    it('listAllEvents() : Should return no event', async () => {
        const command = config.commands.listAllEvents;
        const message = await Event.listAllEvents('1', command, partialLog);
        expect(message).contain(lang.noEvents);
    });

    it('validateAndCreateOperation(): Should return succes', async () => {
        const message = await Event.validateAndCreatEvent('22/03/2031',
            '21:00',
            'The league of explorers',
            'Explore the galaxy',
            '1',
            '1',
            partialLog);
        eventID = message.description.match(/[a-z0-9]{24}/);
        expect(message.description).contain(parseLangMessage(lang.eventCreationSuccess.description, {eventID, userID: '1'}));
        return eventID;
    });

    it('validateAndCreateOperation(): Should return error date', async () => {
        const message = await Event.validateAndCreatEvent('01/01/1901',
            '21:00',
            'The War',
            'Go to war',
            '1',
            '1',
            partialLog);
        expect(message.description).contain(lang.eventCannotTakePlaceInPast.description);
    });

    it('validateAndCreateOperation(): Should return unknow error', async () => {
        const message = await Event.validateAndCreatEvent('1901/02/03',
            '21:00',
            'The War',
            'Go to war',
            '1',
            '1',
            partialLog);
        expect(message.title).contain(lang.unknownError.title);
    });

    it('validateAndCreateOperation(): Should return error command', async () => {
        const message = await Event.validateAndCreatEvent(undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            partialLog);
        expect(message.description).equal(lang.errorInCommand.description);
    });

    it('addParticipant(): Should be ok', async () => {
        const event = await Event.validateAndCreatEvent('22/03/2031',
            '21:00',
            'The league of explorers',
            'Explore the galaxy',
            '1',
            '1',
            partialLog);
        eventID = event.description.match(/[a-z0-9]{24}/);
        const message = await Event.addParticipant(eventID, '2', partialLog);
        expect(event.description).equals(parseLangMessage(lang.eventCreationSuccess.description, {eventID, userID: '1'}));
        expect(message.description).contain(parseLangMessage(lang.eventRegisterSuccess.description, {
            userID: 2,
            eventName: 'The league of explorers',
            date: '3/22/2031, 9:00 PM'
        }));
    });

    it('addParticipant(): Should return unknown error', async () => {
        const message = await Event.addParticipant('123456789e123456789g123', '2', partialLog);
        expect(message.title).equals(lang.unknownError.title);
    });

    it('addParticipant(): Should return error already register', async () => {
        const event = await Event.validateAndCreatEvent('22/03/2031',
            '21:00',
            'The league of explorers',
            'Explore the galaxy',
            '1',
            '1',
            partialLog);
        eventID = event.description.match(/[a-z0-9]{24}/);
        const addParticipant = await Event.addParticipant(eventID, '2', partialLog);
        const message = await Event.addParticipant(eventID, '2', partialLog);
        expect(event.description).equals(parseLangMessage(lang.eventCreationSuccess.description, {eventID, userID: '1'}));
        expect(addParticipant.description).contain(parseLangMessage(lang.eventRegisterSuccess.description, {
            userID: 2,
            eventName: 'The league of explorers',
            date: '3/22/2031, 9:00 PM'
        }));
        expect(message.description).contain(parseLangMessage(lang.alreadyRegistered.description, {userID: '2', eventName: 'The league of explorers'}));
    });

    it('addParticipant(): Should return error no event with id', async () => {
        const message = await Event.addParticipant('507f1f77bcf86cd799439011', '2', partialLog);
        expect(message.description).contain(parseLangMessage(lang.noEventWithID.description, {eventID: '507f1f77bcf86cd799439011'}));
    });

    it('removeParticipant(): Should remove participant ok', async () => {
        const event = await Event.validateAndCreatEvent('22/03/2031',
            '21:00',
            'The league of explorers',
            'Explore the galaxy',
            '1',
            '1',
            partialLog);
        eventID = event.description.match(/[a-z0-9]{24}/);
        const participant = await Event.addParticipant(eventID, '2', partialLog);
        const message = await Event.removeParticipant('2', eventID, partialLog);
        expect(event.description).contain(parseLangMessage(lang.eventCreationSuccess.description, {eventID, userID: '1'}));
        expect(participant.description).contain(parseLangMessage(lang.eventRegisterSuccess.description, {
            userID: 2,
            eventName: 'The league of explorers',
            date: '3/22/2031, 9:00 PM'
        }));
        expect(message.description).contain(parseLangMessage(lang.eventUnRegister.description, {
            userID: 2,
            eventName: 'The league of explorers',
            date: '3/22/2031, 9:00 PM'
        }));
    });

    it('removeParticipant(): Should reuturn unkow error', async () => {
        const message = await Event.removeParticipant('123456789e123456789g123', '2', partialLog);
        expect(message.title).equals(lang.unknownError.title);
    });

    it('removeParticipant(): Should return unregister error', async () => {
        const event = await Event.validateAndCreatEvent('22/03/2031',
            '21:00',
            'The league of explorers',
            'Explore the galaxy',
            '1',
            '1',
            partialLog);
        eventID = event.description.match(/[a-z0-9]{24}/);
        await Event.removeParticipant('2', eventID, partialLog);
        expect(event.description).equal(parseLangMessage(lang.eventCreationSuccess.description, {eventID, userID: '1'}));
    });

    it('removeParticipant(): Should return error no event id', async () => {
        const message = await Event.removeParticipant('1', '507f1f77bcf86cd799439011', partialLog);
        expect(message.description).equal(parseLangMessage(lang.noEventWithID.description, {eventID: '507f1f77bcf86cd799439011'}));
    });


    it('deleteOperation(): Should be ok', async () => {
        const event = await Event.validateAndCreatEvent('22/03/2031',
            '21:00',
            'The league of explorers',
            'Explore the galaxy',
            '1',
            '1',
            partialLog);
        eventID = event.description.match(/[a-z0-9]{24}/);
        const message = await Event.deleteEvent(eventID, {
            author: {id: '1'}, member: {
                hasPermission: () => {
                    return true;
                }
            }
        } as unknown as Message, partialLog);
        expect(event.description).contain(parseLangMessage(lang.eventCreationSuccess.description, {eventID, userID: '1'}));
        expect(message.description).contain(parseLangMessage(lang.eventDeleteSuccess.description, {eventID}));
    });

    it('deleteOperation(): Should return no event id', async () => {
        const message = await Event.deleteEvent(eventID, {
            author: {id: '1'}, member: {
                hasPermission: () => {
                    return false;
                }
            }
        } as unknown as Message, partialLog);
        expect(message.description).contain(parseLangMessage(lang.noEventWithID.description, {eventID}));
    });

    it('deleteOperation(): Should return unknow error', async () => {
        const message = await Event.deleteEvent('123456789e123456789g123', {
            author: {id: '1'}, member: {
                hasPermission: () => {
                    return true;
                }
            }
        } as unknown as Message, partialLog);
        expect(message.title).contain(lang.unknownError.title);
    });

    it('deleteOperation(): Should return error command', async () => {
        const event = await Event.validateAndCreatEvent('22/03/2031',
            '21:00',
            'The league of explorers',
            'Explore the galaxy',
            '1',
            '1',
            partialLog);
        eventID = event.description.match(/[a-z0-9]{24}/);
        const message = await Event.deleteEvent(eventID, {
            author: {id: '3'}, member: {
                hasPermission: () => {
                    return false;
                }
            }
        } as unknown as Message, partialLog);
        expect(event.description).contain(parseLangMessage(lang.eventCreationSuccess.description, {eventID, userID: '1'}));
        expect(message.description).contain(lang.onlyAdminCanDeleteEvent.description);
    });

    it('listAllEvents(): Should return a list of events', async () => {
        await Event.validateAndCreatEvent('22/03/2031',
            '21:00',
            'The league of explorers',
            'Explore the galaxy',
            '1',
            '1',
            partialLog);
        const listAllEvents = await Event.listAllEvents('1','command', partialLog);
        expect(listAllEvents[0]).contain(lang.listEvent);
    });

    it('getAllEventFromDate() Date in the future should return empty', async () => {
        const getAllEventFromDate = await CalendarEvent.getAllEventFromDate(DateTime.local(2050));
        return expect(getAllEventFromDate).empty;
    });

    it('getAllEventFromDate() Date in the past should return something', async () => {
        await Event.validateAndCreatEvent('22/03/2031',
            '21:00',
            'The league of explorers',
            'Explore the galaxy',
            '1',
            '1',
            partialLog);
        const getAllEventFromDate = await CalendarEvent.getAllEventFromDate(DateTime.local(2000));
        return !expect(getAllEventFromDate).not.to.be.empty;
    });

    it('getAllEventFromDate() Should crash', async () => {
        const test = {
            toMillis: () => {
                return {e: 1};
            }
        };
        const getAllEventFromDate = await CalendarEvent.getAllEventFromDate(test as unknown as DateTime);
        expect(getAllEventFromDate).equal(-1);
    });

    it('updateOperationParticipantsPromise() : Should return an error', async () => {
        const operation = {
            id: 1,
            serverID: '1',
            name: '1',
            description: '1',
            creatorID: '1',
            date: 12,
            participants: []
        };
        const result = await Event.updateEventParticipantsPromise(operation as IEvent, '1', lang.help, partialLog);
        expect(result.title).equal(lang.unknownError.title);
    });

});
