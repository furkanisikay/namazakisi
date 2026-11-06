import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı: kibar kısa istek "〜してください"; secde yok. Sıra Türkçe şablonlarla BİREBİR
 * eşleşir. `{yön}` dakikadan sonra gelir: "5分残っています" / "5分経過しました".
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: '残っています', girisindenItibaren: '経過しました' },
  cip: { vakit: '礼拝名', sure: '分', yon: '残り / 経過', cuma: '金曜礼拝', yatsi: 'イシャー' },
  sablon: {
    muhafizCikis: [
      '{vakit}の時間がまもなく終わります。残り{süre}分です。',
      '{vakit}を逃さないでください。残り{süre}分です。',
      '時間が迫っています。{vakit}が終わるまで{süre}分です。',
    ],
    muhafizGiris: [
      '{vakit}の時間になりました。{süre}分経過しました。',
      '{vakit}を遅らせないでください。{süre}分経過しました。',
      '時間が進んでいます。{vakit}の礼拝に立ってください。{süre}分経ちました。',
    ],
    nafile: [
      '{vakit}の時間です。{süre}分{yön}。2ラクアにちょうど良い時です。',
      '{vakit}の時間です。2ラクアを礼拝する良い機会です。',
      '{vakit}は{süre}分{yön}。',
    ],
    cuma: [
      '金曜礼拝まで残り{süre}分です。準備をして、モスクへ向かってください。',
      '金曜礼拝が近づいています。残り{süre}分です。',
      'フトバに間に合うようにしてください。金曜礼拝まで残り{süre}分です。',
    ],
    camiyeGit: [
      '{vakit}まで残り{süre}分です。モスクへ向かってください。',
      'モスクへ行く時間です。{vakit}まで{süre}分です。',
      '{vakit}の礼拝のためにモスクへ向かってください。',
    ],
    yatis: ['寝る前にイシャーを礼拝してください。', 'イシャーの時間はまだ続いています。眠る前に礼拝に立ってください。', 'イシャーを礼拝する前に眠らないでください。'],
    takvim: [
      'カレンダーの予定が{vakit}の時間と重なっています。',
      '{vakit}の時間が予定と重なっています。先に礼拝するのを忘れないでください。',
      '{süre}分後、{vakit}の時間が予定と重なります。礼拝を忘れないでください。',
    ],
  },
  otomatik: {
    cuma: '金曜礼拝のズフルまで残り{sure}です。準備をして、モスクへ向かってください。',
    camiyeGiris: '{vakit}まで残り{sure}です。',
    camiyeHazirlan: '準備をして、モスクへ向かってください。',
    camiyeYola: 'モスクへ向かってください。',
    takvimGiris: 'カレンダーの予定が{vakit}の時間と重なっています。',
    takvimOnce: '予定の前に礼拝するのを忘れないでください。',
    takvimKaplar: '手を休めて礼拝するのを忘れないでください。',
    yatsi: '寝る前にイシャーを礼拝してください。',
    muhasebeTek: '今日の{vakit}がまだ記録されていないようです。',
    muhasebeCoklu: cogul({ other: '今日の礼拝のうち{n}回がまだ記録されていないようです。' }),
    geceCapasi: '静かな時間まであと{süre}分です。寝る前に{vakit}を礼拝してください。',
    kuslukSuruyor: 'ドゥハーの時間です。',
    kuslukGirdi: 'ドゥハーの時間になりました。2ラクアにちょうど良い時です。',
    kuslukBitiyor: cogul({ other: 'ドゥハーの時間は残り{n}分です。' }),
    evvabinSuruyor: 'アッワービーンの時間はまだあります。',
    evvabinGirdi: 'アッワービーンの時間です。2ラクアにちょうど良い時です。',
    evvabinKalan: cogul({ other: 'アッワービーンの時間は残り{n}分です。' }),
    teheccudSonUcte: 'タハッジュドの時間です。夜の最後の3分の1が始まりました。',
    teheccudKalan: cogul({ other: 'タハッジュドの時間です。ファジュルまであと{n}分です。' }),
  },
};
