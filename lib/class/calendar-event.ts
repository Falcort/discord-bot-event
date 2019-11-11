import { Client } from 'discord.js';
import { DateTime } from 'luxon';
import { IConfig } from '../interfaces/config';
import { IEmbedContent } from '../interfaces/embedContent';
import { II18n } from '../interfaces/i18n';
import { ILog } from '../interfaces/log';
import { IOperation } from '../interfaces/operation';
import OperationModel from '../models/operation';
import { generateEmbed, parseLangMessage } from '../utils/functions';
import logger from './logger';

const config: IConfig = require('../../config.json');
const lang: II18n = require(`../i18n/${config.config.lang}.json`);

export default class CalendarEvent {

    constructor(bot: Client) {
        this.bot = bot;
    }

    private bot: Client;

    /**
     * This function return all event from the given date
     *
     * @param date -- Datetime -- the date to search from
     * @return Promise<number | IOperation[]> -- Number if error, else array of events
     */
    public static async getAllEventFromDate(date: DateTime): Promise<number | IOperation[]> {
        return await OperationModel.find({date: {$gt: date.toMillis()}}).then(
            (success: IOperation[]) => {
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
     * @param eventID -- The ID of the event the user want to join
     * @param userID -- UserId of the user that want to join the event
     * @param partialLog -- the partial log to complete
     * @return string -- The result message of the function
     */
    public async addParticipant(eventID: string, userID: string, partialLog: ILog) {

        partialLog.function = 'addParticipant()';
        partialLog.eventID = eventID;
        return await OperationModel.findOne({_id: eventID}).then(
            async (success: IOperation) => {
                if (success) {
                    let adEmbed;
                    if (success.participants.indexOf(userID) !== -1) {
                        adEmbed = await generateEmbed(this.bot, 'info',
                            lang.alreadyRegistered, {langOptions: {userID, eventName: success.name}});
                        return logger.logAndDBWithLevelAndResult(partialLog, 'info', adEmbed);
                    }
                    success.participants.push(userID);
                    return await this.updateOperationParticipantsPromise(   success,
                                                                            userID,
                                                                            lang.eventRegisterSuccess,
                                                                            partialLog);
                }
                const embed = await generateEmbed(this.bot, 'warn', lang.noEventWithID2, {langOptions: {eventID}});
                return logger.logAndDBWithLevelAndResult(partialLog, 'warn', embed);
            }, async error => {
                logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                return await generateEmbed(this.bot, 'error', lang.unknownError);
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
     */
    public async deleteOperation(eventID: string, userID: string, partialLog: ILog) {
        partialLog.function = 'deleteOperation()';
        partialLog.eventID = eventID;
        return await OperationModel.findOne({_id: eventID}).then(
            async (success: IOperation) => {

                if (success) {

                    if (success.creatorID === userID || config.admins.includes(userID)) {
                        return await OperationModel.deleteOne({_id: eventID}).then(
                            async () => {
                                const doSuccessMsgEmbed = await generateEmbed(    this.bot,
                                                                                'info',
                                                                                lang.eventDeleteSuccess,
                                                                                {langOptions: {eventID}}
                                );
                                return logger.logAndDBWithLevelAndResult(partialLog, 'info', doSuccessMsgEmbed);
                            }, async error => {
                                logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                                return await generateEmbed(this.bot, 'error', lang.unknownError, {langOptions: {userID}});
                            }
                        );
                    }
                    const doAdminOnlyMsgEmbed = await generateEmbed(this.bot, 'warn', lang.onlyAdminCanDeleteEvent);
                    return logger.logAndDBWithLevelAndResult(partialLog, 'warn', doAdminOnlyMsgEmbed);
                }
                const embed = await generateEmbed(this.bot, 'warn', lang.noEventWithID2, {langOptions: {eventID}});
                return logger.logAndDBWithLevelAndResult(partialLog, 'warn', embed);
            }, async error => {
                logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                return await generateEmbed(this.bot, 'error', lang.unknownError, {langOptions: {userID}});
            }
        );
    }

    /**
     * Remove a player from the selected event
     * @param userID -- UserID of the user that want to leavse
     * @param eventID -- ID of the event the user want to leave
     * @param partialLog -- the partial log to complete
     * @return string -- The result messages of the function
     */
    public async removeParticipant(userID: string, eventID: string, partialLog: ILog) {
        partialLog.function = 'removeParticipant()';
        partialLog.eventID = eventID;

        return await OperationModel.findOne({_id: eventID}).then(
            async (success: IOperation) => {

                if (success) {
                    let rpEmbed;

                    if (success.participants.indexOf(userID) !== -1) {
                        success.participants.splice(success.participants.indexOf(userID),1 );
                        rpEmbed = await this.updateOperationParticipantsPromise(  success,
                                                                                    userID,
                                                                                    lang.eventUnRegister,
                                                                                    partialLog);
                    } else {
                        rpEmbed = await generateEmbed(    this.bot,
                                                            'warn',
                                                            lang.alreadyUnregister,
                                                            {langOptions: {userID, eventName: success.name}});
                    }
                    return logger.logAndDBWithLevelAndResult(partialLog, 'info', rpEmbed);
                }
                const embed = await generateEmbed(this.bot, 'warn', lang.noEventWithID2, {langOptions: {eventID}});
                return logger.logAndDBWithLevelAndResult(partialLog, 'warn', embed);
            }, async error => {
                logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                return await generateEmbed(this.bot, 'error', lang.unknownError, {langOptions: {userID}});
            }
        );
    }

    /**
     * Function that validate all arguments and if valide create a new event.
     * @param date -- Date in format DD/MM/YYYY
     * @param time -- Time in format HH:mm
     * @param name -- Name of the event
     * @param description -- Description of the event
     * @param serverID -- The serverID, used to know which event is on which server
     * @param userID -- The userID of the user
     * @param partialLog -- the partial log to complete
     * @return string -- The error/success message to display
     */
    public async validateAndCreatOperation( date: string,
                                            time: string,
                                            name: string,
                                            description: string,
                                            serverID: string,
                                            userID: string,
                                            partialLog: ILog) {

        partialLog.function = 'validateAndCreatOperation()';

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
                    return logger.logAndDBWithLevelAndResult(partialLog, 'warn', lang.eventCannotTakePlaceInPast);
                }

                const operationToCreate = {
                    serverID,
                    name,
                    description,
                    creatorID: userID,
                    date: luxon,
                    participants : [userID]
                } as IOperation;

                return await new OperationModel(operationToCreate).save().then(
                    (success: IOperation) => {
                        partialLog.eventID = success.id.toString();
                        const message = parseLangMessage(lang.eventCreationSuccess, {eventID: success.id, userID});
                        return logger.logAndDBWithLevelAndResult(partialLog, 'info', message);
                    }, error => {
                        logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                        return lang.unknownError;
                    }
                );
            }

        }
        return logger.logAndDBWithLevelAndResult(partialLog, 'warn', lang.errorInCommand);
    }

    /**
     * List all the events that are registered in the event array
     *
     * @return string -- The list of all existing event
     */
    public async listAllEvents(command: string, partialLog: ILog) {
        partialLog.function = 'listAllEvents()';
        return await OperationModel.find({date: {$gt: DateTime.local().setLocale('fr').toMillis()}}).then(
            (success: IOperation[]) => {
                if (success.length > 0) {
                    let message = `${lang.listEvent.listEvent} :\n\n`;
                    for (const currentOperation of success) {
                        message += `**${currentOperation.id}**`;
                        message += ` ( *${DateTime.fromMillis(currentOperation.date).setLocale('fr').toLocaleString(DateTime.DATETIME_SHORT)}* )`;
                        message += ` ${currentOperation.name} - ${currentOperation.description} \n`; // Name and description of the event
                        message += `    ${lang.listEvent.participants} :\n`;
                        currentOperation.participants.forEach((value) => {
                            message += `        - <@${value}>\n`;
                        });
                        message += `\n`;
                    }
                    return logger.logAndDBWithLevelAndResult(partialLog, 'info', message);
                }

                return logger.logAndDBWithLevelAndResult(partialLog, 'info', lang.noEvents);
            }, error => {
                logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                return 'Erreur inconnue';
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
     */
    private async updateOperationParticipantsPromise(   event: IOperation,
                                                        userID: string,
                                                        messageFromLang: IEmbedContent,
                                                        partialLog: ILog) {

        return await OperationModel.updateOne({_id: event.id}, {$set: {participants: event.participants}}).then(
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
                return await generateEmbed(this.bot, 'error', lang.unknownError);
            }
        );
    }
}
