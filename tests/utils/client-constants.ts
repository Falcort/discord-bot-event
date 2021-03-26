import { Client } from 'discord.js';
import constantMocks from './mocks-constants';
import { guild, guildUserNotAdmin } from './guild-constants';
import { textChannel } from './text-channel-constants';

export const client: Readonly<Client> = ({
  user: {
    id: constantMocks.user.id,
    username: constantMocks.client.user.username,
  },
  channels: {
    // eslint-disable-next-line no-unused-vars
    fetch: () => textChannel,
  },
  guilds: {
    fetch: () => guild,
  },
} as unknown) as Client;

export const clientUserNotAdmin: Readonly<Client> = ({
  user: {
    id: constantMocks.user.id,
    username: constantMocks.client.user.username,
  },
  channels: {
    // eslint-disable-next-line no-unused-vars
    fetch: () => textChannel,
  },
  guilds: {
    fetch: () => guildUserNotAdmin,
  },
} as unknown) as Client;
