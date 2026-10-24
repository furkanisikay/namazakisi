/**
 * Cihazlar arası eşitleme (issue #288) — parola → anahtar türetme (KDF).
 *
 * Eşitleme verisi kullanıcının KENDİ bulut alanında (Google Drive `appDataFolder`,
 * iCloud) durur ve yalnız onun bildiği bir paroladan türetilen anahtarla şifrelenir
 * (uçtan uca). Geliştirici ve bulut sağlayıcısı içeriği okuyamaz.
 *
 * KDF = scrypt (`@noble/hashes`, MIT, saf JS). Neden scrypt: bellek-zor olduğu için
 * GPU/ASIC ile toplu parola denemesini PBKDF2'den çok daha pahalı kılar; Argon2id
 * saf JS'te daha yavaş ve Hermes'te (JIT yok) pratik değildir.
 *
 * PARAMETRE GEREKÇESİ (ölçüldü, 2026-10): `N=2^14, r=8, p=1` (16 MiB bellek).
 * Sunucu CPU'sunda V8 JIT ile ~90 ms, `node --jitless` (yorumlayıcı; Hermes'e yakın
 * koşul) ile ~4,4 sn; `N=2^15` ~8,4 sn, `N=2^16` ~17 sn. Telefonlar sunucudan 1,5–3
 * kat yavaştır → 2^15 kurulumda 15–25 sn'lik donma demekti. Türetme yalnız kurulumda
 * (ve tuz değişince) BİR KEZ yapılır; anahtar güvenli depoda önbelleklenir, 15 dk'lık
 * arka plan görevi KDF ÇALIŞTIRMAZ. Düşük N'yi telafi etmek için parola en az
 * `PAROLA_EN_AZ_UZUNLUK` karakter istenir. Parametreler ZARFTA taşınır → ileride
 * artırılabilir (yeni tuz/parametreyle yeniden şifreleme), eski zarf okunmaya devam eder.
 *
 * DoS koruması: zarf uzaktan gelir ve bozuk/kötü niyetli olabilir → `kdfGecerliMi`
 * parametreleri SINIRLAR (N ≤ 2^17); aksi halde tek bir zarf cihazda dakikalarca
 * süren / belleği tüketen bir türetmeyi tetikleyebilirdi.
 */

import { scryptAsync } from '@noble/hashes/scrypt';
import { bicim, metin } from '../dil/aktifDil';
import naclUtil from 'tweetnacl-util';

/** Zarfta taşınan KDF parametreleri. */
export interface KdfParametreleri {
  ad: 'scrypt';
  /** CPU/bellek maliyeti — 2'nin kuvveti. */
  N: number;
  /** Blok boyutu. */
  r: number;
  /** Paralellik. */
  p: number;
  /** Rastgele tuz (base64). */
  tuz: string;
}

/** Yeni kurulumlarda kullanılan maliyet (gerekçe dosya başında). */
export const KDF_VARSAYILAN_MALIYET = { N: 2 ** 14, r: 8, p: 1 } as const;

/** Türetilen anahtar uzunluğu (secretbox anahtarı = 32 bayt). */
export const ANAHTAR_UZUNLUGU = 32;

/** Tuz uzunluğu (bayt). */
export const TUZ_UZUNLUGU = 16;

/** Parolanın en az uzunluğu (düşük N'nin telafisi). */
export const PAROLA_EN_AZ_UZUNLUK = 10;

/** Uzaktan gelen parametrelerin üst sınırları (DoS koruması). */
const N_EN_AZ = 2 ** 10;
const N_EN_COK = 2 ** 17;
const R_EN_COK = 16;
const P_EN_COK = 4;
const TUZ_EN_AZ = 16;
const TUZ_EN_COK = 64;

const ikininKuvvetiMi = (n: number): boolean => Number.isInteger(n) && n > 0 && (n & (n - 1)) === 0;

/** Base64 tuzu güvenle çözer; geçersizse `null`. */
const tuzuCoz = (tuz: string): Uint8Array | null => {
  try {
    return naclUtil.decodeBase64(tuz);
  } catch {
    return null;
  }
};

/** Uzaktan gelen KDF parametreleri kabul edilebilir mi? (biçim + DoS sınırları) */
export function kdfGecerliMi(deger: unknown): deger is KdfParametreleri {
  if (!deger || typeof deger !== 'object') return false;
  const k = deger as Partial<KdfParametreleri>;
  if (k.ad !== 'scrypt') return false;
  if (typeof k.N !== 'number' || !ikininKuvvetiMi(k.N) || k.N < N_EN_AZ || k.N > N_EN_COK) return false;
  if (typeof k.r !== 'number' || !Number.isInteger(k.r) || k.r < 1 || k.r > R_EN_COK) return false;
  if (typeof k.p !== 'number' || !Number.isInteger(k.p) || k.p < 1 || k.p > P_EN_COK) return false;
  if (typeof k.tuz !== 'string') return false;
  const tuz = tuzuCoz(k.tuz);
  return !!tuz && tuz.length >= TUZ_EN_AZ && tuz.length <= TUZ_EN_COK;
}

/** Yeni bir kurulum için rastgele tuzlu parametre üretir. */
export function yeniKdfParametreleri(rastgele: (uzunluk: number) => Uint8Array): KdfParametreleri {
  return {
    ad: 'scrypt',
    ...KDF_VARSAYILAN_MALIYET,
    tuz: naclUtil.encodeBase64(rastgele(TUZ_UZUNLUGU)),
  };
}

/** İki parametre kümesi AYNI anahtarı mı üretir? (önbellek eşleşmesi) */
export function kdfAyniMi(a: KdfParametreleri, b: KdfParametreleri): boolean {
  return a.ad === b.ad && a.N === b.N && a.r === b.r && a.p === b.p && a.tuz === b.tuz;
}

/**
 * Parolayı Unicode NFC'ye indirger: aynı görünen parola farklı klavyelerde farklı
 * kod noktası dizisiyle gelebilir (ör. "ş" tek kod noktası ya da "s" + birleşik
 * çengel). Normalize edilmezse iPhone'da belirlenen parola tablette "yanlış" çıkar.
 * `normalize` bulunmayan bir motorda olduğu gibi kullanılır.
 */
export function parolayiNormalizeEt(parola: string): string {
  try {
    return typeof parola.normalize === 'function' ? parola.normalize('NFC') : parola;
  } catch {
    return parola;
  }
}

/** Parola kurala uyuyor mu? Uygunsa `null`, değilse kullanıcıya gösterilecek neden. */
export function parolaSorunu(parola: string): string | null {
  if (parolayiNormalizeEt(parola).length < PAROLA_EN_AZ_UZUNLUK) {
    return bicim(metin().yedekleme.parolaKisa, { n: PAROLA_EN_AZ_UZUNLUK });
  }
  return null;
}

/**
 * Paroladan 32 baytlık secretbox anahtarı türetir. `scryptAsync` arayı JS
 * döngüsüne bırakır → türetme sürerken arayüz donmaz (döndürme göstergesi döner).
 * @throws Parametreler geçersizse.
 */
export async function anahtarTuret(parola: string, kdf: KdfParametreleri): Promise<Uint8Array> {
  if (!kdfGecerliMi(kdf)) {
    throw new Error('Geçersiz anahtar türetme parametreleri');
  }
  const tuz = tuzuCoz(kdf.tuz) as Uint8Array;
  return scryptAsync(naclUtil.decodeUTF8(parolayiNormalizeEt(parola)), tuz, {
    N: kdf.N,
    r: kdf.r,
    p: kdf.p,
    dkLen: ANAHTAR_UZUNLUGU,
  });
}
