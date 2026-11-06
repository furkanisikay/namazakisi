import type { Sozluk } from '../tr';

/**
 * Malayalam konuşan (Kerala) Müslümanların namaz sonrası ve selam için kullandığı kalıplar
 * (çeviri değil). Kabul duası "അല്ലാഹു സ്വീകരിക്കട്ടെ" (kök സ്വീകരിക്കുക, QuranEnc 2:127;
 * kalıp türetildi), halk ağzındaki "ഖബൂൽ ചെയ്യട്ടെ" ve Arapça "തഖബ്ബലല്ലാഹ്" varyantları;
 * yerli okuyucuyla DOĞRULANMADI. Bayram "ഈദ് മുബാറക്", cuma "ജുമുഅ മുബാറക്", Ramazan
 * "റമദാൻ മുബാറക്" Kerala'da yerleşik. Övgü ve "!" yok. Kandil selamı yalnız ülke listesindeki
 * gecelerde söylenir (`selam.ts > KANDIL_ULKELERI`); buradaki karşılıklar tip bütünlüğü içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'ബറകത്തുണ്ടാകട്ടെ.',
  kabulDualari: ['അല്ലാഹു സ്വീകരിക്കട്ടെ', 'അല്ലാഹു ഖബൂൽ ചെയ്യട്ടെ', 'അല്ലാഹു സ്വീകരിക്കട്ടെ', 'തഖബ്ബലല്ലാഹ്'],
  kabulDuasi: 'അല്ലാഹു സ്വീകരിക്കട്ടെ',
  ekSabah: 'ബറകത്തുള്ള പ്രഭാതം',
  ekYatsi: 'ബറകത്തുള്ള രാത്രി',
  tamGunAna: 'അല്ലാഹു സ്വീകരിക്കട്ടെ',
  tamGunAlt: 'ഇന്ന് നിങ്ങൾ അഞ്ച് നമസ്കാരങ്ങളും പൂർത്തിയാക്കി.',
  kazaKabul: 'നിങ്ങളുടെ രേഖയിൽ നിന്ന് ഒരു {vakit} ഖളാഅ് കുറച്ചു. {dua}.',
  kandilGeceleri: {
    regaib: 'റഗാഇബ് രാവ് ബറകത്തുള്ളതാകട്ടെ',
    mirac: 'മിഅ്റാജ് രാവ് ബറകത്തുള്ളതാകട്ടെ',
    berat: 'ബറാഅത്ത് രാവ് ബറകത്തുള്ളതാകട്ടെ',
    mevlid: 'നബിദിനം ബറകത്തുള്ളതാകട്ടെ',
  },
  selamlar: {
    sahur: 'ബറകത്തുള്ള അത്താഴം',
    bayram: 'ഈദ് മുബാറക്',
    iftar: 'ബറകത്തുള്ള നോമ്പുതുറ',
    kadir: 'ലൈലത്തുൽ ഖദ്ർ ബറകത്തുള്ളതാകട്ടെ',
    arefe: 'അറഫാ ദിനം ബറകത്തുള്ളതാകട്ടെ',
    hicriYilbasi: 'ഹിജ്റ പുതുവർഷം ബറകത്തുള്ളതാകട്ടെ',
    cuma: 'ജുമുഅ മുബാറക്',
    ramazan: 'റമദാൻ മുബാറക്',
    sabah: 'ബറകത്തുള്ള പ്രഭാതം',
  },
};
