//TODO: Supprimé les event déja passé
//TODO: Supprimé les messages du bot

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

            //TODO: crash ici
            let args = message.substring(2).split(" "); // Arguments of the command
            let command = args[0]; // The command
            args = args.slice(1, args.length); // Removing the command from the argument list

            for(let i=3; i<args.length; i++) {
                args[3] = `${args[3]} ${args[i]}`;
            }

            switch (command) {

                case "addOpé":
                    addEvent(args, userID);
                    break;

                case "listOpé":
                    listEvents();
                    break;

                case "joinOpé":
                    joinEvent(args[0], userID);
                    break;

                case "leaveOpé":
                    leaveEvent(args[0], userID);
                    break;

                case "help":
                    help(userID);
                    break;

                case "clean":
                    clean();
                    break;

                case "version":
                    bot.sendMessage({
                        to: config.chanID,
                        message: `version : ${config.version} - author: ${config.author}`
                    });
                    break;

                case "#nohomo":
                    bot.sendMessage({
                        to: config.chanID,
                        message: `Tkt fraté`
                    });
                    break;

                case "test":

                    if(userID.toString() === config.admin.toString()) {
                        test();
                    } else {
                        bot.sendMessage({
                            to: config.chanID,
                            message: `Bien essayé petit con, mais cette commande est réservée aux administrateurs`
                        });
                    }
                    break;

                default: // Command is unknown then return sorry message
                    bot.sendMessage({
                        to: config.chanID,
                        message: `Désolé <@${userID}> mais je ne connais pas cette commande`
                    });
                    break;
            }
        }
    }
});

/**
 * This function creat an event
 * @param args -- the arguments of the command sended by the user
 * @param userID -- the username of the user who sended the command
 */
function addEvent(args, userID) {


    //TODO: vérifié la date
    let day = args[0].split("/")[0];
    let month = args[0].split("/")[1];
    let year = args[0].split("/")[2];

    let hour = args[1].split(":")[0];
    let minutes = args[1].split(":")[1];

    // Verification of arguments
    if(day === undefined || month === undefined || year === undefined || hour === undefined || minutes === undefined || args[2] === undefined || args[3] === undefined) {

        bot.sendMessage({ // Send confirmation message
            to: config.chanID,
            message: `Erreur : commande incorrecte...`
        });

    } else {

        let event = {// Creation of event JSON Object
            id: events.length+1,
            name: args[2],
            date: moment(`${day}/${month}/${year} ${hour}:${minutes}`, `DD/MM/YYYY HH/mm`),
            description: args[3],
            players: [
                userID
            ]

        };
        events.push(event); // Push of that object on the event array
        bot.sendMessage({ // Send confirmation message
            to: config.chanID,
            message: `Opération (ID: ${event.id}) créée avec succès, merci de ta participation <@${userID}> !`
        });
    }

}

/**
 * List all the events that are registered in the event array
 */
function listEvents() {
    let responce = `Voici la liste des opérations en cours :\n\n`;
    events.forEach((event) => {
        let eventString = `**${event.id}**`; // ID of the event
        eventString += ` ( *${event.date.format(`DD/MM/YYYY HH:mm`)}* )`;
        eventString += ` ${event.name} - ${event.description} \n`; //Name and description of the event
        eventString += `    Participants :\n`;
        event.players.forEach((player) => { // Add the name of each players
            eventString += `        - <@${player}>\n`;
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
 * @param userID -- the username of the player
 */
function joinEvent(eventID, userID) {
    let choosenEvent = undefined;
    events.forEach((event) => {
        if(event.id.toString() === eventID.toString()) {
            choosenEvent = event;
        }
    });

    if(choosenEvent !== undefined) {

        let choosenPlayer = undefined;

        choosenEvent.players.forEach((player) => {
            if(player.toString() === userID) {
                choosenPlayer = player;
            }
        });

        if(choosenPlayer !== undefined) {
            bot.sendMessage({ // Send confirmation message
                to: config.chanID,
                message: `<@${userID}> tu participes déjà à l'opération : ${choosenEvent.name}`
            });
        } else {
            choosenEvent.players.push(userID);
            bot.sendMessage({ // Send confirmation message
                to: config.chanID,
                message: `<@${userID}> merci pour ta participation à l'opération : ${choosenEvent.name} le ${choosenEvent.date.format(`DD/MM/YYYY HH:mm`)}`
            });
        }

    } else {
        bot.sendMessage({ // Send confirmation message
            to: config.chanID,
            message: `Aucune opération ne correspond à l'id : ${eventID}`
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
                message: `<@${userName}> tu ne participes plus à l'opération : ${choosenEvent.name} du ${choosenEvent.date.format(`DD/MM/YYYY HH:mm`)}`
            });
        } else {
            bot.sendMessage({ // Send confirmation message
                to: config.chanID,
                message: `<@${userName}> tu ne participes pas à l'opération : ${choosenEvent.name} du ${choosenEvent.date.format(`DD/MM/YYYY HH:mm`)}`
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
function help(userID) {
    let response = "";
    response += "**Créer une opération** : --addOpé DD/MM/YYYY HH:mm Nom Description\n";
    response += "**Lister les opérations** : --listOpé\n";
    response += "**Rejoindre une opération** : --joinOpé ID\n";
    response += "**Quitter une opération** : --leaveOpé ID";

    bot.sendMessage({ // Send confirmation message
        to: userID,
        message: response
    });
}

function clean() {
    bot.getMessages({channelID: config.chanID, limit: 100}, (error, messages) => {
        let i = 0;
        messages.forEach((message) => {
            if(message.content.substring(0,2) === "--" || message.author.id === bot.id ) {
                i++;
                bot.deleteMessage({channelID: config.chanID, messageID: message.id});
            }

        });
        bot.sendMessage({ // Send confirmation message
            to: config.chanID,
            message: `${i} messages supprimés`
        }, (error, message) => {
            setTimeout(() => {
                bot.deleteMessage({channelID: config.chanID, messageID: message.id});
            }, 2000);
        });
    });
}

/**
 * Test function that create test events en test all functionnalities
 * TODO: only admin can use this command
 */
function test() {
    events.push({
        id: 1,
        name: "Anniversaire 1f3rn0",
        date: moment(`13/03/2019 22:00`, `DD/MM/YYYY HH/mm`),
        description: "Le jour du célèbre, charismatique, beau et du grand <@127093870784675840> !!!!!",
        players: [
            "127085518579040257"
        ]
    });

    events.push({
        id: 2,
        name: "Anniversaire HarpeDenier",
        date: moment(`22/03/2019 22:00`, `DD/MM/YYYY HH/mm`),
        description: "L'anniversaire du plus beau, que dis-je, du plus extraordinaire des êtres humains qui nous fait tous les jours, l'honneur de sa présence. Juste un mot : merci !",
        players: [
            "127085518579040257",
            "127551605267628032"
        ]
    });

    events.push({
        id: 3,
        name: "Event3",
        date: moment(`12/03/2019 22:00`, `DD/MM/YYYY HH/mm`),
        description: "This is a test event",
        players: [
            "127085518579040257",
            "127551605267628032",
            "294348098917105664",
            "281074835583664131",
            "365949453300924419",
            "127093870784675840"
        ]
    });

    listEvents();
}

