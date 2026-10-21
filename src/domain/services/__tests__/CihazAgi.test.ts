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
});
