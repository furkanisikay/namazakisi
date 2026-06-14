import { sayacBaslangicEsikDkHesapla } from '../vakitSayacYardimcisi';

const muhafiz = { esikler: { seviye1: 45, seviye2: 25, seviye3: 10, seviye4: 3 } };

describe('sayacBaslangicEsikDkHesapla', () => {
  it('her seviye için ilgili eşiği döndürür', () => {
    expect(sayacBaslangicEsikDkHesapla(1, muhafiz)).toBe(45);
    expect(sayacBaslangicEsikDkHesapla(2, muhafiz)).toBe(25);
    expect(sayacBaslangicEsikDkHesapla(3, muhafiz)).toBe(10);
    expect(sayacBaslangicEsikDkHesapla(4, muhafiz)).toBe(3);
  });

  it('tanımsız/geçersiz seviye → seviye1 (varsayılan, en erken)', () => {
    expect(sayacBaslangicEsikDkHesapla(undefined, muhafiz)).toBe(45);
    expect(sayacBaslangicEsikDkHesapla(0, muhafiz)).toBe(45);
    expect(sayacBaslangicEsikDkHesapla(99, muhafiz)).toBe(45);
  });
});
