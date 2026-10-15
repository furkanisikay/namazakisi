/**
 * Cihazlar arası eşitleme (issue #288) — sürümlü uçtan uca şifreli zarf.
 */
const mockRastgele = (n: number) => new Uint8Array(require('crypto').randomBytes(n));
jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn(),
  getRandomBytes: (n: number) => mockRastgele(n),
}));

import naclUtil from 'tweetnacl-util';
import { YEDEK_SURUMU } from '../../types/YedeklemeTipleri';
import { KdfParametreleri, anahtarTuret } from '../anahtarTuretme';
import {
  ESITLEME_BICIMI,
  ESITLEME_ZARF_SURUMU,
  zarfiAc,
  zarfiAyristir,
  zarfOlustur,
} from '../esitlemeZarfi';

const KDF: KdfParametreleri = {
  ad: 'scrypt',
  N: 2 ** 10,
  r: 8,
  p: 1,
  tuz: naclUtil.encodeBase64(new Uint8Array(16).fill(3)),
};

const gecerliZarf = (ham: string) => {
  const ayr = zarfiAyristir(ham);
  if (ayr.tur !== 'gecerli') throw new Error('zarf geçerli değil');
  return ayr.zarf;
};

describe('esitlemeZarfi', () => {
  it('doğru parola ile tur-turu özgün metni verir; KDF parametreleri zarfta açık durur', async () => {
    const anahtar = await anahtarTuret('doğru parola 123', KDF);
    const ham = zarfOlustur('{"merhaba":"dünya"}', anahtar, KDF, new Date('2026-10-13T10:00:00Z'));
    const zarf = gecerliZarf(ham);
    expect(zarf).toMatchObject({
      bicim: ESITLEME_BICIMI,
      surum: ESITLEME_ZARF_SURUMU,
      yedekSurumu: YEDEK_SURUMU,
      kdf: KDF,
      olusturulma: '2026-10-13T10:00:00.000Z',
    });
    expect(ham).not.toContain('merhaba');
    expect(zarfiAc(zarf, anahtar)).toBe('{"merhaba":"dünya"}');
  });

  it('YANLIŞ parola → null (çözülemez)', async () => {
    const dogru = await anahtarTuret('doğru parola 123', KDF);
    const yanlis = await anahtarTuret('yanlış parola 123', KDF);
    const zarf = gecerliZarf(zarfOlustur('gizli', dogru, KDF));
    expect(zarfiAc(zarf, yanlis)).toBeNull();
  });

  it('kurcalanmış veri → null (Poly1305 bütünlüğü)', async () => {
    const anahtar = await anahtarTuret('doğru parola 123', KDF);
    const zarf = gecerliZarf(zarfOlustur('gizli içerik', anahtar, KDF));
    const bayt = naclUtil.decodeBase64(zarf.veri);
    bayt[0] ^= 1;
    expect(zarfiAc({ ...zarf, veri: naclUtil.encodeBase64(bayt) }, anahtar)).toBeNull();
  });

  it('her yazımda yeni nonce', async () => {
    const anahtar = await anahtarTuret('doğru parola 123', KDF);
    const a = gecerliZarf(zarfOlustur('aynı', anahtar, KDF));
    const b = gecerliZarf(zarfOlustur('aynı', anahtar, KDF));
    expect(a.nonce).not.toBe(b.nonce);
  });

  it.each([
    ['JSON değil', 'çöp'],
    ['null', 'null'],
    ['biçim yanlış', JSON.stringify({ bicim: 'baska', surum: 1, yedekSurumu: 1 })],
    ['kdf geçersiz', JSON.stringify({ bicim: ESITLEME_BICIMI, surum: 1, yedekSurumu: 1, kdf: { ad: 'scrypt', N: 2 ** 30, r: 8, p: 1, tuz: 'AA==' }, nonce: 'a', veri: 'b' })],
    ['nonce yok', JSON.stringify({ bicim: ESITLEME_BICIMI, surum: 1, yedekSurumu: 1, kdf: KDF, veri: 'b' })],
  ])('bozuk zarf (%s) → bozuk', (_ad, ham) => {
    expect(zarfiAyristir(ham).tur).toBe('bozuk');
  });

  it('daha yeni zarf ya da payload sürümü → surumYeni (üzerine yazılmasın)', () => {
    const taban = { bicim: ESITLEME_BICIMI, surum: 1, yedekSurumu: 1, kdf: KDF, nonce: 'a', veri: 'b' };
    expect(zarfiAyristir(JSON.stringify({ ...taban, surum: ESITLEME_ZARF_SURUMU + 1 })).tur).toBe('surumYeni');
    expect(zarfiAyristir(JSON.stringify({ ...taban, yedekSurumu: YEDEK_SURUMU + 1 })).tur).toBe('surumYeni');
  });
});
