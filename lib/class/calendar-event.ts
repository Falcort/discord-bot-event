import { DateTime } from 'luxon';
import { IConfig } from '../interfaces/config';
import { IOperation } from '../interfaces/operation';
import OperationModel from '../models/operation';
import operation from '../models/operation';
import logger from './logger';

const config: IConfig = require('../../config.json');

class CalendarEvent {

    /**
     * Add a participant to an event
     * @param eventID -- The ID of the event the user want to join
     * @param username -- Username
     * @param userID -- UserId of the user that want to join the event
     * @param command -- the used command
     * @return string -- The result message of the function
     */
    public static async addParticipant(eventID: string, username: string, userID: string, command: string) {

        return await OperationModel.findOne({_id: eventID}).then(
            async (success: IOperation) => {

                let response;

                if (success) {

                    success.participants.forEach((value: string, key: string) => {

                        if (key === username || value === userID) {
                            response = `<@${userID}> tu participes déjà à l'opération : ${success.name}`;
                            logger.logAndDB(command, userID, 'info', response);
                        }

                    });
                    if (!response) {

                        success.participants.set(username, userID);

                        response = OperationModel.updateOne({_id: eventID}, {$set: {participants: success.participants}}).then(
                            () => {
                                const successMessage = `<@${userID}> merci pour ta participation à l'opération : ${operation.name} le ${DateTime.fromMillis(success.date).setLocale('fr').toLocaleString(DateTime.DATETIME_SHORT)}`;
                                logger.logAndDB(command, userID, 'info', successMessage);
                                return successMessage;
                            }, error => {
                                logger.logAndDB(command, userID, 'error', error);
                                return 'Erreur inconnu';
                            }
                        );
                    }
                    return response;
                }
                const errorMessage = `Aucune opération ne porte l\'id : ${eventID}`;
                logger.logAndDB(command, userID, 'info', errorMessage);
                return errorMessage;
            }, error => {
                logger.logAndDB(command, userID, 'error', error);
                return 'Erreur inconnu';
            }
        );
    }

    public static async deleteOperation(operationID: string, userID: string, command: string) {
        return await OperationModel.findOne({_id: operationID}).then(
            async (success: IOperation) => {

                if (success) {

                    if (success.creatorID === userID || config.admins.includes(userID)) {
                        return await OperationModel.deleteOne({_id: operationID}).then(
                            () => {
                                const successMessage = `L'Opération : ${operationID} a bien été supprimée`;
                                logger.logAndDB(command, userID, 'info', successMessage);
                                return successMessage;
                            }, error => {
                                logger.logAndDB(command, userID, 'error', error);
                                return 'Erreur inconnu';
                            }
                        );
                    }
                    const permissionMessage = `Seul le créateur d'une opération peut la supprimer`;
                    logger.logAndDB(command, userID, 'info', permissionMessage);
                    return permissionMessage;
                }
                const errorMessage = `L'Opération avec l'ID : ${operationID}, n'existe pas`;
                logger.logAndDB(command, userID, 'info', errorMessage);
                return errorMessage;

            }, error => {
                logger.logAndDB(command, userID, 'error', error);
                return 'Erreur inconnu';
            }
        );
    }

    /**
     * Remove a player from the selected event
     * @param username -- Username of the user that want to leave
     * @param userID -- UserID of the user that want to leavse
     * @param eventID -- ID of the event the user want to leave
     * @param command -- the executed command
     * @return string -- The result messages of the function
     */
    public static async removeParticipant(username: string, userID: string, eventID: string, command: string) {

        return await OperationModel.findOne({_id: eventID}).then(
            async (success: IOperation) => {

                if (success) {
                    let response = null;

                    success.participants.forEach((value: string, key: string) => {

                        if (key === username || value === userID) {
                            success.participants.delete(key);
                            response = 'found';
                        }

                    });

                    if (!response) {
                        response = `<@${userID}> tu ne participes pas à l'opération : ${success.name} du ${DateTime.fromMillis(success.date).setLocale('fr').toLocaleString(DateTime.DATETIME_SHORT)}`;
                        logger.logAndDB(command, userID, 'info', response);
                    } else {

                        response = await OperationModel.updateOne({_id: eventID}, {$set: {participants: success.participants}}).then(
                            () => {
                                const successMessage = `<@${userID}> tu ne participes plus à l'opération : ${success.name} du ${DateTime.fromMillis(success.date).setLocale('fr').toLocaleString(DateTime.DATETIME_SHORT)}`;
                                logger.logAndDB(command, userID, 'info', successMessage);
                                return successMessage;
                            }, error => {
                                logger.logAndDB(command, userID, 'error', error);
                                return 'Erreur inconnu';
                            }
                        );

                    }

                    return response;
                }
                const errorMessage = `Aucune opération ne porte l\'id : ${eventID}`;
                logger.logAndDB(command, userID, 'info', errorMessage);
                return errorMessage;
            }, error => {
                logger.logAndDB(command, userID, 'error', error);
                return 'Erreur inconnu';
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
     * @param username -- The usernme of the user
     * @param userID -- The userID of the user
     * @param command -- the executed command
     * @return string -- The error/success message to display
     */
    public static async validateAndCreatOperation(date: string,
                                                  time: string,
                                                  name: string,
                                                  description: string,
                                                  serverID: string,
                                                  username: string,
                                                  userID: string,
                                                  command: string) {

        if (date !== undefined &&
            time !== undefined &&
            name !== undefined &&
            description !== undefined &&
            serverID !== undefined &&
            username !== undefined &&
            userID !== undefined) {

            if (date.length > 0 && time.length > 0 && name.length > 0 && description.length > 0) {

                const luxon = DateTime.fromFormat(`${date} ${time}`, 'dd/MM/yyyy HH:mm').setLocale('fr').toMillis();
                const current = DateTime.local().setLocale('fr').toMillis();
                if (luxon <= current) {
                    return `L'opération ne peut pas étre dans le passé`;
                }

                const participants = new Map<string, string>().set(username, userID);

                const operationToCreate = {
                    serverID,
                    name,
                    description,
                    creatorID: userID,
                    date: luxon,
                    participants
                } as IOperation;

                return await new OperationModel(operationToCreate).save().then(
                    (success: IOperation) => {
                        const returnMessage = `Opération (ID: ${success.id}) créée avec succès, merci de ta participation <@${userID}> !`;
                        logger.logAndDB(command, userID, 'info', returnMessage);
                        return returnMessage;
                    }, error => {
                        logger.logAndDB(command, userID, 'error', error);
                        return 'Erreur inconnu';
                    }
                );
            }

        }
        const message = `Erreur : commande incorrecte...`;
        logger.logAndDB(command, userID, 'warn', message);
        return message;
    }

    /**
     * List all the events that are registered in the event array
     *
     * @return string -- The list of all existing event
     */
    public static async listAllEvents(command: string, userID: string) {
        return await OperationModel.find({date: {$gt: DateTime.local().setLocale('fr').toMillis()}}).then(
            (success: IOperation[]) => {
                let message = `Voici la liste des opérations en cours :\n\n`;
                for (const currentOperation of success) {
                    message += `**${currentOperation.id}**`;
                    message += ` ( *${DateTime.fromMillis(currentOperation.date).setLocale('fr').toLocaleString(DateTime.DATETIME_SHORT)}* )`;
                    message += ` ${currentOperation.name} - ${currentOperation.description} \n`; // Name and description of the event
                    message += `    Participants :\n`;
                    currentOperation.participants.forEach((value: string, key: string) => {
                        message += `        - ${key}\n`;
                    });
                    message += `\n`;
                }
                logger.logAndDB(command, userID, 'info', message);
                return message;
            }, error => {
                logger.logAndDB(command, userID, 'error', error);
                return 'Erreur inconnu';
            }
        );
    }

    public static async getAllEventFromDate(date: DateTime) {
        return await OperationModel.find({date: {$gt: DateTime.local().setLocale('fr').toMillis()}}).then(
            (success: IOperation[]) => {
                return success;
            }, error => {
                logger.logAndDB('getAllEventFromDate()', 'inetnal-request', 'error', error);
                return -1;
            }
        );
    }
}

export default CalendarEvent;
