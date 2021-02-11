import { MessagesServiceClass, MessagesService } from '@/services/Messages.service';
import {
  TextChannel, MessageEmbed, User, Client, Message,
} from 'discord.js';
import { GlobalsService } from '@/services/Globals.service';

describe('[Service] Messages', () => {
  let mockTestChannelSendResult: string | MessageEmbed;

  const mockTextChannel = {
    send: (message: string | MessageEmbed) => {
      mockTestChannelSendResult = message;
    },
  } as Partial<TextChannel>;

  const mockUser = {
    id: 'UnitTestMockUserID',
    username: 'UnitTestMockUserUsername',
    avatar: 'UnitTestMockUserAvatar',
  } as Partial<User>;

  const mockClient = {
    user: {
      id: 'UnitTestMockClientUserID',
      username: 'UnitTestMockClientUsername',
    },
  } as Partial<Client>;

  const message = {
    guild: {
      id: 'UnitTestMockMessageGuildID',
    },
    channel: {
      id: 'UnitTestMockChannelID',
    },
    author: mockUser,
  } as Partial<Message>;

  GlobalsService.getInstance().setDBE(mockClient as Client);

  beforeEach(() => {
    mockTestChannelSendResult = undefined;
    GlobalsService.getInstance().setServerConfigs([]);
  });

  describe('sendMessageByBot()', () => {
    it('message', async () => {
      expect.assertions(1);
      const string = 'UnitTestMessage';
      await MessagesServiceClass.sendMessageByBot(string, mockTextChannel as TextChannel);
      expect(mockTestChannelSendResult).toStrictEqual('UnitTestMessage');
    });

    it('embed', async () => {
      expect.assertions(1);
      const string = { title: 'unitTestEmbedTitle' } as MessageEmbed;
      await MessagesServiceClass.sendMessageByBot(string, mockTextChannel as TextChannel);
      expect(mockTestChannelSendResult).toStrictEqual({ embed: string });
    });
  });

  describe('getEmbedColorByLevel()', () => {
    it('send undefined', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        mockUser as User,
        undefined,
      );
      expect(result.color).toStrictEqual(12619008);
    });

    it('send error', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        mockUser as User,
        'error',
      );
      expect(result.color).toStrictEqual(16711680);
    });

    it('send info', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        mockUser as User,
        'info',
      );
      expect(result.color).toStrictEqual(36295);
    });

    it('send success', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        mockUser as User,
        'success',
      );
      expect(result.color).toStrictEqual(1744384);
    });

    it('send warning', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        mockUser as User,
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
        mockUser as User,
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
        mockUser as User,
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
        mockUser as User,
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
        mockUser as User,
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
        mockUser as User,
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
        mockUser as User,
        'success',
      );
      expect(result.title).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.credits.title);
      expect(result.description).toStrictEqual(GlobalsService.getInstance().I18N.get('enEN').system.credits.description);
      expect(result.footer.iconURL).toStrictEqual('https://api.svalinn.fr/uploads/STSG_logo_18d6b53017.png');
      expect(result.footer.text).toStrictEqual(`UnitTestMockClientUsername${GlobalsService.getInstance().I18N.get('enEN').embed.credits}`);
      expect(result.author.name).toStrictEqual('UnitTestMockUserUsername');
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
        mockUser as User,
        'success',
        { langMessageArgs: { version: 'UnitTestParseLangTest' } },
      );
      expect(result.description).toContain('UnitTestParseLangTest');
    });

    it('embed with thumbnail', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        mockUser as User,
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
        mockUser as User,
        'success',
        { image: 'https://UnitTestImage' },
      );
      expect(result.image.url).toStrictEqual('https://UnitTestImage');
    });
  });

  describe('getLangFromMessage()', () => {
    it('empty api', () => {
      expect.assertions(1);
      const result = MessagesService.getLangFromMessage(message as Message);
      expect(result).toBeNull();
    });
    it('should return frFR', () => {
      expect.assertions(1);
      GlobalsService.getInstance().setServerConfigs([
        {
          lang: 'frFR',
          channelID: 'UnitTestMockChannelID',
          serverID: 'UnitTestMockMessageGuildID',
          id: '',
          initialization: '',
        },
      ]);
      const result = MessagesService.getLangFromMessage(message as Message);
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
        message as Message,
        'UnitTestMockEventTitle',
        'UnitTestMockEventDescription $$time$$ $$day$$ $$participants$$',
        'UnitTestMockEventDay',
        'UnitTestMockEventTime',
        [],
      );
      expect(result.title).toStrictEqual('UnitTestMockEventTitle');
      expect(result.description).toContain('UnitTestMockEventDescription');
      expect(result.description).toContain('UnitTestMockEventDay');
      expect(result.description).toContain('UnitTestMockEventTime');
      expect(result.color).toStrictEqual(36295);
    });
    it('no participants', () => {
      expect.assertions(1);
      const result = MessagesService.generateEventEmbed(
        'enEN',
        message as Message,
        'UnitTestMockEventTitle',
        'UnitTestMockEventDescription $$time$$ $$day$$ $$participants$$',
        'UnitTestMockEventDay',
        'UnitTestMockEventTime',
        [],
      );
      expect(result.description).toContain(GlobalsService.getInstance().I18N.get('enEN').embed.event.noPeople);
    });
    it('one participants', () => {
      expect.assertions(1);
      const result = MessagesService.generateEventEmbed(
        'enEN',
        message as Message,
        'UnitTestMockEventTitle',
        'UnitTestMockEventDescription $$time$$ $$day$$ $$participants$$',
        'UnitTestMockEventDay',
        'UnitTestMockEventTime',
        ['UnitTestMockUserID'],
      );
      expect(result.description).toContain('<@!UnitTestMockUserID>');
    });
    it('two participants', () => {
      expect.assertions(2);
      const result = MessagesService.generateEventEmbed(
        'enEN',
        message as Message,
        'UnitTestMockEventTitle',
        'UnitTestMockEventDescription $$time$$ $$day$$ $$participants$$',
        'UnitTestMockEventDay',
        'UnitTestMockEventTime',
        ['UnitTestMockUserID', 'UnitTestMockUserID2'],
      );
      expect(result.description).toContain('<@!UnitTestMockUserID>');
      expect(result.description).toContain('<@!UnitTestMockUserID2>');
    });
  });

  describe('parseOptions()', () => {
    it('empty options', () => {
      expect.assertions(3);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        mockUser as User,
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
        mockUser as User,
        'success',
        { image: 'https://UnitTestURL' },
      );
      expect(result.image.url).toStrictEqual('https://UnitTestURL');
    });
    it('just thumbnail', () => {
      expect.assertions(1);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        mockUser as User,
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
        mockUser as User,
        'success',
        { langMessageArgs: { version: 'UnitTestMockVersion' } },
      );
      expect(result.description).toContain('UnitTestMockVersion');
    });
    it('full', () => {
      expect.assertions(3);
      const result = MessagesService.generateEmbed(
        GlobalsService.getInstance().I18N.get('enEN'),
        GlobalsService.getInstance().I18N.get('enEN').system.credits,
        mockUser as User,
        'success',
        { langMessageArgs: { version: 'UnitTestMockVersion' }, thumbnail: 'success', image: 'https://UnitTestURL' },
      );
      expect(result.image.url).toStrictEqual('https://UnitTestURL');
      expect(result.thumbnail.url).toStrictEqual('https://api.svalinn.fr/uploads/success_71c71fab10.png');
      expect(result.description).toContain('UnitTestMockVersion');
    });
  });
});
