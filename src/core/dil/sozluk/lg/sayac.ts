import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Okubala ekiseera ky’esswala',
    kanalAciklama: 'Obubaka obubala ekiseera ky’esswala nga tekinnaggwaako',
    baslik: '⏱️ Esswala ya {ad}',
    govde: 'Ekiseera kya {ad} kinaatera okuggwaako.',
  },
  canli: {
    vakitGovde: 'Ekiseera ekisigaddeyo ekya {ad} okuggwaako',
    cumaBaslik: '🕌 Esswala ya Ejjuma',
    cumaGovde: 'Ekiseera ekisigaddeyo okutuuka ku Dhuhur (khutuba)',
    nafileGovde: 'Ekiseera ekisigaddeyo ekya {ad} okuggwaako',
  },
  iftar: {
    kanal: 'Okubala ekiseera kya iftar',
    kanalAciklama: 'Obubaka obubala ekiseera okutuuka ku iftar',
    baslik: '🌙 Okubala ekiseera kya iftar',
    govde: 'Tosiibulukuka nga tonnawulira kwaziina.',
    girdiBaslik: '🌙 Ekiseera kya iftar kituuse',
    girdiGovde: 'Iftar ey’emikisa.',
    girdiUzun: 'Iftar ey’emikisa.\n\n⚠️ Tosiibulukuka nga tonnawulira kwaziina. Tujjukire mu ssaala zo :)',
  },
  sahur: {
    kanal: 'Okubala ekiseera kya sahur',
    kanalAciklama: 'Obubaka obubala ekiseera okutuuka ku nkomerero ya sahur (Subuhi)',
    baslik: '🌙 Okubala ekiseera kya sahur',
    govde: 'Okyayinza okulya n’okunywa; okusiiba kunaatera okutandika.',
    girdiBaslik: '🌙 Ekiseera kya sahur kiwedde',
    girdiGovde: 'Kye kiseera okukola niyya.',
    girdiUzun: 'Ekiseera kya Subuhi kituuse; tewerabira kukola niyya.\n\n⚠️ Kati osobola okusaala Subuhi. Tujjukire mu ssaala zo :)',
  },
  seri: {
    kanal: 'Okubala ekiseera ky’omuddiriŋŋanwa',
    kanalAciklama: 'Okubala ekiseera okutuuka ku nkomerero y’olunaku lw’omuddiriŋŋanwa',
    baslik: '🔥 Omuddiriŋŋanwa gwo guli mu kabi',
    govde: 'Esswala za leero tezinnaggwa; tofiirwa muddiriŋŋanwa gwo.',
    girdiBaslik: '🔥 Olunaku lw’omuddiriŋŋanwa luwedde',
    girdiGovde: 'Olunaku olupya lutandise.',
  },
};
