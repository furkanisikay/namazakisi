import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Malayalamcada sayıdan sonraki ad çoğul çekimi almaz ("5 മിനിറ്റ്"); sayı–birim arası boşluklu. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'മ', dk: 'മി', sn: 'സെ' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} മണിക്കൂർ', other: '{n} മണിക്കൂർ' }),
  dakika: cogul({ one: '{n} മിനിറ്റ്', other: '{n} മിനിറ്റ്' }),
  saniye: cogul({ one: '{n} സെക്കൻഡ്', other: '{n} സെക്കൻഡ്' }),
};
