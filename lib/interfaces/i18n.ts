import { IEmbedContent } from './embedContent';

/**
 * Interface of languages
 */
export interface II18n {
    'help': string; // TODO: Update the current help message with all the commands
    'version': string;
    'unknownCommand': string;
    'eventWarnings': string;
    'alreadyRegistered': IEmbedContent;
    'unknownError': IEmbedContent;
    'noEventWithID': IEmbedContent;
    'eventRegisterSuccess': IEmbedContent;
    'eventDeleteSuccess': IEmbedContent;
    'onlyAdminCanDeleteEvent': IEmbedContent;
    'eventUnRegister': IEmbedContent;
    'alreadyUnregister': IEmbedContent;
    'eventCannotTakePlaceInPast': string;
    'eventCreationSuccess': string;
    'errorInCommand': string;
    'listEvent': {
        'listEvent': string;
        'participants': string;
    };
    'eventPing': string;
    'noEvents': string;
    'status': string;
    'listEventByOne': IEmbedContent;
}
