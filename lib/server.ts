import * as Discord from 'discord.js';
import * as mongoose from 'mongoose';
import logger from './class/logger';
import { IConfig } from './interfaces/config';
import { II18n } from './interfaces/i18n';
import {
    eventReminderWarning,
    getMongoDbConnectionString,
    onMessage
} from './utils/functions';

const config: IConfig = require('../config.json');
const lang: II18n = require(`./i18n/${config.config.lang}.json`);

/* Initialisation of the Bot */
const Bot = new Discord.Client();
let botTag: string;

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
    await onMessage(Bot, message);
});

/**
 * This function test upcoming event every minutes
 * If the event is taking place in 60 or 10 minutes
 * It send a messages to the user to warn him about the new upcoming event he signed for
 */
setInterval(async () => {
    await eventReminderWarning(Bot);
}, 1000 * 60);

/* Authenticate the bot on discord servers by private token */
Bot.login(config.auth.token).catch();
