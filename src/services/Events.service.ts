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
   * @param image -- The image if there is one
   */
  public async postEvent(
    date: string,
    embed: EmbedTextInterface,
    message: Message,
    image?: string,
  ): Promise<boolean> {
    let result = false;
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
        },
      );
      result = request.status === 200;
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
   * Function to get and event from the messageID
   *
   * @param messageID -- The messageID
   */
  public async getEventFromMessageID(messageID: string): Promise<EventInterface> {
    let result = null;
    try {
      const request = await Axios.get(`${this.GLOBALS.API_URL}/dbe-events?messageID_eq=${messageID}`);
      result = request.data.pop();
    } catch (e) {
      Logger.error(`Exception in getEventFromMessageID() :\n ${e.response ? JSON.stringify(e.response.data) : e}`);
    }
    return result;
  }
}
export const EventsService = new EventsServiceClass();
