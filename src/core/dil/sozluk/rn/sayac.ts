import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Igihe gisigaye c’isengesho',
    kanalAciklama: 'Imenyesha ry’igihe gisigaye imbere y’uko igihe c’isengesho kirangira',
    baslik: '⏱️ Isengesho rya {ad}',
    govde: 'Igihe ca {ad} kiregereje kurangira.',
  },
  canli: {
    vakitGovde: 'Igihe gisigaye ngo igihe ca {ad} kirangire',
    cumaBaslik: '🕌 Isengesho rya Ijuma',
    cumaGovde: 'Igihe gisigaye gushika Adhuhuri (khutba)',
    nafileGovde: 'Igihe gisigaye ngo igihe ca {ad} kirangire',
  },
  iftar: {
    kanal: 'Igihe gisigaye c’ifutari',
    kanalAciklama: 'Imenyesha ry’igihe gisigaye gushika igihe c’ifutari',
    baslik: '🌙 Igihe gisigaye c’ifutari',
    govde: 'Ntimufungure imbere yo kwumva adhana.',
    girdiBaslik: '🌙 Igihe c’ifutari cageze',
    girdiGovde: 'Ifutari y’umugisha.',
    girdiUzun: 'Ifutari y’umugisha.\n\n⚠️ Ntimufungure imbere yo kwumva adhana. Muratwibuke mu masengesho yanyu :)',
  },
  sahur: {
    kanal: 'Igihe gisigaye ca suhuri',
    kanalAciklama: 'Imenyesha ry’igihe gisigaye gushika suhuri irangiye (Fajri)',
    baslik: '🌙 Igihe gisigaye ca suhuri',
    govde: 'Murashobora kurya no kunywa; ugupfunga kuregereje gutangura.',
    girdiBaslik: '🌙 Igihe ca suhuri carangiye',
    girdiGovde: 'Ni igihe co kugira niya.',
    girdiUzun: 'Igihe ca Fajri cageze; ntimwibagire kugira niya.\n\n⚠️ Ubu murashobora gusenga Fajri. Muratwibuke mu masengesho yanyu :)',
  },
  seri: {
    kanal: 'Igihe gisigaye c’uruhererekane',
    kanalAciklama: 'Igihe gisigaye gushika umusi w’uruhererekane urangiye',
    baslik: '🔥 Uruhererekane rwanyu ruri mu kaga',
    govde: 'Amasengesho y’uyu musi ntaruzura; ntimutakaze uruhererekane rwanyu.',
    girdiBaslik: '🔥 Umusi w’uruhererekane warangiye',
    girdiGovde: 'Umusi mushasha watanguye.',
  },
};
