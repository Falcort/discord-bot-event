import * as discord from "discord.io";
import CalendarEvent from "./CalendarEvent";
import moment = require("moment");
import { Config } from "./config";

const config: Config = require("./config.json");

/**
 * Function that send all commands to the user
 */
export function help(Bot: discord.Client, userID: string): void {
    let response = "";
    response += "**Créer une opération** : --addOpé DD/MM/YYYY HH:mm Nom Description\n";
    response += "**Lister les opérations** : --listOpé\n";
    response += "**Rejoindre une opération** : --joinOpé ID\n";
    response += "**Quitter une opération** : --leaveOpé ID";

    Bot.sendMessage({ // Send confirmation message
        to: userID,
        message: response
    });
}

/**
 * Test function that create test events en test all functionnalities
 */
export function test(userID: string, events: CalendarEvent[], Bot: discord.Client) {

    if(config.admins.indexOf(userID) > -1) {
        events.push(new CalendarEvent(1, "Anniversaire 1f3rn0",
            "Le jour du célèbre, charismatique, beau et du grand 1f3rn0 !!!!!",
            "127093870784675840",
            moment(`13/03/2019 22:00`, `DD/MM/YYYY HH/mm`),
            ["Falcort", "127093870784675840"]));

        events.push(new CalendarEvent(1, "Anniversaire HarpeDenier",
            "L'anniversaire du plus beau, que dis-je, du plus extraordinaire des êtres humains qui nous fait tous les jours, l'honneur de sa présence. Juste un mot : merci !",
            "127093870784675840",
            moment(`22/03/2019 22:00`, `DD/MM/YYYY HH/mm`),
            ["Falcort", "127093870784675840"]));

        events.push(new CalendarEvent(1, "Event3",
            "This is a test event",
            "127093870784675840",
            moment(`12/03/2019 22:00`, `DD/MM/YYYY HH/mm`),
            ["Falcort", "127093870784675840"]));

        console.log(events);
    } else {
        Bot.sendMessage({
            to: config.config.chanID,
            message: `Bien essayé petit con, mais cette commande est réservée aux administrateurs`
        });
    }
}
