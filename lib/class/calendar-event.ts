import { DateTime } from 'luxon';
import { IConfig } from '../interfaces/config';
import { ILog } from '../interfaces/log';
import { IOperation } from '../interfaces/operation';
import OperationModel from '../models/operation';
import operation from '../models/operation';
import logger from './logger';

const config: IConfig = require('../../config.json');

class CalendarEvent {

    /**
     * Add a participant to an event
     * @param eventID -- The ID of the event the user want to join
     * @param userID -- UserId of the user that want to join the event
     * @param partialLog -- the partial log to complete
     * @return string -- The result message of the function
     */
    public static async addParticipant(eventID: string, userID: string, partialLog: ILog) {

        partialLog.function = 'addParticipant()';
        partialLog.eventID = eventID;
        return await OperationModel.findOne({_id: eventID}).then(
            async (success: IOperation) => {

                let response;

                if (success) {

                    if (success.participants.indexOf(userID) !== -1) {
                        response = `<@${userID}> tu participes déjà à l'opération : ${success.name}`;
                        logger.logAndDBWithLevelAndResult(partialLog, 'info', response);
                    }
                    if (!response) {

                        success.participants.push(userID);

                        response = OperationModel.updateOne({_id: eventID}, {$set: {participants: success.participants}}).then(
                            () => {
                                return logger.logAndDBWithLevelAndResult(partialLog, 'info', `<@${userID}> merci pour ta participation à l'opération : ${operation.name} le ${DateTime.fromMillis(success.date).setLocale('fr').toLocaleString(DateTime.DATETIME_SHORT)}`);
                            }, error => {
                                logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                                return 'Erreur inconnue';
                            }
                        );
                    }
                    return response;
                }
                return logger.logAndDBWithLevelAndResult(partialLog, 'warn', `Aucune opération ne porte l'id : ${eventID}`);
            }, error => {
                logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                return 'Erreur inconnue';
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
    public static async deleteOperation(eventID: string, userID: string, partialLog: ILog) {
        partialLog.function = 'deleteOperation()';
        partialLog.eventID = eventID;
        return await OperationModel.findOne({_id: eventID}).then(
            async (success: IOperation) => {

                if (success) {

                    if (success.creatorID === userID || config.admins.includes(userID)) {
                        return await OperationModel.deleteOne({_id: eventID}).then(
                            () => {
                                const successMessage = `L'opération : ${eventID} a bien été supprimée`;
                                logger.logAndDBWithLevelAndResult(partialLog, 'info', successMessage);
                                return successMessage;
                            }, error => {
                                logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                                return 'Erreur inconnue';
                            }
                        );
                    }
                    return logger.logAndDBWithLevelAndResult(partialLog, 'warn', `Seul le créateur d'une opération peut la supprimer`);
                }
                return logger.logAndDBWithLevelAndResult(partialLog, 'warn', `L'opération avec l'ID : ${eventID}, n'existe pas`);

            }, error => {
                logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                return 'Erreur inconnue';
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
    public static async removeParticipant(userID: string, eventID: string, partialLog: ILog) {

        partialLog.function = 'removeParticipant()';
        partialLog.eventID = eventID;

        return await OperationModel.findOne({_id: eventID}).then(
            async (success: IOperation) => {

                if (success) {
                    let response = null;

                    if (success.participants.indexOf(userID) !== -1) {
                        success.participants.splice(success.participants.indexOf(userID),1 );
                        response = 'found';
                    }

                    if (response) {
                        response = await OperationModel.updateOne({_id: eventID}, {$set: {participants: success.participants}}).then(
                            () => {
                                return logger.logAndDBWithLevelAndResult(partialLog, 'info', `<@${userID}> tu ne participes plus à l'opération : ${success.name} du ${DateTime.fromMillis(success.date).setLocale('fr').toLocaleString(DateTime.DATETIME_SHORT)}`);
                            }, error => {
                                logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                                return 'Erreur inconnue';
                            }
                        );
                    }
                    return logger.logAndDBWithLevelAndResult(partialLog, 'info', response);
                }
                return logger.logAndDBWithLevelAndResult(partialLog, 'warn', `Aucune opération ne porte l'id : ${eventID}`);
            }, error => {
                logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                return 'Erreur inconnue';
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
    public static async validateAndCreatOperation(date: string,
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
                    return logger.logAndDBWithLevelAndResult(partialLog, 'warn', `L'opération ne peut pas être dans le passé`);
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
                        return logger.logAndDBWithLevelAndResult(partialLog, 'info', `Opération (ID: ${success.id}) créée avec succès, merci de ta participation <@${userID}> !`);
                    }, error => {
                        logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                        return 'Erreur inconnue';
                    }
                );
            }

        }
        return logger.logAndDBWithLevelAndResult(partialLog, 'warn', `Erreur : commande incorrecte...`);
    }

    /**
     * List all the events that are registered in the event array
     *
     * @return string -- The list of all existing event
     */
    public static async listAllEvents(command: string, partialLog: ILog) {
        partialLog.function = 'listAllEvents()';
        return await OperationModel.find({date: {$gt: DateTime.local().setLocale('fr').toMillis()}}).then(
            (success: IOperation[]) => {
                if (success.length > 0) {
                    let message = `Voici la liste des opérations en cours :\n\n`;
                    for (const currentOperation of success) {
                        message += `**${currentOperation.id}**`;
                        message += ` ( *${DateTime.fromMillis(currentOperation.date).setLocale('fr').toLocaleString(DateTime.DATETIME_SHORT)}* )`;
                        message += ` ${currentOperation.name} - ${currentOperation.description} \n`; // Name and description of the event
                        message += `    Participants :\n`;
                        currentOperation.participants.forEach((value) => {
                            message += `        - <@${value}>\n`;
                        });
                        message += `\n`;
                    }
                    return logger.logAndDBWithLevelAndResult(partialLog, 'info', message);
                }
                return `Il n'y a pas d'event pour le moment, reviens plus tard ou crée en un !`;
            }, error => {
                logger.logAndDBWithLevelAndResult(partialLog, 'error', error);
                return 'Erreur inconnue';
            }
        );
    }

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
}

export default CalendarEvent;
