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
    'log': string;
    'db': {
        username: string,
        password: string;
        name: string;
        address: string;
        port: number;
    };
    'commands': {
        'help': string;
        'credits': string;
        'joinEvent': string;
        'deleteEvent': string;
        'leaveEvent': string;
        'cleanChannel': string;
        'listAllEvents': string;
        'createEvent': string;
        'initialize': string;
    };
}
