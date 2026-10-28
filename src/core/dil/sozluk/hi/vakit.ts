import type { Sozluk } from '../tr';

/**
 * Hintçe vakit adları (Hint Müslümanlarının Devanagari yazımı, nukta'lı): फ़ज्र · सूर्योदय ·
 * ज़ुहर · अस्र · मग़रिब · इशा; cuma जुमा. Devanagari'de büyük/küçük yoktur: `buyuk` ve `kucuk`
 * `adlar` ile aynıdır. Çizelge satırı (`imsakVakti`) fecir adıdır, "Imsak" değil.
 * İslami terimler Urdu kökenlidir (Sanskritçe dinî karşılık YOK: "प्रार्थना" değil "नमाज़").
 * Terimler: Kıldım = "नमाज़ पढ़ ली" (nesneye uyar, cinsiyetsiz) · Kılındı = "पढ़ ली गई" ·
 * kaza क़ज़ा (क़ज़ा नमाज़) · nafile नफ़्ल · kerahat मकरूह वक़्त (ज़वाल) · kıble क़िबला ·
 * seri सिलसिला · Namaz Muhafızı नमाज़ मुहाफ़िज़ · hesap yöntemi हिसाब का तरीक़ा · kuşluk
 * चाश्त (इशराक़) · evvâbîn अव्वाबीन · teheccüd तहज्जुद · vitir वित्र · ezan अज़ान · abdest वुज़ू.
 * Yönetim kipi "आप" + -एं/-ें saygı emri ("चुनें", "करें"); cümle sonu danda "।"; rakam Batı (0-9).
 * Nukta ayrık yazılır (ज + ़, NFC); tek kod noktalı क़ (U+0958–095F) kullanılmaz.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'फ़ज्र', gunes: 'सूर्योदय', ogle: 'ज़ुहर', ikindi: 'अस्र', aksam: 'मग़रिब', yatsi: 'इशा' },
  buyuk: { imsak: 'फ़ज्र', gunes: 'सूर्योदय', ogle: 'ज़ुहर', ikindi: 'अस्र', aksam: 'मग़रिब', yatsi: 'इशा' },
  kucuk: { imsak: 'फ़ज्र', gunes: 'सूर्योदय', ogle: 'ज़ुहर', ikindi: 'अस्र', aksam: 'मग़रिब', yatsi: 'इशा' },
  imsakVakti: 'फ़ज्र',
  cuma: 'जुमा',
  cumaKucuk: 'जुमा',
  gunesDogusu: 'सूर्योदय',
  gunesDogusuKucuk: 'सूर्योदय',
  durum: { kilindi: 'पढ़ ली गई', vaktiGeldi: 'वक़्त हो गया', girmedi: 'अभी वक़्त नहीं हुआ', gecti: 'नहीं पढ़ी गई' },
  durumKucuk: { kilindi: 'पढ़ ली गई', vaktiGeldi: 'वक़्त हो गया', girmedi: 'अभी वक़्त नहीं हुआ', gecti: 'नहीं पढ़ी गई' },
  eylem: { kildim: 'नमाज़ पढ़ ली', kilindi: 'पढ़ ली गई' },
  kerahatVakti: 'मकरूह वक़्त',
  isaretle: '"पढ़ ली गई" का निशान लगाएं',
  geriAlEtiketi: '{durum}, वापस लेने के लिए टैप करें',
  geriAlindi: 'निशान हटा दिया गया',
};
