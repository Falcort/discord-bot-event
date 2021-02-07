import Axios from 'axios';
import { DateTime } from 'luxon';

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
      initDate: date,
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
