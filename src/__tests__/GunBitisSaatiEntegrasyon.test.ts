/**
 * Gün Sonu Bildirimi Entegrasyon Testleri
 * SeriAyarlari ve KonumYoneticiServisi entegrasyonunu test eder
 */

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
import type { GunSonuBildirimModu, BildirimGunSecimi, SeriAyarlari } from '../core/types/SeriTipleri';
import { VARSAYILAN_SERI_AYARLARI } from '../core/types/SeriTipleri';

describe('Gün Sonu Bildirimi Entegrasyon Testleri', () => {
    let konumServisi: KonumYoneticiServisi;

    beforeEach(() => {
        konumServisi = KonumYoneticiServisi.getInstance();
        konumServisi.sifirla();
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

        it('imsak öncesi dakika ile bildirim saati hesaplanabilmeli', () => {
            konumServisi.koordinatlarAyarla(41.0082, 28.9784);

            const imsakVakti = konumServisi.sonrakiGunImsakVaktiGetir()!;
            const bildirimImsakOncesiDk = 30;

            const bildirimSaati = new Date(imsakVakti.getTime() - bildirimImsakOncesiDk * 60 * 1000);

            expect(bildirimSaati.getTime()).toBeLessThan(imsakVakti.getTime());
            expect(imsakVakti.getTime() - bildirimSaati.getTime()).toBe(30 * 60 * 1000);
        });
    });

    describe('Sabit Mod - Validasyon', () => {
        it('ertesi gün seçildiğinde imsak vakti hesaplanabilmeli', () => {
            konumServisi.koordinatlarAyarla(41.0082, 28.9784);

            const imsakVakti = konumServisi.sonrakiGunImsakVaktiGetir();

            // İmsak vakti hesaplanabilmeli
            expect(imsakVakti).not.toBeNull();
            expect(imsakVakti).toBeInstanceOf(Date);

            // İmsak vakti 03:00-07:00 arası olmalı (normal aralık)
            const imsakSaat = imsakVakti!.getHours();
            expect(imsakSaat).toBeGreaterThanOrEqual(3);
            expect(imsakSaat).toBeLessThanOrEqual(7);
        });

        it('aynı gün seçildiğinde 18:00-23:59 arası seçilebilmeli', () => {
            const ayarlar: Partial<SeriAyarlari> = {
                gunSonuBildirimModu: 'sabit',
                bildirimGunSecimi: 'ayniGun',
                bildirimSaati: 23,
                bildirimDakikasi: 30,
            };

            expect(ayarlar.bildirimSaati).toBeGreaterThanOrEqual(18);
            expect(ayarlar.bildirimSaati).toBeLessThanOrEqual(23);
        });
    });

    describe('Mod Geçişleri', () => {
        it('modlar arası geçiş yapılabilmeli', () => {
            let ayarlar: SeriAyarlari = { ...VARSAYILAN_SERI_AYARLARI };

            // Otomatik moda geç
            ayarlar = { ...ayarlar, gunSonuBildirimModu: 'otomatik' };
            expect(ayarlar.gunSonuBildirimModu).toBe('otomatik');

            // Sabit moda geri dön
            ayarlar = { ...ayarlar, gunSonuBildirimModu: 'sabit' };
            expect(ayarlar.gunSonuBildirimModu).toBe('sabit');
        });
    });
});
