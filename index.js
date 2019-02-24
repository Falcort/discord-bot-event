const discord = require('discord.io');
const config = require('./config.json');

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
 * TODO: Verify inputs
 * TODO: Add users that participate to the event
 */
function addEvent(args, userName) {

    let day = args[0].split("/")[0];
    let month = args[0].split("/")[1];
    let year = args[0].split("/")[2];

    let hour = args[1].split(":")[0];
    let minutes = args[1].split(":")[1];

    let event = {// Creation of event JSON Object
        id: events.length+1,
        name: args[2],
        date: new Date(year, month, day, hour, minutes),
        description: args[3]
    };

    events.push(event); // Push of that object on the event array

    bot.sendMessage({ // Send confirmation message
        to: config.chanID,
        message: `Event crée, merci de ta participation ${userName} !`
    });

}

/**
 * List all the events that are registered in the event array
 * TODO: List the users that have signed up for the event
 */
function listEvents() {

    bot.sendMessage({
        to: config.chanID,
        message: `Voici la liste des events actuellement enregistré :`
    });

    setTimeout(() => {
        events.forEach((event) => {
            bot.sendMessage({
                to: config.chanID,
                message: `**${event.id}** (*${event.date.getUTCDay()}/${event.date.getUTCMonth()}/${event.date.getFullYear()} ${event.date.getHours()}:${event.date.getMinutes()}*) **${event.name}** - ${event.description}`
            });
        })
    }, 250);
}

