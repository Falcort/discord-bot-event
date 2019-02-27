
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
                case "test":



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

function clean(Bot: ) {
    Bot.getMessage({}, () => {

    })
}
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
