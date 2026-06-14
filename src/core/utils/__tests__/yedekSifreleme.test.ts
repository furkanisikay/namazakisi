/**
 * yedekSifreleme testleri
 * tweetnacl secretbox sifreleme/cozme + SHA-256 kontrol ozeti dogrulanir.
 */

// NOT: `getRandomBytes` mock'u ZORUNLU — yedekSifreleme modül yükünde
// `nacl.setPRNG(n => Crypto.getRandomBytes(n))` çalıştırır (RN'de tweetnacl'in
// güvenli PRNG'si yoktur). Mock yoksa modül-yükündeki setPRNG callback'i
// `Crypto.getRandomBytes` undefined olduğundan `sifrele` çağrısı patlardı.
// `mock` öneki jest hoisting kuralı için zorunlu (out-of-scope referansa izin).
const mockGetRandomBytes = jest.fn(
  (n: number) => new Uint8Array(require('crypto').randomBytes(n)),
);

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn(async (_algoritma: string, s: string) =>
    require('crypto').createHash('sha256').update(s).digest('hex'),
  ),
  getRandomBytes: (n: number) => mockGetRandomBytes(n),
}));

import { sifrele, coz, kontrolHesapla } from '../yedekSifreleme';

describe('yedekSifreleme', () => {
  beforeEach(() => {
    mockGetRandomBytes.mockClear();
  });

  it('sifrele -> coz tur-turu ozgun metni geri verir', async () => {
    const metin = JSON.stringify({ a: 1, b: 'merhaba', c: [true, false] });
    const { nonce, veri } = await sifrele(metin);
    expect(typeof nonce).toBe('string');
    expect(veri).not.toContain('merhaba');
    const cozulen = coz(nonce, veri);
    expect(cozulen).toBe(metin);
  });

  it('sifrele beslenen PRNG (expo-crypto) ile HATA FIRLATMADAN çalışır', async () => {
    // Regresyon: RN'de tweetnacl PRNG'siz "no PRNG" fırlatır; modül-yükündeki
    // setPRNG → expo-crypto.getRandomBytes bunu çözer (cihazda yedek oluşturma bug'ı).
    await expect(sifrele('cihaz-yedegi')).resolves.toEqual(
      expect.objectContaining({ nonce: expect.any(String), veri: expect.any(String) }),
    );
    // nonce üretimi PRNG'yi (getRandomBytes) gerçekten kullandı mı?
    expect(mockGetRandomBytes).toHaveBeenCalled();
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
