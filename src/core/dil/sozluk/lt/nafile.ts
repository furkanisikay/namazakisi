import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile = "savanoriška malda" (HE 3732); teheccüd "Tahadžud" (QE 17:79 "tahadžud"); Duha ve Awwabin müftülük yazım düzeniyle (Latin, çekimsiz). */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahadžud' },
  kucuk: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahadžud' },
  aciklamalar: {
    kusluk:
      'Prasideda praėjus maždaug 45 minutėms po saulėtekio ir tęsiasi, kol iki Dhuhr lieka 10 minučių. Išrakas – ankstyviausias jos laikas; vertingiausia ją atlikti praėjus pirmajam dienos ketvirčiui.',
    evvabin: 'Atliekama po Maghrib maldos, iki Isha laiko.',
    teheccud: 'Atliekama po Isha, pamiegojus ir atsikėlus, iki Fajr laiko. Vertingiausias laikas – paskutinis nakties trečdalis.',
  },
  bilgiBugun: '{aciklama}\n\nŠiandien: {bas} – {son}',
  enFaziletli: ' · vertingiausia po {saat}',
  sonUcteBir: ' · paskutinis trečdalis {saat}',
  durumAktif: 'Laikas prasidėjo · pabaiga {saat}',
  durumNafile: 'Savanoriška · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Duha laikas',
    kuslukSuruyor: 'Duha laikas tęsiasi; galite melstis iki {son}.',
    kuslukGirdi: 'Prasidėjo Duha laikas. Geras metas dviem rakatams; laikas tęsiasi iki {son}.',
    kuslukBitiyor: cogul({
      one: 'Iki Duha laiko pabaigos liko {n} minutė. Geras metas dviem rakatams; laikas tęsiasi iki {son}.',
      few: 'Iki Duha laiko pabaigos liko {n} minutės. Geras metas dviem rakatams; laikas tęsiasi iki {son}.',
      many: 'Iki Duha laiko pabaigos liko {n} minutės. Geras metas dviem rakatams; laikas tęsiasi iki {son}.',
      other: 'Iki Duha laiko pabaigos liko {n} minučių. Geras metas dviem rakatams; laikas tęsiasi iki {son}.',
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'Awwabin maldai dar yra laiko. Isha prasideda {son}.',
    evvabinGirdi: 'Po Maghrib – geras metas Awwabin maldai. Isha prasideda {son}.',
    evvabinKalan: cogul({ one: 'Awwabin maldai liko {n} minutė. Isha prasideda {son}.', few: 'Awwabin maldai liko {n} minutės. Isha prasideda {son}.', many: 'Awwabin maldai liko {n} minutės. Isha prasideda {son}.', other: 'Awwabin maldai liko {n} minučių. Isha prasideda {son}.' }),
    teheccudBaslik: 'Tahadžud laikas',
    uyandirSonUcte: 'Kelkitės; prasidėjo paskutinis nakties trečdalis. Fajr prasideda {son}.',
    uyandirKalan: cogul({ one: 'Kelkitės; iki Fajr liko {n} minutė. Fajr prasideda {son}.', few: 'Kelkitės; iki Fajr liko {n} minutės. Fajr prasideda {son}.', many: 'Kelkitės; iki Fajr liko {n} minutės. Fajr prasideda {son}.', other: 'Kelkitės; iki Fajr liko {n} minučių. Fajr prasideda {son}.' }),
    sonUcteBaslik: 'Paskutinis nakties trečdalis',
    sonUcteGovde: 'Palaimingiausios valandos Tahadžud maldai. Fajr prasideda {son}.',
    teheccudKalan: cogul({ one: 'Iki Fajr liko {n} minutė. Geras metas Tahadžud maldai.', few: 'Iki Fajr liko {n} minutės. Geras metas Tahadžud maldai.', many: 'Iki Fajr liko {n} minutės. Geras metas Tahadžud maldai.', other: 'Iki Fajr liko {n} minučių. Geras metas Tahadžud maldai.' }),
  },
  uyandirmaKanali: 'Tahadžud žadinimas',
  uyandirmaKanaliAciklama: 'Pažadina naktinei maldai; skamba net begarsiu režimu',
};
