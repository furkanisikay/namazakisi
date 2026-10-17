/**
 * Yatış hatırlatması ayarlarının normalizasyonu (issue #290; ortak model — plan §5.3):
 * bozuk kayıt varsayılana düşer; "önce" ve saat seçilebilir aralığa çekilir; eski tek
 * ofsetli kayıt TEK adıma göçer (şekle bakar, bayrağa değil).
 */
import { yatisAyarlariniNormalizeEt } from '../LocalYatisHatirlatmaServisi';
import { YATIS_VARSAYILAN_AYARLARI } from '../../../core/yatis/yatisPlani';
import { yatisAyarlariniBirlestir } from '../../../core/yatis/yatisAyarlari';
import { ekAdim } from '../../../core/hatirlatma/adimDizisi';

describe('yatisAyarlariniNormalizeEt', () => {
    it.each([null, 42, 'x', [1, 2]])('nesne dışı kayıt (%p) varsayılana düşer', (ham) => {
        expect(yatisAyarlariniNormalizeEt(ham)).toEqual(YATIS_VARSAYILAN_AYARLARI);
    });

    it('geçerli ESKİ kayıt korunur ve TEK adıma göçer (türev onceDk aynı)', () => {
        const a = { aktif: true, saat: 0, dakika: 30, onceDk: 45, yatsiHatirlatmasi: false, muhasebe: true };
        expect(yatisAyarlariniNormalizeEt(a)).toEqual({ ...a, adimlar: [ekAdim(45)] });
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

    it('GÖÇ idempotent; adımlı kayıt kronolojik + tekil, türev onceDk ilk (en uzak) adımdan', () => {
        const bir = yatisAyarlariniNormalizeEt({ aktif: true, onceDk: 30 });
        expect(yatisAyarlariniNormalizeEt(JSON.parse(JSON.stringify(bir)))).toEqual(bir);
        const cok = yatisAyarlariniNormalizeEt({ aktif: true, adimlar: [ekAdim(20), ekAdim(60), ekAdim(20)] });
        expect(cok.adimlar.map((s) => s.esikDk)).toEqual([60, 20]);
        expect(cok.onceDk).toBe(60);
    });

    it('rızalar göçle UYDURULMAZ; yalnız açıkça true iken taşınır', () => {
        expect(yatisAyarlariniNormalizeEt({ aktif: true }).sesliOnayi).toBeUndefined();
        expect(yatisAyarlariniNormalizeEt({ aktif: true, sesliOnayi: true, alarmOnayi: true })).toMatchObject({
            sesliOnayi: true,
            alarmOnayi: true,
        });
    });

    it('birleştirme: eski onceDk değişikliği İLK adıma yazılır', () => {
        const temel = yatisAyarlariniNormalizeEt({ aktif: true, adimlar: [ekAdim(60), ekAdim(20)] });
        const yeni = yatisAyarlariniBirlestir(temel, { onceDk: 90 });
        expect(yeni.adimlar.map((s) => s.esikDk)).toEqual([90, 20]);
        expect(yeni.onceDk).toBe(90);
    });
});
