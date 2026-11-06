import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Ìkàsẹ̀yìn àkókò ìrun',
    kanalAciklama: 'Ìfitónilétí ìkàsẹ̀yìn kí àkókò ìrun tó parí',
    baslik: '⏱️ Ìrun {ad}',
    govde: 'Àkókò {ad} ti fẹ́rẹ̀ẹ́ parí.',
  },
  canli: {
    vakitGovde: 'Àkókò tó kù kí {ad} tó parí',
    cumaBaslik: '🕌 Ìrun Jum‘ah',
    cumaGovde: 'Àkókò tó kù sí Ṭḥuhr (khuṭbah)',
    nafileGovde: 'Àkókò tó kù kí {ad} tó parí',
  },
  iftar: {
    kanal: 'Ìkàsẹ̀yìn ìsinu',
    kanalAciklama: 'Ìfitónilétí ìkàsẹ̀yìn sí àkókò ìsinu',
    baslik: '🌙 Ìkàsẹ̀yìn ìsinu',
    govde: 'Ẹ má ṣe sinu kí ẹ tó gbọ́ ìpè ìrun.',
    girdiBaslik: '🌙 Àkókò ìsinu ti tó',
    girdiGovde: 'Kí ìsinu yín ní ìbùkún.',
    girdiUzun: 'Kí ìsinu yín ní ìbùkún.\n\n⚠️ Ẹ má ṣe sinu kí ẹ tó gbọ́ ìpè ìrun. Ẹ rántí wa nínú àdúà yín :)',
  },
  sahur: {
    kanal: 'Ìkàsẹ̀yìn sààrì',
    kanalAciklama: 'Ìfitónilétí ìkàsẹ̀yìn sí ìparí sààrì (Subh)',
    baslik: '🌙 Ìkàsẹ̀yìn sààrì',
    govde: 'Ẹ ṣì lè jẹ, kí ẹ sì mu; ààwẹ̀ yóò bẹ̀rẹ̀ láìpẹ́.',
    girdiBaslik: '🌙 Àkókò sààrì ti parí',
    girdiGovde: 'Àkókò àníyàn ààwẹ̀ ti tó.',
    girdiUzun: 'Àkókò Subh ti wọlé; ẹ má gbàgbé láti ní àníyàn ààwẹ̀.\n\n⚠️ Ẹ lè kí ìrun Subh báyìí. Ẹ rántí wa nínú àdúà yín :)',
  },
  seri: {
    kanal: 'Ìkàsẹ̀yìn ìtẹ̀léra',
    kanalAciklama: 'Ìkàsẹ̀yìn sí ìparí ọjọ́ ìtẹ̀léra',
    baslik: '🔥 Ìtẹ̀léra yín wà nínú ewu',
    govde: 'Àwọn ìrun òní kò tíì pé; ẹ má ṣe pàdánù ìtẹ̀léra yín.',
    girdiBaslik: '🔥 Ọjọ́ ìtẹ̀léra ti parí',
    girdiGovde: 'Ọjọ́ tuntun ti bẹ̀rẹ̀.',
  },
};
