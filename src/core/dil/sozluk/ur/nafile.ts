import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'چاشت', evvabin: 'اوابین', teheccud: 'تہجد' },
  kucuk: { kusluk: 'چاشت', evvabin: 'اوابین', teheccud: 'تہجد' },
  aciklamalar: {
    kusluk:
      'طلوعِ آفتاب کے تقریباً 45 منٹ بعد شروع ہوتی ہے اور ظہر سے 10 منٹ پہلے تک رہتی ہے۔ اشراق اس کا پہلا وقت ہے؛ افضل وقت دن کا پہلا چوتھائی حصہ گزرنے کے بعد ہے۔',
    evvabin: 'مغرب کی نماز کے بعد، عشاء کے وقت تک پڑھی جاتی ہے۔',
    teheccud: 'عشاء کے بعد سو کر اٹھنے پر، فجر کے وقت تک پڑھی جاتی ہے۔ اس کا افضل وقت رات کا آخری تہائی حصہ ہے۔',
  },
  bilgiBugun: '{aciklama}\n\nآج: {bas} – {son}',
  enFaziletli: ' · افضل وقت {saat} کے بعد',
  sonUcteBir: ' · آخری تہائی {saat}',
  durumAktif: 'وقت ہو گیا · اختتام {saat}',
  durumNafile: 'نفل · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'چاشت کا وقت',
    kuslukSuruyor: 'چاشت کا وقت جاری ہے؛ {son} تک پڑھی جا سکتی ہے۔',
    kuslukGirdi: 'چاشت کا وقت ہو گیا۔ دو رکعت کے لیے اچھا موقع ہے؛ وقت {son} تک ہے۔',
    kuslukBitiyor: cogul({
      one: 'چاشت کا وقت ختم ہونے میں {n} منٹ باقی ہے۔ دو رکعت کے لیے اچھا موقع ہے؛ وقت {son} تک ہے۔',
      other: 'چاشت کا وقت ختم ہونے میں {n} منٹ باقی ہیں۔ دو رکعت کے لیے اچھا موقع ہے؛ وقت {son} تک ہے۔',
    }),
    evvabinBaslik: 'اوابین',
    evvabinSuruyor: 'اوابین کا وقت ابھی باقی ہے۔ عشاء کا وقت {son}۔',
    evvabinGirdi: 'مغرب کے بعد اوابین کے لیے اچھا موقع ہے۔ عشاء کا وقت {son}۔',
    evvabinKalan: cogul({
      one: 'اوابین کے لیے {n} منٹ باقی ہے۔ عشاء کا وقت {son}۔',
      other: 'اوابین کے لیے {n} منٹ باقی ہیں۔ عشاء کا وقت {son}۔',
    }),
    teheccudBaslik: 'تہجد کا وقت',
    uyandirSonUcte: 'اٹھیں؛ رات کا آخری تہائی حصہ شروع ہو گیا۔ فجر کا وقت {son}۔',
    uyandirKalan: cogul({
      one: 'اٹھیں؛ فجر میں {n} منٹ باقی ہے۔ فجر کا وقت {son}۔',
      other: 'اٹھیں؛ فجر میں {n} منٹ باقی ہیں۔ فجر کا وقت {son}۔',
    }),
    sonUcteBaslik: 'رات کا آخری تہائی حصہ',
    sonUcteGovde: 'تہجد کے لیے سب سے بابرکت گھڑیاں۔ فجر کا وقت {son}۔',
    teheccudKalan: cogul({
      one: 'فجر میں {n} منٹ باقی ہے۔ تہجد کے لیے اچھا وقت ہے۔',
      other: 'فجر میں {n} منٹ باقی ہیں۔ تہجد کے لیے اچھا وقت ہے۔',
    }),
  },
  uyandirmaKanali: 'تہجد کے لیے جگانا',
  uyandirmaKanaliAciklama: 'رات کی نماز کے لیے جگاتا ہے؛ خاموش موڈ میں بھی بجتا ہے',
};
