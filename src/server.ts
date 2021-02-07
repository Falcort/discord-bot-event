import { Client, Message, MessageReaction } from 'discord.js';
import Logger from '@/services/logger.service';
import {
  createEvent, createServerConfig, getServerConfigs, updateServerConfig,
} from '@/services/axios.service';
import { DateTime } from 'luxon';

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
    const messageWithoutTag = message.content.replace(`<@!${Bot.user.id}> `, '');

    // This is an init message
    if (messageWithoutTag.startsWith('init')) {
      // The message com from a channel and not a DM
      if (message.channel.type === 'text') {
        // Lang of the init
        const lang = messageWithoutTag.replace('init ', '');

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
        }
      } else {
        Logger.error('BAD CHANNEL TYPE INT INIT');
      }
    }

    if (messageWithoutTag.startsWith('new')) {
      const messageWithoutCommand = messageWithoutTag.substring(4, messageWithoutTag.length);
      const regex = messageWithoutCommand.match(/(\d{2}\/\d{2}\/\d{4})\s(\d{2}:\d{2})\s"(.*)"\s"(.*)"/);
      if (regex.length === 5) {
        const date = regex[1];
        const time = regex[2];
        const name = regex[3];
        const description = regex[4];

        const luxonDate = DateTime.fromFormat(`${date} ${time}`, 'dd/MM/yyyy HH:mm').toISO();

        const messageWithNoParameters = messageWithoutCommand.replace(`${date} ${time} "${name}" "${description}"`, '');

        await createEvent(luxonDate, name, description);
      }
    }
  }
});

Bot.on('messageReactionAdd', async (message: MessageReaction) => {
  // TODO
});

Bot.on('messageReactionRemove', async (message: MessageReaction) => {
  // TODO
});
