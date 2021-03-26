import { Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import constantMocks from './mocks-constants';
import { user, userNotAdmin } from './user-constants';

// eslint-disable-next-line import/no-mutable-exports
export let mockTestMessageChannelSendResult: { embed: MessageEmbed };
// eslint-disable-next-line import/no-mutable-exports
export const mockMessageReactions: string[] = [];
// eslint-disable-next-line import/no-mutable-exports
export let mockReactionMessageEditResult: { embed: MessageEmbed };

let mockTestMessageEditResult;

export const messageReaction: Readonly<MessageReaction> = ({
  users: {
    // eslint-disable-next-line no-unused-vars
    fetch: () => {
      const result = new Map<string, User>();
      result.set(user.id, user as User);
      return result;
    },
  },
  message: {
    id: 'mockMessageReactionID',
    edit: (value) => {
      mockReactionMessageEditResult = value;
    },
    delete: () => new Promise((resolve) => resolve),
    author: user,
    guild: {
      id: constantMocks.message.guild.id,
    },
  },
} as unknown) as MessageReaction;

export const message: Readonly<Message> = ({
  guild: {
    id: constantMocks.message.guild.id,
  },
  channel: {
    id: constantMocks.message.channel.id,
    send: (string) => {
      // eslint-disable-next-line no-unused-vars
      mockTestMessageChannelSendResult = string;
      return {
        delete: () => new Promise((resolve) => resolve('')),
        react: (reaction) =>
          new Promise((resolve: any) => {
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
  delete: () => new Promise((resolve) => resolve('')),
  // eslint-disable-next-line no-unused-vars,no-return-assign,no-undef
  edit: (content) => (mockTestMessageEditResult = content),
} as unknown) as Message;

export const messageUserNotAdmin: Readonly<Message> = ({
  guild: {
    id: constantMocks.message.guild.id,
  },
  channel: {
    id: constantMocks.message.channel.id,
    send: (string) => {
      // eslint-disable-next-line no-unused-vars
      mockTestMessageChannelSendResult = string;
      return {
        delete: () => new Promise((resolve) => resolve('')),
        react: (reaction) =>
          new Promise((resolve) => {
            mockMessageReactions.push(reaction);
            resolve(true);
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
  author: userNotAdmin,
  reactions: {
    // eslint-disable-next-line no-unused-vars
    resolve: () => messageReaction,
  },
  delete: () => new Promise((resolve) => resolve('')),
  // eslint-disable-next-line no-unused-vars,no-return-assign,no-undef
  edit: (content) => (mockTestMessageEditResult = content),
} as unknown) as Message;
