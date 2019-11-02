import { expect } from 'chai';
import 'mocha';
import { IConfig } from '../lib/interfaces/config';
import { getMongoDbConnectionString, help } from '../lib/utils/functions';
const config: IConfig = require('../config.json');


describe('Utils', () => {
    it('help() : Should be ok', () => {
       expect(help()).contain(config.config.prefix);
    });

    it('getMongoDbConnectionString() : Should be ok', () => {
        process.env.GH_ACTIONS = 'true';
        expect(getMongoDbConnectionString()).contain('mongodb://localhost:27017/');
    });

    it('getMongoDbConnectionString() : Not Github Actions environment - should be ok', () => {
        const before = process.env.GH_ACTIONS;
        process.env.GH_ACTIONS = null;
        expect(getMongoDbConnectionString()).to.match(/^(mongodb:\/\/.{1,}:.{1,}@.{1,}:.{1,}\/.{1,})/);
        process.env.GH_ACTIONS = before;
    });
});
