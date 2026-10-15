import { enYakinFavoriCami, yurumeDakikasiHesapla } from '../yurumeSuresi';
import type { YerKaydi } from '../../cami/camiTipleri';

describe('yurumeDakikasiHesapla', () => {
    it('kuş uçuşu × 1.3 kıvrım / 1.3 m/s → dakikaya yuvarlanır', () => {
        // 600 m × 1.3 / 1.3 = 600 sn = 10 dk
        expect(yurumeDakikasiHesapla(600)).toBe(10);
        // 1000 m → 1000 sn = 16.67 dk → 17
        expect(yurumeDakikasiHesapla(1000)).toBe(17);
        // 90 m → 1.5 dk → 2
        expect(yurumeDakikasiHesapla(90)).toBe(2);
    });

    it('en az 1 dk; bozuk girdi 1', () => {
        expect(yurumeDakikasiHesapla(0)).toBe(1);
        expect(yurumeDakikasiHesapla(-5)).toBe(1);
        expect(yurumeDakikasiHesapla(NaN)).toBe(1);
    });
});

describe('enYakinFavoriCami', () => {
    const KONUM = { lat: 41.0, lng: 29.0 };
    const yerler: Record<string, YerKaydi> = {
        'osm:n1': { durum: 'favori', ad: 'Uzak Camii', lat: 41.01, lng: 29.0 }, // ~1.1 km
        'osm:n2': { durum: 'favori', ad: 'Yakın Camii', lat: 41.003, lng: 29.0 }, // ~330 m
        'osm:n3': { durum: 'normal', ad: 'Favori değil', lat: 41.0001, lng: 29.0 },
        'osm:n4': { durum: 'haric', ad: 'Cami değil', lat: 41.0001, lng: 29.0 },
        'kendi:a': { durum: 'normal', kendi: true, ad: 'Mescit', lat: 41.0001, lng: 29.0 },
        'osm:n5': { durum: 'favori', ad: 'Konumsuz' },
    };

    it('yalnız FAVORİLER arasından en yakını seçer', () => {
        const f = enYakinFavoriCami(yerler, KONUM);
        expect(f?.id).toBe('osm:n2');
        expect(f?.ad).toBe('Yakın Camii');
        expect(f?.mesafeM).toBeGreaterThan(300);
        expect(f?.mesafeM).toBeLessThan(360);
        expect(f?.yurumeDk).toBe(yurumeDakikasiHesapla(f!.mesafeM));
    });

    it('konum bilinmiyorsa ya da (0,0) ise null', () => {
        expect(enYakinFavoriCami(yerler, null)).toBeNull();
        expect(enYakinFavoriCami(yerler, { lat: 0, lng: 0 })).toBeNull();
    });

    it('favori yoksa null; adsız favoriye kibar yedek ad', () => {
        expect(enYakinFavoriCami({ x: { durum: 'normal', lat: 41, lng: 29 } }, KONUM)).toBeNull();
        expect(enYakinFavoriCami({ x: { durum: 'favori', lat: 41.001, lng: 29 } }, KONUM)?.ad).toBe('Favori caminiz');
    });
});
