/**
 * Cihazlar arası eşitleme (issue #288) — uçtan uca şifreli, SÜRÜMLÜ zarf.
 *
 * Yerel yedek zarfıyla (`YedeklemeServisi`) aynı ilkel: tweetnacl `secretbox`
 * (XSalsa20-Poly1305, `yedekSifreleme.anahtarlaSifrele`). Fark ANAHTARDA: yerel yedek
 * kaynak kodda duran uygulama anahtarını kullanır (gizlilik değil), eşitleme
 * kullanıcı parolasından scrypt ile türetilen anahtarı kullanır (gerçek gizlilik).
 * Tuz ve KDF parametreleri zarfta açık durur — gizli değildirler, başka cihazın aynı
 * anahtarı türetebilmesi için gereklidirler.
 *
 * Bütünlük: secretbox kimlik doğrulamalı şifrelemedir (Poly1305 MAC). Yanlış parola,
 * kurcalanmış veri ve kesik içerik aynı sonucu verir: `null`. Ayrı bir SHA-256
 * kontrol alanı gerekmez.
 *
 * Sürüm iki katmanlıdır: `surum` zarf biçimini, `yedekSurumu` içteki payload şemasını
 * (`YEDEK_SURUMU`) taşır. Uygulamadan YENİ bir sürümle yazılmış zarf açılmaz VE
 * üzerine yazılmaz (`surumYeni`) — eski uygulama yeni cihazın verisini bozmasın.
 */

import { YEDEK_SURUMU } from '../types/YedeklemeTipleri';
import { anahtarlaCoz, anahtarlaSifrele } from '../utils/yedekSifreleme';
import { KdfParametreleri, kdfGecerliMi } from './anahtarTuretme';

export const ESITLEME_BICIMI = 'namaz-akisi-esitleme';
export const ESITLEME_ZARF_SURUMU = 1;

/** Buluta yazılan dış zarf (düz JSON). */
export interface EsitlemeZarfi {
  bicim: typeof ESITLEME_BICIMI;
  surum: number;
  /** İçteki payload'ın şema sürümü (`YEDEK_SURUMU`). */
  yedekSurumu: number;
  kdf: KdfParametreleri;
  /** secretbox nonce (base64) — her yazımda yeni. */
  nonce: string;
  /** Şifreli payload (base64). */
  veri: string;
  /** Yazım zamanı (ISO) — yalnız bilgi amaçlı. */
  olusturulma: string;
}

/** Ayrıştırma sonucu. */
export type ZarfAyristirmaSonucu =
  | { tur: 'gecerli'; zarf: EsitlemeZarfi }
  | { tur: 'bozuk' }
  | { tur: 'surumYeni' };

/** Uzaktan gelen metni zarf olarak doğrular. ASLA fırlatmaz. */
export function zarfiAyristir(ham: string): ZarfAyristirmaSonucu {
  let deger: unknown;
  try {
    deger = JSON.parse(ham);
  } catch {
    return { tur: 'bozuk' };
  }
  if (!deger || typeof deger !== 'object') return { tur: 'bozuk' };
  const z = deger as Partial<EsitlemeZarfi>;
  if (z.bicim !== ESITLEME_BICIMI) return { tur: 'bozuk' };
  if (typeof z.surum !== 'number' || typeof z.yedekSurumu !== 'number') return { tur: 'bozuk' };
  // İleri uyum: biçimi ya da içeriği bu uygulamadan yeni → dokunma.
  if (z.surum > ESITLEME_ZARF_SURUMU || z.yedekSurumu > YEDEK_SURUMU) return { tur: 'surumYeni' };
  if (!kdfGecerliMi(z.kdf)) return { tur: 'bozuk' };
  if (typeof z.nonce !== 'string' || typeof z.veri !== 'string') return { tur: 'bozuk' };
  return {
    tur: 'gecerli',
    zarf: {
      bicim: ESITLEME_BICIMI,
      surum: z.surum,
      yedekSurumu: z.yedekSurumu,
      kdf: z.kdf,
      nonce: z.nonce,
      veri: z.veri,
      olusturulma: typeof z.olusturulma === 'string' ? z.olusturulma : '',
    },
  };
}

/** Düz metni anahtarla şifreleyip zarf JSON'u üretir. */
export function zarfOlustur(
  duzMetin: string,
  anahtar: Uint8Array,
  kdf: KdfParametreleri,
  simdi: Date = new Date()
): string {
  const { nonce, veri } = anahtarlaSifrele(duzMetin, anahtar);
  const zarf: EsitlemeZarfi = {
    bicim: ESITLEME_BICIMI,
    surum: ESITLEME_ZARF_SURUMU,
    yedekSurumu: YEDEK_SURUMU,
    kdf,
    nonce,
    veri,
    olusturulma: simdi.toISOString(),
  };
  return JSON.stringify(zarf);
}

/** Zarfı anahtarla açar; yanlış anahtar / kurcalanmış veri → `null`. */
export function zarfiAc(zarf: EsitlemeZarfi, anahtar: Uint8Array): string | null {
  return anahtarlaCoz(zarf.nonce, zarf.veri, anahtar);
}
