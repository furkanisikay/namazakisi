import {
    alanHalkasi,
    basilanYerKimligi,
    daireHalkasi,
    gorunenAlanM,
    haritaKatmanlariOlustur,
    haritaYerleriniBirlestir,
    type HaritaYeri,
} from '../haritaVerisi';
import { mesafeM } from '../geometri';

const KARE: [number, number][] = [
    [41.01082, 28.971762],
    [41.01082, 28.972238],
    [41.01118, 28.972238],
    [41.01118, 28.971762],
];

describe('haritaYerleriniBirlestir', () => {
    it('yakın camilere kullanıcı ayarını işler; uzaktaki favori ve kendi yer eklenir, konumsuz hariç atlanır', () => {
        const yerler = haritaYerleriniBirlestir(
            [
                { id: 'osm:w1', ad: 'Kare', lat: 41.011, lng: 28.972, yaricapM: 29, poligon: KARE },
                { id: 'osm:n2', ad: 'Nokta', lat: 41.02, lng: 28.98, yaricapM: 0, poligon: null },
            ],
            {
                'osm:w1': { durum: 'favori', alanM: 40 },
                'osm:n2': { durum: 'haric' },
                'osm:w9': { durum: 'favori', ad: 'Uzak', lat: 39.9, lng: 32.8 },
                'kendi:a': { durum: 'normal', kendi: true, ad: 'Mescit', lat: 41.03, lng: 28.99, alanM: 20 },
                'osm:n7': { durum: 'haric', ad: 'Konumsuz' },
            }
        );
        expect(yerler.map((y) => [y.id, y.tur, y.favori])).toEqual([
            ['osm:w1', 'cami', true],
            ['osm:n2', 'haric', false],
            ['osm:w9', 'cami', true],
            ['kendi:a', 'kendi', false],
        ]);
        expect(yerler[0].alanM).toBe(40);
    });
});

describe('algılama alanı şekli kararla aynı kuraldan gelir', () => {
    const yer = (d: Partial<HaritaYeri>): HaritaYeri => ({
        id: 'x',
        ad: 'x',
        lat: 41.011,
        lng: 28.972,
        yaricapM: 0,
        poligon: null,
        alanM: null,
        tur: 'cami',
        favori: false,
        ...d,
    });

    it('poligon varsa ve alan seçilmemişse bina sınırı (kapalı halka, [boylam, enlem])', () => {
        const h = alanHalkasi(yer({ poligon: KARE }));
        expect(h).toHaveLength(5);
        expect(h[0]).toEqual([28.971762, 41.01082]);
        expect(h[4]).toEqual(h[0]);
    });

    it('kullanıcı alanı poligonu ezer: dairenin her noktası merkeze alanM uzaklıkta', () => {
        const h = alanHalkasi(yer({ poligon: KARE, alanM: 40 }));
        for (const [ln, la] of h) expect(mesafeM(41.011, 28.972, la, ln)).toBeCloseTo(40, 0);
    });

    it('nokta kaydında varsayılan alan 25 m', () => {
        expect(gorunenAlanM(yer({}))).toBe(25);
        const h = daireHalkasi(41, 29, 25, 8);
        expect(h).toHaveLength(9);
        expect(h[8]).toEqual(h[0]);
    });
});

describe('harita katmanları', () => {
    const yerler = haritaYerleriniBirlestir(
        [
            { id: 'osm:w1', ad: 'Kare', lat: 41.011, lng: 28.972, yaricapM: 29, poligon: KARE },
            { id: 'osm:n2', ad: 'Nokta', lat: 41.02, lng: 28.98, yaricapM: 0 },
        ],
        { 'osm:n2': { durum: 'haric' } }
    );

    it('uyandırma çemberi yalnız seçili yer için, 100 m', () => {
        const k = haritaKatmanlariOlustur(yerler, 'osm:w1');
        expect(k.uyandirma.features).toHaveLength(1);
        const [ln, la] = k.uyandirma.features[0].geometry.coordinates[0][0];
        expect(mesafeM(41.011, 28.972, la, ln)).toBeCloseTo(100, 0);
        expect(k.noktalar.features.find((f) => f.properties?.id === 'osm:w1')?.properties).toMatchObject({ secili: 1 });
        expect(haritaKatmanlariOlustur(yerler, null).uyandirma.features).toHaveLength(0);
    });

    it('hariç tutulan yerin uyandırma çemberi çizilmez (izlenmiyor)', () => {
        expect(haritaKatmanlariOlustur(yerler, 'osm:n2').uyandirma.features).toHaveLength(0);
    });

    it('basılan özellikten yer kimliği çözülür', () => {
        expect(basilanYerKimligi([{ properties: { id: 'osm:w1' } }])).toBe('osm:w1');
        expect(basilanYerKimligi([{ properties: null }, {}])).toBeNull();
        expect(basilanYerKimligi(undefined)).toBeNull();
    });
});
