import * as discord from "discord.io";
import { Config } from "./config";
import {help, test} from "./functions";
import CalendarEvent from "./CalendarEvent";

const config: Config = require("./config.json");

/* Initialisation of the Bot */
let Bot = new discord.Client({
    token: config.auth.token,
    autorun: true
});

/* On bot start */
Bot.on('ready', () => {
    console.log(`========== Bot connected to server ==========`);
    console.log(`Connected as : ${Bot.username} - (${Bot.id})`);
});

/* On event message */
Bot.on('message', (userName, userID, channelID, message) => {

    if(channelID === config.config.chanID) { // On the good channel

        if(message.substring(0,2) === config.config.prefix) { // Is a bot command

            message = message.substring(2); // Remove of the suffix of the command

            let command = message.split(" ")[0]; // The command

            let argOne = message.split(" ")[1]; // First argument
            let argTwo = message.split(" ")[2]; // Second arg
            let argTree = message.split(" ")[3]; // Third and last arg

            // This for will conbine all args after the 3rd into one
            for(let i=3; i<message.split(" ").length; i++) {
                argTree = `${argTree} ${message.split(" ")[i]}`;
            }

            /* What command has been used */
            switch (command) {

                case "help":
                    sendMessageByBotToSomeone(help(), userID);
                    break;

                case "version":
                    sendMessageByBotToSomeone(`version : ${config.application.version} - author: ${config.application.author}`, config.config.chanID);
                    break;

                case "test":
                    test(userID);
                    break;

                case "joinOpé":
                    sendMessageByBotToSomeone(CalendarEvent.addParticipant(argOne, userName, userID), config.config.chanID);
                    break;

                case "listOpé":
                    sendMessageByBotToSomeone(CalendarEvent.listAllEvents(), config.config.chanID);
                    break
            }

        }
    }

});

function sendMessageByBotToSomeone(message: string, where: string) {
    if(message.length > 0 || message === undefined) {
        Bot.sendMessage({
            to: where,
            message: message
        });
    }
}
