import type { Sozluk } from '../tr';

/**
 * Sinhala vakit adları (HadeethEnc si çoğunluk yazımı; ACJU "ෆජ්ර් නැමදුම"): ෆජ්ර් · හිරු උදාව ·
 * ලුහර් · අසර් · මග්රිබ් · ඉෂා; cuma ජුමුආ ("ජුමුආ සලාතය"). Sinhala yazısında büyük/küçük harf
 * yoktur: `buyuk` ve `kucuk` `adlar` ile aynıdır. Çizelge satırı (`imsakVakti`) fecir adıdır.
 * Yazım tek biçim: bağlı harf ZWJ ile (ප්‍ර, ක්‍ර), මග්රිබ් ZWJ'siz (HE yazımı).
 * Terimler: namaz සලාතය (sıfat/bileşikte සලාත්; ACJU) · Kıldım "ඉටු කළෙමි" (HE, cinsiyetsiz) ·
 * Kılındı "ඉටු කළා" (türetildi) · kaza "අතපසු වූ සලාත" (ACJU'nun oruç kazası kalıbı
 * "අතපසුවූ උපවාසශීල"; "කළා" "yaptı" fiiliyle çakıştığı için kullanılmaz) · kaza kılmak "නැවත ඉටු
 * කිරීම" (HE) · nafile නෆ්ල් (ACJU) · kerahat "තහනම් වේලාව" (HE 6610) · kıble කිබ්ලාව · cami
 * මස්ජිදය · ezan අදාන් · abdest වුළූ · kuşluk ළුහා · teheccüd තහජ්ජුද් · vitir විත්ර් ·
 * seri අඛණ්ඩතාව · Namaz Muhafızı "සලාත් ආරක්ෂකයා" · hesap yöntemi "ගණනය කිරීමේ ක්‍රමය" ·
 * Allah අල්ලාහ් · Kur'an කුර්ආනය · sure සූරා · Ramazan රමළාන් · oruç උපවාසය · iftar ඉෆ්තාර් ·
 * sahur සහර්. Hitap "ඔබ" + ‑න්න emri (ACJU, AOSP si); meal hitabı නුඹ/නුඹලා YOK. İbadete çağrı
 * aynı ‑න්න emri ("සලාතය ඉටු කරන්න", "සලාතය සඳහා නැගිටින්න"; HE "සලාතය සඳහා නැගිට").
 * Ayarlar terimleri AOSP si: සැකසීම්, දැනුම්දීම්, ස්ථානය, බැටරිය, නිහඬ, කම්පනය.
 * Sayı ile birim arasında boşluk; kalıp sözleşmesi gereği sayı önce ("5 මිනි"). Rakam Batı (0-9).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'ෆජ්ර්', gunes: 'හිරු උදාව', ogle: 'ලුහර්', ikindi: 'අසර්', aksam: 'මග්රිබ්', yatsi: 'ඉෂා' },
  buyuk: { imsak: 'ෆජ්ර්', gunes: 'හිරු උදාව', ogle: 'ලුහර්', ikindi: 'අසර්', aksam: 'මග්රිබ්', yatsi: 'ඉෂා' },
  kucuk: { imsak: 'ෆජ්ර්', gunes: 'හිරු උදාව', ogle: 'ලුහර්', ikindi: 'අසර්', aksam: 'මග්රිබ්', yatsi: 'ඉෂා' },
  imsakVakti: 'ෆජ්ර්',
  cuma: 'ජුමුආ',
  cumaKucuk: 'ජුමුආ',
  gunesDogusu: 'හිරු උදාව',
  gunesDogusuKucuk: 'හිරු උදාව',
  durum: { kilindi: 'ඉටු කළා', vaktiGeldi: 'සලාත් වේලාවයි', girmedi: 'තවම වේලාව නැත', gecti: 'ඉටු කර නැත' },
  durumKucuk: { kilindi: 'ඉටු කළා', vaktiGeldi: 'සලාත් වේලාවයි', girmedi: 'තවම වේලාව නැත', gecti: 'ඉටු කර නැත' },
  eylem: { kildim: 'ඉටු කළෙමි', kilindi: 'ඉටු කළා' },
  kerahatVakti: 'තහනම් වේලාව',
  isaretle: 'ඉටු කළ බව සලකුණු කරන්න',
  geriAlEtiketi: '{durum}, අහෝසි කිරීමට තට්ටු කරන්න',
  geriAlindi: 'සලකුණ ඉවත් කළා',
};
