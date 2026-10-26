/**
 * Desteklenen diller. Bir dil `secilebilir: true` olmadan seçicide görünmez ve cihaz
 * dili olarak kendiliğinden seçilmez: JS sözlüğü tip düzeyinde her zaman tamdır, ama
 * çıkarılmamış Türkçe metin kalırken (cırcır `turkceMetinSayaci`) ya da native metinler
 * (widget, bildirim kanalı, saat) üretilmeden dil açılırsa ekranlar yarım çevrili görünür.
 * Gözden geçirilmemiş çeviri `beta: true` taşır (seçicide rozet).
 */
export type DilKodu = 'tr' | 'en' | 'id' | 'de' | 'fr' | 'bs' | 'ru' | 'ms' | 'ar' | 'ur';

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
  { kod: 'en', yerelAd: 'English', yon: 'ltr', ttsDili: 'en-US', beta: true, secilebilir: true },
  { kod: 'id', yerelAd: 'Bahasa Indonesia', yon: 'ltr', ttsDili: 'id-ID', beta: true, secilebilir: true },
  { kod: 'de', yerelAd: 'Deutsch', yon: 'ltr', ttsDili: 'de-DE', beta: true, secilebilir: true },
  { kod: 'fr', yerelAd: 'Français', yon: 'ltr', ttsDili: 'fr-FR', beta: true, secilebilir: true }, // dil-haric: dilin kendi adı (çevrilmez)
  { kod: 'bs', yerelAd: 'Bosanski', yon: 'ltr', ttsDili: 'bs-BA', beta: true, secilebilir: true },
  { kod: 'ru', yerelAd: 'Русский', yon: 'ltr', ttsDili: 'ru-RU', beta: true, secilebilir: true },
  { kod: 'ms', yerelAd: 'Bahasa Melayu', yon: 'ltr', ttsDili: 'ms-MY', beta: true, secilebilir: true },
  { kod: 'ar', yerelAd: 'العربية', yon: 'rtl', ttsDili: 'ar-SA', beta: true, secilebilir: false },
  { kod: 'ur', yerelAd: 'اردو', yon: 'rtl', ttsDili: 'ur-PK', beta: true, secilebilir: false },
];

export const VARSAYILAN_DIL: DilKodu = 'tr';

/** Dil seçimi sunulur mu (Ayarlar satırı, arama kaydı, sihirbaz bağlantısı)? Tek dilde anlamsız. */
export const dilSeciciGorunur = (): boolean => DILLER.filter((d) => d.secilebilir).length > 1;

export function dilKoduMu(x: unknown): x is DilKodu {
  return typeof x === 'string' && DILLER.some((d) => d.kod === x);
}

/**
 * Cihaz yerel ayarından ("en_US", "en-GB", "tr-TR") seçilebilir dili bulur; yoksa null.
 * Büyük/küçük harf dönüşümü yapılmaz (yerel kimlikler zaten küçük harfle başlar).
 */
export function cihazDilindenSec(yerel: string | null | undefined): DilKodu | null {
  if (!yerel) return null;
  // Java `Locale` Endonezceyi eski ISO kodu "in" ile verir (Android `in_ID`).
  const ham = yerel.split(/[-_]/)[0];
  const kod = ham === 'in' ? 'id' : ham;
  const d = DILLER.find((x) => x.kod === kod && x.secilebilir);
  return d ? d.kod : null;
}
