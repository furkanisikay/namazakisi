/**
 * KonumYoneticiServisi Unit Testleri
 */

// Mock expo-location before importing the service
jest.mock('expo-location', () => ({
    getForegroundPermissionsAsync: jest.fn(),
    requestForegroundPermissionsAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
    reverseGeocodeAsync: jest.fn(),
}));

import { KonumYoneticiServisi } from '../KonumYoneticiServisi';

describe('KonumYoneticiServisi', () => {
    let servis: KonumYoneticiServisi;

    beforeEach(() => {
        servis = KonumYoneticiServisi.getInstance();
        servis.sifirla();
    });

    describe('getInstance', () => {
        it('singleton instance döndürmeli', () => {
            const instance1 = KonumYoneticiServisi.getInstance();
            const instance2 = KonumYoneticiServisi.getInstance();
            expect(instance1).toBe(instance2);
        });
    });

    describe('koordinatlarAyarla', () => {
        it('koordinatları doğru şekilde ayarlamalı', () => {
            servis.koordinatlarAyarla(41.0082, 28.9784);
            const koordinatlar = servis.getKoordinatlar();

            expect(koordinatlar).not.toBeNull();
            expect(koordinatlar?.lat).toBe(41.0082);
            expect(koordinatlar?.lng).toBe(28.9784);
        });

        it('sonGuncelleme alanını güncellemeli', () => {
            servis.koordinatlarAyarla(39.9334, 32.8597);
            const durum = servis.getDurum();

            expect(durum.sonGuncelleme).not.toBeNull();
        });
    });

    describe('sonrakiGunImsakVaktiGetir', () => {
        it('koordinat yoksa null döndürmeli', () => {
            servis.sifirla();
            // Koordinatları temizle
            const durum = servis.getDurum();
            servis.durumYukle({ ...durum, koordinatlar: null });

            const vakit = servis.sonrakiGunImsakVaktiGetir();
            expect(vakit).toBeNull();
        });

        it('koordinat varsa Date döndürmeli', () => {
            // İstanbul koordinatları
            servis.koordinatlarAyarla(41.0082, 28.9784);

            const vakit = servis.sonrakiGunImsakVaktiGetir();

            expect(vakit).not.toBeNull();
            expect(vakit).toBeInstanceOf(Date);
        });

        it('yarının imsak vakti bugünden sonra olmalı', () => {
            servis.koordinatlarAyarla(41.0082, 28.9784);

            const vakit = servis.sonrakiGunImsakVaktiGetir();
            const simdi = new Date();

            expect(vakit!.getTime()).toBeGreaterThan(simdi.getTime());
        });
    });

    describe('bugunImsakVaktiGetir', () => {
        it('koordinat varsa bugünün imsak vaktini döndürmeli', () => {
            servis.koordinatlarAyarla(41.0082, 28.9784);

            const vakit = servis.bugunImsakVaktiGetir();

            expect(vakit).not.toBeNull();
            expect(vakit).toBeInstanceOf(Date);
        });
    });

    describe('getKonumMetni', () => {
        it('il adı varsa il adını döndürmeli', () => {
            servis.durumYukle({
                modu: 'manuel',
                ilAdi: 'İstanbul',
                ilceAdi: '',
            });

            const metin = servis.getKonumMetni();
            expect(metin).toBe('İstanbul');
        });

        it('il ve ilçe adı varsa ikisini birlikte döndürmeli', () => {
            servis.durumYukle({
                modu: 'manuel',
                ilAdi: 'İstanbul',
                ilceAdi: 'Kadıköy',
            });

            const metin = servis.getKonumMetni();
            expect(metin).toBe('Kadıköy, İstanbul');
        });

        it('konum yoksa varsayılan metin döndürmeli', () => {
            servis.durumYukle({
                modu: 'manuel',
                ilAdi: '',
                ilceAdi: '',
            });

            const metin = servis.getKonumMetni();
            expect(metin).toBe('Konum seçilmedi');
        });
    });

    describe('sifirla', () => {
        it('durumu varsayılan değerlere sıfırlamalı', () => {
            servis.koordinatlarAyarla(40.0, 30.0);
            servis.durumYukle({ ilAdi: 'Ankara', ilId: 6 });

            servis.sifirla();

            const durum = servis.getDurum();
            expect(durum.ilAdi).toBe('İstanbul');
            expect(durum.ilId).toBe(34);
            expect(durum.koordinatlar).toBeNull();
        });
    });
});
