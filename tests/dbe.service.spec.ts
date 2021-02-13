import { DBEService } from '@/services/DBE.service';
import { GlobalsService } from '@/services/Globals.service';
// eslint-disable-next-line import/extensions
import { discordMocks, mockTestMessageAuthorSendResult, mockMessageReactions } from './variables';

jest.mock('axios');

describe('[Service] DBE', () => {
  describe('initDBE()', () => {
    it('valid', async () => {
      expect.assertions(1);
      let result = null;
      try {
        await DBEService.initDBE();
      } catch (e) {
        result = e;
      }
      expect(result).toBeNull();
    });
  });

  describe('cacheAndSynchronise()', () => {
    it('empty', async () => {
      expect.assertions(1);
      let result = null;
      discordMocks.mockedAxios.get.mockResolvedValue({ data: [] });
      try {
        await DBEService.initDBE();
      } catch (e) {
        result = e;
      }
      expect(result).toBeNull();
    });
    it('one', async () => {
      expect.assertions(1);
      let result = null;
      discordMocks.mockedAxios.get.mockResolvedValue({ data: [discordMocks.event] });
      try {
        await DBEService.initDBE();
      } catch (e) {
        result = e;
      }
      expect(result).toBeNull();
    });
    it('notText', async () => {
      expect.assertions(1);
      let result = null;
      // eslint-disable-next-line no-unused-expressions
      discordMocks.textChannel.isText = () => false;
      discordMocks.mockedAxios.get.mockResolvedValue({ data: [discordMocks.event] });
      try {
        await DBEService.initDBE();
      } catch (e) {
        result = e;
      }
      expect(result).toBeNull();
    });
  });

  describe('initCommand()', () => {
    it('lang not supported', async () => {
      expect.assertions(2);
      await DBEService.initCommand(discordMocks.message, 'init notALang');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').init.errors.badLang.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').init.errors.badLang.description);
    });
    it('not registered error', async () => {
      expect.assertions(2);
      discordMocks.mockedAxios.post.mockRejectedValue('ERROR');
      discordMocks.mockedAxios.get.mockResolvedValue({ data: [] });
      await DBEService.initCommand(discordMocks.message, 'init enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.description);
    });
    it('not registered success', async () => {
      expect.assertions(2);
      discordMocks.mockedAxios.post.mockResolvedValue({ data: [] });
      discordMocks.mockedAxios.get.mockResolvedValue({ data: [] });
      await DBEService.initCommand(discordMocks.message, 'init enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').init.create.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').init.create.description);
    });
    it('registered error', async () => {
      expect.assertions(2);
      discordMocks.mockedAxios.put.mockRejectedValue('ERROR');
      discordMocks.mockedAxios.get.mockResolvedValue({ data: [] });
      GlobalsService.getInstance().setServerConfigs([{
        initialization: '', id: 'AnID', serverID: discordMocks.message.guild.id, channelID: discordMocks.message.channel.id, lang: 'enEN',
      }]);
      await DBEService.initCommand(discordMocks.message, 'init enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.description);
    });
    it('registered success', async () => {
      expect.assertions(2);
      discordMocks.mockedAxios.put.mockResolvedValue({ data: [] });
      discordMocks.mockedAxios.get.mockResolvedValue({ data: [] });
      GlobalsService.getInstance().setServerConfigs([{
        initialization: '', id: 'AnID', serverID: discordMocks.message.guild.id, channelID: discordMocks.message.channel.id, lang: 'enEN',
      }]);
      await DBEService.initCommand(discordMocks.message, 'init enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').init.update.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').init.update.description);
    });
  });

  describe('newCommand()', () => {
    it('wrong args', async () => {
      expect.assertions(2);
      await DBEService.newCommand(discordMocks.message, 'invalid Args', 'enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').new.errors.badRegex.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').new.errors.badRegex.description);
    });
    it('event in the past', async () => {
      expect.assertions(2);
      await DBEService.newCommand(discordMocks.message, 'new 07/02/1970 21:00 "testTitle" "testDescription"', 'enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').new.errors.past.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').new.errors.past.description);
    });
    it('post error', async () => {
      expect.assertions(2);
      discordMocks.mockedAxios.post.mockRejectedValue('ERROR');
      await DBEService.newCommand(discordMocks.message, 'new 07/02/2100 21:00 "testTitle" "testDescription"', 'enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.description);
    });
    it('valid', async () => {
      expect.assertions(2);
      discordMocks.mockedAxios.post.mockResolvedValue({ data: discordMocks.event });
      await DBEService.newCommand(discordMocks.message, 'new 07/02/2100 21:00 "testTitle" "testDescription"', 'enEN');
      expect(mockMessageReactions).toContain(GlobalsService.getInstance().REACTION_EMOJI_INVALID);
      expect(mockMessageReactions).toContain(GlobalsService.getInstance().REACTION_EMOJI_VALID);
    });
  });
});
