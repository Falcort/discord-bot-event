import { GuildConfigsService } from '@/services/Guild-configs.service';
// eslint-disable-next-line import/extensions
import {discordMocks, errorResponse, variableMocks} from './variables';

jest.mock('axios');

describe('[Service] ServerConfigs', () => {
  describe('getServerConfigs()', () => {
    it('empty', async () => {
      expect.assertions(1);
      discordMocks.mockedAxios.get.mockResolvedValue({ data: [] });
      const result = await GuildConfigsService.getGuildConfigs();
      expect(result).toStrictEqual([]);
    });
    it('one', async () => {
      expect.assertions(1);
      discordMocks.mockedAxios.get.mockResolvedValue({ data: [discordMocks.serverConfig] });
      const result = await GuildConfigsService.getGuildConfigs();
      expect(result).toStrictEqual([discordMocks.serverConfig]);
    });
    it('two', async () => {
      expect.assertions(3);
      // eslint-disable-next-line max-len
      discordMocks.mockedAxios.get.mockResolvedValue({ data: [discordMocks.serverConfig, discordMocks.serverConfig] });
      const result = await GuildConfigsService.getGuildConfigs();
      expect(result[0]).toStrictEqual(discordMocks.serverConfig);
      expect(result[1]).toStrictEqual(discordMocks.serverConfig);
      expect(result).toHaveLength(2);
    });
    it('error', async () => {
      expect.assertions(1);
      discordMocks.mockedAxios.get.mockRejectedValue('ERROR');
      const result = await GuildConfigsService.getGuildConfigs();
      expect(result).toStrictEqual([]);
    });
    it('error.data Stringify', async() => {
      expect.assertions(1);
      discordMocks.mockedAxios.get.mockRejectedValue(errorResponse);
      const result = await GuildConfigsService.getGuildConfigs();
      expect(result).toStrictEqual([]);
    });
  });

  describe('putServerConfig()', () => {
    it('valid', async () => {
      expect.assertions(1);
      discordMocks.mockedAxios.put.mockResolvedValue({ data: discordMocks.serverConfig });
      const result = await GuildConfigsService.putGuildConfig(variableMocks.serverConfig.serverID, variableMocks.serverConfig.serverID, 'enEN');
      expect(result).not.toBeNull();
    });
    it('error', async () => {
      expect.assertions(1);
      discordMocks.mockedAxios.put.mockRejectedValue('ERROR');
      const result = await GuildConfigsService.putGuildConfig(variableMocks.serverConfig.serverID, variableMocks.serverConfig.serverID, 'enEN');
      expect(result).toBeNull();
    });
    it('error.data Stringify', async() => {
      expect.assertions(1);
      discordMocks.mockedAxios.put.mockRejectedValue(errorResponse);
      const result = await GuildConfigsService.putGuildConfig(variableMocks.serverConfig.serverID, variableMocks.serverConfig.serverID, 'enEN');
      expect(result).toBeNull();
    });
  });

  describe('postServerConfig()', () => {
    it('valid', async () => {
      expect.assertions(1);
      discordMocks.mockedAxios.post.mockResolvedValue({ data: discordMocks.serverConfig });
      const result = await GuildConfigsService.postGuildConfig(variableMocks.serverConfig.serverID, variableMocks.serverConfig.serverID, 'enEN');
      expect(result).not.toBeNull();
    });
    it('error', async () => {
      expect.assertions(1);
      discordMocks.mockedAxios.post.mockRejectedValue('ERROR');
      const result = await GuildConfigsService.postGuildConfig(variableMocks.serverConfig.serverID, variableMocks.serverConfig.serverID, 'enEN');
      expect(result).toBeNull();
    });
    it('error.data Stringify', async() => {
      expect.assertions(1);
      discordMocks.mockedAxios.post.mockRejectedValue(errorResponse);
      const result = await GuildConfigsService.postGuildConfig(variableMocks.serverConfig.serverID, variableMocks.serverConfig.serverID, 'enEN');
      expect(result).toBeNull();
    });
  });
});
