import {
  Client, Message, MessageReaction, User,
} from 'discord.js';
import Logger from '@/services/Logger.service';
import { MessagesService } from '@/services/Messages.service';
import DBEService from '@/services/DBE.service';
import { GlobalsService } from '@/services/Globals.service';

const Bot = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const GLOBALS = GlobalsService.getInstance();
GLOBALS.setDBE(Bot);

/**
 * When the bot is initialised
 */
Bot.on('ready', async () => {
  // Cache of the relevant events to be able to watch reactions
  await DBEService.initDBE();
  Logger.info(`====== DBE is connected as ${Bot.user.tag} - (${Bot.user.id}) ====`);
});

/**
 * When there is a new message on one of the server which the bot is connected at
 */
Bot.on('message', async (message: Message) => {
  const lang = MessagesService.getLangFromMessage(message);
  if (message.content.startsWith(`<@!${Bot.user.id}>`)) {
    // Message without the bot tag
    const messageWithoutTag = message.content.replace(`<@!${Bot.user.id}> `, '');
    // This is an init message
    if (messageWithoutTag.startsWith('init')) {
      await DBEService.initCommand(message, messageWithoutTag);
    }

    if (message.channel.type === 'text') {
      // This should be in an initialised server
      if (lang) {
        // Command new event
        if (messageWithoutTag.startsWith('new')) {
          await DBEService.newCommand(message, messageWithoutTag, lang);
        }
      }
    }
  } else if (lang) {
    await message.delete();
  }
});

/**
 * When a reaction is added on a message
 */
Bot.on('messageReactionAdd', async (reaction: MessageReaction, user: User) => {
  if (reaction.message.channel.type === 'text') {
    // This should be in an initialised server
    const lang = MessagesService.getLangFromMessage(reaction.message);
    if (lang) {
      await DBEService.editParticipants(reaction, lang, user, true);
    }
  }
});

/**
 * When a reaction is removed from a server
 */
Bot.on('messageReactionRemove', async (reaction: MessageReaction, user: User) => {
  if (reaction.message.channel.type === 'text') {
    // This should be in an initialised server
    const lang = MessagesService.getLangFromMessage(reaction.message);
    if (lang) {
      await DBEService.editParticipants(reaction, lang, user, false);
    }
  }
});

Bot.login(process.env.DISCORD_TOKEN).catch();

// new 07/02/2022 21:00 "Event XenoThreat" "Exploration et decouverte de l'event XenoThreat" https://digistatement.com/wp-content/uploads/2021/01/A13B32A3-DC4D-43F1-A7F4-E8097571641A.png
