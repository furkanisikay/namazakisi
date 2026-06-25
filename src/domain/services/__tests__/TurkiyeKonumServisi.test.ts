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

    test('coordinates yoksa lat/lng 0 olur (|| 0 dalı)', async () => {
        const apiYanit = [{ id: 99, name: 'Testil', areaCode: 99 }]; // coordinates yok, bare array
        global.fetch = jest
            .fn()
            .mockResolvedValue(fetchYanitOlustur(true, apiYanit));

        const iller = await TurkiyeKonumServisi.illeriGetir();

        expect(iller[0].lat).toBe(0);
        expect(iller[0].lng).toBe(0);
        expect(iller[0].plakaKodu).toBe('99');
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
            { id: 1, ad: 'CacheIl', plakaKodu: '01', lat: 1, lng: 2 },
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
                            name: 'TazeIl',
                            areaCode: 2,
                            coordinates: { latitude: 5, longitude: 6 },
                        },
                    ],
                })
            );

        const iller = await TurkiyeKonumServisi.illeriGetir();

        expect(iller).toHaveLength(1);
        expect(iller[0].ad).toBe('TazeIl');
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
                coordinates: { latitude: 10, longitude: 20 },
                districts: [
                    {
                        id: 100,
                        name: 'Merkez',
                        coordinates: { latitude: 11, longitude: 21 },
                    },
                    // id yok → index+1 = 2; coordinates yok → il koordinatına düşer
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
            lat: 11,
            lng: 21,
        });
        // id yoksa index+1, koordinatlar il koordinatına fallback
        expect(ilceler[1]).toEqual({
            id: 2,
            ilId: 6,
            ad: 'KoordsuzIlce',
            lat: 10,
            lng: 20,
        });
    });

    test('districts hiç yoksa boş dizi döner (|| [] dalı)', async () => {
        global.fetch = jest
            .fn()
            .mockResolvedValue(fetchYanitOlustur(true, { data: {} }));

        const ilceler = await TurkiyeKonumServisi.ilceleriGetir(7);
        expect(ilceler).toEqual([]);
    });

    test('API ok değilse boş dizi döner', async () => {
        global.fetch = jest
            .fn()
            .mockResolvedValue(fetchYanitOlustur(false, {}));

        const ilceler = await TurkiyeKonumServisi.ilceleriGetir(8);
        expect(ilceler).toEqual([]);
    });

    test('fetch fırlatırsa boş dizi döner', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('ağ yok'));

        const ilceler = await TurkiyeKonumServisi.ilceleriGetir(9);
        expect(ilceler).toEqual([]);
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
        const cacheVeri = [{ id: 1, ilId, ad: 'CacheIlce', lat: 0, lng: 0 }];
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
