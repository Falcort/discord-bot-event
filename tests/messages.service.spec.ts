import { MessagesServiceClass, MessagesService } from '@/services/Messages.service';
import { MessageEmbed } from 'discord.js';
import { GlobalsService } from '@/services/Globals.service';
// eslint-disable-next-line import/extensions
import { variableMocks, discordMocks, mockTestChannelSendResult } from './variables';

describe('[Service] Messages', () => {
  beforeEach(() => {
    GlobalsService.getInstance().setServerConfigs([]);
  });

  describe('sendMessageByBot()', () => {
    it('message', async () => {
      expect.assertions(1);
      const string = 'UnitTestMessage';
      await MessagesServiceClass.sendMessageByBot(string, discordMocks.textChannel);
      expect(mockTestChannelSendResult).toStrictEqual('UnitTestMessage');
    });

    it('embed', async () => {
      expect.assertions(1);
      const string = { title: 'unitTestEmbedTitle' } as MessageEmbed;
      await MessagesServiceClass.sendMessageByBot(string, discordMocks.textChannel);
      expect(mockTestChannelSendResult).toStrictEqual({ embed: string });
    });
  });

  describe('getEmbedColorByLevel()', () => {
    it('send undefined', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        discordMocks.user,
        undefined,
      );
      expect(result.color).toStrictEqual(12619008);
    });

    it('send error', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        discordMocks.user,
        'error',
      );
      expect(result.color).toStrictEqual(16711680);
    });

    it('send info', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        discordMocks.user,
        'info',
      );
      expect(result.color).toStrictEqual(36295);
    });

    it('send success', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        discordMocks.user,
        'success',
      );
      expect(result.color).toStrictEqual(1744384);
    });

    it('send warning', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        discordMocks.user,
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
        discordMocks.user,
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
        discordMocks.user,
        undefined,
        { thumbnail: 'error' },
      );
      expect(result.thumbnail.url).toStrictEqual('https://api.svalinn.fr/uploads/error_14ec43ce67.png');
    });

    it('send info', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        discordMocks.user,
        undefined,
        { thumbnail: 'info' },
      );
      expect(result.thumbnail.url).toStrictEqual('https://api.svalinn.fr/uploads/info_1541ac9257.png');
    });

    it('send success', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        discordMocks.user,
        undefined,
        { thumbnail: 'success' },
      );
      expect(result.thumbnail.url).toStrictEqual('https://api.svalinn.fr/uploads/success_71c71fab10.png');
    });

    it('send warning', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        discordMocks.user,
        undefined,
        { thumbnail: 'warn' },
      );
      expect(result.thumbnail.url).toStrictEqual('https://api.svalinn.fr/uploads/warning_c1d004e4e0.png');
    });
  });

  describe('generateEmbed()', () => {
    it('basic embed', () => {
      expect.assertions(9);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        discordMocks.user,
        'success',
      );
      expect(result.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.credits.title);
      expect(result.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.credits.description);
      expect(result.footer.iconURL).toStrictEqual('https://api.svalinn.fr/uploads/STSG_logo_18d6b53017.png');
      expect(result.footer.text).toStrictEqual(`${variableMocks.client.user.username}${GlobalsService.getInstance().I18N.get('enEN').embed.credits}`);
      expect(result.author.name).toStrictEqual(variableMocks.user.username);
      expect(result.author.iconURL).toStrictEqual('https://cdn.discordapp.com/avatars/UnitTestMockUserID/UnitTestMockUserAvatar.png?size=2048');
      expect(result.color).toStrictEqual(1744384);
      expect(result.thumbnail).toBeUndefined();
      expect(result.image).toBeUndefined();
    });

    it('embed with parseLang', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        discordMocks.user,
        'success',
        { langMessageArgs: { version: variableMocks.version } },
      );
      expect(result.description).toContain(variableMocks.version);
    });

    it('embed with thumbnail', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        discordMocks.user,
        'success',
        { thumbnail: 'success' },
      );
      expect(result.thumbnail.url).toStrictEqual('https://api.svalinn.fr/uploads/success_71c71fab10.png');
    });

    it('embed with image', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        discordMocks.user,
        'success',
        { image: variableMocks.image },
      );
      expect(result.image.url).toStrictEqual(variableMocks.image);
    });
  });

  describe('getLangFromMessage()', () => {
    it('empty api', () => {
      expect.assertions(1);
      const result = MessagesService.getLangFromMessage(discordMocks.message);
      expect(result).toBeNull();
    });
    it('should return frFR', () => {
      expect.assertions(1);
      GlobalsService.getInstance().setServerConfigs([
        {
          lang: 'frFR',
          channelID: variableMocks.message.channel.id,
          serverID: variableMocks.message.guild.id,
          id: '',
          initialization: '',
        },
      ]);
      const result = MessagesService.getLangFromMessage(discordMocks.message);
      expect(result).toStrictEqual('frFR');
    });
  });

  describe('parseLangMessage', () => {
    it('one arg', () => {
      expect.assertions(1);
      const result = MessagesServiceClass.parseLangMessage('$$test$$ value', { test: 'UnitTest' });
      expect(result).toStrictEqual('UnitTest value');
    });
    it('two args', () => {
      expect.assertions(1);
      const result = MessagesServiceClass.parseLangMessage('$$test$$ $$test2$$ value', { test: 'UnitTest', test2: 'UnitTest2' });
      expect(result).toStrictEqual('UnitTest UnitTest2 value');
    });
    it('one arg multiple time', () => {
      expect.assertions(1);
      const result = MessagesServiceClass.parseLangMessage('$$test$$ value $$test$$', { test: 'UnitTest' });
      expect(result).toStrictEqual('UnitTest value UnitTest');
    });
  });

  describe('generateEventEmbed()', () => {
    it('basic event', () => {
      expect.assertions(5);
      const result = MessagesService.generateEventEmbed(
        'enEN',
        discordMocks.message,
        variableMocks.event.title,
        variableMocks.event.description,
        variableMocks.event.day,
        variableMocks.event.time,
        [],
      );
      expect(result.title).toStrictEqual(variableMocks.event.title);
      expect(result.description).toContain('UnitTestMockEventDescription');
      expect(result.description).toContain(variableMocks.event.day);
      expect(result.description).toContain(variableMocks.event.time);
      expect(result.color).toStrictEqual(36295);
    });
    it('no participants', () => {
      expect.assertions(1);
      const result = MessagesService.generateEventEmbed(
        'enEN',
        discordMocks.message,
        variableMocks.event.title,
        variableMocks.event.description,
        variableMocks.event.day,
        variableMocks.event.time,
        [],
      );
      expect(result.description).toContain(GlobalsService.getInstance().I18N.get('enEN').embed.event.noPeople);
    });
    it('one participants', () => {
      expect.assertions(1);
      const result = MessagesService.generateEventEmbed(
        'enEN',
        discordMocks.message,
        variableMocks.event.title,
        variableMocks.event.description,
        variableMocks.event.day,
        variableMocks.event.time,
        [variableMocks.user.id],
      );
      expect(result.description).toContain(`<@!${variableMocks.user.id}>`);
    });
    it('two participants', () => {
      expect.assertions(2);
      const result = MessagesService.generateEventEmbed(
        'enEN',
        discordMocks.message,
        variableMocks.event.title,
        variableMocks.event.description,
        variableMocks.event.day,
        variableMocks.event.time,
        [variableMocks.user.id, 'UnitTestMockUserID2'],
      );
      expect(result.description).toContain(`<@!${variableMocks.user.id}>`);
      expect(result.description).toContain('<@!UnitTestMockUserID2>');
    });
  });

  describe('parseOptions()', () => {
    it('empty options', () => {
      expect.assertions(3);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        discordMocks.user,
        'success',
      );
      expect(result.image).toBeUndefined();
      expect(result.thumbnail).toBeUndefined();
      expect(result.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.credits.description);
    });
    it('just image', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        discordMocks.user,
        'success',
        { image: variableMocks.url },
      );
      expect(result.image.url).toStrictEqual(variableMocks.url);
    });
    it('just thumbnail', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        discordMocks.user,
        'success',
        { thumbnail: 'success' },
      );
      expect(result.thumbnail.url).toStrictEqual('https://api.svalinn.fr/uploads/success_71c71fab10.png');
    });
    it('just lang', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        discordMocks.user,
        'success',
        { langMessageArgs: { version: variableMocks.version } },
      );
      expect(result.description).toContain(variableMocks.version);
    });
    it('full', () => {
      expect.assertions(3);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        discordMocks.user,
        'success',
        { langMessageArgs: { version: variableMocks.version }, thumbnail: 'success', image: variableMocks.url },
      );
      expect(result.image.url).toStrictEqual(variableMocks.url);
      expect(result.thumbnail.url).toStrictEqual('https://api.svalinn.fr/uploads/success_71c71fab10.png');
      expect(result.description).toContain(variableMocks.version);
    });
  });
});
