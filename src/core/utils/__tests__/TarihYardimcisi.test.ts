import { bugunuAl, dunuAl, gunEkle } from '../TarihYardimcisi';

// Not: Uretim kodu YEREL saat Date kullanir (new Date(), new Date(yil, ay-1, gun)).
// Bu yuzden setSystemTime'a UTC ISO string DEGIL, yerel-kurucu (new Date(yil, ayIndex, gun, 12))
// bicimi verilir; boylece timezone offset gun sinirini kaydirmaz (saat 12:00 secildi).
describe('TarihYardimcisi — bugun/dun', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('dunuAl(), bugünden tam 1 gün önceyi ISO formatında döndürür', () => {
    jest.useFakeTimers();
    // 10 Eylul 2026 (ay index 8) -> dun 09 Eylul 2026
    jest.setSystemTime(new Date(2026, 8, 10, 12, 0, 0));
    expect(bugunuAl()).toBe('2026-09-10');
    expect(dunuAl()).toBe('2026-09-09');
  });

  it('dunuAl() YYYY-MM-DD formatında döner', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 8, 10, 12, 0, 0));
    expect(dunuAl()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('dunuAl() tek haneli ay/gün için padStart ile sıfır doldurur', () => {
    jest.useFakeTimers();
    // 5 Subat 2026 -> dun 04 Subat 2026: hem ay (02) hem gun (04) iki haneli olmali
    jest.setSystemTime(new Date(2026, 1, 5, 12, 0, 0));
    expect(dunuAl()).toBe('2026-02-04');
  });

  it('dunuAl() ay başında önceki ayın son gününü döndürür (1 Mart -> 28 Şubat, 2026 artık yıl değil)', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 2, 1, 12, 0, 0)); // 2026-03-01
    expect(dunuAl()).toBe('2026-02-28');
  });

  it('dunuAl() artık yıl ay sınırında 29 Şubat döndürür (1 Mart 2024 -> 29 Şubat 2024)', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2024, 2, 1, 12, 0, 0)); // 2024-03-01
    expect(dunuAl()).toBe('2024-02-29');
  });

  it('dunuAl() yıl sınırında önceki yılın 31 Aralık gününü döndürür (1 Ocak -> 31 Aralık)', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 0, 1, 12, 0, 0)); // 2026-01-01
    expect(dunuAl()).toBe('2025-12-31');
  });
});

// gunEkle'nin takvimsel aritmetigini dogrudan, sistem saatinden bagimsiz sabit
// literal beklenen degerlerle kilitler. dunuAl bu fonksiyona dayandigi icin
// buradaki bir regresyon dunuAl'i da bozardi.
describe('TarihYardimcisi — gunEkle takvim aritmetiği', () => {
  it('gün ekler (artı yön)', () => {
    expect(gunEkle('2026-09-09', 1)).toBe('2026-09-10');
  });

  it('gün çıkarır (eksi yön)', () => {
    expect(gunEkle('2026-09-10', -1)).toBe('2026-09-09');
  });

  it('ay sınırını ileri aşar (28 Şubat 2026 + 1 -> 1 Mart, artık yıl değil)', () => {
    expect(gunEkle('2026-02-28', 1)).toBe('2026-03-01');
  });

  it('artık yıl ay sınırını ileri aşar (28 Şubat 2024 + 1 -> 29 Şubat)', () => {
    expect(gunEkle('2024-02-28', 1)).toBe('2024-02-29');
  });

  it('ay sınırını geri aşar (1 Mart 2026 - 1 -> 28 Şubat)', () => {
    expect(gunEkle('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('yıl sınırını geri aşar (1 Ocak 2026 - 1 -> 31 Aralık 2025)', () => {
    expect(gunEkle('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('yıl sınırını ileri aşar (31 Aralık 2025 + 1 -> 1 Ocak 2026)', () => {
    expect(gunEkle('2025-12-31', 1)).toBe('2026-01-01');
  });

  it('birden çok ayı kapsayan büyük adımı doğru hesaplar (31 Ocak + 31 -> 3 Mart 2026)', () => {
    // Ocak 31 + 31 gun: Subat 28 gun (2026 artik yil degil) -> 3 Mart
    expect(gunEkle('2026-01-31', 31)).toBe('2026-03-03');
  });
});
