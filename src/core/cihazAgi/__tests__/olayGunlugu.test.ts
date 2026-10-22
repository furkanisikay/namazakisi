import { hlcAl, hlcCoz, hlcIlerlet, hlcKarsilastir, hlcYaz, AZAMI_ILERI_KAYMA_MS } from '../hlc';
import {
    ayarKazanirMi,
    bosGunluk,
    gelenleriAl,
    gonderilecekler,
    gunlukNormalize,
    olayNormalize,
    olayOlustur,
    olaylariBirlestir,
    olaylariUygula,
    GUNLUK_AZAMI_OLAY,
    type GunlukOlayi,
    type OlayGunlugu,
    type OlayHedefleri,
} from '../olayGunlugu';
import { yukuYaz } from '../yuk';

const TEL = 'aaaaaaaaaaaaaaaa';
const TAB = 'bbbbbbbbbbbbbbbb';
const T0 = Date.UTC(2026, 9, 21, 9, 0, 0);

function uret(g: OlayGunlugu, adet: number, t = T0) {
    const olaylar: GunlukOlayi[] = [];
    for (let i = 0; i < adet; i++) {
        const r = olayOlustur(g, { tur: 'kildim', tarih: '2026-10-21', vakit: 'ogle' }, t + i);
        g = r.gunluk;
        olaylar.push(r.olay!);
    }
    return { g, olaylar };
}

const sahteHedef = () => {
    const kayit = { kildim: [] as string[], kaza: [] as unknown[], ayar: [] as [string, unknown][] };
    const hedef: OlayHedefleri = {
        kildim: async (t, v) => void kayit.kildim.push(`${t}_${v}`),
        kazaHareketleri: async (l) => void kayit.kaza.push(...l),
        ayar: async (a, d) => void kayit.ayar.push([a, d]),
    };
    return { kayit, hedef };
};

describe('HLC', () => {
    it('sabit genişlikli dize: sözlük sırası = zaman sırası', () => {
        const a = hlcYaz({ ms: 999, sayac: 0, cihaz: TEL });
        const b = hlcYaz({ ms: 1000, sayac: 0, cihaz: TEL });
        expect(hlcKarsilastir(a, b)).toBe(-1);
        expect(hlcCoz(a)).toEqual({ ms: 999, sayac: 0, cihaz: TEL });
        expect(hlcCoz('bozuk')).toBeNull();
    });

    it('geri giden duvar saati sırayı bozmaz (sayaç artar)', () => {
        const h1 = hlcIlerlet({ ms: 0, sayac: 0, cihaz: TEL }, T0);
        const h2 = hlcIlerlet(h1, T0 - 60_000);
        expect(hlcKarsilastir(hlcYaz(h2), hlcYaz(h1))).toBe(1);
    });

    it('alma kuralı: ileri saatli cihazdan sonra yerel olay ondan BÜYÜK; aşırı ileri saat yok sayılır', () => {
        const yerel = { ms: T0, sayac: 0, cihaz: TEL };
        const gelen = { ms: T0 + 5 * 60_000, sayac: 3, cihaz: TAB };
        const sonra = hlcIlerlet(hlcAl(yerel, gelen, T0), T0);
        expect(hlcKarsilastir(hlcYaz(sonra), hlcYaz(gelen))).toBe(1);
        const sacma = hlcAl(yerel, { ms: T0 + AZAMI_ILERI_KAYMA_MS + 1, sayac: 0, cihaz: TAB }, T0);
        expect(sacma.ms).toBe(T0);
    });
});

describe('olay günlüğü', () => {
    it('seq kesin artan; kimlik <cihaz>:<seq>', () => {
        const { g, olaylar } = uret(bosGunluk(TEL), 3);
        expect(olaylar.map((o) => o.id)).toEqual([`${TEL}:1`, `${TEL}:2`, `${TEL}:3`]);
        expect(g.seq).toBe(3);
        expect(g.bilinen[TEL]).toBe(3);
    });

    it('EKSİK ARALIK: yalnız karşının bilmediği olaylar gider', () => {
        const { g } = uret(bosGunluk(TEL), 5);
        expect(gonderilecekler(g, { [TEL]: 3 }).map((o) => o.seq)).toEqual([4, 5]);
        expect(gonderilecekler(g, { [TEL]: 5 })).toEqual([]);
    });

    it('bütçe kesmesi ardışık önek bırakır (delik yok)', () => {
        const { g } = uret(bosGunluk(TEL), 30);
        const giden = gonderilecekler(g, {}, 1200);
        expect(giden.length).toBeGreaterThan(0);
        expect(giden.length).toBeLessThan(30);
        expect(giden.map((o) => o.seq)).toEqual(giden.map((_, i) => i + 1));
    });

    it('alıcı idempotent: aynı paket iki kez → ikincisinde yeni olay yok; kendi olayları atlanır', () => {
        const tel = uret(bosGunluk(TEL), 2);
        let tab = bosGunluk(TAB);
        const r1 = gelenleriAl(tab, tel.olaylar, T0);
        expect(r1.yeniler.map((o) => o.id)).toEqual([`${TEL}:1`, `${TEL}:2`]);
        tab = r1.gunluk;
        expect(tab.bilinen[TEL]).toBe(2);
        expect(gelenleriAl(tab, tel.olaylar, T0).yeniler).toEqual([]);
        expect(gelenleriAl(tel.g, tel.olaylar, T0).yeniler).toEqual([]);
    });

    it('sıra dışı gelen olay uygulanır ama "bilinen" ardışık ilerler; delik dolunca atlar', () => {
        const tel = uret(bosGunluk(TEL), 3);
        let tab = bosGunluk(TAB);
        tab = gelenleriAl(tab, [tel.olaylar[0], tel.olaylar[2]], T0).gunluk;
        expect(tab.bilinen[TEL]).toBe(1);
        // Karşı tarafa "1'i biliyorum" denir → 2 ve 3 yeniden gelir; 3 zaten var, yalnız 2 yeni.
        const r = gelenleriAl(tab, gonderilecekler(tel.g, tab.bilinen), T0);
        expect(r.yeniler.map((o) => o.seq)).toEqual([2]);
        expect(r.gunluk.bilinen[TEL]).toBe(3);
    });

    it('dedikodu: tabletin telefondan aldığı olay üçüncü cihaza da gider', () => {
        const tel = uret(bosGunluk(TEL), 1);
        const tab = gelenleriAl(bosGunluk(TAB), tel.olaylar, T0).gunluk;
        const ucuncu = bosGunluk('cccccccccccccccc');
        expect(gonderilecekler(tab, ucuncu.bilinen).map((o) => o.id)).toEqual([`${TEL}:1`]);
    });

    it('kurcalanmış olay reddedilir: kimlik/seq uyuşmazlığı, yabancı HLC, bilinmeyen tür, geçersiz vakit', () => {
        const { olaylar } = uret(bosGunluk(TEL), 1);
        const o = olaylar[0] as unknown as Record<string, unknown>;
        expect(olayNormalize({ ...o, id: `${TEL}:9` })).toBeNull();
        expect(olayNormalize({ ...o, hlc: hlcYaz({ ms: T0, sayac: 0, cihaz: TAB }) })).toBeNull();
        expect(olayNormalize({ ...o, tur: 'ertele' })).toBeNull();
        expect(olayNormalize({ ...o, vakit: 'sabah' })).toBeNull();
        expect(olayNormalize({ ...o, seq: 0, id: `${TEL}:0` })).toBeNull();
    });

    it('günlük tavanı: en eski olaylar düşer', () => {
        const { g } = uret(bosGunluk(TEL), GUNLUK_AZAMI_OLAY + 5);
        expect(g.olaylar.length).toBe(GUNLUK_AZAMI_OLAY);
        expect(g.olaylar[0].seq).toBe(6);
        expect(g.seq).toBe(GUNLUK_AZAMI_OLAY + 5);
    });

    it('normalize: kendi seq geri gidemez; başka cihazın günlüğü kabul edilmez', () => {
        const { g } = uret(bosGunluk(TEL), 3);
        const bozuk = { ...g, seq: 1 };
        expect(gunlukNormalize(JSON.parse(JSON.stringify(bozuk)), TEL)?.seq).toBe(3);
        expect(gunlukNormalize(JSON.parse(JSON.stringify(g)), TAB)).toBeNull();
        expect(gunlukNormalize('bozuk', TEL)).toBeNull();
    });
});

describe('uygulama', () => {
    it('kildim → kuyruk, kaza hareketi → G-Set, hepsi tek turda', async () => {
        let tel = bosGunluk(TEL);
        tel = olayOlustur(tel, { tur: 'kildim', tarih: '2026-10-21', vakit: 'ikindi' }, T0).gunluk;
        tel = olayOlustur(tel, { tur: 'kazaHareket', hareket: { id: 'h1', kaynak: 'kilindi', vakit: 'ogle', adet: 1, zaman: 1 } }, T0 + 1).gunluk;
        const r = gelenleriAl(bosGunluk(TAB), tel.olaylar, T0 + 2);
        const { kayit, hedef } = sahteHedef();
        const u = await olaylariUygula(r.yeniler, hedef, r.gunluk.ayarHlc);
        expect(kayit.kildim).toEqual(['2026-10-21_ikindi']);
        expect(kayit.kaza).toEqual([{ id: 'h1', kaynak: 'kilindi', vakit: 'ogle', adet: 1, zaman: 1 }]);
        expect(u.hatalar).toBe(0);
    });

    it('ayar LWW (HLC): daha yeni yerel ayar eski gelenle EZİLMEZ; paketteki en yenisi kazanır', async () => {
        let tab = bosGunluk(TAB);
        let tel = bosGunluk(TEL);
        tel = olayOlustur(tel, { tur: 'ayar', anahtar: 'MEZHEP_AYARI', deger: 'hanefi' }, T0).gunluk;
        tel = olayOlustur(tel, { tur: 'ayar', anahtar: 'MEZHEP_AYARI', deger: 'safii' }, T0 + 1).gunluk;
        // Tablet aynı ayarı DAHA SONRA değiştirmiş:
        tab = olayOlustur(tab, { tur: 'ayar', anahtar: 'MEZHEP_AYARI', deger: 'hanefi' }, T0 + 10).gunluk;
        const r = gelenleriAl(tab, tel.olaylar, T0 + 11);
        const { kayit, hedef } = sahteHedef();
        await olaylariUygula(r.yeniler, hedef, r.gunluk.ayarHlc);
        expect(kayit.ayar).toEqual([]);

        const bos = gelenleriAl(bosGunluk('cccccccccccccccc'), tel.olaylar, T0 + 11);
        const s2 = sahteHedef();
        const u = await olaylariUygula(bos.yeniler, s2.hedef, bos.gunluk.ayarHlc);
        expect(s2.kayit.ayar).toEqual([['MEZHEP_AYARI', 'safii']]);
        expect(ayarKazanirMi(u.ayarHlc.MEZHEP_AYARI, tel.olaylar[0].hlc)).toBe(false);
    });

    it('bir hedef fırlatsa da diğerleri uygulanır; başarısız ayarın HLC kaydı yazılmaz', async () => {
        let tel = bosGunluk(TEL);
        tel = olayOlustur(tel, { tur: 'ayar', anahtar: 'X_AYARI', deger: 1 }, T0).gunluk;
        tel = olayOlustur(tel, { tur: 'kildim', tarih: '2026-10-21', vakit: 'aksam' }, T0 + 1).gunluk;
        const r = gelenleriAl(bosGunluk(TAB), tel.olaylar, T0 + 2);
        const kildim: string[] = [];
        const u = await olaylariUygula(r.yeniler, {
            kildim: async (t, v) => void kildim.push(`${t}_${v}`),
            kazaHareketleri: async () => undefined,
            ayar: async () => {
                throw new Error('disk');
            },
        }, {});
        expect(kildim).toEqual(['2026-10-21_aksam']);
        expect(u.hatalar).toBe(1);
        expect(u.ayarHlc.X_AYARI).toBeUndefined();
    });
});

describe('tel biçimi ve bulut birleşimi', () => {
    it('kildim olayı TV ayrıştırıcısının okuduğu düz alanları taşır (id ≤ 64, tarih, vakit)', () => {
        const { olaylar } = uret(bosGunluk(TEL), 1);
        const duz = JSON.parse(yukuYaz({ v: 2, olaylar }));
        expect(duz.olaylar[0]).toMatchObject({ id: `${TEL}:1`, tur: 'kildim', tarih: '2026-10-21', vakit: 'ogle' });
        expect(duz.olaylar[0].id.length).toBeLessThanOrEqual(64);
    });

    it('olaylariBirlestir: iki cihazın kümesinin birleşimi sıradan bağımsız aynı sonucu verir', () => {
        const a = uret(bosGunluk(TEL), 3).olaylar;
        const b = uret(bosGunluk(TAB), 2).olaylar;
        const ab = olaylariBirlestir(a, b).map((o) => o.id);
        expect(olaylariBirlestir(b, [...a, ...a]).map((o) => o.id)).toEqual(ab);
        expect(ab).toHaveLength(5);
    });
});
