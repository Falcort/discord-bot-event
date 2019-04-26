import { Schema } from 'mongoose';
import { DateTime } from 'luxon';
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
    message: {
        type: String
    },
    level: {
        type: String,
        required: true
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
