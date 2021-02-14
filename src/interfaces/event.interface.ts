/* eslint-disable no-alert, camelcase */
interface EventInterface {
  /**
   * ID of the mongoDB entry
   */
  id: string;

  /**
   * Date of the event in UTC
   */
  event_date: string;

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
  participants: { users: string[] };

  /**
   * ID of the message to watch for reactions
   */
  message_id: string;

  /**
   * Channel of the message to watch
   */
  channel_id: string;

  /**
   * ID of the server on which the event is happening
   */
  guild_id: string;

  /**
   * ID of the creator of the event
   */
  author_id: string;

  /**
   * URL of an image is there is one
   */
  image?: string;
}

export default EventInterface;
