/**
 * ArkaplanMuhafizServisi bildirim çakışma testi
 */
import * as Notifications from 'expo-notifications';

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
    scheduleNotificationAsync: jest.fn(),
    cancelScheduledNotificationAsync: jest.fn(),
    getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
    AndroidNotificationPriority: {
        MAX: 'max',
        HIGH: 'high',
    },
    SchedulableTriggerInputTypes: {
        DATE: 'date',
    },
}));

// Mock BildirimServisi (MUHAFIZ_KATEGORISI icin)
jest.mock('../BildirimServisi', () => ({
    MUHAFIZ_KATEGORISI: 'muhafiz_category',
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(null),
}));

// Mock adhan
//
// Vakit zaman cizelgesi (su an = now):
//   imsak.cikis  = sunrise = now - 3 saat   (gecmis)
//   ogle.cikis   = asr     = now - 1 saat   (gecmis)
//   ikindi.cikis = maghrib = now            (gecmis/su an)
//   aksam.cikis  = isha    = now + 30 dk    (GELECEK -> tek planlanabilir vakit)
//   yatsi.cikis  = yarinin fajr = now - 4 saat (gecmis -> elenir)
//
// Bu yuzden TUM bildirim planlamasi 'aksam' vakti uzerinden olur ve cikisa
// tam 30 dk kala baslar. Esik/siklik kombinasyonlarini bu 30 dk'lik
// pencerede deterministik olarak test edebiliriz.
jest.mock('adhan', () => {
    const now = new Date();
    // Vakit çıkışı şu andan 30 dakika sonra olsun
    const cikis = new Date(now.getTime() + 30 * 60 * 1000);

    return {
        Coordinates: jest.fn(),
        CalculationMethod: {
            Turkey: jest.fn().mockReturnValue({}),
        },
        PrayerTimes: jest.fn().mockImplementation(() => ({
            fajr: new Date(now.getTime() - 4 * 60 * 60 * 1000),
            sunrise: new Date(now.getTime() - 3 * 60 * 60 * 1000),
            dhuhr: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            asr: new Date(now.getTime() - 1 * 60 * 60 * 1000),
            maghrib: now,
            isha: cikis, // Aksam vakti su an girdi, 30 dk sonra cikiyor
        })),
    };
});

import { ArkaplanMuhafizServisi } from '../ArkaplanMuhafizServisi';
import { PrayerTimes } from 'adhan';
import { bugunuAl, dunuAl } from '../../../core/utils/TarihYardimcisi';

/**
 * Planlanan bir bildirim cagrisindan dakika son-ekini (_dk_N) cikarir.
 * Uretim ID formati: muhafiz_{tarih}_vakit_{vakit}_seviye_{seviye}_dk_{kalanDk}
 */
const dkSonEkiniAl = (identifier: string): number => {
    const eslesme = identifier.match(/_dk_(\d+)$/);
    return eslesme ? parseInt(eslesme[1], 10) : NaN;
};

/**
 * adhan PrayerTimes mock'unun varsayilan davranisini (modul yuklenirken kurulan)
 * yeniden uretir. Bir test ozel vakitler kurduktan sonra bu helper ile geri donulur
 * (jest.clearAllMocks implementasyonu SIFIRLAMAZ, yalniz cagri kayitlarini temizler).
 *
 * Varsayilan cizelge (su an = now):
 *   fajr=now-4s, sunrise=now-3s, dhuhr=now-2s, asr=now-1s, maghrib=now, isha=now+30dk
 * => yalniz 'aksam' (cikis=isha) gelecekte; tum planlama onun uzerinden olur.
 */
const varsayilanVakitleriKur = (): void => {
    (PrayerTimes as jest.Mock).mockImplementation(() => {
        const now = new Date();
        return {
            fajr: new Date(now.getTime() - 4 * 60 * 60 * 1000),
            sunrise: new Date(now.getTime() - 3 * 60 * 60 * 1000),
            dhuhr: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            asr: new Date(now.getTime() - 1 * 60 * 60 * 1000),
            maghrib: now,
            isha: new Date(now.getTime() + 30 * 60 * 1000),
        };
    });
};

/**
 * jest.clearAllMocks() yalniz cagri kayitlarini temizler; bir onceki testin
 * KURDUGU mockImplementation/mockResolvedValue'lar SIZAR. Bu helper, paylasilan
 * AsyncStorage ve bildirim mock'larini temiz varsayilanlara dondurur:
 *   - getItem -> null (hicbir vakit kilinmamis, hicbir kilinan-listesi yok)
 *   - getAllScheduledNotificationsAsync -> [] (planli bildirim yok)
 */
const varsayilanMocklariSifirla = (): void => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    (AsyncStorage.getItem as jest.Mock).mockReset().mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockReset().mockResolvedValue(null);
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockReset().mockResolvedValue([]);
};

describe('ArkaplanMuhafizServisi - Bildirim Çakışma Testi', () => {
    let servis: ArkaplanMuhafizServisi;

    beforeEach(() => {
        jest.clearAllMocks();
        // Singleton'ı resetle
        (ArkaplanMuhafizServisi as any).instance = undefined;
        servis = ArkaplanMuhafizServisi.getInstance();
    });

    test('Aynı dakikaya düşen bildirimler birleştirilmeli', async () => {
        // Tum esikler ayni dakikaya (25) ve sikligi pencereden buyuk (30) ayarlanir.
        // Boylece dort seviye de YALNIZ 25. dakikada aktif olur ve uretim bunlari
        // tek bildirime indirgemeli (cakisan dakikada en yuksek seviye kazanir).
        await servis.yapilandirVePlanla({
            aktif: true,
            koordinatlar: { lat: 41.0, lng: 29.0 },
            esikler: {
                seviye1: 25,
                seviye1Siklik: 30,
                seviye2: 25,
                seviye2Siklik: 30,
                seviye3: 25,
                seviye3Siklik: 30,
                seviye4: 25,
                seviye4Siklik: 30,
            },
        });

        const scheduleCalllari = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;

        // Ayni dakikaya dusen 4 seviye TEK bildirime indirgenmeli.
        // (Birlestirme bozulursa burada 4 cagri olur ve test FAIL eder.)
        expect(scheduleCalllari.length).toBe(1);

        // Birlesen tek bildirim, cakisan en yuksek seviyeyi (seviye 4) tasimali
        const tekBildirim = scheduleCalllari[0][0];
        expect(tekBildirim.content.data.seviye).toBe(4);
        expect(tekBildirim.content.title).toBe('🚨 VAKİT ÇIKIYOR!');
        // Cakisma 25. dakikada oldugu icin ID son-eki _dk_25 olmali
        expect(dkSonEkiniAl(tekBildirim.identifier)).toBe(25);
        // Seviye 4 acil kanala baglanmali (ses/titresim ayarlari icin)
        expect(tekBildirim.trigger.channelId).toBe('muhafiz_acil');
    });

    test('Çakışan dakikada en yüksek seviye kazanmalı (override)', async () => {
        // Seviye3 (15/siklik5) ve Seviye4 (10/siklik5) AYNI 10. dakikaya dusecek
        // sekilde secildi: seviye3 icin (15-10)%5===0, seviye4 icin (10-10)%5===0.
        // Uretim, ayni dakikada en yuksek seviyeyi (4) tutmali; ikinci (seviye3)
        // bir bildirim olusturmamali.
        await servis.yapilandirVePlanla({
            aktif: true,
            koordinatlar: { lat: 41.0, lng: 29.0 },
            esikler: {
                seviye1: 25,
                seviye1Siklik: 15,
                seviye2: 20,
                seviye2Siklik: 10,
                seviye3: 15,
                seviye3Siklik: 5,
                seviye4: 10,
                seviye4Siklik: 5,
            },
        });

        const scheduleCalllari = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;

        // 10. dakikadaki bildirimleri bul
        const onDkBildirimleri = scheduleCalllari
            .map((c) => c[0])
            .filter((b) => dkSonEkiniAl(b.identifier) === 10);

        // Ayni dakika icin yalnizca TEK bildirim olmali (cakisma birlestirildi)
        expect(onDkBildirimleri.length).toBe(1);
        // Ve bu bildirim cakismada kazanan en yuksek seviyeyi (4) tasimali
        expect(onDkBildirimleri[0].content.data.seviye).toBe(4);
        expect(onDkBildirimleri[0].content.title).toBe('🚨 VAKİT ÇIKIYOR!');
    });

    test('Farklı dakikalara düşen bildirimler ayrı planlanmalı', async () => {
        // Esikler: sv1=25/15, sv2=20/10, sv3=15/5, sv4=10/2
        // Bu degerlerle 'aksam' vakti (cikisa 30 dk) icin uretim mantigi:
        //   k=25 -> seviye1 baslangici            -> seviye 1
        //   k=20 -> seviye2 baslangici            -> seviye 2
        //   k=15 -> seviye3 baslangici            -> seviye 3
        //   k=10 -> seviye4 baslangici            -> seviye 4
        //   k=8,6,4,2 -> seviye4 sikligi (10-k)%2===0 -> seviye 4
        // Bagimsiz olarak BEKLENEN dakika seti tam olarak budur:
        const beklenenDakikalar = [25, 20, 15, 10, 8, 6, 4, 2];

        await servis.yapilandirVePlanla({
            aktif: true,
            koordinatlar: { lat: 41.0, lng: 29.0 },
            esikler: {
                seviye1: 25,
                seviye1Siklik: 15,
                seviye2: 20,
                seviye2Siklik: 10,
                seviye3: 15,
                seviye3Siklik: 5,
                seviye4: 10,
                seviye4Siklik: 2,
            },
        });

        const scheduleCalllari = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
        const bildirimler = scheduleCalllari.map((c) => c[0]);

        // 1) Planlanan tam dakika seti uretim mantigiyla bagimsiz turetilen sete esit olmali.
        //    (Esik/siklik aritmetigi bozulursa bu set degisir ve test FAIL eder.)
        const planlananDakikalar = bildirimler.map((b) => dkSonEkiniAl(b.identifier)).sort((a, b) => b - a);
        expect(planlananDakikalar).toEqual([...beklenenDakikalar].sort((a, b) => b - a));

        // 2) Her dakika icin TEK bildirim olmali (cakisma yok) — eski zayif assertion'in koruyup
        //    guclendirilmis hali: dakika sayisi = unique dakika sayisi.
        const uniqueDakikalar = new Set(planlananDakikalar);
        expect(uniqueDakikalar.size).toBe(planlananDakikalar.length);

        // 3) Dakika -> seviye/baslik eslemesi fiziki kurala uymali.
        const dkToBildirim = new Map<number, any>();
        for (const b of bildirimler) {
            dkToBildirim.set(dkSonEkiniAl(b.identifier), b);
        }
        expect(dkToBildirim.get(25)!.content.data.seviye).toBe(1);
        expect(dkToBildirim.get(25)!.content.title).toBe('⏰ Namaz Hatırlatıcı');
        expect(dkToBildirim.get(20)!.content.data.seviye).toBe(2);
        expect(dkToBildirim.get(20)!.content.title).toBe('⚠️ Vakit Daralıyor');
        expect(dkToBildirim.get(15)!.content.data.seviye).toBe(3);
        expect(dkToBildirim.get(15)!.content.title).toBe('🔥 Şeytanla Mücadele!');
        // k=10,8,6,4,2 tamamen seviye 4 olmali
        for (const k of [10, 8, 6, 4, 2]) {
            expect(dkToBildirim.get(k)!.content.data.seviye).toBe(4);
            expect(dkToBildirim.get(k)!.content.title).toBe('🚨 VAKİT ÇIKIYOR!');
        }

        // 4) ID'deki dakika son-eki gercek planlanan zamanla TUTARLI olmali.
        //    Tum bildirimler ayni vaktin cikisini referans aldigi icin
        //    (triggerZamani + k*60sn) tum cagrilarda SABIT olmali. Aksi halde
        //    ID'deki dakika ile gercek tetiklenme zamani uyumsuzdur (regresyon).
        const referansCikislar = bildirimler.map((b) => {
            const k = dkSonEkiniAl(b.identifier);
            const triggerZamani = new Date(b.trigger.date).getTime();
            return triggerZamani + k * 60 * 1000;
        });
        expect(new Set(referansCikislar).size).toBe(1);
    });

    test('Kılınmış vakitler için bildirim planlanmamalı', async () => {
        const AsyncStorage = require('@react-native-async-storage/async-storage');

        const bugun = new Date();
        const tarih = `${bugun.getFullYear()}-${String(bugun.getMonth() + 1).padStart(2, '0')}-${String(bugun.getDate()).padStart(2, '0')}`;
        const kilinanAnahtar = `muhafiz_ayarlari_kilinan_${tarih}`;
        const esikler = {
            seviye1: 25,
            seviye1Siklik: 15,
            seviye2: 20,
            seviye2Siklik: 10,
            seviye3: 15,
            seviye3Siklik: 5,
            seviye4: 10,
            seviye4Siklik: 2,
        };

        // (a) BASELINE: 'aksam' KILINMAMIŞ iken bildirim olusmali.
        //     Bu kıyas olmadan, kılınmış filtresinin etkisi "sadece-gecmis-eleme"
        //     ile karistirilabilir. Once filtre yokken sayinin > 0 oldugunu kanitla.
        AsyncStorage.getItem.mockResolvedValue(null);
        await servis.yapilandirVePlanla({
            aktif: true,
            koordinatlar: { lat: 41.0, lng: 29.0 },
            esikler,
        });
        const aksamOnce = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.filter(
            (c) => c[0].identifier?.includes('_vakit_aksam')
        ).length;
        expect(aksamOnce).toBeGreaterThan(0);

        // (b) 'aksam' KILINMIŞ iken AYNI esiklerle hicbir aksam bildirimi olmamali.
        jest.clearAllMocks();
        (ArkaplanMuhafizServisi as any).instance = undefined;
        servis = ArkaplanMuhafizServisi.getInstance();
        AsyncStorage.getItem.mockImplementation((key: string) =>
            Promise.resolve(key === kilinanAnahtar ? JSON.stringify(['aksam']) : null)
        );
        await servis.yapilandirVePlanla({
            aktif: true,
            koordinatlar: { lat: 41.0, lng: 29.0 },
            esikler,
        });
        const aksamSonra = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.filter(
            (c) => c[0].identifier?.includes('_vakit_aksam')
        ).length;
        expect(aksamSonra).toBe(0);
    });
});

// ============================================================
// Esikler: tek planlanabilir vakit (aksam) icin standart 4 seviye.
// Cogu icerik/zamanlama testi bu sabiti paylasir.
// ============================================================
const STANDART_ESIKLER = {
    seviye1: 25,
    seviye1Siklik: 15,
    seviye2: 20,
    seviye2Siklik: 10,
    seviye3: 15,
    seviye3Siklik: 5,
    seviye4: 10,
    seviye4Siklik: 2,
};

describe('ArkaplanMuhafizServisi - Bildirim icerigi (oncelik/kanal/data)', () => {
    let servis: ArkaplanMuhafizServisi;

    beforeEach(() => {
        jest.clearAllMocks();
        varsayilanMocklariSifirla();
        varsayilanVakitleriKur();
        (ArkaplanMuhafizServisi as any).instance = undefined;
        servis = ArkaplanMuhafizServisi.getInstance();
    });

    afterEach(() => {
        // Bir sonraki suite'in varsayilanla baslamasi icin implementasyonu geri al.
        varsayilanVakitleriKur();
    });

    test('Seviye>=3 bildirimleri MAX oncelik + acil kanala, seviye<3 HIGH + normal kanala baglanir', async () => {
        await servis.yapilandirVePlanla({
            aktif: true,
            koordinatlar: { lat: 41.0, lng: 29.0 },
            esikler: STANDART_ESIKLER,
        });

        const bildirimler = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map((c) => c[0]);
        expect(bildirimler.length).toBeGreaterThan(0);

        // Her bildirim icin seviye -> oncelik/kanal kontrati DOGRU olmali.
        for (const b of bildirimler) {
            const seviye: number = b.content.data.seviye;
            if (seviye >= 3) {
                expect(b.content.priority).toBe(Notifications.AndroidNotificationPriority.MAX);
                expect(b.trigger.channelId).toBe('muhafiz_acil');
            } else {
                expect(b.content.priority).toBe(Notifications.AndroidNotificationPriority.HIGH);
                expect(b.trigger.channelId).toBe('muhafiz');
            }
        }

        // En az bir seviye<3 ve bir seviye>=3 ornegi gercekten uretilmis olmali
        // (aksi halde dallardan biri hic dogrulanmamis sayilir).
        const seviyeler = bildirimler.map((b) => b.content.data.seviye);
        expect(seviyeler.some((s) => s < 3)).toBe(true);
        expect(seviyeler.some((s) => s >= 3)).toBe(true);
    });

    test('Bildirim data alanlari (tip/seviye/vakit/tarih) ve kategori dogru doldurulur', async () => {
        await servis.yapilandirVePlanla({
            aktif: true,
            koordinatlar: { lat: 41.0, lng: 29.0 },
            esikler: STANDART_ESIKLER,
        });

        const bildirimler = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map((c) => c[0]);
        expect(bildirimler.length).toBeGreaterThan(0);

        const bugun = bugunuAl();
        for (const b of bildirimler) {
            expect(b.content.categoryIdentifier).toBe('muhafiz_category');
            expect(b.content.data.tip).toBe('muhafiz');
            // Tek planlanabilir vakit 'aksam' ve bugune ait.
            expect(b.content.data.vakit).toBe('aksam');
            expect(b.content.data.tarih).toBe(bugun);
            // data.seviye, identifier'daki _seviye_N ile tutarli olmali.
            const seviyeEslesme = b.identifier.match(/_seviye_(\d+)_/);
            expect(seviyeEslesme).not.toBeNull();
            expect(b.content.data.seviye).toBe(parseInt(seviyeEslesme![1], 10));
        }
    });

    test('Bildirim tetik zamani sayisal olarak (cikis - kalanDk*60s) ile birebir eslesir', async () => {
        // 'aksam' cikisi (isha) = now + 30dk. Her bildirimin trigger.date'i
        // tam olarak cikis - kalanDk*60sn olmali. Iki bildirimin (25dk ve 10dk)
        // mutlak zaman farki tam (25-10)=15 dk olmali.
        await servis.yapilandirVePlanla({
            aktif: true,
            koordinatlar: { lat: 41.0, lng: 29.0 },
            esikler: STANDART_ESIKLER,
        });

        const bildirimler = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map((c) => c[0]);
        const zamanlar = new Map<number, number>();
        for (const b of bildirimler) {
            zamanlar.set(dkSonEkiniAl(b.identifier), new Date(b.trigger.date).getTime());
        }

        // cikis = trigger.date + kalanDk*60sn => her bildirim icin SABIT cikis turetilir.
        const turetilenCikislar = [...zamanlar.entries()].map(([dk, ts]) => ts + dk * 60 * 1000);
        const benzersizCikis = new Set(turetilenCikislar);
        expect(benzersizCikis.size).toBe(1);

        // 25dk ve 10dk bildirimleri arasindaki fark tam 15 dakika (900000 ms) olmali.
        expect(zamanlar.has(25)).toBe(true);
        expect(zamanlar.has(10)).toBe(true);
        expect(zamanlar.get(25)! - zamanlar.get(10)!).toBe(-15 * 60 * 1000);
        // (25dk kala olan, 10dk kala olandan 15 dk ONCE tetiklenir.)
        expect(zamanlar.get(10)! - zamanlar.get(25)!).toBe(15 * 60 * 1000);
    });
});

describe('ArkaplanMuhafizServisi - Aktif/pasif ve siklik savunmasi', () => {
    let servis: ArkaplanMuhafizServisi;

    beforeEach(() => {
        jest.clearAllMocks();
        varsayilanMocklariSifirla();
        varsayilanVakitleriKur();
        (ArkaplanMuhafizServisi as any).instance = undefined;
        servis = ArkaplanMuhafizServisi.getInstance();
    });

    afterEach(() => {
        varsayilanVakitleriKur();
    });

    test('aktif:false iken hicbir yeni bildirim planlanmaz, mevcut muhafiz bildirimleri iptal edilir', async () => {
        // Onceden planlanmis 1 muhafiz + 1 alakasiz bildirim simule et.
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
            { identifier: 'muhafiz_2026-06-07_vakit_aksam_seviye_2_dk_20' },
            { identifier: 'baska_bir_bildirim' },
        ]);

        await servis.yapilandirVePlanla({
            aktif: false,
            koordinatlar: { lat: 41.0, lng: 29.0 },
            esikler: STANDART_ESIKLER,
        });

        // Hicbir yeni bildirim planlanmamali.
        expect((Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.length).toBe(0);

        // Yalniz muhafiz onekli eski bildirim iptal edilmeli; alakasiz olan KORUNMALI.
        const iptalEdilenler = (Notifications.cancelScheduledNotificationAsync as jest.Mock).mock.calls.map(
            (c) => c[0]
        );
        expect(iptalEdilenler).toContain('muhafiz_2026-06-07_vakit_aksam_seviye_2_dk_20');
        expect(iptalEdilenler).not.toContain('baska_bir_bildirim');
    });

    test('siklik=0 iken (fark % 0 = NaN) hic bildirim atilmaz ve crash olmaz', async () => {
        // Tum sikliklar 0 => uretimdeki `aktifSiklik > 0` kapisi her dakikada kapanir.
        // Beklenti: cagri patlamaz ve 0 bildirim planlanir (baslangic dakikasi dahil).
        await expect(
            servis.yapilandirVePlanla({
                aktif: true,
                koordinatlar: { lat: 41.0, lng: 29.0 },
                esikler: {
                    seviye1: 25,
                    seviye1Siklik: 0,
                    seviye2: 20,
                    seviye2Siklik: 0,
                    seviye3: 15,
                    seviye3Siklik: 0,
                    seviye4: 10,
                    seviye4Siklik: 0,
                },
            })
        ).resolves.toBeUndefined();

        expect((Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.length).toBe(0);
    });
});

describe('ArkaplanMuhafizServisi - Gece yarisi: dun-yatsi gecisi', () => {
    let servis: ArkaplanMuhafizServisi;

    beforeEach(() => {
        jest.clearAllMocks();
        varsayilanMocklariSifirla();
        (ArkaplanMuhafizServisi as any).instance = undefined;
        servis = ArkaplanMuhafizServisi.getInstance();
    });

    afterEach(() => {
        // Ozel (fajr=gelecek) vakitleri kurdugumuz icin varsayilana don.
        varsayilanVakitleriKur();
    });

    test('imsak vaktinden ONCE iken dunun yatsisi DUN tarihine planlanir', async () => {
        // Su an imsaktan once: fajr = now + 30dk (gelecek). Boylece uretim
        // `simdi < bugunPrayerTimes.fajr` dalina girer ve dunun yatsisini
        // (cikis = bugunun fajr'i) DUN tarihiyle ekler.
        (PrayerTimes as jest.Mock).mockImplementation(() => {
            const now = new Date();
            return {
                // imsak henuz girmedi: fajr gelecekte.
                fajr: new Date(now.getTime() + 30 * 60 * 1000),
                sunrise: new Date(now.getTime() + 90 * 60 * 1000),
                dhuhr: new Date(now.getTime() + 5 * 60 * 60 * 1000),
                asr: new Date(now.getTime() + 8 * 60 * 60 * 1000),
                maghrib: new Date(now.getTime() + 11 * 60 * 60 * 1000),
                // dunun yatsisi (giris) gecmiste olmali ki pencere makul olsun.
                isha: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            };
        });

        await servis.yapilandirVePlanla({
            aktif: true,
            koordinatlar: { lat: 41.0, lng: 29.0 },
            // fajr'a 30 dk var; bu pencerede en az birkac bildirim dussun diye genis esik.
            esikler: STANDART_ESIKLER,
        });

        const bildirimler = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map((c) => c[0]);
        const dun = dunuAl();

        // Dun-yatsi bildirimleri: hem data.tarih hem identifier DUN tarihini tasimali.
        const dunYatsiBildirimleri = bildirimler.filter(
            (b) => b.content.data.vakit === 'yatsi' && b.content.data.tarih === dun
        );
        expect(dunYatsiBildirimleri.length).toBeGreaterThan(0);
        for (const b of dunYatsiBildirimleri) {
            // ID, dun tarihini ve yatsi vaktini icermeli (yanlislikla bugune yazilirsa FAIL).
            expect(b.identifier).toContain(`muhafiz_${dun}_vakit_yatsi`);
            // Tetik zamani gelecekte (henuz girmemis fajr'a dogru) olmali.
            expect(new Date(b.trigger.date).getTime()).toBeGreaterThan(Date.now());
        }

        // Bugun tarihine yazilmis bir 'yatsi' bildirimi varsa bile, dun olani ayri
        // identifier tasidigi icin karismamali: en az bir dun-yatsi mutlaka var.
        const bugun = bugunuAl();
        const yanlisTarihliDunYatsi = bildirimler.filter(
            (b) => b.identifier.includes('_vakit_yatsi') && b.content.data.tarih === dun && b.identifier.includes(`muhafiz_${bugun}_`)
        );
        expect(yanlisTarihliDunYatsi.length).toBe(0);
    });
});

describe('ArkaplanMuhafizServisi - Kullanici tetikli akislar (kildim/kilmadim)', () => {
    let servis: ArkaplanMuhafizServisi;
    const AsyncStorage = require('@react-native-async-storage/async-storage');

    beforeEach(() => {
        jest.clearAllMocks();
        varsayilanMocklariSifirla();
        varsayilanVakitleriKur();
        (ArkaplanMuhafizServisi as any).instance = undefined;
        servis = ArkaplanMuhafizServisi.getInstance();
    });

    afterEach(() => {
        varsayilanVakitleriKur();
    });

    test('vakitBildirimleriniIptalEt: o vaktin bildirimlerini iptal eder ve kilinani BUGUN tarihine yazar', async () => {
        // Once muhafizi yapilandir ki this.ayarlar dolsun (vakitIcinDogruTarihiAl
        // ayarsizken bugunuAl() doner; aksam zaten her durumda bugun).
        await servis.yapilandirVePlanla({
            aktif: true,
            koordinatlar: { lat: 41.0, lng: 29.0 },
            esikler: STANDART_ESIKLER,
        });

        // Planlanmis 2 aksam + 1 alakasiz bildirim simule et.
        // Servis yalniz bugun/dun tarihli ID'leri eslestirdiginden tarih sabit
        // yazilamaz (testi yazildigi gunden sonra patlatir) — bugunuAl() kullan.
        const bugunTarihi = bugunuAl();
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
            { identifier: `muhafiz_${bugunTarihi}_vakit_aksam_seviye_2_dk_20` },
            { identifier: `muhafiz_${bugunTarihi}_vakit_aksam_seviye_4_dk_10` },
            { identifier: `muhafiz_${bugunTarihi}_vakit_ogle_seviye_1_dk_25` },
        ]);
        // setItem cagrisini gozlemlemek icin temizle (yapilandir asamasindaki cagrilar sayilmasin).
        (AsyncStorage.setItem as jest.Mock).mockClear();
        (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockClear();
        // kilinan listesi bos baslasin.
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

        await servis.vakitBildirimleriniIptalEt('aksam');

        // Yalniz 'aksam' bildirimleri iptal edilmeli, 'ogle' korunmali.
        const iptalEdilenler = (Notifications.cancelScheduledNotificationAsync as jest.Mock).mock.calls.map(
            (c) => c[0]
        );
        expect(iptalEdilenler).toContain(`muhafiz_${bugunTarihi}_vakit_aksam_seviye_2_dk_20`);
        expect(iptalEdilenler).toContain(`muhafiz_${bugunTarihi}_vakit_aksam_seviye_4_dk_10`);
        expect(iptalEdilenler).not.toContain(`muhafiz_${bugunTarihi}_vakit_ogle_seviye_1_dk_25`);

        // Kilinan 'aksam', BUGUN tarihli anahtara yazilmali (gece-yarisi disindaki vakit).
        const bugun = bugunuAl();
        const beklenenAnahtar = `muhafiz_ayarlari_kilinan_${bugun}`;
        const setItemCagrilari = (AsyncStorage.setItem as jest.Mock).mock.calls;
        const kayit = setItemCagrilari.find((c: any[]) => c[0] === beklenenAnahtar);
        expect(kayit).toBeDefined();
        expect(JSON.parse(kayit![1])).toContain('aksam');
    });

    test('vakitKilindisiniGeriAl: kilinan listesinden cikarir ve bildirimleri YENIDEN planlar', async () => {
        // this.ayarlar dolsun ki geri-alma sonrasi yeniden planlama tetiklensin.
        await servis.yapilandirVePlanla({
            aktif: true,
            koordinatlar: { lat: 41.0, lng: 29.0 },
            esikler: STANDART_ESIKLER,
        });

        const bugun = bugunuAl();
        const kilinanAnahtar = `muhafiz_ayarlari_kilinan_${bugun}`;

        // STATEFUL mock: geri-alma once `['aksam']` okur, sonra `[]` yazar; YENIDEN
        // planlama sirasinda ayni anahtari tekrar OKUYUNCA artik bos donmeli ki
        // 'aksam' tekrar planlanabilsin. Statik mock bunu yakalamaz; depo simule et.
        const depo: Record<string, string> = { [kilinanAnahtar]: JSON.stringify(['aksam']) };
        (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) =>
            Promise.resolve(key in depo ? depo[key] : null)
        );
        (AsyncStorage.setItem as jest.Mock).mockImplementation((key: string, deger: string) => {
            depo[key] = deger;
            return Promise.resolve(null);
        });
        (Notifications.scheduleNotificationAsync as jest.Mock).mockClear();

        await servis.vakitKilindisiniGeriAl('aksam');

        // 1) 'aksam' kilinan listesinden cikarilmali (bos diziyle setItem).
        const setItemCagrilari = (AsyncStorage.setItem as jest.Mock).mock.calls;
        const geriAlmaKaydi = setItemCagrilari.find((c: any[]) => c[0] === kilinanAnahtar);
        expect(geriAlmaKaydi).toBeDefined();
        expect(JSON.parse(geriAlmaKaydi![1])).not.toContain('aksam');

        // 2) Geri alma yeniden planlama tetikledigi icin (kilinan artik bos),
        //    aksam bildirimleri TEKRAR planlanmali (>0).
        const yenidenPlanlanan = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.filter(
            (c) => c[0].identifier?.includes('_vakit_aksam')
        ).length;
        expect(yenidenPlanlanan).toBeGreaterThan(0);
    });
});
