import { GuildConfigsService } from '@/services/Guild-configs.service';
import mockedAxios from './utils/mocked-axios';
import constantMocks from './utils/mocks-constants';
import errorResponse from './utils/error-constants';

jest.mock('axios');

describe('[Service] ServerConfigs', () => {
  describe('getServerConfigs()', () => {
    it('empty', async () => {
      expect.assertions(1);
      mockedAxios.get.mockResolvedValue({ data: { results: [] } });
      const result = await GuildConfigsService.getGuildConfigs();
      expect(result).toStrictEqual([]);
    });
    it('one', async () => {
      expect.assertions(1);
      mockedAxios.get.mockResolvedValue({
        data: { results: [constantMocks.serverConfig] },
      });
      const result = await GuildConfigsService.getGuildConfigs();
      expect(result).toStrictEqual([constantMocks.serverConfig]);
    });
    it('two', async () => {
      expect.assertions(3);
      // eslint-disable-next-line max-len
      mockedAxios.get.mockResolvedValue({
        data: {
          results: [constantMocks.serverConfig, constantMocks.serverConfig],
        },
      });
      const result = await GuildConfigsService.getGuildConfigs();
      expect(result[0]).toStrictEqual(constantMocks.serverConfig);
      expect(result[1]).toStrictEqual(constantMocks.serverConfig);
      expect(result).toHaveLength(2);
    });
    it('error', async () => {
      expect.assertions(1);
      mockedAxios.get.mockRejectedValue('ERROR');
      const result = await GuildConfigsService.getGuildConfigs();
      expect(result).toStrictEqual([]);
    });
    it('error.data Stringify', async () => {
      expect.assertions(1);
      mockedAxios.get.mockRejectedValue(errorResponse);
      const result = await GuildConfigsService.getGuildConfigs();
      expect(result).toStrictEqual([]);
    });
  });

  describe('putServerConfig()', () => {
    it('valid', async () => {
      expect.assertions(1);
      mockedAxios.put.mockResolvedValue({ data: constantMocks.serverConfig });
      const result = await GuildConfigsService.putGuildConfig(
        constantMocks.serverConfig.guild_id,
        constantMocks.serverConfig.guild_id,
        'enEN',
        'Europe/Paris',
      );
      expect(result).not.toBeNull();
    });
    it('error', async () => {
      expect.assertions(1);
      mockedAxios.put.mockRejectedValue('ERROR');
      const result = await GuildConfigsService.putGuildConfig(
        constantMocks.serverConfig.guild_id,
        constantMocks.serverConfig.guild_id,
        'enEN',
        'Europe/Paris',
      );
      expect(result).toBeNull();
    });
    it('error.data Stringify', async () => {
      expect.assertions(1);
      mockedAxios.put.mockRejectedValue(errorResponse);
      const result = await GuildConfigsService.putGuildConfig(
        constantMocks.serverConfig.guild_id,
        constantMocks.serverConfig.guild_id,
        'enEN',
        'Europe/Paris',
      );
      expect(result).toBeNull();
    });
  });

  describe('postServerConfig()', () => {
    it('valid', async () => {
      expect.assertions(1);
      mockedAxios.post.mockResolvedValue({ data: constantMocks.serverConfig });
      const result = await GuildConfigsService.postGuildConfig(
        constantMocks.serverConfig.guild_id,
        constantMocks.serverConfig.guild_id,
        'enEN',
        'Europe/Paris',
      );
      expect(result).not.toBeNull();
    });
    it('error', async () => {
      expect.assertions(1);
      mockedAxios.post.mockRejectedValue('ERROR');
      const result = await GuildConfigsService.postGuildConfig(
        constantMocks.serverConfig.guild_id,
        constantMocks.serverConfig.guild_id,
        'enEN',
        'Europe/Paris',
      );
      expect(result).toBeNull();
    });
    it('error.data Stringify', async () => {
      expect.assertions(1);
      mockedAxios.post.mockRejectedValue(errorResponse);
      const result = await GuildConfigsService.postGuildConfig(
        constantMocks.serverConfig.guild_id,
        constantMocks.serverConfig.guild_id,
        'enEN',
        'Europe/Paris',
      );
      expect(result).toBeNull();
    });
  });
});
