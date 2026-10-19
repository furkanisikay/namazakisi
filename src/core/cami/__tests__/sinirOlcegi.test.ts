/**
 * Bina sınırı ÖLÇEĞİ (#297 sahip geri bildirimi) — saf geometri + sınır ayarı.
 *
 * Ortak fikstür `poligon-olcek-ornekleri.json` Kotlin `GeometriOlcekTest` ile AYNI
 * dosyadır; beklenen köşeler bağımsız Python ile üretildi.
 */
import * as fs from 'fs';
import * as path from 'path';
import { alanDisiUzaklikM, alanYaricapiM, etkinOlcek, etkinPoligon, kendiniKesiyorMu, mesafeM, poligonuOlcekle, poligonuOnar } from '../geometri';
import { camiVerisiniCoz } from '../camiVerisi';
import type { IzlenenYer, LatLng } from '../camiTipleri';
import {
    OZGUN_SINIR_DEGISIKLIGI,
    daireDegisikligi,
    gorunenOlcekYuzde,
    kipDegisikligi,
    olcekDegisikligi,
    olcekUstYuzde,
    ozgunSinirdaMi,
    sinirAciklamasi,
    sinirModu,
    type SinirGirdisi,
} from '../sinirAyari';
import { camideyimAyarlariniNormalize, yerDurumunuAyarla } from '../camideyimAyarlari';

const KAYNAK = path.join(__dirname, '../../../../modules/expo-cami-geofence/android/src/test/resources');
const fikstur = JSON.parse(fs.readFileSync(path.join(KAYNAK, 'poligon-olcek-ornekleri.json'), 'utf8'));

describe('poligonuOlcekle — ortak fikstür', () => {
    it.each(fikstur.poligonlar as { ad: string; lat: number; lng: number; k: number; poligon: LatLng[]; beklenen: LatLng[] }[])(
        '$ad',
        (v) => {
            const sonuc = poligonuOlcekle(v.poligon, v.lat, v.lng, v.k);
            expect(sonuc).toHaveLength(v.beklenen.length);
            sonuc.forEach(([la, ln], i) => {
                expect(la).toBeCloseTo(v.beklenen[i][0], 7);
                expect(ln).toBeCloseTo(v.beklenen[i][1], 7);
            });
        }
    );

    it.each(fikstur.etkinOlcek as { olcek: number | null; yaricapM: number; beklenen: number }[])(
        'etkinOlcek($olcek, $yaricapM) = $beklenen',
        (v) => {
            expect(etkinOlcek(v.olcek, v.yaricapM)).toBeCloseTo(v.beklenen, 9);
        }
    );

    it('merkezden her köşenin METRE uzaklığı tam k katına çıkar (kuzey enleminde de)', () => {
        const v = fikstur.poligonlar[1];
        const once = (v.poligon as LatLng[]).map(([la, ln]) => mesafeM(v.lat, v.lng, la, ln));
        const sonra = poligonuOlcekle(v.poligon, v.lat, v.lng, v.k).map(([la, ln]) => mesafeM(v.lat, v.lng, la, ln));
        sonra.forEach((m, i) => expect(m / once[i]).toBeCloseTo(v.k, 3));
    });
});

describe('poligon onarımı — ortak fikstür + GERÇEK veri nöbetçisi', () => {
    it.each(fikstur.onarim as { ad: string; poligon: LatLng[]; kendiniKeser: boolean; beklenen: LatLng[] }[])('$ad', (v) => {
        expect(kendiniKesiyorMu(v.poligon)).toBe(v.kendiniKeser);
        expect(poligonuOnar(v.poligon)).toEqual(v.beklenen);
    });

    const binYolu = path.join(__dirname, '../../../../assets/camiler/tr.bin');
    const veri = fs.existsSync(binYolu) ? camiVerisiniCoz(new Uint8Array(fs.readFileSync(binYolu))) : null;

    (veri ? it : it.skip)('tr.bin: okunan HİÇBİR poligon kendini kesmez (eski üretici çıktısı onarılır)', () => {
        let bozuk = 0;
        for (let i = 0; i < veri!.kayitSayisi; i++) {
            const p = veri!.kayit(i).poligon;
            if (p && kendiniKesiyorMu(p)) bozuk++;
        }
        expect(bozuk).toBe(0);
    });

    (veri ? it : it.skip)('Ayasofya (sahip karesi 26): %100 ve ölçekli hâli kendini kesmez; ölçek şekli korur', () => {
        const ayasofya = veri!.enYakinlar(41.0082, 28.9784, 5, 1000).find((e) => e.kayit.id === 'osm:w109862851')!.kayit;
        expect(ayasofya.poligon).not.toBeNull();
        for (const k of [1, 1.5, 1.875]) {
            const buyuk = etkinPoligon({ ...ayasofya, ozelAlanM: null, ozelOlcek: k })!;
            expect(kendiniKesiyorMu(buyuk)).toBe(false);
            ayasofya.poligon!.forEach(([la, ln], i) => {
                const once = mesafeM(ayasofya.lat, ayasofya.lng, la, ln);
                const sonra = mesafeM(ayasofya.lat, ayasofya.lng, buyuk[i][0], buyuk[i][1]);
                expect(sonra / once).toBeCloseTo(etkinOlcek(k, ayasofya.yaricapM), 3);
            });
        }
    });
});

describe('karar katmanı: ölçek yalnız poligonda ve daire yokken', () => {
    const KARE: LatLng[] = fikstur.poligonlar[0].poligon;
    const yer = (d: Partial<IzlenenYer>): IzlenenYer => ({
        id: 'osm:w1',
        ad: 'Kare',
        lat: 41.011,
        lng: 28.972,
        yaricapM: 29,
        poligon: KARE,
        ozelAlanM: null,
        kaynak: 'osm',
        favori: false,
        ...d,
    });

    it('ölçek alanı yoksa davranış birebir eski (özgün poligon)', () => {
        expect(etkinPoligon(yer({}))).toEqual(KARE);
        expect(alanYaricapiM(yer({}))).toBe(29);
    });

    it('ölçek geofence yarıçapını da büyütür (büyütülmüş şekil uyandırma çemberinde kalır)', () => {
        expect(alanYaricapiM(yer({ ozelOlcek: 2 }))).toBe(58);
    });

    it('daire seçiliyse ölçek yok sayılır', () => {
        expect(etkinPoligon(yer({ ozelAlanM: 40, ozelOlcek: 2 }))).toBeNull();
        expect(alanYaricapiM(yer({ ozelAlanM: 40, ozelOlcek: 2 }))).toBe(40);
    });

    it('kenardan 15 m dışarısı: özgünde dışarıda, ×2 içeride', () => {
        const lat = 41.0113148;
        expect(alanDisiUzaklikM(yer({}), lat, 28.972)).toBeGreaterThan(0);
        expect(alanDisiUzaklikM(yer({ ozelOlcek: 2 }), lat, 28.972)).toBe(0);
    });
});

describe('sınır ayarı (harita paneli + liste aynı kural)', () => {
    const g = (d: Partial<SinirGirdisi>): SinirGirdisi => ({
        poligonVar: true,
        yaricapM: 29,
        alanM: null,
        olcek: null,
        kendi: false,
        ...d,
    });

    it('poligonlu ve ayarsız: bina kipi, özgün sınırda', () => {
        expect(sinirModu(g({}))).toBe('bina');
        expect(ozgunSinirdaMi(g({}))).toBe(true);
        expect(gorunenOlcekYuzde(g({}))).toBe(100);
        expect(sinirAciklamasi(g({}))).toBe('Caminin kendi bina sınırı kullanılıyor.');
    });

    it('daire seçilmişse daire kipi ve özgün değil; poligonsuz kayıt hep daire', () => {
        expect(sinirModu(g({ alanM: 40 }))).toBe('daire');
        expect(ozgunSinirdaMi(g({ alanM: 40 }))).toBe(false);
        expect(sinirModu(g({ poligonVar: false, yaricapM: 0 }))).toBe('daire');
    });

    it('kullanıcının eklediği yerin özgün sınırı yoktur (dön düğmesi çıkmaz)', () => {
        expect(ozgunSinirdaMi(g({ kendi: true, poligonVar: false, alanM: 20 }))).toBe(true);
    });

    it('daireye geçiş mevcut alanın yarıçapından başlar ve ölçeği siler', () => {
        expect(kipDegisikligi(g({ olcek: 2 }), 'daire')).toEqual({ alanM: 60, olcek: undefined });
        expect(kipDegisikligi(g({ alanM: 40 }), 'bina')).toEqual({ alanM: undefined });
    });

    it('ölçek %100 → alan silinir (özgün), %150 → 1.5; daire değişikliği ölçeği siler', () => {
        expect(olcekDegisikligi(100)).toEqual({ alanM: undefined, olcek: undefined });
        expect(olcekDegisikligi(150)).toEqual({ alanM: undefined, olcek: 1.5 });
        expect(daireDegisikligi(43)).toEqual({ alanM: 45, olcek: undefined });
    });

    it('büyük binada üst sınır kısılır ve adım ızgarasına hizalanır', () => {
        expect(olcekUstYuzde(29)).toBe(300);
        expect(olcekUstYuzde(70)).toBe(210);
        expect(olcekUstYuzde(200)).toBe(100);
    });

    it('REGRESYON: "Özgün sınıra dön" iki alanı da siler, kayıt normal ise tümden düşer', () => {
        const once = { 'osm:w1': { durum: 'normal' as const, alanM: 40 } };
        expect(yerDurumunuAyarla(once, 'osm:w1', OZGUN_SINIR_DEGISIKLIGI)).toEqual({});
        const fav = { 'osm:w1': { durum: 'favori' as const, olcek: 2 } };
        expect(yerDurumunuAyarla(fav, 'osm:w1', OZGUN_SINIR_DEGISIKLIGI)).toEqual({ 'osm:w1': { durum: 'favori' } });
    });

    it('yalnız ölçeği olan normal kayıt SİLİNMEZ (ayar kaybolmasın)', () => {
        expect(yerDurumunuAyarla({}, 'osm:w1', olcekDegisikligi(200))).toEqual({ 'osm:w1': { durum: 'normal', olcek: 2 } });
    });
});

describe('ayar normalize: ölçek', () => {
    it('kelepçelenir, daireyle birlikte gelirse atılır, 1 ve altı yazılmaz', () => {
        const a = camideyimAyarlariniNormalize({
            yerler: {
                a: { durum: 'normal', olcek: 9 },
                b: { durum: 'normal', alanM: 40, olcek: 2 },
                c: { durum: 'normal', olcek: 1 },
                d: { durum: 'normal', olcek: 'x' },
            },
        });
        expect(a.yerler.a.olcek).toBe(3);
        expect(a.yerler.b).toEqual({ durum: 'normal', alanM: 40 });
        expect(a.yerler.c.olcek).toBeUndefined();
        expect(a.yerler.d.olcek).toBeUndefined();
    });
});
