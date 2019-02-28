import CalendarEvent from "./CalendarEvent";
import moment = require("moment");
import { Config } from "./config";
import * as Discord from "discord.js";

const config: Config = require("./config.json");

/**
 * Function that send all commands to the user
 * @return string -- The message to send with all commandes details
 */
export function help(): string {
    let response = "";
    response += "**Créer une opération** : --addOpé DD/MM/YYYY HH:mm Nom Description\n";
    response += "**Lister les opérations** : --listOpé\n";
    response += "**Rejoindre une opération** : --joinOpé ID\n";
    response += "**Quitter une opération** : --leaveOpé ID";

    return response;
}

/**
 * Test function that create test events en test all functionnalities
 * RESERVED TO ADMINS
 * @return string -- Nothing if valid, or an error message if a non admin user try it
 */
export function test(userID: string): string {
    let responce;
    if(config.admins.indexOf(userID) > -1) {
        CalendarEvent.events.push(new CalendarEvent(1, "Anniversaire 1f3rn0",
            "Le jour du célèbre, charismatique, beau et du grand 1f3rn0 !!!!!",
            "127093870784675840",
            moment(`13/03/2019 22:00`, `DD/MM/YYYY HH/mm`),
            new Map<string, string>().set("Falcort","127093870784675840")));
        CalendarEvent.events.push(new CalendarEvent(1, "Anniversaire HarpeDenier",
            "L'anniversaire du plus beau, que dis-je, du plus extraordinaire des êtres humains qui nous fait tous les jours, l'honneur de sa présence. Juste un mot : merci !",
            "127093870784675840",
            moment(`22/03/2019 22:00`, `DD/MM/YYYY HH/mm`),
            new Map<string, string>().set("Falcort","127093870784675840")));
        CalendarEvent.events.push(new CalendarEvent(1, "Event3",
            "This is a test event",
            "127093870784675840",
            moment(`12/03/2019 22:00`, `DD/MM/YYYY HH/mm`),
            new Map<string, string>().set("Falcort","127093870784675840")));
    } else {
        responce = `Bien essayé petit con, mais cette commande est réservée aux administrateurs`;
    }
    return responce;
}

/**
 * Function that clean the channel
 * This function call itslef while there is still message to delete
 * @param Bot -- The Bot variable
 * @param channel -- The channel that the bot need to clean
 * @param number -- The incrementing number of deleted messages
 * @return TODO: TBD
 */
export async function clean(Bot: Discord.Client, channel: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel, number: number = 0) {
    let messages = await channel.fetchMessages();
    if(messages.size > 0) {
        let message = messages.first();
        await message.delete();
        number++;
        return clean(Bot, channel, number);
    } else {
        channel.send(`${number} messages supprimées !`).then((message: Discord.Message) => {
            message.delete(2000).catch();
        });
    }
}
