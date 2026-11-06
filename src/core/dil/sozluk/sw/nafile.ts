import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Dhuha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  kucuk: { kusluk: 'Dhuha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  aciklamalar: {
    kusluk:
      'Huanza takriban dakika 45 baada ya macheo na hudumu hadi dakika 10 kabla ya Adhuhuri. Ishraq ndio wakati wake wa mapema zaidi; ulio bora zaidi ni baada ya robo ya kwanza ya mchana kupita.',
    evvabin: 'Huswaliwa baada ya Magharibi, hadi wakati wa Isha.',
    teheccud: 'Huswaliwa baada ya kulala na kuamka kufuatia Isha, hadi wakati wa Alfajiri. Wakati wake bora zaidi ni theluthi ya mwisho ya usiku.',
  },
  bilgiBugun: '{aciklama}\n\nLeo: {bas} – {son}',
  enFaziletli: ' · bora zaidi baada ya {saat}',
  sonUcteBir: ' · theluthi ya mwisho {saat}',
  durumAktif: 'Wakati umeingia · unaisha {saat}',
  durumNafile: 'Nafila · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Wakati wa Dhuha',
    kuslukSuruyor: 'Wakati wa Dhuha unaendelea; unaweza kuswali hadi {son}.',
    kuslukGirdi: 'Wakati wa Dhuha umeingia. Ni wakati mzuri wa rakaa mbili; unadumu hadi {son}.',
    kuslukBitiyor: cogul({
      one: 'Imebaki dakika {n} katika wakati wa Dhuha. Ni wakati mzuri wa rakaa mbili; unadumu hadi {son}.',
      other: 'Zimebaki dakika {n} katika wakati wa Dhuha. Ni wakati mzuri wa rakaa mbili; unadumu hadi {son}.',
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'Bado kuna muda wa Awwabin. Isha inaingia saa {son}.',
    evvabinGirdi: 'Baada ya Magharibi, ni wakati mzuri wa Awwabin. Isha inaingia saa {son}.',
    evvabinKalan: cogul({ one: 'Imebaki dakika {n} kwa Awwabin. Isha inaingia saa {son}.', other: 'Zimebaki dakika {n} kwa Awwabin. Isha inaingia saa {son}.' }),
    teheccudBaslik: 'Wakati wa Tahajjud',
    uyandirSonUcte: 'Amka; theluthi ya mwisho ya usiku imeingia. Alfajiri inaingia saa {son}.',
    uyandirKalan: cogul({ one: 'Amka; imebaki dakika {n} hadi Alfajiri. Alfajiri inaingia saa {son}.', other: 'Amka; zimebaki dakika {n} hadi Alfajiri. Alfajiri inaingia saa {son}.' }),
    sonUcteBaslik: 'Theluthi ya mwisho ya usiku',
    sonUcteGovde: 'Saa zenye baraka zaidi kwa Tahajjud. Alfajiri inaingia saa {son}.',
    teheccudKalan: cogul({ one: 'Imebaki dakika {n} hadi Alfajiri. Ni wakati mzuri wa Tahajjud.', other: 'Zimebaki dakika {n} hadi Alfajiri. Ni wakati mzuri wa Tahajjud.' }),
  },
  uyandirmaKanali: 'Kuamshwa kwa Tahajjud',
  uyandirmaKanaliAciklama: 'Hukuamsha kwa Swala ya usiku; hulia hata ukiwa kwenye hali ya kimya',
};
