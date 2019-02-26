import {Moment} from "moment";
import { Config } from "./config";

const config: Config = require("./config.json");

class CalendarEvent {

    public static events: CalendarEvent[] = [];

    private serverID: number; // Server of the operation
    private ID: number; // ID of the operation
    private name: string; // Name of the event
    private description : string; // Description of the event
    private creatorID: string; // UserID of the creator
    private date: Moment; // Creation date
    private participants: Map<string, string>;

    private static increment = -1;

    constructor(readonly serverIDArg: number, readonly nameArg: string,
                readonly  descriptionArg: string, readonly creatorIDArg: string,
                readonly dateArg: Moment, readonly participantsArg: Map<string, string>) {
        this.serverID = serverIDArg;
        this.name = nameArg;
        this.description = descriptionArg;
        this.creatorID = creatorIDArg;
        this.date = dateArg;
        this.participants = participantsArg;

        this.ID = CalendarEvent.increment + 1;
        CalendarEvent.increment++;
    }

    public static addParticipant(eventID: string, username: string, userID: string): string {
        let responce;
        CalendarEvent.events.forEach((event) => {
            if(event.ID.toString() === eventID) {
                console.log(event.participants);
                event.participants.forEach((key: string, value: string) => {
                    if(key === username || value === username) {
                        responce = `<@${userID}> tu participes déjà à l'opération : ${event.name}`
                    } else {
                        event.participants.set(username, userID);
                        responce = `<@${userID}> merci pour ta participation à l'opération : ${event.name} le ${event.date.format(`DD/MM/YYYY HH:mm`)}`
                    }
                });
            }
        });
        if(responce === undefined) responce = `Aucune opération ne correspond à l'id : ${eventID}`;

        return responce;
    }

    /**
     * Remove a player from the selected event
     * @param username -- username of the user that want to leave
     * @param userID -- userID of the user that want to leavse
     * @param events -- list of all events
     * @param Bot -- The discord client to send messages
     */
    public static removeParticipant(username: string, userID: string, eventID: number): string {
        let responce;

        CalendarEvent.events.forEach((event) => {
            if(event.ID === eventID) {
                event.participants.forEach((value: string, key: string) => {
                    if (value === username || key === userID) {
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

    public static validateAndCreatCalendarEvent(): CalendarEvent {
        let result: CalendarEvent;
        //TODO:
        return result;
    }

    /**
     * List all the events that are registered in the event array
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
