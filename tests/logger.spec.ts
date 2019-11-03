import { expect } from 'chai';
import 'mocha';
import { Logger } from '../lib/class/logger';

describe('Logger', () => {
    it('trace', () => {
        expect(new Logger().logFromLevel('trace', 'test')).contain('trace');
    });

    it('info', () => {
        expect(new Logger().logFromLevel('info', 'test')).contain('info');
    });

    it('warn', () => {
        expect(new Logger().logFromLevel('warn', 'test')).contain('warn');
    });

    it('error', () => {
        expect(new Logger().logFromLevel('error', 'test')).contain('error');
    });

    it('fatal', () => {
        expect(new Logger().logFromLevel('fatal', 'test')).contain('fatal');
    });

    it('default', () => {
        expect(new Logger().logFromLevel('default', 'test')).contain('default');
    });
});
