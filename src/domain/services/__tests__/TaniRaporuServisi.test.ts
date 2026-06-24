import { loglariMaskele } from '../TaniRaporuServisi';

describe('loglariMaskele', () => {
  test('konumDahil=false → koordinatları gizler', () => {
    const m = loglariMaskele('Yeni konum: 41.0082, 28.9784 alindi', { konumDahil: false });
    expect(m).toContain('[konum gizlendi]');
    expect(m).not.toContain('41.0082');
    expect(m).not.toContain('28.9784');
  });

  test('konumDahil=true → koordinatı şehir düzeyine (toFixed 1) indirir', () => {
    const m = loglariMaskele('konum 41.0082, 28.9784', { konumDahil: true });
    expect(m).toContain('41.0');
    expect(m).toContain('29.0');
    expect(m).not.toContain('41.0082');
  });

  test('token/anahtar desenlerini redakte eder', () => {
    const m = loglariMaskele('token=abc123secret api_key: ZZZ', { konumDahil: false });
    expect(m).not.toContain('abc123secret');
    expect(m).not.toContain('ZZZ');
    expect(m).toContain('[gizlendi]');
  });

  test('sıradan teknik logu değiştirmez', () => {
    const girdi = 'KazaDefteriSayfasi: render error stack at line 5';
    expect(loglariMaskele(girdi, { konumDahil: false })).toBe(girdi);
  });
});
