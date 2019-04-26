import { Document } from 'mongoose';

/**
 * Interface for the logs
 */
export interface ILog extends Document {
    command: string;
    userID: string;
    message: string;
    level: 'trace' | 'info' | 'warn' | 'error' | 'fatal';
}
