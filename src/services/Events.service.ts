import { EmbedTextInterface } from '@/interfaces/i18n.interface';
import Axios from 'axios';
import { GlobalsService, GlobalsServiceClass } from '@/services/Globals.service';
import EventInterface from '@/interfaces/event.interface';
import { DateTime } from 'luxon';
import { Message } from 'discord.js';
import Logger from '@/services/Logger.service';

export class EventsServiceClass {
  private readonly GLOBALS: GlobalsServiceClass;

  constructor() {
    this.GLOBALS = GlobalsService.getInstance();
  }

  /**
   * Function to register a new event
   *
   * @param date -- Date of the event in UTC
   * @param embed -- The embedText to get the title and description
   * @param message -- The message to get the IDs
   * @param authorID -- ID of the event author
   * @param image -- The image if there is one
   */
  public async postEvent(
    date: string,
    embed: EmbedTextInterface,
    message: Message,
    authorID: string,
    image?: string,
  ): Promise<EventInterface> {
    let result = null;
    try {
      const request = await Axios.post(
        `${this.GLOBALS.API_URL}/content-manager/collection-types/application::dbe-events.dbe-events`,
        {
          event_date: date,
          title: embed.title,
          description: embed.description,
          participants: { users: [] },
          image,
          message_id: message.id,
          guild_id: message.guild.id,
          channel_id: message.channel.id,
          author_id: authorID,
        },
        { headers: { Authorization: `Bearer ${this.GLOBALS.JWT}` } },
      );
      result = request.data;
    } catch (e) {
      Logger.error(`Exception in postEvent() :\n ${e.response ? JSON.stringify(e.response.data) : e}`);
    }
    return result;
  }

  /**
   * Function to retrieve event from the backend
   */
  public async getEvents(): Promise<EventInterface[]> {
    let result = [];
    try {
      const date = DateTime.local().toUTC();
      const request = await Axios.get(`${this.GLOBALS.API_URL}/content-manager/collection-types/application::dbe-events.dbe-events?event_date_gte=${date}`, { headers: { Authorization: `Bearer ${this.GLOBALS.JWT}` } });
      result = request.data.results;
    } catch (e) {
      Logger.error(`Exception in getEvents() :\n ${e.response ? JSON.stringify(e.response.data) : e}`);
    }
    return result;
  }

  /**
   * Function to add or remove a participant to an event
   *
   * @param participants -- List of the participants
   * @param eventID -- The ID of the event to patch
   */
  public async putEventParticipants(
    participants: { users : string[] },
    eventID: string,
  ): Promise<EventInterface> {
    let result = null;
    try {
      const request = await Axios.put(`${this.GLOBALS.API_URL}/content-manager/collection-types/application::dbe-events.dbe-events/${eventID}`, { participants }, { headers: { Authorization: `Bearer ${this.GLOBALS.JWT}` } });
      result = request.data;
    } catch (e) {
      Logger.error(`Exception in putEventParticipants() :\n ${e.response ? JSON.stringify(e.response.data) : e}`);
    }
    return result;
  }

  /**
   * Function to delete and event
   *
   * @param eventID -- The IF of the event to delete
   */
  public async deleteEvent(eventID: string): Promise<EventInterface> {
    let result = null;
    try {
      const request = await Axios.delete(`${this.GLOBALS.API_URL}/content-manager/collection-types/application::dbe-events.dbe-events/${eventID}`, { headers: { Authorization: `Bearer ${this.GLOBALS.JWT}` } });
      result = request.data;
    } catch (e) {
      Logger.error(`Exception in deleteEvent() :\n ${e.response ? JSON.stringify(e.response.data) : e}`);
    }
    return result;
  }

  /**
   * Function to get and event from the messageID
   *
   * @param messageID -- The messageID
   */
  public async getEventFromMessageID(messageID: string): Promise<EventInterface> {
    let result = null;
    try {
      const request = await Axios.get(`${this.GLOBALS.API_URL}/content-manager/collection-types/application::dbe-events.dbe-events?message_id_eq=${messageID}`, { headers: { Authorization: `Bearer ${this.GLOBALS.JWT}` } });
      result = request.data.results.pop() || [];
    } catch (e) {
      Logger.error(`Exception in getEventFromMessageID() :\n ${e.response ? JSON.stringify(e.response.data) : e}`);
    }
    return result;
  }
}
export const EventsService = new EventsServiceClass();
