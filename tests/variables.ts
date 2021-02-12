import { GlobalsService } from '@/services/Globals.service';
import {
  MessageEmbed, TextChannel, User, Client, Message,
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

const textChannel = {
  send: (message: string | MessageEmbed) => {
    // eslint-disable-next-line no-unused-vars
    mockTestChannelSendResult = message;
  },
} as Partial<TextChannel>;

const user = {
  id: variableMocks.user.id,
  username: variableMocks.user.username,
  avatar: variableMocks.user.avatar,
} as Partial<User>;

const client = {
  user: {
    id: variableMocks.client.user.id,
    username: variableMocks.client.user.username,
  },
} as Partial<Client>;

const message = {
  guild: {
    id: variableMocks.message.guild.id,
  },
  channel: {
    id: variableMocks.message.channel.id,
  },
  author: user,
} as Partial<Message>;

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

export const discordMocks = {
  user: user as User,
  client: client as Client,
  message: message as Message,
  textChannel: textChannel as TextChannel,
  serverConfig,
  mockedAxios,
  event,
};
