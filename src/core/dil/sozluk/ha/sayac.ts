import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Ƙidayar lokacin salla',
    kanalAciklama: 'Sanarwar ƙidaya kafin lokacin salla ya ƙare',
    baslik: '⏱️ Sallar {ad}',
    govde: 'Lokacin {ad} yana gab da ƙarewa.',
  },
  canli: {
    vakitGovde: 'Lokacin da ya rage kafin {ad} ta ƙare',
    cumaBaslik: '🕌 Sallar Jumuʼa',
    cumaGovde: 'Lokacin da ya rage zuwa Azahar (huɗuba)',
    nafileGovde: 'Lokacin da ya rage kafin {ad} ta ƙare',
  },
  iftar: {
    kanal: 'Ƙidayar buɗa baki',
    kanalAciklama: 'Sanarwar ƙidaya zuwa lokacin buɗa baki',
    baslik: '🌙 Ƙidayar buɗa baki',
    govde: 'Kada ku buɗa baki kafin ku ji kiran salla.',
    girdiBaslik: '🌙 Lokacin buɗa baki ya yi',
    girdiGovde: 'Barka da buɗa baki.',
    girdiUzun: 'Barka da buɗa baki.\n\n⚠️ Kada ku buɗa baki kafin ku ji kiran salla. Ku tuna da mu a cikin adduʼoʼinku :)',
  },
  sahur: {
    kanal: 'Ƙidayar sahur',
    kanalAciklama: 'Sanarwar ƙidaya zuwa ƙarshen sahur (Asuba)',
    baslik: '🌙 Ƙidayar sahur',
    govde: 'Kuna iya ci da sha har yanzu; azumi zai fara nan ba da jimawa ba.',
    girdiBaslik: '🌙 Lokacin sahur ya ƙare',
    girdiGovde: 'Lokaci ya yi na ɗaukar niyya.',
    girdiUzun: 'Lokacin Asuba ya yi; kada ku manta da ɗaukar niyya.\n\n⚠️ Yanzu kuna iya yin sallar Asuba. Ku tuna da mu a cikin adduʼoʼinku :)',
  },
  seri: {
    kanal: 'Ƙidayar jeri',
    kanalAciklama: 'Ƙidaya zuwa ƙarshen ranar jeri',
    baslik: '🔥 Jerinka yana cikin haɗari',
    govde: 'Sallolin yau ba su cika ba; kada ka rasa jerinka.',
    girdiBaslik: '🔥 Ranar jeri ta ƙare',
    girdiGovde: 'Sabuwar rana ta fara.',
  },
};
