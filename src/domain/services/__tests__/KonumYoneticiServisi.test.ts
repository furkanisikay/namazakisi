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

        it('yarının imsak vakti yarın tarihinde ve bugünden sonra olmalı', () => {
            servis.koordinatlarAyarla(41.0082, 28.9784);

            const vakit = servis.sonrakiGunImsakVaktiGetir();
            const simdi = new Date();
            const yarin = new Date();
            yarin.setDate(yarin.getDate() + 1);

            expect(vakit).not.toBeNull();
            expect(Number.isNaN(vakit!.getTime())).toBe(false); // geçerli Date (Invalid Date değil)

            // Dönen tarih GERÇEKTEN yarın olmalı (gün sınırı / off-by-one regresyonunu yakalar)
            expect(vakit!.getDate()).toBe(yarin.getDate());
            expect(vakit!.getMonth()).toBe(yarin.getMonth());
            expect(vakit!.getFullYear()).toBe(yarin.getFullYear());

            // Her durumda gelecekte olmalı (gece yarısı-fajr arası koşullardan bağımsız)
            expect(vakit!.getTime()).toBeGreaterThan(simdi.getTime());

            // İmsak makul sabah aralığında (İstanbul yerel saati; CI UTC olabilir,
            // bu yüzden Europe/Istanbul'a sabitle). Yanlış method/açı regresyonunu yakalar.
            const saatStr = vakit!.toLocaleString('en-US', {
                timeZone: 'Europe/Istanbul',
                hour: '2-digit',
                hour12: false,
            });
            const saat = parseInt(saatStr, 10);
            expect(saat).toBeGreaterThanOrEqual(2);
            expect(saat).toBeLessThanOrEqual(7);
        });
    });

    describe('bugunImsakVaktiGetir', () => {
        it('koordinat varsa bugünün imsak vaktini döndürmeli', () => {
            servis.koordinatlarAyarla(41.0082, 28.9784); // İstanbul
            const simdi = new Date();

            const vakit = servis.bugunImsakVaktiGetir();

            expect(vakit).not.toBeNull();
            expect(vakit).toBeInstanceOf(Date);
            expect(Number.isNaN(vakit!.getTime())).toBe(false); // geçerli Date (Invalid Date değil)

            // İmsak/fajr makul bir sabah aralığında olmalı (İstanbul için yıl boyu ~03:00-06:30).
            // CI UTC olabileceğinden Europe/Istanbul'a sabitle; yanlış method/açı regresyonunu yakalar.
            const saatStr = vakit!.toLocaleString('en-US', {
                timeZone: 'Europe/Istanbul',
                hour: '2-digit',
                hour12: false,
            });
            const saat = parseInt(saatStr, 10);
            expect(saat).toBeGreaterThanOrEqual(2);
            expect(saat).toBeLessThanOrEqual(7);

            // Dönen Date'in günü = bugün olmalı (gece yarısı sınırı / yanlış gün regresyonunu yakalar)
            expect(vakit!.getFullYear()).toBe(simdi.getFullYear());
            expect(vakit!.getMonth()).toBe(simdi.getMonth());
            expect(vakit!.getDate()).toBe(simdi.getDate());
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
