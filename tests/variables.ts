import { GlobalsService } from '@/services/Globals.service';
import {
  MessageEmbed, TextChannel, User, Client, Message, MessageReaction, Guild,
} from 'discord.js';
import GuildConfigInterface from '@/interfaces/guild-config.interface';
import Axios from 'axios';
import EventInterface from '@/interfaces/event.interface';

export const variableMocks = {
  user: {
    id: 'UnitTestMockUserID',
    username: 'UnitTestMockUserUsername',
    avatar: 'UnitTestMockUserAvatar',
  },
  client: {
    user: {
      id: 'UnitTestMockClientUserID',
      username: 'UnitTestMockClientUsername',
    },
  },
  message: {
    guild: {
      id: 'UnitTestMockMessageGuildID',
    },
    channel: {
      id: 'UnitTestMockMessageChannelID',
    },
    id: 'UnitTestMockMessageID',
  },
  event: {
    title: 'UnitTestMockEventTitle',
    description: 'UnitTestMockEventDescription $$time$$ $$day$$ $$participants$$',
    day: 'UnitTestMockEventDay',
    time: 'UnitTestMockEventTime',
  },
  serverConfig: {
    initialization: 'UnitTestServerConfigInitialization',
    id: 'UnitTestServerConfigID',
    serverID: 'UnitTestServerConfigGuildID',
    channelID: 'UnitTestServerConfigChannelID',
  },
  eventInterface: {
    participants: [],
    id: 'UnitTestMockEventID',
    serverID: 'UnitTestMockEventServerID',
    authorID: 'UnitTestMockEventAuthorID',
    messageID: 'UnitTestMockEventMessageID',
    channelID: 'UnitTestMockEventChannelID',
    date: 'UnitTestMockEventEventDate',
    description: 'UnitTestMockEventDescription',
    image: 'UnitTestMockEventImage',
    title: 'UnitTestMockEventTitle',
  },
  version: '',
  url: 'https://UnitTestURL',
  image: 'https://UnitTestImage',
  lang: 'enEN',
};

// eslint-disable-next-line import/no-mutable-exports
export let mockTestChannelSendResult: string | MessageEmbed;
// eslint-disable-next-line import/no-mutable-exports
export let mockTestMessageEditResult: string | MessageEmbed;
// eslint-disable-next-line import/no-mutable-exports
export let mockTestMessageAuthorSendResult: { embed: MessageEmbed };
// eslint-disable-next-line import/no-mutable-exports
export let mockTestMessageChannelSendResult: { embed: MessageEmbed };
// eslint-disable-next-line import/no-mutable-exports
export let mockReactionMessageEditResult: { embed: MessageEmbed };
// eslint-disable-next-line import/no-mutable-exports
export const mockMessageReactions: string[] = [];

const user = {
  id: variableMocks.user.id,
  username: variableMocks.user.username,
  avatar: variableMocks.user.avatar,
  send: (string: any) => {
    // eslint-disable-next-line no-unused-vars
    mockTestMessageAuthorSendResult = string;
  },
  hasPermission: () => true,
} as unknown as Partial<User>;

const messageReaction = {
  users: {
    // eslint-disable-next-line no-unused-vars
    fetch: (id, cache) => {
      const result = new Map<string, User>();
      result.set(user.id, user as User);
      return result;
    },
  },
  message: {
    id: 'mockMessageReactionID',
    edit: (value: any) => {
      mockReactionMessageEditResult = value;
    },
    delete: () => new Promise((resolve) => resolve),
    author: user,
  },
} as unknown as Partial<MessageReaction>;

const message = {
  guild: {
    id: variableMocks.message.guild.id,
  },
  channel: {
    id: variableMocks.message.channel.id,
    send: (string: any) => {
      // eslint-disable-next-line no-unused-vars
      mockTestMessageChannelSendResult = string;
      return {
        delete: () => {},
        react: (reaction) => new Promise((resolve: any) => {
          mockMessageReactions.push(reaction);
          resolve();
        }),
        id: 'testID',
        channel: {
          id: 'testChannelID',
        },
        guild: {
          id: 'testGuildID',
        },
      };
    },
  },
  id: 'testID',
  author: user,
  reactions: {
    // eslint-disable-next-line no-unused-vars
    resolve: (resolvable) => messageReaction,
  },
  // eslint-disable-next-line no-unused-vars,no-return-assign
  edit: (content) => mockTestMessageEditResult = content,
} as unknown as Partial<Message>;

const textChannel = {
  send: (string: string | MessageEmbed) => {
    // eslint-disable-next-line no-unused-vars
    mockTestChannelSendResult = string;
  },
  isText: () => true,
  messages: {
    // eslint-disable-next-line no-unused-vars
    fetch: (id, cache) => message,
  },
} as unknown as Partial<TextChannel>;

const guild = {
  members: {
    fetch: () => user,
  },
} as unknown as Partial<Guild>;

const client = {
  user: {
    id: variableMocks.client.user.id,
    username: variableMocks.client.user.username,
  },
  channels: {
    // eslint-disable-next-line no-unused-vars
    fetch: (id, cache) => textChannel,
  },
  guilds: {
    fetch: () => guild,
  },
} as unknown as Partial<Client>;

const serverConfig: GuildConfigInterface = {
  init_date: variableMocks.serverConfig.initialization,
  id: variableMocks.serverConfig.id,
  guild_id: variableMocks.serverConfig.serverID,
  channel_id: variableMocks.serverConfig.channelID,
  i18n: 'enEN',
};

const event: EventInterface = {
  participants: { users: variableMocks.eventInterface.participants },
  id: variableMocks.eventInterface.id,
  guild_id: variableMocks.eventInterface.serverID,
  author_id: variableMocks.eventInterface.authorID,
  message_id: variableMocks.eventInterface.messageID,
  channel_id: variableMocks.eventInterface.channelID,
  event_date: variableMocks.eventInterface.date,
  description: variableMocks.eventInterface.description,
  image: variableMocks.eventInterface.image,
  title: variableMocks.eventInterface.title,
};
const mockedAxios = Axios as jest.Mocked<typeof Axios>;

GlobalsService.getInstance().setDBE(client as Client);
GlobalsService.getInstance().GUILD_CONFIGS.set(
  variableMocks.serverConfig.id,
  {
    i18n: 'enEN',
    channel_id: variableMocks.message.channel.id,
    guild_id: message.guild.id,
    id: variableMocks.serverConfig.id,
    init_date: '',
  },
);

export const discordMocks = {
  user: user as User,
  client: client as Client,
  message: message as Message,
  textChannel: textChannel as TextChannel,
  serverConfig,
  mockedAxios,
  event,
  messageReaction: messageReaction as MessageReaction,
  guild: guild as Guild,
};
