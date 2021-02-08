import {
  Client, Message, MessageReaction, User,
} from 'discord.js';
import Logger from '@/services/logger.service';
import AxiosService from '@/services/axios.service';
import { getLangFromMessage } from '@/services/bot.service';
import DBEService from '@/services/dbe.service';

const Bot = new Client();
Bot.login(process.env.DISCORD_TOKEN).catch();
DBEService.setBot(Bot);

/**
 * When the bot is initialised
 */
Bot.on('ready', async () => {
  // Get the server configs on boot
  DBEService.setServerConfigs(await AxiosService.getServerConfigs());

  // Cache of the relevant events to be able to watch reactions
  await DBEService.cacheEvents();

  Logger.info('=============================================');
  Logger.info('========== Bot connected to server ==========');
  Logger.info('=============================================');
  Logger.info(`Connected as : ${Bot.user.tag} - (${Bot.user.id})`);
});

/**
 * When there is a new message on one of the server which the bot is connected at
 */
Bot.on('message', async (message: Message) => {
  if (message.content.startsWith(`<@!${Bot.user.id}>`)) {
    // Message without the bot tag
    const messageWithoutTag = message.content.replace(`<@!${Bot.user.id}> `, '');
    // This is an init message
    if (messageWithoutTag.startsWith('init')) {
      await DBEService.initCommand(message, messageWithoutTag);
    }

    if (message.channel.type === 'text') {
      // This should be in an initialised server
      const lang = getLangFromMessage(DBEService.getServerConfigs(), message);
      if (lang) {
        // Command new event
        if (messageWithoutTag.startsWith('new')) {
          await DBEService.newCommand(message, messageWithoutTag, lang);
        }
      }
    }
  }
});

/**
 * When a reaction is added on a message
 */
Bot.on('messageReactionAdd', async (reaction: MessageReaction, user: User) => {
  Logger.debug('REACTION ADDED');
  if (reaction.message.channel.type === 'text') {
    // This should be in an initialised server
    const lang = getLangFromMessage(DBEService.getServerConfigs(), reaction.message);
    if (lang) {
      await DBEService.editParticipants(reaction, lang, user, true);
    }
  }
});

/**
 * When a reaction is removed from a server
 */
Bot.on('messageReactionRemove', async (reaction: MessageReaction, user: User) => {
  Logger.debug('REACTION REMOVED');
  if (reaction.message.channel.type === 'text') {
    // This should be in an initialised server
    const lang = getLangFromMessage(DBEService.getServerConfigs(), reaction.message);
    if (lang) {
      await DBEService.editParticipants(reaction, lang, user, false);
    }
  }
});

// TODO: remove . on end of title
// new 07/02/2022 21:00 "Event XenoThreat" "Exploration et decouverte de l'event XenoThreat" https://digistatement.com/wp-content/uploads/2021/01/A13B32A3-DC4D-43F1-A7F4-E8097571641A.png
