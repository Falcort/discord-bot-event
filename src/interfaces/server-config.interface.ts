interface ServerConfigInterface {
  /**
  * ID of the mongoDB entry
  */
  id: string;

  /**
   * ID of the server
   */
  serverID: string;

  /**
   * ID of the channel to listen
   */
  channelID: string;

  /**
   * Lang of the server
   */
  lang: 'frFR' | 'enEN';

  /**
   * Date of creation of the server in UTC
   */
  initialization: string;
}

export default ServerConfigInterface;
