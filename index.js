const discord = require('discord.io');
const config = require('./config.json');
const moment = require('moment');

/* Initialisation of the Bot */
let bot = new discord.Client({
    token: config.token,
    autorun: true
});

let events = []; // List of the events


/* On bot start */
bot.on('ready', () => {
   console.log(`========== Bot connected to server ==========`);
   console.log(`Connected as : ${bot.username} - (${bot.id})`);
});

/* On event message */
bot.on('message', (userName, userID, channelID, message) => {

    if(channelID === config.chanID) { // On the good channel

        if(message.substring(0,2) === "--") { // Is a bot command

            let args = message.substring(2).split(" "); // Arguments of the command
            let command = args[0]; // The command
            args = args.slice(1, args.length); // Removing the command from the argument list

            for(let i=3; i<args.length; i++) {
                args[3] = `${args[3]} ${args[i]}`;
            }

            switch (command) {

                case "addEvent":
                    addEvent(args, userName);
                    break;

                case "listEvents":
                    listEvents();
                    break;

                case "test":
                    test();
                    break;

                default: // Command is unknown then return sorry message
                    bot.sendMessage({
                        to: config.chanID,
                        message: `Désolé ${userName}, mais je connais pas cette commande`
                    });
                    break;
            }
        }
    }
});

/**
 * This function creat an event
 * @param args -- the arguments of the command sended by the user
 * @param userName -- the username of the user who sended the command
 * TODO: Add users that participate to the event
 */
function addEvent(args, userName) {

    let day = args[0].split("/")[0];
    let month = args[0].split("/")[1];
    let year = args[0].split("/")[2];

    let hour = args[1].split(":")[0];
    let minutes = args[1].split(":")[1];

    // Verification of arguments
    if(day === undefined || month === undefined || year === undefined || hour === undefined || minutes === undefined || args[2] === undefined || args[3] === undefined) {

        bot.sendMessage({ // Send confirmation message
            to: config.chanID,
            message: `Erreur : commande incorrect...`
        });

    } else {

        let event = {// Creation of event JSON Object
            id: events.length+1,
            name: args[2],
            date: moment(`${day}/${month}/${year} ${hour}:${minutes}`, `DD/MM/YYYY HH/mm`),
            description: args[3],
            players: [
                userName
            ]

        };
        events.push(event); // Push of that object on the event array
        bot.sendMessage({ // Send confirmation message
            to: config.chanID,
            message: `Event crée, merci de ta participation ${userName} !`
        });
    }

}

/**
 * List all the events that are registered in the event array
 * TODO: List the users that have signed up for the event
 */
function listEvents() {
    let responce = `Voici la liste des events actuellement enregistré :\n\n`;
    events.forEach((event) => {
        let eventString = `**${event.id}**`; // ID of the event
        eventString += ` ( *${event.date.format(`DD/MM/YYY HH:mm`)}* )`;
        eventString += ` ${event.name} - ${event.description} \n`; //Name and description of the event
        eventString += `    Participants :\n`;
        event.players.forEach((player) => { // Add the name of each players
            eventString += `        - ${player}\n`;
        });
        eventString += `\n`;
        responce += eventString;
    });

    bot.sendMessage({
        to: config.chanID,
        message: responce
    });
}

/**
 * Test function that create test events en test all functionnalities
 */
function test() {
    events.push({
        id: 1,
        name: "Event1",
        date: moment(`12/03/2019 22:00`, `DD/MM/YYYY HH/mm`),
        description: "This is a test event",
        players: [
            "Falcort"
        ]
    });

    events.push({
        id: 2,
        name: "Event2",
        date: moment(`12/03/2019 22:00`, `DD/MM/YYYY HH/mm`),
        description: "This is a test event",
        players: [
            "Falcort",
            "Dermi"
        ]
    });

    events.push({
        id: 3,
        name: "Event3",
        date: moment(`12/03/2019 22:00`, `DD/MM/YYYY HH/mm`),
        description: "This is a test event",
        players: [
            "Falcort",
            "Dermi",
            "Fea",
            "Orion",
            "Acta",
            "1f3rn0"
        ]
    });

    listEvents();
}

