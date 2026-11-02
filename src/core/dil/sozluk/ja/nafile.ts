import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Kuşluk ドゥハー, teheccüd タハッジュド (IslamHouse ja); evvâbîn アッワービーン ve işrak イシュラーク türetildi. */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'ドゥハー', evvabin: 'アッワービーン', teheccud: 'タハッジュド' },
  kucuk: { kusluk: 'ドゥハー', evvabin: 'アッワービーン', teheccud: 'タハッジュド' },
  aciklamalar: {
    kusluk:
      '日の出の約45分後に始まり、ズフルの10分前まで続きます。最も早い時間はイシュラークで、最も徳が高いのは一日の4分の1が過ぎた後です。',
    evvabin: 'マグリブの後、イシャーの時間までに行います。',
    teheccud: 'イシャーの後に眠り、起きてからファジュルの時間までに行います。最も徳が高い時間は夜の最後の3分の1です。',
  },
  bilgiBugun: '{aciklama}\n\n今日：{bas}～{son}',
  enFaziletli: '・{saat}以降が最も徳が高い',
  sonUcteBir: '・最後の3分の1は{saat}から',
  durumAktif: '時間になりました・{saat}まで',
  durumNafile: '任意の礼拝・{bas}～{son}',
  bildirim: {
    kuslukBaslik: 'ドゥハーの時間',
    kuslukSuruyor: 'ドゥハーの時間です。{son}まで礼拝できます。',
    kuslukGirdi: 'ドゥハーの時間になりました。2ラクアにちょうど良い時です。{son}まで続きます。',
    kuslukBitiyor: cogul({
      other: 'ドゥハーの時間は残り{n}分です。2ラクアにちょうど良い時です。{son}まで続きます。',
    }),
    evvabinBaslik: 'アッワービーン',
    evvabinSuruyor: 'アッワービーンの時間はまだあります。イシャーは{son}に始まります。',
    evvabinGirdi: 'マグリブの後、アッワービーンにちょうど良い時です。イシャーは{son}に始まります。',
    evvabinKalan: cogul({ other: 'アッワービーンの時間は残り{n}分です。イシャーは{son}に始まります。' }),
    teheccudBaslik: 'タハッジュドの時間',
    uyandirSonUcte: '起きてください。夜の最後の3分の1が始まりました。ファジュルは{son}に始まります。',
    uyandirKalan: cogul({ other: '起きてください。ファジュルまであと{n}分です。ファジュルは{son}に始まります。' }),
    sonUcteBaslik: '夜の最後の3分の1',
    sonUcteGovde: 'タハッジュドに最も恵まれた時間です。ファジュルは{son}に始まります。',
    teheccudKalan: cogul({ other: 'ファジュルまであと{n}分です。タハッジュドに良い時間です。' }),
  },
  uyandirmaKanali: 'タハッジュドの目覚まし',
  uyandirmaKanaliAciklama: '夜の礼拝のために起こします。マナーモードでも鳴ります',
};
