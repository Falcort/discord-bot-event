import GuildConfigInterface from '@/interfaces/guild-config.interface';
import { Client } from 'discord.js';
import frFR from '@/i18n/frFR.i18n';
import enEN from '@/i18n/enEN.i18n';
import { I18nInterface } from '@/interfaces/i18n.interface';
import Axios from 'axios';
import Logger from '@/services/Logger.service';

export class GlobalsServiceClass {
  /**
   * List of the guild configs to watch
   */
  public readonly GUILD_CONFIGS: Map<string, GuildConfigInterface> = new Map();

  /**
   * The bot itself
   */
  public DBE: Client

  /**
   * Object with the lang files
   */
  public readonly I18N: Map<string, I18nInterface> = new Map();

  /**
   * Emoji used to join or leave event
   */
  public readonly REACTION_EMOJI_VALID = '✅';

  /**
   * Emoji used to delete event
   */
  public readonly REACTION_EMOJI_INVALID = '❌';

  /**
   * API URL
   */
  public readonly API_URL = process.env.API_URL;

  /**
   * The JWT token for auth
   *
   * @private
   */
  public JWT = 'EMPTY_JWT';

  /**
   * Instance of the GlobalService
   *
   * @private
   */
  private static INSTANCE: GlobalsServiceClass;

  /**
   * Private constructor for Singleton
   *
   * @private
   */
  private constructor() {
    this.I18N.set('frFR', frFR);
    this.I18N.set('enEN', enEN);
  }

  /**
   * Method to get the current instance
   */
  public static getInstance() {
    if (!GlobalsServiceClass.INSTANCE) {
      GlobalsServiceClass.INSTANCE = new GlobalsServiceClass();
    }
    return GlobalsServiceClass.INSTANCE;
  }

  /**
   * Function to set the guild configs
   *
   * @param configs -- The array of configs
   */
  public setGuildConfigs(configs: GuildConfigInterface[]) {
    this.GUILD_CONFIGS.clear();
    for (let i = 0; i < configs.length; i += 1) {
      this.GUILD_CONFIGS.set(configs[i].id, configs[i]);
    }
  }

  /**
   * Function to auth to the strapi API
   */
  public async authToStrapi() {
    Logger.info('******************** Trying to authenticate to Strapi *********************');
    let result = 'INVALID_JWT';
    try {
      const request = await Axios.post(`${this.API_URL}/auth/local`, {
        identifier: process.env.STRAPI_LOGIN,
        password: process.env.STRAPI_PASSWORD,
      });
      result = request.data.jwt;
      Logger.info('******************** Strapi authentication successful *********************');
    } catch (e) {
      Logger.fatal(`Exception in auth() :\n ${e.response ? JSON.stringify(e.response.data) : e}`);
    }
    this.JWT = result;
  }

  /**
   * Function to set the bot for the globals
   *
   * @param client -- the discord js bot
   */
  public setDBE(client: Client) {
    this.DBE = client;
  }
}
export const GlobalsService = GlobalsServiceClass;
