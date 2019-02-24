const discord = require('discord.io');
const auth = require('./auth.json');

/* Initialisation of the Bot */
let bot = new discord.Client({
    token: auth.token,
    autorun: true
});

/* On bot start */
bot.on('ready', (event) => {
   console.log(`========== Bot connected to server ==========`);
   console.log(`Connected as : ${bot.username} - (${bot.id})`);
});

/* On event message */
bot.on('message', (user, userID, channelID, message, event) => {
    console.log(user);
    console.log(userID);
    console.log(channelID);
    console.log(message);
    console.log(event);
});
