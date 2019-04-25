import { Moment } from 'moment';
import { Document } from 'mongoose';

/**
 * Interface of the operation
 */
export interface IOperation extends Document {

    // ID of the event
    ID: number;

    // ID of the server
    serverID: string;

    // Name of the operation
    name: string;

    // Description of the operation
    description: string;

    // Creator ID
    creatorID: string;

    // date of the event
    date: Moment;

    // Map avec la l'ID de l'utilisateur et son pseudo
    participants: Map<string, string>;

}
