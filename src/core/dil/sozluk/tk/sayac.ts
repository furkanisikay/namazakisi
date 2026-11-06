import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Wagt sanawy',
    kanalAciklama: 'Namaz wagty çykmazdan öň yza sanaýan habarnama',
    baslik: '⏱️ {ad} namazy',
    govde: '{ad} wagty çykmakçy.',
  },
  canli: {
    vakitGovde: '{ad} wagtynyň çykmagyna galan wagt',
    cumaBaslik: '🕌 Juma namazy',
    cumaGovde: 'Öýle wagtyna (hutba) galan wagt',
    nafileGovde: '{ad} wagtynyň gutarmagyna galan wagt',
  },
  iftar: {
    kanal: 'Agzyaçar sanawy',
    kanalAciklama: 'Agzyaçar wagtyna yza sanaýan habarnama',
    baslik: '🌙 Agzyaçara yza sanaw',
    govde: 'Azany eşitmän agzyňyzy açmaň.',
    girdiBaslik: '🌙 Agzyaçar wagty',
    girdiGovde: 'Agzyaçaryňyz haýyrly bolsun.',
    girdiUzun: 'Agzyaçaryňyz haýyrly bolsun.\n\n⚠️ Azany eşitmän agzyňyzy açmaň. Dogaňyzda bizi hem ýatlaň :)',
  },
  sahur: {
    kanal: 'Selällik sanawy',
    kanalAciklama: 'Selälligiň gutarýan wagtyna (ertir) yza sanaýan habarnama',
    baslik: '🌙 Selällige yza sanaw',
    govde: 'Entek iýip-içip bilersiňiz; agyz bekleme wagty ýakynlaşýar.',
    girdiBaslik: '🌙 Selällik wagty gutardy',
    girdiGovde: 'Niýet etmegiň wagty geldi.',
    girdiUzun: 'Ertir wagty girdi; niýet etmegi unutmaň.\n\n⚠️ Indi ertir namazyny okap bilersiňiz. Dogaňyzda bizi hem ýatlaň :)',
  },
  seri: {
    kanal: 'Yzygiderlik sanawy',
    kanalAciklama: 'Yzygiderlik gününiň gutarmagyna yza sanaw',
    baslik: '🔥 Yzygiderligiň howp astynda',
    govde: 'Şu günki namazlaryň doly däl, yzygiderligiňi ýitirme.',
    girdiBaslik: '🔥 Yzygiderlik güni gutardy',
    girdiGovde: 'Täze gün başlandy.',
  },
};
