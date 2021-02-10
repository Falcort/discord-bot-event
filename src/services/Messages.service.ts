import {
  MessageEmbed, TextChannel, DMChannel, User, NewsChannel, Message,
} from 'discord.js';
import { EmbedTextInterface, I18nInterface } from '@/interfaces/i18n.interface';
import { GlobalsService, GlobalsServiceClass } from '@/services/Globals.service';

export class MessagesServiceClass {
  private GLOBALS: GlobalsServiceClass;

  constructor() {
    this.GLOBALS = GlobalsService.getInstance();
  }

  /**
   * This function is to send message by the bot
   * @param message -- the string message that the bot need to send
   * @param where -- the channel or user that the bot need to send message to
   */
  public static async sendMessageByBot(
    message: string | MessageEmbed,
    where: TextChannel | DMChannel | NewsChannel | User,
  ): Promise<Message> {
    let result;
    if (typeof message === 'string') {
      result = await where.send(message);
    } else {
      result = await where.send({ embed: message });
    }
    return result;
  }

  /**
   * This function return the discord embed color code from a alert level
   *
   * @param level -- The level of alert
   * @private
   */
  private static getEmbedColorByLevel(level: 'error' | 'info' | 'success' | 'warn'): number {
    switch (level) {
      case 'error': {
        return 16711680;
      }
      case 'info': {
        return 36295;
      }
      case 'success': {
        return 1744384;
      }
      case 'warn':
      default: {
        return 12619008;
      }
    }
  }

  /**
   * This function return the discord embed thumbnail url from the alert level
   *
   * @param level -- The level of the alert
   * @private
   */
  private static getEmbedThumbnailByLevel(level: 'error' | 'info' | 'success' | 'warn'): string {
    switch (level) {
      case 'error': {
        return 'https://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/sign-error-icon.png';
      }
      case 'info': {
        return 'https://icon-library.com/images/info-icon/info-icon-26.jpg';
      }
      case 'success': {
        return 'https://www.prestigelogo.be/wp-content/uploads/2018/09/check.png';
      }
      case 'warn':
      default: {
        return 'http://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png';
      }
    }
  }

  /**
   * This function generate an embed to the bot to display pretty messages
   *
   */
  public generateEmbed(
    lang: I18nInterface,
    content: EmbedTextInterface,
    author: User,
    level: 'error' | 'info' | 'success' | 'warn',
    thumbnail?: 'error' | 'info' | 'success' | 'warn',
    image?: string,
  ): MessageEmbed {
    const embed = {
      title: content.title,
      description: content.description,
      footer: {
        icon_url: 'https://cdn.discordapp.com/icons/127086250761912320/81995fe87fc2e3667a04acb65fb33a94.png',
        text: this.GLOBALS.DBE.user.username + lang.embed.credits,
      },
      author: {
        name: author.username,
        icon_url: `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png?size=2048`,
      },
      color: MessagesServiceClass.getEmbedColorByLevel(level),
    } as Partial<MessageEmbed>;
    if (thumbnail) {
      embed.thumbnail = { url: MessagesServiceClass.getEmbedThumbnailByLevel(thumbnail) };
    }
    if (image) {
      embed.image = { url: image };
    }
    return embed as MessageEmbed;
  }

  /**
   * Function to parse the server configs and find if it is registered
   *
   * @param message -- The message to test
   */
  public getLangFromMessage(
    message: Message,
  ): string {
    let lang = null;
    this.GLOBALS.SERVER_CONFIGS.forEach((value) => {
      if (value.serverID === message.guild.id && message.channel.id === value.channelID) {
        lang = value.lang;
      }
    });
    return lang;
  }

  /**
   * This function allow to parse string to edit value inside
   *
   * @param message -- The message to parse
   * @param args -- The value to put in the message
   * @return string -- The parsed message
   */
  public static parseLangMessage(message: string, args: object): string {
    let result = message;
    let match = result.match(/\$\$(\S*)\$\$/);
    while (match) {
      const char = result.slice(match.index + 2).split('$$')[0];
      result = result.replace(`$$${char}$$`, args[char]);
      match = result.match(/\$\$(\S*)\$\$/);
    }
    return result;
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
  public generateEventEmbed(
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
      parseLangMessageArgs.participants = this.GLOBALS.I18N.get(lang).embed.event.noPeople;
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
      description: MessagesServiceClass.parseLangMessage(
        this.GLOBALS.I18N.get(lang).embed.event.description,
        parseLangMessageArgs,
      ),
    };

    // Generate the embed
    return this.generateEmbed(this.GLOBALS.I18N.get(lang), embedContent, message.author, 'info', undefined, image);
  }
}
export const MessagesService = new MessagesServiceClass();
