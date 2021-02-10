import Logger from '@/services/Logger.service';
import { MessagesService, MessagesServiceClass } from '@/services/Messages.service';
import enEN from '@/i18n/enEN.i18n';
import { Message, MessageReaction, User } from 'discord.js';
import { EmbedTextInterface } from '@/interfaces/i18n.interface';
import { DateTime } from 'luxon';
import { GlobalsService, GlobalsServiceClass } from '@/services/Globals.service';
import { EventsService } from '@/services/Events.service';
import { ServerConfigsService } from '@/services/ServerConfigs.service';
import ServerConfigInterface from '@/interfaces/server-config.interface';
import EventInterface from '@/interfaces/event.interface';

class DBEService {
  private readonly GLOBALS: GlobalsServiceClass;

  constructor() {
    this.GLOBALS = GlobalsService.getInstance();
  }

  /**
   * Function to cache all the relevant events and sync the events states
   */
  public async initDBE(): Promise<void> {
    Logger.info('=========================== DBE initialisation ============================');
    const events = await EventsService.getEvents();
    await this.cacheAndSynchronise(events);
    Logger.info('====================== DBE initialisation completed =======================');
  }

  /* eslint-disable no-alert, no-await-in-loop */

  /**
   * Function to cache the messages reaction in the Client
   * This is required for the reactionAdd and reactionRemove events
   *
   * @param events -- The lis of events to cache an synch
   * @private
   */
  private async cacheAndSynchronise(events: EventInterface[]): Promise<void> {
    Logger.info('DBE is caching and synchronising');
    for (let i = 0; i < events.length; i += 1) {
      Logger.info(`Fetching event ${events[i].id} (${i + 1}/${events.length})`);

      // Fetch the message channel
      const channel = await this.GLOBALS.DBE.channels.fetch(events[i].channelID, true);

      // If the channel is a TextChannel
      if (channel.isText()) {
        // Get the message from it's ID
        const message = await channel.messages.fetch(events[i].messageID, true);

        // Get the users who reacted to the message
        const users = await message.reactions.resolve(
          this.GLOBALS.REACTION_EMOJI_VALID,
        ).users.fetch();

        // Synchronise the participants
        await this.synchroniseParticipants(events[i], message, users);
      }
    }
    Logger.info('All events cached an synchronised');
  }

  /**
   * Function that synchronise the participants if the bot was down
   *
   * @param event -- The event to synchronise
   * @param message -- The message of the event
   * @param users -- The map of users who reacted to the message
   * @private
   */
  private async synchroniseParticipants(
    event: EventInterface,
    message: Message,
    users: Map<string, User>,
  ): Promise<void> {
    // Transform the user Map into the same format as the DB
    const usersArray = this.formatUsersFormCompare(users);
    // Compare the userArray and the database one
    if (JSON.stringify(usersArray.sort()) !== JSON.stringify(event.participants.sort())) {
      Logger.info(`DBE is synchronising the event ${event.id}`);

      // Patch the event in the backend
      const put = await EventsService.putEventParticipants(usersArray, event.id);
      if (put === null) {
        const embed = MessagesService.generateEmbed(enEN, enEN.system.unknownError, this.GLOBALS.DBE.user, 'error', 'error');
        MessagesServiceClass.sendMessageByBot(embed, message.author).catch();
        return;
      }

      const embed = MessagesService.generateEventEmbed(
        MessagesService.getLangFromMessage(message),
        message,
        event.title,
        event.description,
        DateTime.fromISO(event.date).toFormat('dd/MM/yyyy'),
        DateTime.fromISO(event.date).toFormat('HH:mm'),
        usersArray,
        event.image,
      );

      // Edit the message with the new content
      await message.edit({ embed });
    }
  }

  /* eslint-enable */

  /**
   * Function to creat new events
   *
   * @param message -- The initial message
   * @param command -- The command without the bot tag
   * @param lang -- The lang of the server
   */
  public async newCommand(
    message: Message,
    command: string,
    lang: string,
  ): Promise<void> {
    let embed;
    const args = command.substring(4, command.length);
    // Match the command regex
    const regex = args.match(/(\d{2}\/\d{2}\/\d{4})\s(\d{2}:\d{2})\s"(.*)"\s"(.*)"/);

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
        return;
      }

      // Create event
      // Replace everything in the command to test the image
      const messageWithNoParameters = args.replace(`${date} ${time} "${regex[3]}" "${regex[4]}"`, '');
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
      const post = await EventsService.postEvent(
        luxonDate.toISO(),
        { title: regex[3], description: regex[4] } as EmbedTextInterface,
        botMessage,
        messageWithNoParameters,
      );

      // Verification of the request
      if (post) {
        // Add the basic reaction for participation
        botMessage.react(this.GLOBALS.REACTION_EMOJI_VALID).catch();
        botMessage.react(this.GLOBALS.REACTION_EMOJI_INVALID).catch();
        return;
      }

      // There was an error during the axios request
      // Then delete the message and send an error to the user
      await botMessage.delete();
      embed = MessagesService.generateEmbed(this.GLOBALS.I18N.get(lang), this.GLOBALS.I18N.get(lang).system.unknownError, message.author, 'error', 'error');
      MessagesServiceClass.sendMessageByBot(embed, message.author).catch();
      return;
    }
    // Error the regex is not matched
    embed = MessagesService.generateEmbed(this.GLOBALS.I18N.get(lang), this.GLOBALS.I18N.get(lang).new.errors.badRegex, message.author, 'error', 'error');
    MessagesServiceClass.sendMessageByBot(embed, message.author).catch();
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
    const authorID = reaction.message.author.id;

    // If the reaction if produced by someone else than the bot
    // AND that the initial message has been sent by the bot
    if (user.id !== this.GLOBALS.DBE.user.id && authorID === this.GLOBALS.DBE.user.id) {
      // If the reaction is using the correct emoji
      if (reaction.emoji.name === this.GLOBALS.REACTION_EMOJI_VALID) {
        // Get the event
        const event = await EventsService.getEventFromMessageID(reaction.message.id);
        if (event === null) {
          const embed = MessagesService.generateEmbed(enEN, enEN.system.unknownError, this.GLOBALS.DBE.user, 'error', 'error');
          MessagesServiceClass.sendMessageByBot(embed, user).catch();
          return;
        }

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
        const put = await EventsService.putEventParticipants(event.participants, event.id);
        if (put === null) {
          const embed = MessagesService.generateEmbed(enEN, enEN.system.unknownError, this.GLOBALS.DBE.user, 'error', 'error');
          MessagesServiceClass.sendMessageByBot(embed, user).catch();
          return;
        }

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
