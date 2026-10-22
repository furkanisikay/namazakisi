import { evEkraniGosterilsinMi, evEkraniSunulurMu, geriSayimMetni, kaydirmaOfseti, panoDurumuHesapla } from '../evEkrani';
import { gunVakitleriniHesapla } from '../../nafile/gunVakitleri';

const IPAD = { width: 1376, height: 1032 };
const ISTANBUL = { lat: 41.0082, lng: 28.9784 };
const vakit = (iso: string) => gunVakitleriniHesapla(ISTANBUL, iso);

describe('evEkraniGosterilsinMi', () => {
    const temel = { ayarAcik: true, sadeEtkin: false, pencere: IPAD, ekran: IPAD };

    it('ayar + yatay + tam ekran tablette gösterilir', () => {
        expect(evEkraniGosterilsinMi(temel)).toBe(true);
        // Ekran boyutu dikey yönde bildirilse de (bazı platformlar) tam ekran sayılır.
        expect(evEkraniGosterilsinMi({ ...temel, ekran: { width: 1032, height: 1376 } })).toBe(true);
    });

    it('ayar kapalı, sade görünüm, dikey, Split View ve telefonda gösterilmez', () => {
        expect(evEkraniGosterilsinMi({ ...temel, ayarAcik: false })).toBe(false);
        expect(evEkraniGosterilsinMi({ ...temel, sadeEtkin: true })).toBe(false);
        expect(evEkraniGosterilsinMi({ ...temel, pencere: { width: 1032, height: 1376 } })).toBe(false);
        expect(evEkraniGosterilsinMi({ ...temel, pencere: { width: 678, height: 1032 } })).toBe(false); // Split View
        expect(evEkraniGosterilsinMi({ ...temel, pencere: { width: 980, height: 1032 } })).toBe(false);
        const telefon = { width: 932, height: 430 };
        expect(evEkraniGosterilsinMi({ ...temel, pencere: telefon, ekran: telefon })).toBe(false);
        expect(evEkraniSunulurMu(telefon)).toBe(false);
        expect(evEkraniSunulurMu(IPAD)).toBe(true);
    });
});

describe('panoDurumuHesapla', () => {
    const gun = '2026-10-21';
    const v = vakit(gun);

    it('öğleden sonra: aktif öğle, sıradaki ikindi', () => {
        const d = panoDurumuHesapla(v.ogle.getTime() + 60_000, gun, vakit);
        expect(d).toMatchObject({ tarih: gun, aktif: 'ogle', siradaki: 'ikindi' });
        expect(d.kalanMs).toBe(v.ikindi.getTime() - v.ogle.getTime() - 60_000);
    });

    it('imsaktan önce: gösterilen gün DÜN, aktif yatsı, sıradaki bugünün imsakı', () => {
        const d = panoDurumuHesapla(v.imsak.getTime() - 3_600_000, gun, vakit);
        expect(d).toMatchObject({ tarih: '2026-10-20', aktif: 'yatsi', siradaki: 'imsak', siradakiMs: v.imsak.getTime() });
    });

    it('yatsıdan sonra: sıradaki YARININ imsakı', () => {
        const d = panoDurumuHesapla(v.yatsi.getTime() + 60_000, gun, vakit);
        expect(d.siradaki).toBe('imsak');
        expect(d.siradakiMs).toBe(vakit('2026-10-22').imsak.getTime());
    });
});

describe('yardımcılar', () => {
    it('geri sayım ve kaydırma', () => {
        expect(geriSayimMetni(59_999)).toBe('0:00:59');
        expect(geriSayimMetni(2 * 3_600_000 + 5 * 60_000 + 9_000)).toBe('2:05:09');
        expect(kaydirmaOfseti(0)).toEqual([0, 0]);
        expect(kaydirmaOfseti(60_000)).toEqual([6, 0]);
    });
});
