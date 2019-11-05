import { DateTime } from 'luxon';
import { Schema } from 'mongoose';
import * as mongoose from 'mongoose';
import { ILog } from '../interfaces/log';

/**
 * Interface for the logs
 */
const LogSchema: Schema = new Schema({
    command: {
        type: String,
        require: true
    },
    userID: {
        type: String,
        required: true
    },
    eventID: {
        type: String
    },
    serverID: {
      type: String,
      required: true
    },
    channelID: {
        type: String,
        required: true
    },
    level: {
        type: String,
        required: true
    },
    result: {
        type: String
    },
    function : {
        type: String
    },
    date: {
        type: Number,
        default: DateTime.local().setLocale('fr')
    }
});

/**
 * Export the model based on the interface
 */
export default mongoose.model<ILog>('Logs', LogSchema);
