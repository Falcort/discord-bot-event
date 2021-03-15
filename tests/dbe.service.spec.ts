import { DBEService } from '@/services/DBE.service';
import { GlobalsService } from '@/services/Globals.service';
import GuildConfigInterface from '@/interfaces/guild-config.interface';
import { Message, MessageReaction } from 'discord.js';
import { mockedAxios } from './utils/mocked-axios';
import { constantMocks } from './utils/mocks-constants';
import { eventSameIdWithEvent, eventSameNumberParticpants, event } from './utils/event-constants';
import {
  message, messageReaction, mockMessageReactions, mockReactionMessageEditResult,
} from './utils/message-constants';
import { mockTestMessageAuthorSendResult, user, userAuthor } from './utils/user-constants';

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
      mockedAxios.get.mockResolvedValue({ data: { results: [] } });
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
      // eslint-disable-next-line no-restricted-globals,no-undef
      mockedAxios.get.mockResolvedValue({ data: { results: [event] } });
      try {
        await DBEService.initDBE();
      } catch (e) {
        result = e;
      }
      expect(result).toBeNull();
    });
    it('notText', async () => {
      expect.assertions(1);
      process.env.IS_TEXT = 'false';
      let result = null;
      mockedAxios.get.mockResolvedValue({ data: { results: [event] } });
      try {
        await DBEService.initDBE();
      } catch (e) {
        result = e;
      }
      expect(result).toBeNull();
      delete process.env.IS_TEXT;
    });
    it('synchronise event with same number of participants', async () => {
      expect.assertions(1);
      let result = null;
      mockedAxios.get.mockResolvedValue({ data: { results: [eventSameNumberParticpants] } });
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
      mockedAxios.get.mockResolvedValue((url) => {
        if (url.contains('dbe-guild-configs.dbe-guild-configs')) {
          return {
            data: {
              results: [{
                i18n: 'enEN',
                channel_id: constantMocks.message.channel.id,
                guild_id: message.guild.id,
                id: constantMocks.serverConfig.id,
                init_date: '',
                timezone: 'Europe/Paris',
              }],
            },
          };
        }
        return { data: { results: [constantMocks.event] } };
      });
      mockedAxios.put.mockResolvedValue({ data: { results: [] } });
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
      user.hasPermission = () => false;
      await DBEService.initCommand(message as Message, 'init notALang');
      // @ts-ignore
      user.hasPermission = () => true;
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').init.errors.admin.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').init.errors.admin.description);
    });
    it('lang not supported', async () => {
      expect.assertions(2);
      await DBEService.initCommand(message as Message, 'init notALang');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').init.errors.badLang.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').init.errors.badLang.description);
    });
    it('not registered error', async () => {
      expect.assertions(2);
      mockedAxios.post.mockRejectedValue('ERROR');
      mockedAxios.put.mockResolvedValue(null);
      mockedAxios.get.mockResolvedValue({ data: { results: [] } });
      await DBEService.initCommand(message as Message, 'init enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.description);
    });
    it('not registered success', async () => {
      expect.assertions(2);
      mockedAxios.post.mockResolvedValue({ data: { results: [] } });
      mockedAxios.get.mockResolvedValue({ data: { results: [] } });
      await DBEService.initCommand(message as Message, 'init enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').init.create.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').init.create.description);
    });
    it('registered error', async () => {
      expect.assertions(2);
      mockedAxios.put.mockRejectedValue('ERROR');
      mockedAxios.get.mockResolvedValue({ data: { results: [] } });
      GlobalsService.getInstance().setGuildConfigs([{
        init_date: '',
        id: 'anID',
        guild_id: constantMocks.message.guild.id,
        channel_id: constantMocks.message.channel.id,
        i18n: 'enEN',
        timezone: 'Europe/Paris',
      } as GuildConfigInterface]);
      await DBEService.initCommand(message as Message, 'init enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.description);
    });
    it('registered success', async () => {
      expect.assertions(2);
      mockedAxios.put.mockResolvedValue({ data: { results: [] } });
      mockedAxios.get.mockResolvedValue({ data: { results: [] } });
      GlobalsService.getInstance().setGuildConfigs([{
        init_date: '',
        id: 'anID',
        guild_id: constantMocks.message.guild.id,
        channel_id: message.channel.id,
        i18n: 'enEN',
        timezone: 'Europe/Paris',
      } as GuildConfigInterface]);
      await DBEService.initCommand(message as Message, 'init enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').init.update.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').init.update.description);
    });
    it('time zone arg is valid', async () => {
      expect.assertions(1);
      mockedAxios.put.mockResolvedValue({ data: { results: [] } });
      mockedAxios.get.mockResolvedValue({ data: { results: [] } });
      GlobalsService.getInstance().setGuildConfigs([{
        init_date: '',
        id: 'anID',
        guild_id: constantMocks.message.guild.id,
        channel_id: message.channel.id,
        i18n: 'enEN',
        timezone: 'Europe/Paris',
      } as GuildConfigInterface]);
      await DBEService.initCommand(message as Message, 'init frFR Europe/Paris');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('frFR').init.update.title);
    });
    it('time zone arg is not valid', async () => {
      expect.assertions(1);
      await DBEService.initCommand(message as Message, 'frFR Europe/Rio');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').init.errors.badLang.title);
    });
  });

  describe('newCommand()', () => {
    it('wrong args', async () => {
      expect.assertions(2);
      await DBEService.newCommand(message as Message, 'invalid Args', 'enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').new.errors.badRegex.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').new.errors.badRegex.description);
    });
    it('event in the past', async () => {
      expect.assertions(2);
      GlobalsService.getInstance().setGuildConfigs([{
        init_date: '',
        id: 'anID',
        guild_id: message.guild.id,
        channel_id: constantMocks.message.channel.id,
        i18n: 'enEN',
        timezone: 'Europe/Paris',
      } as GuildConfigInterface]);
      await DBEService.newCommand(message as Message, 'new 07/02/1970 21:00 "testTitle" "testDescription"', 'enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').new.errors.past.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').new.errors.past.description);
    });
    it('post error', async () => {
      expect.assertions(2);
      GlobalsService.getInstance().setGuildConfigs([{
        init_date: '',
        id: 'anID',
        guild_id: constantMocks.message.guild.id,
        channel_id: message.channel.id,
        i18n: 'enEN',
        timezone: 'Europe/Paris',
      } as GuildConfigInterface]);
      mockedAxios.post.mockRejectedValue('ERROR');
      await DBEService.newCommand(message as Message, 'new 07/02/2100 21:00 "testTitle" "testDescription"', 'enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.description);
    });
    it('valid', async () => {
      expect.assertions(2);
      mockedAxios.post.mockResolvedValue({ data: constantMocks.event });
      await DBEService.newCommand(message as Message, 'new 07/02/2100 21:00 "testTitle" "testDescription"', 'enEN');
      expect(mockMessageReactions).toContain(GlobalsService.getInstance().REACTION_EMOJI_INVALID);
      expect(mockMessageReactions).toContain(GlobalsService.getInstance().REACTION_EMOJI_VALID);
    });
  });

  describe('editParticipants()', () => {
    it('no event', async () => {
      expect.assertions(2);
      mockedAxios.get.mockRejectedValue('ERROR');
      await DBEService.editParticipants(messageReaction as MessageReaction, 'enEN', user, false);
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.description);
    });
    it('put error', async () => {
      expect.assertions(2);
      mockedAxios.get.mockResolvedValue({ data: { results: [event] } });
      mockedAxios.put.mockRejectedValue('ERROR');
      await DBEService.editParticipants(messageReaction as MessageReaction, 'enEN', user, true);
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.description);
    });
    it('valid add', async () => {
      expect.assertions(1);
      mockedAxios.get.mockResolvedValue({ data: { results: [event] } });
      mockedAxios.put.mockResolvedValue({ data: { results: 'useless' } });
      await DBEService.editParticipants(messageReaction as MessageReaction, 'enEN', user, true);
      expect(mockReactionMessageEditResult.embed.title).toStrictEqual(constantMocks.event.title);
    });
    it('not valid add', async () => {
      expect.assertions(1);
      mockedAxios.get.mockResolvedValue({ data: { results: [event] } });
      mockedAxios.put.mockResolvedValue({ data: { results: 'useless' } });
      await DBEService.editParticipants(messageReaction as MessageReaction, 'enEN', user, false);
      expect(mockReactionMessageEditResult.embed.title).toStrictEqual(constantMocks.event.title);
    });
    it('valid remove', async () => {
      expect.assertions(1);
      mockedAxios.get.mockResolvedValue({ data: [event] });
      mockedAxios.put.mockResolvedValue({ data: { results: 'useless' } });
      await DBEService.editParticipants(messageReaction as MessageReaction, 'enEN', user, false);
      expect(mockReactionMessageEditResult.embed.title).toStrictEqual(constantMocks.event.title);
    });
  });

  describe('deleteEvent()', () => {
    it('no event', async () => {
      expect.assertions(2);
      mockedAxios.get.mockRejectedValue('ERROR');
      await DBEService.deleteEvent(messageReaction as MessageReaction, user, 'enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.description);
    });
    it('error delete', async () => {
      expect.assertions(2);
      mockedAxios.get.mockResolvedValue({ data: { results: [constantMocks.event] } });
      mockedAxios.delete.mockRejectedValue('ERROR');
      await DBEService.deleteEvent(messageReaction as MessageReaction, user, 'enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.unknownError.description);
    });
    it('valid and admin', async () => {
      expect.assertions(2);
      mockedAxios.get.mockResolvedValue({ data: { results: [constantMocks.event] } });
      mockedAxios.delete.mockResolvedValue(
        { data: { results: [constantMocks.event] } },
      );
      await DBEService.deleteEvent(messageReaction as MessageReaction, user, 'enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').delete.success.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').delete.success.description);
    });
    it('valid and author', async () => {
      expect.assertions(2);
      mockedAxios.get.mockResolvedValue({ data: { results: [constantMocks.event] } });
      mockedAxios.delete.mockResolvedValue(
        { data: { results: [constantMocks.event] } },
      );
      await DBEService.deleteEvent(messageReaction as MessageReaction, userAuthor, 'enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').delete.success.title);
      expect(mockTestMessageAuthorSendResult.embed.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').delete.success.description);
    });
  });

  describe('helpCommand()', () => {
    it('valid', () => {
      expect.assertions(1);
      DBEService.helpCommand(message as Message, 'enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.help.title);
    });
  });

  describe('creditsCommand()', () => {
    it('valid', () => {
      expect.assertions(1);
      DBEService.creditsCommand(message as Message, 'enEN');
      expect(mockTestMessageAuthorSendResult.embed.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.credits.title);
    });
  });

  describe('syncEventMessage', () => {
    it('empty', async () => {
      expect.assertions(1);
      let result = null;
      mockedAxios.get.mockResolvedValue({ data: { results: [] } });
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
      mockedAxios.get.mockResolvedValue({ data: { results: [event] } });
      try {
        await DBEService.syncEventsMessages();
      } catch (e) {
        result = e;
      }
      expect(result).toBeNull();
    });
  });
});
