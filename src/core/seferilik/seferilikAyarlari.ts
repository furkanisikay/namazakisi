/**
 * Seferîlik bilgi kartı ayarları (issue #296) — saf tipler ve normalize.
 *
 * Kart HÜKÜM VERMEZ: konum ikamet yerinden ≈90 km uzaklaşınca Diyanet'in
 * fetvalarını özetleyen kapatılabilir bir bilgi kartı gösterir. Mezhep seçimi
 * YALNIZ bu kartın içeriğini değiştirir; namaz vakti (ikindi) hesabına DOKUNMAZ
 * (vakit hesabı `NamazVaktiHesaplayiciServisi`'nde, ayrı ve büyük bir karar).
 *
 * İki ayrı kayıt vardır:
 * - `SeferilikAyarlari` YEDEKLENİR (beyaz listenin üç yeri): kart açık mı,
 *   mezhep, ikamet yeri.
 * - `SeferilikKartHafizasi` cihaza özgüdür, yedeklenmez: "bu yolculukta kartı
 *   kapattım" hafızası.
 */

// Mezhep artık ORTAK ayardır (`core/mezhep/mezhepAyari.ts`, Kaza Defteri 2.0).
// `SeferilikAyarlari.mezhep` ekranlara aynı değeri taşır; kaynağı ortak ayardır.
import type { Mezhep } from '../mezhep/mezhepAyari';
export { MEZHEPLER, MEZHEP_ADLARI } from '../mezhep/mezhepAyari';
export type { Mezhep } from '../mezhep/mezhepAyari';

/**
 * Kullanıcının "evim" dediği yer. `ilkKonum`: kullanıcı hiç seçmediyse uygulamanın
 * gördüğü ilk geçerli konum (issue: "yoksa ilk kurulum konumu"); `kullanici`:
 * "Burası evim" ile elle seçildi.
 */
export interface IkametYeri {
  lat: number;
  lng: number;
  /** Gösterim için yer adı (ör. "Kadıköy, İstanbul"); bilinmiyorsa yok. */
  ad?: string;
  kaynak: 'ilkKonum' | 'kullanici';
}

export interface SeferilikAyarlari {
  /** Ana ekrandaki bilgi kartı gösterilsin mi? */
  kartAcik: boolean;
  /** Kart içeriğinin mezhebi (vakit hesabını ETKİLEMEZ). */
  mezhep: Mezhep;
  /** İkamet yeri; null = henüz bilinmiyor (ilk geçerli konum yazılacak). */
  ikamet: IkametYeri | null;
}

export const VARSAYILAN_SEFERILIK_AYARLARI: SeferilikAyarlari = {
  kartAcik: true,
  mezhep: 'hanefi',
  ikamet: null,
};

/** "Bu yolculukta kartı kapattım" — ikamete dönülünce sıfırlanır. */
export interface SeferilikKartHafizasi {
  yolculuktaKapatildi: boolean;
}

export const VARSAYILAN_SEFERILIK_HAFIZASI: SeferilikKartHafizasi = {
  yolculuktaKapatildi: false,
};

const nesneMi = (ham: unknown): ham is Record<string, unknown> =>
  !!ham && typeof ham === 'object' && !Array.isArray(ham);

/**
 * Koordinat kullanılabilir mi? `{0,0}` projede "henüz yapılandırılmadı"
 * nöbetçisidir (Gine Körfezi) — ikamet olarak yazılırsa her yer "yolculuk" olurdu.
 */
export function gecerliKoordinatMi(k: { lat?: unknown; lng?: unknown } | null | undefined): k is { lat: number; lng: number } {
  if (!k) return false;
  const { lat, lng } = k;
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return false;
  return !(lat === 0 && lng === 0);
}

function ikametNormalize(ham: unknown): IkametYeri | null {
  if (!nesneMi(ham) || !gecerliKoordinatMi(ham as { lat?: unknown; lng?: unknown })) return null;
  const k = ham as Record<string, unknown>;
  const ikamet: IkametYeri = {
    lat: k.lat as number,
    lng: k.lng as number,
    kaynak: k.kaynak === 'kullanici' ? 'kullanici' : 'ilkKonum',
  };
  if (typeof k.ad === 'string' && k.ad.trim() !== '') ikamet.ad = k.ad.trim();
  return ikamet;
}

/** Bozuk / eksik / nesne-dışı kayıt varsayılana düşer (okuma ASLA reddetmez). */
export function seferilikAyarlariniNormalize(ham: unknown): SeferilikAyarlari {
  if (!nesneMi(ham)) return { ...VARSAYILAN_SEFERILIK_AYARLARI };
  return {
    // Alanın YOKLUĞU "açık" demektir; yalnız açıkça `false` kapatır.
    kartAcik: ham.kartAcik !== false,
    mezhep: ham.mezhep === 'safii' ? 'safii' : 'hanefi',
    ikamet: ikametNormalize(ham.ikamet),
  };
}

export function seferilikHafizasiniNormalize(ham: unknown): SeferilikKartHafizasi {
  if (!nesneMi(ham)) return { ...VARSAYILAN_SEFERILIK_HAFIZASI };
  return { yolculuktaKapatildi: ham.yolculuktaKapatildi === true };
}
