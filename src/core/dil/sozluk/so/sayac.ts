import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Tirinta salaadda',
    kanalAciklama: 'Ogeysiis tirin ah ka hor inta uusan waqtiga salaaddu dhammaan',
    baslik: '⏱️ Salaadda {ad}',
    govde: 'Waqtiga {ad} wuu dhammaanayaa.',
  },
  canli: {
    vakitGovde: 'Waqtiga ka haray dhammaadka {ad}',
    cumaBaslik: '🕌 Salaadda Jimce',
    cumaGovde: 'Waqtiga ka haray Duhur (khudbadda)',
    nafileGovde: 'Waqtiga ka haray dhammaadka {ad}',
  },
  iftar: {
    kanal: 'Tirinta afurka',
    kanalAciklama: 'Ogeysiis tirin ah ilaa waqtiga afurka',
    baslik: '🌙 Tirinta afurka',
    govde: 'Ha afurin ka hor intaadan maqlin aadaanka.',
    girdiBaslik: '🌙 Waa waqtigii afurka',
    girdiGovde: 'Afur barakaysan.',
    girdiUzun: 'Afur barakaysan.\n\n⚠️ Ha afurin ka hor intaadan maqlin aadaanka. Duco nagu xusuuso :)',
  },
  sahur: {
    kanal: 'Tirinta suxuurta',
    kanalAciklama: 'Ogeysiis tirin ah ilaa dhammaadka suxuurta (Subax)',
    baslik: '🌙 Tirinta suxuurta',
    govde: 'Weli waad cuni kartaa oo cabbi kartaa; soonku dhawaan ayuu bilaabmayaa.',
    girdiBaslik: '🌙 Waqtiga suxuurta wuu dhammaaday',
    girdiGovde: 'Waa waqtigii aad niyadda yeelan lahayd.',
    girdiUzun: 'Waqtiga Subax waa galay; ha ilaawin inaad niyadda yeelato.\n\n⚠️ Hadda waad tukan kartaa Subax. Duco nagu xusuuso :)',
  },
  seri: {
    kanal: 'Tirinta taxanaha',
    kanalAciklama: 'Tirin ilaa dhammaadka maalinta taxanaha',
    baslik: '🔥 Taxanahaagu khatar ayuu ku jiraa',
    govde: 'Salaadaha maanta ma dhammaystirna; ha lumin taxanahaaga.',
    girdiBaslik: '🔥 Maalinta taxanaha way dhammaatay',
    girdiGovde: 'Maalin cusub ayaa bilaabatay.',
  },
};
