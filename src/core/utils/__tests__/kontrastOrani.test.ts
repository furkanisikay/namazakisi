import { goreceliParlaklik, kontrastOrani } from '../kontrastOrani';

describe('kontrastOrani', () => {
  test('siyah/beyaz kontrastı 21:1 (WCAG üst sınır)', () => {
    expect(kontrastOrani('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
  });

  test('aynı renk kontrastı 1:1', () => {
    expect(kontrastOrani('#63709A', '#63709A')).toBeCloseTo(1, 6);
  });

  test('sıra önemsizdir (simetrik)', () => {
    expect(kontrastOrani('#1B2440', '#8892AC')).toBeCloseTo(kontrastOrani('#8892AC', '#1B2440'), 10);
  });

  test('kısa #RGB biçimi #RRGGBB ile aynı sonucu verir', () => {
    expect(kontrastOrani('#fff', '#000')).toBeCloseTo(kontrastOrani('#ffffff', '#000000'), 6);
  });

  test('bilinen referans: AY_OKU (#8892AC) en açık gök zemini noktasına (#1B2440) karşı ~4.92:1', () => {
    expect(kontrastOrani('#8892AC', '#1B2440')).toBeCloseTo(4.92, 1);
  });

  test('goreceliParlaklik beyaz için 1, siyah için 0 döner', () => {
    expect(goreceliParlaklik('#FFFFFF')).toBeCloseTo(1, 6);
    expect(goreceliParlaklik('#000000')).toBeCloseTo(0, 6);
  });
});
