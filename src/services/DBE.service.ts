import Logger from '@/services/Logger.service';
import { MessagesService, MessagesServiceClass } from '@/services/Messages.service';
import enEN from '@/i18n/enEN.i18n';
import { Message, MessageReaction, User } from 'discord.js';
import { EmbedTextInterface } from '@/interfaces/i18n.interface';
import { DateTime } from 'luxon';
import { GlobalsService, GlobalsServiceClass } from '@/services/Globals.service';
import { EventsService } from '@/services/Events.service';
import { GuildConfigsService } from '@/services/Guild-configs.service';
import GuildConfigInterface from '@/interfaces/guild-config.interface';
import EventInterface from '@/interfaces/event.interface';

const nodePackage = require('../../package.json');

export class DBEServiceClass {
  private readonly GLOBALS: GlobalsServiceClass;

  constructor() {
    this.GLOBALS = GlobalsService.getInstance();
  }

  /**
   * Function to cache all the relevant events and sync the events states
   */
  public async initDBE(): Promise<void> {
    Logger.info('=========================== DBE initialisation ============================');
    Logger.info('========================== Loading guild configs ==========================');
    const guildConfigs = await GuildConfigsService.getGuildConfigs();
    Logger.info(`${guildConfigs.length} Guild configs found`);
    this.GLOBALS.setGuildConfigs(guildConfigs);
    Logger.info('========================== Guild configs loaded ===========================');
    const events = await EventsService.getEvents();
    await this.cacheAndSynchronise(events);
    Logger.info('====================== DBE initialisation completed =======================');
  }

  /**
   * Function that init a guild config
   *
   * @param message -- The message who initiated the config
   * @param command -- The command of the message
   */
  public async initCommand(message: Message, command: string) {
    // Lang of the init
    const i18n = command.replace('init ', '');
    const guild = await this.GLOBALS.DBE.guilds.fetch(message.guild.id);
    const member = await guild.members.fetch(message.author.id);
    let embed;

    // Verification of permissions
    if (member.hasPermission('ADMINISTRATOR')) {
      // Verify that it is in the possibles values
      if (this.GLOBALS.I18N.get(i18n)) {
        const channelID = message.channel.id;
        const guildID = message.guild.id;
        let isRegistered = null;

        // Looking if there is already a guild config
        this.GLOBALS.GUILD_CONFIGS.forEach((value: GuildConfigInterface) => {
          if (value.guild_id === guildID) {
            isRegistered = value.id;
          }
        });

        // There is a guild config so update it
        if (isRegistered) {
          const result = await GuildConfigsService.putGuildConfig(isRegistered, channelID, i18n);
          if (!result) {
            // Error while patching the guild config into the backend
            embed = MessagesService.generateEmbed(enEN, enEN.system.unknownError, this.GLOBALS.DBE.user, 'error', { thumbnail: 'error' });
          } else {
            // Update success
            Logger.info(`Guild config updated for guild ${guildID} on channel ${channelID} with lang ${i18n}`);
            embed = MessagesService.generateEmbed(this.GLOBALS.I18N.get(i18n), this.GLOBALS.I18N.get(i18n).init.update, this.GLOBALS.DBE.user, 'success', { thumbnail: 'success' });
          }
        } else { // There is no guild config so create it
          const result = await GuildConfigsService.postGuildConfig(guildID, channelID, i18n);
          if (!result) {
            // Error while creating the guild config in the backend
            embed = MessagesService.generateEmbed(enEN, enEN.system.unknownError, this.GLOBALS.DBE.user, 'error', { thumbnail: 'error' });
          } else {
            // Creation success
            Logger.info(`Guild config created for guild ${guildID} on channel ${channelID} with lang ${i18n}`);
            embed = MessagesService.generateEmbed(this.GLOBALS.I18N.get(i18n), this.GLOBALS.I18N.get(i18n).init.create, this.GLOBALS.DBE.user, 'success', { thumbnail: 'success' });
          }
        }

        // Refresh the guild configs
        this.GLOBALS.setGuildConfigs(await GuildConfigsService.getGuildConfigs());

        // Send the error or success message
        MessagesServiceClass.sendMessageByBot(embed, message.author).catch();
        return;
      }
      // The command language is not supported
      embed = MessagesService.generateEmbed(enEN, enEN.init.errors.badLang, this.GLOBALS.DBE.user, 'error', { thumbnail: 'error' });
      MessagesServiceClass.sendMessageByBot(embed, message.author).catch();
      return;
    }
    // Only admin can execute this command
    embed = MessagesService.generateEmbed(enEN, enEN.init.errors.admin, this.GLOBALS.DBE.user, 'error', { thumbnail: 'error' });
    MessagesServiceClass.sendMessageByBot(embed, message.author).catch();
  }

  /* eslint-disable no-alert, no-await-in-loop */

  /**
   * Function to cache the messages reaction in the Client
   * This is required for the reactionAdd and reactionRemove events
   *
   * @param events -- The lis of events to cache an sync
   * @private
   */
  private async cacheAndSynchronise(events: EventInterface[]): Promise<void> {
    Logger.info('DBE is caching and synchronising');
    for (let i = 0; i < events.length; i += 1) {
      Logger.info(`Fetching event ${events[i].id} (${i + 1}/${events.length})`);

      // Fetch the message channel
      const channel = await this.GLOBALS.DBE.channels.fetch(events[i].channel_id, true);

      // If the channel is a TextChannel
      if (channel.isText()) {
        // Get the message from it's ID
        const message = await channel.messages.fetch(events[i].message_id, true);

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
    event.participants.sort();
    Logger.debug(`Event ${event.id} is up to date`);
    // Compare the userArray and the database one
    if (JSON.stringify(usersArray) !== JSON.stringify(event.participants)) {
      Logger.info(`DBE is synchronising the event ${event.id}`);

      // Patch the event in the backend
      const put = await EventsService.putEventParticipants(usersArray, event.id);
      if (put === null) {
        return;
      }

      const embed = MessagesService.generateEventEmbed(
        MessagesService.getLangFromMessage(message),
        message,
        event.title,
        event.description,
        DateTime.fromISO(event.event_date).toFormat('dd/MM/yyyy'),
        DateTime.fromISO(event.event_date).toFormat('HH:mm'),
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
   * @param i18n -- The lang of the guild
   */
  public async newCommand(
    message: Message,
    command: string,
    i18n: string,
  ): Promise<void> {
    let embed;
    const args = command.substring(4, command.length);

    Logger.debug(`DBE received new command ${command} executed by ${message.author.id} on guild ${message.guild.id}`);
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
        Logger.warn(`Command ${command} is trying to created an event in the past`);
        embed = MessagesService.generateEmbed(this.GLOBALS.I18N.get(i18n), this.GLOBALS.I18N.get(i18n).new.errors.past, message.author, 'error', { thumbnail: 'error' });
        MessagesServiceClass.sendMessageByBot(embed, message.author).catch();
        return;
      }

      // Create event
      // Replace everything in the command to test the image
      const messageWithNoParameters = args.replace(`${date} ${time} "${regex[3]}" "${regex[4]}"`, '');
      embed = MessagesService.generateEventEmbed(
        i18n,
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
        message.author.id,
        messageWithNoParameters,
      );

      // Verification of the request
      if (post) {
        // Add the basic reaction for participation
        Logger.debug(`DBE has created the event ${post.id}`);
        botMessage.react(this.GLOBALS.REACTION_EMOJI_VALID).catch();
        botMessage.react(this.GLOBALS.REACTION_EMOJI_INVALID).catch();
        return;
      }

      // There was an error during the axios request
      // Then delete the message and send an error to the user
      await botMessage.delete();
      embed = MessagesService.generateEmbed(this.GLOBALS.I18N.get(i18n), this.GLOBALS.I18N.get(i18n).system.unknownError, message.author, 'error', { thumbnail: 'error' });
      MessagesServiceClass.sendMessageByBot(embed, message.author).catch();
      return;
    }
    // Error the regex is not matched
    Logger.warn(`Command ${command} does not match the regex`);
    embed = MessagesService.generateEmbed(this.GLOBALS.I18N.get(i18n), this.GLOBALS.I18N.get(i18n).new.errors.badRegex, message.author, 'error', { thumbnail: 'error' });
    MessagesServiceClass.sendMessageByBot(embed, message.author).catch();
  }

  /**
   * Function to event the participants of an event
   *
   * @param reaction -- The reaction message
   * @param i18n -- The lang of the guild
   * @param user -- The user who reacted
   * @param add -- If it is adding or removing a participant
   */
  public async editParticipants(
    reaction: MessageReaction,
    i18n: string,
    user: User,
    add: boolean,
  ): Promise<void> {
    // Get the event
    const event = await EventsService.getEventFromMessageID(reaction.message.id);
    let embed;
    if (event === null) {
      embed = MessagesService.generateEmbed(this.GLOBALS.I18N.get(i18n), this.GLOBALS.I18N.get(i18n).system.unknownError, this.GLOBALS.DBE.user, 'error', { thumbnail: 'error' });
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
      embed = MessagesService.generateEmbed(this.GLOBALS.I18N.get(i18n), this.GLOBALS.I18N.get(i18n).system.unknownError, this.GLOBALS.DBE.user, 'error', { thumbnail: 'error' });
      MessagesServiceClass.sendMessageByBot(embed, user).catch();
      return;
    }

    embed = MessagesService.generateEventEmbed(
      i18n,
      reaction.message,
      event.title,
      event.description,
      DateTime.fromISO(event.event_date).toFormat('dd/MM/yyyy'),
      DateTime.fromISO(event.event_date).toFormat('HH:mm'),
      event.participants,
      event.image,
    );

    Logger.debug(`${user.id} is ${add ? 'joining' : 'leaving'} the event ${event.id}`);
    // Edit the message with the new content
    await reaction.message.edit({ embed });
  }

  /**
   * Function that manage the deletion of event
   *
   * @param reaction -- The reaction message
   * @param user -- The user who reacted
   * @param i18n -- The lang of the guild
   */
  public async deleteEvent(reaction: MessageReaction, user: User, i18n: string) {
    // Get the event to have the author
    const event = await EventsService.getEventFromMessageID(reaction.message.id);
    let embed;
    if (!event) {
      embed = MessagesService.generateEmbed(this.GLOBALS.I18N.get(i18n), this.GLOBALS.I18N.get(i18n).system.unknownError, this.GLOBALS.DBE.user, 'error', { thumbnail: 'error' });
      MessagesServiceClass.sendMessageByBot(embed, user).catch();
      return;
    }

    // For Permission check
    const guild = await this.GLOBALS.DBE.guilds.fetch(event.guild_id);
    const member = await guild.members.fetch(user);

    // Verification of permission to delete (Author or Admin)
    if (user.id === event.author_id || member.hasPermission('ADMINISTRATOR')) {
      const eventDelete = await EventsService.deleteEvent(event.id);
      if (!eventDelete) {
        embed = MessagesService.generateEmbed(this.GLOBALS.I18N.get(i18n), this.GLOBALS.I18N.get(i18n).system.unknownError, this.GLOBALS.DBE.user, 'error', { thumbnail: 'error' });
        MessagesServiceClass.sendMessageByBot(embed, user).catch();
        return;
      }
      Logger.debug(`Event ${event.id} was deleted by ${user.id} he was ${user.id === event.author_id ? 'the author' : 'and admin'}`);
      reaction.message.delete().catch();
      embed = MessagesService.generateEmbed(this.GLOBALS.I18N.get(i18n), this.GLOBALS.I18N.get(i18n).delete.success, this.GLOBALS.DBE.user, 'success', { thumbnail: 'success' });
      MessagesServiceClass.sendMessageByBot(embed, user).catch();
    }
  }

  /**
   * Function to handle the help
   *
   * @param message -- The message requesting help
   * @param i18n -- The lang of the guild
   */
  public helpCommand(message: Message, i18n: string) {
    Logger.debug(`User ${message.author.id} requested help`);
    const embed = MessagesService.generateEmbed(this.GLOBALS.I18N.get(i18n), this.GLOBALS.I18N.get(i18n).system.help, this.GLOBALS.DBE.user, 'info', { thumbnail: 'info', langMessageArgs: { tag: `<@!${this.GLOBALS.DBE.user.id}>`, valid: this.GLOBALS.REACTION_EMOJI_VALID, invalid: this.GLOBALS.REACTION_EMOJI_INVALID } });
    MessagesServiceClass.sendMessageByBot(embed, message.author).catch();
  }

  /**
   * Function to send the bot credits
   *
   * @param message -- The message requesting the credits
   * @param i18n -- The land of the guild
   */
  public creditsCommand(message: Message, i18n: string) {
    Logger.debug(`User ${message.author.id} requested the credits`);
    const embed = MessagesService.generateEmbed(this.GLOBALS.I18N.get(i18n), this.GLOBALS.I18N.get(i18n).system.credits, this.GLOBALS.DBE.user, 'info', { thumbnail: 'info', langMessageArgs: { version: nodePackage.version } });
    MessagesServiceClass.sendMessageByBot(embed, message.author).catch();
  }

  /**
   * Function to format the Map of Users return by discord js into the Strapi DB format
   *
   * @param users -- The discordJs map of users
   * @private
   */
  private formatUsersFormCompare(users: Map<string, User>): string[] {
    const usersArray = [];
    const botID = this.GLOBALS.DBE.user.id;

    users.forEach((entry: User) => {
      if (entry.id !== botID) {
        usersArray.push(entry.id);
      }
    });
    usersArray.sort();

    return usersArray;
  }
}

export const DBEService = new DBEServiceClass();
