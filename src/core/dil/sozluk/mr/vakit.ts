import type { Sozluk } from '../tr';

/**
 * Marathi vakit adları (QuranEnc `marathi_ansari` 24:58, 17:78; mr.wikipedia "नमाज"): फज्र ·
 * सूर्योदय · जोहर · असर · मगरिब · इशा; cuma जुमा. Nukta YOK (QE ve AOSP mr nuktasız yazar:
 * फज्र, जोहर, कजा). HadeethEnc mr makine çevirisi izli (झुहर, अस्र); yalnız sayımla destek.
 * Devanagari'de büyük/küçük harf yoktur: `buyuk` ve `kucuk` `adlar` ile aynıdır. Çizelge satırı
 * (`imsakVakti`) fecir adıdır, "Imsak" değil.
 * Terimler: Kıldım = "नमाज पढली" (HE 10945; geçişli geçmiş dişil नमाज'a uyar, konuşandan
 * bağımsız) · Kılındı = "अदा झाली" (türetildi; HE "नमाज अदा करणे") · kaza कजा (कजा नमाज;
 * HE 2 kez, doğrulanmadı) · nafile नफल (QE) · kerahat मकरूह वेळ (vakit kalıbı türetildi) ·
 * kıble किब्ला · cami मशीद (yerli Marathi; QE मस्जिद) · ezan अजान · abdest वुजू · kuşluk चाश्त ·
 * evvâbîn अव्वाबीन · teheccüd तहज्जुद · vitir वितर · seri मालिका · Namaz Muhafızı नमाज रक्षक ·
 * hesap yöntemi गणना पद्धत · Allah अल्लाह · Kur'an कुरआन · ayet आयत · sure सूरह · meal भाषांतर.
 * Yönetim kipi "तुम्ही" + ‑आ emri ("निवडा", "पुन्हा प्रयत्न करा"; AOSP mr normu); "आपण" YOK
 * ("biz" anlamına kayar). İbadete çağrı aynı kipin kısa emri ("नमाज कायम करा" 2:43, "नमाज अदा
 * करा", "नमाजसाठी उभे राहा"). Kullanıcı ağzından geçişsiz geçmiş zaman (cinsiyetli: गेलो/गेले)
 * yazılmaz. Arayüz sözcükleri AOSP mr: सूचना, स्थान, परवानगी, सेटिंग्ज, बॅटरी, ॲप. Cümle sonu
 * nokta "." (AOSP mr danda kullanmaz); rakam sözlükte Batı (0-9), çizimde Devanagari (`deva`).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'फज्र', gunes: 'सूर्योदय', ogle: 'जोहर', ikindi: 'असर', aksam: 'मगरिब', yatsi: 'इशा' },
  buyuk: { imsak: 'फज्र', gunes: 'सूर्योदय', ogle: 'जोहर', ikindi: 'असर', aksam: 'मगरिब', yatsi: 'इशा' },
  kucuk: { imsak: 'फज्र', gunes: 'सूर्योदय', ogle: 'जोहर', ikindi: 'असर', aksam: 'मगरिब', yatsi: 'इशा' },
  imsakVakti: 'फज्र',
  cuma: 'जुमा',
  cumaKucuk: 'जुमा',
  gunesDogusu: 'सूर्योदय',
  gunesDogusuKucuk: 'सूर्योदय',
  durum: { kilindi: 'अदा झाली', vaktiGeldi: 'वेळ झाली', girmedi: 'अजून वेळ झाली नाही', gecti: 'अदा झाली नाही' },
  durumKucuk: { kilindi: 'अदा झाली', vaktiGeldi: 'वेळ झाली', girmedi: 'अजून वेळ झाली नाही', gecti: 'अदा झाली नाही' },
  eylem: { kildim: 'नमाज पढली', kilindi: 'अदा झाली' },
  kerahatVakti: 'मकरूह वेळ',
  isaretle: '"अदा झाली" म्हणून नोंदवा',
  geriAlEtiketi: '{durum}, पूर्ववत करण्यासाठी टॅप करा',
  geriAlindi: 'खूण काढली',
};
