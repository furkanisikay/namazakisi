import type { Sozluk } from '../tr';

/** Ay adları CLDR `ak`; gün adları Ghana imlasıyla ("Efiada", QE 62:9 ve HadeethEnc ak), kısa biçimler CLDR. */
export const tarih: Sozluk['tarih'] = {
  gunler: ['Kwasiada', 'Dwoada', 'Benada', 'Wukuada', 'Yawoada', 'Efiada', 'Memeneda'],
  gunlerKisa: ['Kwe', 'Dwo', 'Ben', 'Wuk', 'Yaw', 'Fia', 'Mem'],
  aylar: ['Ɔpɛpɔn', 'Ɔgyefoɔ', 'Ɔbɛnem', 'Oforisuo', 'Kɔtɔnimma', 'Ayɛwohomumu', 'Kutawonsa', 'Ɔsanaa', 'Ɛbɔ', 'Ahinime', 'Obubuo', 'Ɔpɛnimma'],
  aylarYalin: ['Ɔpɛpɔn', 'Ɔgyefoɔ', 'Ɔbɛnem', 'Oforisuo', 'Kɔtɔnimma', 'Ayɛwohomumu', 'Kutawonsa', 'Ɔsanaa', 'Ɛbɔ', 'Ahinime', 'Obubuo', 'Ɔpɛnimma'],
  aylarKisa: ['Ɔpɛpɔn', 'Ɔgyefoɔ', 'Ɔbɛnem', 'Oforisuo', 'Kɔtɔnimma', 'Ayɛwohomumu', 'Kutawonsa', 'Ɔsanaa', 'Ɛbɔ', 'Ahinime', 'Obubuo', 'Ɔpɛnimma'],
  haftaHarfleri: ['Dw', 'Be', 'Wu', 'Ya', 'Fi', 'Me', 'Kw'],
  uzun: '{ay} {gun}, {yil}',
  gunAdiYil: '{gunAdi}, {yil}',
};
