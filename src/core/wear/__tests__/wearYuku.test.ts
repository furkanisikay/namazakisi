/**
 * Telefon → saat yük sözleşmesi (issue #269). Kotlin `YukCozucuTest` AYNI örnek
 * dosyayı (`wear/app/src/test/resources/ornek-yuk.json`) okur: iki taraf da bu
 * dosyayı kabul etmek zorundadır → şema tek taraflı değiştirilemez.
 */
import * as fs from 'fs';
import * as path from 'path';
import {
    WEAR_GUN_SAYISI,
    WEAR_KERAHAT_DK,
    WEAR_YUK_BAYT_SINIRI,
    WEAR_YUK_SURUMU,
    canliGecerliMi,
    wearKonumuCoz,
    wearKonumuOlustur,
    wearYukuGecerliMi,
    wearYukuOlustur,
} from '../wearYuku';
import { utf8BaytUzunlugu, vakitPencereleriniOlustur } from '../wearMuhafizPlani';
import { muhafizMatrisiniCoz } from '../../muhafiz/motorAdaptoru';
import type { MuhafizMatrisi } from '../../muhafiz/matrisTipleri';
import { KAZA_SABITLERI } from '../../constants/UygulamaSabitleri';
import { gunEkle } from '../../utils/TarihYardimcisi';

const ORNEK = path.join(__dirname, '../../../../wear/app/src/test/resources/ornek-yuk.json');
const ORNEK_V1 = path.join(__dirname, '../../../../wear/app/src/test/resources/ornek-yuk-v1.json');
const ISTANBUL = { lat: 41.0082, lng: 28.9784 };
const BUGUN = '2026-10-12';
const IMSAK_ONCESI =
    vakitPencereleriniOlustur(ISTANBUL, BUGUN, 2).find((p) => p.tarih === BUGUN && p.vakit === 'imsak')!.giris.getTime() -
    60_000;
const matris = (): MuhafizMatrisi =>
    muhafizMatrisiniCoz({
        esikler: { seviye1: 45, seviye2: 25, seviye3: 10, seviye4: 3 },
        sikliklar: { seviye1: 15, seviye2: 10, seviye3: 5, seviye4: 1 },
    });

/** En yoğun elle kurulabilecek matris: her adım dakikada bir → plan bütçesi devrede. */
const yogunMatris = (): MuhafizMatrisi => {
    const m = matris();
    for (const v of Object.keys(m) as (keyof MuhafizMatrisi)[]) {
        m[v] = {
            ...m[v],
            seviyeler: m[v].seviyeler.map((s, i) => ({
                ...s,
                esikDk: [80, 60, 40, 20][i],
                siklik: { herDk: 1 },
                kanallar: { bildirim: true, titresim: true },
            })),
        };
    }
    return m;
};

describe('wearYukuOlustur', () => {
    const yuk = wearYukuOlustur({
        koordinat: ISTANBUL,
        bugunIso: BUGUN,
        konumAdi: 'Fatih, İstanbul',
        kilinanlar: {
            [gunEkle(BUGUN, -1)]: ['imsak', 'gunes', 'yatsi', 'ogle'],
            [BUGUN]: ['imsak'],
            [gunEkle(BUGUN, 1)]: ['ogle'],
        },
    });

    it('sözleşmeye uyar ve dün + 30 gün içerir; muhafız girdisi yoksa plan boş', () => {
        expect(WEAR_GUN_SAYISI).toBe(31);
        expect(yuk.muhafiz).toEqual([]);
        expect(wearYukuGecerliMi(yuk)).toBe(true);
        expect(yuk.surum).toBe(WEAR_YUK_SURUMU);
        expect(yuk.gunler).toHaveLength(WEAR_GUN_SAYISI);
        expect(yuk.gunler[0].tarih).toBe(gunEkle(BUGUN, -1));
        expect(yuk.gunler[1].tarih).toBe(BUGUN);
    });

    it('kılınan yalnız dün ve bugün; güneş asla yok; sıra sabit', () => {
        expect(yuk.gunler[0].kilinan).toEqual(['imsak', 'ogle', 'yatsi']);
        expect(yuk.gunler[1].kilinan).toEqual(['imsak']);
        expect(yuk.gunler[2].kilinan).toEqual([]);
    });

    it('vakitler her gün kronolojik', () => {
        for (const g of yuk.gunler) {
            const v = g.vakitler;
            expect([v.imsak, v.gunes, v.ogle, v.ikindi, v.aksam, v.yatsi]).toEqual(
                [...[v.imsak, v.gunes, v.ogle, v.ikindi, v.aksam, v.yatsi]].sort((a, b) => a - b)
            );
        }
    });

    it('NÖBETÇİ: kerahat sabitleri kaza hesabıyla aynı kaynaktan', () => {
        expect(WEAR_KERAHAT_DK.suruk).toBe(KAZA_SABITLERI.MEKRUH_TOLERANS_DK);
        expect(WEAR_KERAHAT_DK.gurub).toBe(KAZA_SABITLERI.MEKRUH_TOLERANS_DK);
        expect(yuk.kerahatDk).toEqual(WEAR_KERAHAT_DK);
    });
});

describe('kıble konumu (saat W2) — EKLEMELİ OPSİYONEL, gevşek doğrulama', () => {
    const taban = { koordinat: ISTANBUL, bugunIso: BUGUN, konumAdi: 'x', kilinanlar: {} };

    it('1 ondalığa yuvarlanır (≈ 11 km); istenmezse (Apple Watch) hiç yazılmaz', () => {
        expect(wearYukuOlustur({ ...taban, kibleKonumu: true }).konum).toEqual({ lat: 41, lng: 29 });
        expect('konum' in wearYukuOlustur(taban)).toBe(false);
        expect(wearKonumuOlustur({ lat: 39.9055, lng: 41.2658 })).toEqual({ lat: 39.9, lng: 41.3 });
        expect(wearKonumuOlustur({ lat: -33.8688, lng: 151.2093 })).toEqual({ lat: -33.9, lng: 151.2 });
    });

    it('`{0,0}` nöbetçisi ve sonlu olmayan değer → alan yazılmaz', () => {
        expect(wearKonumuOlustur({ lat: 0, lng: 0 })).toBeUndefined();
        expect(wearKonumuOlustur({ lat: Number.NaN, lng: 29 })).toBeUndefined();
        expect('konum' in wearYukuOlustur({ ...taban, koordinat: { lat: 0, lng: 0 }, kibleKonumu: true })).toBe(false);
    });

    it('aynı girdi aynı yük (gürültü her gönderimi "yeni" yapmaz)', () => {
        const a = wearYukuOlustur({ ...taban, koordinat: { lat: 41.00821, lng: 28.97841 }, kibleKonumu: true });
        const b = wearYukuOlustur({ ...taban, koordinat: { lat: 41.00829, lng: 28.97849 }, kibleKonumu: true });
        expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    });

    it('bozuk konum YÜKÜ düşürmez; yalnız konum çözülemez (Kotlin YukCozucu ile aynı)', () => {
        const ornek = JSON.parse(fs.readFileSync(ORNEK, 'utf8'));
        expect(wearKonumuCoz(ornek.konum)).toEqual({ lat: 41, lng: 29 });
        for (const bozuk of [{ lat: '41', lng: 29 }, { lat: 91, lng: 29 }, { lat: 41, lng: 181 }, { lat: 0, lng: 0 }, { lat: 41 }, 'x', null]) {
            const y = { ...ornek, konum: bozuk };
            expect(wearYukuGecerliMi(y)).toBe(true);
            expect(wearKonumuCoz(y.konum)).toBeNull();
        }
        const konumsuz = { ...ornek };
        delete konumsuz.konum;
        expect(wearYukuGecerliMi(konumsuz)).toBe(true);
        expect(wearKonumuCoz(undefined)).toBeNull();
    });
});

describe('ORTAK ÖRNEK DOSYA (Kotlin YukCozucuTest ile aynı)', () => {
    const ornek = JSON.parse(fs.readFileSync(ORNEK, 'utf8'));

    it('JS doğrulayıcısı örneği kabul eder ve üretilen yük AYNI anahtar kümesini taşır', () => {
        expect(wearYukuGecerliMi(ornek)).toBe(true);
        const uretilen = wearYukuOlustur({
            koordinat: ISTANBUL,
            bugunIso: BUGUN,
            konumAdi: 'x',
            kilinanlar: {},
            canli: ornek.canli,
            kibleKonumu: true,
            uyandirma: ornek.uyandirma,
            anonsYeri: ornek.anonsYeri,
        });
        expect(Object.keys(uretilen).sort()).toEqual(Object.keys(ornek).sort());
        // `canli` EKLEMELİ OPSİYONEL alandır: verilmezse yükte hiç yer almaz (eski saat birebir).
        expect('canli' in wearYukuOlustur({ koordinat: ISTANBUL, bugunIso: BUGUN, konumAdi: 'x', kilinanlar: {} })).toBe(false);
        expect(Object.keys(uretilen.gunler[0]).sort()).toEqual(Object.keys(ornek.gunler[0]).sort());
        expect(Object.keys(uretilen.gunler[0].vakitler).sort()).toEqual(Object.keys(ornek.gunler[0].vakitler).sort());
        expect(ornek.surum).toBe(WEAR_YUK_SURUMU);
    });

    it('plan kaydı anahtar kümesi örnekle AYNI (Kotlin PlanKaydi ayrıştırıcısı)', () => {
        const uretilen = wearYukuOlustur({
            koordinat: ISTANBUL,
            bugunIso: BUGUN,
            konumAdi: 'x',
            kilinanlar: {},
            muhafiz: { aktif: true, matris: matris(), simdiMs: IMSAK_ONCESI, kilinanlar: {} },
        });
        expect(uretilen.muhafiz.length).toBeGreaterThan(0);
        expect(Object.keys(uretilen.muhafiz[0]).sort()).toEqual(Object.keys(ornek.muhafiz[0]).sort());
        expect(wearYukuGecerliMi(uretilen)).toBe(true);
    });

    it('adım sırası (issue #274) EKLEMELİ opsiyonel alan: yoksa yük yine geçerli', () => {
        const kopya = JSON.parse(JSON.stringify(ornek));
        for (const k of kopya.muhafiz) delete k.adim;
        expect(wearYukuGecerliMi(kopya)).toBe(true);
        // Sürüm artırılmadı: eski saat (DESTEKLENEN=2) yükü reddetmesin.
        expect(WEAR_YUK_SURUMU).toBe(2);
    });

    it('v1 örneği (plan alanı yok) hâlâ geçerli sayılır — eski telefon / yeni saat', () => {
        const v1 = JSON.parse(fs.readFileSync(ORNEK_V1, 'utf8'));
        expect(v1.surum).toBe(1);
        expect(wearYukuGecerliMi(v1)).toBe(true);
    });

    type GevsekYuk = {
        kerahatDk?: unknown;
        muhafiz?: Record<string, unknown>[];
        gunler: { kilinan: string[]; vakitler: Record<string, number | undefined> }[];
    };
    it.each<[string, (o: GevsekYuk) => void]>([
        ['güneş kılınmış', (o) => { o.gunler[0].kilinan.push('gunes'); }],
        ['eksik vakit', (o) => { delete o.gunler[0].vakitler.yatsi; }],
        ['NamazAdi değeri', (o) => { o.gunler[0].kilinan.push('Öğle'); }],
        ['kerahat yok', (o) => { delete o.kerahatDk; }],
        ['v2 plan alanı yok', (o) => { delete o.muhafiz; }],
        ['plan kaydında güneş', (o) => { o.muhafiz![0].vakit = 'gunes'; }],
        ['plan kaydında bilinmeyen seviye', (o) => { o.muhafiz![0].seviye = 5; }],
        ['plan kaydında titreşim eksik', (o) => { delete o.muhafiz![0].titresim; }],
        ['plan kaydında adım sırası aralık dışı', (o) => { o.muhafiz![0].adim = 6; }],
        ['plan kaydında adım sırası tam sayı değil', (o) => { o.muhafiz![0].adim = 1.5; }],
    ])('bozuk yük reddedilir: %s', (_ad, boz) => {
        const kopya = JSON.parse(JSON.stringify(ornek));
        boz(kopya);
        expect(wearYukuGecerliMi(kopya)).toBe(false);
    });
});

describe('muhafız planı + BOYUT SINIRI (DataItem ≤100 KB)', () => {
    const girdi = (m: MuhafizMatrisi, baytSiniri?: number) => ({
        koordinat: ISTANBUL,
        bugunIso: BUGUN,
        konumAdi: 'Fatih, İstanbul',
        kilinanlar: {},
        muhafiz: { aktif: true, matris: m, simdiMs: IMSAK_ONCESI, kilinanlar: {} },
        baytSiniri,
    });

    it('plan kronolojik ve AYNI girdi AYNI JSON üretir (gereksiz Data Layer yazımı yok)', () => {
        const a = JSON.stringify(wearYukuOlustur(girdi(matris())));
        const b = JSON.stringify(wearYukuOlustur(girdi(matris())));
        expect(a).toBe(b);
        const plan = JSON.parse(a).muhafiz as { ms: number }[];
        expect(plan.map((k) => k.ms)).toEqual([...plan.map((k) => k.ms)].sort((x, y) => x - y));
    });

    it('en yoğun matris bile varsayılan sınırın altında kalır', () => {
        const yuk = wearYukuOlustur(girdi(yogunMatris()));
        expect(utf8BaytUzunlugu(JSON.stringify(yuk))).toBeLessThanOrEqual(WEAR_YUK_BAYT_SINIRI);
        expect(yuk.muhafiz.length).toBeGreaterThan(100);
    });

    it('sınır aşılırsa ufuk SONDAN ve vakit bütünlüğüyle kısalır; yakın uyarı korunur', () => {
        const tam = wearYukuOlustur(girdi(yogunMatris()));
        const tamBayt = utf8BaytUzunlugu(JSON.stringify(tam));
        const kisa = wearYukuOlustur(girdi(yogunMatris(), Math.floor(tamBayt * 0.6)));
        expect(utf8BaytUzunlugu(JSON.stringify(kisa))).toBeLessThanOrEqual(Math.floor(tamBayt * 0.6));
        expect(kisa.muhafiz.length).toBeLessThan(tam.muhafiz.length);
        expect(kisa.muhafiz.length).toBeGreaterThan(0);
        // Önek: kısalan plan tam planın BAŞIDIR.
        expect(kisa.muhafiz).toEqual(tam.muhafiz.slice(0, kisa.muhafiz.length));
        // Vakit bütünlüğü: son vaktin tüm kayıtları ya var ya yok.
        const son = kisa.muhafiz[kisa.muhafiz.length - 1];
        const anahtar = (k: { tarih: string; vakit: string }) => `${k.tarih}_${k.vakit}`;
        expect(kisa.muhafiz.filter((k) => anahtar(k) === anahtar(son)).length).toBe(
            tam.muhafiz.filter((k) => anahtar(k) === anahtar(son)).length
        );
    });

    it('hiçbir vakit sığmazsa plan boş gider, vakitler yine gider', () => {
        const yuk = wearYukuOlustur(girdi(matris(), 100));
        expect(yuk.muhafiz).toEqual([]);
        expect(yuk.gunler).toHaveLength(WEAR_GUN_SAYISI);
    });
});

describe('canli (Now Bar seçimi, issue #282) — eklemeli opsiyonel alan', () => {
    const ornek = JSON.parse(fs.readFileSync(ORNEK, 'utf8'));
    test('örnekteki pay geçerli; bozuk pay TÜM yükü reddeder (Kotlin ile aynı katılık)', () => {
        expect(canliGecerliMi(ornek.canli)).toBe(true);
        expect(canliGecerliMi(undefined)).toBe(true);
        expect(wearYukuGecerliMi({ ...ornek, canli: { ...ornek.canli, vakitler: { imsak: true } } })).toBe(false);
        const bozukPencere = { ...ornek.canli.pencereler[0], bitis: ornek.canli.pencereler[0].bas };
        expect(canliGecerliMi({ ...ornek.canli, pencereler: [bozukPencere] })).toBe(false);
        expect(canliGecerliMi({ ...ornek.canli, pencereler: [{ ...ornek.canli.pencereler[1], vakit: 'gunes' }] })).toBe(false);
    });

    test("sürüm ARTIRILMADI (eski saat SurumYeni'ye düşmesin)", () => {
        expect(WEAR_YUK_SURUMU).toBe(2);
    });
});

describe('saat W3 alanları (uyandirma, anonsYeri, kayıt anons) — eklemeli opsiyonel', () => {
    const ornek = JSON.parse(fs.readFileSync(ORNEK, 'utf8'));

    test('örnek geçerli; alanlar yoksa (eski telefon) de geçerli', () => {
        expect(wearYukuGecerliMi(ornek)).toBe(true);
        const eski = JSON.parse(JSON.stringify(ornek));
        delete eski.uyandirma;
        delete eski.anonsYeri;
        delete eski.muhafiz[1].anons;
        expect(wearYukuGecerliMi(eski)).toBe(true);
    });

    test('bozuk değer TÜM yükü reddeder (Kotlin YukCozucuTest ile aynı liste)', () => {
        type Kayit = Record<string, unknown>;
        type Ornek = { anonsYeri?: string; muhafiz: Kayit[]; uyandirma: Kayit[] | string };
        const u = (o: Ornek) => o.uyandirma as Kayit[];
        const bozuklar: ((o: Ornek) => void)[] = [
            (o) => (o.anonsYeri = 'ikisi'),
            (o) => (o.muhafiz[0].anons = 5),
            (o) => (u(o)[0].tur = 'kusluk'),
            (o) => (u(o)[0].sonMs = 1),
            (o) => (u(o)[1].tarih = '13.10.2026'),
            (o) => (o.uyandirma = 'x'),
        ];
        for (const boz of bozuklar) {
            const o = JSON.parse(JSON.stringify(ornek));
            boz(o);
            expect(wearYukuGecerliMi(o)).toBe(false);
        }
    });

    test('alan verilmezse yükte HİÇ yer almaz (eski saat birebir)', () => {
        const y = wearYukuOlustur({ koordinat: ISTANBUL, bugunIso: BUGUN, konumAdi: 'x', kilinanlar: {} });
        expect('uyandirma' in y).toBe(false);
        expect('anonsYeri' in y).toBe(false);
    });
});
