import fs from 'fs';
import path from 'path';
import { dammAraDurumu, koduBicimle, koduCoz, konumuKodla } from '../eslemeKodu';
import {
    eslemeAdiniTemizle,
    eslemeGovdesiOlustur,
    eslemeYanitiniCoz,
    tvBaglantisiMi,
    tvQrCoz,
} from '../eslemeBaglantisi';

/**
 * TV Kotlin ikiziyle (`EslemeKodu.kt`, `EslemeProtokolu.kt`) ORTAK fikstür.
 * Beklenenler bağımsız bir Python Damm uygulamasıyla elle hesaplandı.
 */
interface KodOrnegi { ad: string; lat: number; lng: number; kod: string; cozulenLat: number; cozulenLng: number }
interface Fikstur {
    kodlar: KodOrnegi[];
    bolgeDisi: { ad: string; lat: number; lng: number }[];
    gecersizKodlar: { kod: string; neden: string }[];
    qrGecerli: { metin: string; adres: string; port: number; anahtar: string }[];
    qrGecersiz: { metin: string; neden: string }[];
    istekAnahtari: string;
}

const fikstur: Fikstur = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../../../tv/app/src/test/resources/esleme-ornekleri.json'), 'utf8'),
);

describe('TV eşleştirme kodu', () => {
    it.each(fikstur.kodlar)('$ad → $kod', (o) => {
        expect(konumuKodla(o.lat, o.lng)).toBe(o.kod);
        const c = koduCoz(o.kod);
        expect(c).not.toBeNull();
        expect(c!.lat).toBeCloseTo(o.cozulenLat, 6);
        expect(c!.lng).toBeCloseTo(o.cozulenLng, 6);
    });

    it.each(fikstur.bolgeDisi)('$ad bölge dışıdır', (o: { lat: number; lng: number }) => {
        expect(konumuKodla(o.lat, o.lng)).toBeNull();
    });

    it.each(fikstur.gecersizKodlar)('$kod reddedilir ($neden)', (o) => {
        expect(koduCoz(o.kod)).toBeNull();
    });

    it('her tek hane hatasını yakalar (Damm)', () => {
        const kod = konumuKodla(41.0082, 28.9784)!;
        for (let i = 0; i < kod.length; i++) {
            for (let r = 0; r <= 9; r++) {
                if (String(r) === kod[i]) continue;
                const bozuk = kod.slice(0, i) + r + kod.slice(i + 1);
                expect(dammAraDurumu(bozuk)).not.toBe(0);
            }
        }
    });

    it('çözülen konum yeniden aynı koda kodlanır (hücre merkezi kararlı)', () => {
        for (const o of fikstur.kodlar) {
            const c = koduCoz(o.kod)!;
            expect(konumuKodla(c.lat, c.lng)).toBe(o.kod);
        }
    });

    it('3 + 4 gruplanır', () => {
        expect(koduBicimle('1684892')).toBe('168 4892');
    });
});

describe('TV QR bağlantısı', () => {
    it.each(fikstur.qrGecerli)('$metin', (o) => {
        expect(tvQrCoz(o.metin)).toEqual({ adres: o.adres, port: o.port, anahtar: o.anahtar });
        expect(tvBaglantisiMi(o.metin)).toBe(true);
    });

    it.each(fikstur.qrGecersiz)('$neden', (o) => {
        expect(tvQrCoz(o.metin)).toBeNull();
    });

    it('gövde TV ikizinin kabul ettiği biçimdedir', () => {
        const govde = eslemeGovdesiOlustur(
            { adres: '192.168.1.23', port: 47123, anahtar: fikstur.istekAnahtari },
            { ad: 'Kadıköy, İstanbul', lat: 40.990312345, lng: 29.02911 },
        );
        expect(JSON.parse(govde)).toEqual({ v: 1, k: fikstur.istekAnahtari, ad: 'Kadıköy, İstanbul', lat: 40.99031, lng: 29.02911 });
    });

    it('ad temizliği TV ile aynıdır (denetim karakteri atılır, kırpılır)', () => {
        expect(eslemeAdiniTemizle('  Meram\u0007, Konya  ')).toBe('Meram, Konya');
        expect(Array.from(eslemeAdiniTemizle('İ'.repeat(80)))).toHaveLength(60);
    });

    it('yanıtı çözer, anlaşılmayanı bilinmiyor sayar', () => {
        expect(eslemeYanitiniCoz('{"ok":true}')).toEqual({ ok: true });
        expect(eslemeYanitiniCoz('{"ok":false,"hata":"anahtar"}')).toEqual({ ok: false, hata: 'anahtar' });
        expect(eslemeYanitiniCoz('<html>')).toEqual({ ok: false, hata: 'bilinmiyor' });
    });
});
