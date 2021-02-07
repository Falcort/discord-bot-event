import { Client, Message } from 'discord.js';
import Logger from '@/services/logger.service';
import { createServerConfig, getServerConfigs, updateServerConfig } from '@/services/axios.service';
import { generateEmbed, sendMessageByBot } from '@/services/bot.service';

let serverConfigs = [];

const Bot = new Client();
Bot.login(process.env.DISCORD_TOKEN).catch();

Bot.on('ready', async () => {
  serverConfigs = await getServerConfigs();
  Logger.info('=============================================');
  Logger.info('========== Bot connected to server ==========');
  Logger.info('=============================================');
  Logger.info(`Connected as : ${Bot.user.tag} - (${Bot.user.id})`);
});

Bot.on('message', async (message: Message) => {
  if (message.content.startsWith(`<@!${Bot.user.id}>`)) {
    // Message without the bot tag
    const parsedMessage = message.content.replace(`<@!${Bot.user.id}> `, '');

    // This is an init message
    if (parsedMessage.startsWith('init')) {
      // The message com from a channel and not a DM
      if (message.channel.type === 'text') {
        // Lang of the init
        const lang = parsedMessage.replace('init ', '');

        // Verify that it is in the possibles values
        if (lang === 'frFR' || lang === 'enEN') {
          const channelID = message.channel.id;
          const serverID = message.guild.id;

          // Looking if there is already a server config
          let alreadyRegistered = null;
          for (let i = 0; i < serverConfigs.length; i += 1) {
            if (serverConfigs[i].serverID === serverID) {
              alreadyRegistered = serverConfigs[i].id;
              break;
            }
          }

          if (alreadyRegistered) { // There is a server config so update it
            if (!await updateServerConfig(alreadyRegistered, channelID, lang)) {
              Logger.error('UPDATE OF INIT FAILED');
            } else {
              Logger.info(`Server config updated for server ${serverID} on channel ${channelID} with lang ${lang}`);
            }
          } else { // There is no server config so create it
            // TODO: remove this disable
            // eslint-disable-next-line no-lonely-if
            if (!await createServerConfig(serverID, channelID, lang)) {
              Logger.error('UPDATE OF INIT FAILED');
            } else {
              Logger.info(`Server config created for server ${serverID} on channel ${channelID} with lang ${lang}`);
            }
          }

          // Refresh the server configs
          serverConfigs = await getServerConfigs();
        } else {
          Logger.error('BAD LANGUAGE INT INIT COMMAND');
          const embed = generateEmbed('Error', 'BAD LANG', Bot, 'frFR', Bot, 'error', 'error');
          sendMessageByBot(embed, message.channel);
        }
      } else {
        Logger.error('BAD CHANNEL TYPE INT INIT');
      }
    }
  }
});
