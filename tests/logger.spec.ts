import { expect } from 'chai';
import 'mocha';
import { logFromLevel } from '../lib/class/logger';

describe('Logger', () => {
    it('trace', () => {
        expect(logFromLevel()).contain('trace');
    });

    it('info', () => {
        expect(logFromLevel).contain('info');
    });

    it('warn', () => {
        expect(logFromLevel).contain('warn');
    });

    it('error', () => {
        expect(logFromLevel).contain('error');
    });

    it('fatal', () => {
        expect(logFromLevel).contain('fatal');
    });

    it('default', () => {
        expect(logFromLevel).contain('default');
    });

    
});
