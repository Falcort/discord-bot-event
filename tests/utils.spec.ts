import 'mocha';
import { expect } from 'chai';
const config: Config = require('../config.json');
import { help, getMongoDbConnectionString} from '../lib/utils/functions';
import { Config } from "../lib/interfaces/config";


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
