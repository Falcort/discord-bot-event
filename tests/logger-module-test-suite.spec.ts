import { expect } from 'chai';
import { suite, test } from 'mocha-typescript';
import { Logger } from '../lib/class/logger';

/**
 * Test of privates methods of the Logger class
 */
@suite('Logger - testSuite')
class LoggerTestSuite extends Logger {

    constructor() {
        super();
    }

    @test 'logFromCode() : Code 100 - Should return trace'() {
        expect(this.logFromLevel('trace', 'TEST')).equals('trace');
    }

    @test 'logFromCode() : Code 200 - Should return info'() {
        expect(this.logFromLevel('info', 'TEST')).equals('info');
    }

    @test 'logFromCode() : Code 300 - Should return warn'() {
        expect(this.logFromLevel('warn', 'TEST')).equals('warn');
    }

    @test 'logFromCode() : Code 400 - Should return error'() {
        expect(this.logFromLevel('error', 'TEST')).equals('error');
    }

    @test 'logFromCode() : Code 500 - Should return fatal'() {
        expect(this.logFromLevel('fatal', 'TEST')).equals('fatal');
    }

    @test 'logFromCode() : Code 900 - Should return warning'() {
        expect(this.logFromLevel('default', 'TEST')).equals('default');
    }

}
