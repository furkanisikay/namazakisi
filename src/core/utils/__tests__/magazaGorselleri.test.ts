/**
 * Nobetci: magaza pazarlama gorselleri (scripts/magaza-gorselleri/).
 *
 * Tarayici CALISTIRMAZ: yalniz saf veri tablosunu (setler.js), metin olcusunu ve
 * kare secimini olcer. Asil cizim hatta (Chromium) yapilir.
 *
 * En kritik kural: App Store setinde Android'e ozgu vaat GECEMEZ (App Review 2.3).
 */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const KOK = path.resolve(__dirname, '../../../..');
const { SETLER, CIHAZ_TURLERI, ANDROID_OZEL_IDDIALAR, APPLE_WATCH_IDDIALARI, PLATFORM_SETI } = require(path.join(KOK, 'scripts/magaza-gorselleri/setler'));
const { metinOlcusu, metinGenisligi, sayfaUret } = require(path.join(KOK, 'scripts/magaza-gorselleri/sablon'));
const { IKON_ADLARI } = require(path.join(KOK, 'scripts/magaza-gorselleri/ikonlar'));
const { kareBul, pngleriTara, gorselleriCoz } = require(path.join(KOK, 'scripts/magaza-gorselleri/uret'));

type Kare = {
    ad: string;
    baslik: string;
    alt?: string;
    altTabletsiz?: string;
    dipnot?: string;
    iddialar: string[];
    rozet?: { ikon: string; metin: string };
    ipucu?: { metin: string; not?: string; x?: number; y?: number; hedef?: { x: number; y: number }; yon?: string };
    bildirim?: { baslik: string; govde: string };
    maddeler?: { ikon: string; metin: string }[];
    katmanlar?: { cihaz: string; kaynak: string[] }[];
    magazaDisi?: boolean;
    kosul?: string;
    yerlesim?: string;
};
type Set = {
    magaza: string;
    platform: string;
    kosul?: string;
    boyut: { gen: number; yuk: number };
    yon: string;
    cihaz: string;
    yukleme: boolean;
    kareler: Kare[];
};

const setler = Object.entries(SETLER) as [string, Set][];
const metinleri = (k: Kare) =>
    [k.baslik, k.alt, k.altTabletsiz, k.dipnot, k.rozet?.metin, k.ipucu?.metin, k.ipucu?.not, k.bildirim?.baslik, k.bildirim?.govde, ...(k.maddeler || []).map((m) => m.metin)].filter(
        Boolean
    ) as string[];
const app = JSON.parse(fs.readFileSync(path.join(KOK, 'app.json'), 'utf8'));
const eklenti = (ad: string) => app.expo.plugins.find((p: unknown) => Array.isArray(p) && p[0] === ad);

describe('magaza pazarlama gorselleri — boyutlar', () => {
    it('iPhone 6.9" ve iPad 13" App Store olcusunde', () => {
        expect(SETLER.iphone.boyut).toEqual({ gen: 1320, yuk: 2868 });
        const { gen, yuk } = SETLER.ipad.boyut;
        expect([gen, yuk].sort()).toEqual([2064, 2752]);
    });

    it('iPad destekleniyorsa iPad seti VAR ve kosulsuz (App Store iPad karesi zorunlu)', () => {
        if (app.expo.ios.supportsTablet) {
            expect(SETLER.ipad.kosul).toBeUndefined();
            expect(SETLER.ipad.yukleme).toBe(true);
        }
    });

    it('Play telefon karesi en-boy orani en fazla 2:1', () => {
        const { gen, yuk } = SETLER['play-telefon'].boyut;
        expect(Math.max(gen, yuk) / Math.min(gen, yuk)).toBeLessThanOrEqual(2);
        expect(Math.min(gen, yuk)).toBeGreaterThanOrEqual(320);
    });

    it('Play tablet karesi hem 7" (320-3840) hem 10" (>=1080) sartina uyar', () => {
        const { gen, yuk } = SETLER['play-tablet'].boyut;
        expect(Math.min(gen, yuk)).toBeGreaterThanOrEqual(1080);
        expect(Math.max(gen, yuk)).toBeLessThanOrEqual(3840);
        expect(Math.max(gen, yuk) / Math.min(gen, yuk)).toBeLessThanOrEqual(2);
    });

    it('TV 1920x1080, Wear 1:1 en az 384, Apple Watch kabul edilen olcude', () => {
        expect(SETLER.tv.boyut).toEqual({ gen: 1920, yuk: 1080 });
        expect(SETLER.wear.boyut.gen).toBe(SETLER.wear.boyut.yuk);
        expect(SETLER.wear.boyut.gen).toBeGreaterThanOrEqual(384);
        const { gen, yuk } = SETLER['apple-watch'].boyut;
        expect(CIHAZ_TURLERI.appleWatch(gen, yuk)).toBe(true);
    });

    it('magazanin kare sinirlari: Play <= 8 yuklenen, App Store <= 10', () => {
        // Kosullu (gelecek ozellik) ve magazaDisi kareler galeriye girmez.
        const yuklenen = (s: Set) => s.kareler.filter((k) => !k.magazaDisi && !k.kosul);
        for (const [, s] of setler) expect(yuklenen(s).length).toBeLessThanOrEqual(s.magaza === 'play' ? 8 : 10);
    });

    it('kare adlari sirali ve tekil (yukleyici ada gore siralar)', () => {
        for (const [, s] of setler) {
            const adlar = s.kareler.map((k) => k.ad);
            expect(new Set(adlar).size).toBe(adlar.length);
            adlar.forEach((a) => expect(a).toMatch(/^\d\d-[a-z0-9-]+$/));
            expect([...adlar].sort()).toEqual(adlar);
        }
    });

    it('Android tableti ile iPad yatayi farkli cihaz turu (ayni klasorde karismaz)', () => {
        expect(CIHAZ_TURLERI.tablet(2560, 1600)).toBe(true);
        expect(CIHAZ_TURLERI.tablet(2752, 2064)).toBe(false);
        expect(CIHAZ_TURLERI.ipadYatay(2752, 2064)).toBe(true);
    });
});

describe('magaza pazarlama gorselleri — DOGRULUK (platform suzgeci)', () => {
    const appStore = setler.filter(([, s]) => s.magaza === 'appstore');

    it('App Store setlerinde Android-ozel iddia YOK', () => {
        for (const [ad, s] of appStore) {
            for (const k of s.kareler) {
                const yasak = k.iddialar.filter((i) => ANDROID_OZEL_IDDIALAR.includes(i));
                expect({ set: ad, kare: k.ad, yasak }).toEqual({ set: ad, kare: k.ad, yasak: [] });
            }
        }
    });

    it('App Store metinlerinde Android-ozel sozcuk YOK', () => {
        // "televizyon" serbest: iOS uygulamasi Android/Google TV ile esleser (TvEslemeServisi).
        const yasak = /rahatsız etmeyin|wear os|android|google|drive|widget|otomasyon|ezan kaydı|kendi ses|apple tv/i;
        for (const [, s] of appStore.filter(([, x]) => !x.kosul)) for (const k of s.kareler.filter((x) => !x.kosul)) for (const m of metinleri(k)) expect(m).not.toMatch(yasak);
    });

    it('iPhone camide sessiz vaadi Odak ile anlatilir (Rahatsız Etmeyin/geofence degil)', () => {
        const camide = SETLER.iphone.kareler.find((k: Kare) => k.ad.includes('camide'));
        expect(camide.iddialar).toEqual(['ios-camide-odak']);
        expect(camide.alt).toMatch(/odağ/i);
    });

    it('Apple Watch iddialari izinli kumede; saat hedefi kapaliysa saat karesi yok', () => {
        const saatli = appStore.flatMap(([, s]) =>
            s.kareler.filter((k) => s.cihaz === 'appleWatch' || (k.katmanlar || []).some((c) => c.cihaz === 'appleWatch'))
        );
        expect(saatli.length).toBeGreaterThan(0);
        for (const k of saatli) {
            const izinsiz = k.iddialar.filter((i) => i.startsWith('apple-watch') && !APPLE_WATCH_IDDIALARI.includes(i));
            expect(izinsiz).toEqual([]);
        }
        const saat = eklenti('./plugins/withNamazSaat');
        if (!saat || saat[1].etkin !== true) {
            saatli.forEach((k) => expect(k.kosul).toBeTruthy());
            expect(SETLER['apple-watch'].yukleme).toBe(false);
        }
    });

    it('Apple TV hedefi kapaliysa Apple TV seti kosullu', () => {
        const tv = eklenti('./plugins/withNamazTV');
        if (!tv || tv[1].etkin !== true) expect(SETLER['apple-tv'].kosul).toBeTruthy();
    });

    it('iCloud esitlemesi kullaniciya acik degilse vaadi kosullu', () => {
        if (!app.expo.extra || app.expo.extra.icloudEsitlemeEtkin !== true) {
            for (const [, s] of appStore)
                for (const k of s.kareler) if (k.iddialar.includes('icloud-esitleme')) expect(k.kosul).toBeTruthy();
        }
    });

    it('Android Auto vaadi Play form faktoru acilana dek kosullu', () => {
        for (const [, s] of setler) for (const k of s.kareler) if (k.iddialar.includes('android-auto')) expect(k.kosul).toBeTruthy();
    });

    it('iOS gercek alarm vaadi iOS 26 dipnotunu tasir', () => {
        const sabah = SETLER.iphone.kareler.find((k: Kare) => k.iddialar.includes('alarm'));
        expect(sabah.dipnot).toMatch(/iOS 26/);
    });

    it('Play Wear OS seti magazaya yuklenmez (cerceve/metin yasak)', () => {
        expect(SETLER.wear.yukleme).toBe(false);
    });

    it('yasakli/yaniltici ifade yok: secde, terk/kufur, "hicbir veri", fiyat/rakip', () => {
        for (const [, s] of setler)
            for (const k of s.kareler)
                for (const m of metinleri(k)) {
                    expect(m).not.toMatch(/secde|terk|küfür|kafir/i);
                    expect(m).not.toMatch(/hiçbir veri|internete çıkmaz/i);
                    expect(m).not.toMatch(/₺|\$|en iyi|1 numara|rakip/i);
                }
    });

    it('kibar "siz": arayuz metninde "sen" kipi yok (bildirim ornegi haric)', () => {
        for (const [, s] of setler)
            for (const k of s.kareler)
                for (const m of [k.baslik, k.alt, k.dipnot, k.ipucu?.metin, k.ipucu?.not].filter(Boolean) as string[]) expect(m).not.toMatch(/\b(sen|senin|sana)\b/i);
    });

    it('kare basina EN FAZLA bir anlatici ipucu: kisa etiket, tuval icinde, rozetle birlikte degil', () => {
        let sayi = 0;
        for (const [ad, s] of setler)
            for (const k of s.kareler) {
                if (!k.ipucu) continue;
                sayi++;
                expect({ ad, kare: k.ad, rozetDe: Boolean(k.rozet) }).toEqual({ ad, kare: k.ad, rozetDe: false });
                const kelime = k.ipucu.metin.split(/\s+/).filter(Boolean).length;
                expect({ kare: k.ad, kisa: kelime >= 2 && kelime <= 5 }).toEqual({ kare: k.ad, kisa: true });
                const n = k.ipucu.hedef || { x: k.ipucu.x as number, y: k.ipucu.y as number };
                for (const v of [n.x, n.y]) expect(v >= 0 && v <= 1).toBe(true);
                if (k.ipucu.hedef) expect(['sol', 'sag', 'ust', 'alt']).toContain(k.ipucu.yon);
            }
        expect(sayi).toBeGreaterThan(15);
    });

    it('telefon/iPad setlerinin eski --platform adlari dogru sete gider', () => {
        expect(PLATFORM_SETI).toEqual({ ios: 'iphone', ipad: 'ipad', android: 'play-telefon' });
    });

    it('gelecek ozellikler varsayilan KAPALI (kosul olmadan uretilmez)', () => {
        expect(SETLER['apple-tv'].kosul).toBeTruthy();
        expect(SETLER.iphone.kareler.find((k: Kare) => k.iddialar.includes('icloud-esitleme')).kosul).toBeTruthy();
    });
});

describe('magaza pazarlama gorselleri — metin olcusu', () => {
    it('baslik en fazla iki satir ve her satir alana sigar', () => {
        for (const [ad, s] of setler) {
            const o = metinOlcusu(s);
            for (const k of s.kareler) {
                const satirlar = k.baslik.split('\n');
                expect(satirlar.length).toBeLessThanOrEqual(2);
                // Saat karelerinde baslik kendiliginden kirilir: toplam iki satira sigmali.
                const sinir = s.yon === 'kare' ? 2 : 1;
                for (const sat of satirlar) {
                    const oran = metinGenisligi(sat, o.baslikPx) / o.baslikGen;
                    expect({ set: ad, kare: k.ad, sat, sigar: oran <= sinir }).toEqual({ set: ad, kare: k.ad, sat, sigar: true });
                }
            }
        }
    });

    it('alt satir kisa: tahmini satir sayisi sinirda', () => {
        for (const [, s] of setler) {
            const o = metinOlcusu(s);
            for (const k of s.kareler) {
                if (!k.alt) continue;
                expect(o.altSatir).toBeGreaterThan(0);
                const satir = Math.ceil(metinGenisligi(k.alt, o.altPx, false) / o.altGen);
                expect({ kare: k.ad, satir: satir <= o.altSatir }).toEqual({ kare: k.ad, satir: true });
            }
        }
    });

    it('buyuk harf donusumu kullanilmaz (Turkce I/i tuzagi)', () => {
        for (const dosya of ['sablon.js', 'uret.js', 'setler.js']) {
            const kaynak = fs.readFileSync(path.join(KOK, 'scripts/magaza-gorselleri', dosya), 'utf8');
            expect(kaynak).not.toMatch(/toUpperCase|text-transform\s*:\s*uppercase/);
        }
    });

    it('kullanilan ikonlarin hepsi tanimli', () => {
        for (const [, s] of setler)
            for (const k of s.kareler) {
                if (k.rozet) expect(IKON_ADLARI).toContain(k.rozet.ikon);
                (k.maddeler || []).forEach((m) => expect(IKON_ADLARI).toContain(m.ikon));
            }
    });
});

describe('magaza pazarlama gorselleri — ham kare secimi', () => {
    const sahtePng = (dosya: string, gen: number, yuk: number) => {
        fs.mkdirSync(path.dirname(dosya), { recursive: true });
        const b = Buffer.alloc(33);
        b.writeUInt32BE(0x89504e47, 0);
        b.writeUInt32BE(0x0d0a1a0a, 4);
        b.writeUInt32BE(13, 8);
        b.write('IHDR', 12, 'ascii');
        b.writeUInt32BE(gen, 16);
        b.writeUInt32BE(yuk, 20);
        fs.writeFileSync(dosya, b);
    };
    let kok: string;
    beforeAll(() => {
        kok = fs.mkdtempSync(path.join(os.tmpdir(), 'magaza-gorsel-test-'));
        sahtePng(path.join(kok, 'ios/01-ana-ekran.png'), 1320, 2868);
        sahtePng(path.join(kok, 'android/telefon-koyu/01-ana-ekran.png'), 1080, 2400);
        sahtePng(path.join(kok, 'android/telefon-acik/01-ana-ekran.png'), 1080, 2400);
        sahtePng(path.join(kok, 'android/mockup/02-muhafiz-zaman-seridi.png'), 1080, 1920);
        sahtePng(path.join(kok, 'saat/yuvarlak/01-ana-ekran.png'), 454, 454);
    });
    afterAll(() => fs.rmSync(kok, { recursive: true, force: true }));

    it('ayni adli kareyi cihaz BOYUTUNA gore ayirir', () => {
        const dizin = pngleriTara([kok]);
        expect(kareBul(dizin, 'iphone', ['01-ana-ekran.png']).yol).toContain(`${path.sep}ios${path.sep}`);
        expect(kareBul(dizin, 'wearYuvarlak', ['01-ana-ekran.png']).yol).toContain('yuvarlak');
    });

    it('acik temayi koyuya tercih eder', () => {
        const dizin = pngleriTara([kok]);
        expect(kareBul(dizin, 'androidTelefon', ['01-ana-ekran.png']).yol).toContain('telefon-acik');
    });

    it('Android telefonda magaza karesini (1080x1920) ozellik karesine (1080x2400) tercih eder', () => {
        // CI'da indirme mtime'i rastgeledir: tercih mtime'a kalsaydi gorsel kosudan kosuya degisirdi.
        const ek = path.join(kok, 'magaza/01-ana-ekran.png');
        sahtePng(ek, 1080, 1920);
        fs.utimesSync(ek, new Date(2000, 0, 1), new Date(2000, 0, 1));
        const dizin = pngleriTara([kok]);
        expect(kareBul(dizin, 'androidTelefon', ['01-ana-ekran.png']).boyut).toEqual({ gen: 1080, yuk: 1920 });
        fs.rmSync(ek);
    });

    it('--en-eski: eski hattin karesi aday sayilmaz (tarihsiz cihaz muaf)', () => {
        const eski = path.join(kok, 'eski/tablet-acik/09-tablet.png');
        sahtePng(eski, 2560, 1600);
        fs.utimesSync(eski, new Date(2026, 0, 1), new Date(2026, 0, 1));
        const dizin = pngleriTara([kok]);
        const sinir = { enEski: Date.parse('2026-06-01') };
        expect(kareBul(dizin, 'tablet', ['09-tablet.png'], sinir)).toBeNull();
        expect(kareBul(dizin, 'tablet', ['09-tablet.png'], { ...sinir, tarihsiz: ['tablet'] })).not.toBeNull();
        fs.rmSync(eski);
    });

    it('saatlerin uyandirma ekrani ham kare yoksa GERCEK metinle cizilir (Wear + Apple Watch)', () => {
        const dizin = pngleriTara([kok]);
        for (const [set, ad] of [
            ['play-telefon', '02-sabah'],
            ['play-telefon', '13-bilek'],
            ['iphone', '06-bilek'],
            ['apple-watch', '04-uyandirma'],
        ]) {
            const k = SETLER[set].kareler.find((x: Kare) => x.ad === ad);
            const r = gorselleriCoz(dizin, SETLER[set], k);
            expect({ set, ad, atla: r.atla }).toEqual({ set, ad, atla: false });
            const html: string = sayfaUret(k, SETLER[set], r.gorseller, '');
            expect(html).toContain('Kıldım');
        }
    });

    it('onceki uretimin mockup/pazarlama ciktisini ham kare saymaz', () => {
        const dizin = pngleriTara([kok]);
        expect(kareBul(dizin, 'androidTelefon', ['02-muhafiz-zaman-seridi.png'])).toBeNull();
    });

    it('kolajda eksik cihaz cizilmez; tek cihazli karede eksik = atla', () => {
        const dizin = pngleriTara([kok]);
        const kolaj = SETLER['play-telefon'].kareler.find((k: Kare) => k.yerlesim === 'kolaj' || k.ad.includes('cihazlar'));
        const r = gorselleriCoz(dizin, SETLER['play-telefon'], kolaj);
        expect(r.atla).toBe(false);
        expect(r.eksik.length).toBeGreaterThan(0);
        const kaza = SETLER['play-telefon'].kareler.find((k: Kare) => k.ad.endsWith('kaza'));
        expect(gorselleriCoz(dizin, SETLER['play-telefon'], kaza).atla).toBe(true);
        // Ham kare istemeyen takvim cizimi her zaman uretilir.
        const takvim = SETLER['play-telefon'].kareler.find((k: Kare) => k.ad.endsWith('takvim'));
        expect(gorselleriCoz(dizin, SETLER['play-telefon'], takvim).atla).toBe(false);
    });

    it('sablon her karede baslik metnini kacislayarak ve opak zeminle uretir', () => {
        const dizin = pngleriTara([kok]);
        for (const [, s] of setler)
            for (const k of s.kareler) {
                const { gorseller } = gorselleriCoz(dizin, s, k);
                const html: string = sayfaUret(k, s, gorseller, 'file:///ikon.png');
                expect(html).toContain(k.baslik.split('\n')[0].replace(/&/g, '&amp;'));
                expect(html).toMatch(/body \{ background:#FFFFFF/);
                expect(html).toContain(`width:${s.boyut.gen}px; height:${s.boyut.yuk}px`);
            }
    });
});
