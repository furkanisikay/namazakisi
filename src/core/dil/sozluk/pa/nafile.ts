import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'چاشت', evvabin: 'اوابین', teheccud: 'تہجد' },
  kucuk: { kusluk: 'چاشت', evvabin: 'اوابین', teheccud: 'تہجد' },
  aciklamalar: {
    kusluk:
      'طلوعِ آفتاب توں تقریباً 45 منٹ بعد شروع ہوندی اے تے ظہر توں 10 منٹ پہلاں تک رہندی اے۔ اشراق اوہدا پہلا وقت اے؛ افضل وقت دن دا پہلا چوتھائی حصہ لنگھن توں بعد اے۔',
    evvabin: 'مغرب دی نماز توں بعد، عشاء دے وقت تک پڑھی جاندی اے۔',
    teheccud: 'عشاء توں بعد سوں کے اُٹھن تے، فجر دے وقت تک پڑھی جاندی اے۔ اوہدا افضل وقت رات دا آخری تیجا حصہ اے۔',
  },
  bilgiBugun: '{aciklama}\n\nاج: {bas} – {son}',
  enFaziletli: ' · افضل وقت {saat} توں بعد',
  sonUcteBir: ' · آخری تیجا حصہ {saat}',
  durumAktif: 'وقت ہو گیا · اختتام {saat}',
  durumNafile: 'نفل · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'چاشت دا وقت',
    kuslukSuruyor: 'چاشت دا وقت جاری اے؛ {son} تک پڑھی جا سکدی اے۔',
    kuslukGirdi: 'چاشت دا وقت ہو گیا۔ دو رکعت لئی چنگا موقع اے؛ وقت {son} تک اے۔',
    kuslukBitiyor: cogul({
      one: 'چاشت دا وقت مکن وچ {n} منٹ باقی اے۔ دو رکعت لئی چنگا موقع اے؛ وقت {son} تک اے۔',
      other: 'چاشت دا وقت مکن وچ {n} منٹ باقی نیں۔ دو رکعت لئی چنگا موقع اے؛ وقت {son} تک اے۔',
    }),
    evvabinBaslik: 'اوابین',
    evvabinSuruyor: 'اوابین دا وقت اجے باقی اے۔ عشاء دا وقت {son}۔',
    evvabinGirdi: 'مغرب توں بعد اوابین لئی چنگا موقع اے۔ عشاء دا وقت {son}۔',
    evvabinKalan: cogul({
      one: 'اوابین لئی {n} منٹ باقی اے۔ عشاء دا وقت {son}۔',
      other: 'اوابین لئی {n} منٹ باقی نیں۔ عشاء دا وقت {son}۔',
    }),
    teheccudBaslik: 'تہجد دا وقت',
    uyandirSonUcte: 'اُٹھو؛ رات دا آخری تیجا حصہ شروع ہو گیا۔ فجر دا وقت {son}۔',
    uyandirKalan: cogul({
      one: 'اُٹھو؛ فجر وچ {n} منٹ باقی اے۔ فجر دا وقت {son}۔',
      other: 'اُٹھو؛ فجر وچ {n} منٹ باقی نیں۔ فجر دا وقت {son}۔',
    }),
    sonUcteBaslik: 'رات دا آخری تیجا حصہ',
    sonUcteGovde: 'تہجد لئی سب توں برکت والیاں گھڑیاں۔ فجر دا وقت {son}۔',
    teheccudKalan: cogul({
      one: 'فجر وچ {n} منٹ باقی اے۔ تہجد لئی چنگا وقت اے۔',
      other: 'فجر وچ {n} منٹ باقی نیں۔ تہجد لئی چنگا وقت اے۔',
    }),
  },
  uyandirmaKanali: 'تہجد لئی جگانا',
  uyandirmaKanaliAciklama: 'رات دی نماز لئی جگاندا اے؛ چُپ موڈ وچ وی وجدا اے',
};
