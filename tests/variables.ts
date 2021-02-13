import { GlobalsService } from '@/services/Globals.service';
import {
  MessageEmbed, TextChannel, User, Client, Message, MessageReaction,
} from 'discord.js';
import ServerConfigInterface from '@/interfaces/server-config.interface';
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

const user = {
  id: variableMocks.user.id,
  username: variableMocks.user.username,
  avatar: variableMocks.user.avatar,
  send: (string: any) => {
    // eslint-disable-next-line no-unused-vars
    mockTestMessageAuthorSendResult = string;
  },
} as Partial<User>;

const messageReaction = {
  users: {
    // eslint-disable-next-line no-unused-vars
    fetch: (id, cache) => {
      const result = new Map<string, User>();
      result.set(user.id, user as User);
      return result;
    },
  },
} as unknown as Partial<MessageReaction>;

const message = {
  guild: {
    id: variableMocks.message.guild.id,
  },
  channel: {
    id: variableMocks.message.channel.id,
  },
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

const client = {
  user: {
    id: variableMocks.client.user.id,
    username: variableMocks.client.user.username,
  },
  channels: {
    // eslint-disable-next-line no-unused-vars
    fetch: (id, cache) => textChannel,
  },
} as unknown as Partial<Client>;

const serverConfig: ServerConfigInterface = {
  initialization: variableMocks.serverConfig.initialization,
  id: variableMocks.serverConfig.id,
  serverID: variableMocks.serverConfig.serverID,
  channelID: variableMocks.serverConfig.channelID,
  lang: 'enEN',
};

const event: EventInterface = {
  participants: variableMocks.eventInterface.participants,
  id: variableMocks.eventInterface.id,
  serverID: variableMocks.eventInterface.serverID,
  authorID: variableMocks.eventInterface.authorID,
  messageID: variableMocks.eventInterface.messageID,
  channelID: variableMocks.eventInterface.channelID,
  date: variableMocks.eventInterface.date,
  description: variableMocks.eventInterface.description,
  image: variableMocks.eventInterface.image,
  title: variableMocks.eventInterface.title,
};
const mockedAxios = Axios as jest.Mocked<typeof Axios>;

GlobalsService.getInstance().setDBE(client as Client);
GlobalsService.getInstance().SERVER_CONFIGS.set(
  variableMocks.serverConfig.id,
  {
    lang: 'enEN',
    channelID: variableMocks.message.channel.id,
    serverID: message.guild.id,
    id: variableMocks.serverConfig.id,
    initialization: '',
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
};
