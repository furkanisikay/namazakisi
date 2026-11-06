import type { Sozluk } from '../tr';

/** Ay ve gün adları CLDR `ln`'den (tonlu); tarih içinde küçük, tek başına (takvim başlığı) büyük harfle başlar. */
export const tarih: Sozluk['tarih'] = {
  gunler: ['Eyenga', 'Mokɔlɔ mwa yambo', 'Mokɔlɔ mwa míbalé', 'Mokɔlɔ mwa mísáto', 'Mokɔlɔ ya mínéi', 'Mokɔlɔ ya mítáno', 'Mpɔ́sɔ'],
  gunlerKisa: ['Eye', 'Ybo', 'Mbl', 'Mst', 'Min', 'Mtn', 'Mps'],
  aylar: [
    'sánzá ya yambo',
    'sánzá ya míbalé',
    'sánzá ya mísáto',
    'sánzá ya mínei',
    'sánzá ya mítáno',
    'sánzá ya motóbá',
    'sánzá ya nsambo',
    'sánzá ya mwambe',
    'sánzá ya libwa',
    'sánzá ya zómi',
    'sánzá ya zómi na mɔ̌kɔ́',
    'sánzá ya zómi na míbalé',
  ],
  aylarYalin: [
    'Sánzá ya yambo',
    'Sánzá ya míbalé',
    'Sánzá ya mísáto',
    'Sánzá ya mínei',
    'Sánzá ya mítáno',
    'Sánzá ya motóbá',
    'Sánzá ya nsambo',
    'Sánzá ya mwambe',
    'Sánzá ya libwa',
    'Sánzá ya zómi',
    'Sánzá ya zómi na mɔ̌kɔ́',
    'Sánzá ya zómi na míbalé',
  ],
  aylarKisa: ['yan', 'fbl', 'msi', 'apl', 'mai', 'yun', 'yul', 'agt', 'stb', 'ɔtb', 'nvb', 'dsb'],
  haftaHarfleri: ['Yb', 'Mb', 'Ms', 'Mn', 'Mt', 'Mp', 'Ey'],
  uzun: '{gun} {ay} {yil}',
  gunAdiYil: '{gunAdi}, {yil}',
};
