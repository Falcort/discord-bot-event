import { Client, RichEmbed } from 'discord.js';
import { DateTime } from 'luxon';
import { IConfig } from '../interfaces/config';
import { IEmbedContent } from '../interfaces/embedContent';
import { IEvent } from '../interfaces/event';
import { II18n } from '../interfaces/i18n';
import { ILog } from '../interfaces/log';
import EventModel from '../models/event';
import { generateEmbed } from '../utils/functions';
import logger from './logger';

const config: IConfig = require('../../config.json');

/**
 * The Main class of the events
 */
export default class CalendarEvent {

    // TODO: Add participant and remove particpant are almost the same function, fuse them or make them more similar

    constructor(bot: Client, cloudConfigLang: string) {
        this.bot = bot;
        this.lang = require(`../i18n/${cloudConfigLang}.json`);
    }

    private readonly bot: Client; // To be able to send emebed
    private readonly lang: II18n; // To be able to send emebed

    /**
     * This function return all event from the given date
     *
     * @param date -- Datetime -- the date to search from
     * @return Promise<number | IEvent[]> -- Number if error, else array of events
     */
    public static async getAllEventFromDate(date: DateTime): Promise<number | IEvent[]> {
        return await EventModel.find({date: {$gt: date.toMillis()}}).then(
            (success: IEvent[]) => {
                return success;
            }, error => {
                logger.logAndDB({
                    command: 'getAllEventFromDate()',
                    function: 'getAllEventFromDate()',
                    result: error,
                    level: 'error'
                } as ILog);
                return -1;
            }
        );
    }

    /**
     * Add a participant to an event
     *
     * @param eventID -- The ID of the event the user want to join
     * @param userID -- UserId of the user that want to join the event
     * @param partialLog -- the partial log to complete
     * @return Promise<RichEmbed> -- The result message of the function into a RichEmbed
     */
    public async addParticipant(eventID: string, userID: string, partialLog: ILog): Promise<RichEmbed> {

        partialLog.function = 'addParticipant()';
        partialLog.eventID = eventID;
        return await EventModel.findOne({_id: eventID}).then(
            async (success: IEvent) => {
                if (success) {
                    let adEmbed;
                    if (success.participants.indexOf(userID) !== -1) {
                        adEmbed = await generateEmbed(
                            this.bot,
                            'warn',
                            this.lang.alreadyRegistered,
                            {
                                langOptions: {userID, eventName: success.name}
                            }
                        );
                        return logger.logAndDBWithLevelAndResult(partialLog, 'info', adEmbed);
                    }
                    success.participants.push(userID);
                    return await this.updateEventParticipantsPromise(   success,
                                                                            userID,
                                                                            this.lang.eventRegisterSuccess,
                                                                            partialLog);
                }
                const embed = await generateEmbed(this.bot, 'warn', this.lang.noEventWithID, {langOptions: {eventID}});
                return logger.logAndDBWithLevelAndResult(partialLog, 'warn', embed);
            }, async error => {
                logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                return await generateEmbed(this.bot, 'error', this.lang.unknownError, {langOptions: {userID}});
            }
        );
    }

    /**
     * This function is to delete an event
     * Only admins and event creator can remove an event
     *
     * @param eventID -- The ID of the event to delete
     * @param userID -- The ID of the user issuing the command
     * @param partialLog -- the partial log to complete
     * @return Promise<RichEmbed> -- The result of the command into a Rich embed
     */
    public async deleteEvent(eventID: string, userID: string, partialLog: ILog): Promise<RichEmbed> {
        partialLog.function = 'deleteEvent()';
        partialLog.eventID = eventID;
        return await EventModel.findOne({_id: eventID}).then(
            async (success: IEvent) => {

                if (success) {

                    if (success.creatorID === userID || config.admins.includes(userID)) {
                        return await EventModel.deleteOne({_id: eventID}).then(
                            async () => {
                                const doSuccessMsgEmbed = await generateEmbed(    this.bot,
                                                                                'info',
                                                                                this.lang.eventDeleteSuccess,
                                                                                {langOptions: {eventID}}
                                );
                                return logger.logAndDBWithLevelAndResult(partialLog, 'info', doSuccessMsgEmbed);
                            }, async error => {
                                logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                                return await generateEmbed(this.bot, 'error', this.lang.unknownError, {langOptions: {userID}});
                            }
                        );
                    }
                    const doAdminOnlyMsgEmbed = await generateEmbed(this.bot, 'warn', this.lang.onlyAdminCanDeleteEvent);
                    return logger.logAndDBWithLevelAndResult(partialLog, 'warn', doAdminOnlyMsgEmbed);
                }
                const embed = await generateEmbed(this.bot, 'warn', this.lang.noEventWithID, {langOptions: {eventID}});
                return logger.logAndDBWithLevelAndResult(partialLog, 'warn', embed);
            }, async error => {
                logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                return await generateEmbed(this.bot, 'error', this.lang.unknownError, {langOptions: {userID}});
            }
        );
    }

    /**
     * Remove a player from the selected event
     *
     * @param userID -- UserID of the user that want to leavse
     * @param eventID -- ID of the event the user want to leave
     * @param partialLog -- the partial log to complete
     * @return Promise<RichEmbed> -- The result of the command into a Rich embed
     */
    public async removeParticipant(userID: string, eventID: string, partialLog: ILog): Promise<RichEmbed> {
        partialLog.function = 'removeParticipant()';
        partialLog.eventID = eventID;

        return await EventModel.findOne({_id: eventID}).then(
            async (success: IEvent) => {

                if (success) {
                    let rpEmbed;

                    if (success.participants.indexOf(userID) !== -1) {
                        success.participants.splice(success.participants.indexOf(userID),1 );
                        rpEmbed = await this.updateEventParticipantsPromise(  success,
                                                                                    userID,
                                                                                    this.lang.eventUnRegister,
                                                                                    partialLog);
                    } else {
                        rpEmbed = await generateEmbed(    this.bot,
                                                            'warn',
                                                            this.lang.alreadyUnregister,
                                                            {langOptions: {userID, eventName: success.name}});
                    }
                    return logger.logAndDBWithLevelAndResult(partialLog, 'info', rpEmbed);
                }
                const embed = await generateEmbed(this.bot, 'warn', this.lang.noEventWithID, {langOptions: {eventID}});
                return logger.logAndDBWithLevelAndResult(partialLog, 'warn', embed);
            }, async error => {
                logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                return await generateEmbed(this.bot, 'error', this.lang.unknownError, {langOptions: {userID}});
            }
        );
    }

    /**
     * Function that validate all arguments and if valide create a new event.
     *
     * @param date -- Date in format DD/MM/YYYY
     * @param time -- Time in format HH:mm
     * @param name -- Name of the event
     * @param description -- Description of the event
     * @param serverID -- The serverID, used to know which event is on which server
     * @param userID -- The userID of the user
     * @param partialLog -- the partial log to complete
     * @return Promise<RichEmbed> -- The result of the command into a Rich embed
     */
    public async validateAndCreatEvent(date: string,
                                       time: string,
                                       name: string,
                                       description: string,
                                       serverID: string,
                                       userID: string,
                                       partialLog: ILog): Promise<RichEmbed> {

        partialLog.function = 'validateAndCreatEvent()';

        if (date !== undefined &&
            time !== undefined &&
            name !== undefined &&
            description !== undefined &&
            serverID !== undefined &&
            userID !== undefined) {

            if (date.length > 0 && time.length > 0 && name.length > 0 && description.length > 0) {

                const luxon = DateTime.fromFormat(`${date} ${time}`, 'dd/MM/yyyy HH:mm').setLocale('fr').toMillis();
                const current = DateTime.local().setLocale('fr').toMillis();
                if (luxon <= current) {
                    const embed = await generateEmbed(this.bot, 'warn', this.lang.eventCannotTakePlaceInPast);
                    return logger.logAndDBWithLevelAndResult(partialLog, 'warn', embed);
                }

                const eventToCreate = {
                    serverID,
                    name,
                    description,
                    creatorID: userID,
                    date: luxon,
                    participants : [userID]
                } as IEvent;

                return await new EventModel(eventToCreate).save().then(
                    async (success: IEvent) => {
                        partialLog.eventID = success.id.toString();
                        const embed = await generateEmbed(  this.bot,
                                                            'warn',
                                                            this.lang.eventCreationSuccess,
                                                            {langOptions: {eventID: success.id, userID}}
                        );
                        return logger.logAndDBWithLevelAndResult(partialLog, 'warn', embed);
                    }, async error => {
                        logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                        return await generateEmbed(this.bot, 'error', this.lang.unknownError, {langOptions: {userID}});
                    }
                );
            }

        }
        const errorEmbed = await generateEmbed(this.bot, 'error', this.lang.errorInCommand);
        return logger.logAndDBWithLevelAndResult(partialLog, 'error', errorEmbed);
    }

    /**
     * List all the events that are registered in the event array
     *
     * @return string -- The list of all existing event
     */
    public async listAllEvents(userID: string, command: string, partialLog: ILog): Promise<RichEmbed| []> {
        partialLog.function = 'listAllEvents()';
        return await EventModel.find({date: {$gt: DateTime.local().setLocale('fr').toMillis()}}).then(
            async (success: IEvent[]) => {
                if (success.length > 0) {
                    const result = [];
                    const message = `${this.lang.listEvent} :\n\n`;
                    result.push(message);
                    for (const currentEvent of success) {
                        const date = DateTime.fromMillis(currentEvent.date).setLocale('fr').toLocaleString(DateTime.DATETIME_SHORT);

                        const richEmbed = await generateEmbed(
                            this.bot,
                            'info',
                            this.lang.listEventByOne,
                            {
                                authorID: currentEvent.creatorID,
                                langOptions: {
                                    title: currentEvent.name,
                                    description: currentEvent.description,
                                    date,
                                    eventID: currentEvent.id
                                },
                                participants: currentEvent.participants
                            }
                        );

                        result.push(richEmbed);
                    }
                    return logger.logAndDBWithLevelAndResult(partialLog, 'info', result);
                }
                const embed = await generateEmbed(this.bot, 'warn', this.lang.noEvents);
                return logger.logAndDBWithLevelAndResult(partialLog, 'warn', embed);
            }, async error => {
                logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                return await generateEmbed(this.bot, 'error', this.lang.unknownError, {langOptions: {userID}});
            }
        );
    }

    /**
     * This function return the promise of updating participant of a specific event
     *
     * @param event -- The event we are editing
     * @param userID -- the ID of the user to edit
     * @param messageFromLang -- the final message registering to and event or unregistering
     * @param partialLog -- the partial log to complete
     * @return string -- The list of all existing event
     */
    public async updateEventParticipantsPromise(event: IEvent,
                                                userID: string,
                                                messageFromLang: IEmbedContent,
                                                partialLog: ILog): Promise<RichEmbed> {

        return await EventModel.updateOne({_id: event.id}, {$set: {participants: event.participants}}).then(
            async () => {
                const date = DateTime.fromMillis(event.date).setLocale('fr').toLocaleString(DateTime.DATETIME_SHORT);
                const embed = await generateEmbed(  this.bot,
                                                    'success',
                                                    messageFromLang,
                                                    {langOptions: {userID, eventName: event.name, date}}
                );

                return logger.logAndDBWithLevelAndResult(partialLog, 'info', embed);
            }, async error => {
                logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                return await generateEmbed(this.bot, 'error', this.lang.unknownError);
            }
        );
    }
}
