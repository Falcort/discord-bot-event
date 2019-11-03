import { expect } from 'chai';
import 'mocha';
import { Logger } from '../lib/class/logger';

describe('Logger', () => {
    it('lofFromLevel: Should return trace', () => {
        expect(new Logger().logFromLevel('trace', 'test')).contain('trace');
    });

    it('lofFromLevel: Should return info', () => {
        expect(new Logger().logFromLevel('info', 'test')).contain('info');
    });

    it('lofFromLevel: Should return warn', () => {
        expect(new Logger().logFromLevel('warn', 'test')).contain('warn');
    });

    it('lofFromLevel: Should return error', () => {
        expect(new Logger().logFromLevel('error', 'test')).contain('error');
    });

    it('lofFromLevel: Should return fatal', () => {
        expect(new Logger().logFromLevel('fatal', 'test')).contain('fatal');
    });

    it('lofFromLevel: Should return default', () => {
        expect(new Logger().logFromLevel('default', 'test')).contain('default');
    });
});
