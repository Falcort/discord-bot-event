import { EventsService } from '@/services/Events.service';
import { GlobalsService } from '@/services/Globals.service';
// eslint-disable-next-line import/extensions
import { discordMocks, variableMocks } from './variables';

jest.mock('axios');

describe('[Service] Events', () => {
  describe('postEvent()', () => {
    it('valid', async () => {
      expect.assertions(1);
      discordMocks.mockedAxios.post.mockResolvedValue({ data: discordMocks.serverConfig });
      const result = await EventsService.postEvent('', GlobalsService.getInstance().I18N.get('enEN').system.credits, discordMocks.message, variableMocks.user.id);
      expect(result).not.toBeNull();
    });
    it('image', async () => {
      expect.assertions(1);
      discordMocks.mockedAxios.post.mockResolvedValue({ data: discordMocks.serverConfig });
      const result = await EventsService.postEvent('', GlobalsService.getInstance().I18N.get('enEN').system.credits, discordMocks.message, variableMocks.user.id, variableMocks.image);
      expect(result).not.toBeNull();
    });
    it('error', async () => {
      expect.assertions(1);
      discordMocks.mockedAxios.post.mockRejectedValue('ERROR');
      const result = await EventsService.postEvent('', GlobalsService.getInstance().I18N.get('enEN').system.credits, discordMocks.message, variableMocks.user.id);
      expect(result).toBeNull();
    });
  });

  describe('getEvents()', () => {
    it('empty', async () => {
      expect.assertions(1);
      discordMocks.mockedAxios.get.mockResolvedValue({ data: [] });
      const result = await EventsService.getEvents();
      expect(result).toStrictEqual([]);
    });
    it('one', async () => {
      expect.assertions(1);
      discordMocks.mockedAxios.get.mockResolvedValue({ data: [discordMocks.event] });
      const result = await EventsService.getEvents();
      expect(result).toStrictEqual([discordMocks.event]);
    });
    it('two', async () => {
      expect.assertions(3);
      // eslint-disable-next-line max-len
      discordMocks.mockedAxios.get.mockResolvedValue({ data: [discordMocks.event, discordMocks.event] });
      const result = await EventsService.getEvents();
      expect(result[0]).toStrictEqual(discordMocks.event);
      expect(result[1]).toStrictEqual(discordMocks.event);
      expect(result).toHaveLength(2);
    });
    it('error', async () => {
      expect.assertions(1);
      discordMocks.mockedAxios.get.mockRejectedValue('ERROR');
      const result = await EventsService.getEvents();
      expect(result).toStrictEqual([]);
    });
  });

  describe('putEventParticipants()', () => {
    it('valid', async () => {
      expect.assertions(1);
      discordMocks.mockedAxios.put.mockResolvedValue({ data: discordMocks.event });
      // eslint-disable-next-line max-len
      const result = await EventsService.putEventParticipants(variableMocks.eventInterface.participants, variableMocks.eventInterface.id);
      expect(result).not.toBeNull();
    });
    it('error', async () => {
      expect.assertions(1);
      discordMocks.mockedAxios.put.mockRejectedValue('ERROR');
      // eslint-disable-next-line max-len
      const result = await EventsService.putEventParticipants(variableMocks.eventInterface.participants, variableMocks.eventInterface.id);
      expect(result).toBeNull();
    });
  });

  describe('deleteEvent()', () => {
    it('valid', async () => {
      expect.assertions(1);
      discordMocks.mockedAxios.delete.mockResolvedValue({ data: discordMocks.event });
      const result = await EventsService.deleteEvent(variableMocks.eventInterface.id);
      expect(result).not.toBeNull();
    });
    it('error', async () => {
      expect.assertions(1);
      discordMocks.mockedAxios.delete.mockRejectedValue('ERROR');
      const result = await EventsService.deleteEvent(variableMocks.eventInterface.id);
      expect(result).toBeNull();
    });
  });

  describe('getEventFromMessageID()', () => {
    it('empty', async () => {
      expect.assertions(1);
      discordMocks.mockedAxios.get.mockResolvedValue({ data: [] });
      const result = await EventsService.getEventFromMessageID(variableMocks.message.id);
      expect(result).toStrictEqual([]);
    });
    it('one', async () => {
      expect.assertions(1);
      discordMocks.mockedAxios.get.mockResolvedValue({ data: [discordMocks.event] });
      const result = await EventsService.getEventFromMessageID(variableMocks.message.id);
      expect(result).toStrictEqual(discordMocks.event);
    });
    it('error', async () => {
      expect.assertions(1);
      discordMocks.mockedAxios.get.mockRejectedValue('ERROR');
      const result = await EventsService.getEventFromMessageID(variableMocks.message.id);
      expect(result).toBeNull();
    });
  });
});
