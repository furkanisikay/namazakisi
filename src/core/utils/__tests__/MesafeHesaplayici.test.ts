import { mesafeHesapla } from '../MesafeHesaplayici';

describe('MesafeHesaplayici', () => {
  it('aynı noktada 0 metre döner', () => {
    expect(mesafeHesapla(41, 29, 41, 29)).toBe(0);
  });

  it('İstanbul–Ankara arası ~350 km (±20 km) döner', () => {
    const m = mesafeHesapla(41.0082, 28.9784, 39.9334, 32.8597);
    expect(m).toBeGreaterThan(330_000);
    expect(m).toBeLessThan(370_000);
  });

  // Küçük mesafe doğruluğu: geofence eşiği (KonumTakipServisi 'mesafe < profil.mesafe')
  // onlarca metre - birkaç km ölçeğinde çalışır. Küre modelinde (R=6371000) 0.001° enlem
  // ~111.19 m'dir; bu kısa referans, eşik mantığının ölçeklendirmesini garanti eder.
  it('0.001° enlem farkı ~111.19 m döner (kısa mesafe ölçeği)', () => {
    const m = mesafeHesapla(41, 29, 41.001, 29);
    expect(m).toBeCloseTo(111.195, 1);
  });

  // Sadece-enlem değişimi: meridyen boyunca 1° her zaman ~111194.93 m'dir (boylamdan
  // bağımsız). Bu, formüldeki dLat teriminin tek başına doğru çalıştığını sabitler.
  it('sadece enlem değişiminde 1° ~111.19 km döner (dLat terimi)', () => {
    const m = mesafeHesapla(40, 30, 41, 30);
    expect(m).toBeCloseTo(111_194.93, 0);
  });

  // Sadece-boylam değişimi ekvatorda: 1° boylam ekvatorda ~111194.93 m. dLat/dLng
  // karışması (kopyala-yapıştır hatası) burada sadece-enlem testiyle birlikte yakalanır.
  it('ekvatorda sadece boylam değişiminde 1° ~111.19 km döner (dLng terimi)', () => {
    const m = mesafeHesapla(0, 0, 0, 1);
    expect(m).toBeCloseTo(111_194.93, 0);
  });

  // Boylam farkının enleme bağımlılığı (cos(lat) faktörü): aynı 1° boylam farkı
  // lat=60'ta ekvatordakinin yarısı (~55.6 km) olmalı; ratio === cos(60°) === 0.5.
  // Haversine'in en sık kırılan kısmı budur; cos(lat) düşerse bu test FAIL eder.
  it('boylam mesafesi enleme bağlıdır: lat=60° ekvatorun yarısı (cos faktörü)', () => {
    const ekvator = mesafeHesapla(0, 0, 0, 1);
    const enlem60 = mesafeHesapla(60, 0, 60, 1);
    expect(enlem60).toBeCloseTo(55_596.93, 0);
    // Oran cos(60°)=0.5 olmalı; cos(lat) terimi kaldırılırsa oran 1'e çıkar.
    expect(enlem60 / ekvator).toBeCloseTo(0.5, 3);
  });

  // Simetri: argüman sırası (lat/lng yer değiştirmesi) yaygın bir hatadır.
  // mesafeHesapla(a,b,c,d) === mesafeHesapla(c,d,a,b) olmalı.
  it('simetriktir: argümanların sırası mesafeyi değiştirmez', () => {
    const ileri = mesafeHesapla(41.0082, 28.9784, 39.9334, 32.8597);
    const geri = mesafeHesapla(39.9334, 32.8597, 41.0082, 28.9784);
    expect(geri).toBeCloseTo(ileri, 6);
  });

  // Ekvator/Greenwich çaprazlaması (negatif↔pozitif geçiş): işaret hataları bu
  // sınırlarda ortaya çıkar. -0.5°..+0.5° = 1° fark, yine ~111194.93 m vermeli.
  it('ekvator çaprazlamasında (-0.5°↔+0.5° enlem) ~111.19 km döner (işaret)', () => {
    const m = mesafeHesapla(-0.5, 0, 0.5, 0);
    expect(m).toBeCloseTo(111_194.93, 0);
  });

  it('Greenwich çaprazlamasında (-0.5°↔+0.5° boylam, ekvator) ~111.19 km döner', () => {
    const m = mesafeHesapla(0, -0.5, 0, 0.5);
    expect(m).toBeCloseTo(111_194.93, 0);
  });
});
