/**
 * SÖZLEŞME NÖBETÇİSİ — `ornek-camiler.bin` (SENTETİK fikstür) Kotlin çözücüsüyle
 * (`CamiVerisiTest.kt`) AYNI dosyadır; beklenen değerler `ornek-camiler-beklenen.json`
 * içinde bağımsız (Python, kaba kuvvet) üretildi. Biçim: scripts/camiler/BICIM.md.
 */
import * as fs from 'fs';
import * as path from 'path';
import { camiVerisiniCoz } from '../camiVerisi';

const KAYNAK = path.resolve(__dirname, '../../../../modules/expo-cami-geofence/android/src/test/resources');
const ham = (): Uint8Array => new Uint8Array(fs.readFileSync(path.join(KAYNAK, 'ornek-camiler.bin')));
const beklenen = JSON.parse(fs.readFileSync(path.join(KAYNAK, 'ornek-camiler-beklenen.json'), 'utf8'));

describe('camiVerisiniCoz — ortak fikstür', () => {
    const veri = camiVerisiniCoz(ham());

    it('başlığı okur', () => {
        expect(veri).not.toBeNull();
        expect(veri!.kayitSayisi).toBe(beklenen.kayitSayisi);
        expect(veri!.veriZamani).toBe(beklenen.veriZamani);
    });

    it('her kaydı (kimlik, ad, merkez, yarıçap, poligon) birebir çözer', () => {
        beklenen.kayitlar.forEach((b: { id: string; ad: string; lat: number; lng: number; yaricapM: number; koseSayisi: number; poligon: number[][] }, i: number) => {
            const k = veri!.kayit(i);
            expect(k.id).toBe(b.id);
            expect(k.ad).toBe(b.ad);
            expect(k.lat).toBeCloseTo(b.lat, 6);
            expect(k.lng).toBeCloseTo(b.lng, 6);
            expect(k.yaricapM).toBe(b.yaricapM);
            if (b.koseSayisi === 0) {
                expect(k.poligon).toBeNull();
            } else {
                expect(k.poligon).toHaveLength(b.koseSayisi);
                k.poligon!.forEach((p, j) => {
                    expect(p[0]).toBeCloseTo(b.poligon[j][0], 6);
                    expect(p[1]).toBeCloseTo(b.poligon[j][1], 6);
                });
            }
        });
    });

    it('2^32 üstü OSM kimliği kaybolmaz (40 bit)', () => {
        const ids = Array.from({ length: veri!.kayitSayisi }, (_, i) => veri!.kayit(i).id);
        expect(ids).toContain('osm:n5000000000');
    });

    it('Türkçe karakterli ad UTF-8 çözülür; name:tr name\'den önce gelir', () => {
        const ids = Array.from({ length: veri!.kayitSayisi }, (_, i) => veri!.kayit(i));
        expect(ids.find((k) => k.id === 'osm:w9100000002')!.ad).toBe('Yuvarlak Camii (fikstür)');
    });

    it.each(beklenen.sorgular as { lat: number; lng: number; k: number; azamiMesafeM: number; sonuc: { id: string; mesafeM: number }[] }[])(
        'en yakın K kaba kuvvetle aynı: ($lat, $lng) k=$k',
        (s) => {
            const sonuc = veri!.enYakinlar(s.lat, s.lng, s.k, s.azamiMesafeM);
            expect(sonuc.map((x) => x.kayit.id)).toEqual(s.sonuc.map((x) => x.id));
            sonuc.forEach((x, i) => expect(x.mesafeM).toBeCloseTo(s.sonuc[i].mesafeM, 0));
        }
    );

    it('kayıt dışı indeks fırlatır', () => {
        expect(() => veri!.kayit(99)).toThrow(RangeError);
        expect(() => veri!.kayit(-1)).toThrow(RangeError);
    });

    it('k ≤ 0 ya da geçersiz koordinat boş döner', () => {
        expect(veri!.enYakinlar(41, 29, 0)).toEqual([]);
        expect(veri!.enYakinlar(NaN, 29, 3)).toEqual([]);
    });
});

describe('camiVerisiniCoz — bozuk veriye dayanıklılık (asla fırlatmaz)', () => {
    const bozuk = (fn: (b: Uint8Array) => void): Uint8Array => {
        const b = ham().slice();
        fn(b);
        return b;
    };

    it.each([
        ['boş', new Uint8Array(0)],
        ['kısa başlık', new Uint8Array(10)],
        ['kesik dosya', ham().slice(0, 200)],
        ['yanlış sihir', bozuk((b) => (b[0] = 0x58))],
        ['bilinmeyen sürüm', bozuk((b) => (b[4] = 9))],
        ['bit çevrilmiş gövde (CRC)', bozuk((b) => (b[b.length - 3] ^= 0xff))],
        ['uzunluk alanı yanlış', bozuk((b) => (b[48] ^= 1))],
    ])('%s → null', (_ad, veri) => {
        expect(camiVerisiniCoz(veri as Uint8Array)).toBeNull();
    });
});
