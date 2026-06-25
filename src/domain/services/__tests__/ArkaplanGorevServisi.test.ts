/**
 * Arka Plan Gorev Servisi - Sinif yonetimi + gorev govdesi testleri
 *
 * Bu dosya, ArkaplanGorevKonumCanlandirma.test.ts'nin KAPSAMADIGI yollari test eder:
 *  - ArkaplanGorevServisi sinifi (singleton, kaydetVeBaslat, durdur, durumKontrol, durumAciklamasi)
 *  - BILDIRIM_YENILEME_GOREVI gorev govdesi (TaskManager.defineTask'a verilen geri cagri):
 *    muhafiz ayarlari yok/devre disi/aktif yollari, koordinat secimi, hata -> Failed.
 *
 * Konum-canlandirma davranisi (arkaplandanKonumTakibiniYenidenBaslat) zaten
 * komsu dosyada kapsanmistir; burada gorev govdesi icin ADIM-1 mock'lanir.
 */

import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

// ---- In-memory AsyncStorage mock (konvansiyon: mock-onekli kapanis disi degisken) ----
const mockDepo = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn((anahtar: string, deger: string) => {
        mockDepo.set(anahtar, deger);
        return Promise.resolve();
    }),
    getItem: jest.fn((anahtar: string) =>
        Promise.resolve(mockDepo.has(anahtar) ? mockDepo.get(anahtar)! : null)
    ),
    removeItem: jest.fn((anahtar: string) => {
        mockDepo.delete(anahtar);
        return Promise.resolve();
    }),
}));

// expo-location: gorev govdesinin ADIM-1'i (arkaplandanKonumTakibiniYenidenBaslat)
// erken donsun diye takip ayarlari okunmadiginda hicbir sey yapmaz.
jest.mock('expo-location', () => ({
    getForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    getBackgroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    startLocationUpdatesAsync: jest.fn(() => Promise.resolve()),
    stopLocationUpdatesAsync: jest.fn(() => Promise.resolve()),
    Accuracy: { Lowest: 1, Low: 2, Balanced: 3, High: 4, Highest: 5 },
    ActivityType: { Other: 1 },
}));

jest.mock('expo-task-manager', () => ({
    defineTask: jest.fn(),
    isTaskRegisteredAsync: jest.fn(() => Promise.resolve(false)),
}));

jest.mock('expo-background-fetch', () => ({
    registerTaskAsync: jest.fn(() => Promise.resolve()),
    unregisterTaskAsync: jest.fn(() => Promise.resolve()),
    getStatusAsync: jest.fn(() => Promise.resolve(3)),
    BackgroundFetchResult: {
        NewData: 2,
        NoData: 1,
        Failed: 3,
    },
    BackgroundFetchStatus: {
        Restricted: 1,
        Denied: 2,
        Available: 3,
    },
}));

// Muhafiz servisi: yapilandirVePlanla'ya gecen ayarlari yakalayabilmek icin
// sabit bir spy referansi tut.
const mockYapilandirVePlanla = jest.fn<Promise<void>, [unknown]>(() =>
    Promise.resolve()
);
jest.mock('../ArkaplanMuhafizServisi', () => ({
    ArkaplanMuhafizServisi: {
        getInstance: jest.fn(() => ({
            yapilandirVePlanla: mockYapilandirVePlanla,
        })),
    },
}));

import {
    ArkaplanGorevServisi,
    BILDIRIM_YENILEME_GOREVI,
} from '../ArkaplanGorevServisi';

const MUHAFIZ_AYARLARI_ANAHTAR = 'muhafiz_ayarlari';
const KONUM_DEPOLAMA_ANAHTARI = '@namaz_akisi/konum_ayarlari';

/**
 * TaskManager.defineTask import sirasinda (modul yuklenirken) BIR KEZ cagrilir.
 * Gorev geri cagrisini import sonrasi HEMEN yakala; cunku beforeEach'teki
 * jest.clearAllMocks() defineTask.mock.calls'u temizler (gorev tekrar kaydedilmez,
 * modul yalnizca ilk import'ta calisir) -> sonradan okunursa kayit kaybolur.
 */
const gorevGeriCagrisi: () => Promise<number> = (() => {
    const cagrilar = (TaskManager.defineTask as jest.Mock).mock.calls;
    const kayit = cagrilar.find(([ad]) => ad === BILDIRIM_YENILEME_GOREVI);
    if (!kayit) {
        throw new Error('BILDIRIM_YENILEME_GOREVI gorevi defineTask ile kaydedilmemis');
    }
    return kayit[1] as () => Promise<number>;
})();

function gorevGeriCagrisiniAl(): () => Promise<number> {
    return gorevGeriCagrisi;
}

beforeEach(() => {
    mockDepo.clear();
    jest.clearAllMocks();
});

// =====================================================================
// BOLUM A: ArkaplanGorevServisi sinifi
// =====================================================================
describe('ArkaplanGorevServisi sinifi', () => {
    describe('getInstance (singleton)', () => {
        it('her cagrida ayni instance dondurmeli', () => {
            const a = ArkaplanGorevServisi.getInstance();
            const b = ArkaplanGorevServisi.getInstance();
            expect(a).toBe(b);
        });
    });

    describe('kaydetVeBaslat', () => {
        it('gorev kayitli degilse background fetch kaydetmeli ve true donmeli', async () => {
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);

            const sonuc = await ArkaplanGorevServisi.getInstance().kaydetVeBaslat();

            expect(sonuc).toBe(true);
            // Davranis: dogru gorev adi + dogru zamanlama parametreleriyle kayit
            expect(BackgroundFetch.registerTaskAsync).toHaveBeenCalledTimes(1);
            expect(BackgroundFetch.registerTaskAsync).toHaveBeenCalledWith(
                BILDIRIM_YENILEME_GOREVI,
                expect.objectContaining({
                    minimumInterval: 15 * 60, // 15 dk -> saniye
                    stopOnTerminate: false,
                    startOnBoot: true,
                })
            );
        });

        it('gorev zaten kayitliysa yeniden kaydetmemeli ama true donmeli', async () => {
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);

            const sonuc = await ArkaplanGorevServisi.getInstance().kaydetVeBaslat();

            expect(sonuc).toBe(true);
            expect(BackgroundFetch.registerTaskAsync).not.toHaveBeenCalled();
        });

        it('kayit sirasinda hata olursa false donmeli (firlatmamali)', async () => {
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
            (BackgroundFetch.registerTaskAsync as jest.Mock).mockRejectedValue(
                new Error('register failed')
            );

            const sonuc = await ArkaplanGorevServisi.getInstance().kaydetVeBaslat();

            expect(sonuc).toBe(false);
        });
    });

    describe('durdur', () => {
        it('gorev kayitliysa unregister cagirmali', async () => {
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);

            await ArkaplanGorevServisi.getInstance().durdur();

            expect(BackgroundFetch.unregisterTaskAsync).toHaveBeenCalledWith(
                BILDIRIM_YENILEME_GOREVI
            );
        });

        it('gorev kayitli degilse unregister cagrilmamali', async () => {
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);

            await ArkaplanGorevServisi.getInstance().durdur();

            expect(BackgroundFetch.unregisterTaskAsync).not.toHaveBeenCalled();
        });

        it('durdurma hatasi olursa firlatmamali (sessiz yutmali)', async () => {
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);
            (BackgroundFetch.unregisterTaskAsync as jest.Mock).mockRejectedValue(
                new Error('unregister failed')
            );

            await expect(
                ArkaplanGorevServisi.getInstance().durdur()
            ).resolves.toBeUndefined();
        });
    });

    describe('durumKontrol', () => {
        it('kayitli durumu ve background fetch status degerini dondurmeli', async () => {
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);
            (BackgroundFetch.getStatusAsync as jest.Mock).mockResolvedValue(
                BackgroundFetch.BackgroundFetchStatus.Available
            );

            const durum = await ArkaplanGorevServisi.getInstance().durumKontrol();

            expect(durum).toEqual({
                kayitli: true,
                status: BackgroundFetch.BackgroundFetchStatus.Available,
            });
        });

        it('gorev kayitli degilken kayitli:false dondurmeli', async () => {
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
            (BackgroundFetch.getStatusAsync as jest.Mock).mockResolvedValue(
                BackgroundFetch.BackgroundFetchStatus.Denied
            );

            const durum = await ArkaplanGorevServisi.getInstance().durumKontrol();

            expect(durum.kayitli).toBe(false);
            expect(durum.status).toBe(BackgroundFetch.BackgroundFetchStatus.Denied);
        });
    });

    describe('durumAciklamasi', () => {
        it('Restricted icin kisitli aciklamasi vermeli', () => {
            expect(
                ArkaplanGorevServisi.durumAciklamasi(
                    BackgroundFetch.BackgroundFetchStatus.Restricted
                )
            ).toBe('Kısıtlı - Sistem tarafından engelleniyor');
        });

        it('Denied icin reddedildi aciklamasi vermeli', () => {
            expect(
                ArkaplanGorevServisi.durumAciklamasi(
                    BackgroundFetch.BackgroundFetchStatus.Denied
                )
            ).toBe('Reddedildi - Kullanıcı izin vermedi');
        });

        it('Available icin kullanilabilir aciklamasi vermeli', () => {
            expect(
                ArkaplanGorevServisi.durumAciklamasi(
                    BackgroundFetch.BackgroundFetchStatus.Available
                )
            ).toBe('Kullanılabilir');
        });

        it('bilinmeyen/null status icin "Bilinmiyor" donmeli', () => {
            expect(
                ArkaplanGorevServisi.durumAciklamasi(
                    null as unknown as BackgroundFetch.BackgroundFetchStatus
                )
            ).toBe('Bilinmiyor');
        });
    });
});

// =====================================================================
// BOLUM B: BILDIRIM_YENILEME_GOREVI gorev govdesi (ADIM 2)
// =====================================================================
describe('BILDIRIM_YENILEME_GOREVI gorev govdesi', () => {
    it('muhafiz ayarlari yoksa NoData donmeli ve planlama yapmamali', async () => {
        const gorev = gorevGeriCagrisiniAl();

        const sonuc = await gorev();

        expect(sonuc).toBe(BackgroundFetch.BackgroundFetchResult.NoData);
        expect(mockYapilandirVePlanla).not.toHaveBeenCalled();
    });

    it('muhafiz devre disiysa (aktif:false) NoData donmeli ve planlama yapmamali', async () => {
        mockDepo.set(MUHAFIZ_AYARLARI_ANAHTAR, JSON.stringify({ aktif: false }));
        const gorev = gorevGeriCagrisiniAl();

        const sonuc = await gorev();

        expect(sonuc).toBe(BackgroundFetch.BackgroundFetchResult.NoData);
        expect(mockYapilandirVePlanla).not.toHaveBeenCalled();
    });

    it('muhafiz aktif + konum ayarlarinda koordinat varsa o koordinatla planlamali ve NewData donmeli', async () => {
        mockDepo.set(
            MUHAFIZ_AYARLARI_ANAHTAR,
            JSON.stringify({
                aktif: true,
                esikler: { seviye1: 45, seviye2: 25, seviye3: 10, seviye4: 3 },
                sikliklar: { seviye1: 15, seviye2: 10, seviye3: 5, seviye4: 1 },
            })
        );
        mockDepo.set(
            KONUM_DEPOLAMA_ANAHTARI,
            JSON.stringify({ koordinatlar: { lat: 39.92, lng: 32.85 } }) // Ankara
        );
        const gorev = gorevGeriCagrisiniAl();

        const sonuc = await gorev();

        expect(sonuc).toBe(BackgroundFetch.BackgroundFetchResult.NewData);
        expect(mockYapilandirVePlanla).toHaveBeenCalledTimes(1);
        const gecenAyar = mockYapilandirVePlanla.mock.calls[0][0] as unknown as {
            aktif: boolean;
            koordinatlar: { lat: number; lng: number };
            esikler: Record<string, number>;
        };
        // Konum slice'indaki koordinat kullanilmali (muhafiz koordinati degil)
        expect(gecenAyar.koordinatlar).toEqual({ lat: 39.92, lng: 32.85 });
        expect(gecenAyar.aktif).toBe(true);
        // Esik + siklik haritalama dogru tasinmali
        expect(gecenAyar.esikler.seviye1).toBe(45);
        expect(gecenAyar.esikler.seviye1Siklik).toBe(15);
        expect(gecenAyar.esikler.seviye4).toBe(3);
        expect(gecenAyar.esikler.seviye4Siklik).toBe(1);
    });

    it('konum ayarlari yoksa ama muhafiz ayarinda koordinat varsa (geriye uyumluluk) onu kullanmali', async () => {
        mockDepo.set(
            MUHAFIZ_AYARLARI_ANAHTAR,
            JSON.stringify({
                aktif: true,
                koordinatlar: { lat: 38.42, lng: 27.14 }, // Izmir - eski format
            })
        );
        // KONUM_DEPOLAMA_ANAHTARI bilerek yazilmadi
        const gorev = gorevGeriCagrisiniAl();

        const sonuc = await gorev();

        expect(sonuc).toBe(BackgroundFetch.BackgroundFetchResult.NewData);
        const gecenAyar = mockYapilandirVePlanla.mock.calls[0][0] as unknown as {
            koordinatlar: { lat: number; lng: number };
        };
        expect(gecenAyar.koordinatlar).toEqual({ lat: 38.42, lng: 27.14 });
    });

    it('hicbir yerde koordinat yoksa varsayilan Istanbul koordinatini kullanmali', async () => {
        mockDepo.set(MUHAFIZ_AYARLARI_ANAHTAR, JSON.stringify({ aktif: true }));
        const gorev = gorevGeriCagrisiniAl();

        const sonuc = await gorev();

        expect(sonuc).toBe(BackgroundFetch.BackgroundFetchResult.NewData);
        const gecenAyar = mockYapilandirVePlanla.mock.calls[0][0] as unknown as {
            koordinatlar: { lat: number; lng: number };
        };
        expect(gecenAyar.koordinatlar).toEqual({ lat: 41.0082, lng: 28.9784 });
    });

    it('esikler/sikliklar eksikse varsayilan esik ve siklik degerlerine dusmeli', async () => {
        // aktif:true ama esikler ve sikliklar HIC yok -> tum fallback dallari calisir
        mockDepo.set(MUHAFIZ_AYARLARI_ANAHTAR, JSON.stringify({ aktif: true }));
        const gorev = gorevGeriCagrisiniAl();

        await gorev();

        const gecenAyar = mockYapilandirVePlanla.mock.calls[0][0] as unknown as {
            esikler: Record<string, number>;
        };
        // Uretim varsayilanlari (UygulamaSabitleri degil, gorev icindeki sabitler):
        // esik fallback: 45/25/10/3 ; siklik fallback: 15/10/5/1
        expect(gecenAyar.esikler).toEqual({
            seviye1: 45,
            seviye1Siklik: 15,
            seviye2: 25,
            seviye2Siklik: 10,
            seviye3: 10,
            seviye3Siklik: 5,
            seviye4: 3,
            seviye4Siklik: 1,
        });
    });

    it('planlama sirasinda hata olursa Failed donmeli (firlatmamali)', async () => {
        mockDepo.set(MUHAFIZ_AYARLARI_ANAHTAR, JSON.stringify({ aktif: true }));
        mockYapilandirVePlanla.mockRejectedValueOnce(new Error('planlama patladi'));
        const gorev = gorevGeriCagrisiniAl();

        const sonuc = await gorev();

        expect(sonuc).toBe(BackgroundFetch.BackgroundFetchResult.Failed);
    });

    it('bozuk JSON (parse hatasi) durumunda Failed donmeli', async () => {
        mockDepo.set(MUHAFIZ_AYARLARI_ANAHTAR, '{ bozuk json');
        const gorev = gorevGeriCagrisiniAl();

        const sonuc = await gorev();

        expect(sonuc).toBe(BackgroundFetch.BackgroundFetchResult.Failed);
        expect(mockYapilandirVePlanla).not.toHaveBeenCalled();
    });
});
