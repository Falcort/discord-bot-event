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
    'exemple': IEmbedContent;
}
