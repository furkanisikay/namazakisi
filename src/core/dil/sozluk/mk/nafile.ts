import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Nafile "нафила" (meal 17:79 dipnotu, HadeethEnc "ги клањал нафилите"). Kuşluk "духа" (sr/bs
 * emsali, mk kaynakta DOĞRULANMADI); teheccüd adı mk kaynakta yok → HadeethEnc mk 11259'un
 * betimleyici "ноќен намаз"ı; evvâbîn "евабин" (Boşnakça "evvabin" emsali, DOĞRULANMADI).
 */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Духа', evvabin: 'Евабин', teheccud: 'Ноќен намаз' },
  kucuk: { kusluk: 'духа', evvabin: 'евабин', teheccud: 'ноќен намаз' },
  aciklamalar: {
    kusluk:
      'Почнува околу 45 минути по изгрејсонце и трае до 10 минути пред пладне-намазот. Ишрак е неговото најрано време; највредно е кога ќе помине првата четвртина од денот.',
    evvabin: 'Се клања по акшам-намазот, до настапувањето на јацијата.',
    teheccud: 'Се клања по јацијата, откако ќе се заспие и ќе се стане, сѐ до сабах. Највредно време е последната третина од ноќта.',
  },
  bilgiBugun: '{aciklama}\n\nДенес: {bas} – {son}',
  enFaziletli: ' · највредно по {saat}',
  sonUcteBir: ' · последна третина {saat}',
  durumAktif: 'Времето настапи · до {saat}',
  durumNafile: 'Нафила · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Време за духа',
    kuslukSuruyor: 'Времето за духа трае; можете да клањате до {son}.',
    kuslukGirdi: 'Настапи времето за духа. Убав миг за два реката; трае до {son}.',
    kuslukBitiyor: cogul({
      one: 'До крајот на времето за духа остана {n} минута. Убав миг за два реката; трае до {son}.',
      other: 'До крајот на времето за духа останаа {n} минути. Убав миг за два реката; трае до {son}.',
    }),
    evvabinBaslik: 'Евабин',
    evvabinSuruyor: 'Сѐ уште има време за евабин. Јација настапува во {son}.',
    evvabinGirdi: 'По акшам-намазот, убав миг за евабин. Јација настапува во {son}.',
    evvabinKalan: cogul({
      one: 'За евабин остана {n} минута. Јација настапува во {son}.',
      other: 'За евабин останаа {n} минути. Јација настапува во {son}.',
    }),
    teheccudBaslik: 'Време за ноќен намаз',
    uyandirSonUcte: 'Станете; настапи последната третина од ноќта. Сабах настапува во {son}.',
    uyandirKalan: cogul({
      one: 'Станете; до сабах остана {n} минута. Сабах настапува во {son}.',
      other: 'Станете; до сабах останаа {n} минути. Сабах настапува во {son}.',
    }),
    sonUcteBaslik: 'Последна третина од ноќта',
    sonUcteGovde: 'Најберикетните часови за ноќен намаз. Сабах настапува во {son}.',
    teheccudKalan: cogul({
      one: 'До сабах остана {n} минута. Убаво време за ноќен намаз.',
      other: 'До сабах останаа {n} минути. Убаво време за ноќен намаз.',
    }),
  },
  uyandirmaKanali: 'Будење за ноќен намаз',
  uyandirmaKanaliAciklama: 'Ве буди за ноќен намаз; ѕвони и во тивок режим',
};
