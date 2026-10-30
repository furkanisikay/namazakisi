/**
 * Desteklenen diller. Bir dil `secilebilir: true` olmadan seçicide görünmez ve cihaz
 * dili olarak kendiliğinden seçilmez: JS sözlüğü tip düzeyinde her zaman tamdır, ama
 * çıkarılmamış Türkçe metin kalırken (cırcır `turkceMetinSayaci`) ya da native metinler
 * (widget, bildirim kanalı, saat) üretilmeden dil açılırsa ekranlar yarım çevrili görünür.
 * Gözden geçirilmemiş çeviri `beta: true` taşır (seçicide rozet).
 */
export type DilKodu = 'tr' | 'en' | 'id' | 'de' | 'fr' | 'bs' | 'ru' | 'ms' | 'ar' | 'ur' | 'es' | 'nl' | 'sq' | 'hi' | 'bn' | 'fa' | 'ps' | 'ckb' | 'ug' | 'az' | 'uz' | 'kk' | 'ky' | 'tg' | 'sw' | 'ha' | 'am' | 'om' | 'so' | 'ff' | 'yo';

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
  { kod: 'ar', yerelAd: 'العربية', yon: 'rtl', ttsDili: 'ar-SA', beta: true, secilebilir: true },
  { kod: 'ur', yerelAd: 'اردو', yon: 'rtl', ttsDili: 'ur-PK', beta: true, secilebilir: true },
  { kod: 'es', yerelAd: 'Español', yon: 'ltr', ttsDili: 'es-ES', beta: true, secilebilir: true },
  { kod: 'nl', yerelAd: 'Nederlands', yon: 'ltr', ttsDili: 'nl-NL', beta: true, secilebilir: true },
  { kod: 'sq', yerelAd: 'Shqip', yon: 'ltr', ttsDili: 'sq-AL', beta: true, secilebilir: true },
  { kod: 'hi', yerelAd: 'हिन्दी', yon: 'ltr', ttsDili: 'hi-IN', beta: true, secilebilir: true },
  { kod: 'bn', yerelAd: 'বাংলা', yon: 'ltr', ttsDili: 'bn-BD', beta: true, secilebilir: true },
  { kod: 'fa', yerelAd: 'فارسی', yon: 'rtl', ttsDili: 'fa-IR', beta: true, secilebilir: true },
  { kod: 'ps', yerelAd: 'پښتو', yon: 'rtl', ttsDili: 'ps-AF', beta: true, secilebilir: true },
  { kod: 'ckb', yerelAd: 'کوردی', yon: 'rtl', ttsDili: 'ckb-IQ', beta: true, secilebilir: true },
  { kod: 'ug', yerelAd: 'ئۇيغۇرچە', yon: 'rtl', ttsDili: 'ug-CN', beta: true, secilebilir: true },
  { kod: 'az', yerelAd: 'Azərbaycanca', yon: 'ltr', ttsDili: 'az-AZ', beta: true, secilebilir: true },
  // Özbekçe adı Latin (dil varsayılanı); Kazakça Kiril. Sözlük kaynağı ikisinde de Kiril (`core/dil/yazi.ts`).
  { kod: 'uz', yerelAd: 'Oʻzbekcha', yon: 'ltr', ttsDili: 'uz-UZ', beta: true, secilebilir: true },
  { kod: 'kk', yerelAd: 'Қазақша', yon: 'ltr', ttsDili: 'kk-KZ', beta: true, secilebilir: true },
  { kod: 'ky', yerelAd: 'Кыргызча', yon: 'ltr', ttsDili: 'ky-KG', beta: true, secilebilir: true },
  { kod: 'tg', yerelAd: 'Тоҷикӣ', yon: 'ltr', ttsDili: 'tg-TJ', beta: true, secilebilir: true },
  // Afrika (dalga 8). Fula = Pular (Gine, Fuuta Jallon; QuranEnc `fulani_rwwad` "Firo e Pular-Fulfulde"), Latin; Adlam yok.
  { kod: 'sw', yerelAd: 'Kiswahili', yon: 'ltr', ttsDili: 'sw-TZ', beta: true, secilebilir: true },
  { kod: 'ha', yerelAd: 'Hausa', yon: 'ltr', ttsDili: 'ha-NG', beta: true, secilebilir: true },
  { kod: 'am', yerelAd: 'አማርኛ', yon: 'ltr', ttsDili: 'am-ET', beta: true, secilebilir: true },
  { kod: 'om', yerelAd: 'Afaan Oromoo', yon: 'ltr', ttsDili: 'om-ET', beta: true, secilebilir: true },
  { kod: 'so', yerelAd: 'Soomaali', yon: 'ltr', ttsDili: 'so-SO', beta: true, secilebilir: true },
  { kod: 'ff', yerelAd: 'Pular', yon: 'ltr', ttsDili: 'ff-GN', beta: true, secilebilir: true },
  { kod: 'yo', yerelAd: 'Èdè Yorùbá', yon: 'ltr', ttsDili: 'yo-NG', beta: true, secilebilir: true },
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
