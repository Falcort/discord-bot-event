import * as Discord from 'discord.js';
import {Config} from "../interfaces/config";
const config: Config = require('../../config.json');

/**
 * Function that send all commands to the user
 * @return string -- The message to send with all commandes details
 */
export function help(): string {
  let response = '';
  response += '**Créer une opération** : --addOpé DD/MM/YYYY HH:mm Nom Description\n';
  response += '**Lister les opérations** : --listOpé\n';
  response += '**Rejoindre une opération** : --joinOpé ID\n';
  response += '**Quitter une opération** : --leaveOpé ID';
  return response;
}

/**
 * Function that clean the channel
 * This function call itslef while there is still message to delete
 * @param Bot -- The Bot variable
 * @param channel -- The channel that the bot need to clean
 * @param nbRemoved -- The incrementing number of deleted messages
 * @return TODO: TBD
 */
export async function clean(Bot: Discord.Client, channel: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel,
                            nbRemoved: number = 0) {

  const messages = await channel.fetchMessages();
  if (messages.size > 0) {
    const message = messages.first();
    await message.delete();
    nbRemoved++;
    return clean(Bot, channel, nbRemoved);
  } else {
    channel.send(`${nbRemoved} messages supprimées !`).then((message: Discord.Message) => {
      message.delete(2000).catch();
    });
  }
}

/**
 * Function that generate the mongoDB connection string
 * This function take the config parameters, and creat a mongodb connection string depending on the configuration
 * @return string -- MongoDB connection string
 */
export function getMongoDbConnectionString() {
  let uri: string;

  if (process.env.GH_ACTIONS === 'true') { // If environement is GitHub actions, then use simple things
    uri = `mongodb://localhost:27017/${process.env.DB_NAME}`;
  } else { // Else use the application-properties file
    uri = 'mongodb://';

    if(config.db.username && config.db.password) { // If username AND password are set then add them to the string
      uri += `${config.db.username}:${config.db.password}@`;
    }

    uri += `${config.db.address}:${config.db.port}/${config.db.name}`;
  }
  return uri;
}
