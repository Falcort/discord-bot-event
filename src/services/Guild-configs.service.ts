import GuildConfigInterface from '@/interfaces/guild-config.interface';
import Axios from 'axios';
import { GlobalsService, GlobalsServiceClass } from '@/services/Globals.service';
import { DateTime } from 'luxon';
import Logger from '@/services/Logger.service';

export class GuildConfigsServiceClass {
  private readonly GLOBALS: GlobalsServiceClass;

  constructor() {
    this.GLOBALS = GlobalsService.getInstance();
  }

  /**
   * Function to get the guild configs
   */
  public async getGuildConfigs(): Promise<GuildConfigInterface[]> {
    let result = [];
    try {
      const request = await Axios.get(`${this.GLOBALS.API_URL}/content-manager/collection-types/application::dbe-guild-configs.dbe-guild-configs`, { headers: { Authorization: `Bearer ${this.GLOBALS.JWT}` } });
      result = request.data.results;
    } catch (e) {
      Logger.error(`Exception in getGuildConfigs() :\n ${e.response ? JSON.stringify(e.response.data) : e}`);
    }
    return result;
  }

  /**
   * Function to patch a guild config
   *
   * @param id -- The if of the config to patch
   * @param channelID -- The new channel ID
   * @param i18n -- The new i18n language
   * @param timezone -- The guild timezone
   */
  public async putGuildConfig(
    id: string,
    channelID: string,
    i18n: string,
    timezone: string,
  ): Promise<GuildConfigInterface> {
    let result = null;
    try {
      const request = await Axios.put(`${this.GLOBALS.API_URL}/content-manager/collection-types/application::dbe-guild-configs.dbe-guild-configs/${id}`, { channel_id: channelID, i18n, timezone }, { headers: { Authorization: `Bearer ${this.GLOBALS.JWT}` } });
      result = request.data;
    } catch (e) {
      Logger.error(`Exception in putGuildConfig() :\n ${e.response ? JSON.stringify(e.response.data) : e}`);
    }
    return result;
  }

  /**
   * Function to register a new guild config
   *
   * @param guildID -- The IF of the guild to register
   * @param channelID -- The ID of the channel to listen
   * @param i18n -- The lang of the config
   * @param timezone -- The guild timezone
   */
  public async postGuildConfig(
    guildID: string,
    channelID: string,
    i18n: string,
    timezone: string,
  ): Promise<GuildConfigInterface> {
    let result = null;
    try {
      const date = DateTime.local().toISODate();
      const request = await Axios.post(
        `${this.GLOBALS.API_URL}/content-manager/collection-types/application::dbe-guild-configs.dbe-guild-configs`,
        {
          guild_id: guildID,
          channel_id: channelID,
          i18n,
          init_date: date,
          timezone,
        },
        { headers: { Authorization: `Bearer ${this.GLOBALS.JWT}` } },
      );
      result = request.data;
    } catch (e) {
      Logger.error(`Exception in postGuildConfig() :\n ${e.response ? JSON.stringify(e.response.data) : e}`);
    }
    return result;
  }
}
export const GuildConfigsService = new GuildConfigsServiceClass();
