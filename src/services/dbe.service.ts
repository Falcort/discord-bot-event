import AxiosService from '@/services/axios.service';
import Logger from '@/services/logger.service';
import BotService from '@/services/bot.service';
import enEN from '@/i18n/enEN.i18n';
import {
  Client, Message, MessageReaction, User,
} from 'discord.js';
import { embedText } from '@/interfaces/i18n.interface';
import frFR from '@/i18n/frFR.i18n';
import { DateTime } from 'luxon';
import ServerConfigInterface from '@/interfaces/server-config.interface';

class DbeService {
  /**
   * Lis of the server configs to watch
   *
   * @private
   */
  private serverConfigs: ServerConfigInterface[] = [];

  /**
   * The bot itself
   *
   * @private
   */
  private DBE: Client;

  /**
   * Object with the lang files
   *
   * @private
   */
  private readonly i18n = {
    frFR,
    enEN,
  }

  private readonly reactionEmoji = '✅';

  /**
   * Function to cache all the relevant events
   *
   * TODO: Not working on reaction remove
   */
  public async cacheEvents() {
    const events = await AxiosService.fetchEvents();
    for (let i = 0; i < events.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const channel = await this.DBE.channels.fetch(events[i].channelID, true);
      if (channel.isText()) {
        // eslint-disable-next-line no-await-in-loop
        const message = await channel.messages.fetch(events[i].messageID, true);
        // eslint-disable-next-line no-await-in-loop
        await message.reactions.resolve(this.reactionEmoji).users.fetch();
      }
    }
    Logger.info('All event messaged cached');
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
        for (let i = 0; i < this.serverConfigs.length; i += 1) {
          if (this.serverConfigs[i].serverID === serverID) {
            alreadyRegistered = this.serverConfigs[i].id;
            break;
          }
        }

        let embed;
        // There is a server config so update it
        if (alreadyRegistered) {
          // Error while patching the server config into the backend
          if (!await AxiosService.putServerConfig(alreadyRegistered, channelID, lang)) {
            Logger.error('UPDATE OF INIT FAILED');
            embed = BotService.generateEmbed(this.DBE, enEN, enEN.system.unknownError, this.DBE.user, 'error', 'error');
          } else {
            // Update success
            Logger.info(`Server config updated for server ${serverID} on channel ${channelID} with lang ${lang}`);
            embed = BotService.generateEmbed(this.DBE, this.i18n[lang], this.i18n[lang].init.update, this.DBE.user, 'success', 'success');
          }
        } else { // There is no server config so create it
          // Error while creating the server config in the backend
          // eslint-disable-next-line no-lonely-if
          if (!await AxiosService.postServerConfig(serverID, channelID, lang)) {
            Logger.error('UPDATE OF INIT FAILED');
            embed = BotService.generateEmbed(this.DBE, enEN, enEN.system.unknownError, this.DBE.user, 'error', 'error');
          } else {
            // Creation success
            Logger.info(`Server config created for server ${serverID} on channel ${channelID} with lang ${lang}`);
            embed = BotService.generateEmbed(this.DBE, this.i18n[lang], this.i18n[lang].init.create, this.DBE.user, 'success', 'success');
          }
        }
        // Send the error or success message
        BotService.sendMessageByBot(embed, message.author).catch();

        // Refresh the server configs
        this.serverConfigs = await AxiosService.getServerConfigs();
      } else {
        // The command language is not supported
        Logger.error('BAD LANGUAGE INT INIT COMMAND');
        const embed = BotService.generateEmbed(this.DBE, enEN, enEN.init.errors.badLang, this.DBE.user, 'error', 'error');
        BotService.sendMessageByBot(embed, message.author).catch();
      }
    } else {
      // The command has been sent in a DM channel
      Logger.error('BAD CHANNEL TYPE INT INIT');
      const embed = BotService.generateEmbed(this.DBE, enEN, enEN.init.errors.badChannelType, this.DBE.user, 'error', 'error');
      BotService.sendMessageByBot(embed, message.author).catch();
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
        embed = BotService.generateEmbed(this.DBE, this.i18n[lang], this.i18n[lang].new.errors.past, message.author, 'error', 'error');
        BotService.sendMessageByBot(embed, message.author).catch();
      } else {
        // Create event

        // Replace everything in the command to test the image
        const messageWithNoParameters = messageWithoutCommand.replace(`${date} ${time} "${regex[3]}" "${regex[4]}"`, '');
        embed = this.generateEventEmbed(
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
        const botMessage = await BotService.sendMessageByBot(embed, message.channel);

        // Post the message
        await AxiosService.postEvent(
          luxonDate.toISO(),
          { title: regex[3], description: regex[4] } as embedText,
          botMessage,
          messageWithNoParameters,
        );
        // TODO: What happen if the backend insertion failed

        // Add the basic reaction for participation
        await botMessage.react('✅');
      }
    } else {
      // Error the regex is not matched
      embed = BotService.generateEmbed(this.DBE, this.i18n[lang], this.i18n[lang].new.errors.badRegex, message.author, 'error', 'error');
      BotService.sendMessageByBot(embed, message.author).catch();
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
    if (user.id !== this.DBE.user.id && reaction.message.author.id === this.DBE.user.id) {
      // If the reaction is using the correct emoji
      if (reaction.emoji.name === '✅') {
        // Get the event
        const event = await AxiosService.getEventFromMessageID(reaction.message.id);

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
        await AxiosService.putEventParticipants(event.participants, event.id);
        // TODO: Verify it is working

        const embed = this.generateEventEmbed(
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

  /**
   * Function to set the Bot
   *
   * @param Bot
   */
  public setBot(Bot: Client) {
    this.DBE = Bot;
  }

  /**
   * Function to register the server configs
   *
   * @param configs
   */
  public setServerConfigs(configs: ServerConfigInterface[]) {
    this.serverConfigs = configs;
  }

  /**
   * Function to return the server configs
   */
  public getServerConfigs() {
    return this.serverConfigs;
  }

  /**
   * Function to generate an event embed
   *
   * @param lang -- The lang of the message
   * @param message -- The message itself
   * @param title -- Title of the message
   * @param description -- Description of the message
   * @param day -- The day of the event
   * @param time -- The time of the event
   * @param participants -- The participants of the event
   * @param image -- The image if there is one
   * @private
   */
  private generateEventEmbed(
    lang: string,
    message: Message,
    title: string,
    description: string,
    day: string,
    time: string,
    participants: string[],
    image?: string,
  ) {
    const parseLangMessageArgs = {
      description,
      time,
      day,
      participants: '',
    };
    // Display a no participants if there is none
    if (participants.length === 0) {
      parseLangMessageArgs.participants = this.i18n[lang].embed.event.noPeople;
    } else {
      // If there is participants then generate appropriate text
      let participantsText = '';
      for (let i = 0; i < participants.length; i += 1) {
        participantsText += `\n - <@!${participants[i]}>`;
      }
      parseLangMessageArgs.participants = participantsText;
    }
    // Generate the content
    const embedContent = {
      title,
      description: BotService.parseLangMessage(
        this.i18n[lang].embed.event.description,
        parseLangMessageArgs,
      ),
    };

    // Generate the embed
    return BotService.generateEmbed(this.DBE, this.i18n[lang], embedContent, message.author, 'info', undefined, image);
  }
}
export default new DbeService();
