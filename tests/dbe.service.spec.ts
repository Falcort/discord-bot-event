import { DBEService } from '@/services/DBE.service';
import { GlobalsService } from '@/services/Globals.service';
import GuildConfigInterface from '@/interfaces/guild-config.interface';
import {
  discordMocks,
  mockTestMessageAuthorSendResult,
  mockMessageReactions,
  mockReactionMessageEditResult,
  variableMocks,
  // eslint-disable-next-line import/extensions
} from './variables';

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
      discordMocks.mockedAxios.get.mockResolvedValue({ data: { results: [] } });
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
      discordMocks.mockedAxios.get.mockResolvedValue({ data: { results: [discordMocks.event] } });
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
      discordMocks.textChannel.isText = () => false;
      discordMocks.mockedAxios.get.mockResolvedValue({ data: { results: [discordMocks.event] } });
      try {
        await DBEService.initDBE();
      } catch (e) {
        result = e;
      }
      expect(result).toBeNull();
    });
    it('synchronise event with same number of participants', async () => {
      expect.assertions(1);
      let result = null;
      discordMocks.mockedAxios.get.mockResolvedValue({ data: { results: [discordMocks.eventSameNumberParticpants] } });
      try {
        await DBEService.initDBE();
      } catch (e) {
        result = e;
      }
      expect(result).toBeNull();
    });
    it('synchronise events with putEventPartcipant null', async () => {
      expect.assertions(1);
      let result = null;
      GlobalsService.getInstance();
      discordMocks.mockedAxios.get.mockResolvedValue({ data: { results: [discordMocks.eventSameIdWithEvent] } });
      discordMocks.mockedAxios.put.mockResolvedValue({ data: { results: [] } });
      try {
        await DBEService.initDBE();
      } catch (e) {
        result = e;
      }
      expect(result).toBeNull();
    });
  });

  describe('initCommand()', () => {
    it('not admin', async () => {
      expect.assertions(2);
      // @ts-ignore
      discordMocks.user.hasPermission = () => false;
      await DBEService.initCommand(discordMocks.message, 'init notALang');
      // @ts-ignore
      discordMocks.user.hasPermission = () => true;
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').init.errors.admin.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').init.errors.admin.description);
    });
    it('lang not supported', async () => {
      expect.assertions(2);
      await DBEService.initCommand(discordMocks.message, 'init notALang');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').init.errors.badLang.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').init.errors.badLang.description);
    });
    it('not registered error', async () => {
      expect.assertions(2);
      discordMocks.mockedAxios.post.mockRejectedValue('ERROR');
      discordMocks.mockedAxios.get.mockResolvedValue({ data: { results: [] } });
      await DBEService.initCommand(discordMocks.message, 'init enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.description);
    });
    it('not registered success', async () => {
      expect.assertions(2);
      discordMocks.mockedAxios.post.mockResolvedValue({ data: { results: [] } });
      discordMocks.mockedAxios.get.mockResolvedValue({ data: { results: [] } });
      await DBEService.initCommand(discordMocks.message, 'init enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').init.create.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').init.create.description);
    });
    it('registered error', async () => {
      expect.assertions(2);
      discordMocks.mockedAxios.put.mockRejectedValue('ERROR');
      discordMocks.mockedAxios.get.mockResolvedValue({ data: { results: [] } });
      GlobalsService.getInstance().setGuildConfigs([{
        init_date: '',
        id: 'anID',
        guild_id: variableMocks.message.guild.id,
        channel_id: discordMocks.message.channel.id,
        i18n: 'enEN',
        timezone: 'Europe/Paris',
      } as GuildConfigInterface]);
      await DBEService.initCommand(discordMocks.message, 'init enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.description);
    });
    it('registered success', async () => {
      expect.assertions(2);
      discordMocks.mockedAxios.put.mockResolvedValue({ data: { results: [] } });
      discordMocks.mockedAxios.get.mockResolvedValue({ data: { results: [] } });
      GlobalsService.getInstance().setGuildConfigs([{
        init_date: '',
        id: 'anID',
        guild_id: variableMocks.message.guild.id,
        channel_id: discordMocks.message.channel.id,
        i18n: 'enEN',
        timezone: 'Europe/Paris',
      } as GuildConfigInterface]);
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
      GlobalsService.getInstance().setGuildConfigs([{
        init_date: '',
        id: 'anID',
        guild_id: variableMocks.message.guild.id,
        channel_id: discordMocks.message.channel.id,
        i18n: 'enEN',
        timezone: 'Europe/Paris',
      } as GuildConfigInterface]);
      await DBEService.newCommand(discordMocks.message, 'new 07/02/1970 21:00 "testTitle" "testDescription"', 'enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').new.errors.past.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').new.errors.past.description);
    });
    it('post error', async () => {
      expect.assertions(2);
      GlobalsService.getInstance().setGuildConfigs([{
        init_date: '',
        id: 'anID',
        guild_id: variableMocks.message.guild.id,
        channel_id: discordMocks.message.channel.id,
        i18n: 'enEN',
        timezone: 'Europe/Paris',
      } as GuildConfigInterface]);
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

  describe('editParticipants()', () => {
    it('no event', async () => {
      expect.assertions(2);
      discordMocks.mockedAxios.get.mockRejectedValue('ERROR');
      await DBEService.editParticipants(discordMocks.messageReaction, 'enEN', discordMocks.user, false);
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.description);
    });
    it('put error', async () => {
      expect.assertions(2);
      discordMocks.mockedAxios.get.mockResolvedValue({ data: { results: [discordMocks.event] } });
      discordMocks.mockedAxios.put.mockRejectedValue('ERROR');
      await DBEService.editParticipants(discordMocks.messageReaction, 'enEN', discordMocks.user, true);
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.description);
    });
    it('valid add', async () => {
      expect.assertions(1);
      discordMocks.mockedAxios.get.mockResolvedValue({ data: { results: [discordMocks.event] } });
      discordMocks.mockedAxios.put.mockResolvedValue({ data: { results: 'useless' } });
      await DBEService.editParticipants(discordMocks.messageReaction, 'enEN', discordMocks.user, true);
      expect(mockReactionMessageEditResult.embed.title).toStrictEqual(variableMocks.event.title);
    });
    it('valid remove', async () => {
      expect.assertions(1);
      discordMocks.mockedAxios.get.mockResolvedValue({ data: [discordMocks.event] });
      discordMocks.mockedAxios.put.mockResolvedValue({ data: { results: 'useless' } });
      await DBEService.editParticipants(discordMocks.messageReaction, 'enEN', discordMocks.user, false);
      expect(mockReactionMessageEditResult.embed.title).toStrictEqual(variableMocks.event.title);
    });
  });

  describe('deleteEvent()', () => {
    it('no event', async () => {
      expect.assertions(2);
      discordMocks.mockedAxios.get.mockRejectedValue('ERROR');
      await DBEService.deleteEvent(discordMocks.messageReaction, discordMocks.user, 'enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.description);
    });
    it('error delete', async () => {
      expect.assertions(2);
      discordMocks.mockedAxios.get.mockResolvedValue({ data: { results: [discordMocks.event] } });
      discordMocks.mockedAxios.delete.mockRejectedValue('ERROR');
      await DBEService.deleteEvent(discordMocks.messageReaction, discordMocks.user, 'enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.description);
    });
    it('valid', async () => {
      expect.assertions(2);
      discordMocks.mockedAxios.get.mockResolvedValue({ data: { results: [discordMocks.event] } });
      discordMocks.mockedAxios.delete.mockResolvedValue(
        { data: { results: [discordMocks.event] } },
      );
      await DBEService.deleteEvent(discordMocks.messageReaction, discordMocks.user, 'enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').delete.success.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').delete.success.description);
    });
  });

  describe('helpCommand()', () => {
    it('valid', () => {
      expect.assertions(1);
      DBEService.helpCommand(discordMocks.message, 'enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.help.title);
    });
  });

  describe('creditsCommand()', () => {
    it('valid', () => {
      expect.assertions(1);
      DBEService.creditsCommand(discordMocks.message, 'enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.credits.title);
    });
  });

  describe('syncEventMessage', () => {
    it('empty', async () => {
      expect.assertions(1);
      let result = null;
      discordMocks.mockedAxios.get.mockResolvedValue({ data: { results: [] } });
      try {
        await DBEService.syncEventsMessages();
      } catch (e) {
        result = e;
      }
      expect(result).toBeNull();
    });
    it('one', async () => {
      expect.assertions(1);
      let result = null;
      discordMocks.mockedAxios.get.mockResolvedValue({ data: { results: [discordMocks.event] } });
      try {
        await DBEService.syncEventsMessages();
      } catch (e) {
        result = e;
      }
      expect(result).toBeNull();
    });
  });
});
