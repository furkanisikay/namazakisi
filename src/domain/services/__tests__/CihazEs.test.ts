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
jest.mock('../TvSenkronServisi', () => ({
    dunBugunKilinanlar: () => mockKilinanlar(),
    yerelAgVarMi: async () => true,
    geriCekilmeMs: (h: number) => (h <= 0 ? 0 : 30_000 * 2 ** (h - 1)),
}));
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

    it('eş yeniden başladıysa: kimliği doğrulanmış istek eşin GÜNCEL ip + portunu kaydeder', async () => {
        const { tablet, anahtar } = await eslesmisKur();
        const duz = yukuYaz({ v: 2, olaylar: [], bilinen: {}, port: 48001 });
        const s = CihazEsServisi.getInstance();
        expect((await s.istegeYanit('/esitle', telefonZarfi(tablet, anahtar, 1, duz), '192.168.1.77')).kod).toBe(200);
        expect((await CihazAgiDeposu.liste())[0]).toMatchObject({ adres: '192.168.1.77', port: 48001 });
        // Yerel olmayan ip ile adres DEĞİŞMEZ.
        await s.istegeYanit('/esitle', telefonZarfi(tablet, anahtar, 2, duz), '8.8.8.8');
        expect((await CihazAgiDeposu.liste())[0].adres).toBe('192.168.1.77');
    });

    it('PİL: ulaşılamayan eş üstel geri çekilir — bekleme süresince denenmez', async () => {
        await eslesmisKur();
        mockGonder.mockRejectedValue(new Error('zaman aşımı'));
        const s = CihazEsServisi.getInstance();
        expect(await s.esitle()).toEqual({ [TEL]: 'ulasilamadi' });
        expect((await CihazAgiDeposu.liste())[0].hataSayisi).toBe(1);
        mockGonder.mockClear();
        expect(await s.esitle()).toEqual({ [TEL]: 'ulasilamadi' });
        expect(mockGonder).not.toHaveBeenCalled();
    });

    it('dinleyici ön planda ve yalnız eş/oturum varken açılır', async () => {
        const s = CihazEsServisi.getInstance();
        expect(await s.dinlemeyiBaslat()).toBeNull();
        await eslesmisKur();
        expect(await s.dinlemeyiBaslat()).toBe(47555);
    });

    it('arka planda dinleyici açılmaz; köprü yoksa da açılmaz', async () => {
        const s = CihazEsServisi.getInstance();
        await eslesmisKur();
        Object.defineProperty(AppState, 'currentState', { value: 'background', configurable: true, writable: true });
        expect(await s.dinlemeyiBaslat()).toBeNull();
        Object.defineProperty(AppState, 'currentState', { value: 'active', configurable: true, writable: true });
        kopru.androidDinleyici.mockReturnValue(null);
        expect(await s.dinlemeyiBaslat(true)).toBeNull();
    });

    it('native olay → yanıt köprüye yazılır (bilinmeyen yol 400, bozuk gövde sessiz 403); durdurma aboneliği kaldırır', async () => {
        const s = CihazEsServisi.getInstance();
        await s.dinlemeyiDurdur();
        let olay: ((i: { id: string; yol: string; govde: string }) => void) | null = null;
        const kaldir = jest.fn();
        const yanitla = jest.fn(async () => undefined);
        kopru.androidDinleyici.mockReturnValue({
            dinleyiciBaslat: jest.fn(async () => 47555),
            dinleyiciDurdur: jest.fn(async () => undefined),
            dinleyiciYanitla: yanitla,
            yerelAdres: jest.fn(async () => '192.168.1.50'),
            addListener: jest.fn((_o: string, cb: typeof olay) => {
                olay = cb;
                return { remove: kaldir };
            }),
        });
        await s.dinlemeyiBaslat(true);
        expect(s.dinlemePortu()).toBe(47555);
        olay!({ id: 'i1', yol: '/bilinmeyen', govde: '{}' });
        olay!({ id: 'i2', yol: '/esitle', govde: 'bozuk' });
        await new Promise((c) => setTimeout(c, 20));
        expect(yanitla).toHaveBeenCalledWith('i1', 400, '');
        expect(yanitla).toHaveBeenCalledWith('i2', 403, '');
        await s.dinlemeyiDurdur();
        expect(kaldir).toHaveBeenCalled();
        expect(s.dinlemePortu()).toBeNull();
    });

    it('eşleşme: oturum yokken / süresi dolmuşken /esle sessiz 403; ikinci farklı istek 409', async () => {
        const s = CihazEsServisi.getInstance();
        expect((await s.istegeYanit('/esle', '{}')).kod).toBe(403);
        const o = (await s.eslesmeOturumuAc())!;
        const istek = (ist: string, kimlik = TEL) => {
            const iv = new Uint8Array(12).fill(2);
            return JSON.stringify({ v: 2, iv: base64Yaz(iv), ct: sifrele(o.sir, iv, esleIstekAad(o.kimlik), JSON.stringify({ cihaz: 'X', ist, kimlik, adres: '8.8.8.8', port: 80 })) });
        };
        expect((await s.istegeYanit('/esle', istek('1111111111111111'))).kod).toBe(202);
        expect((await s.istegeYanit('/esle', istek('2222222222222222'))).kod).toBe(409);
        // Geçersiz kimlik biçimi: sessiz 403.
        expect((await s.istegeYanit('/esle', istek('1111111111111111', 'kisa'))).kod).toBe(403);
        // D-06: yerel olmayan adres kaydedilmez.
        await s.eslesmeyiYanitla(true);
        expect((await CihazAgiDeposu.liste())[0]).toMatchObject({ adres: '', port: 0 });
        const simdi = Date.now();
        jest.spyOn(Date, 'now').mockReturnValue(simdi + 4 * 60_000);
        expect((await s.istegeYanit('/esle-durum', JSON.stringify({ ist: '1111111111111111' }))).kod).toBe(403);
    });

    it('kaldırma: eşe şifreli "sil" gider, yerelde silinir; eş "sil" yollarsa üyelik düşer', async () => {
        const { tablet, anahtar } = await eslesmisKur();
        let giden = '';
        mockGonder.mockImplementation(async (_a: string, _p: number, _y: string, govde: string) => {
            const g = JSON.parse(govde);
            giden = coz(anahtar, g.iv, kanalAad(TEL, tablet, g.n), g.ct) ?? '';
            return { kod: 200, govde: '' };
        });
        const s = CihazEsServisi.getInstance();
        await s.kaldir(TEL);
        expect(JSON.parse(giden)).toEqual({ v: 2, sil: true });
        expect(await CihazAgiDeposu.liste()).toEqual([]);

        const ikinci = await eslesmisKur();
        expect((await s.istegeYanit('/esitle', telefonZarfi(ikinci.tablet, ikinci.anahtar, 1, yukuYaz({ v: 2, sil: true })))).kod).toBe(200);
        expect(await CihazAgiDeposu.liste()).toEqual([]);
    });

    it('eşe 403 → üyelik "reddedildi" ve bir daha denenmez', async () => {
        await eslesmisKur();
        mockGonder.mockResolvedValue({ kod: 403, govde: '' });
        const s = CihazEsServisi.getInstance();
        expect(await s.esitle()).toEqual({ [TEL]: 'reddedildi' });
        mockGonder.mockClear();
        expect(await s.esitle()).toEqual({});
        expect(mockGonder).not.toHaveBeenCalled();
    });

    it('kılınmışlık değişince (yuva "cihazEs") kısa beklemeyle tek eşitleme; tür ve köprü varlığı', async () => {
        jest.useFakeTimers();
        try {
            const { kayitDegistiDinleyicisiEkle } = require('../../../data/local/LocalNamazServisi');
            const s = CihazEsServisi.getInstance();
            const esitle = jest.spyOn(s, 'esitle').mockResolvedValue({});
            s.baslat();
            s.baslat();
            const cagri = (kayitDegistiDinleyicisiEkle as jest.Mock).mock.calls.filter((c) => c[0] === 'cihazEs');
            expect(cagri).toHaveLength(1);
            cagri[0][1]();
            cagri[0][1]();
            jest.advanceTimersByTime(1600);
            expect(esitle).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
        }
        const { buCihazinTuru, cihazAgiDinleyicisiVarMi } = require('../CihazEsServisi');
        expect(['tablet', 'telefon']).toContain(buCihazinTuru());
        expect(cihazAgiDinleyicisiVarMi()).toBe(true);
    });
});

describe('varsayılan olay hedefleri', () => {
    it('Android: gelen kıldım WearSenkron.cihazdanKildimEkle ile ortak kuyruğa; iOS: Siri kuyruğu', async () => {
        const { NativeModules } = require('react-native');
        const ekle = jest.fn(async () => true);
        NativeModules.WearSenkron = { cihazdanKildimEkle: ekle };
        const { VARSAYILAN_HEDEFLER } = require('../CihazEsServisi');
        await VARSAYILAN_HEDEFLER.kildim('2026-10-21', 'ogle');
        expect(ekle).toHaveBeenCalledWith('2026-10-21', 'ogle');

        jest.replaceProperty(Platform, 'OS', 'ios');
        const siri = require('expo-siri-kisayollari');
        const iosEkle = jest.fn(async () => true);
        siri.siriKildimKuyrugu.mockReturnValueOnce({ cihazdanKildimEkle: iosEkle });
        await VARSAYILAN_HEDEFLER.kildim('2026-10-21', 'ikindi');
        expect(iosEkle).toHaveBeenCalledWith('2026-10-21', 'ikindi');
        await VARSAYILAN_HEDEFLER.ayar('X', 1);
    });
});
