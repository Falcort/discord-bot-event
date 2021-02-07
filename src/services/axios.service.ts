import Axios from 'axios';
import { DateTime } from 'luxon';
import { Message } from 'discord.js';
import { embedText } from '@/i18n/template.i18n';

export async function getServerConfigs(): Promise<object[]> {
  const result = await Axios.get(`${process.env.API_URL}/dbe-server-configs`);
  return result.data;
}

export async function createServerConfig(
  serverID: string,
  channelID: string,
  lang: string,
): Promise<boolean> {
  const date = DateTime.local().toISODate();
  const result = await Axios.post(
    `${process.env.API_URL}/dbe-server-configs`,
    {
      serverID,
      channelID,
      lang,
      initialization: date,
    },
  );
  return result.status === 200;
}

export async function updateServerConfig(
  id: string,
  channelID: string,
  lang: string,
): Promise<boolean> {
  const result = await Axios.put(`${process.env.API_URL}/dbe-server-configs/${id}`, { channelID, lang });
  return result.status === 200;
}

export async function createEvent(
  date: string,
  embed: embedText,
  message: Message,
  image?: string,
): Promise<boolean> {
  const result = await Axios.post(
    `${process.env.API_URL}/dbe-events/`,
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

export async function fetchEvents() {
  const date = DateTime.local().toUTC();
  const result = await Axios.get(`${process.env.API_URL}/dbe-events?date_gte=${date}`);
  return result.data;
}

class AxiosService {
  /**
   * API URL
   * @private
   */
  private readonly API_URL = process.env.API_URL;

  /**
   * Function to add or remove a participant to an event
   * @param participants -- List of the participants
   * @param eventID -- The ID of the event to patch
   */
  public putEventParticipants(participants: string[], eventID: string) {
    return Axios.put(`${this.API_URL}/dbe-events/${eventID}`, { participants });
  }

  /**
   * Function to get and event from the messageID
   * @param messageID -- The messageID
   */
  public getEventFromMessageID(messageID: string) {
    return Axios.get(`${this.API_URL}/dbe-events?messageID_eq=${messageID}`);
  }
}
export default new AxiosService();
