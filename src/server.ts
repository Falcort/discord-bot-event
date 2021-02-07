import {
  Client, Message, MessageReaction, User,
} from 'discord.js';
import Logger from '@/services/logger.service';
import { getServerConfigs } from '@/services/axios.service';
import { getLangFromMessage } from '@/services/bot.service';
import DbeService from '@/services/dbe.service';

const Bot = new Client();
Bot.login(process.env.DISCORD_TOKEN).catch();
DbeService.setBot(Bot);

Bot.on('ready', async () => {
  DbeService.setServerConfigs(await getServerConfigs());
  Logger.info('=============================================');
  Logger.info('========== Bot connected to server ==========');
  Logger.info('=============================================');
  Logger.info(`Connected as : ${Bot.user.tag} - (${Bot.user.id})`);
  DbeService.fetchEvents();
});

Bot.on('message', async (message: Message) => {
  if (message.content.startsWith(`<@!${Bot.user.id}>`)) {
    // Message without the bot tag
    const messageWithoutTag = message.content.replace(`<@!${Bot.user.id}> `, '');
    // This is an init message
    if (messageWithoutTag.startsWith('init')) {
      await DbeService.init(message, messageWithoutTag);
    }

    if (message.channel.type === 'text') {
      // This should be in an initialised server
      const lang = getLangFromMessage(DbeService.getServerConfigs(), message);
      if (lang) {
        // Command new event
        if (messageWithoutTag.startsWith('new')) {
          await DbeService.new(message, messageWithoutTag, lang);
        }
      }
    }
  }
});

Bot.on('messageReactionAdd', (reaction: MessageReaction, user: User) => {
  if (reaction.message.channel.type === 'text') {
    // This should be in an initialised server
    const lang = getLangFromMessage(DbeService.getServerConfigs(), reaction.message);
    if (lang) {
      DbeService.editParticipants(reaction, lang, user, true);
    }
  }
});

Bot.on('messageReactionRemove', async (reaction: MessageReaction, user: User) => {
  if (reaction.message.channel.type === 'text') {
    // This should be in an initialised server
    const lang = getLangFromMessage(DbeService.getServerConfigs(), reaction.message);
    if (lang) {
      DbeService.editParticipants(reaction, lang, user, false);
    }
  }
});

// TODO: remove . on end of title
// new 07/02/2021 21:00 "Event XenoThreat" "Exploration et decouverte de l'event XenoThreat" https://digistatement.com/wp-content/uploads/2021/01/A13B32A3-DC4D-43F1-A7F4-E8097571641A.png
