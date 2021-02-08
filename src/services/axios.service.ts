import Axios from 'axios';
import { DateTime } from 'luxon';
import { Message } from 'discord.js';
import { embedText } from '@/interfaces/i18n.interface';
import ServerConfigInterface from '@/interfaces/server-config.interface';
import EventInterface from '@/interfaces/event.interface';

/**
 * Class of the Axios Service
 */
class AxiosService {
  /**
   * API URL
   *
   * @private
   */
  private readonly API_URL = process.env.API_URL;

  /**
   * Function to get the server configs
   */
  public async getServerConfigs(): Promise<ServerConfigInterface[]> {
    const result = await Axios.get(`${this.API_URL}/dbe-server-configs`);
    return result.data;
  }

  /**
   * Function to patch a server config
   *
   * @param id -- The if of the config to patch
   * @param channelID -- The new channel ID
   * @param lang -- The new lang
   */
  public async putServerConfig(
    id: string,
    channelID: string,
    lang: string,
  ): Promise<boolean> {
    const result = await Axios.put(`${this.API_URL}/dbe-server-configs/${id}`, { channelID, lang });
    return result.status === 200;
  }

  /**
   * Function to register a new server config
   *
   * @param serverID -- The IF of the server to register
   * @param channelID -- The ID of the channel to listen
   * @param lang -- The lang of the config
   */
  public async postServerConfig(
    serverID: string,
    channelID: string,
    lang: string,
  ): Promise<boolean> {
    const date = DateTime.local().toISODate();
    const result = await Axios.post(
      `${this.API_URL}/dbe-server-configs`,
      {
        serverID,
        channelID,
        lang,
        initialization: date,
      },
    );
    return result.status === 200;
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
    embed: embedText,
    message: Message,
    image?: string,
  ): Promise<boolean> {
    const result = await Axios.post(
      `${this.API_URL}/dbe-events/`,
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
  public async fetchEvents(): Promise<EventInterface[]> {
    const date = DateTime.local().toUTC();
    const result = await Axios.get(`${this.API_URL}/dbe-events?date_gte=${date}`);
    return result.data;
  }

  /**
   * Function to add or remove a participant to an event
   *
   * @param participants -- List of the participants
   * @param eventID -- The ID of the event to patch
   */
  public async putEventParticipants(participants: string[], eventID: string): Promise<object> {
    const result = await Axios.put(`${this.API_URL}/dbe-events/${eventID}`, { participants });
    return result.data;
  }

  /**
   * Function to get and event from the messageID
   *
   * @param messageID -- The messageID
   */
  public async getEventFromMessageID(messageID: string): Promise<EventInterface> {
    const result = await Axios.get(`${this.API_URL}/dbe-events?messageID_eq=${messageID}`);
    return result.data[0] || null;
  }
}
export default new AxiosService();
