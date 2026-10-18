import { NAMAZ_DURUMLARI, NAMAZ_EYLEMI, namazDurumuSec } from '../durumSozlugu';

describe('namaz durum sözlüğü', () => {
    it('dört durum, tekil ikon ve etiket', () => {
        const d = Object.values(NAMAZ_DURUMLARI);
        expect(d).toHaveLength(4);
        expect(new Set(d.map((x) => x.ikon)).size).toBe(4);
        expect(new Set(d.map((x) => x.etiket)).size).toBe(4);
    });
    it('durum seçimi', () => {
        expect(namazDurumuSec(true, false)).toBe('kilindi');
        expect(namazDurumuSec(false, true)).toBe('vaktiGeldi');
        expect(namazDurumuSec(false, false)).toBe('girmedi');
        // Vakti çıkmış ve kılınmamış: "Kılınmadı" — "Vakti geldi" DEĞİL.
        expect(namazDurumuSec(false, true, true)).toBe('gecti');
        expect(NAMAZ_DURUMLARI.gecti.etiket).toBe('Kılınmadı');
        // Kılınmışsa çıkmış olması önemsiz.
        expect(namazDurumuSec(true, true, true)).toBe('kilindi');
    });
    it('eylem adı sonuçla aynı kök', () => {
        expect(NAMAZ_EYLEMI.kildim).toBe('Kıldım');
        expect(NAMAZ_EYLEMI.kilindi).toBe(NAMAZ_DURUMLARI.kilindi.etiket);
    });
});
