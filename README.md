# Discord bot event
## Created by [SOUQUET Thibault](https://thibaultsouquet.fr)

![GitHub](https://img.shields.io/github/license/Falcort/discord-bot-event)
![GitHub package.json version](https://img.shields.io/github/package-json/v/Falcort/discord-bot-event)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/Falcort/discord-bot-event)
[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2FFalcort%2FMinecraft-ScarletMonastery%2Fbadge%3Fref%3Dmaster&style=flat)](https://actions-badge.atrox.dev/Falcort/discord-bot-event/goto?ref=master)

### Created in 2019

## Subject
This discord bot was designed for the Star Citizen organisation `Svalinn Tactical Security Group`.  
It is design to be able to store event on a particular date and time, so people can join the event.  
The goal was to manage the number of people that have joined an event, and better organise the event with that number in mind.

It was initially wrote ine Javascript, and quickly moved into TypeScript.

## How to use
This is NodeJS application that need a MongoDB database to store the events.
You need to fill the [config.json](https://github.com/Falcort/discord-bot-event/blob/master/config.json) file with your information.

Then here are the available commands :
 - `npm run build` - This will compile the Typescript into javascript.
 - `npm start` - This will start the Typescript application development purposes.
 - `npm run prod` - This will build the application, then start the built server.
 - `npm run sonar` - This will create a tslint `report.json` and send it to SonarCloud.
 
 Sometimes the bot is unable to connect to the Discords servers, if so you can try this commands :  
 `npm install https://github.com/woor/discord.io/tarball/gateway_v6`

## Warnings

1. For some commands you will ned to have environment variables set for them to work correctly
2. The Github actions files requires some environment variables as well

## Useful links
- [SonarCloud](https://sonarcloud.io/dashboard?id=Falcort_discord-bot-event)
- [Release](https://github.com/Falcort/discord-bot-event/releases)
- [Report an issue](https://github.com/Falcort/discord-bot-event/issues)
- [Dependencies](https://github.com/Falcort/discord-bot-event/network/dependencies)


