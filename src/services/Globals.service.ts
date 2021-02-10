import ServerConfigInterface from '@/interfaces/server-config.interface';
import { Client } from 'discord.js';
import frFR from '@/i18n/frFR.i18n';
import enEN from '@/i18n/enEN.i18n';
import { I18nInterface } from '@/interfaces/i18n.interface';

export class GlobalsServiceClass {
  /**
   * List of the server configs to watch
   *
   * @private
   */
  public readonly SERVER_CONFIGS: Map<string, ServerConfigInterface> = new Map();

  /**
   * The bot itself
   *
   * @private
   */
  public DBE: Client

  /**
   * Object with the lang files
   *
   * @private
   */
  public readonly I18N: Map<string, I18nInterface> = new Map();

  /**
   * Emoji used to join or leave event
   * @private
   */
  public readonly REACTION_EMOJI = '✅';

  /**
   * API URL
   */
  public readonly API_URL = process.env.API_URL;

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
   * Function to set the server configs
   *
   * @param configs -- The array of configs
   */
  public setServerConfigs(configs: ServerConfigInterface[]) {
    configs.forEach((config: ServerConfigInterface) => {
      this.SERVER_CONFIGS.set(config.id, config);
    });
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
