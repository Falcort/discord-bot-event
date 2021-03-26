import { GlobalsService } from '@/services/Globals.service';
import { Client } from 'discord.js';
import serverConfig from './utils/server-config-constants';
import client from './utils/client-constants';
import mockedAxios from './utils/mocked-axios';

jest.mock('axios');

describe('[Service] Globals', () => {
  describe('getInstance()', () => {
    it('singleton', () => {
      expect.assertions(1);
      const globals1 = GlobalsService.getInstance();
      const globals2 = GlobalsService.getInstance();
      expect(globals1).toStrictEqual(globals2);
    });
  });

  describe('setServerConfigs()', () => {
    it('empty', () => {
      expect.assertions(1);
      GlobalsService.getInstance().setGuildConfigs([]);
      const { size } = GlobalsService.getInstance().GUILD_CONFIGS;
      GlobalsService.getInstance().setGuildConfigs([serverConfig]);
      expect(size).toStrictEqual(0);
    });
    it('one', () => {
      expect.assertions(2);
      GlobalsService.getInstance().setGuildConfigs([serverConfig]);
      expect(GlobalsService.getInstance().GUILD_CONFIGS.size).toStrictEqual(1);
      // eslint-disable-next-line max-len
      expect(
        GlobalsService.getInstance().GUILD_CONFIGS.get(serverConfig.guild_id),
      ).toStrictEqual(serverConfig);
    });
  });

  describe('setDBE()', () => {
    it('empty', () => {
      expect.assertions(1);
      GlobalsService.getInstance().setDBE({} as Client);
      expect(GlobalsService.getInstance().DBE).toStrictEqual({});
    });
    it('client', () => {
      expect.assertions(1);
      GlobalsService.getInstance().setDBE(client as Client);
      expect(GlobalsService.getInstance().DBE).toStrictEqual(client);
    });
  });

  describe('authToStrapi()', () => {
    it('error', async () => {
      expect.assertions(1);
      mockedAxios.post.mockRejectedValue('ERROR');
      await GlobalsService.getInstance().authToStrapi();
      expect(GlobalsService.getInstance().JWT).toStrictEqual('INVALID_JWT');
    });
    it('error stringify', async () => {
      expect.assertions(1);
      mockedAxios.post.mockRejectedValue({ response: 'ERROR' });
      await GlobalsService.getInstance().authToStrapi();
      expect(GlobalsService.getInstance().JWT).toStrictEqual('INVALID_JWT');
    });
    it('valid', async () => {
      expect.assertions(1);
      mockedAxios.post.mockResolvedValue({
        data: { data: { token: 'VALID' } },
      });
      await GlobalsService.getInstance().authToStrapi();
      expect(GlobalsService.getInstance().JWT).toStrictEqual('VALID');
    });
  });
});
