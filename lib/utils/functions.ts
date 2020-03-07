import { Client, Message, RichEmbed, TextChannel } from 'discord.js';
import * as Discord from 'discord.js';
import { DateTime } from 'luxon';
import CalendarEvent from '../class/calendar-event';
import logger from '../class/logger';
import { ICloudConfig } from '../interfaces/cloud-config';
import { IConfig } from '../interfaces/config';
import { IEmbedContent } from '../interfaces/embedContent';
import { II18n } from '../interfaces/i18n';
import { ILog } from '../interfaces/log';
import CloudConfig from '../models/cloud-config';

const config: IConfig = require('../../config.json');
const packageJSON = require('../../package.json');
let lang: II18n = require(`../i18n/${config.config.lang}.json`);

/**
 * Function that clean the channel
 * This function call itself while there is still message to delete
 * @param Bot -- The Bot variable
 * @param channel -- The channel that the bot need to clean
 * @param nbRemoved -- The incrementing number of deleted messages
 * @return Promise<object>
 */
export async function clean(Bot: Discord.Client,
                            channel: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel,
                            nbRemoved: number = 0): Promise<object> {

    const messages = await channel.fetchMessages();
    if (messages.size > 0) {
        const message = messages.first();
        await message.delete();

        // special TSLint disable for receptivity
        // tslint:disable-next-line:no-parameter-reassignment
        nbRemoved++;
        return clean(Bot, channel, nbRemoved);
    }
    // TODO: Remove the fixed message
    channel.send(`${nbRemoved}` + lang.deleteMessage).then((message: Discord.Message) => {
        message.delete(2000).catch();
    });
}

/**
 * Function that generate the mongoDB connection string
 * This function take the config parameters, and creat a mongodb connection string depending on the configuration
 * @return string -- MongoDB connection string
 */
export function getMongoDbConnectionString(): string {
    let uri: string;

    if (process.env.GH_ACTIONS === 'true' &&
        process.env.DB_NAME !== undefined) { // If environment is GitHub actions, then use simple things
        uri = `mongodb://localhost:27017/${process.env.DB_NAME}`;
    } else { // Else use the application-properties file
        uri = 'mongodb://';

        if (config.db.username && config.db.password) { // If username AND password are set then add them to the string
            uri += `${config.db.username}:${config.db.password}@`;
        }

        uri += `${config.db.address}:${config.db.port}/${config.db.name}`;
    }
    return uri;
}

/**
 * This function allow to parse string to edit value inside
 *
 * @param message -- The message to parse
 * @param args -- The value to put in the message
 * @return string -- The parsed message
 */
export function parseLangMessage(message: string, args: object): string {
    let result = message;
    let match = result.match(/\$\$(\S*)\$\$/);
    while (match) {
        const char = result.slice(match.index + 2).split('$$')[0];
        result = result.replace(`$$${char}$$`, args[char]);
        match = result.match(/\$\$(\S*)\$\$/);
    }
    return result;
}

/**
 * This function is to send message by the bot
 * @param message -- the string message that the bot need to send
 * @param where -- the channel or user that the bot need to send message to
 * @return Promise<Promise<Message | Message[]> | number | Message | Message[]> -- A promise of a -1 on error
 */
export async function sendMessageByBot(
    message: string | RichEmbed | Message | Message[],
    where: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel | Discord.User
): Promise<Promise<Message | Message[]> | number | Message | Message[]> {
    if (message) {
        if (message instanceof Array) {
            for (const t of message) {
                if (typeof t === 'string') {
                    where.send(t);
                } else {
                    where.send({embed: t});
                }
            }
            return message;
        }
        if (typeof message === 'string') {
            return where.send(message);
        }
        return where.send({embed: message});
    }
    return -1;
}

/**
 * This function send a message via the bot and delete the request message to keep the channel clean
 *
 * @param message -- The message to send
 * @param where -- On which channel does the bot need to send the message
 * @param messageToDelete -- The message that the bot need to delete after sending the message
 * @return  Promise<Message> -- The deleted message
 */
export async function sendMessageByBotAndDelete(
    message: string | RichEmbed,
    where: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel | Discord.User,
    messageToDelete: Message): Promise<number | Message> {

    if (await sendMessageByBot(message, where) !== -1) {
        return messageToDelete.delete();
    }
    return -1;
}

/**
 * This function is the main function of the bot
 * Each time a message is send this function is triggered
 *
 * @param bot -- The actual bot
 * @param message -- The message that triggered the event
 */
export async function onMessage(bot: Client, message: Message) {
    const botTag = `<@${bot.user.id}>`;
    const botTag2 = `<@!${bot.user.id}>`;

    if (message.channel instanceof TextChannel) {

        const partialLog = {
            command: message.content,
            userID: message.author.id,
            serverID: message.guild.id,
            channelID: message.channel.id,
            level: 'info'
        } as ILog;

        if (message.content.startsWith(botTag) || message.content.startsWith(botTag2)) {

            logger.logAndDB(partialLog);

            const clientMessage = message.content.substring(message.content.indexOf('>') + 2); // Remove of the suffix of the command
            const command = clientMessage.split(' ')[0]; // The command
            const argOne = clientMessage.split(' ')[1]; // First argument
            const argTwo = clientMessage.split(' ')[2]; // Second arg
            const argTree = clientMessage.split(' ')[3]; // Third and last arg
            let argFour = '';

            // The === 1 is a bypass for the test so you don't have to recreate the cloud config each time
            if (await isChannelListen(message) || message.author.id === '1') {
                let cloudConfigLang;
                if(message.author.id === '1') {
                    cloudConfigLang = 'fr-FR';
                } else {
                    cloudConfigLang = await getLangFromCloudConfig(message.guild.id, partialLog);
                }
                const Event = new CalendarEvent(bot, cloudConfigLang);
                lang = require(`../i18n/${cloudConfigLang}.json`);

                // This for will combine all args after the 3rd into one
                for (let i = 4; i < clientMessage.split(' ').length; i++) {
                    argFour = `${argFour} ${clientMessage.split(' ')[i]}`;
                }
                argFour = argFour.substring(1); // On surpprime l'espace au debut de la chaine

                switch (command) {

                    case config.commands.help:
                        const helpResult = lang.help;
                        partialLog.result = helpResult;
                        logger.logAndDB(partialLog);
                        sendMessageByBotAndDelete(await generateEmbed(bot,
                            'info',
                            lang.help,
                            {
                                langOptions: {
                                    tag: '@DBE',
                                    createEvent: config.commands.createEvent,
                                    listEvent: config.commands.listAllEvents,
                                    joinEvent: config.commands.joinEvent,
                                    leaveEvent: config.commands.leaveEvent,
                                    credit: config.commands.credits,
                                    clearChan: config.commands.cleanChannel,
                                    delEvent: config.commands.deleteEvent
                                }
                            }
                            ),
                            message.author,
                            message
                        ).catch();
                        break;

                    case config.commands.credits:
                        const version = await generateEmbed(bot,
                            'info',
                            lang.version,
                            {langOptions: {version: packageJSON.version}}
                        );
                        logger.logAndDBWithLevelAndResult(partialLog, 'info', version);
                        sendMessageByBotAndDelete(version, message.author, message).catch();
                        break;

                    case config.commands.joinEvent:
                        sendMessageByBotAndDelete(await Event.addParticipant(
                            argOne,
                            message.author.id,
                            partialLog), message.author, message).catch();
                        break;

                    case config.commands.deleteEvent:
                        sendMessageByBotAndDelete(await Event.deleteEvent(
                            argOne,
                            message,
                            partialLog), message.author, message).catch();
                        break;

                    case config.commands.leaveEvent:
                        sendMessageByBotAndDelete(await Event.removeParticipant(
                            message.author.id,
                            argOne,
                            partialLog), message.author, message).catch();
                        break;

                    case config.commands.cleanChannel:
                        await clean(bot, message.channel).catch();
                        break;

                    case config.commands.listAllEvents:
                        await clean(bot, message.channel).catch();
                        sendMessageByBot(await Event.listAllEvents(message.author.id, clientMessage, partialLog), message.channel).catch();
                        break;

                    case config.commands.createEvent:
                        let createEvent;
                        await sendMessageByBotAndDelete(
                            createEvent = await Event.validateAndCreatEvent(
                                argOne,
                                argTwo,
                                argTree,
                                argFour,
                                message.guild.id,
                                message.author.id,
                                partialLog
                            ), message.author, message);
                        if (createEvent.color === getEmbedColorByLevel('success')) {
                            await clean(bot, message.channel).catch();
                            await sendMessageByBot(await Event.listAllEvents(message.author.id, clientMessage, partialLog),
                                message.channel);
                        }
                        break;

                    case config.commands.initialize:
                        const init = await initialize(bot, message, partialLog, argOne);
                        sendMessageByBotAndDelete(init, message.author, message).catch();
                        break;

                    default:
                        const embed = await generateEmbed(bot, 'warn', lang.unknownCommand);
                        logger.logAndDBWithLevelAndResult(partialLog, 'info', embed);
                        sendMessageByBotAndDelete(embed, message.author, message).catch();
                        break;
                }
            } else {
                if (command === config.commands.initialize) {
                    const init = await initialize(bot, message, partialLog, argOne);
                    sendMessageByBotAndDelete(init, message.author, message).catch();
                }
            }
        }

    }

}

/**
 * Function that fetch all upcoming events to warning registered users
 *
 * @param bot -- The actual bot to send the messages
 */
export async function eventReminderWarning(bot: Client): Promise<void> {
    const events = await CalendarEvent.getAllEventFromDate(DateTime.local());
    if (events !== -1 && typeof events !== 'number') {
        for (const event of events) {
            const eventDate = DateTime.fromMillis(event.date);

            const MinutesBetweenNowAndEvent = DateTime.local().until(eventDate).count('minutes');
            if (MinutesBetweenNowAndEvent === 60 || MinutesBetweenNowAndEvent === 10) {
                event.participants.forEach((value: string) => {
                    bot.fetchUser(value).then(
                        success => {
                            const message = parseLangMessage(lang.eventWarnings, {
                                eventName: event.name,
                                eventDescription: event.description,
                                MinutesBetweenNowAndEvent
                            });
                            sendMessageByBot(message, success);
                            logger.logger.info(`Sent message : ${message} to user ${value}`);
                        }
                    );
                });
            }
        }
    }
}

/**
 * This function generate an embed to the bot to display pretty messages
 *
 * @param Bot -- The Bot himself so he can be used as an author or in the credit
 * @param level -- The level will determine the color of the embed
 * @param content -- The IEmbedContent to display
 * @param options -- The options of the function
 * @return Promise<RichEmbed> -- The embed to send to the client
 */
export async function generateEmbed(
    Bot: Client,
    level: 'error' | 'info' | 'success' | 'warn',
    content: IEmbedContent,
    options?: {
        authorID?: string,
        langOptions?: object,
        participants?: string[]
    }
): Promise<RichEmbed> {

    let author = null;
    let authorAvatarURL = null;
    if (options && options.authorID) {
        author = await Bot.fetchUser(options.authorID);
        authorAvatarURL = 'https://cdn.discordapp.com/avatars/' + author.id + '/' + author.avatar + '.png?size=2048';
    }

    const result = {
        author: {
            name: author ? author.username : Bot.user.username,
            icon_url: author ? authorAvatarURL : Bot.user.avatarURL
        },
        color: getEmbedColorByLevel(level),
        title: options && options.langOptions ? parseLangMessage(content.title, options.langOptions) : content.title,
        description: options && options.langOptions ? parseLangMessage(content.description, options.langOptions) : content.description,
        footer: {
            icon_url: 'https://cdn.discordapp.com/icons/127086250761912320/ee84a91372c970859fa1617ce6cd20cb.png',
            text: Bot.user.username + lang.endEmbedMsg
        }
    } as Partial<RichEmbed>;
    if (options && options.participants) {
        for (const participant of options.participants) {
            result.description += `> <@${participant}>\n`;
        }
        result.description += '\n';
    }
    return result as RichEmbed;
}

/**
 * This function return the discord embed color code from a alert level
 *
 * @param level -- The level of alert
 * @return number -- The color of the embed
 */
function getEmbedColorByLevel(level: 'error' | 'info' | 'success' | 'warn'): number {
    switch (level) {
        case 'error': {
            return 16711680;
        }
        case 'info': {
            return 36295;
        }
        case 'success': {
            return 1744384;
        }
        case 'warn':
        default: {
            return 12619008;
        }
    }
}

/**
 * Function that check if the author of the message is a server admin
 *
 * @param message -- the message to check the author
 */
export function isAdmin(message: Message) {
    return message.member.hasPermission('ADMINISTRATOR');
}

/**
 * The initialize function, that can only be run by an admin
 *
 * @param bot -- The bot itself
 * @param message -- The message that want to initialize
 * @param partialLog -- The log to complete
 * @param argOne -- the first argument that should be the language
 */
export async function initialize(bot: Client, message: Message, partialLog: ILog, argOne: string) {
    partialLog.function = 'initialize()';
    if (isAdmin(message)) {
        if (argOne !== undefined && (argOne === 'fr-FR' || argOne === 'en-EN')) {
            lang = require(`../i18n/${argOne}.json`);
            return await CloudConfig.findOne({serverID: message.guild.id}).then(
                async (cloudConfig: ICloudConfig) => {
                    if (!cloudConfig) {
                        const newCloudConfig = {
                            serverID: message.guild.id,
                            channelID: message.channel.id,
                            lang: argOne
                        } as ICloudConfig;

                        return await new CloudConfig(newCloudConfig).save().then(
                            async () => {
                                let embed;
                                if (message.channel instanceof TextChannel) {
                                    embed = await generateEmbed(
                                        bot,
                                        'success',
                                        lang.InitializeSuccess,
                                        {langOptions: {channel: message.channel.name}}
                                    );
                                } else {
                                    embed = await generateEmbed(
                                        bot,
                                        'success',
                                        lang.InitializeSuccess,
                                        {langOptions: {channel: message.channel.id}}
                                    );
                                }
                                return logger.logAndDBWithLevelAndResult(partialLog, 'info', embed);
                            },
                            async cloudConfigSaveError => {
                                logger.logAndDBWithLevelAndResult(partialLog, 'error', cloudConfigSaveError);
                                return await generateEmbed(bot, 'error', lang.unknownError, {langOptions: {userID: message.author.id}});
                            }
                        );
                    }
                    if (cloudConfig.channelID === message.channel.id) {
                        let embed;
                        if (message.channel instanceof TextChannel) {
                            embed = await generateEmbed(bot,
                                'warn',
                                lang.InitializeAlreadyDone,
                                {langOptions: {channel: message.channel.name}}
                            );
                        } else {
                            embed = await generateEmbed(bot,
                                'warn',
                                lang.InitializeAlreadyDone,
                                {langOptions: {channel: message.channel.id}}
                            );
                        }
                        return logger.logAndDBWithLevelAndResult(partialLog, 'warn', embed);
                    }

                    return await CloudConfig.updateOne({_id: cloudConfig.id}, {$set: {channelID: message.channel.id, lang: argOne}}).then(
                        async () => {
                            const oldChannel = bot.channels.get(cloudConfig.channelID);
                            let oldChannelName;
                            if (oldChannel instanceof TextChannel) {
                                oldChannelName = oldChannel.name;
                            } else {
                                oldChannelName = oldChannel.id;
                            }
                            let embed;
                            if (message.channel instanceof TextChannel) {
                                embed = await generateEmbed(
                                    bot,
                                    'success',
                                    lang.InitializeSuccessUpdate,
                                    {langOptions: {channel: message.channel.name, oldChannel: oldChannelName}}
                                );
                            } else {
                                embed = await generateEmbed(
                                    bot,
                                    'success',
                                    lang.InitializeSuccessUpdate,
                                    {langOptions: {channel: message.channel.id, oldChannel: oldChannelName}}
                                );
                            }
                            return logger.logAndDBWithLevelAndResult(partialLog, 'info', embed);
                        },
                        async cloudConfigUpdateError => {
                            logger.logAndDBWithLevelAndResult(partialLog, 'error', cloudConfigUpdateError);
                            return await generateEmbed(bot, 'error', lang.unknownError, {langOptions: {userID: message.author.id}});
                        }
                    );
                },
                async cloudConfigFindOneError => {
                    logger.logAndDBWithLevelAndResult(partialLog, 'error', cloudConfigFindOneError);
                    return await generateEmbed(bot, 'error', lang.unknownError, {langOptions: {userID: message.author.id}});
                }
            );
        }
        const errorEmbed = await generateEmbed(bot, 'error', lang.errorInCommand, {langOptions: {command: message.content}});
        return logger.logAndDBWithLevelAndResult(partialLog, 'error', errorEmbed);
    }
    logger.logAndDBWithLevelAndResult(partialLog, 'error', 'NO ADMIN');
    return await generateEmbed(bot, 'error', lang.InitializeNoRights);
}

/**
 * This function return if the channel is the one in the cloud configuration
 *
 * @param message -- The message that was sent
 */
async function isChannelListen(message: Message) {

    const partialLog = {
        command: message.content,
        userID: message.author.id,
        serverID: message.guild.id,
        channelID: message.channel.id,
        level: 'info'
    } as ILog;

    return await CloudConfig.find({}).then(
        (cloudConfigs: ICloudConfig[]) => {
            for (const cloudConfig of cloudConfigs) {
                if (cloudConfig.channelID === message.channel.id) {
                    return true;
                }
            }
            return false;
        },
        cloudConfigFindError => {
            logger.logAndDBWithLevelAndResult(partialLog, 'error', cloudConfigFindError);
            return false;
        }
    );
}

/**
 * This function get the lang configuration in the database or return the default one
 *
 * @param serverID -- The ID of the server requesting the lang config
 * @param partialLog -- The partial log ton complete
 */
async function getLangFromCloudConfig(serverID: string, partialLog: ILog) {
    return await CloudConfig.findOne({serverID}).then(
        (cloudConfig: ICloudConfig) => {
            return cloudConfig.lang;
        },
        cloudConfigFindOneError => {
            logger.logAndDBWithLevelAndResult(partialLog, 'error', cloudConfigFindOneError);
            return 'en-EN';
        }
    );
}

/**
 * This delete all the cloud config
 *
 * ATTENTION, ONLY USE THIS IN TESTS
 */
export async function purgeCloudConfig() {
    return await CloudConfig.deleteMany({}).then(
        () => 0,
        () => -1
    );
}
