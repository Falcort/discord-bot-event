import { GlobalsService } from '@/services/Globals.service';
import {
  MessageEmbed, TextChannel, User, Client, Message,
} from 'discord.js';
import ServerConfigInterface from '@/interfaces/server-config.interface';

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

GlobalsService.getInstance().setDBE(client as Client);

export const discordMocks = {
  user: user as User,
  client: client as Client,
  message: message as Message,
  textChannel: textChannel as TextChannel,
  serverConfig,
};
