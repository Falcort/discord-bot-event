import {Moment} from "moment";

class CalendarEvent {

    private serverID: number; // Server of the operation
    private ID: number; // ID of the operation
    private name: string; // Name of the event
    private description : string; // Description of the event
    private creatorID: string; // UserID of the creator
    private eventDate: Moment; // Creation date
    private participants: [string, string];

    constructor(readonly serverIDArg: number, readonly nameArg: string,
                readonly  descriptionArg: string, readonly creatorIDArg: string,
                readonly eventDateArg: Moment, readonly participantsArg: [string, string]) {
        this.serverID = serverIDArg;
        this.name = nameArg;
        this.description = descriptionArg;
        this.creatorID = creatorIDArg;
        this.eventDate = eventDateArg;
        this.participants = participantsArg;
    }

    public addParticipant(username: string, userID: string): void {
        this.participants.push(username, userID);
    }

    public removeParticipant(username: string, userID: string): void {
        this.participants.forEach((participant) => {
            //TODO:
        })
    }

    public static validateAndCreatCalendarEvent(): CalendarEvent {
        let result: CalendarEvent;
        //TODO:
        return result;
    }
}

export default CalendarEvent;
