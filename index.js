//TODO: Reaplce name by @pseudo
//TODO: Supprimé les event déja passé

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

                case "joinEvent":
                    joinEvent(args[0], userName);
                    break;

                case "leaveEvent":
                    leaveEvent(args[0], userName);
                    break;

                case "help":
                    help();
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
            message: `Opération crée, merci de ta participation ${userName} !`
        });
    }

}

/**
 * List all the events that are registered in the event array
 */
function listEvents() {
    let responce = `Voici la liste des opérations actuellement enregistré :\n\n`;
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
 * Make a player join an existing event
 * @param eventID -- the event ID
 * @param userName -- the username of the player
 */
function joinEvent(eventID, userName) {
    let choosenEvent = undefined;
    events.forEach((event) => {
        if(event.id.toString() === eventID.toString()) {
            choosenEvent = event;
        }
    });

    if(choosenEvent !== undefined) {

        let choosenPlayer = undefined;

        choosenEvent.players.forEach((player) => {
            if(player.toString() === userName) {
                choosenPlayer = player;
            }
        });

        if(choosenPlayer !== undefined) {
            bot.sendMessage({ // Send confirmation message
                to: config.chanID,
                message: `${userName} tu participe déja à l'opération : ${choosenEvent.name}`
            });
        } else {
            choosenEvent.players.push(userName);
            bot.sendMessage({ // Send confirmation message
                to: config.chanID,
                message: `${userName} tu participe désormé a l'opération : ${choosenEvent.name} le ${choosenEvent.date.format(`DD/MM/YYY HH:mm`)}`
            });
        }

    } else {
        bot.sendMessage({ // Send confirmation message
            to: config.chanID,
            message: `Aucune opération ne porte l'id : ${eventID}`
        });
    }
}

/**
 * Remove a player from the selected event
 * @param eventID -- The ID of the event
 * @param userName -- The player username
 */
function leaveEvent(eventID, userName) {
    let choosenEvent = undefined;

    events.forEach((event) => {
        if(event.id.toString() === eventID.toString()) {
            choosenEvent = event;
        }
    });

    if(choosenEvent !== undefined) {
        if(choosenEvent.players.indexOf(userName.toString()) > -1) {
            choosenEvent.players.splice(choosenEvent.players.indexOf(userName.toString()), 1);
            bot.sendMessage({ // Send confirmation message
                to: config.chanID,
                message: `${userName} tu ne participe plus à l'opération : ${choosenEvent.name} le ${choosenEvent.date.format(`DD/MM/YYY HH:mm`)}`
            });
        } else {
            bot.sendMessage({ // Send confirmation message
                to: config.chanID,
                message: `${userName} tu ne participe pas à l'opération : ${choosenEvent.name} le ${choosenEvent.date.format(`DD/MM/YYY HH:mm`)}`
            });
        }
    } else {
        bot.sendMessage({ // Send confirmation message
            to: config.chanID,
            message: `Aucune opération ne porte l'id : ${eventID}`
        });
    }
}

/**
 * Function that send all commands to the user
 * TODO: wisp to the user
 */
function help() {
    let response = "";
    response += "**Crée une opération** : --addEvent DD/MM/YYYY HH:mm Nom Description\n";
    response += "**Listez les opérations** : --listEvents\n";
    response += "**Rejoindre une opération** : --joinEvent ID\n";
    response += "**Quitter une opération** : --leaveEvent ID";

    bot.sendMessage({ // Send confirmation message
        to: config.chanID,
        message: response
    });
}

/**
 * Test function that create test events en test all functionnalities
 * TODO: only admin can use this command
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

