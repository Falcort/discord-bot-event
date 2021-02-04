# Discord bot event
## Created by [SOUQUET Thibault](https://thibaultsouquet.fr)
### Contributors by ROSAR Quentin & MARTINEZ Jennifer

![Licence](https://img.shields.io/github/license/Falcort/discord-bot-event)
![GitHub package.json version](https://img.shields.io/github/package-json/v/Falcort/discord-bot-event)
[![Github CI](https://github.com/Falcort/discord-bot-event/workflows/Github%20CI/badge.svg?branch=master)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Falcort_discord-bot-event&metric=alert_status)](https://sonarcloud.io/dashboard?id=Falcort_discord-bot-event)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Falcort_discord-bot-event&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=Falcort_discord-bot-event)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=Falcort_discord-bot-event&metric=code_smells)](https://sonarcloud.io/dashboard?id=Falcort_discord-bot-event)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=Falcort_discord-bot-event&metric=bugs)](https://sonarcloud.io/dashboard?id=Falcort_discord-bot-event)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Falcort_discord-bot-event&metric=coverage)](https://sonarcloud.io/dashboard?id=Falcort_discord-bot-event)
### Project under AGPLv3
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
 - `npm run test` - This will run mocha unit tests.
 - `npm run coverage` - This will run mocha unit tests and generate the coverage.
 
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


