import { Document } from 'mongoose';

/**
 * Interface for the logs
 */
export interface ILog extends Document {
    command: string;
    userID: string;
    error: object;
    level: 'trace' | 'info' | 'warn' | 'error' | 'fatal';
}
