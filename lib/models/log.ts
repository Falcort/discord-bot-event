import { DateTime } from 'luxon';
import { Schema } from 'mongoose';
import * as mongoose from 'mongoose';
import { ILog } from '../interfaces/log';

/**
 * Schema for the logs
 */
const LogSchema: Schema = new Schema({
    command: { // The command that was executed
        type: String,
        require: true
    },
    userID: { // The ID of the user which sent the command
        type: String,
        required: true
    },
    eventID: { // The ID of the event in the command if there is
        type: String
    },
    serverID: { // The ID of the server where the command was performed
      type: String,
      required: true
    },
    channelID: { // The ID of the channel where the command was sent
        type: String,
        required: true
    },
    level: { // The level of the logger: error, success, warning ...
        type: String,
        required: true
    },
    result: { // What was the result of the command
        type: Schema.Types.Mixed
    },
    function : { // The function that generated the result if so
        type: String
    },
    date: { // The time of logging
        type: Number,
        default: DateTime.local().setLocale('fr')
    }
});

/**
 * Export the model based on the interface
 */
export default mongoose.model<ILog>('Logs', LogSchema);
