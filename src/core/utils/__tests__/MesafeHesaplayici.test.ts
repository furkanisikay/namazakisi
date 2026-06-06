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
});
