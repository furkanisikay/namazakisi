import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Jiŋli saha kalibu',
    kanalAciklama: 'Saha kalibu lahabali pɔi ka jiŋli saha naai',
    baslik: '⏱️ {ad} jiŋli',
    govde: '{ad} saha ni naai pumpɔŋɔ.',
  },
  canli: {
    vakitGovde: 'Saha din kpalim pɔi ka {ad} naai',
    cumaBaslik: '🕌 Alizumma jiŋli',
    cumaGovde: 'Saha din kpalim pɔi ka Azafari (hutuba) paai',
    nafileGovde: 'Saha din kpalim pɔi ka {ad} naai',
  },
  iftar: {
    kanal: 'Iftar saha kalibu',
    kanalAciklama: 'Saha kalibu lahabali hali ni iftar saha',
    baslik: '🌙 Iftar saha kalibu',
    govde: 'Di yooi ya yi nolɔri pɔi ka yi wum jiŋli molibu.',
    girdiBaslik: '🌙 Iftar saha paaya',
    girdiGovde: 'Iftar alibarika.',
    girdiUzun: 'Iftar alibarika.\n\n⚠️ Di yooi ya yi nolɔri pɔi ka yi wum jiŋli molibu. Teemi ya ti yi addua ni :)',
  },
  sahur: {
    kanal: 'Saɣila saha kalibu',
    kanalAciklama: 'Saha kalibu lahabali hali ni Saɣila naabu (Subaahi)',
    baslik: '🌙 Saɣila saha kalibu',
    govde: 'Yi na ni tooi di ka nyu; nolɔri ni piligi pumpɔŋɔ.',
    girdiBaslik: '🌙 Saɣila saha naaya',
    girdiGovde: 'Saha paaya ni yi niŋ niya.',
    girdiUzun: 'Subaahi saha paaya; di tam ya ni yi niŋ niya.\n\n⚠️ Yi ni tooi puhi Subaahi pumpɔŋɔ. Teemi ya ti yi addua ni :)',
  },
  seri: {
    kanal: 'Dolibu saha kalibu',
    kanalAciklama: 'Saha kalibu hali ni dolibu dabsili naabu',
    baslik: '🔥 Yi dolibu be zaɣ’ biɛɣu ni',
    govde: 'Zuŋɔ jiŋa na bi naai; di chɛ ya ka yi dolibu kpi.',
    girdiBaslik: '🔥 Dolibu dabsili naaya',
    girdiGovde: 'Dabsili palli piligiya.',
  },
};
