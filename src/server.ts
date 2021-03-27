import { Client, Message, MessageReaction, User } from 'discord.js';
import Logger from '@/services/Logger.service';
import { MessagesService } from '@/services/Messages.service';
import { DBEService } from '@/services/DBE.service';
import { GlobalsService } from '@/services/Globals.service';
import { DateTime } from 'luxon';

/**
 * Start of the process
 */
const Bot = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const GLOBALS = GlobalsService.getInstance();
GLOBALS.setDBE(Bot);
Bot.login(process.env.DISCORD_TOKEN).catch();

/**
 * Bot events
 */

// When the bot is initialised
Bot.on('ready', async () => {
  Logger.info(
    '=========================== DBE initialisation ============================',
  );
  await GLOBALS.authToStrapi();
  // Init the bot to cache reactions and synchronise participants
  await DBEService.initDBE();
  Logger.info(
    '====================== Deleting past event messages =======================',
  );
  await DBEService.syncEventsMessages();
  Logger.info(
    '====================== DBE initialisation completed =======================',
  );
  Logger.info(
    `====== DBE is connected as ${Bot.user.tag} - (${Bot.user.id}) =====`,
  );

  // Interval function to update token and messages
  setInterval(() => {
    const date = DateTime.local().toFormat('dd/MM/yyyy HH:mm');
    Logger.info(
      `---------------------------- ${date} ---------------------------`,
    );
    GLOBALS.authToStrapi().then(() => {
      DBEService.syncEventsMessages().catch();
    });
  }, 1000 * 60 * 60);
});

// When there is a new message on one of the guil which the bot is connected at
Bot.on('message', async (message: Message) => {
  // If the message is not empty
  if (message.content !== '' && message.channel.type === 'text') {
    // Get the lang and if the guild in initialised
    const lang = MessagesService.getLangFromMessage(message);
    // Is this message a command for the bot
    const isBotCommand = message.content.startsWith(`<@!${Bot.user.id}>`);
    // The command that the user want to execute
    const command = message.content.replace(`<@!${Bot.user.id}> `, '');

    if (isBotCommand && command.startsWith('init')) {
      // Init command
      await DBEService.initCommand(message, command);
      message.delete().catch();
    } else if (lang && isBotCommand) {
      if (command.startsWith('new')) {
        // New command
        await DBEService.newCommand(message, command, lang);
      }
      // Help command
      if (command.startsWith('help')) {
        DBEService.helpCommand(message, lang);
      }
      // Credits command
      if (command.startsWith('credits')) {
        DBEService.creditsCommand(message, lang);
      }
      message.delete().catch();
    } else if (lang) {
      // The message is in a listen channel but is not a bot message
      // So delete it to keep the channel clean
      Logger.info(
        `Message with content "${message.content}" was send on the bot channel and was deleted`,
      );
      message.delete().catch();
    }
  }
});

/**
 * When a reaction is added on a message
 */
Bot.on('messageReactionAdd', async (reaction: MessageReaction, user: User) => {
  if (reaction.message.channel.type === 'text') {
    const lang = MessagesService.getLangFromMessage(reaction.message);
    if (lang) {
      // Listen only reactions in listen channels

      // If the reaction if produced by someone else than the bot
      // AND that the initial message has been sent by the bot
      if (
        user.id !== GLOBALS.DBE.user.id &&
        reaction.message.author.id === GLOBALS.DBE.user.id
      ) {
        // If reaction is the VALID one
        if (reaction.emoji.name === GLOBALS.REACTION_EMOJI_VALID) {
          await DBEService.editParticipants(reaction, lang, user, true);
        }

        // If reaction is the INVALID one
        if (reaction.emoji.name === GLOBALS.REACTION_EMOJI_INVALID) {
          await DBEService.deleteEvent(reaction, user, lang);
        }
      }
    }
  }
});

/**
 * When a reaction is removed from a guild
 */
Bot.on(
  'messageReactionRemove',
  async (reaction: MessageReaction, user: User) => {
    if (reaction.message.channel.type === 'text') {
      const lang = MessagesService.getLangFromMessage(reaction.message);
      if (lang) {
        // Listen only reactions in listen channels
        if (reaction.emoji.name === GLOBALS.REACTION_EMOJI_VALID) {
          await DBEService.editParticipants(reaction, lang, user, false);
        }
      }
    }
  },
);

// new 07/02/2022 21:00 "TEST EVENT" "THIS IS A TEST EVENT THAT NEED TO BE DELETED" https://digistatement.com/wp-content/uploads/2021/01/A13B32A3-DC4D-43F1-A7F4-E8097571641A.png
