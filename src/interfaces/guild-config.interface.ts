/* eslint-disable no-alert, camelcase */
interface GuildConfigInterface {
  /**
  * ID of the mongoDB entry
  */
  id: string;

  /**
   * ID of the server
   */
  guild_id: string;

  /**
   * ID of the channel to listen
   */
  channel_id: string;

  /**
   * Lang of the server
   */
  i18n: 'frFR' | 'enEN';

  /**
   * Date of creation of the server in UTC
   */
  init_date: string;
}

export default GuildConfigInterface;
