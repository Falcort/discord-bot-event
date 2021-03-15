import { Guild } from 'discord.js';
import { user } from './user-constants';

export const guild: Readonly<Guild> = {
  members: {
    fetch: () => user,
  },
} as unknown as Guild;
