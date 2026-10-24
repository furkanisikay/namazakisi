/**
 * Desteklenen diller. Bir dil `secilebilir: true` olmadan seçicide görünmez ve cihaz
 * dili olarak kendiliğinden seçilmez: JS sözlüğü tip düzeyinde her zaman tamdır, ama
 * çıkarılmamış Türkçe metin kalırken (cırcır `turkceMetinSayaci`) ya da native metinler
 * (widget, bildirim kanalı, saat) üretilmeden dil açılırsa ekranlar yarım çevrili görünür.
 * Gözden geçirilmemiş çeviri `beta: true` taşır (seçicide rozet).
 */
export type DilKodu = 'tr' | 'en';

export interface DilTanimi {
  kod: DilKodu;
  /** Dilin kendi dilindeki adı (seçicide böyle yazılır). */
  yerelAd: string;
  yon: 'ltr' | 'rtl';
  /** Sesli okuma (TTS) dili, BCP-47. */
  ttsDili: string;
  beta: boolean;
  secilebilir: boolean;
}

export const DILLER: readonly DilTanimi[] = [
  { kod: 'tr', yerelAd: 'Türkçe', yon: 'ltr', ttsDili: 'tr-TR', beta: false, secilebilir: true }, // dil-haric: dilin kendi adı (çevrilmez)
  { kod: 'en', yerelAd: 'English', yon: 'ltr', ttsDili: 'en-US', beta: true, secilebilir: false },
];

export const VARSAYILAN_DIL: DilKodu = 'tr';

export function dilKoduMu(x: unknown): x is DilKodu {
  return typeof x === 'string' && DILLER.some((d) => d.kod === x);
}

/**
 * Cihaz yerel ayarından ("en_US", "en-GB", "tr-TR") seçilebilir dili bulur; yoksa null.
 * Büyük/küçük harf dönüşümü yapılmaz (yerel kimlikler zaten küçük harfle başlar).
 */
export function cihazDilindenSec(yerel: string | null | undefined): DilKodu | null {
  if (!yerel) return null;
  const kod = yerel.split(/[-_]/)[0];
  const d = DILLER.find((x) => x.kod === kod && x.secilebilir);
  return d ? d.kod : null;
}
