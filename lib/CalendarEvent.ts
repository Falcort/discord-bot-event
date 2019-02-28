import {Moment} from "moment";
import moment = require("moment");

class CalendarEvent {

    public static events: CalendarEvent[] = []; // List of all currents events

    private serverID: number; // Server of the operation
    private ID: number; // ID of the operation
    private name: string; // Name of the event
    private description : string; // Description of the event
    private creatorID: string; // UserID of the creator
    private date: Moment; // Creation date
    private participants: Map<string, string>; //Map of participants : Map<username, userID>

    private static increment = -1; // Auto increment for the ID

    constructor(readonly serverIDArg: number, readonly nameArg: string, readonly  descriptionArg: string, readonly creatorIDArg: string, readonly dateArg: Moment, readonly participantsArg: Map<string, string>) {
        this.serverID = serverIDArg;
        this.name = nameArg;
        this.description = descriptionArg;
        this.creatorID = creatorIDArg;
        this.date = dateArg;
        this.participants = participantsArg;

        this.ID = CalendarEvent.increment + 1;
        CalendarEvent.increment++;
    }

    /**
     * Add a participant to an event
     * @param eventID -- The ID of the event the user want to join
     * @param username -- Username
     * @param userID -- UserId of the user that want to join the event
     * @return string -- The result message of the function
     */
    public static addParticipant(eventID: string, username: string, userID: string): string {
        let responce;
        CalendarEvent.events.forEach((event) => {
            if(event.ID.toString() === eventID) {
                event.participants.forEach((value: string, key: string) => {
                    if(key === username || value === userID) {
                        responce = `<@${userID}> tu participes déjà à l'opération : ${event.name}`
                    }
                });
                if(responce === undefined) {
                    event.participants.set(username, userID);
                    responce = `<@${userID}> merci pour ta participation à l'opération : ${event.name} le ${event.date.format(`DD/MM/YYYY HH:mm`)}`
                }
            }
        });
        if(responce === undefined) responce = `Aucune opération ne correspond à l'id : ${eventID}`;
        return responce;
    }

    /**
     * Remove a player from the selected event
     * @param username -- Username of the user that want to leave
     * @param userID -- UserID of the user that want to leavse
     * @param eventID -- ID of the event the user want to leave
     * @return string -- The result messages of the function
     */
    public static removeParticipant(username: string, userID: string, eventID: string): string {
        let responce;

        CalendarEvent.events.forEach((event) => {
            if(event.ID.toString() === eventID) {
                event.participants.forEach((value: string, key: string) => {
                    if (key === username || value === userID) {
                        event.participants.delete(key);
                        responce = `<@${userID}> tu ne participes plus à l'opération : ${event.name} du ${event.date.format(`DD/MM/YYYY HH:mm`)}`;
                    }
                });
                if(responce === undefined) {
                    responce = `<@${userID}> tu ne participes pas à l'opération : ${event.name} du ${event.date.format(`DD/MM/YYYY HH:mm`)}`;
                }
            }
        });
        if(responce === undefined) {
            responce = `Aucune opération ne porte l'id : ${eventID}`;
        }

        return responce;
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
     * @return string -- The error/success message to display
     *
     * TODO: more details for returns, like the day is invalid
     * TODO: validate that this event have unique name
     * TODO: warning if event is on sameday of an other
     */
    public static validateAndCreatCalendarEvent(date: string, time: string, name: string, description: string, serverID: string, username: string, userID: string): string {

        if(date !== undefined && time !== undefined && name !== undefined && description !== undefined && serverID !== undefined && username !== undefined && userID !== undefined) {

            if(date.length > 0 && time.length > 0 && name.length > 0 && description.length > 0) {
                let day = date.split("/")[0];
                let month = date.split("/")[1];
                let year = date.split("/")[2];
                let hour = time.split(":")[0];
                let minutes = time.split(":")[1];


                let momentDate = moment(`${day}/${month}/${year} ${hour}:${minutes}`, `DD/MM/YYYY HH/mm`);

                if(!momentDate.isValid()) return `Date invalide`;

                let participants = new Map<string, string>().set(username, userID);

                let result: CalendarEvent = new CalendarEvent(+serverID, name, description, userID, momentDate, participants);
                CalendarEvent.events.push(result);

                return `Opération (ID: ${result.ID}) créée avec succès, merci de ta participation <@${userID}> !`;
            }

        }
        return `Erreur : commande incorrecte...`
    }

    /**
     * List all the events that are registered in the event array
     * @return string -- The list of all existing event
     * TODO: display only messages for the current server
     */
    public static listAllEvents(): string {
        let responce = `Voici la liste des opérations en cours :\n\n`;
        CalendarEvent.events.forEach((event) => {
            let eventString = `**${event.ID}**`; // ID of the event
            eventString += ` ( *${event.date.format(`DD/MM/YYYY HH:mm`)}* )`;
            eventString += ` ${event.name} - ${event.description} \n`; //Name and description of the event
            eventString += `    Participants :\n`;
            event.participants.forEach((value: string, key: string) => {
                eventString += `        - ${key}\n`;
            });
            eventString += `\n`;
            responce += eventString;
        });
        return responce;
    }
}

export default CalendarEvent;
