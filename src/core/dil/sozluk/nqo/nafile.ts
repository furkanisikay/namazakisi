import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile adları Arapça kökenli (Duha, Evvâbîn, Teheccüd) N'Ko harf çevirisi (türetildi); "nafile" = ߘߌߦߊߘߌߦߊ (QE 17:79). */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'ߘߎߤߊ', evvabin: 'ߊߥߊߓߌ߲', teheccud: 'ߕߊߤߊߖߎߘߎ' },
  kucuk: { kusluk: 'ߘߎߤߊ', evvabin: 'ߊߥߊߓߌ߲', teheccud: 'ߕߊߤߊߖߎߘߎ' },
  aciklamalar: {
    kusluk:
      'ߊ߬ ߓߍ߫ ߘߊߡߌ߬ߣߊ߬ ߕߟߋ߬ߓߐ ߞߐߝߍ߬ ߡߌ߬ߛߍ߲ 45 ߢߐߜߐ߲߸ ߞߊ߬ ߕߊ߯ ߛߋ߫ ߖ߭ߎߤߎߙߌ ߢߍ߫ ߡߌ߬ߛߍ߲ 10 ߡߊ߬. ߌߛߌߙߊߞߌ ߦߋ߫ ߊ߬ ߥߊ߯ߕߌ߫ ߝߟߐ ߦߋ߫; ߊ߬ ߥߊ߯ߕߌ߫ ߢߎߡߊ߲ߓߊ ߦߋ߫ ߟߏ߲ ߣߊ߯ߣߌ߲ߣߊ߲ ߝߟߐ ߕߍߡߍ߲ߠߍ߲ ߞߐߝߍ߬.',
    evvabin: 'ߊ߬ ߓߍ߫ ߞߍ߫ ߝߌߕߌߙߌ ߞߐߝߍ߬߸ ߞߊ߬ ߕߊ߯ ߛߋ߫ ߛߊߝߏ߫ ߥߊ߯ߕߌ߫ ߡߊ߬.',
    teheccud: 'ߊ߬ ߓߍ߫ ߞߍ߫ ߛߊߝߏ߫ ߞߐߝߍ߬ ߣߌ߫ ߡߐ߰ ߓߘߊ߫ ߛߎߣߐߜߐ ߞߊ߬ ߥߎߟߌ߸ ߞߊ߬ ߕߊ߯ ߛߋ߫ ߖߍߡߎߙߍ߲ ߥߊ߯ߕߌ߫ ߡߊ߬. ߊ߬ ߥߊ߯ߕߌ߫ ߢߎߡߊ߲ߓߊ ߦߋ߫ ߛߎ ߛߓߊߣߊ߲ ߠߊߓߊ߲ ߦߋ߫.',
  },
  bilgiBugun: '{aciklama}\n\nߓߌ߬: {bas} – {son}',
  enFaziletli: ' · ߊ߬ ߢߎߡߊ߲ߓߊ {saat} ߞߐߝߍ߬',
  sonUcteBir: ' · ߛߓߊߣߊ߲ ߠߊߓߊ߲ {saat}',
  durumAktif: 'ߥߊ߯ߕߌ߫ ߓߘߊ߫ ߛߋ߫ · ߊ߬ ߓߍ߫ ߓߊ߲߫ {saat}',
  durumNafile: 'ߘߌߦߊߘߌߦߊ · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'ߘߎߤߊ ߥߊ߯ߕߌ߫',
    kuslukSuruyor: 'ߘߎߤߊ ߥߊ߯ߕߌ߫ ߓߍ߫ ߕߊ߯ ߝߍ߬; ߊߟߎ߫ ߓߍ߫ ߛߋ߫ ߞߊ߬ ߊ߬ ߞߍ߫ ߝߏ߫ {son}.',
    kuslukGirdi: 'ߘߎߤߊ ߥߊ߯ߕߌ߫ ߓߘߊ߫ ߛߋ߫. ߥߊ߯ߕߌ߫ ߢߎ߬ߡߊ߲߬ ߘߏ߲߬ ߙߊߞߊ ߝߌ߬ߟߊ ߞߊߡߊ߬; ߊ߬ ߓߍ߫ ߕߊ߯ ߝߏ߫ {son}.',
    kuslukBitiyor: cogul({
      other: 'ߡߌ߬ߛߍ߲ {n} ߕߏߙߊ ߘߎߤߊ ߥߊ߯ߕߌ߫ ߟߊ߫. ߥߊ߯ߕߌ߫ ߢߎ߬ߡߊ߲߬ ߘߏ߲߬ ߙߊߞߊ ߝߌ߬ߟߊ ߞߊߡߊ߬; ߊ߬ ߓߍ߫ ߕߊ߯ ߝߏ߫ {son}.',
    }),
    evvabinBaslik: 'ߊߥߊߓߌ߲',
    evvabinSuruyor: 'ߥߊ߯ߕߌ߫ ߓߍ߫ ߦߋ߲߬ ߝߟߐ ߊߥߊߓߌ߲ ߞߊߡߊ߬. ߛߊߝߏ߫ ߓߍ߫ ߘߊߡߌ߬ߣߊ߬ {son}.',
    evvabinGirdi: 'ߝߌߕߌߙߌ ߞߐߝߍ߬߸ ߥߊ߯ߕߌ߫ ߢߎ߬ߡߊ߲߬ ߘߏ߲߬ ߊߥߊߓߌ߲ ߞߊߡߊ߬. ߛߊߝߏ߫ ߓߍ߫ ߘߊߡߌ߬ߣߊ߬ {son}.',
    evvabinKalan: cogul({ other: 'ߡߌ߬ߛߍ߲ {n} ߕߏߙߊ ߊߥߊߓߌ߲ ߞߊߡߊ߬. ߛߊߝߏ߫ ߓߍ߫ ߘߊߡߌ߬ߣߊ߬ {son}.' }),
    teheccudBaslik: 'ߕߊߤߊߖߎߘߎ ߥߊ߯ߕߌ߫',
    uyandirSonUcte: 'ߊߟߎ߫ ߦߋ߫ ߥߎߟߌ; ߛߎ ߛߓߊߣߊ߲ ߠߊߓߊ߲ ߓߘߊ߫ ߘߊߡߌ߬ߣߊ߬. ߖߍߡߎߙߍ߲ ߓߍ߫ ߘߊߡߌ߬ߣߊ߬ {son}.',
    uyandirKalan: cogul({ other: 'ߊߟߎ߫ ߦߋ߫ ߥߎߟߌ; ߡߌ߬ߛߍ߲ {n} ߕߏߙߊ ߞߊ߬ ߛߋ߫ ߖߍߡߎߙߍ߲ ߡߊ߬. ߖߍߡߎߙߍ߲ ߓߍ߫ ߘߊߡߌ߬ߣߊ߬ {son}.' }),
    sonUcteBaslik: 'ߛߎ ߛߓߊߣߊ߲ ߠߊߓߊ߲',
    sonUcteGovde: 'ߕߊߤߊߖߎߘߎ ߕߎ߬ߡߊ߬ߙߋ߲ ߓߊߙߌߞߊߡߊߓߊ ߟߎ߬. ߖߍߡߎߙߍ߲ ߓߍ߫ ߘߊߡߌ߬ߣߊ߬ {son}.',
    teheccudKalan: cogul({ other: 'ߡߌ߬ߛߍ߲ {n} ߕߏߙߊ ߞߊ߬ ߛߋ߫ ߖߍߡߎߙߍ߲ ߡߊ߬. ߥߊ߯ߕߌ߫ ߢߎ߬ߡߊ߲߬ ߘߏ߲߬ ߕߊߤߊߖߎߘߎ ߞߊߡߊ߬.' }),
  },
  uyandirmaKanali: 'ߕߊߤߊߖߎߘߎ ߟߊߥߎߟߌ',
  uyandirmaKanaliAciklama: 'ߊ߬ ߓߍ߫ ߊߟߎ߫ ߟߊߥߎߟߌ ߛߎ ߛߊߟߌ ߞߊߡߊ߬; ߊ߬ ߓߍ߫ ߡߊ߲߬ߞߊ߲ ߓߐ߫ ߤߊߟߌ߬ ߣߌ߫ ߕߋߟߋߝߐߣߌ ߡߊߞߎ߲߬ߣߍ߲ ߘߏ߲߬',
};
