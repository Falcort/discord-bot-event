import { expect } from 'chai';
import {
    Attachment,
    Channel,
    ChannelLogsQueryOptions,
    Client,
    Collection,
    DMChannel,
    Guild,
    Message, MessageOptions, RichEmbed,
    StringResolvable,
    TextChannel,
    User
} from 'discord.js';
import 'mocha';
import * as mongoose from 'mongoose';
import { IConfig } from '../lib/interfaces/config';
import { II18n } from '../lib/interfaces/i18n';
import { ILog } from '../lib/interfaces/log';
import {
    clean,
    eventReminderWarning,
    getMongoDbConnectionString, initialize,
    onMessage,
    parseLangMessage, purgeCloudConfig,
    sendMessageByBot,
    sendMessageByBotAndDelete
} from '../lib/utils/functions';
const config: IConfig = require('../config.json');

const langFR: II18n = require(`../lib/i18n/fr-FR.json`);
const langEN: II18n = require(`../lib/i18n/en-EN.json`);
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

    it('initialize() : Should return error (not valid language)', async () => {
        let result;
        const guild = {
            id: '1'
        } as unknown as Partial<Guild>;
        const message = {
            content: `<@0> ${config.commands.initialize} en-EN`,
            author: {
                id: 1,
                send: (m) => {
                    result = m;
                }
            } as Partial<Client>,
            guild,
            member: {
                hasPermission: () => {
                    return true;
                }
            },
            channel: new TextChannel(guild as Guild, {id: '2'}),
            delete: () => {
                return;
            }
        } as unknown as Partial<Message>;
        const embed = await initialize(Bot, message as Message, {} as ILog, 'not valid');
        expect(embed.title).contain(langFR.errorInCommand.title);
    });

    it('initialize() : Should return permission error', async () => {
        let result;
        const guild = {
            id: '1'
        } as unknown as Partial<Guild>;
        const message = {
            content: `<@0> ${config.commands.initialize} en-EN`,
            author: {
                id: 1,
                send: (m) => {
                    result = m;
                }
            } as Partial<Client>,
            guild,
            member: {
                hasPermission: () => {
                    return false;
                }
            },
            channel: new TextChannel(guild as Guild, {id: '2'}),
            delete: () => {
                return;
            }
        } as unknown as Partial<Message>;
        const embed = await initialize(Bot, message as Message, {} as ILog, 'not valid');
        expect(embed.title).contain(langFR.InitializeNoRights.title);
    });

    it('onMessage() : Initialise success', async () => {
        await purgeCloudConfig();
        let result;
        const guild = {
            id: '1'
        } as Partial<Guild>;
        const message = {
            content: `<@0> ${config.commands.initialize} en-EN`,
            author: {
                id: 1,
                send: (m) => {
                    result = m;
                }
            } as Partial<Client>,
            guild,
            member: {
                hasPermission: () => {
                    return true;
                }
            },
            channel: new TextChannel(guild as Guild, {id: '2'}),
            delete: () => {
                return;
            }
        } as unknown as Partial<Message>;
        await onMessage(Bot, message as Message);
        expect(result.embed.title).equal(langEN.InitializeSuccess.title);
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
                send: (m) => {
                    result = m;
                }
            } as Partial<Client>,
            guild,
            member: {
                hasPermission: () => {
                    return true;
                }
            },
            channel: new TextChannel(guild as Guild, {id: '2'}),
            delete: () => {
                return;
            }
        } as unknown as Partial<Message>;
        await onMessage(Bot, message as Message);
        await onMessage(Bot, message as Message);
        expect(result.embed.title).equal(langEN.InitializeAlreadyDone.title);
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
                send: (m) => {
                    result = m;
                }
            } as Partial<Client>,
            guild,
            member: {
                hasPermission: () => {
                    return true;
                }
            },
            channel: new TextChannel(guild as Guild, {id: '2'}),
            delete: () => {
                return;
            }
        } as unknown as Partial<Message>;
        await onMessage(Bot, message as Message);
        message.channel = new TextChannel(guild as Guild, {id: '1'});
        await onMessage(Bot, message as Message);
        expect(result.embed.title).equal(langFR.InitializeSuccessUpdate.title);
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
                id: '1',
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild,
            channel: new TextChannel(guild as Guild, {id: '1'}),
            delete: () => {return;}
        } as Partial<Message>;
        await onMessage(Bot , message as Message);
        expect(result.embed.description).contain(parseLangMessage(langFR.help.description, {
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
                id: '1',
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild,
            channel: new TextChannel(guild as Guild, {id: '1'}),
            delete: () => {return;}
        } as Partial<Message>;
        await onMessage(Bot, message as Message);
        expect(result.embed.description).equal(parseLangMessage(langFR.version.description, {
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
                id: '1',
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild,
            channel: new TextChannel(guild as Guild, {id: '1'}),
            delete: () => {return;}
        } as Partial<Message>;
        await onMessage(Bot, message as Message);
        expect(result.embed.title).equal(langFR.unknownError.title);
    });

    it('onMessage() delOpe - should return error message because of wrong ID', async () => {
        let result;
        const guild = {
            id: '1'
        } as Partial<Guild>;
        const message = {
            content: `<@0> ${config.commands.deleteEvent} 123556765`,
            author: {
                id: '1',
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild,
            channel: new TextChannel(guild as Guild, {id: '1'}),
            delete: () => {return;}
        } as Partial<Message>;
        await onMessage(Bot, message as Message);
        expect(result.embed.title).equal(langFR.unknownError.title);
    });

    it('onMessage() leaveOpe - should return error message because of wrong ID', async () => {
        let result;
        const guild = {
            id: '1'
        } as Partial<Guild>;
        const message = {
            content: `<@0> ${config.commands.leaveEvent} 123556765`,
            author: {
                id: '1',
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild,
            channel: new TextChannel(guild as Guild, {id: '1'}),
            delete: () => {return;}
        } as Partial<Message>;
        await onMessage(Bot, message as Message);
        expect(result.embed.title).equal(langFR.unknownError.title);
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
                id: '1',
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
        expect(result.embed.description).contain(parseLangMessage(langFR.eventCreationSuccess.description, {eventID, userID: 1}));
    });

    it('onMessage() Default - should return unknown command', async () => {
        let result;
        const guild = {
            id: '1'
        } as Partial<Guild>;
        const message = {
            content: `<@0> azeazeazeza`,
            author: {
                id: '1',
                send: (m) => {result = m;}
            } as Partial<Client>,
            guild,
            channel: new TextChannel(guild as Guild, {id: '1'}),
            delete: () => {return;}
        } as Partial<Message>;
        await onMessage(Bot, message as Message);
        expect(result.embed.description).equal(langFR.unknownCommand.description);
    });

    it('eventReminderWarning() Should do nothing', async () => {
        return !expect(await eventReminderWarning(Bot)).throw;
    });

    it('clean() should delete 2 messages', async () => {
        const messagesMap = new Collection<string, Message>();
        messagesMap.set('1', {delete: async () => messagesMap.delete('1')} as unknown as Message);
        messagesMap.set('2', {delete: async () => messagesMap.delete('2')} as unknown as Message);
        let send;
        const channel = {
            fetchMessages: async () => {
                return messagesMap;
            },
            send: async (m) => send = m
        } as unknown as TextChannel;
        await clean(Bot, channel);
        expect(send).equal(`${2}` + langFR.deleteMessage);
    });

    it('onMessage() should delete 2 messages', async () => {
        const messagesMap = new Collection<string, Message>();
        messagesMap.set('1', {delete: async () => messagesMap.delete('1')} as unknown as Message);
        messagesMap.set('2', {delete: async () => messagesMap.delete('2')} as unknown as Message);
        let send;
        const channel = {
            fetchMessages: async () => {
                return messagesMap;
            },
            send: async (m) => send = m
        } as unknown as TextChannel;

        let result;
        const guild = {
            id: '1'
        } as Partial<Guild>;
        const message = {
            content: `<@0> ${config.commands.cleanChannel}`,
            author: {
                id: '1',
                send: (m) => {
                    result = m;
                }
            } as Partial<Client>,
            guild,
            member: {
                hasPermission: () => {
                    return true;
                }
            },
            channel: new TextChannel(guild as Guild, {id: '2'}),
            delete: () => {
                return;
            }
        } as unknown as Partial<Message>;
        message.channel.fetchMessages = async () => messagesMap;
        message.channel.send = async (content) => result = content;
        await onMessage(Bot, message as Message);
        expect(result).equal(`${2}` + langFR.deleteMessage);
    });

});
