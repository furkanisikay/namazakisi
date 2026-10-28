import type { Sozluk } from '../tr';

/**
 * Peştuca vakit adları (Afganistan/Pakistan halk kullanımı): سهار · لمر ختل · ماسپښین ·
 * مازدیګر · ماښام · ماسخوتن; cuma جمعه. Namaz = لمونځ (eğik hâl لمانځه; QuranEnc
 * `pashto_rwwad` meali de böyle yazar). Arap harfinde büyük/küçük yoktur: `buyuk` ve `kucuk`
 * `adlar` ile aynıdır. Çizelge satırı (`imsakVakti`) sabah/fecir adıdır, "Imsak" değil.
 * Terimler: Kıldım = "لمونځ مې وکړ" · Kılındı = "ادا شو" · kaza قضا · nafile نفل ·
 * kerahat مکروه وخت · kıble قبله · seri لړۍ · Namaz Muhafızı د لمانځه ساتونکی · hesap yöntemi
 * د حساب طریقه · kuşluk څاښت (işrak اشراق) · evvâbîn اوابین · teheccüd تهجد · vitir وتر.
 * Hitap: yönetim "تاسو" + kibar emir (…کړئ), ibadete çağrı "ته" + emir (لمونځ وکړه).
 * Vakit adları yerli okuyucuyla DOĞRULANMADI (سهار ve ماښام sözlük kaynağıyla doğrulandı).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'سهار', gunes: 'لمر ختل', ogle: 'ماسپښین', ikindi: 'مازدیګر', aksam: 'ماښام', yatsi: 'ماسخوتن' },
  buyuk: { imsak: 'سهار', gunes: 'لمر ختل', ogle: 'ماسپښین', ikindi: 'مازدیګر', aksam: 'ماښام', yatsi: 'ماسخوتن' },
  kucuk: { imsak: 'سهار', gunes: 'لمر ختل', ogle: 'ماسپښین', ikindi: 'مازدیګر', aksam: 'ماښام', yatsi: 'ماسخوتن' },
  imsakVakti: 'سهار',
  cuma: 'جمعه',
  cumaKucuk: 'جمعه',
  gunesDogusu: 'لمر ختل',
  gunesDogusuKucuk: 'لمر ختل',
  durum: { kilindi: 'ادا شو', vaktiGeldi: 'د لمانځه وخت دی', girmedi: 'وخت لا نه دی شوی', gecti: 'ادا نه شو' },
  durumKucuk: { kilindi: 'ادا شو', vaktiGeldi: 'د لمانځه وخت دی', girmedi: 'وخت لا نه دی شوی', gecti: 'ادا نه شو' },
  eylem: { kildim: 'لمونځ مې وکړ', kilindi: 'ادا شو' },
  kerahatVakti: 'مکروه وخت',
  isaretle: 'د ادا شوي په توګه یې نښه کړئ',
  geriAlEtiketi: '{durum}، د بېرته اخیستو لپاره یې کېکاږئ',
  geriAlindi: 'نښه لرې شوه',
};
