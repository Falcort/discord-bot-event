export interface IConfig {
    'config': {
        'chanID': string, // Channel ID of the listening channel
        'prefix': string // Prefix of commands
    };
    'auth': {
        'token': string // Token of the bot
    };
    'application': {
        'version': number, // Version of the application
        'author': string, // Name of the main dev
    };
    'db': {
        username: string,
        password: string;
        name: string;
        address: string;
        port: number;
    };
    'admins': [string]; // UserID of the admins
}
