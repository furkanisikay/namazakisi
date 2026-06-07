/**
 * Gün Sonu Bildirimi Entegrasyon Testleri
 * SeriAyarlari, seriAyarlariniGuncelle thunk'ı ve KonumYoneticiServisi
 * entegrasyonunu test eder.
 *
 * Bu testler ÜRETİM YOLUNU egzersiz eder: gerçek bir Redux store kurulur,
 * seriAyarlariniGuncelle thunk'ı dispatch edilir ve BildirimServisi.bildirimPlanla'ya
 * geçen planlanmış saat/dakika argümanları (saat=4. arg, dakika=5. arg) doğrulanır.
 * Beklenen değerler üretimle AYNI yöntemle ama BAĞIMSIZ olarak hesaplanır.
 */

import { configureStore } from '@reduxjs/toolkit';

// ==================== MOCKLAR ====================

// Mock expo-location
jest.mock('expo-location', () => ({
    getForegroundPermissionsAsync: jest.fn(),
    requestForegroundPermissionsAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
    reverseGeocodeAsync: jest.fn(),
}));

// Mock expo-notifications - CI ortaminda gerekli
jest.mock('expo-notifications', () => ({
    scheduleNotificationAsync: jest.fn(),
    cancelScheduledNotificationAsync: jest.fn(),
    getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
    AndroidNotificationPriority: { MAX: 'max', HIGH: 'high' },
    SchedulableTriggerInputTypes: { DATE: 'date' },
}));

// BildirimServisi mock - bildirimPlanla/bildirimIptalEt cagrilarini yakalamak icin
// SABIT bir mock instance dondur (her getInstance cagrisinda ayni jest.fn'ler gelsin).
const mockBildirimPlanla = jest.fn();
const mockBildirimIptalEt = jest.fn();
jest.mock('../domain/services/BildirimServisi', () => ({
    BildirimServisi: {
        getInstance: jest.fn(() => ({
            bildirimPlanla: mockBildirimPlanla,
            bildirimIptalEt: mockBildirimIptalEt,
        })),
    },
}));

// LocalSeriServisi mock - thunk icindeki kalicilik AsyncStorage'a gitmesin
jest.mock('../data/local/LocalSeriServisi', () => ({
    localSeriAyarlariniKaydet: jest.fn().mockResolvedValue({ basarili: true }),
    VARSAYILAN_OZEL_GUN_AYARLARI: {
        ozelGunModuAktif: false,
        aktifOzelGun: null,
        gecmisKayitlar: [],
    },
}));

// Suppress console.log in tests
beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'warn').mockImplementation(() => { });
    jest.spyOn(console, 'error').mockImplementation(() => { });
});

afterAll(() => {
    jest.restoreAllMocks();
});

import { KonumYoneticiServisi } from '../domain/services/KonumYoneticiServisi';
import seriReducer, { seriAyarlariniGuncelle } from '../presentation/store/seriSlice';
import type { GunSonuBildirimModu, BildirimGunSecimi } from '../core/types/SeriTipleri';
import { VARSAYILAN_SERI_AYARLARI } from '../core/types/SeriTipleri';

// ==================== YARDIMCI ====================

/** Sadece seri reducer'ini iceren minimal bir test store'u olusturur. */
function storeOlustur() {
    return configureStore({
        reducer: { seri: seriReducer },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({ serializableCheck: false }),
    });
}

/**
 * seriAyarlariniGuncelle dispatch edip bildirimPlanla'ya gecen
 * (saat, dakika) ciftini (4. ve 5. pozisyonel argumanlar) dondurur.
 */
async function planlananSaatiAl(
    ayarlar: Partial<typeof VARSAYILAN_SERI_AYARLARI>
): Promise<{ saat: number; dakika: number }> {
    mockBildirimPlanla.mockClear();
    const store = storeOlustur();
    await store.dispatch(seriAyarlariniGuncelle({ ayarlar }) as never);

    expect(mockBildirimPlanla).toHaveBeenCalledTimes(1);
    const cagri = mockBildirimPlanla.mock.calls[0];
    // bildirimPlanla(id, baslik, mesaj, saat, dakika, tekrarla)
    return { saat: cagri[3] as number, dakika: cagri[4] as number };
}

describe('Gün Sonu Bildirimi Entegrasyon Testleri', () => {
    let konumServisi: KonumYoneticiServisi;

    beforeEach(() => {
        jest.clearAllMocks();
        konumServisi = KonumYoneticiServisi.getInstance();
        konumServisi.sifirla();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Tip Tanımlamaları', () => {
        it('GunSonuBildirimModu tipleri geçerli olmalı', () => {
            const otomatik: GunSonuBildirimModu = 'otomatik';
            const sabit: GunSonuBildirimModu = 'sabit';

            expect(['otomatik', 'sabit']).toContain(otomatik);
            expect(['otomatik', 'sabit']).toContain(sabit);
        });

        it('BildirimGunSecimi tipleri geçerli olmalı', () => {
            const ayniGun: BildirimGunSecimi = 'ayniGun';
            const ertesiGun: BildirimGunSecimi = 'ertesiGun';

            expect(['ayniGun', 'ertesiGun']).toContain(ayniGun);
            expect(['ayniGun', 'ertesiGun']).toContain(ertesiGun);
        });
    });

    describe('Varsayılan Ayarlar', () => {
        it('yeni gün sonu bildirim alanları varsayılan değerlere sahip olmalı', () => {
            expect(VARSAYILAN_SERI_AYARLARI.gunSonuBildirimModu).toBe('otomatik');
            expect(VARSAYILAN_SERI_AYARLARI.bildirimImsakOncesiDk).toBe(30);
            expect(VARSAYILAN_SERI_AYARLARI.bildirimGunSecimi).toBe('ertesiGun');
            expect(VARSAYILAN_SERI_AYARLARI.bildirimSaati).toBe(4);
            expect(VARSAYILAN_SERI_AYARLARI.bildirimDakikasi).toBe(0);
        });
    });

    describe('Otomatik Mod - İmsak Hesaplama', () => {
        it('konum ayarlandığında imsak vakti hesaplanabilmeli', () => {
            // İstanbul koordinatları
            konumServisi.koordinatlarAyarla(41.0082, 28.9784);

            const imsakVakti = konumServisi.sonrakiGunImsakVaktiGetir();

            expect(imsakVakti).not.toBeNull();
            expect(imsakVakti).toBeInstanceOf(Date);
        });

        it('sonraki gün imsak vakti İstanbul saatinde makul aralıkta (2-7) olmalı', () => {
            konumServisi.koordinatlarAyarla(41.0082, 28.9784);

            const imsakVakti = konumServisi.sonrakiGunImsakVaktiGetir();

            // İmsak vakti hesaplanabilmeli
            expect(imsakVakti).not.toBeNull();
            expect(imsakVakti).toBeInstanceOf(Date);

            // Istanbul yerel saatinde imsak 02:00-07:00 arasında olmalı (mevsime göre değişir).
            // CI UTC'de koştuğu için getHours yerine Istanbul timezone'da saati çıkarıyoruz.
            // Bu, CalculationMethod.Turkey() yanlış bir açı/yöntemle değiştirilirse FAIL eder.
            const istanbulSaatStr = imsakVakti!.toLocaleString('en-US', {
                timeZone: 'Europe/Istanbul',
                hour: '2-digit',
                hour12: false,
            });
            const imsakSaat = parseInt(istanbulSaatStr, 10);
            expect(imsakSaat).toBeGreaterThanOrEqual(2);
            expect(imsakSaat).toBeLessThanOrEqual(7);
        });

        it('otomatik mod: bildirim, imsaktan bildirimImsakOncesiDk kadar önceye planlanır', async () => {
            // Üretim kodu (seriSlice.ts 121-130) imsak vaktini KonumYoneticiServisi'nden alıp
            // setMinutes ile geri çeker ve getHours/getMinutes ile planlar. Burada imsak'ı
            // BİLİNEN sabit bir Date'e kilitleyip aynı bağımsız yöntemle beklenen değeri hesaplıyoruz.
            const imsak = new Date(2026, 1, 1, 6, 15, 0, 0); // 1 Şubat 2026, 06:15 yerel
            jest.spyOn(KonumYoneticiServisi, 'getInstance').mockReturnValue({
                sonrakiGunImsakVaktiGetir: () => imsak,
            } as unknown as KonumYoneticiServisi);

            const { saat, dakika } = await planlananSaatiAl({
                gunSonuBildirimAktif: true,
                gunSonuBildirimModu: 'otomatik',
                bildirimImsakOncesiDk: 30,
            });

            // Üretimle aynı yöntem, bağımsız hesap: 06:15 - 30dk = 05:45
            const beklenen = new Date(imsak);
            beklenen.setMinutes(beklenen.getMinutes() - 30);
            expect(saat).toBe(beklenen.getHours());
            expect(dakika).toBe(beklenen.getMinutes());
            // Mutlak referans değerlerle de kilitle (regresyon netliği)
            expect(saat).toBe(5);
            expect(dakika).toBe(45);
        });

        it('otomatik mod: gece yarısı sınırında çıkarma bir önceki güne taşar (00:10 - 30dk = 23:40)', async () => {
            // FİZİKİ SINIR VAKASI: imsak gece yarısından hemen sonra (00:10) ise
            // 30dk geri çekme bir önceki güne taşmalı; getHours NEGATİF değil 23 dönmeli.
            // setMinutes'ın tarih devrini doğru yaptığını (saat 23, dakika 40) garanti eder.
            const imsak = new Date(2026, 1, 1, 0, 10, 0, 0); // 00:10 yerel
            jest.spyOn(KonumYoneticiServisi, 'getInstance').mockReturnValue({
                sonrakiGunImsakVaktiGetir: () => imsak,
            } as unknown as KonumYoneticiServisi);

            const { saat, dakika } = await planlananSaatiAl({
                gunSonuBildirimAktif: true,
                gunSonuBildirimModu: 'otomatik',
                bildirimImsakOncesiDk: 30,
            });

            const beklenen = new Date(imsak);
            beklenen.setMinutes(beklenen.getMinutes() - 30);
            expect(saat).toBe(beklenen.getHours());
            expect(dakika).toBe(beklenen.getMinutes());
            // Mutlak referans: gün taşması doğruysa 23:40 olmalı (0:-20 / -1:40 DEĞİL)
            expect(saat).toBe(23);
            expect(dakika).toBe(40);
        });

        it('otomatik mod: konum (imsak) yoksa varsayılan 04:00 planlanır', async () => {
            // seriSlice.ts 131-135: imsak null ise fallback 04:00.
            jest.spyOn(KonumYoneticiServisi, 'getInstance').mockReturnValue({
                sonrakiGunImsakVaktiGetir: () => null,
            } as unknown as KonumYoneticiServisi);

            const { saat, dakika } = await planlananSaatiAl({
                gunSonuBildirimAktif: true,
                gunSonuBildirimModu: 'otomatik',
                bildirimImsakOncesiDk: 30,
            });

            expect(saat).toBe(4);
            expect(dakika).toBe(0);
        });
    });

    describe('Sabit Mod - Validasyon', () => {
        it('ertesi gün: kullanıcının seçtiği sabit saat/dakika doğrudan planlanır', async () => {
            // Üretim kodu (seriSlice.ts 116-119) SABIT modda bildirimGunSecimi'ni saat
            // hesabında KULLANMAZ; doğrudan bildirimSaati/bildirimDakikasi'nı planlar.
            // bildirimGunSecimi sadece UI picker aralığı ipucudur.
            const { saat, dakika } = await planlananSaatiAl({
                gunSonuBildirimAktif: true,
                gunSonuBildirimModu: 'sabit',
                bildirimGunSecimi: 'ertesiGun',
                bildirimSaati: 4,
                bildirimDakikasi: 0,
            });

            expect(saat).toBe(4);
            expect(dakika).toBe(0);
        });

        it('aynı gün: kullanıcının seçtiği akşam saati (23:30) aynen planlanır, gün seçimi saati değiştirmez', async () => {
            // 'ayniGun' modunda 18:00-23:59 arası bir saat seçilir. Üretim, seçilen saati
            // OLDUĞU GİBİ planlamalı (kaydırma/clamp YOK). Aşağıdaki iki dispatch yalnızca
            // bildirimGunSecimi'nde farklıdır; planlanan saat AYNI kalmalı -> bu, sabit modda
            // gün seçiminin saat hesabına karışMADIĞI davranışını KİLİTLER.
            const ayniGun = await planlananSaatiAl({
                gunSonuBildirimAktif: true,
                gunSonuBildirimModu: 'sabit',
                bildirimGunSecimi: 'ayniGun',
                bildirimSaati: 23,
                bildirimDakikasi: 30,
            });

            // Seçilen akşam saati aynen planlanmalı
            expect(ayniGun.saat).toBe(23);
            expect(ayniGun.dakika).toBe(30);
            // Seçilen saat gerçekten geçerli akşam aralığında (18:00-23:59)
            expect(ayniGun.saat).toBeGreaterThanOrEqual(18);
            expect(ayniGun.saat).toBeLessThanOrEqual(23);

            // Sadece bildirimGunSecimi 'ertesiGun' iken aynı saat/dakika -> planlanan değişmemeli
            const ertesiGun = await planlananSaatiAl({
                gunSonuBildirimAktif: true,
                gunSonuBildirimModu: 'sabit',
                bildirimGunSecimi: 'ertesiGun',
                bildirimSaati: 23,
                bildirimDakikasi: 30,
            });
            expect(ertesiGun.saat).toBe(ayniGun.saat);
            expect(ertesiGun.dakika).toBe(ayniGun.dakika);
        });
    });

    describe('Mod Geçişleri', () => {
        it('sabit -> otomatik geçişinde bildirim imsak-temelli yeni saate yeniden planlanır', async () => {
            // GÖZLEMLENEBİLİR etki: mod değişince bildirimPlanla yeni (saat,dakika) ile çağrılır.
            const imsak = new Date(2026, 1, 1, 5, 30, 0, 0); // 05:30
            jest.spyOn(KonumYoneticiServisi, 'getInstance').mockReturnValue({
                sonrakiGunImsakVaktiGetir: () => imsak,
            } as unknown as KonumYoneticiServisi);

            const store = storeOlustur();

            // 1) Sabit mod -> kullanıcının seçtiği 22:15
            mockBildirimPlanla.mockClear();
            await store.dispatch(
                seriAyarlariniGuncelle({
                    ayarlar: {
                        gunSonuBildirimAktif: true,
                        gunSonuBildirimModu: 'sabit',
                        bildirimSaati: 22,
                        bildirimDakikasi: 15,
                    },
                }) as never
            );
            expect(mockBildirimPlanla).toHaveBeenLastCalledWith(
                'gun_sonu_hatirlatici',
                expect.any(String),
                expect.any(String),
                22,
                15
            );

            // 2) Otomatik moda geçiş -> imsak(05:30) - 30dk = 05:00'e YENİDEN planlanır
            mockBildirimPlanla.mockClear();
            await store.dispatch(
                seriAyarlariniGuncelle({
                    ayarlar: {
                        gunSonuBildirimModu: 'otomatik',
                        bildirimImsakOncesiDk: 30,
                    },
                }) as never
            );
            expect(mockBildirimPlanla).toHaveBeenLastCalledWith(
                'gun_sonu_hatirlatici',
                expect.any(String),
                expect.any(String),
                5,
                0
            );
        });

        it('bildirim kapatıldığında planlama yapılmaz, iptal çağrılır', async () => {
            // gunSonuBildirimAktif:false -> bildirimPlanla DEĞİL bildirimIptalEt çağrılmalı.
            const store = storeOlustur();
            mockBildirimPlanla.mockClear();
            mockBildirimIptalEt.mockClear();

            await store.dispatch(
                seriAyarlariniGuncelle({
                    ayarlar: { gunSonuBildirimAktif: false },
                }) as never
            );

            expect(mockBildirimPlanla).not.toHaveBeenCalled();
            expect(mockBildirimIptalEt).toHaveBeenCalledWith('gun_sonu_hatirlatici');
        });
    });
});
