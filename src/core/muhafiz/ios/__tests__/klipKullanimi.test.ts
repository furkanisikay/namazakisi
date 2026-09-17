import { gunAnahtari, gunFarki, KLIP_TUTMA_GUNU, klipKaydiniGuncelle } from '../klipKullanimi';

describe('klipKaydiniGuncelle', () => {
    const BUGUN = '2026-09-17';

    it('bu turda kullanilanlar bugunle yazilir', () => {
        expect(klipKaydiniGuncelle(null, ['a.caf', 'b.caf'], BUGUN)).toEqual({
            'a.caf': BUGUN,
            'b.caf': BUGUN,
        });
    });

    /**
     * ASIL KURAL: kilinmis vaktin klipleri o turda planlanmaz. Yasa dayali tutma
     * olmasaydi silinir, ertesi gun arka planda yeniden uretilemezdi.
     */
    it('bu turda KULLANILMAYAN ama tutma suresi icindeki klip korunur', () => {
        const kayit = klipKaydiniGuncelle({ 'dun.caf': '2026-09-16' }, [], BUGUN);
        expect(kayit).toEqual({ 'dun.caf': '2026-09-16' });
    });

    it('tutma suresini dolduran klip dusurulur (silinecek)', () => {
        const kayit = klipKaydiniGuncelle(
            { 'eski.caf': '2026-09-10', 'sinirda.caf': '2026-09-11' },
            [],
            BUGUN
        );
        expect(KLIP_TUTMA_GUNU).toBe(7);
        expect(kayit).toEqual({ 'sinirda.caf': '2026-09-11' });
    });

    it('yeniden kullanilan klibin tarihi tazelenir', () => {
        expect(klipKaydiniGuncelle({ 'a.caf': '2026-09-01' }, ['a.caf'], BUGUN)).toEqual({ 'a.caf': BUGUN });
    });

    /** Kayit cihazdan okunur; bozuk satir GC'yi durdurmamali, bozuk tarih tutulmamali. */
    it.each([[undefined], [42], ['metin'], [['dizi']]])('bozuk kayit (%p) bos sayilir', (bozuk) => {
        expect(klipKaydiniGuncelle(bozuk, ['a.caf'], BUGUN)).toEqual({ 'a.caf': BUGUN });
    });

    it('gecersiz tarihli satir TUTULMAZ (yoksa dosya hic temizlenemezdi)', () => {
        expect(klipKaydiniGuncelle({ 'x.caf': 'dun', 'y.caf': 5 }, [], BUGUN)).toEqual({});
    });
});

describe('gun yardimcilari', () => {
    it('gunFarki tam gun sayar', () => {
        expect(gunFarki('2026-09-10', '2026-09-17')).toBe(7);
        expect(gunFarki('2026-12-31', '2027-01-01')).toBe(1);
    });

    it('gunAnahtari yerel tarihi sifir doldurarak yazar', () => {
        expect(gunAnahtari(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    });
});
