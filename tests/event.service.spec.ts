import { EventsService } from '@/services/Events.service';
import { GlobalsService } from '@/services/Globals.service';
import { Message } from 'discord.js';
import { event } from './utils/event-constants';
import { serverConfig } from './utils/server-config-constants';
import { message } from './utils/message-constants';
import { constantMocks } from './utils/mocks-constants';
import { mockedAxios } from './utils/mocked-axios';
import {errorResponse} from "./utils/error-constants";

// eslint-disable-next-line import/extensions

jest.mock('axios');

describe('[Service] Events', () => {
  describe('postEvent()', () => {
    it('valid', async () => {
      expect.assertions(1);
      mockedAxios.post.mockResolvedValue({ data: serverConfig });
      const result = await EventsService.postEvent('', GlobalsService.getInstance().I18N.get('enEN').system.credits, message as Message, constantMocks.user.id);
      expect(result).not.toBeNull();
    });
    it('image', async () => {
      expect.assertions(1);
      mockedAxios.post.mockResolvedValue({ data: constantMocks.serverConfig });
      const result = await EventsService.postEvent('', GlobalsService.getInstance().I18N.get('enEN').system.credits, message as Message, constantMocks.user.id, constantMocks.image);
      expect(result).not.toBeNull();
    });
    it('error', async () => {
      expect.assertions(1);
      mockedAxios.post.mockRejectedValue('ERROR');
      const result = await EventsService.postEvent('', GlobalsService.getInstance().I18N.get('enEN').system.credits, message as Message, constantMocks.user.id);
      expect(result).toBeNull();
    });
    it('error.data Stringify', async () => {
      expect.assertions(1);
      mockedAxios.post.mockRejectedValue(errorResponse);
      const result = await EventsService.postEvent('', GlobalsService.getInstance().I18N.get('enEN').system.credits, message as Message, constantMocks.user.id);
      expect(result).toBeNull();
    });
  });

  describe('getEvents()', () => {
    it('empty', async () => {
      expect.assertions(1);
      mockedAxios.get.mockResolvedValue({ data: { results: [] } });
      const result = await EventsService.getEvents();
      expect(result).toStrictEqual([]);
    });
    it('one', async () => {
      expect.assertions(1);
      mockedAxios.get.mockResolvedValue({ data: { results: [constantMocks.event] } });
      const result = await EventsService.getEvents();
      expect(result).toStrictEqual([constantMocks.event]);
    });
    it('two', async () => {
      expect.assertions(3);
      // eslint-disable-next-line max-len
      mockedAxios.get.mockResolvedValue({ data: { results: [constantMocks.event, constantMocks.event] } });
      const result = await EventsService.getEvents();
      expect(result[0]).toStrictEqual(constantMocks.event);
      expect(result[1]).toStrictEqual(constantMocks.event);
      expect(result).toHaveLength(2);
    });
    it('error', async () => {
      expect.assertions(1);
      mockedAxios.get.mockRejectedValue('ERROR');
      const result = await EventsService.getEvents();
      expect(result).toStrictEqual([]);
    });
    it('error.data Stringify', async () => {
      expect.assertions(1);
      mockedAxios.get.mockRejectedValue(errorResponse);
      const result = await EventsService.getEvents();
      expect(result).toStrictEqual([]);
    });
  });

  describe('putEventParticipants()', () => {
    it('valid', async () => {
      expect.assertions(1);
      mockedAxios.put.mockResolvedValue({ data: event });
      // eslint-disable-next-line max-len
      const result = await EventsService.putEventParticipants({ users: constantMocks.eventInterface.participants }, constantMocks.eventInterface.id);
      expect(result).not.toBeNull();
    });
    it('error', async () => {
      expect.assertions(1);
      mockedAxios.put.mockRejectedValue('ERROR');
      // eslint-disable-next-line max-len
      const result = await EventsService.putEventParticipants({ users: constantMocks.eventInterface.participants }, constantMocks.eventInterface.id);
      expect(result).toBeNull();
    });
    it('error.data Stringify', async () => {
      expect.assertions(1);
      mockedAxios.put.mockRejectedValue(errorResponse);
      // eslint-disable-next-line max-len
      const result = await EventsService.putEventParticipants({ users: constantMocks.eventInterface.participants }, constantMocks.eventInterface.id);
      expect(result).toBeNull();
    });
  });

  describe('deleteEvent()', () => {
    it('valid', async () => {
      expect.assertions(1);
      mockedAxios.delete.mockResolvedValue({ data: constantMocks.event });
      const result = await EventsService.deleteEvent(constantMocks.eventInterface.id);
      expect(result).not.toBeNull();
    });
    it('error', async () => {
      expect.assertions(1);
      mockedAxios.delete.mockRejectedValue('ERROR');
      const result = await EventsService.deleteEvent(constantMocks.eventInterface.id);
      expect(result).toBeNull();
    });
    it('error.data Stringify', async () => {
      expect.assertions(1);
      mockedAxios.delete.mockRejectedValue(errorResponse);
      const result = await EventsService.deleteEvent(constantMocks.eventInterface.id);
      expect(result).toBeNull();
    });
  });

  describe('getEventFromMessageID()', () => {
    it('empty', async () => {
      expect.assertions(1);
      mockedAxios.get.mockResolvedValue({ data: { results: [] } });
      const result = await EventsService.getEventFromMessageID(constantMocks.message.id);
      expect(result).toStrictEqual([]);
    });
    it('one', async () => {
      expect.assertions(1);
      mockedAxios.get.mockResolvedValue({ data: { results: [constantMocks.event] } });
      const result = await EventsService.getEventFromMessageID(constantMocks.message.id);
      expect(result).toStrictEqual(constantMocks.event);
    });
    it('error', async () => {
      expect.assertions(1);
      mockedAxios.get.mockRejectedValue('ERROR');
      const result = await EventsService.getEventFromMessageID(constantMocks.message.id);
      expect(result).toBeNull();
    });
    it('error.data Stringify', async () => {
      expect.assertions(1);
      mockedAxios.get.mockRejectedValue(errorResponse);
      const result = await EventsService.getEventFromMessageID(constantMocks.message.id);
      expect(result).toBeNull();
    });
  });
});
