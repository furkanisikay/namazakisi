/**
 * SÖZLEŞME NÖBETÇİSİ — güven puanı senaryoları Kotlin (`GuvenPuaniTest.kt`) ile ORTAK:
 * `modules/expo-cami-geofence/android/src/test/resources/guven-puani-tablosu.json`.
 * Beklenenler elle yazıldı (uygulamadan türetilmedi): önünden geçme, trafikte durma,
 * yanındaki kafe, vakit dışı uğrama, cuma hutbesi, ezan girişinde caminin içi.
 */
import * as fs from 'fs';
import * as path from 'path';
import {
    acilisBiciminiUygula,
    acilisKarariVer,
    guvenPuaniniHesapla,
    hareketSinifiBul,
    zamanSinifiBul,
    type AcilisGirdisi,
} from '../guvenPuani';

const tablo = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, '../../../../modules/expo-cami-geofence/android/src/test/resources/guven-puani-tablosu.json'),
        'utf8'
    )
);

interface Beklenen {
    sonuc: string;
    eylem: string;
    zaman?: string;
    yer?: string;
    hareket?: string;
    puan?: number;
    guvenKarari?: string;
    tavan?: string | null;
}

describe('acilisKarariVer — ortak senaryo tablosu', () => {
    it.each(tablo.senaryolar as (AcilisGirdisi & { ad: string; beklenen: Beklenen })[])('$ad', (s) => {
        const r = acilisKarariVer(s);
        expect(r.karar.sonuc).toBe(s.beklenen.sonuc);
        expect(r.eylem).toBe(s.beklenen.eylem);
        if (s.beklenen.sonuc === 'camide') {
            expect(r.guven).toEqual({
                zaman: s.beklenen.zaman,
                yer: s.beklenen.yer,
                hareket: s.beklenen.hareket,
                puan: s.beklenen.puan,
                karar: s.beklenen.guvenKarari,
                tavan: s.beklenen.tavan,
            });
        } else {
            expect(r.guven).toBeNull();
        }
    });

    it('tablo istenen altı senaryonun hepsini kapsar', () => {
        const adlar = (tablo.senaryolar as { ad: string }[]).map((s) => s.ad).join('\n');
        for (const parca of ['önünden', 'trafikte', 'kafede', 'vakit dışında', 'cuma hutbesi', 'ezan girişinde caminin içinde']) {
            expect(adlar).toContain(parca);
        }
    });
});

describe('güven kuralları', () => {
    it('hareket (>1,5 m/s) hiçbir puanla otomatik açmaz', () => {
        const r = guvenPuaniniHesapla({ zaman: 'cuma', yer: 'poligonIci', hareket: 'hareketli' }, 1, 20);
        expect(r.karar).toBe('sor');
        expect(r.tavan).toBe('hareketli');
    });

    it('kenar/tampon hız 0 olsa bile en fazla sorar', () => {
        expect(guvenPuaniniHesapla({ zaman: 'cuma', yer: 'tampon', hareket: 'durgun' }, 1, 20).karar).toBe('sor');
        expect(guvenPuaniniHesapla({ zaman: 'cuma', yer: 'noktaKenar', hareket: 'durgun' }, 1, 20).karar).toBe('sor');
    });

    it('hız sınıfları: 1,5 dahil yavaş, 0,5 dahil durgun, negatif/NaN bilinmiyor', () => {
        expect(hareketSinifiBul(1.5)).toBe('yavas');
        expect(hareketSinifiBul(1.51)).toBe('hareketli');
        expect(hareketSinifiBul(0.5)).toBe('durgun');
        expect(hareketSinifiBul(-1)).toBe('bilinmiyor');
        expect(hareketSinifiBul(Number.NaN)).toBe('bilinmiyor');
        expect(hareketSinifiBul(null)).toBe('bilinmiyor');
    });

    it('ezan penceresi giriş −10 … +40 dk (sınırlar dahil); pencere yoksa serbest', () => {
        const giris = 1_000 * 60_000;
        const p = { bas: giris - 20 * 60_000, son: giris + 60 * 60_000, vakit: 'ogle' as const, tarih: 't', cuma: false };
        expect(zamanSinifiBul(giris - 10 * 60_000, p)).toBe('ezanYakin');
        expect(zamanSinifiBul(giris - 11 * 60_000, p)).toBe('kapiIci');
        expect(zamanSinifiBul(giris + 40 * 60_000, p)).toBe('ezanYakin');
        expect(zamanSinifiBul(giris + 41 * 60_000, p)).toBe('kapiIci');
        expect(zamanSinifiBul(giris, null)).toBe('serbest');
        expect(zamanSinifiBul(giris, { ...p, cuma: true })).toBe('cuma');
    });

    it('açılış biçimi: otomatik SOR\'u açar ama HİÇBİR\'i açmaz; sorarak OTOMATİK\'i sorar', () => {
        expect(acilisBiciminiUygula('sor', 'otomatik')).toBe('otomatik');
        expect(acilisBiciminiUygula('hicbir', 'otomatik')).toBe('hicbir');
        expect(acilisBiciminiUygula('otomatik', 'sorarak')).toBe('sor');
        expect(acilisBiciminiUygula('hicbir', 'sorarak')).toBe('hicbir');
        expect(acilisBiciminiUygula('sor', 'akilli')).toBe('sor');
    });
});
