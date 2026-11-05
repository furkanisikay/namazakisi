import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajudi' },
  kucuk: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajudi' },
  aciklamalar: {
    kusluk:
      'Itangira hafi iminota 45 nyuma y’uko izuba rirashe ikageza ku minota 10 mbere ya Adhuhuri. Ishraq ni igihe cyayo cya mbere; icyiza kurusha ni nyuma y’uko igice cya kane cya mbere cy’umunsi gishize.',
    evvabin: 'Isaliwa nyuma ya Maghrib, kugeza igihe cya Isha.',
    teheccud: 'Isaliwa nyuma yo gusinzira no gukanguka nyuma ya Isha, kugeza igihe cya Fajri. Igihe cyayo cyiza kurusha ni igice cya gatatu cya nyuma cy’ijoro.',
  },
  bilgiBugun: '{aciklama}\n\nUyu munsi: {bas} – {son}',
  enFaziletli: ' · icyiza kurusha ni nyuma ya {saat}',
  sonUcteBir: ' · igice cya gatatu cya nyuma {saat}',
  durumAktif: 'Igihe cyatangiye · kirangira {saat}',
  durumNafile: 'Inyongera · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Igihe cya Duha',
    kuslukSuruyor: 'Igihe cya Duha kirakomeje; mushobora gusali kugeza {son}.',
    kuslukGirdi: 'Igihe cya Duha cyatangiye. Ni akanya keza ko gusali raka ebyiri; kirageza {son}.',
    kuslukBitiyor: cogul({
      one: 'Hasigaye iminota {n} mu gihe cya Duha. Ni akanya keza ko gusali raka ebyiri; kirageza {son}.',
      other: 'Hasigaye iminota {n} mu gihe cya Duha. Ni akanya keza ko gusali raka ebyiri; kirageza {son}.',
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'Haracyari igihe cya Awwabin. Isha itangira {son}.',
    evvabinGirdi: 'Nyuma ya Maghrib, ni akanya keza ka Awwabin. Isha itangira {son}.',
    evvabinKalan: cogul({ one: 'Hasigaye iminota {n} kuri Awwabin. Isha itangira {son}.', other: 'Hasigaye iminota {n} kuri Awwabin. Isha itangira {son}.' }),
    teheccudBaslik: 'Igihe cya Tahajudi',
    uyandirSonUcte: 'Mubyuke; igice cya gatatu cya nyuma cy’ijoro cyatangiye. Fajri itangira {son}.',
    uyandirKalan: cogul({ one: 'Mubyuke; hasigaye iminota {n} ngo Fajri igere. Fajri itangira {son}.', other: 'Mubyuke; hasigaye iminota {n} ngo Fajri igere. Fajri itangira {son}.' }),
    sonUcteBaslik: 'Igice cya gatatu cya nyuma cy’ijoro',
    sonUcteGovde: 'Amasaha afite imigisha myinshi kuri Tahajudi. Fajri itangira {son}.',
    teheccudKalan: cogul({ one: 'Hasigaye iminota {n} ngo Fajri igere. Ni igihe cyiza cya Tahajudi.', other: 'Hasigaye iminota {n} ngo Fajri igere. Ni igihe cyiza cya Tahajudi.' }),
  },
  uyandirmaKanali: 'Gukangurirwa Tahajudi',
  uyandirmaKanaliAciklama: 'Ibakangurira iswala ya nijoro; isona n’igihe telefoni iri mu buryo bucecetse',
};
