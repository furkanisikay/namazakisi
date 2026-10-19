import {
    alanHalkasi,
    basilanKume,
    basilanYerKimligi,
    daireHalkasi,
    gorunenAlanM,
    haritaKatmanlariOlustur,
    haritaYerleriniBirlestir,
    onizlemeYerlesimi,
    yakinCamiSayisi,
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
        olcek: null,
        tur: 'cami',
        favori: false,
        ...d,
    });

    it('ölçekli bina sınırı: köşeler merkezden k katı uzakta; daire seçiliyse ölçek yok sayılır', () => {
        const ozgun = alanHalkasi(yer({ poligon: KARE, yaricapM: 29 }));
        const buyuk = alanHalkasi(yer({ poligon: KARE, yaricapM: 29, olcek: 2 }));
        expect(buyuk).toHaveLength(5);
        const u = ([ln, la]: number[]) => mesafeM(41.011, 28.972, la, ln);
        expect(u(buyuk[0]) / u(ozgun[0])).toBeCloseTo(2, 3);
        expect(gorunenAlanM(yer({ poligon: KARE, yaricapM: 29, olcek: 2 }))).toBe(58);
        const daire = alanHalkasi(yer({ poligon: KARE, yaricapM: 29, olcek: 2, alanM: 40 }));
        for (const p of daire) expect(u(p)).toBeCloseTo(40, 0);
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

    it('KÜMELEME: ayarsız camiler küme kaynağına, seçili / hariç / ayarlı yerler kümelenmeyen kaynağa', () => {
        const liste = haritaYerleriniBirlestir(
            [
                { id: 'osm:w1', ad: 'Kare', lat: 41.011, lng: 28.972, yaricapM: 29, poligon: KARE },
                { id: 'osm:n2', ad: 'Nokta', lat: 41.02, lng: 28.98, yaricapM: 0 },
                { id: 'osm:n3', ad: 'Üç', lat: 41.03, lng: 28.99, yaricapM: 0 },
                { id: 'osm:n4', ad: 'Dört', lat: 41.04, lng: 28.99, yaricapM: 0 },
            ],
            { 'osm:n2': { durum: 'haric' }, 'osm:n4': { durum: 'normal', alanM: 40 } }
        );
        const k = haritaKatmanlariOlustur(liste, null);
        expect(k.kumeNoktalari.features.map((f) => f.properties?.id)).toEqual(['osm:w1', 'osm:n3']);
        expect(k.noktalar.features.map((f) => f.properties?.id)).toEqual(['osm:n2', 'osm:n4']);
        // Seçilen cami kümeden çıkar (kümenin içinde kaybolmasın).
        const s = haritaKatmanlariOlustur(liste, 'osm:w1');
        expect(s.kumeNoktalari.features.map((f) => f.properties?.id)).toEqual(['osm:n3']);
        expect(s.noktalar.features.map((f) => f.properties?.id)).toContain('osm:w1');
    });

    it('özgün bina sınırı yalnız seçili yerin sınırı değiştirilmişken çizilir', () => {
        const ayarsiz = haritaKatmanlariOlustur(yerler, 'osm:w1');
        expect(ayarsiz.ozgunSinir.features).toHaveLength(0);
        const olcekli = haritaYerleriniBirlestir(
            [{ id: 'osm:w1', ad: 'Kare', lat: 41.011, lng: 28.972, yaricapM: 29, poligon: KARE }],
            { 'osm:w1': { durum: 'normal', olcek: 1.5 } }
        );
        expect(olcekli[0].olcek).toBe(1.5);
        const k = haritaKatmanlariOlustur(olcekli, 'osm:w1');
        expect(k.ozgunSinir.features).toHaveLength(1);
        expect(k.ozgunSinir.features[0].geometry.coordinates[0][0]).toEqual([28.971762, 41.01082]);
    });

    it('poligonsuz kayıtta ölçek ayarı haritaya taşınmaz', () => {
        const y = haritaYerleriniBirlestir([{ id: 'osm:n2', ad: 'Nokta', lat: 41.02, lng: 28.98, yaricapM: 0 }], {
            'osm:n2': { durum: 'normal', olcek: 2 },
        });
        expect(y[0].olcek).toBeNull();
    });

    it('basılan KÜME çözülür; tek nokta küme sayılmaz', () => {
        expect(
            basilanKume([{ properties: { cluster: true, cluster_id: 7, point_count: 12 }, geometry: { type: 'Point', coordinates: [28.97, 41.01] } }])
        ).toEqual({ kumeId: 7, lng: 28.97, lat: 41.01, adet: 12 });
        expect(basilanKume([{ properties: { id: 'osm:w1' }, geometry: { type: 'Point', coordinates: [28.97, 41.01] } }])).toBeNull();
        expect(basilanKume([{ properties: { cluster: true, cluster_id: 7 } }])).toBeNull();
        expect(basilanKume(undefined)).toBeNull();
    });

    it('basılan özellikten yer kimliği çözülür', () => {
        expect(basilanYerKimligi([{ properties: { id: 'osm:w1' } }])).toBe('osm:w1');
        expect(basilanYerKimligi([{ properties: null }, {}])).toBeNull();
        expect(basilanYerKimligi(undefined)).toBeNull();
    });
});

describe('mini önizleme', () => {
    const derece = 500 / 111195.08;
    const m = { lat: 41, lng: 29 };
    const dogu = (km: number) => (km * 2 * derece) / Math.cos((41 * Math.PI) / 180);

    it('kullanıcı konumu DAİMA ortada; kuzeydeki yukarıda, doğudaki sağda', () => {
        const y = onizlemeYerlesimi(m, [
            { id: 'kuzey', lat: 41 + derece, lng: 29 },
            { id: 'dogu', lat: 41, lng: 29 + dogu(0.5) },
        ], 300, 112);
        expect(y.merkez).toEqual({ sol: 150, ust: 56 });
        const [k, d] = y.noktalar;
        expect(k.sol).toBeCloseTo(150, 5);
        expect(k.ust).toBeLessThan(56);
        expect(d.sol).toBeGreaterThan(150);
        expect(d.ust).toBeCloseTo(56, 5);
    });

    it('REGRESYON (kare 25): batıya yığılmış camiler de kenar payı içinde kalır, kırpılmaz; ölçek izotrop', () => {
        const camiler = [
            { id: 'a', lat: 41 + 2 * derece, lng: 29 - dogu(1.6) },
            { id: 'b', lat: 41 - 2 * derece, lng: 29 - dogu(0.9) },
            { id: 'c', lat: 41 + derece, lng: 29 + dogu(0.2) },
            { id: 'uzak', lat: 41.2, lng: 29 },
        ];
        const y = onizlemeYerlesimi(m, camiler, 320, 112, 14);
        expect(y.noktalar.map((n) => n.id)).toEqual(['a', 'b', 'c']);
        for (const n of y.noktalar) {
            expect(n.sol).toBeGreaterThanOrEqual(14 - 1e-9);
            expect(n.sol).toBeLessThanOrEqual(306 + 1e-9);
            expect(n.ust).toBeGreaterThanOrEqual(14 - 1e-9);
            expect(n.ust).toBeLessThanOrEqual(98 + 1e-9);
        }
        // İzotrop: 'c' (doğu 200 m, kuzey 500 m) — iki eksende aynı px/m.
        const c = y.noktalar[2];
        expect((c.sol - 160) / 200).toBeCloseTo((56 - c.ust) / 500, 6);
    });

    it('sayım 2 km içindekileri sayar', () => {
        expect(yakinCamiSayisi([{ mesafeM: 100 }, { mesafeM: 2000 }, { mesafeM: 2001 }, { mesafeM: NaN }])).toBe(2);
    });
});
