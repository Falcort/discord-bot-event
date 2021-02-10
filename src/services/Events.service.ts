import { EmbedTextInterface } from '@/interfaces/i18n.interface';
import Axios from 'axios';
import { GlobalsService, GlobalsServiceClass } from '@/services/Globals.service';
import EventInterface from '@/interfaces/event.interface';
import { DateTime } from 'luxon';
import { Message } from 'discord.js';

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
    const result = await Axios.post(
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
    return result.status === 200;
  }

  /**
   * Function to retrieve event from the backend
   */
  public async getEvents(): Promise<EventInterface[]> {
    const date = DateTime.local().toUTC();
    const result = await Axios.get(`${this.GLOBALS.API_URL}/dbe-events?date_gte=${date}`);
    return result.data;
  }

  /**
   * Function to add or remove a participant to an event
   *
   * @param participants -- List of the participants
   * @param eventID -- The ID of the event to patch
   */
  public async putEventParticipants(participants: string[], eventID: string): Promise<object> {
    const result = await Axios.put(`${this.GLOBALS.API_URL}/dbe-events/${eventID}`, { participants });
    return result.data;
  }

  /**
   * Function to get and event from the messageID
   *
   * @param messageID -- The messageID
   */
  public async getEventFromMessageID(messageID: string): Promise<EventInterface> {
    const result = await Axios.get(`${this.GLOBALS.API_URL}/dbe-events?messageID_eq=${messageID}`);
    return result.data[0] || null;
  }
}
export const EventsService = new EventsServiceClass();
