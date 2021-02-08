interface EventInterface {
  /**
   * ID of the mongoDB entry
   */
  id: string;

  /**
   * Date of the event in UTC
   */
  date: string;

  /**
   * Title of the event
   */
  title: string;

  /**
   * Description of the event
   */
  description: string;

  /**
   * List of the participants
   */
  participants: string[];

  /**
   * ID of the message to watch for reactions
   */
  messageID: string;

  /**
   * Channel of the message to watch
   */
  channelID: string;

  /**
   * ID of the server on which the event is happening
   */
  serverID: string;

  /**
   * URL of an image is there is one
   */
  image?: string;
}

export default EventInterface;
