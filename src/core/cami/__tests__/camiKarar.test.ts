/**
 * SÖZLEŞME NÖBETÇİSİ — karar tablosu Kotlin (`CamiKararTest.kt`) ile ORTAK:
 * `modules/expo-cami-geofence/android/src/test/resources/cami-karar-tablosu.json`.
 * Karar native'de (`goAsync()`) verilir; JS ikizi ayar ekranı ve önizleme içindir.
 * Biri değişip diğeri değişmezse bir taraf kırılır.
 */
import * as fs from 'fs';
import * as path from 'path';
import {
    camiKarariVer,
    camideBitisMs,
    geofenceYaricapiM,
    izlenecekleriSec,
    kapiGectiMi,
    kapiPencereleriniHesapla,
    kapiPenceresiniBul,
    yenilemeKarari,
    yenilemeYaricapiM,
} from '../camiKarar';
import type { CamiKaydi, KararSonucu } from '../camiTipleri';

const tablo = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, '../../../../modules/expo-cami-geofence/android/src/test/resources/cami-karar-tablosu.json'),
        'utf8'
    )
);

describe('camiKarariVer — ortak tablo', () => {
    type KararVakasi = Parameters<typeof camiKarariVer>[0] & { ad: string; beklenen: { sonuc: KararSonucu } };
    it.each(tablo.kararlar as KararVakasi[])('$ad', (vaka) => {
        expect(camiKarariVer(vaka)).toEqual(vaka.beklenen);
    });

    it('vakit dışında konum İSTENMEZ (kapı önce sorulur)', () => {
        const v = tablo.kararlar[0];
        expect(kapiGectiMi(v)).toBe(false);
        expect(kapiGectiMi({ ...v, vakitKapisiAcik: false })).toBe(true);
    });
});

describe('yenileme çemberi — ortak tablo', () => {
    type YenilemeVakasi = { ad: string; simdiMs: number; sonYenilemeMs: number | null; konumZamaniMs: number | null; beklenen: string };
    it.each(tablo.yenileme as YenilemeVakasi[])('$ad', (y) => {
        expect(yenilemeKarari(y.simdiMs, y.sonYenilemeMs, y.konumZamaniMs)).toBe(y.beklenen);
    });

    it('yarıçap tablosu: K\'ıncı uzaklık − 150 m, [500, 5000]', () => {
        for (const v of tablo.yaricap as { kinciMesafeM: number | null; beklenen: number }[]) {
            expect(yenilemeYaricapiM(v.kinciMesafeM)).toBe(v.beklenen);
        }
    });

    it('KRİTİK (sıkı döngü): bayat konumda ASLA yeniden merkezlenmez, patlamada ikinci olay işlenmez', () => {
        const simdi = 1_000_000_000;
        expect(yenilemeKarari(simdi, null, simdi - 10 * 60_000)).toBe('bayatKonum');
        expect(yenilemeKarari(simdi, simdi - 1000, simdi)).toBe('cokSik');
    });
});

describe('vakit kapısı pencereleri — ortak tablo', () => {
    it('giriş −20/+60, cuma öğlesi −90/+90', () => {
        expect(kapiPencereleriniHesapla(tablo.kapi.gunler)).toEqual(tablo.kapi.beklenen);
    });

    it('çakışmada en geç başlayan pencere kazanır', () => {
        const p = [
            { bas: 0, son: 100, vakit: 'aksam' as const, tarih: 't', cuma: false },
            { bas: 50, son: 150, vakit: 'yatsi' as const, tarih: 't', cuma: false },
        ];
        expect(kapiPenceresiniBul(60, p)?.vakit).toBe('yatsi');
        expect(kapiPenceresiniBul(200, p)).toBeNull();
    });

    it('üst süre: 90 dk, cuma 150 dk', () => {
        expect(camideBitisMs(0, false)).toBe(90 * 60_000);
        expect(camideBitisMs(0, true)).toBe(150 * 60_000);
    });
});

describe('izlenecekleriSec', () => {
    const kayit = (id: string, lat: number, lng: number): CamiKaydi => ({ id, ad: id, lat, lng, yaricapM: 0, poligon: null });
    const konum = { lat: 41, lng: 29 };
    const osm = [kayit('osm:n1', 41.001, 29), kayit('osm:n2', 41.002, 29), kayit('osm:n3', 41.003, 29)];

    it('hariç tutulanı atlar, yerine sıradakini alır; K\'ıncı uzaklığı verir', () => {
        const { izlenenler, kinciMesafeM } = izlenecekleriSec(konum, osm, { 'osm:n1': { durum: 'haric' } }, 2);
        expect(izlenenler.map((y) => y.id)).toEqual(['osm:n2', 'osm:n3']);
        expect(kinciMesafeM).toBeCloseTo(333.6, 0);
    });

    it('K dolmazsa yenileme yarıçapı için null', () => {
        expect(izlenecekleriSec(konum, osm, {}, 5).kinciMesafeM).toBeNull();
    });

    it('favori ve kendi yerler mesafeden bağımsız eklenir, alan ayarı işlenir', () => {
        const { izlenenler } = izlenecekleriSec(
            konum,
            osm,
            {
                'osm:n2': { durum: 'normal', alanM: 40 },
                'osm:w9': { durum: 'favori', lat: 39.9, lng: 32.8, ad: 'Uzak favori' },
                'kendi:1': { durum: 'normal', kendi: true, lat: 41.0005, lng: 29, ad: 'Mescit', alanM: 15 },
                'kendi:2': { durum: 'haric', kendi: true, lat: 41.0005, lng: 29 },
                'osm:n8': { durum: 'normal', lat: 41, lng: 29 },
            },
            2
        );
        expect(izlenenler.map((y) => y.id)).toEqual(['osm:n1', 'osm:n2', 'kendi:1', 'osm:w9']);
        expect(izlenenler[1].ozelAlanM).toBe(40);
        expect(izlenenler[2]).toMatchObject({ kaynak: 'kendi', ozelAlanM: 15 });
        expect(izlenenler[3]).toMatchObject({ kaynak: 'osm', favori: true });
    });

    it('ek kota aşılmaz', () => {
        const yerler = Object.fromEntries(
            Array.from({ length: 5 }, (_, i) => [`kendi:${i}`, { durum: 'normal' as const, kendi: true, lat: 41 + i / 1000, lng: 29 }])
        );
        expect(izlenecekleriSec(konum, [], yerler, 25, 3).izlenenler.map((y) => y.id)).toEqual(['kendi:0', 'kendi:1', 'kendi:2']);
    });
});

describe('geofenceYaricapiM', () => {
    it('en az 100 m; büyük alanda alan + 50 m', () => {
        expect(geofenceYaricapiM({ ozelAlanM: null, yaricapM: 0 })).toBe(100);
        expect(geofenceYaricapiM({ ozelAlanM: 120, yaricapM: 0 })).toBe(170);
        expect(geofenceYaricapiM({ ozelAlanM: null, yaricapM: 80 })).toBe(130);
    });
});
