import { NAMAZ_DURUMLARI, NAMAZ_EYLEMI, namazDurumuSec } from '../durumSozlugu';

describe('namaz durum sözlüğü', () => {
    it('üç durum, tekil ikon ve etiket', () => {
        const d = Object.values(NAMAZ_DURUMLARI);
        expect(d).toHaveLength(3);
        expect(new Set(d.map((x) => x.ikon)).size).toBe(3);
        expect(new Set(d.map((x) => x.etiket)).size).toBe(3);
    });
    it('durum seçimi', () => {
        expect(namazDurumuSec(true, false)).toBe('kilindi');
        expect(namazDurumuSec(false, true)).toBe('vaktiGeldi');
        expect(namazDurumuSec(false, false)).toBe('girmedi');
    });
    it('eylem adı sonuçla aynı kök', () => {
        expect(NAMAZ_EYLEMI.kildim).toBe('Kıldım');
        expect(NAMAZ_EYLEMI.kilindi).toBe(NAMAZ_DURUMLARI.kilindi.etiket);
    });
});
