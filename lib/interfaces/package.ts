export interface IPackage {
  "name": string,
  "version": number,
  "description": string,
  "main": string,
  "scripts": {
    "build": string,
    "start": string,
    "prod": string,
    "sonar": string
  },
  "repository": {
    "type": string,
    "url": string
  },
  "keywords": [string],
  "author": string,
  "license": string,
  "dependencies": {
    "discord.js": string,
    "forever": string,
    "log4js": string,
    "luxon": string,
    "mongoose": string,
    "typescript": string
  },
  "devDependencies": {
    "ts-node": string,
    "tslint": string,
    "@types/luxon": string,
    "@types/mongoose": string,
    "@types/node": string,
    "sonarqube-scanner": string
  }
}
