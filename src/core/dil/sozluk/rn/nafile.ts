import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajudi' },
  kucuk: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajudi' },
  aciklamalar: {
    kusluk:
      'Gitangura nk’iminota 45 izuba rirashe, kigashika iminota 10 imbere ya Adhuhuri. Ishraq ni co gihe cayo ca mbere; igihe ciza kuruta ni inyuma y’uko igice ca kane ca mbere c’umusi giheze.',
    evvabin: 'Risengwa inyuma ya Maghrib, gushika igihe ca Isha.',
    teheccud: 'Risengwa inyuma ya Isha, umuntu amaze gusinzira akavyuka, gushika igihe ca Fajri. Igihe caryo ciza kuruta ni igice ca gatatu ca nyuma c’ijoro.',
  },
  bilgiBugun: '{aciklama}\n\nUyu musi: {bas} – {son}',
  enFaziletli: ' · ciza kuruta inyuma ya {saat}',
  sonUcteBir: ' · igice ca nyuma {saat}',
  durumAktif: 'Igihe cageze · kirangira {saat}',
  durumNafile: 'Inyongera · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Igihe ca Duha',
    kuslukSuruyor: 'Igihe ca Duha kiracariho; murashobora gusenga gushika {son}.',
    kuslukGirdi: 'Igihe ca Duha cageze. Ni akanya keza ko gusenga rakaa zibiri; kirashika {son}.',
    kuslukBitiyor: cogul({
      one: 'Hasigaye umunota {n} w’igihe ca Duha. Ni akanya keza ko gusenga rakaa zibiri; kirashika {son}.',
      other: 'Hasigaye iminota {n} y’igihe ca Duha. Ni akanya keza ko gusenga rakaa zibiri; kirashika {son}.',
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'Haracari umwanya wa Awwabin. Isha itangura ku isaha {son}.',
    evvabinGirdi: 'Inyuma ya Maghrib, ni akanya keza ka Awwabin. Isha itangura ku isaha {son}.',
    evvabinKalan: cogul({
      one: 'Hasigaye umunota {n} wa Awwabin. Isha itangura ku isaha {son}.',
      other: 'Hasigaye iminota {n} ya Awwabin. Isha itangura ku isaha {son}.',
    }),
    teheccudBaslik: 'Igihe ca Tahajudi',
    uyandirSonUcte: 'Muvyuke; igice ca gatatu ca nyuma c’ijoro catanguye. Fajri itangura ku isaha {son}.',
    uyandirKalan: cogul({
      one: 'Muvyuke; hasigaye umunota {n} ngo Fajri ishike. Fajri itangura ku isaha {son}.',
      other: 'Muvyuke; hasigaye iminota {n} ngo Fajri ishike. Fajri itangura ku isaha {son}.',
    }),
    sonUcteBaslik: 'Igice ca nyuma c’ijoro',
    sonUcteGovde: 'Amasaha y’umugisha kuruta ya Tahajudi. Fajri itangura ku isaha {son}.',
    teheccudKalan: cogul({
      one: 'Hasigaye umunota {n} ngo Fajri ishike. Ni igihe ciza ca Tahajudi.',
      other: 'Hasigaye iminota {n} ngo Fajri ishike. Ni igihe ciza ca Tahajudi.',
    }),
  },
  uyandirmaKanali: 'Kuvyura kwa Tahajudi',
  uyandirmaKanaliAciklama: 'Ibavyura ku isengesho ry’ijoro; irasona naho terefone yaba iri mu bucece',
};
