/**
 * Yerel yedek dosyaları için şifreleme yardımcıları.
 *
 * Uygulama-yönetimli 32 baytlık sabit anahtar + dosya-başına rastgele nonce ile
 * tweetnacl `secretbox` (XSalsa20-Poly1305) kullanır. Amaç düz-metin dosyanın
 * cihazda açıkta durmaması ve bütünlük kontrolü. Gerçek gizlilik (Faz 2) için
 * hesap-türevli anahtar (PBKDF2 vb.) gerekir.
 *
 * NOT: ANAHTAR_BAYTLARI bir SIR DEGİLDİR; kaynak kodda herkese açıktır.
 */

import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import * as Crypto from 'expo-crypto';

// React Native (Hermes) ortamında tweetnacl'in güvenli PRNG'si YOKTUR: ne tarayıcı
// (`self.crypto`) ne de Node (`require('crypto')`) bulunduğundan modül yükünde PRNG
// kurulamaz ve `nacl.randomBytes` "no PRNG" hatası fırlatır. Bu yüzden cihazda yedek
// oluşturma (`sifrele` → `nacl.randomBytes`) patlardı; Jest node ortamında PRNG
// bulunduğundan testler yeşildi. expo-crypto'nun senkron `getRandomBytes`'i (CSPRNG)
// ile besleyerek bunu kalıcı çözeriz.
nacl.setPRNG((x, n) => {
  x.set(Crypto.getRandomBytes(n));
});

// 32 bayt uygulama anahtarı ("NamazAkisiYedek2026Key!@#$%^&*()")
const ANAHTAR_BAYTLARI = new Uint8Array([
  0x4e, 0x61, 0x6d, 0x61, 0x7a, 0x41, 0x6b, 0x69, 0x73, 0x69, 0x59, 0x65,
  0x64, 0x65, 0x6b, 0x32, 0x30, 0x32, 0x36, 0x4b, 0x65, 0x79, 0x21, 0x40,
  0x23, 0x24, 0x25, 0x5e, 0x26, 0x2a, 0x28, 0x29,
]); // 32 bayt

/**
 * Verilen düz metin stringi şifreler.
 * @returns Base64 kodlu `nonce` ve `veri` içeren nesne.
 */
export async function sifrele(metin: string): Promise<{ nonce: string; veri: string }> {
  const nonceBaytlari = nacl.randomBytes(nacl.secretbox.nonceLength);
  const mesaj = naclUtil.decodeUTF8(metin);
  const sifreli = nacl.secretbox(mesaj, nonceBaytlari, ANAHTAR_BAYTLARI);
  return {
    nonce: naclUtil.encodeBase64(nonceBaytlari),
    veri: naclUtil.encodeBase64(sifreli),
  };
}

/**
 * Şifrelenmiş veriyi çözer.
 * @returns Orijinal düz metin ya da hata/bütünlük başarısızlığında `null`.
 */
export function coz(nonce: string, veri: string): string | null {
  try {
    const nonceBaytlari = naclUtil.decodeBase64(nonce);
    const sifreli = naclUtil.decodeBase64(veri);
    const cozulen = nacl.secretbox.open(sifreli, nonceBaytlari, ANAHTAR_BAYTLARI);
    if (!cozulen) return null;
    return naclUtil.encodeUTF8(cozulen);
  } catch {
    return null;
  }
}

/**
 * Verilen string için SHA-256 kontrol özeti hesaplar (hex).
 */
export async function kontrolHesapla(metin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, metin);
}
