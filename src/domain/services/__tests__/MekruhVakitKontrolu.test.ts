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

  // ==================== HATA DURUMU ====================

  it('geçersiz koordinatlarda hata atmaz, mekruhMu false döner', () => {
    jest.setSystemTime(prayerTimes.sunrise);

    // NaN koordinatları adhan kütüphanesini fırlatır; fonksiyon bunu catch edip false döner
    const sonuc = mekruhVakitKontrolEt(NaN, NaN);

    expect(sonuc.mekruhMu).toBe(false);
    expect(sonuc.aciklama).toBeNull();
  });
});
