import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Jimartina nimêjê',
    kanalAciklama: 'Agahdariya jimartinê berî ku dema nimêjê biqede',
    baslik: '⏱️ Nimêja {ad}',
    govde: 'Dema {ad} li ber qedandinê ye.',
  },
  canli: {
    vakitGovde: 'Dema mayî heta dawiya {ad}',
    cumaBaslik: '🕌 Nimêja înê',
    cumaGovde: 'Dema mayî heta Nîvro (xutbe)',
    nafileGovde: 'Dema mayî heta dawiya {ad}',
  },
  iftar: {
    kanal: 'Jimartina fitarê',
    kanalAciklama: 'Agahdariya jimartinê heta dema fitarê',
    baslik: '🌙 Jimartina fitarê',
    govde: 'Heta ku hûn ezanê nebihîzin, rojiya xwe venekin.',
    girdiBaslik: '🌙 Dema fitarê hat',
    girdiGovde: 'Fitara we bi xêr û bereket be.',
    girdiUzun: 'Fitara we bi xêr û bereket be.\n\n⚠️ Heta ku hûn ezanê nebihîzin, rojiya xwe venekin. Me jî di duayên xwe de bîr bînin.',
  },
  sahur: {
    kanal: 'Jimartina paşîvê',
    kanalAciklama: 'Agahdariya jimartinê heta dawiya paşîvê (Sibe)',
    baslik: '🌙 Jimartina paşîvê',
    govde: 'Hûn hîn dikarin bixwin û vexwin; rojî di demeke nêz de dest pê dike.',
    girdiBaslik: '🌙 Dema paşîvê qediya',
    girdiGovde: 'Dema niyeta rojiyê ye.',
    girdiUzun: 'Dema Sibê dest pê kir; niyeta xwe ji bîr nekin.\n\n⚠️ Êdî hûn dikarin nimêja Sibê bikin. Me jî di duayên xwe de bîr bînin.',
  },
  seri: {
    kanal: 'Jimartina zincîrê',
    kanalAciklama: 'Jimartin heta dawiya roja zincîrê',
    baslik: '🔥 Zincîra we di xetereyê de ye',
    govde: 'Nimêjên îro temam nebûne; zincîra xwe winda nekin.',
    girdiBaslik: '🔥 Roja zincîrê qediya',
    girdiGovde: 'Rojeke nû dest pê kir.',
  },
};
