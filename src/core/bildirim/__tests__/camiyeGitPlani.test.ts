/**
 * "Camide kılacağım" planı (issue #292) — saf üretici nöbetçileri.
 * Gerçek adhan kullanılır (İstanbul); saat `simdi` ile enjekte edilir.
 */
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import {
    CAMIYE_GIT_ID_ONEKI,
    CAMIYE_GIT_PLAN_GUN_SAYISI,
    camiyeGitAnonsMetni,
    camiyeGitMetniOlustur,
    camiyeGitPlaniOlustur,
    type CamiyeGitPlanAyarlari,
} from '../camiyeGitPlani';
import { camiyeGitAyarlariniNormalize, CAMIYE_GIT_VAKITLERI, type CamiyeGitVakti } from '../../camiyeGit/camiyeGitAyarlari';
import { ekAdim } from '../../hatirlatma/adimDizisi';
import { cumaMi } from '../../utils/cumaYardimcisi';
import { tarihiISOFormatinaCevir } from '../../utils/TarihYardimcisi';

const ISTANBUL = { lat: 41.0082, lng: 28.9784 };
/** 13 Ekim 2026 Salı 09:00 (yerel) — 16 Ekim cuma. */
const SALI_SABAH = new Date(2026, 9, 13, 9, 0, 0);

const AYAR: CamiyeGitPlanAyarlari = {
    aktif: true,
    vakitler: { imsak: true, ogle: true, ikindi: true, aksam: true, yatsi: true },
    yurumeDk: 12,
    hazirlikDk: 5,
    adimlar: [ekAdim(17)],
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
        const ayar = { ...AYAR, yurumeDk: 90, hazirlikDk: 60, adimlar: [ekAdim(150)] };
        const geceYarisi = new Date(2026, 5, 21, 0, 30, 0); // yaz: imsak ~03:20 → hatırlatma ~00:50
        const plan = camiyeGitPlaniOlustur(ISTANBUL, ayar, new Date(2026, 5, 20, 12, 0, 0), { gunSayisi: 2 });
        const ertesiSabah = plan.find((k) => k.tarih === '2026-06-21' && k.vakit === 'imsak');
        expect(ertesiSabah).toBeDefined();
        expect(ertesiSabah!.zaman.getTime()).toBeLessThan(vakitler(geceYarisi).fajr.getTime());
    });
});

describe('camiyeGitMetniOlustur — ibadete çağrı kaydı', () => {
    it('hazırlık payı varsa ne zaman yola çıkılacağını söyler', () => {
        expect(camiyeGitMetniOlustur('ogle', 17, { yurumeDk: 12, hazirlikDk: 5 })).toEqual({
            baslik: 'Öğle · ezana 17 dk · camiye hazırlan',
            govde: 'Öğle namazına camide yetişmek için hazırlan, 5 dk sonra yola çık — ezana 17 dk.',
        });
    });

    it('hazırlık payı yoksa doğrudan yola çık der', () => {
        expect(camiyeGitMetniOlustur('imsak', 12, { yurumeDk: 12, hazirlikDk: 0 })).toEqual({
            baslik: 'Sabah · ezana 12 dk · camiye yola çık',
            govde: 'Sabah namazına camide yetişmek için yola çık — ezana 12 dk.',
        });
    });

    it('İkindi doğru yazılır (toUpperCase/toLowerCase tuzağı yok); "secde" ve terk suçlaması YOK', () => {
        const { govde } = camiyeGitMetniOlustur('ikindi', 8, { yurumeDk: 8, hazirlikDk: 0 });
        expect(govde.startsWith('İkindi namazına')).toBe(true);
        for (const vakit of ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] as const) {
            const m = camiyeGitMetniOlustur(vakit, 11, { yurumeDk: 8, hazirlikDk: 3 });
            const metin = `${m.baslik} ${m.govde}`.toLocaleLowerCase('tr-TR');
            expect(metin).not.toMatch(/secde|terk|küfr|kaçır/);
        }
    });

    it('önden okunur (issue #287): ilk 16 karakterde vakit adı ve dakika', () => {
        expect(camiyeGitMetniOlustur('ikindi', 8, { yurumeDk: 8, hazirlikDk: 0 }).baslik.slice(0, 16)).toBe(
            'İkindi · ezana 8'
        );
        const { baslik } = camiyeGitMetniOlustur('aksam', 45, { yurumeDk: 30, hazirlikDk: 15 });
        expect(baslik.slice(0, 16)).toBe('Akşam · ezana 45');
    });
});

/** DONDURULMUŞ eski üretici (refactor öncesi, tek ofset). */
function eskiCamiyeGitPlani(
    koordinat: { lat: number; lng: number },
    ayarlar: { aktif: boolean; vakitler: Record<CamiyeGitVakti, boolean>; yurumeDk: number; hazirlikDk: number },
    simdi: Date,
    secenekler: { gunSayisi: number; cumaHatirlatmasiAcik?: boolean }
) {
    if (!ayarlar.aktif) return [];
    const coordinates = new Coordinates(koordinat.lat, koordinat.lng);
    const oncedenDk = Math.max(1, ayarlar.yurumeDk + ayarlar.hazirlikDk);
    const plan: { id: string; vakit: CamiyeGitVakti; tarih: string; zaman: Date; oncedenDk: number; baslik: string; govde: string }[] = [];
    for (let i = 0; i < secenekler.gunSayisi; i++) {
        const gun = new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate() + i);
        const tarih = tarihiISOFormatinaCevir(gun);
        const pt = new PrayerTimes(coordinates, gun, CalculationMethod.Turkey());
        const v: Record<CamiyeGitVakti, Date> = { imsak: pt.fajr, ogle: pt.dhuhr, ikindi: pt.asr, aksam: pt.maghrib, yatsi: pt.isha };
        for (const vakit of CAMIYE_GIT_VAKITLERI) {
            if (!ayarlar.vakitler[vakit]) continue;
            if (vakit === 'ogle' && secenekler.cumaHatirlatmasiAcik && cumaMi(gun)) continue;
            const zaman = new Date(v[vakit].getTime() - oncedenDk * 60_000);
            if (zaman.getTime() <= simdi.getTime()) continue;
            const ad = { imsak: 'Sabah', ogle: 'Öğle', ikindi: 'İkindi', aksam: 'Akşam', yatsi: 'Yatsı' }[vakit];
            const metin =
                ayarlar.hazirlikDk > 0
                    ? {
                          baslik: `${ad} · ezana ${oncedenDk} dk · camiye hazırlan`,
                          govde: `${ad} namazına camide yetişmek için hazırlan, ${ayarlar.hazirlikDk} dk sonra yola çık — ezana ${oncedenDk} dk.`,
                      }
                    : {
                          baslik: `${ad} · ezana ${oncedenDk} dk · camiye yola çık`,
                          govde: `${ad} namazına camide yetişmek için yola çık — ezana ${oncedenDk} dk.`,
                      };
            plan.push({ id: `${CAMIYE_GIT_ID_ONEKI}${tarih}_${vakit}`, vakit, tarih, zaman, oncedenDk, ...metin });
        }
    }
    return plan.sort((a, b) => a.zaman.getTime() - b.zaman.getTime());
}

describe('camiyeGitPlaniOlustur — GÖÇ: eski kayıt BİREBİR aynı plan', () => {
    const KAYITLAR = [
        { aktif: true, vakitler: AYAR.vakitler, yurumeDk: 12, hazirlikDk: 5 },
        { aktif: true, vakitler: AYAR.vakitler, yurumeDk: 25, hazirlikDk: 0 },
        { aktif: true, vakitler: { imsak: false, ogle: true, ikindi: false, aksam: true, yatsi: true }, yurumeDk: 90, hazirlikDk: 60 },
    ];
    it.each(KAYITLAR)('%o', (kayit) => {
        for (const cuma of [false, true]) {
            for (const simdi of [SALI_SABAH, new Date(2026, 5, 20, 23, 30), new Date(2026, 11, 31, 4, 0)]) {
                const eski = eskiCamiyeGitPlani(ISTANBUL, kayit, simdi, { gunSayisi: 7, cumaHatirlatmasiAcik: cuma });
                const yeni = camiyeGitPlaniOlustur(ISTANBUL, camiyeGitAyarlariniNormalize(kayit), simdi, {
                    gunSayisi: 7,
                    cumaHatirlatmasiAcik: cuma,
                }).map(({ id, vakit, tarih, zaman, oncedenDk, baslik, govde }) => ({ id, vakit, tarih, zaman, oncedenDk, baslik, govde }));
                expect(yeni).toEqual(eski);
            }
        }
    });
});

describe('camiyeGitPlaniOlustur — adım dizisi', () => {
    const cokAdim = { ...AYAR, adimlar: [ekAdim(40, { herDk: 10 }), ekAdim(17)] };

    it('ilk tetik TARİHSEL kimliği korur, diğerleri `_<kalanDk>` eki alır; kimlikler tekil', () => {
        const plan = camiyeGitPlaniOlustur(ISTANBUL, cokAdim, SALI_SABAH, { gunSayisi: 1 });
        const ogle = plan.filter((k) => k.vakit === 'ogle');
        expect(ogle.map((k) => k.oncedenDk)).toEqual([40, 30, 20, 17]);
        expect(ogle.map((k) => k.id)).toEqual([
            'camiye_git_2026-10-13_ogle',
            'camiye_git_2026-10-13_ogle_30',
            'camiye_git_2026-10-13_ogle_20',
            'camiye_git_2026-10-13_ogle_17',
        ]);
        expect(new Set(plan.map((k) => k.id)).size).toBe(plan.length);
    });

    it('her kayıt pencere sonunu (vaktin girişi) ve çözülmüş anons metnini taşır', () => {
        const [k] = camiyeGitPlaniOlustur(ISTANBUL, cokAdim, SALI_SABAH, { gunSayisi: 1 });
        expect(k.giris.getTime()).toBe(vakitler(SALI_SABAH).dhuhr.getTime());
        expect(k.uyari.anonsMetni).toBe(camiyeGitAnonsMetni('ogle', 40, AYAR));
        expect(k.uyari.anonsMetni).not.toMatch(/\{/);
    });

    it('Android alarm payı KRONOLOJİK keser', () => {
        const tam = camiyeGitPlaniOlustur(ISTANBUL, cokAdim, SALI_SABAH, { gunSayisi: 7 });
        const kesik = camiyeGitPlaniOlustur(ISTANBUL, cokAdim, SALI_SABAH, { gunSayisi: 7, alarmButcesi: 10 });
        expect(kesik).toEqual(tam.slice(0, 10));
    });

    it('tekrar tetiklerinde metin kalan süreye göre: yürüme süresinden azsa doğrudan yola çık', () => {
        expect(camiyeGitMetniOlustur('ogle', 10, { yurumeDk: 12, hazirlikDk: 5 }).baslik).toBe('Öğle · ezana 10 dk · camiye yola çık');
        expect(camiyeGitMetniOlustur('ogle', 40, { yurumeDk: 12, hazirlikDk: 5 }).govde).toBe(
            'Öğle namazına camide yetişmek için hazırlan, 28 dk sonra yola çık — ezana 40 dk.'
        );
    });
});

describe('camiyeGitAnonsMetni — ibadete çağrı (sen), nass YOK', () => {
    it('kalan süre okunur; fıkıh nöbetçisi', () => {
        expect(camiyeGitAnonsMetni('aksam', 15, { yurumeDk: 15, hazirlikDk: 0 })).toBe('Akşam vaktine 15 dakika kaldı. Camiye yola çık.');
        expect(camiyeGitAnonsMetni('ikindi', 60, { yurumeDk: 10, hazirlikDk: 5 })).toBe(
            'İkindi vaktine 1 saat kaldı. Hazırlan, camiye yola çık.'
        );
        for (const vakit of CAMIYE_GIT_VAKITLERI) {
            expect(camiyeGitAnonsMetni(vakit, 20, { yurumeDk: 10, hazirlikDk: 5 }).toLocaleLowerCase('tr-TR')).not.toMatch(
                /secde|terk|küfr|kaçır|\(/
            );
        }
    });
});
