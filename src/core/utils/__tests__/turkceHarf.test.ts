import { dilBuyukHarf, turkceBuyukHarf, turkceKucukHarf } from '../turkceHarf';

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

describe('dilBuyukHarf', () => {
    it('Türkçe dışında i → I', () => {
        expect(dilBuyukHarf('reminders', 'en')).toBe('REMINDERS');
        expect(dilBuyukHarf('hatırlatmalar', 'tr')).toBe('HATIRLATMALAR');
    });
    it('Yunancada tümü büyük yazımda vurgu düşer, çift nokta kalır', () => {
        expect(dilBuyukHarf('Υπενθυμίσεις', 'el')).toBe('ΥΠΕΝΘΥΜΙΣΕΙΣ');
        expect(dilBuyukHarf('Πόσο να σας υπενθυμίζουμε;', 'el')).toBe('ΠΟΣΟ ΝΑ ΣΑΣ ΥΠΕΝΘΥΜΙΖΟΥΜΕ;');
        expect(dilBuyukHarf('Ώρα ‘Ασρ', 'el')).toBe('ΩΡΑ ‘ΑΣΡ');
        expect(dilBuyukHarf('Ταπετσαρία', 'el')).toBe('ΤΑΠΕΤΣΑΡΙΑ');
        expect(dilBuyukHarf('προϊόν', 'el')).toBe('ΠΡΟΪΟΝ');
    });
    it('Yunancada vurgunun böldüğü ikili çift nokta alır, tek başına ή vurgulu kalır', () => {
        expect(dilBuyukHarf('τσάι', 'el')).toBe('ΤΣΑΪ');
        expect(dilBuyukHarf('Μάιος', 'el')).toBe('ΜΑΪΟΣ');
        expect(dilBuyukHarf('αύριο', 'el')).toBe('ΑΥΡΙΟ');
        expect(dilBuyukHarf('ναι ή όχι', 'el')).toBe('ΝΑΙ Ή ΟΧΙ');
        expect(dilBuyukHarf('ήλιος', 'el')).toBe('ΗΛΙΟΣ');
    });
});
