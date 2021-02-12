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
        `${this.GLOBALS.API_URL}/dbe-events/`,
        {
          date,
          title: embed.title,
          description: embed.description,
          participants: [],
          image,
          messageID: message.id,
          serverID: message.guild.id,
          channelID: message.channel.id,
          authorID,
        },
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
      const request = await Axios.get(`${this.GLOBALS.API_URL}/dbe-events?date_gte=${date}`);
      result = request.data;
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
    participants: string[],
    eventID: string,
  ): Promise<EventInterface> {
    let result = null;
    try {
      const request = await Axios.put(`${this.GLOBALS.API_URL}/dbe-events/${eventID}`, { participants });
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
      const request = await Axios.delete(`${this.GLOBALS.API_URL}/dbe-events/${eventID}`);
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
      const request = await Axios.get(`${this.GLOBALS.API_URL}/dbe-events?messageID_eq=${messageID}`);
      result = request.data.pop() || [];
    } catch (e) {
      Logger.error(`Exception in getEventFromMessageID() :\n ${e.response ? JSON.stringify(e.response.data) : e}`);
    }
    return result;
  }
}
export const EventsService = new EventsServiceClass();
