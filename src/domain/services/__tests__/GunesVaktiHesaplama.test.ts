import { NamazVaktiHesaplayiciServisi } from '../NamazVaktiHesaplayiciServisi';
import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan';

// Async Storage mock
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));

// Expo location mock
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: {
      latitude: 41.0082,
      longitude: 28.9784
    }
  }))
}));

describe('Güneş Vakti Hesaplama Entegrasyonu', () => {
  let servis: NamazVaktiHesaplayiciServisi;

  beforeAll(() => {
    servis = NamazVaktiHesaplayiciServisi.getInstance();
    // Konumu İstanbul olarak ayarla
    servis.yapilandir({
      latitude: 41.0082,
      longitude: 28.9784,
      method: 'Turkey',
      madhab: 'Hanafi'
    });
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('Güneş doğuşundan sonra ve Öğle vaktinden önce vakit "gunes" olarak dönmeli', () => {
    // Test tarihi: 1 Şubat 2026
    const testDate = new Date('2026-02-01T12:00:00'); // Öğle civarı bir referans

    // Adhan ile o günün vakitlerini hesapla
    const coordinates = new Coordinates(41.0082, 28.9784);
    const params = CalculationMethod.Turkey();
    const prayerTimes = new PrayerTimes(coordinates, testDate, params);

    // Güneş doğuşu ve Öğle vakti
    const gunesDogus = prayerTimes.sunrise;
    const ogle = prayerTimes.dhuhr;

    // Tam ortası bir zaman belirle (Kerahat vakti)
    const kerahatVakti = new Date((gunesDogus.getTime() + ogle.getTime()) / 2);

    // Sistem saatini bu vakte ayarla
    jest.setSystemTime(kerahatVakti);

    // Servisten vakit bilgisini al
    const bilgi = servis.getSuankiVakitBilgisi();

    expect(bilgi).not.toBeNull();
    expect(bilgi?.vakit).toBe('gunes');

    // UI tarafında bu 'gunes' vakti yakalanıp 'Öğle' kartı kilitli modda gösterilecek.
    // Bu test, UI'a doğru verinin (gunes) gittiğini doğrular.
  });

  it('Güneş doğuşundan hemen önce vakit "imsak" (veya sabah) olmalı', () => {
    // 1 Şubat 2026
    const testDate = new Date('2026-02-01T05:00:00');
    const coordinates = new Coordinates(41.0082, 28.9784);
    const params = CalculationMethod.Turkey();
    const prayerTimes = new PrayerTimes(coordinates, testDate, params);

    // Güneş doğuşundan 1 dakika öncesi
    const gunesOncesi = new Date(prayerTimes.sunrise.getTime() - 60 * 1000);

    jest.setSystemTime(gunesOncesi);

    const bilgi = servis.getSuankiVakitBilgisi();

    // Adhan kütüphanesinde 'imsak' ile 'gunes' arası 'fajr' (Sabah) olarak geçer ama
    // bizim mapping'imizde 'imsak' olarak dönüyor olabilir, kontrol edelim.
    // NamazVaktiHesaplayiciServisi mapping: fajr -> imsak
    expect(bilgi?.vakit).toBe('imsak');
  });

  it('Öğle vaktinden hemen sonra vakit "ogle" olmalı', () => {
    // 1 Şubat 2026
    const testDate = new Date('2026-02-01T12:00:00');
    const coordinates = new Coordinates(41.0082, 28.9784);
    const params = CalculationMethod.Turkey();
    const prayerTimes = new PrayerTimes(coordinates, testDate, params);

    // Öğle vaktinden 1 dakika sonrası
    const ogleSonrasi = new Date(prayerTimes.dhuhr.getTime() + 60 * 1000);

    jest.setSystemTime(ogleSonrasi);

    const bilgi = servis.getSuankiVakitBilgisi();

    expect(bilgi?.vakit).toBe('ogle');
  });
});
