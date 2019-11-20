import { DateTime } from 'luxon';
import { Schema } from 'mongoose';
import * as mongoose from 'mongoose';
import { ICloudConfig } from '../interfaces/cloud-config';

/**
 * Schema for the cloud config
 */
const cloudConfigSchema: Schema = new Schema ({
    serverID: {
        type: String,
        unique: true,
        required: true
    }, // The ID of the server
    channelID:{
        type: String,
        required: true
    }, // The Channel on the server where the bot is supposed to listen
    lang: {
        type: String,
        required: true
    }, // The language of the bot for the server
    initialisationDate: {
        type: Number,
        default: DateTime.local().setLocale('fr')
    } // Date of creation of this config
});


/**
 * Export the model based on the interface
 */
export default mongoose.model<ICloudConfig>('CloudConfig', cloudConfigSchema);
