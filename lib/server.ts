import * as Discord from 'discord.js';
import { DateTime } from 'luxon';
import * as mongoose from 'mongoose';
import CalendarEvent from './class/calendar-event';
import logger from './class/logger';
import { IConfig } from './interfaces/config';
import { II18n } from './interfaces/i18n';
import { ILog } from './interfaces/log';
import {
    clean,
    generateEmbed,
    getMongoDbConnectionString,
    parseLangMessage,
    sendMessageByBot,
    sendMessageByBotAndDelete
} from './utils/functions';

const config: IConfig = require('../config.json');
const lang: II18n = require(`./i18n/${config.config.lang}.json`);
const packageJSON = require('../package.json');

/* Initialisation of the Bot */
const Bot = new Discord.Client();
let botTag: string;
const Event = new CalendarEvent(Bot);

/* On bot start */
Bot.on('ready', () => {
    logger.logger.info(`=============================================`);
    logger.logger.info(`========== Bot connected to server ==========`);
    logger.logger.info(`=============================================`);
    logger.logger.info(`Connected as : ${Bot.user.tag} - (${Bot.user.id})`);

    // Set the bot under name message
    // TODO: replace with custom activity
    botTag = `<@${Bot.user.id}>`;
    Bot.user.setActivity(
        lang.status,
        { type: 'STREAMING' }
    ).catch();

    const uri = getMongoDbConnectionString();
    mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true}).then(
        () => {
            logger.logger.info(`Database : Connected`);
            logger.logger.info(`=================================================`);
            logger.logger.info(`========== Bot is now fully functional ==========`);
            logger.logger.info(`=================================================`);
        },
        (error) => {
            logger.logger.fatal(`Database : ${error}`);
            return process.exit(-1);
        }
    ); // connection to MongoDB

});

/* On event message */
Bot.on('message', async message => {

    if (message.content.startsWith(botTag)) {

        const partialLog = {
            command: message.content,
            userID: message.author.id,
            serverID: message.guild.id,
            channelID: message.channel.id,
            level: 'info'
        } as ILog;

        logger.logAndDB(partialLog);

        const clientMessage = message.content.substring(botTag.length+1); // Remove of the suffix of the command

        const command = clientMessage.split(' ')[0]; // The command

        const argOne = clientMessage.split(' ')[1]; // First argument
        const argTwo = clientMessage.split(' ')[2]; // Second arg
        const argTree = clientMessage.split(' ')[3]; // Third and last arg
        let argFour = '';

        // This for will combine all args after the 3rd into one
        for (let i = 4; i < clientMessage.split(' ').length; i++) {
            argFour = `${argFour} ${clientMessage.split(' ')[i]}`;
        }
        argFour = argFour.substring(1); // On surpprime l'espace au debut de la chaine

        switch (command) {

            case 'help':
                const helpResult = lang.help;
                partialLog.result = helpResult;
                logger.logAndDB(partialLog);
                sendMessageByBotAndDelete(await generateEmbed(Bot, 'info', lang.help), message.author, message).catch();
                break;

            case config.commands.help:
                const version = await generateEmbed(    Bot,
                                                        'info',
                                                        lang.version,
                                                        {langOptions: {version: packageJSON.version, author: packageJSON.author}}
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
                sendMessageByBotAndDelete(await Event.deleteOperation(
                    argOne,
                    message.author.id,
                    partialLog), message.author, message).catch();
                break;

            case config.commands.leaveEvent:
                sendMessageByBotAndDelete(await Event.removeParticipant(
                    message.author.id,
                    argOne,
                    partialLog), message.author, message).catch();
                break;

            case config.commands.cleanChannel:
                clean(Bot, message.channel).catch();
                break;

            case config.commands.listAllEvents:
                await clean(Bot, message.channel).catch();
                sendMessageByBot(await Event.listAllEvents(message.author.id, clientMessage, partialLog), message.channel);
                break;

            case config.commands.createEvent:
                await sendMessageByBotAndDelete(
                    await Event.validateAndCreatOperation(
                        argOne,
                        argTwo,
                        argTree,
                        argFour,
                        message.guild.id,
                        message.author.id,
                        partialLog
                    ), message.author, message);
                await clean(Bot, message.channel).catch();
                await sendMessageByBot(await Event.listAllEvents(message.author.id, clientMessage, partialLog), message.channel);
                break;
            default:
                const embed = await generateEmbed(Bot, 'warn', lang.unknownCommand);
                logger.logAndDBWithLevelAndResult(partialLog, 'info', embed);
                sendMessageByBotAndDelete(embed, message.author, message).catch();
                break;
        }

    }

});

/**
 * This function test upcoming event every minutes
 * If the event is taking place in 60 or 10 minutes
 * It send a messages to the user to warn him about the new upcoming event he signed for
 */
setInterval(async () => {
    const events = await CalendarEvent.getAllEventFromDate(DateTime.local());
    if (events !== -1 && typeof events !== 'number') {
        for (const event of events) {
            const eventDate = DateTime.fromMillis(event.date);

            const MinutesBetweenNowAndEvent = DateTime.local().until(eventDate).count('minutes');
            if (MinutesBetweenNowAndEvent === 60 || MinutesBetweenNowAndEvent === 10) {
                event.participants.forEach( (value: string) => {
                    Bot.fetchUser(value).then(
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
}, 1000 * 60);

/* Authenticate the bot on discord servers by private token */
Bot.login(config.auth.token).catch();
