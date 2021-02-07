import AxiosService, {
  createEvent, createServerConfig, getServerConfigs, updateServerConfig, fetchEvents,
} from '@/services/axios.service';
import Logger from '@/services/logger.service';
import { generateEmbed, parseLangMessage, sendMessageByBot } from '@/services/bot.service';
import enEN from '@/i18n/enEN.i18n';
import {
  Client, Message, MessageReaction, User,
} from 'discord.js';
import { embedText } from '@/i18n/template.i18n';
import frFR from '@/i18n/frFR.i18n';
import { DateTime } from 'luxon';

class DbeService {
  private serverConfigs = [];

  private Bot: Client;

  private readonly i18n = {
    frFR,
    enEN,
  }

  public fetchEvents() {
    fetchEvents().then((events) => {
      for (let i = 0; i < events.length; i += 1) {
        this.Bot.channels.fetch(events[i].channelID).then((channel) => {
          if (channel.isText()) {
            channel.messages.fetch(events[i].messageID).catch();
          }
        });
      }
      Logger.info('All event messaged cached');
    });
  }

  public async init(message: Message, messageWithoutTag: string) {
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
        if (alreadyRegistered) { // There is a server config so update it
          if (!await updateServerConfig(alreadyRegistered, channelID, lang)) {
            Logger.error('UPDATE OF INIT FAILED');
            embed = generateEmbed(this.Bot, enEN, enEN.system.unknownError, this.Bot.user, 'error', 'error');
          } else {
            Logger.info(`Server config updated for server ${serverID} on channel ${channelID} with lang ${lang}`);
            embed = generateEmbed(this.Bot, this.i18n[lang], this.i18n[lang].init.update, this.Bot.user, 'success', 'success');
          }
          sendMessageByBot(embed, message.author).catch();
        } else { // There is no server config so create it
          if (!await createServerConfig(serverID, channelID, lang)) {
            Logger.error('UPDATE OF INIT FAILED');
            embed = generateEmbed(this.Bot, enEN, enEN.system.unknownError, this.Bot.user, 'error', 'error');
          } else {
            Logger.info(`Server config created for server ${serverID} on channel ${channelID} with lang ${lang}`);
            embed = generateEmbed(this.Bot, this.i18n[lang], this.i18n[lang].init.create, this.Bot.user, 'success', 'success');
          }
          sendMessageByBot(embed, message.author).catch();
        }

        // Refresh the server configs
        this.serverConfigs = await getServerConfigs();
      } else {
        Logger.error('BAD LANGUAGE INT INIT COMMAND');
        const embed = generateEmbed(this.Bot, enEN, enEN.init.errors.badLang, this.Bot.user, 'error', 'error');
        sendMessageByBot(embed, message.author).catch();
      }
    } else {
      Logger.error('BAD CHANNEL TYPE INT INIT');
      const embed = generateEmbed(this.Bot, enEN, enEN.init.errors.badChannelType, this.Bot.user, 'error', 'error');
      sendMessageByBot(embed, message.author).catch();
    }
    message.delete().catch();
  }

  public async new(message: Message, messageWithoutTag: string, lang: string) {
    let embed;
    const messageWithoutCommand = messageWithoutTag.substring(4, messageWithoutTag.length);
    const regex = messageWithoutCommand.match(/(\d{2}\/\d{2}\/\d{4})\s(\d{2}:\d{2})\s"(.*)"\s"(.*)"/);
    if (regex && regex.length === 5) {
      const date = regex[1];
      const time = regex[2];

      const luxonDate = DateTime.fromFormat(`${date} ${time}`, 'dd/MM/yyyy HH:mm');

      if (luxonDate.diffNow().milliseconds <= 0) { // If in the past reject
        embed = generateEmbed(this.Bot, this.i18n[lang], this.i18n[lang].new.errors.past, message.author, 'error', 'error');
        sendMessageByBot(embed, message.author).catch();
      } else { // ELse create event
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
        const botMessage = await sendMessageByBot(embed, message.channel);
        await createEvent(
          luxonDate.toISO(),
          { title: regex[3], description: regex[4] } as embedText,
          botMessage,
          messageWithNoParameters,
        );
        await botMessage.react('✅');
      }
    } else {
      embed = generateEmbed(this.Bot, this.i18n[lang], this.i18n[lang].new.errors.badRegex, message.author, 'error', 'error');
      sendMessageByBot(embed, message.author).catch();
    }
    message.delete().catch();
  }

  public editParticipants(reaction: MessageReaction, lang: string, user: User, add: boolean) {
    if (user.id !== this.Bot.user.id) {
      if (reaction.emoji.name === '✅') {
        AxiosService.getEventFromMessageID(reaction.message.id).then((response) => {
          const event = response.data[0];
          if (add) {
            event.participants.push(user.id);
          } else {
            const index = event.participants.indexOf(user.id);
            event.participants.splice(index, 1);
          }
          AxiosService.putEventParticipants(event.participants, event.id).then(() => {
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
            reaction.message.edit({ embed }).catch();
          });
        });
      }
    }
  }

  public setBot(Bot: Client) {
    this.Bot = Bot;
  }

  public setServerConfigs(configs: object[]) {
    this.serverConfigs = configs;
  }

  public getServerConfigs() {
    return this.serverConfigs;
  }

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
    let embedContent: embedText;
    if (participants.length === 0) {
      embedContent = {
        title,
        description: parseLangMessage(
          this.i18n[lang].embed.event.description,
          {
            description,
            time,
            day,
            participants: this.i18n[lang].embed.event.noPeople,
          },
        ),
      };
    } else {
      let participantsText = '';
      for (let i = 0; i < participants.length; i += 1) {
        participantsText += `\n - <@!${participants[i]}>`;
      }
      embedContent = {
        title,
        description: parseLangMessage(
          this.i18n[lang].embed.event.description,
          {
            description,
            time,
            day,
            participants: participantsText,
          },
        ),
      };
    }
    return generateEmbed(this.Bot, this.i18n[lang], embedContent, message.author, 'info', undefined, image);
  }
}
export default new DbeService();
