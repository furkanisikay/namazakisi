import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Numërimi i vaktit',
    kanalAciklama: 'Njoftim me numërim mbrapsht para se të dalë koha e namazit',
    baslik: '⏱️ {ad}',
    govde: 'Koha po del: {ad}.',
  },
  canli: {
    vakitGovde: 'Koha e mbetur derisa të dalë: {ad}',
    cumaBaslik: '🕌 Namazi i xhumasë',
    cumaGovde: 'Koha e mbetur deri te dreka (hutbeja)',
    nafileGovde: 'Koha e mbetur derisa të mbarojë: {ad}',
  },
  iftar: {
    kanal: 'Numërimi i iftarit',
    kanalAciklama: 'Njoftim me numërim mbrapsht deri në kohën e iftarit',
    baslik: '🌙 Numërimi i iftarit',
    govde: 'Mos e prishni agjërimin para se të dëgjoni ezanin.',
    girdiBaslik: '🌙 Koha e iftarit',
    girdiGovde: 'Iftar të bekuar.',
    girdiUzun: 'Iftar të bekuar.\n\n⚠️ Mos e prishni agjërimin para se të dëgjoni ezanin. Na kujtoni edhe ne në lutjet tuaja :)',
  },
  sahur: {
    kanal: 'Numërimi i syfyrit',
    kanalAciklama: 'Njoftim me numërim mbrapsht deri në fund të syfyrit (sabahu)',
    baslik: '🌙 Numërimi i syfyrit',
    govde: 'Mund të hani e të pini ende; agjërimi fillon së shpejti.',
    girdiBaslik: '🌙 Koha e syfyrit mbaroi',
    girdiGovde: 'Erdhi koha e nijetit.',
    girdiUzun: 'Hyri koha e sabahut; mos harroni të bëni nijet.\n\n⚠️ Tani mund ta falni sabahun. Na kujtoni edhe ne në lutjet tuaja :)',
  },
  seri: {
    kanal: 'Numërimi i serisë',
    kanalAciklama: 'Numërim mbrapsht deri në fund të ditës së serisë',
    baslik: '🔥 Seria juaj në rrezik',
    govde: 'Namazet e sotme janë të paplota; mos e humbni serinë.',
    girdiBaslik: '🔥 Dita e serisë mbaroi',
    girdiGovde: 'Filloi një ditë e re.',
  },
};
