// N'Ko yazısında büyük/küçük harf yok (`buyuk` = `adlar`); SAĞDAN SOLA. Rakam çizimde N'Ko (`nkoo`), sözlükte Batı rakamı.
// Sabah (ߖߍߡߎߙߍ߲) ve yatsı (ߛߊߝߏ߫) QuranEnc ankobambara_dayyan 24:58'den; öğle, ikindi ve akşam Arapça kökenli
// Manding adlarının N'Ko harf çevirisi (türetildi), güneş doğuşu QE'deki ߕߟߋ߬ߓߐ.
import type { Sozluk } from '../tr';

export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'ߖߍߡߎߙߍ߲', gunes: 'ߕߟߋ߬ߓߐ', ogle: 'ߖ߭ߎߤߎߙߌ', ikindi: 'ߟߊ߲ߛߊߙߊ', aksam: 'ߝߌߕߌߙߌ', yatsi: 'ߛߊߝߏ߫' },
  buyuk: { imsak: 'ߖߍߡߎߙߍ߲', gunes: 'ߕߟߋ߬ߓߐ', ogle: 'ߖ߭ߎߤߎߙߌ', ikindi: 'ߟߊ߲ߛߊߙߊ', aksam: 'ߝߌߕߌߙߌ', yatsi: 'ߛߊߝߏ߫' },
  kucuk: { imsak: 'ߖߍߡߎߙߍ߲', gunes: 'ߕߟߋ߬ߓߐ', ogle: 'ߖ߭ߎߤߎߙߌ', ikindi: 'ߟߊ߲ߛߊߙߊ', aksam: 'ߝߌߕߌߙߌ', yatsi: 'ߛߊߝߏ߫' },
  imsakVakti: 'ߖߍߡߎߙߍ߲',
  cuma: 'ߛߌ߬ߣߌ߲߬ߟߏ߲ ߛߊߟߌ',
  cumaKucuk: 'ߛߌ߬ߣߌ߲߬ߟߏ߲ ߛߊߟߌ',
  gunesDogusu: 'ߕߟߋ߬ߓߐ',
  gunesDogusuKucuk: 'ߕߟߋ߬ߓߐ',
  durum: { kilindi: 'ߞߍߣߍ߲', vaktiGeldi: 'ߥߊ߯ߕߌ߫ ߓߘߊ߫ ߛߋ߫', girmedi: 'ߥߊ߯ߕߌ߫ ߡߊ߬ ߛߋ߫ ߝߟߐ', gecti: 'ߊ߬ ߡߊ߬ ߞߍ߫' },
  durumKucuk: { kilindi: 'ߞߍߣߍ߲', vaktiGeldi: 'ߥߊ߯ߕߌ߫ ߓߘߊ߫ ߛߋ߫', girmedi: 'ߥߊ߯ߕߌ߫ ߡߊ߬ ߛߋ߫ ߝߟߐ', gecti: 'ߊ߬ ߡߊ߬ ߞߍ߫' },
  eylem: { kildim: 'ߒ ߓߘߊ߫ ߛߊߟߌ ߞߍ߫', kilindi: 'ߛߊߟߌ ߞߍߣߍ߲' },
  kerahatVakti: 'ߡߊߞߎߙߎ ߥߊ߯ߕߌ߫',
  isaretle: 'ߊ߬ ߛߓߍ߫ ߞߏ߫ ߊ߬ ߞߍߣߍ߲',
  geriAlEtiketi: '{durum}߸ ߊߟߎ߫ ߦߋ߫ ߊ߬ ߘߌߜߌ ߞߊ߬ ߊ߬ ߟߊߛߋߜߌ߲',
  geriAlindi: 'ߕߊ߯ߡߊߛߌߦߍ߲ ߓߘߊ߫ ߛߋ߲߬ߓߐ߫',
};
