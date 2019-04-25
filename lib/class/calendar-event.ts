import { Moment } from 'moment';
import moment = require('moment');
import { IOperation } from '../interfaces/operation';
import OperationModel from '../models/operation';

class CalendarEvent {

    private operation;

    // public static events: CalendarEvent[] = []; // List of all currents events

    // private static increment = -1; // Auto increment for the ID

    constructor(operation: IOperation) {

        this.operation = operation;

        // this.ID = CalendarEvent.increment + 1;
        // CalendarEvent.increment++;
    }

    /**
     * Add a participant to an event
     * @param eventID -- The ID of the event the user want to join
     * @param username -- Username
     * @param userID -- UserId of the user that want to join the event
     * @return string -- The result message of the function
     */
    // public static addParticipant(eventID: string, username: string, userID: string): string {
    //     let responce;
    //     CalendarEvent.events.forEach((event) => {
    //         if(event.ID.toString() === eventID) {
    //             event.participants.forEach((value: string, key: string) => {
    //                 if(key === username || value === userID) {
    //                     responce = `<@${userID}> tu participes déjà à l'opération : ${event.name}`;
    //                 }
    //             });
    //             if(responce === undefined) {
    //                 event.participants.set(username, userID);
    //                 responce = `<@${userID}> merci pour ta participation à l'opération : ${event.name} le ${event.date.format(`DD/MM/YYYY HH:mm`)}`;
    //             }
    //         }
    //     });
    //     if(responce === undefined) { responce = `Aucune opération ne correspond à l'id : ${eventID}`; }
    //     return responce;
    // }

    /**
     * Remove a player from the selected event
     * @param username -- Username of the user that want to leave
     * @param userID -- UserID of the user that want to leavse
     * @param eventID -- ID of the event the user want to leave
     * @return string -- The result messages of the function
     */
    // public static removeParticipant(username: string, userID: string, eventID: string): string {
    //     let responce;
    //
    //     CalendarEvent.events.forEach((event) => {
    //         if(event.ID.toString() === eventID) {
    //             event.participants.forEach((value: string, key: string) => {
    //                 if (key === username || value === userID) {
    //                     event.participants.delete(key);
    //                     responce = `<@${userID}> tu ne participes plus à l'opération : ${event.name} du ${event.date.format(`DD/MM/YYYY HH:mm`)}`;
    //                 }
    //             });
    //             if(responce === undefined) {
    //                 responce = `<@${userID}> tu ne participes pas à l'opération : ${event.name} du ${event.date.format(`DD/MM/YYYY HH:mm`)}`;
    //             }
    //         }
    //     });
    //     if(responce === undefined) {
    //         responce = `Aucune opération ne porte l'id : ${eventID}`;
    //     }
    //
    //     return responce;
    // }

    /**
     * Function that validate all arguments and if valide create a new event.
     * @param date -- Date in format DD/MM/YYYY
     * @param time -- Time in format HH:mm
     * @param name -- Name of the event
     * @param description -- Description of the event
     * @param serverID -- The serverID, used to know which event is on which server
     * @param username -- The usernme of the user
     * @param userID -- The userID of the user
     * @return string -- The error/success message to display
     */
    public static async validateAndCreatOperation(date: string, time: string, name: string, description: string, serverID: string, username: string, userID: string) {

        if(date !== undefined && time !== undefined && name !== undefined && description !== undefined && serverID !== undefined && username !== undefined && userID !== undefined) {

            if(date.length > 0 && time.length > 0 && name.length > 0 && description.length > 0) {
                const day = date.split('/')[0];
                const month = date.split('/')[1];
                const year = date.split('/')[2];
                const hour = time.split(':')[0];
                const minutes = time.split(':')[1];


                const momentDate = moment(`${day}/${month}/${year} ${hour}:${minutes}`, `DD/MM/YYYY HH/mm`);

                if(!momentDate.isValid()) { return `Date invalide`; }

                const participants = new Map<string, string>().set(username, userID);

                const operationToCreate: IOperation = {
                    serverID,
                    name,
                    description,
                    creatorID: userID,
                    date: momentDate,
                    participants
                } as IOperation;

                return await new OperationModel(operationToCreate).save().then(
                    (success: IOperation) => {
                        return `Opération (ID: ${success.id}) créée avec succès, merci de ta participation <@${userID}> !`;
                    }, error => {
                        console.log(error);
                        return 'Erreur inconnu';
                    }
                );
            }

        }
        return `Erreur : commande incorrecte...`;
    }

    /**
     * List all the events that are registered in the event array
     *
     * @return string -- The list of all existing event
     */
    public static async listAllEvents() {
        return await OperationModel.find({}).then(
            (success: IOperation[]) => {
                let message = `Voici la liste des opérations en cours :\n\n`;
                for (const operation of success) {
                    message += `**${operation.id}**`;
                    message += ` ( *${moment(operation.date)}* )`;
                    message += ` ${operation.name} - ${operation.description} \n`; // Name and description of the event
                    message += `    Participants :\n`;
                    operation.participants.forEach((value: string, key: string) => {
                        message += `        - ${key}\n`;
                    });
                    message += `\n`;
                }
                return message;
            }, error => {
                console.log(error);
                return 'Erreur inconnu';
            }
        );
    }
}

export default CalendarEvent;
