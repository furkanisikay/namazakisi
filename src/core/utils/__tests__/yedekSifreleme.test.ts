/**
 * yedekSifreleme testleri
 * tweetnacl secretbox sifreleme/cozme + SHA-256 kontrol ozeti dogrulanir.
 */

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn(async (_algoritma: string, s: string) =>
    require('crypto').createHash('sha256').update(s).digest('hex'),
  ),
}));

import { sifrele, coz, kontrolHesapla } from '../yedekSifreleme';

describe('yedekSifreleme', () => {
  it('sifrele -> coz tur-turu ozgun metni geri verir', async () => {
    const metin = JSON.stringify({ a: 1, b: 'merhaba', c: [true, false] });
    const { nonce, veri } = await sifrele(metin);
    expect(typeof nonce).toBe('string');
    expect(veri).not.toContain('merhaba');
    const cozulen = coz(nonce, veri);
    expect(cozulen).toBe(metin);
  });

  it('bozuk veri cozulemez (null doner)', () => {
    expect(coz('AAAA', 'Qm9ydW0=')).toBeNull();
  });

  it('kontrolHesapla ayni girdi icin ayni sha256 verir', async () => {
    const a = await kontrolHesapla('x');
    const b = await kontrolHesapla('x');
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
});
