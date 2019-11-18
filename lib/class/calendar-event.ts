import { Client, RichEmbed } from 'discord.js';
import { DateTime } from 'luxon';
import { IConfig } from '../interfaces/config';
import { IEmbedContent } from '../interfaces/embedContent';
import { II18n } from '../interfaces/i18n';
import { ILog } from '../interfaces/log';
import { IOperation } from '../interfaces/operation';
import OperationModel from '../models/operation';
import { generateEmbed } from '../utils/functions';
import logger from './logger';

const config: IConfig = require('../../config.json');
const lang: II18n = require(`../i18n/${config.config.lang}.json`);

/**
 * The Main class of the events
 */
export default class CalendarEvent {

    // TODO: Add participant and remove particpant are almost the same function, fuse them or make them more similar

    constructor(bot: Client) {
        this.bot = bot;
    }

    private readonly bot: Client; // To be able to send emebed

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
     *
     * @param eventID -- The ID of the event the user want to join
     * @param userID -- UserId of the user that want to join the event
     * @param partialLog -- the partial log to complete
     * @return Promise<RichEmbed> -- The result message of the function into a RichEmbed
     */
    public async addParticipant(eventID: string, userID: string, partialLog: ILog): Promise<RichEmbed> {

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
                const embed = await generateEmbed(this.bot, 'warn', lang.noEventWithID, {langOptions: {eventID}});
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
     * @return Promise<RichEmbed> -- The result of the command into a Rich embed
     */
    public async deleteOperation(eventID: string, userID: string, partialLog: ILog): Promise<RichEmbed> {
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
                const embed = await generateEmbed(this.bot, 'warn', lang.noEventWithID, {langOptions: {eventID}});
                return logger.logAndDBWithLevelAndResult(partialLog, 'warn', embed);
            }, async error => {
                logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                return await generateEmbed(this.bot, 'error', lang.unknownError, {langOptions: {userID}});
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
                const embed = await generateEmbed(this.bot, 'warn', lang.noEventWithID, {langOptions: {eventID}});
                return logger.logAndDBWithLevelAndResult(partialLog, 'warn', embed);
            }, async error => {
                logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                return await generateEmbed(this.bot, 'error', lang.unknownError, {langOptions: {userID}});
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
    public async validateAndCreatOperation( date: string,
                                            time: string,
                                            name: string,
                                            description: string,
                                            serverID: string,
                                            userID: string,
                                            partialLog: ILog): Promise<RichEmbed> {

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
                    const embed = await generateEmbed(this.bot, 'warn', lang.eventCannotTakePlaceInPast);
                    return logger.logAndDBWithLevelAndResult(partialLog, 'warn', embed);
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
                    async (success: IOperation) => {
                        partialLog.eventID = success.id.toString();
                        const embed = await generateEmbed(  this.bot,
                                                            'warn',
                                                            lang.eventCreationSuccess,
                                                            {langOptions: {eventID: success.id, userID}}
                        );
                        return logger.logAndDBWithLevelAndResult(partialLog, 'info', embed);
                    }, async error => {
                        logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                        return await generateEmbed(this.bot, 'error', lang.unknownError, {langOptions: {userID}});
                    }
                );
            }

        }
        const errorEmbed = await generateEmbed(this.bot, 'error', lang.errorInCommand);
        return logger.logAndDBWithLevelAndResult(partialLog, 'error', errorEmbed);
    }

    /**
     * List all the events that are registered in the event array
     *
     * @return string -- The list of all existing event
     */
    public async listAllEvents(userID: string, command: string, partialLog: ILog): Promise<RichEmbed| []> {
        partialLog.function = 'listAllEvents()';
        return await OperationModel.find({date: {$gt: DateTime.local().setLocale('fr').toMillis()}}).then(
            async (success: IOperation[]) => {
                if (success.length > 0) {
                    const result = [];
                    const message = `${lang.listEvent} :\n\n`;
                    result.push(message);
                    for (const currentOperation of success) {
                        const date = DateTime.fromMillis(currentOperation.date).setLocale('fr').toLocaleString(DateTime.DATETIME_SHORT);

                        const richEmbed = await generateEmbed(
                            this.bot,
                            'info',
                            lang.listEventByOne,
                            {
                                authorID: currentOperation.creatorID,
                                langOptions: {
                                    title: currentOperation.name,
                                    description: currentOperation.description,
                                    date,
                                    eventID: currentOperation.id
                                },
                                participants: currentOperation.participants
                            }
                        );

                        result.push(richEmbed);
                    }
                    return logger.logAndDBWithLevelAndResult(partialLog, 'info', result);
                }
                const embed = await generateEmbed(this.bot, 'warn', lang.noEvents);
                return logger.logAndDBWithLevelAndResult(partialLog, 'info', embed);
            }, async error => {
                logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                return await generateEmbed(this.bot, 'error', lang.unknownError, {langOptions: {userID}});
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
    public async updateOperationParticipantsPromise(    event: IOperation,
                                                        userID: string,
                                                        messageFromLang: IEmbedContent,
                                                        partialLog: ILog): Promise<RichEmbed> {

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
