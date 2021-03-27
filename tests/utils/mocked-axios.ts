import Axios from 'axios';
import { Client } from 'discord.js';
import { GlobalsService } from '../../src/services/Globals.service';
import { client } from './client-constants';
import constantMocks from './mocks-constants';
import { message } from './message-constants';

const mockedAxios = Axios as jest.Mocked<typeof Axios>;

GlobalsService.getInstance().setDBE(client as Client);
GlobalsService.getInstance().GUILD_CONFIGS.set(constantMocks.message.guild.id, {
  i18n: 'enEN',
  channel_id: constantMocks.message.channel.id,
  guild_id: message.guild.id,
  id: constantMocks.serverConfig.id,
  init_date: '',
  timezone: 'Europe/Paris',
});

export default mockedAxios;
