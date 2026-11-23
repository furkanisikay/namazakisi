/**
 * TurkiyeKonumServisi — davranışsal testler
 *
 * Singleton servis: il/ilçe verisini bellek cache → AsyncStorage cache → API → offline
 * sırasıyla çözer. Burada cache isabeti, bayat cache, API başarı/başarısızlık dalları,
 * offline fallback, koordinat eşleme edge'leri ve cache temizleme yan etkileri test edilir.
 *
 * Not: servis SINGLETON ve bellek-içi cache (illerCache/ilcelerCache) tutar →
 * her testten önce cacheTemizle() ile sıfırlanmalı, aksi halde testler sızar.
 */

import {
    TurkiyeKonumServisi,
    TURKIYE_ILLERI_OFFLINE,
} from '../TurkiyeKonumServisi';

// In-memory AsyncStorage mock (mock* öneki: jest.mock fabrikası closure'a erişebilsin)
const mockStore = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: {
        getItem: async (k: string) => (mockStore.has(k) ? mockStore.get(k)! : null),
        setItem: async (k: string, v: string) => {
            mockStore.set(k, v);
        },
        removeItem: async (k: string) => {
            mockStore.delete(k);
        },
        getAllKeys: async () => Array.from(mockStore.keys()),
        multiRemove: async (keys: string[]) => {
            keys.forEach((k) => mockStore.delete(k));
        },
    },
}));

// Logger'ı sustur (gürültü + olası yan etki testi kirletmesin)
jest.mock('../../../core/utils/Logger', () => ({
    Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const CACHE_ANAHTARI_ILLER = '@turkiye_iller';
const CACHE_ANAHTARI_ILCELER = '@turkiye_ilceler_';

// fetch mock yardımcıları
function fetchYanitOlustur(ok: boolean, json: unknown): Response {
    return {
        ok,
        json: async () => json,
    } as unknown as Response;
}

beforeEach(async () => {
    mockStore.clear();
    // Singleton bellek cache'ini sıfırla (cacheTemizle bellek + diski temizler)
    await TurkiyeKonumServisi.cacheTemizle();
    mockStore.clear();
});

afterEach(() => {
    jest.restoreAllMocks();
    delete (global as { fetch?: unknown }).fetch;
});

describe('TurkiyeKonumServisi.illeriGetir', () => {
    test('API başarısız ve cache yokken offline 81 ili döner', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('ağ hatası'));

        const iller = await TurkiyeKonumServisi.illeriGetir();

        expect(iller).toBe(TURKIYE_ILLERI_OFFLINE);
        expect(iller.length).toBe(81);
        expect(iller[0].ad).toBe('Adana');
    });

    test('API yanıtı ok değilse offline veriye düşer', async () => {
        global.fetch = jest
            .fn()
            .mockResolvedValue(fetchYanitOlustur(false, {}));

        const iller = await TurkiyeKonumServisi.illeriGetir();

        expect(iller).toBe(TURKIYE_ILLERI_OFFLINE);
    });

    test('API başarılıysa yanıtı eşler, plakaKoduyu 2 haneye tamamlar ve cache yazar', async () => {
        const apiYanit = {
            data: [
                {
                    id: 6,
                    name: 'Ankara',
                    areaCode: 6,
                    coordinates: { latitude: 39.93, longitude: 32.85 },
                },
            ],
        };
        global.fetch = jest
            .fn()
            .mockResolvedValue(fetchYanitOlustur(true, apiYanit));

        const iller = await TurkiyeKonumServisi.illeriGetir();

        expect(iller).toHaveLength(1);
        expect(iller[0]).toEqual({
            id: 6,
            ad: 'Ankara',
            plakaKodu: '06', // padStart(2,'0')
            lat: 39.93,
            lng: 32.85,
        });
        // Cache'e timestamp + data biçiminde yazılmış olmalı
        const yazilan = JSON.parse(mockStore.get(CACHE_ANAHTARI_ILLER)!);
        expect(yazilan.data).toHaveLength(1);
        expect(typeof yazilan.timestamp).toBe('number');
    });

    test('REGRESYON: plaka il kimliğinden gelir, telefon alan kodundan (areaCode) DEĞİL', async () => {
        // Gerçek API biçimi: areaCode telefon alan kodu, İstanbul'da dizi.
        global.fetch = jest.fn().mockResolvedValue(
            fetchYanitOlustur(true, {
                data: [
                    { id: 1, name: 'Adana', areaCode: 322, coordinates: { latitude: 37, longitude: 35.3 } },
                    { id: 34, name: 'İstanbul', areaCode: [212, 216], coordinates: { latitude: 41, longitude: 29 } },
                ],
            })
        );

        const iller = await TurkiyeKonumServisi.illeriGetir();
        expect(iller.map((i) => i.plakaKodu)).toEqual(['01', '34']);
        // Yalnız kullanılan alanlar istenir, yönlendirmesiz yeni adres
        expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe(
            'https://api.turkiyeapi.dev/v1/provinces?fields=id,name,coordinates'
        );
    });

    test('eski önbellekteki yanlış plaka (alan kodu) okurken düzeltilir', async () => {
        mockStore.set(
            CACHE_ANAHTARI_ILLER,
            JSON.stringify({
                timestamp: Date.now(),
                data: [{ id: 1, ad: 'Adana', plakaKodu: '322', lat: 37, lng: 35.3 }],
            })
        );
        global.fetch = jest.fn();

        const iller = await TurkiyeKonumServisi.illeriGetir();
        expect(iller[0].plakaKodu).toBe('01');
    });

    test('coordinates yoksa koordinat çevrimdışı tablodan gelir (0,0 DEĞİL; zarfsız dizi de okunur)', async () => {
        const apiYanit = [{ id: 6, name: 'Ankara', areaCode: 312 }]; // coordinates yok, bare array
        global.fetch = jest
            .fn()
            .mockResolvedValue(fetchYanitOlustur(true, apiYanit));

        const iller = await TurkiyeKonumServisi.illeriGetir();
        const ankara = TURKIYE_ILLERI_OFFLINE.find((il) => il.id === 6)!;

        expect(iller).toHaveLength(1);
        expect(iller[0].lat).toBe(ankara.lat);
        expect(iller[0].lng).toBe(ankara.lng);
        expect(iller[0].plakaKodu).toBe('06');
    });

    test('bellek cache sıcaksa ikinci çağrı API/fetch yapmaz', async () => {
        const fetchMock = jest
            .fn()
            .mockResolvedValue(fetchYanitOlustur(true, { data: [] }));
        global.fetch = fetchMock;

        await TurkiyeKonumServisi.illeriGetir(); // ilk çağrı: fetch 1 kez
        await TurkiyeKonumServisi.illeriGetir(); // ikinci: bellek cache → fetch yok

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    test('taze AsyncStorage cache varsa API çağrılmadan cache verisi döner', async () => {
        const cacheVeri = [
            { id: 1, ad: 'Adana', plakaKodu: '01', lat: 37.01, lng: 35.33 },
        ];
        mockStore.set(
            CACHE_ANAHTARI_ILLER,
            JSON.stringify({ timestamp: Date.now(), data: cacheVeri })
        );
        const fetchMock = jest.fn();
        global.fetch = fetchMock;

        const iller = await TurkiyeKonumServisi.illeriGetir();

        expect(iller).toEqual(cacheVeri);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    test('bayat AsyncStorage cache yok sayılır, API denenir', async () => {
        const bayatVeri = [
            { id: 1, ad: 'BayatIl', plakaKodu: '01', lat: 1, lng: 2 },
        ];
        mockStore.set(
            CACHE_ANAHTARI_ILLER,
            JSON.stringify({
                // 25 saat önce → CACHE_SURESI (24s) aşıldı
                timestamp: Date.now() - 25 * 60 * 60 * 1000,
                data: bayatVeri,
            })
        );
        global.fetch = jest
            .fn()
            .mockResolvedValue(
                fetchYanitOlustur(true, {
                    data: [
                        {
                            id: 2,
                            name: 'Adıyaman',
                            areaCode: 416,
                            coordinates: { latitude: 37.76, longitude: 38.28 },
                        },
                    ],
                })
            );

        const iller = await TurkiyeKonumServisi.illeriGetir();

        expect(iller).toHaveLength(1);
        expect(iller[0].id).toBe(2);
        expect(iller[0].lat).toBe(37.76);
    });

    test('bozuk AsyncStorage cache (geçersiz JSON) çökmeden API/offline yoluna devam eder', async () => {
        mockStore.set(CACHE_ANAHTARI_ILLER, '{bozuk-json');
        global.fetch = jest.fn().mockRejectedValue(new Error('ağ yok'));

        const iller = await TurkiyeKonumServisi.illeriGetir();

        // Cache parse patladı → catch → API patladı → offline
        expect(iller).toBe(TURKIYE_ILLERI_OFFLINE);
    });
});

describe('TurkiyeKonumServisi.ilGetirById / ilGetirByPlaka', () => {
    beforeEach(() => {
        global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    });

    test('ilGetirById var olan ID için ili döner', async () => {
        const il = await TurkiyeKonumServisi.ilGetirById(34);
        expect(il?.ad).toBe('İstanbul');
    });

    test('ilGetirById olmayan ID için null döner', async () => {
        const il = await TurkiyeKonumServisi.ilGetirById(9999);
        expect(il).toBeNull();
    });

    test('ilGetirByPlaka var olan plaka için ili döner', async () => {
        const il = await TurkiyeKonumServisi.ilGetirByPlaka('06');
        expect(il?.ad).toBe('Ankara');
    });

    test('ilGetirByPlaka olmayan plaka için null döner', async () => {
        const il = await TurkiyeKonumServisi.ilGetirByPlaka('00');
        expect(il).toBeNull();
    });
});

describe('TurkiyeKonumServisi.ilceleriGetir', () => {
    test('API başarılıysa ilçeleri eşler ve id yoksa index+1 kullanır', async () => {
        const apiYanit = {
            data: {
                coordinates: { latitude: 39.93, longitude: 32.85 },
                districts: [
                    {
                        id: 100,
                        name: 'Merkez',
                        coordinates: { latitude: 40.1, longitude: 32.9 },
                    },
                    // id yok → index+1 = 2; coordinates yok → il merkezine (çevrimdışı tablo) düşer
                    { name: 'KoordsuzIlce' },
                ],
            },
        };
        global.fetch = jest
            .fn()
            .mockResolvedValue(fetchYanitOlustur(true, apiYanit));

        const ilceler = await TurkiyeKonumServisi.ilceleriGetir(6);

        expect(ilceler).toHaveLength(2);
        expect(ilceler[0]).toEqual({
            id: 100,
            ilId: 6,
            ad: 'Merkez',
            lat: 40.1,
            lng: 32.9,
        });
        // id yoksa index+1, koordinatlar çevrimdışı il merkezine fallback
        const ankara = TURKIYE_ILLERI_OFFLINE.find((il) => il.id === 6)!;
        expect(ilceler[1]).toEqual({
            id: 2,
            ilId: 6,
            ad: 'KoordsuzIlce',
            lat: ankara.lat,
            lng: ankara.lng,
        });
    });

    test('districts hiç yoksa çevrimdışı ilçe listesine düşer ve önbelleğe YAZMAZ', async () => {
        global.fetch = jest
            .fn()
            .mockResolvedValue(fetchYanitOlustur(true, { data: {} }));

        const ilceler = await TurkiyeKonumServisi.ilceleriGetir(7);
        expect(ilceler.map((i) => i.ad)).toContain('Akseki');
        expect(mockStore.has(`${CACHE_ANAHTARI_ILCELER}7`)).toBe(false);
    });

    test('API ok değilse ÇEVRİMDIŞI ilçe listesine düşer (ilçe merkezleriyle)', async () => {
        global.fetch = jest
            .fn()
            .mockResolvedValue(fetchYanitOlustur(false, {}));

        const ilceler = await TurkiyeKonumServisi.ilceleriGetir(8);
        expect(ilceler.map((i) => i.ad)).toContain('Hopa');
        expect(ilceler.every((i) => i.ilId === 8)).toBe(true);
        // Çevrimdışı liste önbelleğe YAZILMAZ (ağ dönünce API kazansın)
        expect(mockStore.has(`${CACHE_ANAHTARI_ILCELER}8`)).toBe(false);
    });

    test('fetch fırlatırsa çevrimdışı ilçe listesine düşer', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('ağ yok'));

        const ilceler = await TurkiyeKonumServisi.ilceleriGetir(9);
        expect(ilceler.find((i) => i.ad === 'Kuşadası')).toBeDefined();
    });

    test('NÖBETÇİ: API ilçe koordinatı vermese de ilçe MERKEZİ döner, il merkezi değil', async () => {
        // Gerçek API biçimi (2026-10): ilçelerde `coordinates` YOK, yalnız ilde var.
        global.fetch = jest.fn().mockResolvedValue(
            fetchYanitOlustur(true, {
                data: {
                    coordinates: { latitude: 41.0082, longitude: 28.9784 },
                    districts: [{ id: 1622, name: 'Silivri' }],
                },
            })
        );

        const [silivri] = await TurkiyeKonumServisi.ilceleriGetir(34);
        expect(silivri.lng).toBeLessThan(28.5);
        expect(silivri.lng).not.toBe(28.9784);
    });

    test('eski sürümün önbelleğindeki il merkezi koordinatı okurken düzeltilir', async () => {
        mockStore.set(
            `${CACHE_ANAHTARI_ILCELER}34`,
            JSON.stringify({
                timestamp: Date.now(),
                data: [{ id: 1622, ilId: 34, ad: 'Silivri', lat: 41.0082, lng: 28.9784 }],
            })
        );
        global.fetch = jest.fn();

        const [silivri] = await TurkiyeKonumServisi.ilceleriGetir(34);
        expect(silivri.lng).toBeLessThan(28.5);
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test('bellek cache sıcaksa ikinci çağrı fetch yapmaz', async () => {
        const fetchMock = jest
            .fn()
            .mockResolvedValue(
                fetchYanitOlustur(true, {
                    data: { districts: [{ id: 1, name: 'A' }] },
                })
            );
        global.fetch = fetchMock;

        await TurkiyeKonumServisi.ilceleriGetir(10);
        await TurkiyeKonumServisi.ilceleriGetir(10);

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    test('taze AsyncStorage ilçe cache varsa fetch yapmadan döner', async () => {
        const ilId = 11;
        const cacheVeri = [{ id: 1, ilId, ad: 'CacheIlce', lat: 40.1, lng: 30.0 }];
        mockStore.set(
            `${CACHE_ANAHTARI_ILCELER}${ilId}`,
            JSON.stringify({ timestamp: Date.now(), data: cacheVeri })
        );
        const fetchMock = jest.fn();
        global.fetch = fetchMock;

        const ilceler = await TurkiyeKonumServisi.ilceleriGetir(ilId);

        expect(ilceler).toEqual(cacheVeri);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    test('bayat AsyncStorage ilçe cache yok sayılır, API denenir', async () => {
        const ilId = 12;
        mockStore.set(
            `${CACHE_ANAHTARI_ILCELER}${ilId}`,
            JSON.stringify({
                timestamp: Date.now() - 25 * 60 * 60 * 1000,
                data: [{ id: 1, ilId, ad: 'Bayat', lat: 0, lng: 0 }],
            })
        );
        global.fetch = jest
            .fn()
            .mockResolvedValue(
                fetchYanitOlustur(true, {
                    data: { districts: [{ id: 5, name: 'Taze' }] },
                })
            );

        const ilceler = await TurkiyeKonumServisi.ilceleriGetir(ilId);
        expect(ilceler).toHaveLength(1);
        expect(ilceler[0].ad).toBe('Taze');
    });
});

describe('TurkiyeKonumServisi.enYakinIliBul', () => {
    beforeEach(() => {
        global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    });

    test('İstanbul koordinatına en yakın il İstanbul döner', async () => {
        // İstanbul: 41.0082, 28.9784
        const il = await TurkiyeKonumServisi.enYakinIliBul(41.0082, 28.9784);
        expect(il?.ad).toBe('İstanbul');
    });

    test('Ankara koordinatına en yakın il Ankara döner', async () => {
        // Ankara: 39.9334, 32.8597
        const il = await TurkiyeKonumServisi.enYakinIliBul(39.93, 32.86);
        expect(il?.ad).toBe('Ankara');
    });
});

describe('TurkiyeKonumServisi.cacheTemizle', () => {
    test('yalnız türkiye cache anahtarlarını siler, ilgisiz anahtara dokunmaz', async () => {
        mockStore.set(
            CACHE_ANAHTARI_ILLER,
            JSON.stringify({ timestamp: Date.now(), data: [] })
        );
        mockStore.set(
            `${CACHE_ANAHTARI_ILCELER}6`,
            JSON.stringify({ timestamp: Date.now(), data: [] })
        );
        mockStore.set('@baska_anahtar', 'korunmali');

        await TurkiyeKonumServisi.cacheTemizle();

        expect(mockStore.has(CACHE_ANAHTARI_ILLER)).toBe(false);
        expect(mockStore.has(`${CACHE_ANAHTARI_ILCELER}6`)).toBe(false);
        expect(mockStore.get('@baska_anahtar')).toBe('korunmali');
    });

    test('cacheTemizle sonrası bellek cache de sıfırlanır (illeriGetir yeniden fetch eder)', async () => {
        const fetchMock = jest
            .fn()
            .mockResolvedValue(
                fetchYanitOlustur(true, {
                    data: [
                        {
                            id: 1,
                            name: 'A',
                            areaCode: 1,
                            coordinates: { latitude: 0, longitude: 0 },
                        },
                    ],
                })
            );
        global.fetch = fetchMock;

        await TurkiyeKonumServisi.illeriGetir(); // bellek cache dolar (fetch 1)
        await TurkiyeKonumServisi.cacheTemizle(); // bellek + disk temizlenir
        mockStore.clear();
        await TurkiyeKonumServisi.illeriGetir(); // tekrar fetch (fetch 2)

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    test('getAllKeys fırlatsa bile fırlatmadan tamamlanır (catch dalı)', async () => {
        const asyncStorage = jest.requireMock(
            '@react-native-async-storage/async-storage'
        ).default;
        const orijinal = asyncStorage.getAllKeys;
        asyncStorage.getAllKeys = jest
            .fn()
            .mockRejectedValue(new Error('storage hatası'));

        await expect(
            TurkiyeKonumServisi.cacheTemizle()
        ).resolves.toBeUndefined();

        asyncStorage.getAllKeys = orijinal;
    });
});

// ==================== NÖBETÇİ: üçüncü taraf yanıtı ve önbellek süzgeci (denetim B-5) ====================
// `api.turkiyeapi.dev` yanıtı ve ondan yazılan 24 saatlik önbellek tip/aralık doğrulamasından
// geçmeden konuma giremez: kaymış koordinat = sessizce yanlış vakit, dize koordinat =
// `toFixed` hatasıyla 24 saat açılmayan seçici.
describe('NÖBETÇİ B-5: il/ilçe yanıtı ve önbelleği doğrulanır', () => {
    const ISTANBUL = TURKIYE_ILLERI_OFFLINE.find((il) => il.id === 34)!;
    const ilYaniti = (satirlar: unknown): void => {
        global.fetch = jest.fn().mockResolvedValue(fetchYanitOlustur(true, { data: satirlar }));
    };

    test.each([
        ['dize koordinat', { latitude: 'x', longitude: '28.97' }],
        ['Türkiye dışı koordinat', { latitude: 10, longitude: 28.97 }],
        ['Türkiye içinde ama başka ile kaydırılmış koordinat', { latitude: 39.93, longitude: 32.85 }],
        ['sonsuz/NaN koordinat', { latitude: Infinity, longitude: NaN }],
        ['nesne olmayan koordinat', 'yok'],
    ])('il koordinatı geçersizse (%s) çevrimdışı tablodaki il merkezi kullanılır', async (_ad, coordinates) => {
        ilYaniti([{ id: 34, name: 'İstanbul', coordinates }]);

        const iller = await TurkiyeKonumServisi.illeriGetir();

        expect(iller).toEqual([{ id: 34, ad: 'İstanbul', plakaKodu: '34', lat: ISTANBUL.lat, lng: ISTANBUL.lng }]);
        // Önbelleğe de düzeltilmiş hâli yazılır (zehirli değer 24 saat saklanmaz).
        const yazilan = JSON.parse(mockStore.get(CACHE_ANAHTARI_ILLER)!);
        expect(yazilan.data[0].lat).toBe(ISTANBUL.lat);
    });

    test('geçersiz kimlikli, yinelenen ve nesne olmayan il satırları atılır; uyuşmayan ad tablodan gelir', async () => {
        ilYaniti([
            { id: 34, name: 'Ankara', coordinates: { latitude: 41.01, longitude: 28.95 } }, // ad kimlikle uyuşmuyor
            { id: 34, name: 'İstanbul', coordinates: { latitude: 41.01, longitude: 28.95 } }, // yinelenen kimlik
            { id: '6', name: 'Ankara', coordinates: { latitude: 39.93, longitude: 32.85 } }, // dize kimlik
            { id: 6.5, name: 'Ankara' },
            { id: 0, name: 'Sıfır' },
            { id: 82, name: 'Uydurma' },
            { id: 35, name: 'x'.repeat(500), coordinates: { latitude: 38.42, longitude: 27.14 } }, // aşırı uzun ad
            null,
            'metin',
            42,
        ]);

        const iller = await TurkiyeKonumServisi.illeriGetir();

        expect(iller.map((il) => il.id)).toEqual([34, 35]);
        expect(iller[0].ad).toBe('İstanbul');
        expect(iller[0].lat).toBe(41.01);
        expect(iller[1].ad).toBe('İzmir');
    });

    test.each([
        ['dizi olmayan yanıt', { data: 'bozuk' }],
        ['tümü geçersiz satır', { data: [{ id: 999, name: 'Yok' }, { id: 'a' }] }],
        ['null yanıt', null],
    ])('%s → çevrimdışı 81 il döner ve önbelleğe YAZILMAZ', async (_ad, yanit) => {
        global.fetch = jest.fn().mockResolvedValue(fetchYanitOlustur(true, yanit));

        const iller = await TurkiyeKonumServisi.illeriGetir();

        expect(iller).toBe(TURKIYE_ILLERI_OFFLINE);
        expect(mockStore.has(CACHE_ANAHTARI_ILLER)).toBe(false);
    });

    test('zehirli il önbelleği okurken süzülür: dize/kaymış koordinat tabloya düşer, geçersiz satır atılır', async () => {
        mockStore.set(
            CACHE_ANAHTARI_ILLER,
            JSON.stringify({
                timestamp: Date.now(),
                data: [
                    { id: 34, ad: 'İstanbul', plakaKodu: '34', lat: '41.0', lng: 28.97 },
                    { id: 6, ad: 'Ankara', plakaKodu: '06', lat: 10, lng: 10 },
                    { id: 500, ad: 'Uydurma', plakaKodu: '500', lat: 39, lng: 35 },
                ],
            })
        );
        const fetchMock = jest.fn();
        global.fetch = fetchMock;

        const iller = await TurkiyeKonumServisi.illeriGetir();
        const ankara = TURKIYE_ILLERI_OFFLINE.find((il) => il.id === 6)!;

        expect(fetchMock).not.toHaveBeenCalled();
        expect(iller).toEqual([
            { id: 34, ad: 'İstanbul', plakaKodu: '34', lat: ISTANBUL.lat, lng: ISTANBUL.lng },
            { id: 6, ad: 'Ankara', plakaKodu: '06', lat: ankara.lat, lng: ankara.lng },
        ]);
        // Seçicideki `item.lat.toFixed` çağrısı artık patlamaz.
        expect(iller.every((il) => typeof il.lat === 'number' && typeof il.lng === 'number')).toBe(true);
    });

    test.each([
        ['tümü geçersiz satır', JSON.stringify({ timestamp: Date.now(), data: [{ id: 'x' }] })],
        ['dizi olmayan data', JSON.stringify({ timestamp: Date.now(), data: { id: 1 } })],
        ['gelecekten damgalı kayıt', JSON.stringify({ timestamp: Date.now() + 10 * 24 * 60 * 60 * 1000, data: [{ id: 1, ad: 'Adana', lat: 37, lng: 35.3 }] })],
        ['sayı olmayan zaman damgası', JSON.stringify({ timestamp: 'simdi', data: [{ id: 1, ad: 'Adana', lat: 37, lng: 35.3 }] })],
        ['nesne olmayan zarf', '[1,2,3]'],
    ])('il önbelleği kullanılamazsa (%s) yok sayılır ve API denenir', async (_ad, onbellek) => {
        mockStore.set(CACHE_ANAHTARI_ILLER, onbellek);
        const fetchMock = jest.fn().mockRejectedValue(new Error('ağ yok'));
        global.fetch = fetchMock;

        const iller = await TurkiyeKonumServisi.illeriGetir();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(iller).toBe(TURKIYE_ILLERI_OFFLINE);
    });

    test('ilçe satırları doğrulanır: bozuk ad/kimlik atılır, geçersiz koordinat il merkezine düşer', async () => {
        global.fetch = jest.fn().mockResolvedValue(
            fetchYanitOlustur(true, {
                data: {
                    // Yanıttaki il koordinatı da zehirli: yedek olarak KULLANILMAZ.
                    coordinates: { latitude: 10, longitude: 10 },
                    districts: [
                        { id: 90001, name: 'UydurmaIlce', coordinates: { latitude: 'x', longitude: 29 } },
                        { id: 90002, name: 'UzakIlce', coordinates: { latitude: 37.0, longitude: 35.3 } }, // Adana'da
                        { id: 90003, name: 'YakinIlce', coordinates: { latitude: 41.1, longitude: 29.0 } },
                        { id: 90004, name: 42 },
                        { id: 90005, name: '   ' },
                        { id: 90006, name: 'Satir\nSonu' },
                        { id: 'abc', name: 'DizeKimlik' },
                        { id: -3, name: 'NegatifKimlik' },
                        { id: 90003, name: 'YinelenenKimlik' },
                        null,
                    ],
                },
            })
        );

        const ilceler = await TurkiyeKonumServisi.ilceleriGetir(34);

        expect(ilceler).toEqual([
            { id: 90001, ilId: 34, ad: 'UydurmaIlce', lat: ISTANBUL.lat, lng: ISTANBUL.lng },
            { id: 90002, ilId: 34, ad: 'UzakIlce', lat: ISTANBUL.lat, lng: ISTANBUL.lng },
            { id: 90003, ilId: 34, ad: 'YakinIlce', lat: 41.1, lng: 29.0 },
        ]);
    });

    test('ilçe yanıtının tümü geçersizse çevrimdışı ilçe listesi döner ve önbelleğe YAZILMAZ', async () => {
        global.fetch = jest.fn().mockResolvedValue(
            fetchYanitOlustur(true, { data: { districts: [{ id: 1, name: 5 }, 'bozuk'] } })
        );

        const ilceler = await TurkiyeKonumServisi.ilceleriGetir(8);

        expect(ilceler.map((i) => i.ad)).toContain('Hopa');
        expect(mockStore.has(`${CACHE_ANAHTARI_ILCELER}8`)).toBe(false);
    });

    test('zehirli ilçe önbelleği okurken süzülür; yabancı ilId üzerine yazılır', async () => {
        mockStore.set(
            `${CACHE_ANAHTARI_ILCELER}34`,
            JSON.stringify({
                timestamp: Date.now(),
                data: [
                    { id: 90001, ilId: 6, ad: 'UydurmaIlce', lat: '41', lng: null },
                    { id: 90002, ilId: 34, ad: { kotu: true }, lat: 41, lng: 29 },
                ],
            })
        );
        const fetchMock = jest.fn();
        global.fetch = fetchMock;

        const ilceler = await TurkiyeKonumServisi.ilceleriGetir(34);

        expect(fetchMock).not.toHaveBeenCalled();
        expect(ilceler).toEqual([{ id: 90001, ilId: 34, ad: 'UydurmaIlce', lat: ISTANBUL.lat, lng: ISTANBUL.lng }]);
    });

    test('tümü geçersiz ilçe önbelleği yok sayılır ve API denenir', async () => {
        mockStore.set(
            `${CACHE_ANAHTARI_ILCELER}8`,
            JSON.stringify({ timestamp: Date.now(), data: [{ id: 'x', ad: 7 }] })
        );
        const fetchMock = jest.fn().mockRejectedValue(new Error('ağ yok'));
        global.fetch = fetchMock;

        const ilceler = await TurkiyeKonumServisi.ilceleriGetir(8);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(ilceler.map((i) => i.ad)).toContain('Hopa');
    });
});
