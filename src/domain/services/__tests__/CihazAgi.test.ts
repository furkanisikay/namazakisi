/**
 * Cihaz ağı (telefon tarafı): eşleştirme v2 + TV'ye durum gönderimi. Taşıma (`yereleGonder`)
 * sahte bir TV ile değiştirilir; sahte TV, telefonun şifrelediğini GERÇEK kanal koduyla çözer.
 * (Kotlin alıcının aynı baytları çözdüğü ortak fikstürle ayrıca kanıtlı: CihazAgiTest.kt.)
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { base64Coz, base64UrlCoz, base64Yaz, coz, esleIstekAad, esleYanitAad, kanalAad, sifrele } from '../../../core/cihazAgi/kanal';
import { eslesmeQrCoz } from '../../../core/cihazAgi/eslesme';
import { CihazAgiDeposu } from '../../../data/local/CihazAgiDeposu';

const mockGonder = jest.fn();
jest.mock('../CihazAgiTasima', () => {
    let s = 0;
    return {
        yereleGonder: (...a: unknown[]) => mockGonder(...a),
        rastgeleBaytlar: (n: number) => Uint8Array.from({ length: n }, (_v, i) => (i * 13 + s++) & 0xff),
    };
});
jest.mock('@react-native-community/netinfo', () => {
    const fetch = jest.fn(async () => ({ isConnected: true, type: 'wifi' }));
    return { __esModule: true, default: { fetch }, fetch };
});
jest.mock('../../../data/local/LocalNamazServisi', () => ({
    kayitDegistiDinleyicisiEkle: jest.fn(),
    kilinanVakitleriAl: jest.fn(async () => []),
    localTarihAraligindakiNamazlariGetir: jest.fn(async () => ({ basarili: true, veri: [] })),
}));
jest.mock('../../../data/local/LocalOzelGunOkuyucu', () => ({ ozelGunSuzgeciniOku: jest.fn(async () => () => false) }));
jest.mock('../../../data/local/LocalCumaHatirlatmaServisi', () => ({ LocalCumaHatirlatmaServisi: { getAyarlar: jest.fn(async () => ({ aktif: true })) } }));
jest.mock('../../../data/local/LocalCamiyeGitServisi', () => ({ LocalCamiyeGitServisi: { getAyarlar: jest.fn(async () => ({ yurumeDk: 15, hazirlikDk: 10 })) } }));

const kopru = require('../../../../modules/expo-tv-esleme/src');
const secure = require('expo-secure-store');

const TV = '0123456789abcdef';
const SIR = 'AwoRGB8mLTQ7QklQV15lbHN6gYiPlp2kq7K5wMfO1dw';
const QR = `namazakisi://tv?v=2&a=192.168.1.23&p=47123&i=${TV}&s=${SIR}&d=Salon%20TV`;
const ANAHTAR = new Uint8Array(32).fill(7);

/** TV'nin davranışını taklit eder (protokol: core/cihazAgi + AliciMantigi.kt). */
function sahteTv(onayaKadarYoklama = 2) {
    let ist = '';
    let yoklama = 0;
    let sonN = 0;
    const alinan: string[] = [];
    mockGonder.mockImplementation(async (_a: string, _p: number, yol: string, govde: string) => {
        const g = JSON.parse(govde);
        if (yol === '/esle') {
            const duz = coz(base64UrlCoz(SIR), g.iv, esleIstekAad(TV), g.ct);
            if (!duz) return { kod: 403, govde: '' };
            ist = JSON.parse(duz).ist;
            return { kod: 202, govde: '{"durum":"bekliyor"}' };
        }
        if (yol === '/esle-durum') {
            if (g.ist !== ist) return { kod: 403, govde: '' };
            yoklama++;
            const ic = yoklama < onayaKadarYoklama ? { durum: 'bekliyor' } : { durum: 'onay', u: 'fedcba9876543210', k: base64Yaz(ANAHTAR), tvAdi: 'Salon TV' };
            const iv = new Uint8Array(12).fill(yoklama);
            return { kod: 200, govde: JSON.stringify({ iv: base64Yaz(iv), ct: sifrele(base64UrlCoz(SIR), iv, esleYanitAad(TV, ist), JSON.stringify(ic)) }) };
        }
        // /esitle
        if (g.n <= sonN) return { kod: 403, govde: '' };
        const duz = coz(ANAHTAR, g.iv, kanalAad(TV, g.u, g.n), g.ct);
        if (!duz) return { kod: 403, govde: '' };
        sonN = g.n;
        alinan.push(duz);
        return { kod: 200, govde: '{}' };
    });
    return { alinan };
}

beforeEach(async () => {
    jest.clearAllMocks();
    secure.__sifirla?.();
    await AsyncStorage.clear();
    jest.replaceProperty(Platform, 'OS', 'android');
    await AsyncStorage.setItem(
        '@namaz_akisi/konum_ayarlari',
        JSON.stringify({ konumModu: 'oto', gpsAdres: { ilce: 'Kadıköy', il: 'İstanbul' }, koordinatlar: { lat: 40.990312, lng: 29.029111 } }),
    );
});
afterEach(() => jest.restoreAllMocks());

const hizli = { bekle: async () => undefined };

describe('eşleştirme v2', () => {
    it('kumanda onayına kadar yoklar; onayda üye anahtarı secure-store\'a yazılır (varsayılan: durum SAYILMAZ)', async () => {
        sahteTv(3);
        const { esles } = require('../CihazEslesmeServisi');
        expect(await esles(eslesmeQrCoz(QR)!, hizli)).toBe('onay');
        const [u] = await CihazAgiDeposu.liste();
        expect(u).toMatchObject({ aliciKimlik: TV, aliciAdi: 'Salon TV', uye: 'fedcba9876543210', adres: '192.168.1.23', port: 47123, n: 0, durumumSayilsin: false });
        expect(Array.from(base64Coz(u.anahtar))).toEqual(Array.from(ANAHTAR));
        // Anahtar AsyncStorage'a DÜZ yazılmadı.
        const ham = JSON.stringify(await AsyncStorage.multiGet(await AsyncStorage.getAllKeys()));
        expect(ham).not.toContain(base64Yaz(ANAHTAR));
    });

    it('yanlış/eskimiş sır: TV sessiz 403 → "geçersiz", hiçbir şey kaydedilmez', async () => {
        mockGonder.mockResolvedValue({ kod: 403, govde: '' });
        const { esles } = require('../CihazEslesmeServisi');
        expect(await esles(eslesmeQrCoz(QR)!, hizli)).toBe('gecersiz');
        expect(await CihazAgiDeposu.liste()).toEqual([]);
    });
});

describe('TV durum gönderimi', () => {
    const eslesmisKur = async () => {
        await CihazAgiDeposu.kaydet({
            tur: 'tv', aliciKimlik: TV, aliciAdi: 'Salon TV', uye: 'fedcba9876543210', anahtar: base64Yaz(ANAHTAR),
            adres: '192.168.1.23', port: 47123, n: 0, durumumSayilsin: true, tvHatirlat: true, eklenmeMs: 0, sonEsitlemeMs: 0, durum: 'tamam',
        });
    };

    it('şifreli yük TV\'de çözülür; konum ~1 km\'ye yuvarlanır; aynı içerik ikinci kez GİTMEZ', async () => {
        const tv = sahteTv();
        await eslesmisKur();
        const { TvSenkronServisi } = require('../TvSenkronServisi');
        const s = TvSenkronServisi.getInstance();
        expect(await s.gonder()).toEqual({ [TV]: 'tamam' });
        const yuk = JSON.parse(tv.alinan[0]);
        expect(yuk.durum).toMatchObject({ ad: 'Kadıköy, İstanbul', konum: { lat: 40.99, lng: 29.03 }, durumumSayilsin: true, cuma: { aktif: true, cikisDk: 25 } });
        expect(await s.gonder()).toEqual({ [TV]: 'ayni' });
        expect(tv.alinan).toHaveLength(1);
        // Sayaç diskte ilerledi (çökme → tekrar değil atlama).
        expect((await CihazAgiDeposu.liste())[0].n).toBe(1);
    });

    it('TV bu telefonu kaldırdıysa (403) üyelik "reddedildi" olur ve bir daha denenmez', async () => {
        await eslesmisKur();
        mockGonder.mockResolvedValue({ kod: 403, govde: '' });
        const { TvSenkronServisi } = require('../TvSenkronServisi');
        expect(await TvSenkronServisi.getInstance().gonder(true)).toEqual({ [TV]: 'reddedildi' });
        expect((await CihazAgiDeposu.liste())[0].durum).toBe('reddedildi');
        mockGonder.mockClear();
        await TvSenkronServisi.getInstance().gonder(true);
        expect(mockGonder).not.toHaveBeenCalled();
    });

    it('PİL: ulaşılamayan TV üstel geri çekilir — bekleme içinde denenmez, "zorla" atlar, başarı sıfırlar', async () => {
        await eslesmisKur();
        mockGonder.mockRejectedValue(new Error('zaman aşımı'));
        const { TvSenkronServisi, geriCekilmeMs } = require('../TvSenkronServisi');
        // İlk tur zorlanır (önceki testlerin özet tekilleştirmesi "ayni" demesin).
        expect(await TvSenkronServisi.getInstance().gonder(true)).toEqual({ [TV]: 'ulasilamadi' });
        expect((await CihazAgiDeposu.liste())[0].hataSayisi).toBe(1);
        mockGonder.mockClear();
        expect(await TvSenkronServisi.getInstance().gonder()).toEqual({ [TV]: 'atlandi' });
        expect(mockGonder).not.toHaveBeenCalled();
        mockGonder.mockResolvedValue({ kod: 200, govde: '' });
        expect(await TvSenkronServisi.getInstance().gonder(true)).toEqual({ [TV]: 'tamam' });
        expect((await CihazAgiDeposu.liste())[0].hataSayisi).toBe(0);
        expect([geriCekilmeMs(1), geriCekilmeMs(3), geriCekilmeMs(40)]).toEqual([30_000, 120_000, 60 * 60_000]);
    });

    it('adres düştüyse mDNS ile bulunan adrese denenir; adres YALNIZ başarıdan sonra güncellenir', async () => {
        sahteTv();
        await eslesmisKur();
        const gercek = mockGonder.getMockImplementation()!;
        mockGonder.mockImplementation(async (a: string, ...geri: unknown[]) => {
            if (a === '192.168.1.23') throw new Error('ECONNREFUSED');
            return (gercek as (...x: unknown[]) => unknown)(a, ...geri);
        });
        kopru.alicilariBul.mockResolvedValue([{ i: TV, adres: '192.168.1.40', port: 50000 }]);
        const { TvSenkronServisi } = require('../TvSenkronServisi');
        expect(await TvSenkronServisi.getInstance().gonder(true)).toEqual({ [TV]: 'tamam' });
        expect((await CihazAgiDeposu.liste())[0]).toMatchObject({ adres: '192.168.1.40', port: 50000 });
    });

    it('sahte mDNS yanıtı (anahtar tutmuyor) adresi DEĞİŞTİREMEZ', async () => {
        await eslesmisKur();
        mockGonder.mockImplementation(async (a: string) => {
            if (a === '192.168.1.23') throw new Error('ECONNREFUSED');
            return { kod: 403, govde: '' };
        });
        kopru.alicilariBul.mockResolvedValue([{ i: TV, adres: '192.168.1.66', port: 50000 }]);
        const { TvSenkronServisi } = require('../TvSenkronServisi');
        await TvSenkronServisi.getInstance().gonder(true);
        expect((await CihazAgiDeposu.liste())[0].adres).toBe('192.168.1.23');
    });

    it('kaldırma: TV\'ye "sil" gider, sonra yerelde silinir', async () => {
        const tv = sahteTv();
        await eslesmisKur();
        const { TvSenkronServisi } = require('../TvSenkronServisi');
        await TvSenkronServisi.getInstance().kaldir(TV);
        expect(JSON.parse(tv.alinan[0])).toEqual({ v: 2, sil: true });
        expect(await CihazAgiDeposu.liste()).toEqual([]);
    });

    it('TV kapalıyken kaldırma yine yerelde siler (sil gönderilemese de)', async () => {
        await eslesmisKur();
        mockGonder.mockRejectedValue(new Error('ECONNREFUSED'));
        const { TvSenkronServisi } = require('../TvSenkronServisi');
        await TvSenkronServisi.getInstance().kaldir(TV);
        expect(await CihazAgiDeposu.liste()).toEqual([]);
    });

    it('Ramazan = iftar ya da sahur sayacı açık; konum kaydı yoksa yükte konum/ad yok', async () => {
        const tv = sahteTv();
        await eslesmisKur();
        await AsyncStorage.setItem('sahur_sayac_ayarlari', JSON.stringify({ aktif: true }));
        await AsyncStorage.removeItem('@namaz_akisi/konum_ayarlari');
        const { TvSenkronServisi } = require('../TvSenkronServisi');
        await TvSenkronServisi.getInstance().gonder(true);
        const d = JSON.parse(tv.alinan[0]).durum;
        expect(d.ramazan).toBe(true);
        expect(d.ad).toBeUndefined();
        expect(d.konum).toBeUndefined();
    });

    it('Wi-Fi/Ethernet yoksa hiç denenmez ("atlandi"); eşleşik TV yoksa boş tur', async () => {
        const { TvSenkronServisi } = require('../TvSenkronServisi');
        expect(await TvSenkronServisi.getInstance().gonder(true)).toEqual({});
        await eslesmisKur();
        const ni = require('@react-native-community/netinfo').default;
        ni.fetch.mockResolvedValueOnce({ isConnected: true, type: 'cellular' });
        expect(await TvSenkronServisi.getInstance().gonder(true)).toEqual({ [TV]: 'atlandi' });
        expect(mockGonder).not.toHaveBeenCalled();
    });

    it('kılınmışlık değişince (yuva "tv") kısa beklemeyle tek gönderim', async () => {
        jest.useFakeTimers();
        try {
            const { kayitDegistiDinleyicisiEkle } = require('../../../data/local/LocalNamazServisi');
            const { TvSenkronServisi } = require('../TvSenkronServisi');
            const s = TvSenkronServisi.getInstance();
            const gonder = jest.spyOn(s, 'gonder').mockResolvedValue({});
            s.baslat();
            s.baslat();
            const cagri = (kayitDegistiDinleyicisiEkle as jest.Mock).mock.calls.filter((c) => c[0] === 'tv');
            expect(cagri).toHaveLength(1);
            cagri[0][1]();
            cagri[0][1]();
            jest.advanceTimersByTime(1600);
            expect(gonder).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
        }
    });
});

describe('eşleştirme v2 — kenar durumlar', () => {
    it('telefon adı: iPhone; Android markadan', () => {
        const { telefonAdi } = require('../CihazEslesmeServisi');
        jest.replaceProperty(Platform, 'OS', 'ios');
        expect(telefonAdi()).toBe('iPhone');
        jest.replaceProperty(Platform, 'OS', 'android');
        const sabitler = jest.spyOn(Platform, 'constants', 'get');
        sabitler.mockReturnValue({ Brand: 'samsung' } as unknown as typeof Platform.constants);
        expect(telefonAdi()).toBe('Samsung telefon');
        sabitler.mockReturnValue({ Brand: '' } as unknown as typeof Platform.constants);
        expect(telefonAdi()).toBe('Android telefon');
    });

    it('TV ulaşılamaz → "ulasilamadi"; kullanıcı iptal ederse "iptal"; TV "Hayır" → "red"', async () => {
        const { esles } = require('../CihazEslesmeServisi');
        mockGonder.mockRejectedValueOnce(new Error('ECONNREFUSED'));
        expect(await esles(eslesmeQrCoz(QR)!, hizli)).toBe('ulasilamadi');

        sahteTv(99);
        expect(await esles(eslesmeQrCoz(QR)!, { ...hizli, iptalMi: () => true })).toBe('iptal');

        mockGonder.mockImplementation(async (_a: string, _p: number, yol: string, govde: string) => {
            const g = JSON.parse(govde);
            if (yol === '/esle') return { kod: 202, govde: '' };
            const iv = new Uint8Array(12).fill(4);
            return { kod: 200, govde: JSON.stringify({ iv: base64Yaz(iv), ct: sifrele(base64UrlCoz(SIR), iv, esleYanitAad(TV, g.ist), JSON.stringify({ durum: 'red' })) }) };
        });
        expect(await esles(eslesmeQrCoz(QR)!, hizli)).toBe('red');
    });

    it('bozuk yanıt "gecersiz", süre dolarsa "zamanAsimi", beklenmeyen kod "ulasilamadi"', async () => {
        const { esles } = require('../CihazEslesmeServisi');
        mockGonder.mockImplementation(async (_a: string, _p: number, yol: string) => (yol === '/esle' ? { kod: 202, govde: '' } : { kod: 200, govde: 'bozuk' }));
        expect(await esles(eslesmeQrCoz(QR)!, hizli)).toBe('gecersiz');
        mockGonder.mockImplementation(async (_a: string, _p: number, yol: string) => (yol === '/esle' ? { kod: 202, govde: '' } : { kod: 403, govde: '' }));
        expect(await esles(eslesmeQrCoz(QR)!, hizli)).toBe('zamanAsimi');
        mockGonder.mockImplementation(async () => ({ kod: 500, govde: '' }));
        expect(await esles(eslesmeQrCoz(QR)!, hizli)).toBe('ulasilamadi');
        let t = 0;
        mockGonder.mockImplementation(async (_a: string, _p: number, yol: string) => (yol === '/esle' ? { kod: 202, govde: '' } : Promise.reject(new Error('x'))));
        expect(await esles(eslesmeQrCoz(QR)!, { bekle: async () => undefined, simdi: () => (t += 60_000) })).toBe('zamanAsimi');
    });
});
