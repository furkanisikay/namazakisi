/**
 * Yatış hatırlatması ayarlarının normalizasyonu (issue #290): bozuk kayıt
 * varsayılana düşer; "önce" ve saat seçilebilir aralığa çekilir.
 */
import { yatisAyarlariniNormalizeEt } from '../LocalYatisHatirlatmaServisi';
import { YATIS_VARSAYILAN_AYARLARI } from '../../../core/yatis/yatisPlani';

describe('yatisAyarlariniNormalizeEt', () => {
    it.each([null, 42, 'x', [1, 2]])('nesne dışı kayıt (%p) varsayılana düşer', (ham) => {
        expect(yatisAyarlariniNormalizeEt(ham)).toEqual(YATIS_VARSAYILAN_AYARLARI);
    });

    it('geçerli kayıt korunur', () => {
        const a = { aktif: true, saat: 0, dakika: 30, onceDk: 45, yatsiHatirlatmasi: false, muhasebe: true };
        expect(yatisAyarlariniNormalizeEt(a)).toEqual(a);
    });

    it('sınır dışı değerler aralığa çekilir; seçilemeyen saat varsayılana düşer', () => {
        expect(yatisAyarlariniNormalizeEt({ aktif: true, saat: 15, dakika: 62, onceDk: 0 })).toMatchObject({
            saat: YATIS_VARSAYILAN_AYARLARI.saat,
            dakika: 55,
            onceDk: 5,
        });
        expect(yatisAyarlariniNormalizeEt({ onceDk: 999, dakika: 7 })).toMatchObject({ onceDk: 120, dakika: 5 });
    });

    it('aktif yalnız AÇIKÇA true ise açık', () => {
        expect(yatisAyarlariniNormalizeEt({ aktif: 'evet' }).aktif).toBe(false);
    });
});
