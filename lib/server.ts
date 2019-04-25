import * as Discord from 'discord.js';
import { Config } from './interfaces/config';
import { clean, help } from './utils/functions';
import CalendarEvent from './class/calendar-event';
import * as mongoose from 'mongoose';

const config: Config = require('../config.json');

/* Initialisation of the Bot */
const Bot = new Discord.Client();

/* On bot start */
Bot.on('ready', () => {
    console.log(`========== Bot connected to server ==========`);
    console.log(`Connected as : ${Bot.user.tag} - (${Bot.user.id})`);

    const uri = `mongodb://nodeAdmin:${config.db.password}@${config.db.address}:${config.db.port}/${config.db.name}?authSource=admin`;
    mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true}).then(
        () => {
            return console.log(`Database : Connected`);
        },
        (error) => {
            console.log(`Database : ${error}`);
            return process.exit(-1);
        }
    ); // connection to MongoDB

});

/* On event message */
Bot.on('message', async message => {
    if(message.channel.id === config.config.chanID) {

        if(message.content.substring(0,2) === config.config.prefix) {

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

                case 'test':
                    // test(message.author.id);
                    // sendMessageByBot(CalendarEvent.listAllEvents(), message.channel);
                    break;

                case 'joinOpé':
                    sendMessageByBot(await CalendarEvent.addParticipant(argOne, message.author.username, message.author.id), message.channel);
                    break;

                case 'leaveOpé':
                    sendMessageByBot(await CalendarEvent.removeParticipant(message.author.username, message.author.id, argOne), message.channel);
                    break;

                case 'clean':
                    clean(Bot, message.channel).catch();
                    break;

                case 'listOpé':
                    sendMessageByBot(await CalendarEvent.listAllEvents(), message.channel);
                    break;

                case 'addOpé':
                    sendMessageByBot(await CalendarEvent.validateAndCreatOperation(argOne, argTwo, argTree, argFour, message.guild.id, message.author.username, message.author.id), message.channel);
                    break;
            }

        }

    }
});


/**
 * This function is to send message by the bot
 * @param message -- the string message that the bot need to send
 * @param where -- the channel or user that the bot need to send message to
 * @return TODO: TBD
 */
function sendMessageByBot(message: string, where: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel | Discord.User) {
    if (message.length > 0 && message) {
        where.send(message);
    }
}

/* Authenticate the bot on discord servers by private token */
Bot.login(config.auth.token).catch();

/*
TODO: Databse connection
TODO: Databse persistance
TODO: Auto clean
TODO: Reminders
TODO: Auto clean old mesages
TODO: logger
TODO: Database logs for API
 */
