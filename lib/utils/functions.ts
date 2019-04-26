import * as Discord from 'discord.js';

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
