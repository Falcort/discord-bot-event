
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


                case "clean":
                    clean();
                    break;



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
            eventString += `        - ${getUsernmeByID(player)}\n`;
        });
        eventString += `\n`;
        responce += eventString;
    });

    bot.sendMessage({
        to: config.chanID,
        message: responce
    });
}

function getUsernmeByID(userID) {
    let result = "Clithorine";
    for(let user in bot.users) {
        if(user === userID) {
            result = bot.users[user].username;
        }
    }
    return result
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

function clean() {
    bot.getMessages({channelID: config.chanID, limit: 100}, (error, messages) => {
        let i = 0;
        messages.forEach((message) => {
            i++;
            bot.deleteMessage({channelID: config.chanID, messageID: message.id});
        });
        bot.sendMessage({ // Send confirmation message
            to: config.chanID,
            message: `${i} messages supprimés`
        }, (error, message) => {
            setTimeout(() => {
                bot.deleteMessage({channelID: config.chanID, messageID: message.id});
            }, 2000);
        });
        listEvents();
    });
}

timeShifter();
function timeShifter() {
    setTimeout(() => {
        clean();
        timeShifter();
    },1000*60*60);
}
