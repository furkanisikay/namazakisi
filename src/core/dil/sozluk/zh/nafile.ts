import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: '杜哈拜', evvabin: '阿瓦宾拜', teheccud: '夜间拜' },
  kucuk: { kusluk: '杜哈拜', evvabin: '阿瓦宾拜', teheccud: '夜间拜' },
  aciklamalar: {
    kusluk: '日出后约45分钟开始，持续到晌礼前10分钟。日出后拜（伊什拉格）是其最早时间；最尊贵的时间是白天过去四分之一之后。',
    evvabin: '在昏礼之后、宵礼时间之前礼。',
    teheccud: '在宵礼之后睡醒时礼，直到晨礼时间。最尊贵的时间是夜晚的最后三分之一。',
  },
  bilgiBugun: '{aciklama}\n\n今天: {bas} – {son}',
  enFaziletli: ' · {saat}后最尊贵',
  sonUcteBir: ' · 最后三分之一 {saat}',
  durumAktif: '时间已到 · {saat}结束',
  durumNafile: '副功拜 · {bas}–{son}',
  bildirim: {
    kuslukBaslik: '杜哈拜时间',
    kuslukSuruyor: '杜哈拜时间正在进行，可礼到{son}。',
    kuslukGirdi: '杜哈拜时间已到。正是礼两拜的好时机，持续到{son}。',
    kuslukBitiyor: cogul({
      other: '杜哈拜时间还剩{n}分钟。正是礼两拜的好时机，持续到{son}。',
    }),
    evvabinBaslik: '阿瓦宾拜',
    evvabinSuruyor: '仍有时间礼阿瓦宾拜。宵礼于{son}开始。',
    evvabinGirdi: '昏礼之后，正是礼阿瓦宾拜的好时机。宵礼于{son}开始。',
    evvabinKalan: cogul({ other: '阿瓦宾拜还剩{n}分钟。宵礼于{son}开始。' }),
    teheccudBaslik: '夜间拜时间',
    uyandirSonUcte: '起来吧，夜晚的最后三分之一已经开始。晨礼于{son}开始。',
    uyandirKalan: cogul({ other: '起来吧，距晨礼还有{n}分钟。晨礼于{son}开始。' }),
    sonUcteBaslik: '夜晚的最后三分之一',
    sonUcteGovde: '礼夜间拜最吉庆的时刻。晨礼于{son}开始。',
    teheccudKalan: cogul({ other: '距晨礼还有{n}分钟。正是礼夜间拜的好时机。' }),
  },
  uyandirmaKanali: '夜间拜唤醒',
  uyandirmaKanaliAciklama: '唤醒您礼夜间拜；静音模式下也会响铃',
};
