// Nepalce (Devanagari) büyük/küçük harf yok (`buyuk` = `adlar`). Rakam çizimde Devanagari (`deva`, CLDR `ne` varsayılanı), sözlükte Batı rakamı.
import type { Sozluk } from '../tr';

/**
 * Nepalce vakit adları (QuranEnc `nepali_central` 17:78 ve HadeethEnc ne yazımı, nuktasız):
 * फज्र · सूर्योदय · जुहर · अस्र · मगरिब · इशा; cuma जुमा. Çizelge satırı (`imsakVakti`) fecir adıdır.
 * Terimler: Kıldım = "नमाज पढें" (HE 10945, 1. tekil geçmiş cinsiyetsiz) · Kılındı = "पढियो" (türetildi) ·
 * kaza कजा · nafile नफिल · kerahat मकरुह समय · kıble किब्ला · seri निरन्तरता · Namaz Muhafızı नमाज रक्षक ·
 * hesap yöntemi गणना विधि · kuşluk चाश्त · evvâbîn अव्वाबीन · teheccüd तहज्जुद · vitir वित्र · ezan अजान · abdest वुजू.
 * Hitap "तपाईं" + ‑नुहोस् emri (Microsoft ne, AOSP ne); cümle sonu danda "।".
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'फज्र', gunes: 'सूर्योदय', ogle: 'जुहर', ikindi: 'अस्र', aksam: 'मगरिब', yatsi: 'इशा' },
  buyuk: { imsak: 'फज्र', gunes: 'सूर्योदय', ogle: 'जुहर', ikindi: 'अस्र', aksam: 'मगरिब', yatsi: 'इशा' },
  kucuk: { imsak: 'फज्र', gunes: 'सूर्योदय', ogle: 'जुहर', ikindi: 'अस्र', aksam: 'मगरिब', yatsi: 'इशा' },
  imsakVakti: 'फज्र',
  cuma: 'जुमा',
  cumaKucuk: 'जुमा',
  gunesDogusu: 'सूर्योदय',
  gunesDogusuKucuk: 'सूर्योदय',
  durum: { kilindi: 'पढियो', vaktiGeldi: 'समय भयो', girmedi: 'अझै समय भएको छैन', gecti: 'पढिएन' },
  durumKucuk: { kilindi: 'पढियो', vaktiGeldi: 'समय भयो', girmedi: 'अझै समय भएको छैन', gecti: 'पढिएन' },
  eylem: { kildim: 'नमाज पढें', kilindi: 'पढियो' },
  kerahatVakti: 'मकरुह समय',
  isaretle: '"पढियो" चिन्ह लगाउनुहोस्',
  geriAlEtiketi: '{durum}, अन्डू गर्न ट्याप गर्नुहोस्',
  geriAlindi: 'चिन्ह हटाइयो',
};
