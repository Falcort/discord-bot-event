import { Client, Message, MessageEmbed, TextChannel } from 'discord.js';
import { message } from './message-constants';
import { GlobalsService } from '../../src/services/Globals.service';
import { client } from './client-constants';
import constantMocks from './mocks-constants';

// eslint-disable-next-line import/no-mutable-exports
export let mockTestChannelSendResult: string | MessageEmbed;
// eslint-disable-next-line import/no-mutable-exports
export let deleteCalled = false;

export const textChannel: Readonly<TextChannel> = ({
  send: (string: string | MessageEmbed) => {
    mockTestChannelSendResult = string;
  },
  isText: () => (process.env.IS_TEXT ? process.env.IS_TEXT === 'true' : true),
  messages: {
    // eslint-disable-next-line no-unused-vars
    fetch: (id, cache) => {
      if (id && cache) {
        return message;
      }
      const map = new Map<string, Message>();
      map.set(message.id, message as Message);
      // eslint-disable-next-line no-unused-vars,no-return-assign
      map.set('another ID', ({
        delete: () => new Promise((resolve) => resolve((deleteCalled = true))),
      } as unknown) as Message);
      return map;
    },
  },
} as unknown) as TextChannel;

GlobalsService.getInstance().setDBE(client as Client);
GlobalsService.getInstance().GUILD_CONFIGS.set(constantMocks.message.guild.id, {
  i18n: 'enEN',
  channel_id: constantMocks.message.channel.id,
  guild_id: message.guild.id,
  id: constantMocks.serverConfig.id,
  init_date: '',
  timezone: 'Europe/Paris',
});
