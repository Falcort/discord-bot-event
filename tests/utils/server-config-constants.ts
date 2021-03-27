import GuildConfigInterface from '../../src/interfaces/guild-config.interface';
import constantMocks from './mocks-constants';

const serverConfig: Readonly<GuildConfigInterface> = {
  init_date: constantMocks.serverConfig.initialization,
  id: constantMocks.serverConfig.id,
  guild_id: constantMocks.serverConfig.guild_id,
  channel_id: constantMocks.serverConfig.channelID,
  i18n: 'enEN',
  timezone: 'Europe/Paris',
};

export default serverConfig;
