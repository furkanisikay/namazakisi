import type { Sozluk } from '../tr';

/**
 * Soranî vakit adları (Irak Kürdistanı çizelgelerindeki yerleşik biçim): بەیانی · خۆرھەڵاتن ·
 * نیوەڕۆ · عەسر · ئێوارە · خەوتنان; cuma ھەینی. Arap harfinde büyük/küçük yoktur: `buyuk` ve
 * `kucuk` `adlar` ile aynıdır. Çizelge satırı (`imsakVakti`) fecir adıdır, "Imsak" değil.
 * İmla: ی (U+06CC), ک (U+06A9), ە (U+06D5); ünsüz "h" ھ (U+06BE) — CLDR (ھەینی), ckb
 * Vikipedi ve QuranEnc meali (widget'ta yan yana) böyle yazar; U+0647, U+064A, U+0643 kullanılmaz.
 * Hitap: yönetim "ئێوە" + kibar emir ("ھەڵبژێرن"); ibadete çağrı "تۆ" + emir ("نوێژ بکە").
 * Terimler: Kıldım = "نوێژم کرد" · Kılındı = "کرا" · kaza قەزا · nafile نافیلە · kerahat
 * کاتی مەکروھ · kıble قیبلە · seri زنجیرە · Namaz Muhafızı پارێزەری نوێژ · hesap yöntemi
 * شێوازی ھەژمارکردن · kuşluk چێشتەنگاو · evvâbîn ئەوابین · teheccüd تەھەجود · ezan بانگ ·
 * sahur پارشێو · iftar بەربانگ · Allah kabul etsin "خوا قبوڵی بکات".
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'بەیانی', gunes: 'خۆرھەڵاتن', ogle: 'نیوەڕۆ', ikindi: 'عەسر', aksam: 'ئێوارە', yatsi: 'خەوتنان' },
  buyuk: { imsak: 'بەیانی', gunes: 'خۆرھەڵاتن', ogle: 'نیوەڕۆ', ikindi: 'عەسر', aksam: 'ئێوارە', yatsi: 'خەوتنان' },
  kucuk: { imsak: 'بەیانی', gunes: 'خۆرھەڵاتن', ogle: 'نیوەڕۆ', ikindi: 'عەسر', aksam: 'ئێوارە', yatsi: 'خەوتنان' },
  imsakVakti: 'بەیانی',
  cuma: 'ھەینی',
  cumaKucuk: 'ھەینی',
  gunesDogusu: 'خۆرھەڵاتن',
  gunesDogusuKucuk: 'خۆرھەڵاتن',
  durum: { kilindi: 'کرا', vaktiGeldi: 'کاتی ھاتووە', girmedi: 'ھێشتا کاتی نەھاتووە', gecti: 'نەکرا' },
  durumKucuk: { kilindi: 'کرا', vaktiGeldi: 'کاتی ھاتووە', girmedi: 'ھێشتا کاتی نەھاتووە', gecti: 'نەکرا' },
  eylem: { kildim: 'نوێژم کرد', kilindi: 'کرا' },
  kerahatVakti: 'کاتی مەکروھ',
  isaretle: 'وەک کراو نیشانە بکەن',
  geriAlEtiketi: '{durum}، بۆ گەڕاندنەوە دەستی لێ بدەن',
  geriAlindi: 'نیشانەکە لابرا',
};
