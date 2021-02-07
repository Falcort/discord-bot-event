import {
  MessageEmbed, TextChannel, DMChannel, Client, User,
} from 'discord.js';
/**
 * This function is to send message by the bot
 * @param message -- the string message that the bot need to send
 * @param where -- the channel or user that the bot need to send message to
 */
export function sendMessageByBot(
  message: string | MessageEmbed,
  where: TextChannel | DMChannel,
) {
  if (typeof message === 'string') {
    where.send(message).catch();
  } else {
    where.send({ embed: message }).catch();
  }
}

/**
 * This function return the discord embed color code from a alert level
 *
 * @param level -- The level of alert
 */
function getEmbedColorByLevel(level: 'error' | 'info' | 'success' | 'warn'): number {
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
function getEmbedThumbnailByLevel(level: 'error' | 'info' | 'success' | 'warn'): string {
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
export function generateEmbed(
  title: string,
  description: string,
  Bot: Client,
  lang: any,
  author: User,
  level: 'error' | 'info' | 'success' | 'warn',
  thumbnail?: 'error' | 'info' | 'success' | 'warn',
): MessageEmbed {
  const embed = {
    title,
    description,
    footer: {
      icon_url: 'https://cdn.discordapp.com/icons/127086250761912320/81995fe87fc2e3667a04acb65fb33a94.png',
      text: Bot.user.username + lang.endEmbedMsg,
    },
    author: {
      name: author.username,
      icon_url: `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png?size=2048`,
    },
    color: getEmbedColorByLevel(level),
  } as Partial<MessageEmbed>;
  if (thumbnail) {
    embed.thumbnail = { url: getEmbedThumbnailByLevel(thumbnail) };
  }
  return embed as MessageEmbed;
}
