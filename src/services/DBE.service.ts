import Logger from '@/services/Logger.service';
import { MessagesService, MessagesServiceClass } from '@/services/Messages.service';
import enEN from '@/i18n/enEN.i18n';
import { Message, MessageReaction, User } from 'discord.js';
import { EmbedTextInterface } from '@/interfaces/i18n.interface';
import { DateTime } from 'luxon';
import { GlobalsService, GlobalsServiceClass } from '@/services/Globals.service';
import { EventsService } from '@/services/Events.service';
import { ServerConfigsService } from '@/services/ServerConfigs.service';

class DBEService {
  private readonly GLOBALS: GlobalsServiceClass;

  constructor() {
    this.GLOBALS = GlobalsService.getInstance();
  }

  /**
   * Function to cache all the relevant events and sync the events states
   */
  public async initDBE() {
    Logger.info('=========================== DBE initialisation ============================');
    Logger.info('========================= Initialisation task 1/2 =========================');
    await this.cacheReactions();
    Logger.info('========================= Initialisation task 2/2 =========================');
    await this.synchroniseParticipants();
    Logger.info('====================== DBE initialisation completed =======================');
  }

  private async cacheReactions() {
    Logger.info('DBE is caching the reactions');
    const events = await EventsService.getEvents();
    for (let i = 0; i < events.length; i += 1) {
      Logger.info(`Fetching event ${events[i].id} (${i + 1}/${events.length})`);
      // eslint-disable-next-line no-await-in-loop
      const channel = await this.GLOBALS.DBE.channels.fetch(events[i].channelID, true);
      if (channel.isText()) {
        // eslint-disable-next-line no-await-in-loop
        const message = await channel.messages.fetch(events[i].messageID, true);
        // eslint-disable-next-line no-await-in-loop
        await message.reactions.resolve(this.GLOBALS.REACTION_EMOJI).users.fetch();
      }
    }
    Logger.info('All reactions cached');
  }

  private async synchroniseParticipants() {
    Logger.info('DBE is synchronising the events participants');
    const events = await EventsService.getEvents();
    for (let i = 0; i < events.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const channel = await this.GLOBALS.DBE.channels.fetch(events[i].channelID, true);
      if (channel.isText()) {
        // eslint-disable-next-line no-await-in-loop
        const message = await channel.messages.fetch(events[i].messageID, true);
        // eslint-disable-next-line no-await-in-loop
        const users = await message.reactions.resolve(this.GLOBALS.REACTION_EMOJI).users.fetch();

        // Update the embed if there was change while bot was down
        const usersArray = [];
        users.forEach((entry) => {
          if (entry.id !== this.GLOBALS.DBE.user.id) {
            usersArray.push(entry.id);
          }
        });
        if (JSON.stringify(usersArray.sort()) !== JSON.stringify(events[i].participants.sort())) {
          Logger.info(`DBE is synchronising the event ${events[i].id}`);
          // Patch the event in the backend
          // eslint-disable-next-line no-await-in-loop
          await EventsService.putEventParticipants(usersArray, events[i].id);
          // TODO: Verify it is working
          let lang = '';
          this.GLOBALS.SERVER_CONFIGS.forEach(((value) => {
            if (value.serverID === events[i].serverID) {
              lang = value.lang;
            }
          }));

          const embed = MessagesService.generateEventEmbed(
            lang,
            message,
            events[i].title,
            events[i].description,
            DateTime.fromISO(events[i].date).toFormat('dd/MM/yyyy'),
            DateTime.fromISO(events[i].date).toFormat('HH:mm'),
            usersArray,
            events[i].image,
          );

          // Edit the message with the new content
          // eslint-disable-next-line no-await-in-loop
          await message.edit({ embed });
        }
      }
    }
    Logger.info('DBE has synchronised the events participants');
  }

  /**
   * Init command function
   *
   * @param message
   * @param messageWithoutTag
   */
  public async initCommand(message: Message, messageWithoutTag: string) {
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
        for (let i = 0; i < this.GLOBALS.SERVER_CONFIGS.size; i += 1) {
          if (this.GLOBALS.SERVER_CONFIGS[i].serverID === serverID) {
            alreadyRegistered = this.GLOBALS.SERVER_CONFIGS[i].id;
            break;
          }
        }

        let embed;
        // There is a server config so update it
        if (alreadyRegistered) {
          // Error while patching the server config into the backend
          if (!await ServerConfigsService.putServerConfig(alreadyRegistered, channelID, lang)) {
            Logger.error('UPDATE OF INIT FAILED');
            embed = MessagesService.generateEmbed(enEN, enEN.system.unknownError, this.GLOBALS.DBE.user, 'error', 'error');
          } else {
            // Update success
            Logger.info(`Server config updated for server ${serverID} on channel ${channelID} with lang ${lang}`);
            embed = MessagesService.generateEmbed(this.GLOBALS.I18N.get(lang), this.GLOBALS.I18N.get(lang).init.update, this.GLOBALS.DBE.user, 'success', 'success');
          }
        } else { // There is no server config so create it
          // Error while creating the server config in the backend
          // eslint-disable-next-line no-lonely-if
          if (!await ServerConfigsService.postServerConfig(serverID, channelID, lang)) {
            Logger.error('UPDATE OF INIT FAILED');
            embed = MessagesService.generateEmbed(enEN, enEN.system.unknownError, this.GLOBALS.DBE.user, 'error', 'error');
          } else {
            // Creation success
            Logger.info(`Server config created for server ${serverID} on channel ${channelID} with lang ${lang}`);
            embed = MessagesService.generateEmbed(this.GLOBALS.I18N.get(lang), this.GLOBALS.I18N.get(lang).init.create, this.GLOBALS.DBE.user, 'success', 'success');
          }
        }
        // Send the error or success message
        MessagesServiceClass.sendMessageByBot(embed, message.author).catch();

        // Refresh the server configs
        this.GLOBALS.setServerConfigs(await ServerConfigsService.getServerConfigs());
      } else {
        // The command language is not supported
        Logger.error('BAD LANGUAGE INT INIT COMMAND');
        const embed = MessagesService.generateEmbed(enEN, enEN.init.errors.badLang, this.GLOBALS.DBE.user, 'error', 'error');
        MessagesServiceClass.sendMessageByBot(embed, message.author).catch();
      }
    } else {
      // The command has been sent in a DM channel
      Logger.error('BAD CHANNEL TYPE INT INIT');
      const embed = MessagesService.generateEmbed(enEN, enEN.init.errors.badChannelType, this.GLOBALS.DBE.user, 'error', 'error');
      MessagesServiceClass.sendMessageByBot(embed, message.author).catch();
    }
    // Delete the initial message to keep the channel clean
    message.delete().catch();
  }

  /**
   * Function to creat new events
   *
   * @param message -- The initial message
   * @param messageWithoutTag -- The command without the bot tag
   * @param lang -- The lang of the server
   */
  public async newCommand(message: Message, messageWithoutTag: string, lang: string) {
    let embed;
    const messageWithoutCommand = messageWithoutTag.substring(4, messageWithoutTag.length);
    // Match the command regex
    const regex = messageWithoutCommand.match(/(\d{2}\/\d{2}\/\d{4})\s(\d{2}:\d{2})\s"(.*)"\s"(.*)"/);
    // If all arguments are correct
    if (regex && regex.length === 5) {
      const date = regex[1];
      const time = regex[2];

      // Create the luxon date from time and date
      const luxonDate = DateTime.fromFormat(`${date} ${time}`, 'dd/MM/yyyy HH:mm');

      // If the new project is in the pact reject
      if (luxonDate.diffNow().milliseconds <= 0) {
        embed = MessagesService.generateEmbed(this.GLOBALS.I18N.get(lang), this.GLOBALS.I18N.get(lang).new.errors.past, message.author, 'error', 'error');
        MessagesServiceClass.sendMessageByBot(embed, message.author).catch();
      } else {
        // Create event

        // Replace everything in the command to test the image
        const messageWithNoParameters = messageWithoutCommand.replace(`${date} ${time} "${regex[3]}" "${regex[4]}"`, '');
        embed = MessagesService.generateEventEmbed(
          lang,
          message,
          regex[3],
          regex[4],
          date,
          time,
          [],
          messageWithNoParameters.replace(' ', ''),
        );
        // Send the bot before the message to get the message ID
        const botMessage = await MessagesServiceClass.sendMessageByBot(embed, message.channel);

        // Post the message
        await EventsService.postEvent(
          luxonDate.toISO(),
          { title: regex[3], description: regex[4] } as EmbedTextInterface,
          botMessage,
          messageWithNoParameters,
        );
        // TODO: What happen if the backend insertion failed

        // Add the basic reaction for participation
        await botMessage.react(this.GLOBALS.REACTION_EMOJI);
      }
    } else {
      // Error the regex is not matched
      embed = MessagesService.generateEmbed(this.GLOBALS.I18N.get(lang), this.GLOBALS.I18N.get(lang).new.errors.badRegex, message.author, 'error', 'error');
      MessagesServiceClass.sendMessageByBot(embed, message.author).catch();
    }
    // Delete the message to keep the channel clean
    message.delete().catch();
  }

  /**
   * Function to event the participants of an event
   *
   * @param reaction -- The reaction message
   * @param lang -- The lang of the server
   * @param user -- The user who reacted
   * @param add -- If it is adding or removing a participant
   */
  public async editParticipants(reaction: MessageReaction, lang: string, user: User, add: boolean) {
    // If the reaction if produced by someone else than the bot
    // AND that the initial message has been sent by the bot
    if (user.id !== this.GLOBALS.DBE.user.id
      && reaction.message.author.id === this.GLOBALS.DBE.user.id) {
      // If the reaction is using the correct emoji
      if (reaction.emoji.name === this.GLOBALS.REACTION_EMOJI) {
        // Get the event
        const event = await EventsService.getEventFromMessageID(reaction.message.id);

        // Add or remove a participant
        if (add) {
          event.participants.push(user.id);
        } else {
          const index = event.participants.indexOf(user.id);
          event.participants.splice(index, 1);
        }

        // Remove doubles
        event.participants = [...new Set(event.participants)];

        // Patch the event in the backend
        await EventsService.putEventParticipants(event.participants, event.id);
        // TODO: Verify it is working

        const embed = MessagesService.generateEventEmbed(
          lang,
          reaction.message,
          event.title,
          event.description,
          DateTime.fromISO(event.date).toFormat('dd/MM/yyyy'),
          DateTime.fromISO(event.date).toFormat('HH:mm'),
          event.participants,
          event.image,
        );

        // Edit the message with the new content
        await reaction.message.edit({ embed });
      }
    }
  }
}
export default new DBEService();
