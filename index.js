const discord = require('discord.io');
const config = require('./config.json');

/* Initialisation of the Bot */
let bot = new discord.Client({
    token: config.token,
    autorun: true
});

/* On bot start */
bot.on('ready', (event) => {
   console.log(`========== Bot connected to server ==========`);
   console.log(`Connected as : ${bot.username} - (${bot.id})`);
});

/* On event message */
bot.on('message', (userName, userID, channelID, message, event) => {
    if(channelID === config.chanID) {
        console.log(message);
        if(message.substring(0,2) === "--") {
            console.log(message);
            bot.sendMessage({
                to: config.chanID,
                message: `Bonjour ${userName}, heureux de te recontrer`
            });
        }
    }
});
