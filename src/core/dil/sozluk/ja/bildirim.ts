import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı olanlar (cuma, camiye, takvim, yatsı) kibar kısa istek "〜してください"; işaretleme ve
 * muhasebe aynı です/ます kipinde. Başlık önden okunur: vakit adı + süre ilk 16 karakterde.
 */
export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ 礼拝しました', kazayaEkle: 'やり直しに追加', inceleyin: '確認' },
  kanal: {
    genel: '一般の通知',
    muhafiz: '礼拝見守り',
    muhafizAciklama: '礼拝時間のリマインダー',
    acil: '緊急の礼拝リマインダー',
    acilAciklama: '礼拝時間がまもなく終わります - 緊急のリマインダー',
    vakit: '礼拝時間',
    vakitAciklama: '礼拝時間になったときに送るリマインダー',
    muhafizSes: '礼拝見守り・{ses}',
    acilSes: '緊急のリマインダー・{ses}',
    acilSesAciklama: '礼拝時間がまもなく終わります - 緊急のリマインダー',
    titresimli: '{kanal}・バイブレーション',
    alarm: '礼拝アラーム',
    alarmSes: '礼拝アラーム・{ses}',
    uygulamaSesi: 'アプリの音',
    seciliSes: '選んだ音',
  },
  cuma: {
    baslik: '金曜礼拝・残り{sure}・礼拝が近づいています',
    govdeIlk: 'ズフルまで{sure}です。準備をして、モスクへ向かってください。',
    govde: 'ズフルまで{sure}です。モスクへ向かってください。',
  },
  camiye: {
    hazirlanBaslik: '{ad}・アザーンまで{dk}分・モスクへの準備',
    hazirlanGovde: 'モスクで{ad}に間に合うよう準備してください。{sonra}分後に出発してください。アザーンまで{dk}分です。',
    yolaCikBaslik: '{ad}・アザーンまで{dk}分・モスクへ',
    yolaCikGovde: '{ad}に間に合うようモスクへ向かってください。アザーンまで{dk}分です。',
  },
  takvim: {
    etkinlikTek: '「{ad}」',
    etkinlikCoklu: cogul({ other: 'カレンダーの連続した{n}件の予定' }),
    etkinlikBir: 'カレンダーの予定',
    sonAnIkindi: 'アスルに適した最後の時刻は{saat}です（それ以降は礼拝が禁じられた時間）',
    sonAnVakit: '{kucuk}の時間は{saat}に終わります',
    onceBaslik: '{ad}・{saat}に予定・先に礼拝を',
    onceGovde: '{etkinlik}は{aralik}です。{sonAn}。予定が始まる前に{kucuk}を礼拝してください。',
    kaplarBaslik: '{ad}・予定が礼拝時間と重なっています',
    kaplarGovde:
      '{etkinlik}は{aralik}で、{kucuk}の時間（{giris}～{son}）と重なっています。少し手を休めて{kucuk}を礼拝できるよう、今のうちに計画してください。',
  },
  yatis: {
    yatsiBaslik: '{ad}・寝る前に礼拝を 🌙',
    yatsiGovde: '{ad}の時間はまだ続いています。眠る前に礼拝に立ってください。',
    ozet: '今日 {kilinan}/5・{liste}が未記録',
    tekOto: '礼拝したなら記録してください。{oto}',
    tekKaza: '礼拝したなら記録してください。できなかった場合は、やり直し記録に追加してください。',
    tekSuruyor: '礼拝したなら記録してください。礼拝時間はまだ続いています。',
    cokluOto: 'アプリを開いて、礼拝したものを確認して記録してください。{oto}',
    coklu: 'アプリを開いて、礼拝したものを確認して記録してください。',
    otoSor: '記録しない場合、この日についてやり直し記録で確認があります。',
    otoEkle: '記録しない場合、礼拝の日が終わるとやり直しに追加されます。',
  },
  gunSonu: {
    baslik: '今日はまだ未完了・連続記録',
    govde: '日が終わる前に礼拝したものを記録すれば、連続記録が続きます。',
  },
};
