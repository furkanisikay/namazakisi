import type { Sozluk } from '../tr';

/**
 * Malayalamca vakit adları (Kerala Müslümanlarının yerleşik Arapça kökenli adları; ml Vikipedi
 * "സ്വലാ" maddesi ve QuranEnc `malayalam_kunhi` meali): സുബ്‌ഹ് · സൂര്യോദയം · ളുഹർ · അസ്ർ ·
 * മഗ്‌രിബ് · ഇശാ; cuma ജുമുഅ. Malayalam yazısında büyük/küçük yoktur: `buyuk` ve `kucuk`
 * `adlar` ile aynıdır. Çizelge satırı (`imsakVakti`) fecir adıdır (സുബ്‌ഹ്), "Imsak" değil.
 * Namaz നമസ്കാരം (meal ve Microsoft örnekleriyle tutarlı; നിസ്കാരം kullanan topluluk için
 * yerli okuyucuya sorulacak), namaz kılmak നമസ്കരിക്കുക.
 * Terimler: Kıldım = "ഞാൻ നമസ്കരിച്ചു" (kişinin beyanı; fiil şahıs çekimsizdir, zamir açık) ·
 * Kılındı = "നമസ്കരിച്ചു" · kaza ഖളാഅ് (ഖളാഅ് നമസ്കാരം; DOĞRULANMADI) · nafile സുന്നത്ത്
 * നമസ്കാരം · kerahat കറാഹത്ത് സമയം · kıble ഖിബ്‌ല · seri തുടർച്ച · Namaz Muhafızı നമസ്കാര
 * കാവൽ · hesap yöntemi കണക്കുകൂട്ടൽ രീതി · kuşluk ളുഹാ · evvâbîn അവ്വാബീൻ · teheccüd
 * തഹജ്ജുദ് · vitir വിത്ർ · ezan ബാങ്ക് · abdest വുദു · cami പള്ളി · Allah kabul etsin
 * "അല്ലാഹു സ്വീകരിക്കട്ടെ" (türetildi).
 * Hitap: നിങ്ങൾ yalnız gerektiğinde, emir ‑ുക (Microsoft); ദയവായി, താങ്കൾ, അങ്ങ് YOK.
 * İbadete çağrı: kısa ‑ുക emri, mealdeki നീ taşınmaz ("നമസ്കാരം മുറപ്രകാരം നിർവഹിക്കുക").
 * İmla: atomik chillu (ൺ ൻ ർ ൽ ൾ ൿ) + NFC; ZWJ'li eski chillu YOK; ZWNJ anlamlı (ഖിബ്‌ല,
 * മഗ്‌രിബ്, സുബ്‌ഹ്). Rakam Batı (0-9).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'സുബ്‌ഹ്', gunes: 'സൂര്യോദയം', ogle: 'ളുഹർ', ikindi: 'അസ്ർ', aksam: 'മഗ്‌രിബ്', yatsi: 'ഇശാ' },
  buyuk: { imsak: 'സുബ്‌ഹ്', gunes: 'സൂര്യോദയം', ogle: 'ളുഹർ', ikindi: 'അസ്ർ', aksam: 'മഗ്‌രിബ്', yatsi: 'ഇശാ' },
  kucuk: { imsak: 'സുബ്‌ഹ്', gunes: 'സൂര്യോദയം', ogle: 'ളുഹർ', ikindi: 'അസ്ർ', aksam: 'മഗ്‌രിബ്', yatsi: 'ഇശാ' },
  imsakVakti: 'സുബ്‌ഹ്',
  cuma: 'ജുമുഅ',
  cumaKucuk: 'ജുമുഅ',
  gunesDogusu: 'സൂര്യോദയം',
  gunesDogusuKucuk: 'സൂര്യോദയം',
  durum: { kilindi: 'നമസ്കരിച്ചു', vaktiGeldi: 'സമയമായി', girmedi: 'സമയമായിട്ടില്ല', gecti: 'നമസ്കരിച്ചില്ല' },
  durumKucuk: { kilindi: 'നമസ്കരിച്ചു', vaktiGeldi: 'സമയമായി', girmedi: 'സമയമായിട്ടില്ല', gecti: 'നമസ്കരിച്ചില്ല' },
  eylem: { kildim: 'ഞാൻ നമസ്കരിച്ചു', kilindi: 'നമസ്കരിച്ചു' },
  kerahatVakti: 'കറാഹത്ത് സമയം',
  isaretle: 'നമസ്കരിച്ചതായി അടയാളപ്പെടുത്തുക',
  geriAlEtiketi: '{durum}, പഴയപടിയാക്കാൻ ടാപ്പ് ചെയ്യുക',
  geriAlindi: 'അടയാളം നീക്കി',
};
