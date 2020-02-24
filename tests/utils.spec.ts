import { expect } from 'chai';
import { Channel, Client, DMChannel, Guild, Message, TextChannel, User } from 'discord.js';
import 'mocha';
import * as mongoose from 'mongoose';
import { IConfig } from '../lib/interfaces/config';
import { II18n } from '../lib/interfaces/i18n';
import { ILog } from '../lib/interfaces/log';
import {
    eventReminderWarning,
    getMongoDbConnectionString, initialize,
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
        },
        channels: {
            get: () => {return {
                id: '2',
                name: 'tete'
            };},
        } as unknown as Channel
    } as unknown as Client;

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

    it('initialize() : Should return error', async () => {
        const embed = await initialize(Bot, {} as Message, {} as ILog, 'not valid');
        expect(embed.title).contain(lang.errorInCommand.title);
    });

    it('onMessage() : Initialise success', async () => {
        let result;
        const guild = {
            id: '1'
        } as Partial<Guild>;
        const message = {
            content: `<@0> ${config.commands.initialize} en-EN`,
            author: {
                id: 1,
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild,
            channel: new TextChannel(guild as Guild, {id: '2'}),
            delete: () => {return;}
        } as Partial<Message>;
        await onMessage(Bot, message as Message);
        expect(result.embed.title).equal(lang.InitializeSuccess.title);
    });

    it('onMessage() : Initialise already done', async () => {
        let result;
        const guild = {
            id: '1'
        } as Partial<Guild>;
        const message = {
            content: `<@0> ${config.commands.initialize} en-EN`,
            author: {
                id: 1,
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild,
            channel: new TextChannel(guild as Guild, {id: '2'}),
            delete: () => {return;}
        } as Partial<Message>;
        await onMessage(Bot, message as Message);
        expect(result.embed.title).equal(lang.InitializeAlreadyDone.title);
    });

    it('onMessage() : Initialise update', async () => {
        let result;
        const guild = {
            id: '1'
        } as Partial<Guild>;
        const message = {
            content: `<@0> ${config.commands.initialize} fr-FR`,
            author: {
                id: 1,
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild,
            channel: new TextChannel(guild as Guild, {id: '1'}),
            delete: () => {return;}
        } as Partial<Message>;
        await onMessage(Bot, message as Message);
        expect(result.embed.title).equal(lang.InitializeSuccessUpdate.title);
    });

    it('getMongoDbConnectionString() : Should be ok', () => {
        process.env.GH_ACTIONS = 'false';
        expect(getMongoDbConnectionString()).contain('mongodb://localhost:27017/');
        process.env.GH_ACTIONS = 'true';
    });

    it('getMongoDbConnectionString() : Not Github Actions environment - should be ok', () => {
        process.env.GH_ACTIONS = 'false';
        const tmp1 = config.db.password;
        const tmp2 = config.db.password;
        config.db.username = 'name';
        config.db.password = 'name';
        expect(getMongoDbConnectionString()).to.match(/^(mongodb:\/\/.{1,}:.{1,}@.{1,}:.{1,}\/.{1,})/);
        process.env.GH_ACTIONS = 'true';
        config.db.username = tmp1;
        config.db.password = tmp2;
    });

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
        const guild = {
                id: '1'
            } as Partial<Guild>;
        const message = {
            content: `<@0> ${config.commands.help}`,
            author: {
                id: 1,
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild,
            channel: new TextChannel(guild as Guild, {id: '1'}),
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
        const guild = {
            id: '1'
        } as Partial<Guild>;
        const message = {
            content: `<@0> ${config.commands.credits}`,
            author: {
                id: 1,
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild,
            channel: new TextChannel(guild as Guild, {id: '1'}),
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
        const guild = {
            id: '1'
        } as Partial<Guild>;
        const message = {
            content: `<@0> ${config.commands.joinEvent} 123556765`,
            author: {
                id: 1,
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild,
            channel: new TextChannel(guild as Guild, {id: '1'}),
            delete: () => {return;}
        } as Partial<Message>;
        await onMessage(Bot, message as Message);
        expect(result.embed.title).equal(lang.unknownError.title);
    });

    it('onMessage() delOpe - should return error message because of wrong ID', async () => {
        let result;
        const guild = {
            id: '1'
        } as Partial<Guild>;
        const message = {
            content: `<@0> ${config.commands.deleteEvent} 123556765`,
            author: {
                id: 1,
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild,
            channel: new TextChannel(guild as Guild, {id: '1'}),
            delete: () => {return;}
        } as Partial<Message>;
        await onMessage(Bot, message as Message);
        expect(result.embed.title).equal(lang.unknownError.title);
    });

    it('onMessage() leaveOpe - should return error message because of wrong ID', async () => {
        let result;
        const guild = {
            id: '1'
        } as Partial<Guild>;
        const message = {
            content: `<@0> ${config.commands.leaveEvent} 123556765`,
            author: {
                id: 1,
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild,
            channel: new TextChannel(guild as Guild, {id: '1'}),
            delete: () => {return;}
        } as Partial<Message>;
        await onMessage(Bot, message as Message);
        expect(result.embed.title).equal(lang.unknownError.title);
    });

    it('onMessage() mkEvent - should success', async () => {
        let result;
        const guild = {
            id: '1',
            client: {
                rest: {
                    methods: {
                        getChannelMessages: async () => []
                    }
                }
            }
        } as unknown as Partial<Guild>;
        const channel = new TextChannel(guild as Guild, {id: '1'});
        channel.fetchMessage = async (messageID: string) => new Promise<Message>(null);
        channel.send = async () => new Promise<Message>(null);
        const message = {
            content: `<@0> ${config.commands.createEvent} 20/12/2050 12:00 Titre Description`,
            author: {
                id: 1,
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild: {
                id: 1
            } as unknown as Partial<Guild>,
            channel,
            delete: () => {return;}
        } as Partial<Message>;
        await onMessage(Bot, message as Message);
        const eventID = result.embed.description.match(/[a-z0-9]{24}/);
        expect(result.embed.description).contain(parseLangMessage(lang.eventCreationSuccess.description, {eventID, userID: 1}));
    });

    it('onMessage() Default - should return unknow command', async () => {
        let result;
        const guild = {
            id: '1'
        } as Partial<Guild>;
        const message = {
            content: `<@0> azeazeazeza`,
            author: {
                id: 1,
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild,
            channel: new TextChannel(guild as Guild, {id: '1'}),
            delete: () => {return;}
        } as Partial<Message>;
        await onMessage(Bot, message as Message);
        expect(result.embed.description).equal(lang.unknownCommand.description);
    });

    it('eventReminderWarning() Should do nothing', async () => {
        return !expect(await eventReminderWarning(Bot)).throw;
    });
});
