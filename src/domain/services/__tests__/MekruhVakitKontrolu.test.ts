import { mekruhVakitKontrolEt } from '../KazaHesaplayiciServisi';
import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan';

// Async Storage mock
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));

// Test koordinatları: İstanbul
const LAT = 41.0082;
const LNG = 28.9784;

// Test tarihi için vakitleri hesapla
const TEST_DATE = new Date('2026-02-01T12:00:00');
const coordinates = new Coordinates(LAT, LNG);
const params = CalculationMethod.Turkey();
const prayerTimes = new PrayerTimes(coordinates, TEST_DATE, params);

const SURUK_BITIS_MS = 20 * 60 * 1000; // 20 dakika
const ISTIWA_TOLERANS_MS = 5 * 60 * 1000; // 5 dakika

describe('mekruhVakitKontrolEt — kerahat vakitleri', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ==================== NORMAL VAKİT ====================

  it('kerahat vakti dışında mekruhMu false döner', () => {
    // Güneş doğuşundan 30 dakika sonrası (şuruk bitti) ve öğleden 10 dakika önce değil
    const normalVakit = new Date(prayerTimes.sunrise.getTime() + 30 * 60 * 1000);
    jest.setSystemTime(normalVakit);

    const sonuc = mekruhVakitKontrolEt(LAT, LNG);

    expect(sonuc.mekruhMu).toBe(false);
    expect(sonuc.aciklama).toBeNull();
    expect(sonuc.bitis).toBeNull();
  });

  // ==================== ŞURUK VAKTİ ====================

  it('güneş doğuşunun tam anında mekruh başlar (şuruk)', () => {
    jest.setSystemTime(prayerTimes.sunrise);

    const sonuc = mekruhVakitKontrolEt(LAT, LNG);

    expect(sonuc.mekruhMu).toBe(true);
    expect(sonuc.aciklama).toContain('şuruk');
  });

  it('güneş doğuşundan 10 dakika sonra hâlâ şuruk mekruhu', () => {
    const surukOrtasi = new Date(prayerTimes.sunrise.getTime() + 10 * 60 * 1000);
    jest.setSystemTime(surukOrtasi);

    const sonuc = mekruhVakitKontrolEt(LAT, LNG);

    expect(sonuc.mekruhMu).toBe(true);
    expect(sonuc.aciklama).toContain('şuruk');
    expect(sonuc.bitis).toEqual(new Date(prayerTimes.sunrise.getTime() + SURUK_BITIS_MS));
  });

  it('güneş doğuşundan 20 dakika sonra şuruk mekruhu biter', () => {
    const surukBitis = new Date(prayerTimes.sunrise.getTime() + SURUK_BITIS_MS + 60 * 1000); // 1 dk sonra
    jest.setSystemTime(surukBitis);

    const sonuc = mekruhVakitKontrolEt(LAT, LNG);

    expect(sonuc.mekruhMu).toBe(false);
  });

  it('şuruk mesajında "kaza namazı" geçer (varsayılan tip)', () => {
    jest.setSystemTime(prayerTimes.sunrise);

    const sonuc = mekruhVakitKontrolEt(LAT, LNG);

    expect(sonuc.aciklama).toContain('kaza namazı');
  });

  it('şuruk mesajında "namaz" geçer (farz tipi)', () => {
    jest.setSystemTime(prayerTimes.sunrise);

    const sonuc = mekruhVakitKontrolEt(LAT, LNG, 'farz');

    expect(sonuc.aciklama).toContain('namaz');
    expect(sonuc.aciklama).not.toContain('kaza namazı');
  });

  // ==================== İSTİWA VAKTİ ====================

  it('öğleden 5 dakika önce istiwa mekruhu başlar', () => {
    const istawaBasi = new Date(prayerTimes.dhuhr.getTime() - ISTIWA_TOLERANS_MS);
    jest.setSystemTime(istawaBasi);

    const sonuc = mekruhVakitKontrolEt(LAT, LNG);

    expect(sonuc.mekruhMu).toBe(true);
    expect(sonuc.aciklama).toContain('istiwa');
  });

  it('öğle ezanı vaktinde istiwa mekruhu biter', () => {
    const dhuhrSonrasi = new Date(prayerTimes.dhuhr.getTime() + 60 * 1000);
    jest.setSystemTime(dhuhrSonrasi);

    const sonuc = mekruhVakitKontrolEt(LAT, LNG);

    expect(sonuc.mekruhMu).toBe(false);
  });

  it('istiwa bitis zamanı öğle vaktidir', () => {
    const istawaBasi = new Date(prayerTimes.dhuhr.getTime() - ISTIWA_TOLERANS_MS);
    jest.setSystemTime(istawaBasi);

    const sonuc = mekruhVakitKontrolEt(LAT, LNG);

    expect(sonuc.bitis?.getTime()).toBe(prayerTimes.dhuhr.getTime());
  });

  it('istiwa mesajında "kaza namazı" geçer (varsayılan tip)', () => {
    const istawaBasi = new Date(prayerTimes.dhuhr.getTime() - ISTIWA_TOLERANS_MS);
    jest.setSystemTime(istawaBasi);

    const sonuc = mekruhVakitKontrolEt(LAT, LNG);

    expect(sonuc.aciklama).toContain('kaza namazı');
  });

  it('istiwa mesajında "namaz" geçer (farz tipi)', () => {
    const istawaBasi = new Date(prayerTimes.dhuhr.getTime() - ISTIWA_TOLERANS_MS);
    jest.setSystemTime(istawaBasi);

    const sonuc = mekruhVakitKontrolEt(LAT, LNG, 'farz');

    expect(sonuc.aciklama).toContain('namaz');
    expect(sonuc.aciklama).not.toContain('kaza namazı');
  });

  // ==================== GURUB VAKTİ ====================

  it('akşam ezanından 20 dakika önce gurub mekruhu başlar', () => {
    const gurubBasi = new Date(prayerTimes.maghrib.getTime() - SURUK_BITIS_MS);
    jest.setSystemTime(gurubBasi);

    const sonuc = mekruhVakitKontrolEt(LAT, LNG);

    expect(sonuc.mekruhMu).toBe(true);
    expect(sonuc.aciklama).toContain('gurub');
  });

  it('akşam ezanından 10 dakika önce hâlâ gurub mekruhu', () => {
    const gurubOrtasi = new Date(prayerTimes.maghrib.getTime() - 10 * 60 * 1000);
    jest.setSystemTime(gurubOrtasi);

    const sonuc = mekruhVakitKontrolEt(LAT, LNG);

    expect(sonuc.mekruhMu).toBe(true);
    expect(sonuc.aciklama).toContain('gurub');
    expect(sonuc.bitis?.getTime()).toBe(prayerTimes.maghrib.getTime());
  });

  it('akşam ezanından sonra gurub mekruhu biter', () => {
    const gurubSonrasi = new Date(prayerTimes.maghrib.getTime() + 60 * 1000);
    jest.setSystemTime(gurubSonrasi);

    const sonuc = mekruhVakitKontrolEt(LAT, LNG);

    expect(sonuc.mekruhMu).toBe(false);
  });

  it('gurub mesajında "kaza namazı" geçer (varsayılan tip)', () => {
    const gurubOrtasi = new Date(prayerTimes.maghrib.getTime() - 10 * 60 * 1000);
    jest.setSystemTime(gurubOrtasi);

    const sonuc = mekruhVakitKontrolEt(LAT, LNG);

    expect(sonuc.aciklama).toContain('kaza namazı');
  });

  it('gurub mesajında "namaz" geçer (farz tipi)', () => {
    const gurubOrtasi = new Date(prayerTimes.maghrib.getTime() - 10 * 60 * 1000);
    jest.setSystemTime(gurubOrtasi);

    const sonuc = mekruhVakitKontrolEt(LAT, LNG, 'farz');

    expect(sonuc.aciklama).toContain('namaz');
    expect(sonuc.aciklama).not.toContain('kaza namazı');
  });

  // ==================== SINIR (BOUNDARY) — TAM EŞİTLİK ====================
  // Üretim her üç pencerede de kapsayıcı (<=) kullanır. Tam bitiş anında mekruh
  // HÂLÂ aktif olmalıdır; "<= -> <" regresyonu bu testlerle yakalanır.

  it('şuruk bitiş anının TAM kendisinde (sunrise + 20 dk) hâlâ mekruh (kapsayıcı sınır)', () => {
    const surukBitisAni = new Date(prayerTimes.sunrise.getTime() + SURUK_BITIS_MS);
    jest.setSystemTime(surukBitisAni);

    const sonuc = mekruhVakitKontrolEt(LAT, LNG);

    expect(sonuc.mekruhMu).toBe(true);
    expect(sonuc.aciklama).toContain('şuruk');
  });

  it('istiwa bitiş anının TAM kendisinde (öğle vakti) hâlâ mekruh (kapsayıcı sınır)', () => {
    // Üretim: now <= dhuhr. Tam dhuhr anı pencerenin İÇİNDE sayılmalı.
    jest.setSystemTime(prayerTimes.dhuhr);

    const sonuc = mekruhVakitKontrolEt(LAT, LNG);

    expect(sonuc.mekruhMu).toBe(true);
    expect(sonuc.aciklama).toContain('istiwa');
  });

  it('gurub bitiş anının TAM kendisinde (akşam vakti) hâlâ mekruh (kapsayıcı sınır)', () => {
    // Üretim: now <= sunset. Tam sunset anı pencerenin İÇİNDE sayılmalı.
    jest.setSystemTime(prayerTimes.maghrib);

    const sonuc = mekruhVakitKontrolEt(LAT, LNG);

    expect(sonuc.mekruhMu).toBe(true);
    expect(sonuc.aciklama).toContain('gurub');
  });

  // ==================== SINIR (BOUNDARY) — PENCERE BAŞLANGICININ HEMEN ÖNCESİ ====================
  // Üretim: now >= başlangıç. Başlangıçtan 1 sn önce pencere DIŞINDA olmalı;
  // ">= -> >" ya da pencerenin geriye kayması bu testlerle yakalanır.

  it('güneş doğuşundan 1 sn önce henüz şuruk mekruhu yok', () => {
    const sunriseOncesi = new Date(prayerTimes.sunrise.getTime() - 1000);
    jest.setSystemTime(sunriseOncesi);

    const sonuc = mekruhVakitKontrolEt(LAT, LNG);

    expect(sonuc.mekruhMu).toBe(false);
    expect(sonuc.aciklama).toBeNull();
  });

  it('istiwa başlangıcından 1 sn önce (öğle - 5 dk - 1 sn) henüz istiwa mekruhu yok', () => {
    const istiwaOncesi = new Date(prayerTimes.dhuhr.getTime() - ISTIWA_TOLERANS_MS - 1000);
    jest.setSystemTime(istiwaOncesi);

    const sonuc = mekruhVakitKontrolEt(LAT, LNG);

    expect(sonuc.mekruhMu).toBe(false);
    expect(sonuc.aciklama).toBeNull();
  });

  // ==================== GURUB — BİLİNÇLİ BASİTLEŞTİRMENİN BELGELENMESİ ====================
  // Fıkhi kural: ikindi (asr) kılındıktan sonra gün batımına kadar mekruhtur.
  // Üretim ise asr vaktini kullanmaz; yalnızca gün batımından önceki ~20 dk'yı
  // mekruh sayar. Dolayısıyla asr ile (sunset - 20 dk) arasındaki uzun aralık
  // (bu tarih/şehir için ~125 dk) üretimde mekruh DEĞİLDİR. Bu test, yaklaşımın
  // KAÇIRDIĞI gerçek mekruh aralığını sabitler; üretim gurub mantığı
  // (örn. asr tabanlı gerçek kurala) değiştirilirse kasıtlı olarak FAIL eder.

  it('ikindiden 30 dk sonra (gurub penceresinden önce) üretim mekruh saymaz — bilinçli basitleştirme', () => {
    const asr = prayerTimes.asr;
    const gurubBasi = new Date(prayerTimes.maghrib.getTime() - SURUK_BITIS_MS);
    const asrSonrasi = new Date(asr.getTime() + 30 * 60 * 1000);

    // Önkoşul: seçilen an gerçekten ikindiden sonra ama gurub penceresinden önce.
    expect(asrSonrasi.getTime()).toBeGreaterThan(asr.getTime());
    expect(asrSonrasi.getTime()).toBeLessThan(gurubBasi.getTime());

    jest.setSystemTime(asrSonrasi);

    const sonuc = mekruhVakitKontrolEt(LAT, LNG);

    // Fıkhen mekruh olsa da üretim yaklaşımı bunu kapsamaz -> false.
    expect(sonuc.mekruhMu).toBe(false);
    expect(sonuc.aciklama).toBeNull();
  });

  // ==================== HATA DURUMU ====================

  it('geçersiz koordinatlarda hata atmaz, mekruhMu false döner', () => {
    jest.setSystemTime(prayerTimes.sunrise);

    // NaN koordinatları adhan kütüphanesini fırlatır; fonksiyon bunu catch edip false döner
    const sonuc = mekruhVakitKontrolEt(NaN, NaN);

    expect(sonuc.mekruhMu).toBe(false);
    expect(sonuc.aciklama).toBeNull();
  });

  it('geçerli ama uç enlemde (kutup, lat 78) güneş doğmadığı günde hata atmaz, mekruhMu false döner', () => {
    // Adhan kutup bölgelerinde sunrise/sunset için Invalid Date (NaN) üretebilir;
    // now >= NaN ve now <= NaN her zaman false olduğundan pencereler atlanır.
    // Seçilen an (kutup öğle vaktinden 3 saat sonrası) geçerli olan tek pencereye
    // (istiwa) de girmez; dolayısıyla mekruhMu false, çökme yok.
    const POLAR_LAT = 78.0;
    const POLAR_LNG = 15.0;
    const polarCoords = new Coordinates(POLAR_LAT, POLAR_LNG);
    const polarTimes = new PrayerTimes(polarCoords, TEST_DATE, params);

    // Bu tarihte sunrise/sunset geçersiz, dhuhr geçerli olmalı (önkoşul).
    expect(Number.isNaN(polarTimes.sunrise.getTime())).toBe(true);
    expect(Number.isNaN(polarTimes.maghrib.getTime())).toBe(true);
    expect(Number.isNaN(polarTimes.dhuhr.getTime())).toBe(false);

    const istiwaDisiAn = new Date(polarTimes.dhuhr.getTime() + 3 * 60 * 60 * 1000);
    jest.setSystemTime(istiwaDisiAn);

    const sonuc = mekruhVakitKontrolEt(POLAR_LAT, POLAR_LNG);

    expect(sonuc.mekruhMu).toBe(false);
    expect(sonuc.aciklama).toBeNull();
  });
});
