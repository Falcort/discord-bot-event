import ServerConfigInterface from '@/interfaces/server-config.interface';
import Axios from 'axios';
import { GlobalsService, GlobalsServiceClass } from '@/services/Globals.service';
import { DateTime } from 'luxon';
import Logger from '@/services/Logger.service';

export class ServerConfigsServiceClass {
  private readonly GLOBALS: GlobalsServiceClass;

  constructor() {
    this.GLOBALS = GlobalsService.getInstance();
    this.getServerConfigs().then((configs: ServerConfigInterface[]) => {
      this.GLOBALS.setServerConfigs(configs);
    });
  }

  /**
   * Function to get the server configs
   */
  public async getServerConfigs(): Promise<ServerConfigInterface[]> {
    let result = [];
    try {
      const request = await Axios.get(`${this.GLOBALS.API_URL}/dbe-server-configs`);
      result = request.data;
    } catch (e) {
      Logger.error(`Exception in getServerConfigs() :\n ${e.response ? JSON.stringify(e.response.data) : e}`);
    }
    return result;
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
  ): Promise<ServerConfigInterface> {
    let result = null;
    try {
      const request = await Axios.put(`${this.GLOBALS.API_URL}/dbe-server-configs/${id}`, { channelID, lang });
      result = request.data;
    } catch (e) {
      Logger.error(`Exception in putServerConfig() :\n ${e.response ? JSON.stringify(e.response.data) : e}`);
    }
    return result;
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
  ): Promise<ServerConfigInterface> {
    let result = null;
    try {
      const date = DateTime.local().toISODate();
      const request = await Axios.post(
        `${this.GLOBALS.API_URL}/dbe-server-configs`,
        {
          serverID,
          channelID,
          lang,
          initialization: date,
        },
      );
      result = request.data;
    } catch (e) {
      Logger.error(`Exception in postServerConfig() :\n ${e.response ? JSON.stringify(e.response.data) : e}`);
    }
    return result;
  }
}
export const ServerConfigsService = new ServerConfigsServiceClass();
