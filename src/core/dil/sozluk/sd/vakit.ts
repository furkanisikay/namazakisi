// Sindhçe Arap harfli (Pakistan normu), SAĞDAN SOLA; büyük/küçük harf yok (`buyuk` = `adlar`). Rakam çizimde Doğu Arap (`arab`), sözlükte Batı rakamı.
import type { Sozluk } from '../tr';

/**
 * Sindhçe vakit adları (sd.wikipedia "نماز": "فجر، ظهر، عصر، مغرب ۽ عشاء"; güneş doğuşu
 * "سج اڀرڻ", sd.wikipedia "فجر"). Cuma جمعو (CLDR gün adı). İmla Sindhçe: ڪ (U+06AA), ي (U+064A),
 * ه (U+0647); Urduca kef (U+06A9 yalnız Sindhçe "kh" harfidir), ye ve he biçimleri değil. Kıldım = "نماز پڙهي ورتي" (geçişli geçmiş nesneye uyar,
 * konuşana göre cinsiyetsiz) · Kılındı = "پڙهي وئي" · kaza قضا نماز · nafile نفل · kerahat
 * مڪروه وقت · kıble قبلو · seri تسلسل · Namaz Muhafızı نماز محافظ · teheccüd تهجد.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'فجر', gunes: 'سج اڀرڻ', ogle: 'ظهر', ikindi: 'عصر', aksam: 'مغرب', yatsi: 'عشاء' },
  buyuk: { imsak: 'فجر', gunes: 'سج اڀرڻ', ogle: 'ظهر', ikindi: 'عصر', aksam: 'مغرب', yatsi: 'عشاء' },
  kucuk: { imsak: 'فجر', gunes: 'سج اڀرڻ', ogle: 'ظهر', ikindi: 'عصر', aksam: 'مغرب', yatsi: 'عشاء' },
  imsakVakti: 'فجر',
  cuma: 'جمعو',
  cumaKucuk: 'جمعو',
  gunesDogusu: 'سج اڀرڻ',
  gunesDogusuKucuk: 'سج اڀرڻ',
  durum: { kilindi: 'پڙهي وئي', vaktiGeldi: 'وقت ٿي ويو', girmedi: 'اڃا وقت نه ٿيو', gecti: 'نه پڙهي وئي' },
  durumKucuk: { kilindi: 'پڙهي وئي', vaktiGeldi: 'وقت ٿي ويو', girmedi: 'اڃا وقت نه ٿيو', gecti: 'نه پڙهي وئي' },
  eylem: { kildim: 'نماز پڙهي ورتي', kilindi: 'پڙهي وئي' },
  kerahatVakti: 'مڪروه وقت',
  isaretle: 'پڙهي وئي جو نشان لڳايو',
  geriAlEtiketi: '{durum}، واپس وٺڻ لاءِ ٽيپ ڪريو',
  geriAlindi: 'نشان هٽايو ويو',
};
