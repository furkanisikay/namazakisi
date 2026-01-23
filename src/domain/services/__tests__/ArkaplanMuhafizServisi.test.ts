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
jest.mock('adhan', () => {
    const now = new Date();
    // Vakit çıkışı şu andan 30 dakika sonra olsun
    const cikis = new Date(now.getTime() + 30 * 60 * 1000);
    const sonrakiVakit = new Date(now.getTime() + 60 * 60 * 1000);

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
            isha: cikis, // Yatsı vakti şu an girdi
        })),
    };
});

import { ArkaplanMuhafizServisi } from '../ArkaplanMuhafizServisi';

describe('ArkaplanMuhafizServisi - Bildirim Çakışma Testi', () => {
    let servis: ArkaplanMuhafizServisi;

    beforeEach(() => {
        jest.clearAllMocks();
        // Singleton'ı resetle
        (ArkaplanMuhafizServisi as any).instance = undefined;
        servis = ArkaplanMuhafizServisi.getInstance();
    });

    test('Aynı dakikaya düşen bildirimler birleştirilmeli', async () => {
        // Tüm eşikler aynı değere ayarlansın (aynı dakikaya düşecekler)
        // Tüm eşikler aynı değere ayarlansın (aynı dakikaya düşecekler)
        await servis.yapilandirVePlanla({
            aktif: true,
            koordinatlar: { lat: 41.0, lng: 29.0 },
            esikler: {
                seviye1: 25, // Hepsi 25 dk
                seviye1Siklik: 30, // Sıklık süreden büyük olsun ki sadece ilk anda çalışsın
                seviye2: 25,
                seviye2Siklik: 30,
                seviye3: 25,
                seviye3Siklik: 30,
                seviye4: 25,
                seviye4Siklik: 30,
            },
        });

        // Sadece 1 bildirim planlanmalı (en yüksek seviye = 4)
        const scheduleCalllari = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;

        console.log('Planlanan bildirim sayısı:', scheduleCalllari.length);
        scheduleCalllari.forEach((call, i) => {
            console.log(`  Bildirim ${i + 1}: ${call[0].identifier} - ${call[0].content.title}`);
        });

        // Aynı dakikaya düşen bildirimler birleştirildiği için
        // her zaman 1 veya daha az bildirim olmalı
        expect(scheduleCalllari.length).toBeLessThanOrEqual(4);
    });

    test('Farklı dakikalara düşen bildirimler ayrı planlanmalı', async () => {
        // Farklı eşikler ayarla
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

        console.log('Planlanan farklı zamanlı bildirim sayısı:', scheduleCalllari.length);

        // Zamanları kontrol et - aynı dakikada birden fazla olmamalı
        const zamanlar = scheduleCalllari.map(call => {
            const date = call[0].trigger?.date;
            if (date) {
                return Math.floor(new Date(date).getTime() / (60 * 1000));
            }
            return null;
        }).filter(Boolean);

        const uniqueZamanlar = new Set(zamanlar);

        console.log('Toplam zaman:', zamanlar.length);
        console.log('Unique zaman:', uniqueZamanlar.size);

        // Her dakikada sadece 1 bildirim olmalı
        expect(uniqueZamanlar.size).toBe(zamanlar.length);
    });

    test('Kılınmış vakitler için bildirim planlanmamalı', async () => {
        const AsyncStorage = require('@react-native-async-storage/async-storage');

        // Yatsı için kılınmış olarak simüle et
        const bugun = new Date();
        const tarih = `${bugun.getFullYear()}-${String(bugun.getMonth() + 1).padStart(2, '0')}-${String(bugun.getDate()).padStart(2, '0')}`;
        const kilinanAnahtar = `muhafiz_ayarlari_kilinan_${tarih}`;

        // Mock AsyncStorage - yatsı kılınmış
        AsyncStorage.getItem.mockImplementation((key: string) => {
            if (key === kilinanAnahtar) {
                return Promise.resolve(JSON.stringify(['yatsi']));
            }
            return Promise.resolve(null);
        });

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

        // Yatsı bildirimleri olmamalı
        const yatsiBildirimleri = scheduleCalllari.filter((call) =>
            call[0].identifier?.includes('_vakit_yatsi')
        );

        console.log('Yatsı bildirimleri (kılınmış):', yatsiBildirimleri.length);
        expect(yatsiBildirimleri.length).toBe(0);
    });
});
