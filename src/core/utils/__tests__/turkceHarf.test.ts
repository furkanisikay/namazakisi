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
    it('Kurmancî ve Türkmencede Türkçe i eşlemesi YOK: i → I (CLDR ku/tk alfabesinde ı ve İ yok)', () => {
        // Kurmancî (Hawar): a b c ç d e ê f g h i î j k l m n o p q r s ş t u û v w x y z.
        expect(dilBuyukHarf('bîranîn û şîret', 'ku')).toBe('BÎRANÎN Û ŞÎRET');
        expect(dilBuyukHarf('nimêja êvarê', 'ku')).toBe('NIMÊJA ÊVARÊ');
        // Türkmence: a b ç d e ä f g h i j ž k l m n ň o ö p r s ş t u ü w y ý z.
        expect(dilBuyukHarf('ýatsy namazy', 'tk')).toBe('ÝATSY NAMAZY');
        expect(dilBuyukHarf('ikindi', 'tk')).toBe('IKINDI');
    });
    it('Kiril (Tatarca, Bulgarca, Makedonca) ve Lehçe harfleri büyür', () => {
        expect(dilBuyukHarf('әөүҗңһ', 'tt')).toBe('ӘӨҮҖҢҺ');
        expect(dilBuyukHarf('ѓќѕџљњј', 'mk')).toBe('ЃЌЅЏЉЊЈ');
        expect(dilBuyukHarf('ъьющ', 'bg')).toBe('ЪЬЮЩ');
        expect(dilBuyukHarf('ąćęłńóśźż', 'pl')).toBe('ĄĆĘŁŃÓŚŹŻ');
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
