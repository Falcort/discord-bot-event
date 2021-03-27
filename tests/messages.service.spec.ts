import {
  MessagesServiceClass,
  MessagesService,
} from '@/services/Messages.service';
import { Message, MessageEmbed, TextChannel, User } from 'discord.js';
import { GlobalsService } from '@/services/Globals.service';
import constantMocks from './utils/mocks-constants';
import {
  mockTestChannelSendResult,
  textChannel,
} from './utils/text-channel-constants';
import { user } from './utils/user-constants';
import { message } from './utils/message-constants';

describe('[Service] Messages', () => {
  describe('sendMessageByBot()', () => {
    it('message', async () => {
      expect.assertions(1);
      const string = 'UnitTestMessage';
      await MessagesServiceClass.sendMessageByBot(
        string,
        textChannel as TextChannel,
      );
      expect(mockTestChannelSendResult).toStrictEqual('UnitTestMessage');
    });

    it('embed', async () => {
      expect.assertions(1);
      const string = { title: 'unitTestEmbedTitle' } as MessageEmbed;
      await MessagesServiceClass.sendMessageByBot(
        string,
        textChannel as TextChannel,
      );
      expect(mockTestChannelSendResult).toStrictEqual({ embed: string });
    });
  });

  describe('getEmbedColorByLevel()', () => {
    it('send undefined', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        user as User,
        undefined,
      );
      expect(result.color).toStrictEqual(12619008);
    });

    it('send error', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        user,
        'error',
      );
      expect(result.color).toStrictEqual(16711680);
    });

    it('send info', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        user,
        'info',
      );
      expect(result.color).toStrictEqual(36295);
    });

    it('send success', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        user,
        'success',
      );
      expect(result.color).toStrictEqual(1744384);
    });

    it('send warning', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        user,
        'warn',
      );
      expect(result.color).toStrictEqual(12619008);
    });
  });

  describe('getEmbedThumbnailByLevel()', () => {
    it('send undefined', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        user,
        undefined,
        { thumbnail: undefined },
      );
      expect(result.thumbnail).toBeUndefined();
    });

    it('send error', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        user,
        undefined,
        { thumbnail: 'error' },
      );
      expect(result.thumbnail.url).toStrictEqual(
        'https://api.svalinn.fr/uploads/error_acfe8a5a01.png',
      );
    });

    it('send info', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        user,
        undefined,
        { thumbnail: 'info' },
      );
      expect(result.thumbnail.url).toStrictEqual(
        'https://api.svalinn.fr/uploads/info_c2aa23440d.png',
      );
    });

    it('send success', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        user,
        undefined,
        { thumbnail: 'success' },
      );
      expect(result.thumbnail.url).toStrictEqual(
        'https://api.svalinn.fr/uploads/success_86555f3264.png',
      );
    });

    it('send warning', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        user,
        undefined,
        { thumbnail: 'warn' },
      );
      expect(result.thumbnail.url).toStrictEqual(
        'https://api.svalinn.fr/uploads/warning_1c37e7b470.png',
      );
    });
  });

  describe('generateEmbed()', () => {
    it('basic embed', () => {
      expect.assertions(9);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        user,
        'success',
      );
      expect(result.title).toStrictEqual(
        GlobalsService.getInstance().I18N.get('enEN').system.credits.title,
      );
      expect(result.description).toStrictEqual(
        GlobalsService.getInstance().I18N.get('enEN').system.credits
          .description,
      );
      expect(result.footer.iconURL).toStrictEqual(
        'https://api.svalinn.fr/uploads/STSG_logo_c76f1420c7.png',
      );
      expect(result.footer.text).toStrictEqual(
        `${constantMocks.client.user.username}${
          GlobalsService.getInstance().I18N.get('enEN').embed.credits
        }`,
      );
      expect(result.author.name).toStrictEqual(constantMocks.user.username);
      expect(result.author.iconURL).toStrictEqual(
        'https://cdn.discordapp.com/avatars/UnitTestMockUserID/UnitTestMockUserAvatar.png?size=2048',
      );
      expect(result.color).toStrictEqual(1744384);
      expect(result.thumbnail).toBeUndefined();
      expect(result.image).toBeUndefined();
    });

    it('embed with parseLang', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        user,
        'success',
        { langMessageArgs: { version: constantMocks.version } },
      );
      expect(result.description).toContain(constantMocks.version);
    });

    it('embed with thumbnail', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        user,
        'success',
        { thumbnail: 'success' },
      );
      expect(result.thumbnail.url).toStrictEqual(
        'https://api.svalinn.fr/uploads/success_86555f3264.png',
      );
    });

    it('embed with image', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        user,
        'success',
        { image: constantMocks.image },
      );
      expect(result.image.url).toStrictEqual(constantMocks.image);
    });
  });

  describe('getLangFromMessage()', () => {
    it('empty api', () => {
      expect.assertions(1);
      GlobalsService.getInstance().setGuildConfigs([]);
      const result = MessagesService.getLangFromMessage(message as Message);
      GlobalsService.getInstance().setGuildConfigs([
        {
          i18n: 'frFR',
          channel_id: constantMocks.message.channel.id,
          guild_id: constantMocks.message.guild.id,
          id: 'id',
          init_date: '',
          timezone: 'Europe/Paris',
        },
      ]);
      expect(result).toBeNull();
    });
    it('should return frFR', () => {
      expect.assertions(1);
      GlobalsService.getInstance().setGuildConfigs([
        {
          i18n: 'frFR',
          channel_id: constantMocks.message.channel.id,
          guild_id: constantMocks.message.guild.id,
          id: 'id',
          init_date: '',
          timezone: 'Europe/Paris',
        },
      ]);
      const result = MessagesService.getLangFromMessage(message as Message);
      expect(result).toStrictEqual('frFR');
    });
  });

  describe('parseLangMessage', () => {
    it('one arg', () => {
      expect.assertions(1);
      const result = MessagesServiceClass.parseLangMessage('$$test$$ value', {
        test: 'UnitTest',
      });
      expect(result).toStrictEqual('UnitTest value');
    });
    it('two args', () => {
      expect.assertions(1);
      const result = MessagesServiceClass.parseLangMessage(
        '$$test$$ $$test2$$ value',
        { test: 'UnitTest', test2: 'UnitTest2' },
      );
      expect(result).toStrictEqual('UnitTest UnitTest2 value');
    });
    it('one arg multiple time', () => {
      expect.assertions(1);
      const result = MessagesServiceClass.parseLangMessage(
        '$$test$$ value $$test$$',
        { test: 'UnitTest' },
      );
      expect(result).toStrictEqual('UnitTest value UnitTest');
    });
  });

  describe('generateEventEmbed()', () => {
    it('basic event', () => {
      expect.assertions(5);
      const result = MessagesService.generateEventEmbed(
        'enEN',
        message as Message,
        constantMocks.event.title,
        constantMocks.event.description,
        constantMocks.event.day,
        constantMocks.event.time,
        [],
      );
      expect(result.title).toStrictEqual(constantMocks.event.title);
      expect(result.description).toContain('UnitTestMockEventDescription');
      expect(result.description).toContain(constantMocks.event.day);
      expect(result.description).toContain(constantMocks.event.time);
      expect(result.color).toStrictEqual(36295);
    });
    it('no participants', () => {
      expect.assertions(1);
      const result = MessagesService.generateEventEmbed(
        'enEN',
        message as Message,
        constantMocks.event.title,
        constantMocks.event.description,
        constantMocks.event.day,
        constantMocks.event.time,
        [],
      );
      expect(result.description).toContain(
        GlobalsService.getInstance().I18N.get('enEN').embed.event.noPeople,
      );
    });
    it('one participants', () => {
      expect.assertions(1);
      const result = MessagesService.generateEventEmbed(
        'enEN',
        message as Message,
        constantMocks.event.title,
        constantMocks.event.description,
        constantMocks.event.day,
        constantMocks.event.time,
        [constantMocks.user.id],
      );
      expect(result.description).toContain(`<@!${constantMocks.user.id}>`);
    });
    it('two participants', () => {
      expect.assertions(2);
      const result = MessagesService.generateEventEmbed(
        'enEN',
        message as Message,
        constantMocks.event.title,
        constantMocks.event.description,
        constantMocks.event.day,
        constantMocks.event.time,
        [constantMocks.user.id, 'UnitTestMockUserID2'],
      );
      expect(result.description).toContain(`<@!${constantMocks.user.id}>`);
      expect(result.description).toContain('<@!UnitTestMockUserID2>');
    });
  });

  describe('parseOptions()', () => {
    it('empty options', () => {
      expect.assertions(3);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        user,
        'success',
      );
      expect(result.image).toBeUndefined();
      expect(result.thumbnail).toBeUndefined();
      expect(result.description).toStrictEqual(
        GlobalsService.getInstance().I18N.get('enEN').system.credits
          .description,
      );
    });
    it('just image', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        user,
        'success',
        { image: constantMocks.url },
      );
      expect(result.image.url).toStrictEqual(constantMocks.url);
    });
    it('just thumbnail', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        user,
        'success',
        { thumbnail: 'success' },
      );
      expect(result.thumbnail.url).toStrictEqual(
        'https://api.svalinn.fr/uploads/success_86555f3264.png',
      );
    });
    it('just lang', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        user,
        'success',
        { langMessageArgs: { version: constantMocks.version } },
      );
      expect(result.description).toContain(constantMocks.version);
    });
    it('full', () => {
      expect.assertions(3);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        user,
        'success',
        {
          langMessageArgs: { version: constantMocks.version },
          thumbnail: 'success',
          image: constantMocks.url,
        },
      );
      expect(result.image.url).toStrictEqual(constantMocks.url);
      expect(result.thumbnail.url).toStrictEqual(
        'https://api.svalinn.fr/uploads/success_86555f3264.png',
      );
      expect(result.description).toContain(constantMocks.version);
    });
  });
});
