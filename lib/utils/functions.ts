import { Client, Message, RichEmbed } from 'discord.js';
import * as Discord from 'discord.js';
import { IConfig } from '../interfaces/config';
import { IEmbedContent } from '../interfaces/embedContent';

const config: IConfig = require('../../config.json');

/**
 * Function that clean the channel
 * This function call itslef while there is still message to delete
 * @param Bot -- The Bot variable
 * @param channel -- The channel that the bot need to clean
 * @param nbRemoved -- The incrementing number of deleted messages
 * @return Promise<object>
 */
export async function clean(Bot: Discord.Client,
                            channel: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel,
                            nbRemoved: number = 0): Promise<object> {

    const messages = await channel.fetchMessages();
    if (messages.size > 0) {
        const message = messages.first();
        await message.delete();

        // special TSLint disable for receptivity
        // tslint:disable-next-line:no-parameter-reassignment
        nbRemoved++;
        return clean(Bot, channel, nbRemoved);
    }
    // TODO: Remove the fixed message
    channel.send(`${nbRemoved} messages supprimées !`).then((message: Discord.Message) => {
        message.delete(2000).catch();
    });
}

/**
 * Function that generate the mongoDB connection string
 * This function take the config parameters, and creat a mongodb connection string depending on the configuration
 * @return string -- MongoDB connection string
 */
export function getMongoDbConnectionString(): string {
    let uri: string;

    if (process.env.GH_ACTIONS === 'true') { // If environement is GitHub actions, then use simple things
        uri = `mongodb://localhost:27017/${process.env.DB_NAME}`;
    } else { // Else use the application-properties file
        uri = 'mongodb://';

        if (config.db.username && config.db.password) { // If username AND password are set then add them to the string
            uri += `${config.db.username}:${config.db.password}@`;
        }

        uri += `${config.db.address}:${config.db.port}/${config.db.name}`;
    }
    return uri;
}

/**
 * This function allow to parse string to edit value inside
 *
 * @param message -- The message to parse
 * @param args -- The value to put in the message
 * @return string -- The parsed message
 */
export function parseLangMessage(message: string, args: object): string {
    let result = message;
    let match = result.match(/\$\$(\S*)\$\$/);
    while (match) {
        const char = result.slice(match.index+2).split('$$')[0];
        result = result.replace(`$$${char}$$`, args[char]);
        match = result.match(/\$\$(\S*)\$\$/);
    }
    return result;
}

/**
 * This function is to send message by the bot
 * @param message -- the string message that the bot need to send
 * @param where -- the channel or user that the bot need to send message to
 * @return Promise<Promise<Message | Message[]> | number | Message | Message[]> -- A promise of a -1 on error
 */
export async function sendMessageByBot(
    message: string | RichEmbed | Message | Message[],
    where: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel | Discord.User
): Promise<Promise<Message | Message[]> | number | Message | Message[]> {
    if (message) {
        if(message instanceof  Array) {
            for (const t of message) {
                if (typeof t === 'string') {
                    where.send(t);
                } else {
                    where.send({embed: t});
                }
            }
            return message;
        }
        if (typeof message === 'string') {
            return where.send(message);
        }
        return where.send({embed: message});
    }
    return -1;
}

/**
 * This function send a message via the bot and delete the request message to keep the channel clean
 *
 * @param message -- The message to send
 * @param where -- On which channel does the bot need to send the message
 * @param messageToDelete -- The message that the bot need to delete after sending the message
 * @return  Promise<Message> -- The deleted message
 */
export async function sendMessageByBotAndDelete(
    message: string | RichEmbed,
    where: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel | Discord.User,
    messageToDelete: Message): Promise<Message> {

    await sendMessageByBot(message, where);
    return messageToDelete.delete();
}

/**
 * This function generate an embed to the bot to display pretty messages
 *
 * @param Bot -- The Bot himself so he can be used as an author or in the credit
 * @param level -- The level will determine the color of the embed
 * @param lang -- The IEmbedContent to display
 * @param options -- The options of the function
 * @return Promise<RichEmbed> -- The embed to send to the client
 */
export async function generateEmbed(
    Bot: Client,
    level: 'error' | 'info' | 'success' | 'warn',
    lang: IEmbedContent,
    options?: {
        authorID?: string,
        langOptions?: object,
        participants?: string[]
    }
): Promise<RichEmbed> {

    let author = null;
    let authorAvatarURL = null;
    if (options && options.authorID) {
        author = await Bot.fetchUser(options.authorID);
        authorAvatarURL = 'https://cdn.discordapp.com/avatars/' + author.id + '/' + author.avatar + '.png?size=2048';
    }
    const result =  {
        author: {
            name: author ? author.username : Bot.user.username,
            icon_url: author ? authorAvatarURL : Bot.user.avatarURL
        },
        color: getEmbedColorByLevel(level),
        title: options && options.langOptions ? parseLangMessage(lang.title, options.langOptions) : lang.title,
        description: options && options.langOptions ? parseLangMessage(lang.description, options.langOptions) : lang.description,
        footer: {
            icon_url: Bot.user.avatarURL,
            text: Bot.user.username + ' | Designed by SOUQUET Thibault - 2018'
        }
    } as Partial<RichEmbed>;
    if(options && options.participants) {
        for(const participant of options.participants) {
            result.description += `> <@${participant}>\n`;
        }
        result.description += '\n';
    }
    return result as RichEmbed;
}

/**
 * This function return the discord embed color code from a alert level
 *
 * @param level -- The level of alert
 * @return number -- The color of the embed
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
