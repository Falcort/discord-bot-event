import { Document } from 'mongoose';

/**
 * Interface for the logs
 */
export interface ILog extends Document {
    command: string;
    userID?: string;
    eventID?: string;
    serverID?: string;
    channelID?: string;
    result?: string;
    function ?: string;
    level: 'trace' | 'info' | 'warn' | 'error' | 'fatal';
}
