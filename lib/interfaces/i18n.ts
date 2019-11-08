import { IEmbedContent } from './embedContent';

export interface II18n {
    'help': string;
    'version': string;
    'unknownCommand': string;
    'eventWarnings': string;
    'alreadyRegistered': IEmbedContent;
    'unknownError': IEmbedContent;
    'noEventWithID': string;
    'noEventWithID2': IEmbedContent;
    'eventRegisterSuccess': string;
    'eventDeleteSuccess': IEmbedContent;
    'onlyAdminCanDeleteEvent': IEmbedContent;
    'eventUnRegister': string;
    'alreadyUnregister': string;
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
    'exemple': IEmbedContent;
}
