import { Document } from 'mongoose';

/**
 * Interface for the logs
 */
export interface ILog extends Document {
    command: string; // The command that was executed
    userID?: string; // The ID of the user which sent the command
    eventID?: string; // The ID of the event in the command if there is
    serverID?: string; // The ID of the server where the command was performed
    channelID?: string; // The ID of the channel where the command was sent
    result?: any; // What was the result of the command
    function ?: string; // The function that generated the result if so
    level: 'trace' | 'info' | 'success' | 'warn' | 'error' | 'fatal'; // The level of the logger: error, success, warning ...
}
