/**
 * Gün Sonu Bildirimi Entegrasyon Testleri
 * SeriAyarlari, seriAyarlariniGuncelle thunk'ı ve KonumYoneticiServisi
 * entegrasyonunu test eder.
 *
 * Bu testler ÜRETİM YOLUNU egzersiz eder: gerçek bir Redux store kurulur,
 * seriAyarlariniGuncelle thunk'ı dispatch edilir ve `GunSonuHatirlaticiServisi`nin
 * expo-notifications'a kurduğu İLK tarihli tetiğin saat/dakikası doğrulanır.
 * (Hatırlatma artık DAILY değil, seri günü başına tarihli tetiktir — issue #272:
 * özel gün kapısı tarih ister.) Beklenen değerler BAĞIMSIZ hesaplanır.
 */

import { configureStore } from '@reduxjs/toolkit';
import * as Notifications from 'expo-notifications';

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
import { NamazVaktiHesaplayiciServisi } from '../domain/services/NamazVaktiHesaplayiciServisi';

/**
 * Uretim kodu artik imsagi `NamazVaktiHesaplayiciServisi` uzerinden okuyor.
 *
 * NEDEN DEGISTI: `KonumYoneticiServisi.durum.koordinatlar` uretimde HIC
 * doldurulmuyor (setter'lari yalniz testlerden cagriliyor) -> eski kaynak sahada
 * DAIMA null donuyordu ve bildirim hep 04:00 fallback'ine dusuyordu. Ayrica eski
 * fonksiyon KOSULSUZ YARININ fajr'ini donduruyordu.
 *
 * Saglayici tarihten bagimsiz sabit bir imsak dondurur; `sonrakiImsakVaktiBul`
 * bugun/yarin hangi dala girerse girsin ayni degeri alir -> test deterministik.
 */
const imsagiSabitle = (imsak: Date | null) => {
    jest.spyOn(NamazVaktiHesaplayiciServisi, 'getInstance').mockReturnValue({
        getKonfig: () => ({ latitude: 41.0082, longitude: 28.9784 }),
        // Plan HER seri günü için o günün imsağını sorar → istenen günün aynı
        // saat:dakikası döndürülür (sabit geçmiş bir tarih tüm tetikleri geçmişe atardı).
        getGunlukVakitler: (tarih: Date) =>
            imsak
                ? {
                    imsak: new Date(
                        tarih.getFullYear(),
                        tarih.getMonth(),
                        tarih.getDate(),
                        imsak.getHours(),
                        imsak.getMinutes()
                    ),
                }
                : null,
    } as unknown as NamazVaktiHesaplayiciServisi);
};
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

type BildirimMock = jest.Mock & { mock: { calls: unknown[][] } };
const zamanlaMock = () => Notifications.scheduleNotificationAsync as unknown as BildirimMock;
const iptalMock = () => Notifications.cancelScheduledNotificationAsync as unknown as BildirimMock;

/** Kurulan tetiklerin (kimlik, an) listesi. */
function kurulanTetikler(): { kimlik: string; an: Date; baslik: string; govde: string }[] {
    return zamanlaMock().mock.calls.map((c) => {
        const istek = c[0] as {
            identifier: string;
            content: { title: string; body: string };
            trigger: { date: Date };
        };
        return {
            kimlik: istek.identifier,
            an: istek.trigger.date,
            baslik: istek.content.title,
            govde: istek.content.body,
        };
    });
}

function bildirimMocklariniKur() {
    zamanlaMock().mockReset();
    zamanlaMock().mockResolvedValue('ok');
    iptalMock().mockReset();
    iptalMock().mockResolvedValue(undefined);
    (Notifications.getAllScheduledNotificationsAsync as unknown as jest.Mock).mockResolvedValue([]);
}

/**
 * seriAyarlariniGuncelle dispatch edip kurulan İLK (en yakın) tetiğin
 * (saat, dakika) çiftini döndürür. Her tetik aynı saatte olmalı (gün başına
 * bir tane) — ayrıca doğrulanır.
 */
async function planlananSaatiAl(
    ayarlar: Partial<typeof VARSAYILAN_SERI_AYARLARI>
): Promise<{ saat: number; dakika: number }> {
    bildirimMocklariniKur();
    const store = storeOlustur();
    await store.dispatch(seriAyarlariniGuncelle({ ayarlar }) as never);

    const tetikler = kurulanTetikler();
    expect(tetikler.length).toBeGreaterThan(0);
    const ilk = tetikler[0];
    for (const t of tetikler) {
        expect(t.kimlik.startsWith('gun_sonu_hatirlatici_')).toBe(true);
        expect([t.an.getHours(), t.an.getMinutes()]).toEqual([ilk.an.getHours(), ilk.an.getMinutes()]);
    }
    return { saat: ilk.an.getHours(), dakika: ilk.an.getMinutes() };
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

        it('sonraki gün imsak vakti BİLİNEN referans değere eşit olmalı (İstanbul, 15 Haz 2026 → 03:24)', () => {
            // FİZİKİ DOĞRULUK REFERANSI: Sadece "2-7 arası mı" değil, dakika hassasiyetinde
            // bilinen bir değere kilitliyoruz. Sistem saatini 14 Haz 2026 öğlene donduruyoruz;
            // sonrakiGunImsakVaktiGetir() yarını (15 Haz) hesaplar. adhan CalculationMethod.Turkey()
            // ile İstanbul imsakı 03:24'tür (Avrupa/İstanbul). Yanlış yöntem/açı/parametre
            // regresyonu (örn. başka bir CalculationMethod) bu dakika değerini kaydırır → FAIL.
            // Saati Avrupa/İstanbul timezone'ında çıkardığımız için CI'nın UTC olması sonucu DEĞİŞTİRMEZ.
            jest.useFakeTimers();
            try {
                jest.setSystemTime(new Date(2026, 5, 14, 12, 0, 0, 0)); // 14 Haz 2026 12:00 yerel
                konumServisi.koordinatlarAyarla(41.0082, 28.9784);

                const imsakVakti = konumServisi.sonrakiGunImsakVaktiGetir();
                expect(imsakVakti).not.toBeNull();

                const istanbulHHMM = imsakVakti!.toLocaleString('en-US', {
                    timeZone: 'Europe/Istanbul',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                });
                // adhan referans: İstanbul, 15 Haziran 2026 imsak = 03:24
                expect(istanbulHHMM).toBe('03:24');
            } finally {
                jest.useRealTimers();
            }
        });

        it('sonraki gün imsakı YARININ tarihini kullanır ve bugünkü imsaktan farklıdır (setDate +1)', () => {
            // sonrakiGunImsakVaktiGetir vs bugunImsakVaktiGetir AYRIMI: yanlışlıkla bugünün
            // imsakı dönerse (setDate(+1) atlanırsa) bu test FAIL eder. Sistem saatini sabit
            // bir öğlene donduruyoruz; iki vaktin takvim günü (ve dolayısıyla saniye damgası)
            // tam olarak 1 gün farklı olmalı.
            jest.useFakeTimers();
            try {
                jest.setSystemTime(new Date(2026, 5, 14, 12, 0, 0, 0)); // 14 Haz 2026 12:00
                konumServisi.koordinatlarAyarla(41.0082, 28.9784);

                const bugunImsak = konumServisi.bugunImsakVaktiGetir();
                const yarinImsak = konumServisi.sonrakiGunImsakVaktiGetir();

                expect(bugunImsak).not.toBeNull();
                expect(yarinImsak).not.toBeNull();

                // Yarının imsakı bugünden SONRA (en az birkaç saat ileri) olmalı.
                expect(yarinImsak!.getTime()).toBeGreaterThan(bugunImsak!.getTime());

                // Aynı şehir + ardışık iki gün → fark tam 1 gün (1440 dk) civarı olmalı.
                // (İmsak günden güne ~1 dk değişir; 1 gün ± 5 dk penceresiyle sınırlıyoruz.)
                const farkDk = (yarinImsak!.getTime() - bugunImsak!.getTime()) / 60000;
                expect(farkDk).toBeGreaterThan(1440 - 5);
                expect(farkDk).toBeLessThan(1440 + 5);
            } finally {
                jest.useRealTimers();
            }
        });

        it('koordinat YOKKEN sonrakiGunImsakVaktiGetir null döner (gerçek servis fallback kaynağı)', () => {
            // KONUM YOK FALLBACK kaynağı: thunk 04:00 fallback'ine GİRMESİ için gerçek servisin
            // koordinat ayarlanmadığında null dönmesi şarttır. sifirla() koordinatları null yapar.
            // Bu, mock'lanmış getInstance ile değil, GERÇEK üretim metoduyla doğrulanır.
            konumServisi.sifirla();

            expect(konumServisi.sonrakiGunImsakVaktiGetir()).toBeNull();
            expect(konumServisi.bugunImsakVaktiGetir()).toBeNull();
        });

        it('otomatik mod: bildirim, imsaktan bildirimImsakOncesiDk kadar önceye planlanır', async () => {
            // Üretim kodu (core/seri/gunSonuPlani) her seri günü için ERTESİ günün imsağını
            // hesaplayıcıdan alıp X dk geri çeker. Burada imsak saatini BİLİNEN bir değere
            // kilitleyip aynı bağımsız yöntemle beklenen değeri hesaplıyoruz.
            const imsak = new Date(2026, 1, 1, 6, 15, 0, 0); // 1 Şubat 2026, 06:15 yerel
            imsagiSabitle(imsak);

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
            imsagiSabitle(imsak);

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
            // gunSonuPlani: imsak null ise fallback 04:00.
            imsagiSabitle(null);

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
            // Üretim kodu (gunSonuPlani) SABIT modda bildirimGunSecimi'ni saat
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
            // GÖZLEMLENEBİLİR etki: mod değişince tetikler yeni (saat,dakika) ile yeniden kurulur.
            const imsak = new Date(2026, 1, 1, 5, 30, 0, 0); // 05:30
            imsagiSabitle(imsak);

            const store = storeOlustur();

            // 1) Sabit mod -> kullanıcının seçtiği 22:15
            bildirimMocklariniKur();
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
            const sabit = kurulanTetikler()[0].an;
            expect([sabit.getHours(), sabit.getMinutes()]).toEqual([22, 15]);

            // 2) Otomatik moda geçiş -> imsak(05:30) - 30dk = 05:00'e YENİDEN planlanır
            bildirimMocklariniKur();
            await store.dispatch(
                seriAyarlariniGuncelle({
                    ayarlar: {
                        gunSonuBildirimModu: 'otomatik',
                        bildirimImsakOncesiDk: 30,
                    },
                }) as never
            );
            const otomatik = kurulanTetikler()[0].an;
            expect([otomatik.getHours(), otomatik.getMinutes()]).toEqual([5, 0]);
        });

        it('bildirim kapatıldığında planlama yapılmaz, iptal çağrılır', async () => {
            // gunSonuBildirimAktif:false -> hiçbir tetik kurulmaz, iptal çağrılır.
            const store = storeOlustur();
            bildirimMocklariniKur();

            await store.dispatch(
                seriAyarlariniGuncelle({
                    ayarlar: { gunSonuBildirimAktif: false },
                }) as never
            );

            expect(zamanlaMock()).not.toHaveBeenCalled();
            // Eski DAILY kimliği de (göç) iptal edilir.
            expect(iptalMock()).toHaveBeenCalledWith('gun_sonu_hatirlatici');
        });
    });
});
