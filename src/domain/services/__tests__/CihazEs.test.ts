/**
 * Çift yönlü cihaz ağı (telefon ↔ tablet). Bu cihaz = QR'ı GÖSTEREN tablet; karşı taraf (telefon)
 * GERÇEK kanal koduyla taklit edilir: eşleştirme iki uçta onay, olay günlüğü teslimi, yanıtla geri
 * dönen eksikler, tekrar/yanlış anahtar sessiz 403, gelen kıldım → ortak kuyruk hedefi.
 */
import { AppState, Platform } from 'react-native';
import { base64Coz, base64Yaz, coz, esleIstekAad, esleYanitAad, kanalAad, sifrele } from '../../../core/cihazAgi/kanal';
import { bosGunluk, olayOlustur } from '../../../core/cihazAgi/olayGunlugu';
import { yukCoz, yukuYaz } from '../../../core/cihazAgi/yuk';
import { cihazQrYaz, eslesmeQrCoz } from '../../../core/cihazAgi/eslesme';
import { CihazAgiDeposu } from '../../../data/local/CihazAgiDeposu';

const mockGonder = jest.fn();
jest.mock('../CihazAgiTasima', () => {
    let s = 0;
    return {
        yereleGonder: (...a: unknown[]) => mockGonder(...a),
        rastgeleBaytlar: (n: number) => Uint8Array.from({ length: n }, (_v, i) => (i * 29 + s++ * 7) & 0xff),
    };
});
const mockKilinanlar = jest.fn(async (): Promise<Record<string, string[]>> => ({}));
jest.mock('../TvSenkronServisi', () => ({ dunBugunKilinanlar: () => mockKilinanlar() }));
jest.mock('../../../data/local/LocalNamazServisi', () => ({ kayitDegistiDinleyicisiEkle: jest.fn() }));
jest.mock('../KildimKuyruguServisi', () => ({ KildimKuyruguServisi: { getInstance: () => ({ bekleyenleriIsle: async () => undefined }) } }));

const kopru = require('../../../../modules/expo-tv-esleme/src');
const TEL = 'aaaaaaaaaaaaaaaa';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CihazEsServisi, yanitAad } from '../CihazEsServisi';
const kildimler: string[] = [];

beforeEach(async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    Object.defineProperty(AppState, 'currentState', { value: 'active', configurable: true, writable: true });
    require('expo-secure-store').__sifirla?.();
    await AsyncStorage.clear();
    kopru.androidDinleyici.mockReturnValue({
        dinleyiciBaslat: jest.fn(async () => 47555),
        dinleyiciDurdur: jest.fn(async () => undefined),
        dinleyiciYanitla: jest.fn(async () => undefined),
        yerelAdres: jest.fn(async () => '192.168.1.50'),
        addListener: jest.fn(() => ({ remove: jest.fn() })),
    });
    mockKilinanlar.mockResolvedValue({});
    kildimler.length = 0;
    CihazEsServisi.getInstance().eslesmeOturumunuKapat();
    CihazEsServisi.getInstance().hedefleriAyarla({
        kildim: async (t, v) => void kildimler.push(`${t}_${v}`),
        kazaHareketleri: async () => undefined,
        ayar: async () => undefined,
    });
});

afterAll(() => kopru.androidDinleyici.mockReturnValue(null));

/** Telefonun eşleştirme isteği; oturumdan dönen bilgilerle. */
async function eslesmisKur() {
    const s = CihazEsServisi.getInstance();
    const oturum = (await s.eslesmeOturumuAc())!;
    const qr = eslesmeQrCoz(cihazQrYaz({ adres: oturum.adres, port: oturum.port, aliciKimlik: oturum.kimlik, sir: oturum.sir, aliciAdi: 'Salon tableti', aliciTuru: 'tablet' }))!;
    expect(qr).toMatchObject({ tur: 'cihaz', aliciTuru: 'tablet', aliciKimlik: oturum.kimlik });
    const sorulan: string[] = [];
    s.istekDinleyicisi = (i) => i && sorulan.push(i.cihazAdi);
    const ist = '0123456789abcdef';
    const iv = new Uint8Array(12).fill(1);
    const govde = JSON.stringify({
        v: 2,
        iv: base64Yaz(iv),
        ct: sifrele(qr.sir, iv, esleIstekAad(qr.aliciKimlik), JSON.stringify({ cihaz: "Ahmet'in telefonu", ist, kimlik: TEL, adres: '192.168.1.60', port: 47600, tur: 'telefon' })),
    });
    expect((await s.istegeYanit('/esle', govde)).kod).toBe(202);
    expect(sorulan).toEqual(["Ahmet'in telefonu"]);
    // Onay gelmeden durum "bekliyor".
    const bekle = await s.istegeYanit('/esle-durum', JSON.stringify({ ist }));
    const bz = JSON.parse(bekle.govde);
    expect(JSON.parse(coz(qr.sir, bz.iv, esleYanitAad(qr.aliciKimlik, ist), bz.ct)!).durum).toBe('bekliyor');
    await s.eslesmeyiYanitla(true);
    const onay = await s.istegeYanit('/esle-durum', JSON.stringify({ ist }));
    const oz = JSON.parse(onay.govde);
    const sonuc = JSON.parse(coz(qr.sir, oz.iv, esleYanitAad(qr.aliciKimlik, ist), oz.ct)!);
    expect(sonuc).toMatchObject({ durum: 'onay', u: TEL });
    // Teslimden sonra sır tükenir: ikinci istek sessiz 403.
    expect((await s.istegeYanit('/esle', govde)).kod).toBe(403);
    return { tablet: oturum.kimlik, anahtar: base64Coz(sonuc.k) };
}

function telefonZarfi(tablet: string, anahtar: Uint8Array, n: number, duz: string) {
    const iv = new Uint8Array(12).fill(n);
    return JSON.stringify({ v: 2, u: TEL, n, iv: base64Yaz(iv), ct: sifrele(anahtar, iv, kanalAad(tablet, TEL, n), duz) });
}

describe('telefon ↔ tablet', () => {
    it('iki uçta onaylı eşleştirme: tabletin deposuna telefon "telefon" türüyle girer', async () => {
        await eslesmisKur();
        const u = (await CihazAgiDeposu.liste())[0];
        expect(u).toMatchObject({ tur: 'telefon', aliciKimlik: TEL, aliciAdi: "Ahmet'in telefonu", adres: '192.168.1.60', port: 47600 });
    });

    it('"Hayır": anahtar üretilmez, telefon red alır', async () => {
        const s = CihazEsServisi.getInstance();
        const o = (await s.eslesmeOturumuAc())!;
        const iv = new Uint8Array(12).fill(3);
        const ist = 'fedcba9876543210';
        await s.istegeYanit('/esle', JSON.stringify({ v: 2, iv: base64Yaz(iv), ct: sifrele(o.sir, iv, esleIstekAad(o.kimlik), JSON.stringify({ cihaz: 'X', ist, kimlik: TEL })) }));
        await s.eslesmeyiYanitla(false);
        const y = JSON.parse((await s.istegeYanit('/esle-durum', JSON.stringify({ ist }))).govde);
        expect(JSON.parse(coz(o.sir, y.iv, esleYanitAad(o.kimlik, ist), y.ct)!).durum).toBe('red');
        expect(await CihazAgiDeposu.liste()).toEqual([]);
    });

    it('gelen kıldım ortak kuyruğa gider; yanıt tabletin kendi olaylarını taşır; tekrar ve yanlış anahtar sessiz 403', async () => {
        const { tablet, anahtar } = await eslesmisKur();
        // Tablette de bir kıldım var (kayıttan türeyecek).
        mockKilinanlar.mockResolvedValue({ '2026-10-21': ['imsak'] });
        const telGunluk = olayOlustur(bosGunluk(TEL), { tur: 'kildim', tarih: '2026-10-21', vakit: 'ogle' }, Date.now());
        const duz = yukuYaz({ v: 2, olaylar: [telGunluk.olay!], bilinen: telGunluk.gunluk.bilinen });
        const s = CihazEsServisi.getInstance();
        const y = await s.istegeYanit('/esitle', telefonZarfi(tablet, anahtar, 1, duz));
        expect(y.kod).toBe(200);
        expect(kildimler).toEqual(['2026-10-21_ogle']);
        const z = JSON.parse(y.govde);
        const yanit = yukCoz(coz(anahtar, z.iv, yanitAad(TEL, tablet, 1), z.ct))!;
        expect(yanit.olaylar).toEqual([expect.objectContaining({ tur: 'kildim', tarih: '2026-10-21', vakit: 'imsak', cihaz: tablet })]);
        expect(yanit.bilinen[TEL]).toBe(1);
        // Aynı n tekrar: 403; aynı olay yeni n ile: 200 ama ikinci kez uygulanmaz.
        expect((await s.istegeYanit('/esitle', telefonZarfi(tablet, anahtar, 1, duz))).kod).toBe(403);
        expect((await s.istegeYanit('/esitle', telefonZarfi(tablet, anahtar, 2, duz))).kod).toBe(200);
        expect(kildimler).toEqual(['2026-10-21_ogle']);
        expect((await s.istegeYanit('/esitle', telefonZarfi(tablet, new Uint8Array(32).fill(9), 3, duz))).kod).toBe(403);
    });

    it('eşe gönderim: eksik aralık gider, yanıttaki olaylar uygulanır, karşının bildiği kaydedilir', async () => {
        const { tablet, anahtar } = await eslesmisKur();
        mockKilinanlar.mockResolvedValue({ '2026-10-21': ['aksam'] });
        const telGunluk = olayOlustur(bosGunluk(TEL), { tur: 'kildim', tarih: '2026-10-21', vakit: 'yatsi' }, Date.now());
        let giden: unknown[] = [];
        mockGonder.mockImplementation(async (_a: string, _p: number, yol: string, govde: string) => {
            const g = JSON.parse(govde);
            expect(yol).toBe('/esitle');
            const icerik = yukCoz(coz(anahtar, g.iv, kanalAad(TEL, tablet, g.n), g.ct))!;
            giden = icerik.olaylar;
            const iv = new Uint8Array(12).fill(5);
            const dz = yukuYaz({ v: 2, olaylar: [telGunluk.olay!], bilinen: { [tablet]: 1, [TEL]: 1 } });
            return { kod: 200, govde: JSON.stringify({ iv: base64Yaz(iv), ct: sifrele(anahtar, iv, yanitAad(tablet, TEL, g.n), dz) }) };
        });
        expect(await CihazEsServisi.getInstance().esitle()).toEqual({ [TEL]: 'tamam' });
        expect(giden).toEqual([expect.objectContaining({ vakit: 'aksam', cihaz: tablet })]);
        expect(kildimler).toEqual(['2026-10-21_yatsi']);
        const u = (await CihazAgiDeposu.liste())[0];
        expect(u.karsiBilinen).toEqual({ [tablet]: 1, [TEL]: 1 });
        // Eş zaten biliyor: ikinci turda olay gitmez; eşten gelen olayın yankısı da üretilmez.
        await CihazEsServisi.getInstance().esitle();
        expect(giden).toEqual([]);
    });

    it('dinleyici ön planda ve yalnız eş/oturum varken açılır', async () => {
        const s = CihazEsServisi.getInstance();
        expect(await s.dinlemeyiBaslat()).toBeNull();
        await eslesmisKur();
        expect(await s.dinlemeyiBaslat()).toBe(47555);
    });
});
