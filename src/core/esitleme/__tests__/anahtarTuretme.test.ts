/**
 * Cihazlar arası eşitleme (issue #288) — parola → anahtar türetme.
 */
import naclUtil from 'tweetnacl-util';
import {
  ANAHTAR_UZUNLUGU,
  KDF_VARSAYILAN_MALIYET,
  KdfParametreleri,
  anahtarTuret,
  kdfAyniMi,
  kdfGecerliMi,
  parolaSorunu,
  parolayiNormalizeEt,
  yeniKdfParametreleri,
} from '../anahtarTuretme';

const tuz = naclUtil.encodeBase64(new Uint8Array(16).fill(7));
/** Testte hızlı (2^10) ama sınır içinde parametre. */
const HIZLI: KdfParametreleri = { ad: 'scrypt', N: 2 ** 10, r: 8, p: 1, tuz };

describe('kdfGecerliMi (DoS sınırları)', () => {
  it('geçerli parametreyi kabul eder', () => {
    expect(kdfGecerliMi(HIZLI)).toBe(true);
    expect(kdfGecerliMi({ ...HIZLI, ...KDF_VARSAYILAN_MALIYET })).toBe(true);
  });

  it.each([
    ['N 2 nin kuvveti değil', { ...HIZLI, N: 3000 }],
    ['N çok büyük', { ...HIZLI, N: 2 ** 20 }],
    ['N çok küçük', { ...HIZLI, N: 2 ** 4 }],
    ['r sınır dışı', { ...HIZLI, r: 64 }],
    ['p sınır dışı', { ...HIZLI, p: 0 }],
    ['ad yanlış', { ...HIZLI, ad: 'pbkdf2' }],
    ['tuz kısa', { ...HIZLI, tuz: naclUtil.encodeBase64(new Uint8Array(4)) }],
    ['tuz base64 değil', { ...HIZLI, tuz: '***' }],
  ])('%s → reddedilir', (_ad, deger) => {
    expect(kdfGecerliMi(deger)).toBe(false);
  });

  it('nesne olmayanı reddeder', () => {
    expect(kdfGecerliMi(null)).toBe(false);
    expect(kdfGecerliMi('scrypt')).toBe(false);
  });
});

describe('anahtarTuret', () => {
  it('aynı parola + tuz → aynı 32 bayt; farklı parola → farklı anahtar', async () => {
    const a = await anahtarTuret('uzun bir parola', HIZLI);
    const b = await anahtarTuret('uzun bir parola', HIZLI);
    const c = await anahtarTuret('uzun bir parolA', HIZLI);
    expect(a).toHaveLength(ANAHTAR_UZUNLUGU);
    expect(Array.from(a)).toEqual(Array.from(b));
    expect(Array.from(a)).not.toEqual(Array.from(c));
  });

  it('farklı tuz → farklı anahtar', async () => {
    const digerTuz = { ...HIZLI, tuz: naclUtil.encodeBase64(new Uint8Array(16).fill(9)) };
    const a = await anahtarTuret('uzun bir parola', HIZLI);
    const b = await anahtarTuret('uzun bir parola', digerTuz);
    expect(Array.from(a)).not.toEqual(Array.from(b));
  });

  it('NFC/NFD farkı aynı anahtarı verir (klavyeler arası)', async () => {
    const nfc = 'şifre güçlüdür';
    const nfd = nfc.normalize('NFD');
    expect(nfd).not.toBe(nfc);
    const a = await anahtarTuret(nfc, HIZLI);
    const b = await anahtarTuret(nfd, HIZLI);
    expect(Array.from(a)).toEqual(Array.from(b));
    expect(parolayiNormalizeEt(nfd)).toBe(nfc);
  });

  it('geçersiz parametrede fırlatır (uzaktan gelen zarf DoS koruması)', async () => {
    await expect(anahtarTuret('uzun bir parola', { ...HIZLI, N: 2 ** 24 })).rejects.toThrow();
  });
});

describe('yardımcılar', () => {
  it('yeniKdfParametreleri varsayılan maliyet + 16 baytlık tuz üretir', () => {
    const kdf = yeniKdfParametreleri((n) => new Uint8Array(n).fill(1));
    expect(kdf).toMatchObject({ ad: 'scrypt', ...KDF_VARSAYILAN_MALIYET });
    expect(naclUtil.decodeBase64(kdf.tuz)).toHaveLength(16);
    expect(kdfGecerliMi(kdf)).toBe(true);
  });

  it('kdfAyniMi tüm alanları karşılaştırır', () => {
    expect(kdfAyniMi(HIZLI, { ...HIZLI })).toBe(true);
    expect(kdfAyniMi(HIZLI, { ...HIZLI, N: 2 ** 11 })).toBe(false);
  });

  it('parolaSorunu kısa parolada kibar bir neden döner', () => {
    expect(parolaSorunu('kisa')).toMatch(/en az 10 karakter/);
    expect(parolaSorunu('yeterince uzun')).toBeNull();
  });
});
