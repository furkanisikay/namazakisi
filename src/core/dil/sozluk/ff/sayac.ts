import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Saa’i heddiiɗo juulde',
    kanalAciklama: 'Tintinal saa’i heddiiɗo adii waqutu juulde gasde',
    baslik: '⏱️ Juulde {ad}',
    govde: 'Waqutu {ad} ɓadike gasde.',
  },
  canli: {
    vakitGovde: 'Saa’i heddiiɗo haa {ad} gasa',
    cumaBaslik: '🕌 Juulde Juma',
    cumaGovde: 'Saa’i heddiiɗo haa fanaa (hutba)',
    nafileGovde: 'Saa’i heddiiɗo haa {ad} gasa',
  },
  iftar: {
    kanal: 'Saa’i heddiiɗo huntaari',
    kanalAciklama: 'Tintinal saa’i heddiiɗo haa waqutu huntaari',
    baslik: '🌙 Saa’i heddiiɗo huntaari',
    govde: 'Wota on hunta adii nanude ewnaango.',
    girdiBaslik: '🌙 Waqutu huntaari heewii',
    girdiGovde: 'Yo Alla barkin huntaari mon.',
    girdiUzun: 'Yo Alla barkin huntaari mon.\n\n⚠️ Wota on hunta adii nanude ewnaango. Siftoree en e du’aaji mon :)',
  },
  sahur: {
    kanal: 'Saa’i heddiiɗo suhuur',
    kanalAciklama: 'Tintinal saa’i heddiiɗo haa suhuur gasa (subaka)',
    baslik: '🌙 Saa’i heddiiɗo suhuur',
    govde: 'Hiɗon mbaawi ñaamde e yarde haa jooni; koorka fuɗɗoto ɗoo e seeɗa.',
    girdiBaslik: '🌙 Waqutu suhuur gasii',
    girdiGovde: 'Ko waqutu anniyee.',
    girdiUzun: 'Waqutu subaka heewii; wota on yejjit anniyee.\n\n⚠️ Jooni hiɗon mbaawi juulude subaka. Siftoree en e du’aaji mon :)',
  },
  seri: {
    kanal: 'Saa’i heddiiɗo jokkondiral',
    kanalAciklama: 'Saa’i heddiiɗo haa ñalawma jokkondiral gasa',
    baslik: '🔥 Jokkondiral mon hino ɓadii taƴeede',
    govde: 'Juulɗe hannde timmaali; wota on majjin jokkondiral mon.',
    girdiBaslik: '🔥 Ñalawma jokkondiral gasii',
    girdiGovde: 'Ñalawma hesɗo fuɗɗii.',
  },
};
