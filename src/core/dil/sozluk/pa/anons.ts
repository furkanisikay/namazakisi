import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı Pencapçada (Şahmuki): "تسیں" + ‑و emri, kısa ve doğrudan; secde emri yok
 * ("نماز لئی کھڑے ہو جاؤ"). Konuşanın cinsiyetine göre çekilen birinci tekil kip kullanılmaz.
 * Sıra Türkçe şablonlarla BİREBİR eşleşir; dakika "منٹ" (kısaltma yok).
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'باقی', girisindenItibaren: 'لنگھ گئے' },
  cip: { vakit: 'نماز دا ناں', sure: 'منٹ', yon: 'باقی / لنگھ گئے', cuma: 'جمعہ', yatsi: 'عشاء' },
  sablon: {
    muhafizCikis: [
      '{vakit} دا وقت مک رہیا اے، آخری {süre} منٹ۔',
      '{vakit} دی نماز نہ چھڈو، {süre} منٹ باقی نیں۔',
      'وقت تنگ ہو رہیا اے، {vakit} دی نماز لئی {süre} منٹ۔',
    ],
    muhafizGiris: [
      '{vakit} دا وقت ہو گیا، {süre} منٹ لنگھ گئے۔',
      '{vakit} دی نماز وچ دیر نہ کرو، {süre} منٹ لنگھ چکے نیں۔',
      'وقت لنگھ رہیا اے، {vakit} دی نماز لئی کھڑے ہو جاؤ، {süre} منٹ ہو گئے۔',
    ],
    nafile: [
      '{vakit} دا وقت، {süre} منٹ {yön}۔ دو رکعت لئی چنگا موقع اے۔',
      '{vakit} دا وقت جاری اے۔ دو رکعت پڑھن دا چنگا موقع اے۔',
      '{vakit} لئی {süre} منٹ {yön}۔',
    ],
    cuma: [
      'جمعہ دی نماز وچ {süre} منٹ باقی نیں۔ تیاری کرو تے مسجد ول ٹر پوو۔',
      'جمعہ دا وقت نیڑے اے، {süre} منٹ باقی نیں۔',
      'خطبے تے اپڑو، جمعہ وچ {süre} منٹ باقی نیں۔',
    ],
    camiyeGit: [
      '{vakit} دے وقت وچ {süre} منٹ باقی نیں۔ مسجد ول ٹر پوو۔',
      'مسجد جان دا وقت اے، {vakit} دے وقت وچ {süre} منٹ نیں۔',
      '{vakit} دی نماز لئی مسجد ول ٹر پوو۔',
    ],
    yatis: ['سون توں پہلاں عشاء پڑھ لوو۔', 'عشاء دا وقت جاری اے، سون توں پہلاں نماز لئی کھڑے ہو جاؤ۔', 'عشاء پڑھے بغیر نہ سوو۔'],
    takvim: [
      'تہاڈے کیلنڈر دی اک مصروفیت {vakit} دے وقت وچ آ رہی اے۔',
      '{vakit} دا وقت اک مصروفیت نال ٹکرا رہیا اے؛ پہلاں نماز پڑھنا نہ بھُلو۔',
      '{süre} منٹ بعد {vakit} دا وقت تہاڈی مصروفیت نال ٹکرا رہیا اے؛ نماز نہ بھُلو۔',
    ],
  },
  otomatik: {
    cuma: 'جمعہ لئی ظہر دے وقت وچ {sure} باقی نیں۔ تیاری کرو تے مسجد ول ٹر پوو۔',
    camiyeGiris: '{vakit} دے وقت وچ {sure} باقی نیں۔',
    camiyeHazirlan: 'تیاری کرو تے مسجد ول ٹر پوو۔',
    camiyeYola: 'مسجد ول ٹر پوو۔',
    takvimGiris: 'تہاڈے کیلنڈر دی اک مصروفیت {vakit} دے وقت وچ آ رہی اے۔',
    takvimOnce: 'مصروفیت توں پہلاں نماز پڑھنا نہ بھُلو۔',
    takvimKaplar: 'وقفہ لے کے نماز پڑھنا نہ بھُلو۔',
    yatsi: 'سون توں پہلاں عشاء پڑھ لوو۔',
    muhasebeTek: 'لگدا اے اج {vakit} تے نشان نہیں لایا گیا۔',
    muhasebeCoklu: cogul({ one: 'لگدا اے اج {n} نماز تے نشان نہیں لایا گیا۔', other: 'لگدا اے اج {n} نمازاں تے نشان نہیں لایا گیا۔' }),
    geceCapasi: 'رات دے چُپ ویلیاں وچ {süre} منٹ باقی نیں۔ سون توں پہلاں {vakit} دی نماز پڑھ لوو۔',
    kuslukSuruyor: 'چاشت دا وقت جاری اے۔',
    kuslukGirdi: 'چاشت دا وقت ہو گیا۔ دو رکعت لئی چنگا موقع اے۔',
    kuslukBitiyor: cogul({ one: 'چاشت دا وقت مکن وچ {n} منٹ باقی اے۔', other: 'چاشت دا وقت مکن وچ {n} منٹ باقی نیں۔' }),
    evvabinSuruyor: 'اوابین دا وقت اجے باقی اے۔',
    evvabinGirdi: 'اوابین دا وقت۔ دو رکعت لئی چنگا موقع اے۔',
    evvabinKalan: cogul({ one: 'اوابین لئی {n} منٹ باقی اے۔', other: 'اوابین لئی {n} منٹ باقی نیں۔' }),
    teheccudSonUcte: 'تہجد دا وقت۔ رات دا آخری تیجا حصہ شروع ہو گیا۔',
    teheccudKalan: cogul({ one: 'تہجد دا وقت۔ فجر وچ {n} منٹ باقی اے۔', other: 'تہجد دا وقت۔ فجر وچ {n} منٹ باقی نیں۔' }),
  },
};
