import {
  MessageEmbed, TextChannel, DMChannel, Client, User, NewsChannel, Message,
} from 'discord.js';
import I18nInterface, { embedText } from '@/interfaces/i18n.interface';
import ServerConfigInterface from '@/interfaces/server-config.interface';

class BotService {
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
   */
  public static getEmbedColorByLevel(level: 'error' | 'info' | 'success' | 'warn'): number {
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
   */
  public static getEmbedThumbnailByLevel(level: 'error' | 'info' | 'success' | 'warn'): string {
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
  public static generateEmbed(
    Bot: Client,
    lang: I18nInterface,
    content: embedText,
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
        text: Bot.user.username + lang.embed.credits,
      },
      author: {
        name: author.username,
        icon_url: `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png?size=2048`,
      },
      color: BotService.getEmbedColorByLevel(level),
    } as Partial<MessageEmbed>;
    if (thumbnail) {
      embed.thumbnail = { url: BotService.getEmbedThumbnailByLevel(thumbnail) };
    }
    if (image) {
      embed.image = { url: image };
    }
    return embed as MessageEmbed;
  }

  /**
   * Function to parse the server configs and find if it is registered
   *
   * @param servers -- The server configs
   * @param message -- The message to test
   */
  public static getLangFromMessage(
    servers: ServerConfigInterface[],
    message: Message,
  ): string {
    for (let i = 0; i < servers.length; i += 1) {
      if (servers[i].serverID === message.guild.id) {
        return servers[i].lang;
      }
    }
    return null;
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
}
export default BotService;