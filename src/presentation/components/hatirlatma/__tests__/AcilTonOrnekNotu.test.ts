jest.mock('@expo/vector-icons/FontAwesome5', () => 'FontAwesome5');
jest.mock('../../../../../modules/expo-countdown-notification/src', () => ({ sesSec: jest.fn() }));

import { acilTonOrnekNotu } from '../AdimDetayModal';

describe('acil ton örnek notu — Rahatsız Etmeyin cümlesi erişime bağlı', () => {
    it('acil olmayan tonda ve iPhone\'da yok', () => {
        expect(acilTonOrnekNotu('sert', 'android', true)).toBe('');
        expect(acilTonOrnekNotu('acil', 'ios', true)).toBe('');
    });
    it('erişim yoksa "susar" der, varsa ya da bilinmiyorsa "delebilir"', () => {
        expect(acilTonOrnekNotu('acil', 'android', false)).toContain('susar');
        expect(acilTonOrnekNotu('acil', 'android', true)).toContain('delebilir');
        expect(acilTonOrnekNotu('acil', 'android', null)).toContain('delebilir');
    });
});
