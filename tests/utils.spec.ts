import { expect } from 'chai';
import { Channel, Client, DMChannel, Guild, Message, User } from 'discord.js';
import 'mocha';
import * as mongoose from 'mongoose';
import { IConfig } from '../lib/interfaces/config';
import { II18n } from '../lib/interfaces/i18n';
import {
    eventReminderWarning,
    getMongoDbConnectionString,
    onMessage,
    parseLangMessage,
    sendMessageByBot,
    sendMessageByBotAndDelete
} from '../lib/utils/functions';
const config: IConfig = require('../config.json');

const lang: II18n = require(`../lib/i18n/${config.config.lang}.json`);
const packageJSON = require('../package.json');


describe('Utils', () => {

    const Bot = {
        user: {id: 0} as unknown as Partial<User>,
        fetchUser: async (id: string, cache?: boolean): Promise<User> => {
            return await {} as User;
        }
    } as Client;

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

    // it('getMongoDbConnectionString() : Should be ok', () => {
    //     process.env.GH_ACTIONS = 'false';
    //     expect(getMongoDbConnectionString()).contain('mongodb://localhost:27017/');
    //     process.env.GH_ACTIONS = 'true';
    // });
    //
    // it('getMongoDbConnectionString() : Not Github Actions environment - should be ok', () => {
    //     process.env.GH_ACTIONS = 'false';
    //     const tmp1 = config.db.password;
    //     const tmp2 = config.db.password;
    //     config.db.username = 'name';
    //     config.db.password = 'name';
    //     expect(getMongoDbConnectionString()).to.match(/^(mongodb:\/\/.{1,}:.{1,}@.{1,}:.{1,}\/.{1,})/);
    //     process.env.GH_ACTIONS = 'true';
    //     config.db.username = tmp1;
    //     config.db.password = tmp2;
    // });

    it('sendMessageByBot() Should return -1', async () => {
        const result = await sendMessageByBot('', {} as DMChannel);
        expect(result).equal(-1);
    });

    it('sendMessageByBot() Should return the message', async () => {
        let message = '';
        const chan = { send: (m) => { message = m; }} as Partial<DMChannel>;
        await sendMessageByBot('1234Message', chan as DMChannel);
        expect(message).equal('1234Message');
    });

    it('sendMessageByBotAndDelete() Should return -1', async () => {
        const result = await sendMessageByBotAndDelete('', {} as DMChannel, {} as Message);
        expect(result).equal(-1);
    });

    it('onMessage() Help should return help', async () => {
        let result;
        const message = {
            content: '<@0> help',
            author: {
                id: 1,
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild: {
                id: 1
            } as unknown as Partial<Guild>,
            channel: {
                id: 1
            } as unknown as Partial<Channel>,
            delete: () => {return;}
        } as Partial<Message>;
        await onMessage(Bot , message as Message);
        expect(result.embed.description).contain(parseLangMessage(lang.help.description, {
            tag: '@DBE',
            createEvent: config.commands.createEvent,
            listEvent: config.commands.listAllEvents,
            joinEvent: config.commands.joinEvent,
            leaveEvent: config.commands.leaveEvent,
            credit: config.commands.credits,
            clearChan: config.commands.cleanChannel,
            delEvent: config.commands.deleteEvent
        }));
    });

    it('onMessage() Help should return version', async () => {
        let result;
        const message = {
            content: '<@0> credits',
            author: {
                id: 1,
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild: {
                id: 1
            } as unknown as Partial<Guild>,
            channel: {
                id: 1
            } as unknown as Partial<Channel>,
            delete: () => {return;}
        } as Partial<Message>;
        await onMessage(Bot, message as Message);
        expect(result.embed.description).equal(parseLangMessage(lang.version.description, {
            version: packageJSON.version,
            author: packageJSON.author
        }));
    });

    it('onMessage() : JoinOpe - should return error message because of wrong ID', async () => {
        let result;
        const message = {
            content: '<@0> jEvent 123456789e123456789g123',
            author: {
                id: 1,
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild: {
                id: 1
            } as unknown as Partial<Guild>,
            channel: {
                id: 1
            } as unknown as Partial<Channel>,
            delete: () => {return;}
        } as Partial<Message>;
        await onMessage(Bot, message as Message);
        expect(result.embed.title).equal(lang.unknownError.title);
    });

    it('onMessage() delOpe - should return error message because of wrong ID', async () => {
        let result;
        const message = {
            content: '<@0> rmEvent 123456789e123456789g123',
            author: {
                id: 1,
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild: {
                id: 1
            } as unknown as Partial<Guild>,
            channel: {
                id: 1
            } as unknown as Partial<Channel>,
            delete: () => {return;}
        } as Partial<Message>;
        await onMessage(Bot, message as Message);
        expect(result.embed.title).equal(lang.unknownError.title);
    });

    it('onMessage() leaveOpe - should return error message because of wrong ID', async () => {
        let result;
        const message = {
            content: '<@0> lEvent 123456789e123456789g123',
            author: {
                id: 1,
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild: {
                id: 1
            } as unknown as Partial<Guild>,
            channel: {
                id: 1
            } as unknown as Partial<Channel>,
            delete: () => {return;}
        } as Partial<Message>;
        await onMessage(Bot, message as Message);
        expect(result.embed.title).equal(lang.unknownError.title);
    });

    it('onMessage() listOpe - should success', async () => {
        let result;
        const message = {
            content: '<@0> mkEvent 20/12/2050 12:00 Titre Description',
            author: {
                id: 1,
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild: {
                id: 1
            } as unknown as Partial<Guild>,
            channel: {
                id: 1,
                fetchMessages: () => [],
                send: async (m) => {await setTimeout(() => result = m, 100);}
            } as unknown as Partial<Channel>,
            delete: () => {return;}
        } as Partial<Message>;
        await onMessage(Bot, message as Message);
        const eventID = result.embed.description.match(/[a-z0-9]{24}/);
        expect(result.embed.description).contain(parseLangMessage(lang.eventCreationSuccess.description, {eventID, userID: 1}));
    });

    it('onMessage() Default - should return unknow command', async () => {
        let result;
        const message = {
            content: '<@0> qweqweqw ',
            author: {
                id: 1,
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild: {
                id: 1
            } as unknown as Partial<Guild>,
            channel: {
                id: 1
            } as unknown as Partial<Channel>,
            delete: () => {return;}
        } as Partial<Message>;
        await onMessage(Bot, message as Message);
        expect(result.embed.description).equal(lang.unknownCommand.description);
    });

    it('eventReminderWarning() Should do nothing', async () => {
        return !expect(await eventReminderWarning(Bot)).throw;
    });
});
