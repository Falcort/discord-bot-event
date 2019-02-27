import * as Discord from "discord.js";
import { Config } from "./config";
import {clean, help, test} from "./functions";
import CalendarEvent from "./CalendarEvent";

const config: Config = require("./config.json");

/* Initialisation of the Bot */

const Bot = new Discord.Client();

/* On bot start */
Bot.on('ready', () => {
    console.log(`========== Bot connected to server ==========`);
    console.log(`Connected as : ${Bot.user.tag} - (${Bot.user.id})`);
    // clean(Bot, 0);
});

/* On event message */
Bot.on('message', message => {
    if(message.channel.id === config.config.chanID) {

        if(message.content.substring(0,2) === config.config.prefix) {

            const clientMessage = message.content.substring(2); // Remove of the suffix of the command

            let command = clientMessage.split(" ")[0]; // The command

            let argOne = clientMessage.split(" ")[1]; // First argument
            let argTwo = clientMessage.split(" ")[2]; // Second arg
            let argTree = clientMessage.split(" ")[3]; // Third and last arg

            // This for will conbine all args after the 3rd into one
            for(let i=3; i<clientMessage.split(" ").length; i++) {
                argTree = `${argTree} ${clientMessage.split(" ")[i]}`;
            }

            switch (command) {

                case "help":
                    sendMessageByBot(help(), message.author);
                    break;

                case "version":
                    sendMessageByBot(`version : ${config.application.version} - author: ${config.application.author}`, message.channel);
                    break;

                case "test":
                    test(message.author.id);
                    sendMessageByBot(CalendarEvent.listAllEvents(), message.channel);
                    break;

                case "joinOpé":
                    sendMessageByBot(CalendarEvent.addParticipant(argOne, message.author.username, message.author.id), message.channel);
                    break;

                case "leaveOpé":
                    sendMessageByBot(CalendarEvent.removeParticipant(message.author.username, message.author.id, argOne), message.channel);
                    break;

                case "clean":
                    clean(Bot, message.channel);
                    break;

                case "listOpé":
                    sendMessageByBot(CalendarEvent.listAllEvents(), message.channel);
                    break;
            }

        }

    }
});



function sendMessageByBot(message: string, where: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel | Discord.User){
    if(message.length > 0 || message === undefined) {
        where.send(message);
    }
}

Bot.login(config.auth.token);
