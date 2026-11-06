import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Kotanga ntango ya losambo',
    kanalAciklama: 'Liyebisi ya kotanga ntango liboso ntango ya losambo esila',
    baslik: '⏱️ Losambo ya {ad}',
    govde: 'Ntango ya {ad} ekosila noki.',
  },
  canli: {
    vakitGovde: 'Ntango etikali tii {ad} esila',
    cumaBaslik: "🕌 Losambo ya Jumu'a",
    cumaGovde: 'Ntango etikali tii Dhuhr (khutba)',
    nafileGovde: 'Ntango etikali tii {ad} esila',
  },
  iftar: {
    kanal: 'Kotanga ntango ya iftar',
    kanalAciklama: 'Liyebisi ya kotanga ntango tii iftar',
    baslik: '🌙 Kotanga ntango ya iftar',
    govde: 'Bofungola ngizi te liboso ya koyoka adhan.',
    girdiBaslik: '🌙 Ntango ya iftar ekoki',
    girdiGovde: 'Iftar ya lipamboli.',
    girdiUzun: 'Iftar ya lipamboli.\n\n⚠️ Bofungola ngizi te liboso ya koyoka adhan. Bokanisa biso na mabondeli na bino :)',
  },
  sahur: {
    kanal: 'Kotanga ntango ya suhur',
    kanalAciklama: 'Liyebisi ya kotanga ntango tii suka ya suhur (Fajr)',
    baslik: '🌙 Kotanga ntango ya suhur',
    govde: 'Bokoki naino kolia mpe komɛla; ngizi ekobanda noki.',
    girdiBaslik: '🌙 Ntango ya suhur esili',
    girdiGovde: 'Ntango ya kozwa mokano (niyya) ekoki.',
    girdiUzun: 'Ntango ya Fajr ebandi; bobosana te kozwa mokano (niyya).\n\n⚠️ Sikoyo bokoki kosambela Fajr. Bokanisa biso na mabondeli na bino :)',
  },
  seri: {
    kanal: 'Kotanga ntango ya mokoba',
    kanalAciklama: 'Kotanga ntango tii suka ya mokɔlɔ ya mokoba',
    baslik: '🔥 Mokoba na bino ezali na likama',
    govde: 'Losambo ya lɛlɔ esili naino te; bobungisa mokoba na bino te.',
    girdiBaslik: '🔥 Mokɔlɔ ya mokoba esili',
    girdiGovde: 'Mokɔlɔ ya sika ebandi.',
  },
};
