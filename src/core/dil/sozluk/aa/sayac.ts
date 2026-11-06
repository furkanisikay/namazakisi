import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Salat loowiyya',
    kanalAciklama: 'Salat wakti gexam dumak loowiyya warsa',
    baslik: '⏱️ {ad} salat',
    govde: '{ad} wakti gexam yaybulle.',
  },
  canli: {
    vakitGovde: '{ad} gexam fanah raqte wakti',
    cumaBaslik: '🕌 Jumqatta salat',
    cumaGovde: 'Dohori (xutba) fanah raqte wakti',
    nafileGovde: '{ad} gexam fanah raqte wakti',
  },
  iftar: {
    kanal: 'Iftaar loowiyya',
    kanalAciklama: 'Iftaar wakti fanah loowiyya warsa',
    baslik: '🌙 Iftaar loowiyya',
    govde: 'Adan maabbinnaay soom ma fakina.',
    girdiBaslik: '🌙 Iftaar wakti',
    girdiGovde: 'Barakat le iftaar.',
    girdiUzun: 'Barakat le iftaar.\n\n⚠️ Adan maabbinnaay soom ma fakina. Sinni duqaal nee kassita :)',
  },
  sahur: {
    kanal: 'Sahuur loowiyya',
    kanalAciklama: 'Sahuur gexam (Subci) fanah loowiyya warsa',
    baslik: '🌙 Sahuur loowiyya',
    govde: 'Hanna akmaanaah yaaqubaanam duddan; soom xayi.',
    girdiBaslik: '🌙 Sahuur wakti gexe',
    girdiGovde: 'Niya haanam wakti.',
    girdiUzun: 'Subci wakti cule; niya haanam ma hawwena.\n\n⚠️ Asaaku Subci salat abaanam duddan. Sinni duqaal nee kassita :)',
  },
  seri: {
    kanal: 'Gexso loowiyya',
    kanalAciklama: 'Gexsoh ayro gexam fanah loowiyya',
    baslik: '🔥 Sinni gexso bayam yaybulle',
    govde: 'Asaakuh salat hanna ma duudumin; sinni gexso ma bayisina.',
    girdiBaslik: '🔥 Gexsoh ayro gexe',
    girdiGovde: 'Qusba ayro qimbise.',
  },
};
