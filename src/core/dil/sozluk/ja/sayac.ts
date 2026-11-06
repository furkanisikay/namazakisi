import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: '礼拝のカウントダウン',
    kanalAciklama: '礼拝時間が終わる前のカウントダウン通知',
    baslik: '⏱️ {ad}の礼拝',
    govde: '{ad}の時間がまもなく終わります。',
  },
  canli: {
    vakitGovde: '{ad}が終わるまでの残り時間',
    cumaBaslik: '🕌 金曜礼拝',
    cumaGovde: 'ズフル（フトバ）までの残り時間',
    nafileGovde: '{ad}が終わるまでの残り時間',
  },
  iftar: {
    kanal: 'イフタールのカウントダウン',
    kanalAciklama: 'イフタールの時間までのカウントダウン通知',
    baslik: '🌙 イフタールのカウントダウン',
    govde: 'アザーンを聞くまで断食を解かないでください。',
    girdiBaslik: '🌙 イフタールの時間です',
    girdiGovde: '恵みあるイフタールを。',
    girdiUzun: '恵みあるイフタールを。\n\n⚠️ アザーンを聞くまで断食を解かないでください。私たちのこともお祈りください。',
  },
  sahur: {
    kanal: 'サフールのカウントダウン',
    kanalAciklama: 'サフールの終わり（ファジュル）までのカウントダウン通知',
    baslik: '🌙 サフールのカウントダウン',
    govde: 'まだ飲食できます。まもなく断食が始まります。',
    girdiBaslik: '🌙 サフールの時間が終わりました',
    girdiGovde: '断食の意図をする時間です。',
    girdiUzun: 'ファジュルの時間になりました。断食の意図を忘れないでください。\n\n⚠️ ファジュルの礼拝ができます。私たちのこともお祈りください。',
  },
  seri: {
    kanal: '連続記録のカウントダウン',
    kanalAciklama: '連続記録の日が終わるまでのカウントダウン',
    baslik: '🔥 連続記録が途切れそうです',
    govde: '今日の礼拝がまだ終わっていません。連続記録を失わないようにしてください。',
    girdiBaslik: '🔥 連続記録の日が終わりました',
    girdiGovde: '新しい日が始まりました。',
  },
};
