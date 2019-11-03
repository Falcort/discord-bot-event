import { Message } from 'discord.js';
import * as Discord from 'discord.js';
import { DateTime } from 'luxon';
import * as mongoose from 'mongoose';
import CalendarEvent from './class/calendar-event';
import logger from './class/logger';
import { IConfig } from './interfaces/config';
import { IOperation } from './interfaces/operation';
import { clean, getMongoDbConnectionString, help } from './utils/functions';

const config: IConfig = require('../config.json');

/* Initialisation of the Bot */
const Bot = new Discord.Client();

/* On bot start */
Bot.on('ready', () => {
    logger.logger.info(`=============================================`);
    logger.logger.info(`========== Bot connected to server ==========`);
    logger.logger.info(`=============================================`);
    logger.logger.info(`Connected as : ${Bot.user.tag} - (${Bot.user.id})`);

    Bot.user.setPresence({
        status: 'online',
        game: {
            name: 'Squadron 42'
        }
    }).finally();

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

    if (message.content.substring(0, 2) === config.config.prefix) {

        const clientMessage = message.content.substring(2); // Remove of the suffix of the command

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
                sendMessageByBot(help(), message.author);
                break;

            case 'version':
                sendMessageByBot(`version : ${config.application.version} - author: ${config.application.author}`, message.channel);
                break;

            case 'joinOpé':
                sendMessageByBot(await CalendarEvent.addParticipant(argOne,
                    message.author.username,
                    message.author.id,
                    clientMessage), message.channel);
                break;

            case 'delOpé':
                sendMessageByBot(await CalendarEvent.deleteOperation(argOne,
                    message.author.id,
                    clientMessage), message.channel);
                break;

            case 'leaveOpé':
                sendMessageByBot(await CalendarEvent.removeParticipant(message.author.username,
                    message.author.id,
                    argOne,
                    clientMessage), message.channel);
                break;

            case 'clean':
                clean(Bot, message.channel).catch();
                break;

            case 'listOpé':
                sendMessageByBot(await CalendarEvent.listAllEvents(clientMessage, message.author.id), message.channel);
                break;

            case 'addOpé':
                sendMessageByBot(await CalendarEvent.validateAndCreatOperation(argOne,
                    argTwo,
                    argTree,
                    argFour,
                    message.guild.id,
                    message.author.username,
                    message.author.id,
                    clientMessage), message.channel);
                break;
            default:
                const response = 'Désoler je ne connais pas cette commande';
                logger.logAndDB(clientMessage, message.author.id, 'warn', response);
                sendMessageByBot(response, message.channel);
                break;
        }

    }

});

setInterval(async () => {
    const events = await CalendarEvent.getAllEventFromDate(DateTime.local());
    if (events !== -1 && typeof events !== 'number') {
      for (const event of events) {
        const IEvent = event as IOperation;
        const eventDate = DateTime.fromMillis(IEvent.date);

        const MinutesBetweenNowAndEvent = DateTime.local().until(eventDate).count('minutes');
        if (MinutesBetweenNowAndEvent === 60) {
          logger.logger.debug('Une heur avant');
        } else if (MinutesBetweenNowAndEvent === 10) {
          logger.logger.debug('10 min avant');
        }
        IEvent.participants.forEach(async (value: string) => {
          const user = await Bot.fetchUser(value);
          sendMessageByBot('test', user);
        });
      }
    }
}, 1000 * 10);



/**
 * This function is to send message by the bot
 * @param message -- the string message that the bot need to send
 * @param where -- the channel or user that the bot need to send message to
 * @return Promise<Message | Message[]> | number -- A promise of a -1 on error
 */
function sendMessageByBot(
    message: string,
    where: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel | Discord.User
): Promise<Message | Message[]> | number {
    if (message.length > 0 && message) {
        return where.send(message);
    }
    return -1;
}

/* Authenticate the bot on discord servers by private token */
Bot.login(config.auth.token).catch();
