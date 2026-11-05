import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Kubara igihe gisigaye cy’iswala',
    kanalAciklama: 'Imenyesha ryo kubara igihe gisigaye mbere y’uko igihe cy’iswala kirangira',
    baslik: '⏱️ Iswala ya {ad}',
    govde: 'Igihe cya {ad} kigiye kurangira.',
  },
  canli: {
    vakitGovde: 'Igihe gisigaye ngo {ad} irangire',
    cumaBaslik: '🕌 Iswala ya Ijuma',
    cumaGovde: 'Igihe gisigaye kugeza Adhuhuri (inyigisho)',
    nafileGovde: 'Igihe gisigaye ngo {ad} irangire',
  },
  iftar: {
    kanal: 'Igihe gisigaye cyo gusiburuka',
    kanalAciklama: 'Imenyesha ryo kubara igihe gisigaye kugeza gusiburuka',
    baslik: '🌙 Igihe gisigaye cyo gusiburuka',
    govde: 'Ntimusiburuke mutarumva Adhana.',
    girdiBaslik: '🌙 Igihe cyo gusiburuka',
    girdiGovde: 'Allah abahe gusiburuka kuzuye imigisha.',
    girdiUzun: 'Allah abahe gusiburuka kuzuye imigisha.\n\n⚠️ Ntimusiburuke mutarumva Adhana. Mutwibuke mu masengesho yanyu.',
  },
  sahur: {
    kanal: 'Igihe gisigaye cya daku',
    kanalAciklama: 'Imenyesha ryo kubara igihe gisigaye kugeza daku irangiye (Fajri)',
    baslik: '🌙 Igihe gisigaye cya daku',
    govde: 'Muracyashobora kurya no kunywa; igisibo gitangira vuba.',
    girdiBaslik: '🌙 Igihe cya daku cyarangiye',
    girdiGovde: 'Ni igihe cyo gukora umugambi (niya).',
    girdiUzun: 'Igihe cya Fajri cyatangiye; ntimwibagirwe gukora umugambi (niya).\n\n⚠️ Ubu mushobora gusali Fajri. Mutwibuke mu masengesho yanyu.',
  },
  seri: {
    kanal: 'Igihe gisigaye cy’uruhererekane',
    kanalAciklama: 'Kubara igihe gisigaye kugeza umunsi w’uruhererekane urangiye',
    baslik: '🔥 Uruhererekane rwanyu ruri mu kaga',
    govde: 'Iswala z’uyu munsi ntiziruzura; ntutakaze uruhererekane rwawe.',
    girdiBaslik: '🔥 Umunsi w’uruhererekane warangiye',
    girdiGovde: 'Umunsi mushya watangiye.',
  },
};
