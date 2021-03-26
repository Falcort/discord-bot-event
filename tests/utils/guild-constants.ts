import { Guild } from 'discord.js';
import { user, userNotAdmin } from './user-constants';

export const guild: Readonly<Guild> = ({
  members: {
    fetch: () => user,
  },
} as unknown) as Guild;

export const guildUserNotAdmin: Readonly<Guild> = ({
  members: {
    fetch: () => userNotAdmin,
  },
} as unknown) as Guild;
