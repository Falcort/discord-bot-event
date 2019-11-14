import { IEmbedContent } from './embedContent';

/**
 * Interface of languages
 */
export interface II18n {
    'help': IEmbedContent;
    'version': IEmbedContent;
    'unknownCommand': IEmbedContent;
    'eventWarnings': string;
    'alreadyRegistered': IEmbedContent;
    'unknownError': IEmbedContent;
    'noEventWithID': IEmbedContent;
    'eventRegisterSuccess': IEmbedContent;
    'eventDeleteSuccess': IEmbedContent;
    'onlyAdminCanDeleteEvent': IEmbedContent;
    'eventUnRegister': IEmbedContent;
    'alreadyUnregister': IEmbedContent;
    'eventCannotTakePlaceInPast': IEmbedContent;
    'eventCreationSuccess': IEmbedContent;
    'errorInCommand': IEmbedContent;
    'listEvent': string;
    'noEvents': IEmbedContent;
    'status': string;
    'listEventByOne': IEmbedContent;
    'deleteMessage': string;
}
