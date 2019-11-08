import { IEmbedContent } from './embedContent';

export interface II18n {
    'help': string;
    'version': string;
    'unknownCommand': string;
    'eventWarnings': string;
    'alreadyRegistered': string;
    'unknownError': string;
    'noEventWithID': string;
    'noEventWithID2': IEmbedContent;
    'eventRegisterSuccess': string;
    'eventDeleteSuccess': string;
    'onlyAdminCanDeleteEvent': string;
    'eventUnRegister': string;
    'alreadyUnregister': string;
    'eventCannotTakePlaceInPast': string;
    'eventCreationSuccess': string;
    'errorInCommand': string;
    'listEvent': {
        'listEvent': string;
        'participants': string;
    };
    'noEvents': string;
    'status': string;
    'exemple': IEmbedContent;
}
