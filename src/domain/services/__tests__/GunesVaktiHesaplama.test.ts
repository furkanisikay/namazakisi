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

  it('currentPrayer sunrise -> vakit "gunes" eşlemesi doğru olmalı (mapping)', () => {
    // Bu test, fajr/sunrise/dhuhr ... -> imsak/gunes/ogle ... eşlemesinin
    // doğru olduğunu (özelde sunrise -> "gunes") doğrular; vaktin FİZİKİ
    // doğruluğunu değil. Doğruluk ayrı bir testte referans değerle kontrol edilir.
    const testDate = new Date('2026-02-01T12:00:00');

    const coordinates = new Coordinates(41.0082, 28.9784);
    const params = CalculationMethod.Turkey();
    const prayerTimes = new PrayerTimes(coordinates, testDate, params);

    // Güneş doğuşu ile öğle arasında bir an (currentPrayer === 'sunrise' olmalı)
    const gunesDogus = prayerTimes.sunrise;
    const ogle = prayerTimes.dhuhr;
    const gunesIleOgleArasi = new Date((gunesDogus.getTime() + ogle.getTime()) / 2);

    jest.setSystemTime(gunesIleOgleArasi);

    const bilgi = servis.getSuankiVakitBilgisi();

    expect(bilgi).not.toBeNull();
    // sunrise mapping'i: adhan 'sunrise' -> bizim 'gunes'
    expect(bilgi?.vakit).toBe('gunes');
  });

  it('İstanbul 1 Şubat 2026 güneş doğuşu (gunes) Diyanet referansına yakın olmalı (doğruluk)', () => {
    // Mapping değil, FİZİKİ doğruluk testi: adhan + CalculationMethod.Turkey
    // gerçekten doğru güneş doğuşunu üretmeli. method/koordinat/sürüm regresyonunu yakalar.
    const vakitler = servis.getGunlukVakitler(new Date('2026-02-01T12:00:00'));
    expect(vakitler).not.toBeNull();

    // adhan UTC Date döner; İstanbul Şubat'ta UTC+3 (DST yok) -> timezone-bağımsız assert
    const gunesTR = new Date(vakitler!.gunes.getTime() + 3 * 3600 * 1000);
    const dakika = gunesTR.getUTCHours() * 60 + gunesTR.getUTCMinutes();

    // Diyanet referansı: İstanbul 1 Şubat güneş ~08:08 TR; ±5 dk tolerans
    const beklenenDakika = 8 * 60 + 8; // 488
    expect(Math.abs(dakika - beklenenDakika)).toBeLessThanOrEqual(5);
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

  it('Öğle vaktinden hemen sonra vakit "ogle" olmalı ve sonraki vakit/saat/kalan süre alanları tutarlı olmalı', () => {
    // 1 Şubat 2026
    const testDate = new Date('2026-02-01T12:00:00');
    const coordinates = new Coordinates(41.0082, 28.9784);
    const params = CalculationMethod.Turkey();
    const prayerTimes = new PrayerTimes(coordinates, testDate, params);

    // (a) Öğle saatinin FİZİKİ doğruluğu: adhan saçma bir öğle dönmemeli.
    // getHours() yerel timezone'a bağlı olduğundan timezone-bağımsız UTC+3 (İstanbul, DST yok)
    // dönüşümüyle kontrol et. Diyanet referansı: İstanbul 1 Şubat öğle ~13:23 TR; ±5 dk tolerans.
    const ogleTR = new Date(prayerTimes.dhuhr.getTime() + 3 * 3600 * 1000);
    const ogleDakika = ogleTR.getUTCHours() * 60 + ogleTR.getUTCMinutes();
    const beklenenOgleDakika = 13 * 60 + 23; // 803
    expect(Math.abs(ogleDakika - beklenenOgleDakika)).toBeLessThanOrEqual(5);

    // Öğle vaktinden 1 dakika sonrası
    const ogleSonrasi = new Date(prayerTimes.dhuhr.getTime() + 60 * 1000);

    jest.setSystemTime(ogleSonrasi);

    const bilgi = servis.getSuankiVakitBilgisi();

    expect(bilgi).not.toBeNull();
    // İçinde bulunulan vakit: öğle
    expect(bilgi?.vakit).toBe('ogle');

    // (b) Dönen objenin diğer alanları: öğle içindeyken sıradaki vakit ikindi (asr) olmalı.
    // currentPrayer/nextPrayer karışması (üretim ~satır 182-191) burada yakalanır.
    expect(bilgi?.sonrakiVakitAdi).toBe('ikindi');
    // Vaktin çıkış saati = ikindi (asr) girişi
    expect(bilgi?.saat.getTime()).toBe(prayerTimes.asr.getTime());
    expect(bilgi?.sonrakiVakitGiris).toBe(prayerTimes.asr.toISOString());
    // Kalan süre = asr girişi - şu an (fake timer ogleSonrasi'na sabitli)
    expect(bilgi?.kalanSureMs).toBe(prayerTimes.asr.getTime() - ogleSonrasi.getTime());
  });
});
