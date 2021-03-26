import { MessageEmbed, User } from 'discord.js';
import constantMocks from './mocks-constants';

// eslint-disable-next-line import/no-mutable-exports,no-redeclare
export let mockTestMessageAuthorSendResult: { embed: MessageEmbed };

// eslint-disable-next-line import/prefer-default-export
export const user: Readonly<User> = ({
  id: constantMocks.user.id,
  username: constantMocks.user.username,
  avatar: constantMocks.user.avatar,
  send: (string: any) => {
    // eslint-disable-next-line no-unused-vars
    mockTestMessageAuthorSendResult = string;
  },
  hasPermission: () => true,
} as unknown) as User;

export const userNotAdmin: Readonly<User> = ({
  id: constantMocks.user.id,
  username: constantMocks.user.username,
  avatar: constantMocks.user.avatar,
  send: (string: any) => {
    // eslint-disable-next-line no-unused-vars
    mockTestMessageAuthorSendResult = string;
  },
  hasPermission: () => false,
} as unknown) as User;

export const userAuthor: Readonly<User> = ({
  id: constantMocks.eventInterface.authorID,
  username: constantMocks.user.username,
  avatar: constantMocks.user.avatar,
  send: (string: any) => {
    // eslint-disable-next-line no-unused-vars
    mockTestMessageAuthorSendResult = string;
  },
  hasPermission: () => true,
} as unknown) as User;
