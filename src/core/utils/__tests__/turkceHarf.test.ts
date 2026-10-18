import { turkceBuyukHarf, turkceKucukHarf } from '../turkceHarf';

describe('Türkçe büyük/küçük harf (toUpperCase tuzağı nöbetçisi)', () => {
    it('noktalı i korunur', () => {
        expect(turkceBuyukHarf('bildirim')).toBe('BİLDİRİM');
        expect(turkceBuyukHarf('İkindi')).toBe('İKİNDİ');
        expect(turkceBuyukHarf('ışık çağrı öğle şükür')).toBe('IŞIK ÇAĞRI ÖĞLE ŞÜKÜR');
        expect(turkceBuyukHarf('')).toBe('');
    });
    it('küçük harf ikizi', () => {
        expect(turkceKucukHarf('İKİNDİ')).toBe('ikindi');
        expect(turkceKucukHarf('IŞIK')).toBe('ışık');
    });
});
