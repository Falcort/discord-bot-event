/**
 * Interface of the config file
 */
export interface IConfig {
    'config': {
        'lang': string
    };
    'auth': {
        'token': string // Token of the bot
    };
    'db': {
        username: string,
        password: string;
        name: string;
        address: string;
        port: number;
    };
    'admins': [string]; // UserID of the admins TODO: Change to be from the discord server rules & permissions
    'commands': {
        'help': string;
        'credits': string;
        'joinEvent': string;
        'deleteEvent': string;
        'leaveEvent': string;
        'cleanChannel': string;
        'listAllEvents': string;
        'createEvent': string;
    };
}
