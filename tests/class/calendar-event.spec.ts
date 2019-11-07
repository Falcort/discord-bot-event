import { expect } from 'chai';
import 'mocha';
import CalendarEvent from '../../lib/class/calendar-event';
import { IConfig } from '../../lib/interfaces/config';
import { getMongoDbConnectionString } from '../../lib/utils/functions';

const config: IConfig = require('../../config.json');
import * as mongoose from 'mongoose';


describe('Calendar event', () => {

    // Before all test open a DB connection
    before((done) => {
        const uri = getMongoDbConnectionString();
        mongoose.connect(uri, {
            useNewUrlParser: true,
            useCreateIndex: true
        }).finally();
        mongoose.connection.once('open', () => {
            done();
        });
    });

    // After all test it close the DB
    after((done) => {
        mongoose.connection.close().finally(done);
    });

    it('listAllEvents() : Should be ok', async () => {
        const command = `${config.config.prefix}listOpé`;
        const message = await CalendarEvent.listAllEvents(command, '127085518579040257');
        expect(message).contain('Voici la liste des opérations en cours :');
    });

    it('validateAndCreateOperation(): Should return succes', async () => {
        const message = await CalendarEvent.validateAndCreatOperation('22/03/2031',
            '21:00',
            'The league of explorers',
            'Explore the galaxy',
            '1',
            'Bender',
            '1',
            'ok');
        const operationID = message.match(/[a-z0-9]{24}/);
        expect(message).contain(`Opération (ID: ${operationID}) créée avec succès, merci de ta participation <@1> !`);
    });

});
