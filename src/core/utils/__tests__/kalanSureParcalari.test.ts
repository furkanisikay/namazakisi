import { kalanSureParcalari, kalanSureSesli } from '../kalanSureParcalari';

describe('kalanSureParcalari', () => {
  it('saat ve üstü: saat + dakika, saniye yok', () => {
    expect(kalanSureParcalari('01:09:09')).toEqual([
      { sayi: '1', birim: 'sa' },
      { sayi: '9', birim: 'dk' },
    ]);
    expect(kalanSureParcalari('10:00:59')).toEqual([
      { sayi: '10', birim: 'sa' },
      { sayi: '0', birim: 'dk' },
    ]);
  });

  it('saatin altı: dakika + iki haneli saniye', () => {
    expect(kalanSureParcalari('00:09:05')).toEqual([
      { sayi: '9', birim: 'dk' },
      { sayi: '05', birim: 'sn' },
    ]);
  });

  it('dakikanın altı: yalnız saniye', () => {
    expect(kalanSureParcalari('00:00:42')).toEqual([{ sayi: '42', birim: 'sn' }]);
    expect(kalanSureParcalari('00:00:00')).toEqual([{ sayi: '0', birim: 'sn' }]);
  });

  it('bozuk girdi olduğu gibi tek parça', () => {
    expect(kalanSureParcalari('--:--')).toEqual([{ sayi: '--:--', birim: '' }]);
  });

  it('sesli metin', () => {
    expect(kalanSureSesli('01:09:09')).toBe('1 saat 9 dakika');
    expect(kalanSureSesli('00:09:05')).toBe('9 dakika 5 saniye');
    expect(kalanSureSesli('00:00:42')).toBe('42 saniye');
  });
});
