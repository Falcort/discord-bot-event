import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { IOperation } from '../interfaces/operation';

/**
 * Schema of the operation
 */
const OperationSchema: Schema = new Schema({

    serverID: { // ID of the server
        type: String,
        required: true
    },
    name: { // Name of the operation
        type: String,
        required: true
    },
    description: { // Description of the operation
        type: String,
        required: true
    },
    creatorID: { // Creator ID
        type: String,
        required: true
    },
    date: { // date of the event
        type: Number,
        required: true
    },
    participants: { // Map avec la l'ID de l'utilisateur et son pseudo
        type: Map,
        required: true
    }
});

export default mongoose.model<IOperation>('Operations', OperationSchema);
