import { Document } from 'mongoose';

/**
 * Interface of the config of the bot saved on the database
 */
export interface ICloudConfig extends Document {
    'serverID': string; // The ID of the server
    'channelID': string; // The Channel on the server where the bot is supposed to listen
    'lang': 'fr-FR' | 'en-EN'; // The language of the bot for the server
}
