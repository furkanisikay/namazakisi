import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Numărătoare inversă',
    kanalAciklama: 'Notificare cu numărătoare inversă înainte de sfârșitul timpului unei rugăciuni',
    baslik: '⏱️ Rugăciunea {ad}',
    govde: 'Timpul pentru {ad} este pe sfârșite.',
  },
  canli: {
    vakitGovde: 'Timp rămas din {ad}',
    cumaBaslik: '🕌 Rugăciunea de vineri',
    cumaGovde: 'Timp rămas până la Dhuhr (predica)',
    nafileGovde: 'Timp rămas din {ad}',
  },
  iftar: {
    kanal: 'Numărătoare până la iftar',
    kanalAciklama: 'Notificare cu numărătoare inversă până la ora iftarului',
    baslik: '🌙 Numărătoare până la iftar',
    govde: 'Nu întrerupeți postul înainte să auziți adhanul.',
    girdiBaslik: '🌙 Este ora iftarului',
    girdiGovde: 'Iftar binecuvântat.',
    girdiUzun: 'Iftar binecuvântat.\n\n⚠️ Nu întrerupeți postul înainte să auziți adhanul. Pomeniți-ne în rugăciuni :)',
  },
  sahur: {
    kanal: 'Numărătoare până la suhur',
    kanalAciklama: 'Notificare cu numărătoare inversă până la sfârșitul suhurului (Fajr)',
    baslik: '🌙 Numărătoare până la suhur',
    govde: 'Încă puteți mânca și bea; postul începe în curând.',
    girdiBaslik: '🌙 Timpul suhurului s-a încheiat',
    girdiGovde: 'Este momentul să vă faceți intenția.',
    girdiUzun: 'A început timpul de Fajr; nu uitați să vă faceți intenția.\n\n⚠️ Acum puteți efectua rugăciunea Fajr. Pomeniți-ne în rugăciuni :)',
  },
  seri: {
    kanal: 'Numărătoare pentru serie',
    kanalAciklama: 'Numărătoare inversă până la sfârșitul zilei seriei',
    baslik: '🔥 Seria este în pericol',
    govde: 'Rugăciunile de azi nu sunt complete; nu pierdeți seria.',
    girdiBaslik: '🔥 Ziua seriei s-a încheiat',
    girdiGovde: 'A început o nouă zi.',
  },
};
