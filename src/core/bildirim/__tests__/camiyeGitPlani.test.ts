/**
 * "Camide kılacağım" planı (issue #292) — saf üretici nöbetçileri.
 * Gerçek adhan kullanılır (İstanbul); saat `simdi` ile enjekte edilir.
 */
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import {
    CAMIYE_GIT_ID_ONEKI,
    CAMIYE_GIT_PLAN_GUN_SAYISI,
    camiyeGitMetniOlustur,
    camiyeGitPlaniOlustur,
    type CamiyeGitPlanAyarlari,
} from '../camiyeGitPlani';

const ISTANBUL = { lat: 41.0082, lng: 28.9784 };
/** 13 Ekim 2026 Salı 09:00 (yerel) — 16 Ekim cuma. */
const SALI_SABAH = new Date(2026, 9, 13, 9, 0, 0);

const AYAR: CamiyeGitPlanAyarlari = {
    aktif: true,
    vakitler: { imsak: true, ogle: true, ikindi: true, aksam: true, yatsi: true },
    yurumeDk: 12,
    hazirlikDk: 5,
};

const vakitler = (gun: Date) =>
    new PrayerTimes(new Coordinates(ISTANBUL.lat, ISTANBUL.lng), gun, CalculationMethod.Turkey());

describe('camiyeGitPlaniOlustur', () => {
    it('kapalıyken ya da hiç vakit seçili değilken boş', () => {
        expect(camiyeGitPlaniOlustur(ISTANBUL, { ...AYAR, aktif: false }, SALI_SABAH, { gunSayisi: 7 })).toEqual([]);
        const hicbiri = { imsak: false, ogle: false, ikindi: false, aksam: false, yatsi: false };
        expect(camiyeGitPlaniOlustur(ISTANBUL, { ...AYAR, vakitler: hicbiri }, SALI_SABAH, { gunSayisi: 7 })).toEqual([]);
    });

    it('hatırlatma vakit GİRİŞİNDEN (ezandan) yürüme + hazırlık kadar önce kurulur', () => {
        const plan = camiyeGitPlaniOlustur(ISTANBUL, AYAR, SALI_SABAH, { gunSayisi: 1 });
        const ogle = plan.find((k) => k.vakit === 'ogle');
        expect(ogle).toBeDefined();
        expect(ogle!.oncedenDk).toBe(17);
        expect(ogle!.zaman.getTime()).toBe(vakitler(SALI_SABAH).dhuhr.getTime() - 17 * 60_000);
        expect(ogle!.id).toBe(`${CAMIYE_GIT_ID_ONEKI}2026-10-13_ogle`);
    });

    it('GEÇMİŞ hatırlatma kurulmaz (09:00 → bugünün sabahı yok)', () => {
        const plan = camiyeGitPlaniOlustur(ISTANBUL, AYAR, SALI_SABAH, { gunSayisi: 1 });
        expect(plan.map((k) => k.vakit)).toEqual(['ogle', 'ikindi', 'aksam', 'yatsi']);
    });

    it('yalnız seçili vakitler; GÜN BAZINDA hesap (her gün kendi vakti)', () => {
        const ayar = { ...AYAR, vakitler: { imsak: false, ogle: false, ikindi: false, aksam: true, yatsi: false } };
        const plan = camiyeGitPlaniOlustur(ISTANBUL, ayar, SALI_SABAH, { gunSayisi: 3 });
        expect(plan).toHaveLength(3);
        for (const k of plan) {
            const [y, a, g] = k.tarih.split('-').map(Number);
            expect(k.zaman.getTime()).toBe(vakitler(new Date(y, a - 1, g)).maghrib.getTime() - 17 * 60_000);
        }
    });

    it('ufuk platforma göre: Android 7, iOS 3 gün', () => {
        expect(CAMIYE_GIT_PLAN_GUN_SAYISI).toEqual({ android: 7, ios: 3 });
        const ios = camiyeGitPlaniOlustur(ISTANBUL, AYAR, SALI_SABAH, { gunSayisi: CAMIYE_GIT_PLAN_GUN_SAYISI.ios });
        expect(new Set(ios.map((k) => k.tarih))).toEqual(new Set(['2026-10-13', '2026-10-14', '2026-10-15']));
        expect(ios).toHaveLength(4 + 5 + 5);
    });

    it('ÇAKIŞMA: cuma hatırlatması AÇIKKEN cuma günü öğle atlanır, diğer vakitler kalır', () => {
        const acik = camiyeGitPlaniOlustur(ISTANBUL, AYAR, SALI_SABAH, { gunSayisi: 7, cumaHatirlatmasiAcik: true });
        const cumaGunu = acik.filter((k) => k.tarih === '2026-10-16').map((k) => k.vakit);
        expect(cumaGunu).toEqual(['imsak', 'ikindi', 'aksam', 'yatsi']);
        // Diğer günlerin öğlesi DURUR.
        expect(acik.some((k) => k.tarih === '2026-10-15' && k.vakit === 'ogle')).toBe(true);

        const kapali = camiyeGitPlaniOlustur(ISTANBUL, AYAR, SALI_SABAH, { gunSayisi: 7, cumaHatirlatmasiAcik: false });
        expect(kapali.some((k) => k.tarih === '2026-10-16' && k.vakit === 'ogle')).toBe(true);
    });

    it('özel gün kapısı VAKTİN GÜNÜNE uygulanır; ufuk kaymaz', () => {
        const plan = camiyeGitPlaniOlustur(ISTANBUL, AYAR, SALI_SABAH, {
            gunSayisi: 3,
            gunAtlanirMi: (iso) => iso === '2026-10-14',
        });
        expect(plan.some((k) => k.tarih === '2026-10-14')).toBe(false);
        expect(new Set(plan.map((k) => k.tarih))).toEqual(new Set(['2026-10-13', '2026-10-15']));
    });

    it('kronolojik ve kimlikler tekil', () => {
        const plan = camiyeGitPlaniOlustur(ISTANBUL, AYAR, SALI_SABAH, { gunSayisi: 7 });
        const zamanlar = plan.map((k) => k.zaman.getTime());
        expect([...zamanlar].sort((a, b) => a - b)).toEqual(zamanlar);
        expect(new Set(plan.map((k) => k.id)).size).toBe(plan.length);
    });

    it('uzun ofsette sabah hatırlatması gece yarısına yakın düşse de VAKTİN GÜNÜNE aittir', () => {
        const ayar = { ...AYAR, yurumeDk: 90, hazirlikDk: 60 };
        const geceYarisi = new Date(2026, 5, 21, 0, 30, 0); // yaz: imsak ~03:20 → hatırlatma ~00:50
        const plan = camiyeGitPlaniOlustur(ISTANBUL, ayar, new Date(2026, 5, 20, 12, 0, 0), { gunSayisi: 2 });
        const ertesiSabah = plan.find((k) => k.tarih === '2026-06-21' && k.vakit === 'imsak');
        expect(ertesiSabah).toBeDefined();
        expect(ertesiSabah!.zaman.getTime()).toBeLessThan(vakitler(geceYarisi).fajr.getTime());
    });
});

describe('camiyeGitMetniOlustur — ibadete çağrı kaydı', () => {
    it('hazırlık payı varsa ne zaman yola çıkılacağını söyler', () => {
        expect(camiyeGitMetniOlustur('ogle', { yurumeDk: 12, hazirlikDk: 5 })).toEqual({
            baslik: 'Camiye hazırlan',
            govde: 'Öğle namazına camide yetişmek için hazırlan, 5 dk sonra yola çık — ezana 17 dk.',
        });
    });

    it('hazırlık payı yoksa doğrudan yola çık der', () => {
        expect(camiyeGitMetniOlustur('imsak', { yurumeDk: 12, hazirlikDk: 0 })).toEqual({
            baslik: 'Camiye yola çık',
            govde: 'Sabah namazına camide yetişmek için yola çık — ezana 12 dk.',
        });
    });

    it('İkindi doğru yazılır (toUpperCase/toLowerCase tuzağı yok); "secde" ve terk suçlaması YOK', () => {
        const { govde } = camiyeGitMetniOlustur('ikindi', { yurumeDk: 8, hazirlikDk: 0 });
        expect(govde.startsWith('İkindi namazına')).toBe(true);
        for (const vakit of ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] as const) {
            const m = camiyeGitMetniOlustur(vakit, { yurumeDk: 8, hazirlikDk: 3 });
            const metin = `${m.baslik} ${m.govde}`.toLocaleLowerCase('tr-TR');
            expect(metin).not.toMatch(/secde|terk|küfr|kaçır/);
        }
    });
});
