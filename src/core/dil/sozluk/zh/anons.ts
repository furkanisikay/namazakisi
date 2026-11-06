import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** 朗读（召唤礼拜）：简短直接，不用代词，不写"叩头"。顺序与土耳其语模板一一对应。 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: '剩余', girisindenItibaren: '已过' },
  cip: { vakit: '礼拜名称', sure: '分钟', yon: '剩余 / 已过', cuma: '主麻', yatsi: '宵礼' },
  sablon: {
    muhafizCikis: [
      '{vakit}时间即将结束，还剩{süre}分钟。',
      '不要错过{vakit}，还剩{süre}分钟。',
      '时间紧迫，距{vakit}结束还有{süre}分钟。',
    ],
    muhafizGiris: [
      '{vakit}时间已到，已过{süre}分钟。',
      '不要拖延{vakit}，已过{süre}分钟。',
      '时间在流逝，起身礼{vakit}，已经{süre}分钟了。',
    ],
    nafile: [
      '{vakit}时间，{yön}{süre}分钟。正是礼两拜的好时机。',
      '{vakit}时间正在进行。正是礼两拜的好机会。',
      '{vakit}{yön}{süre}分钟。',
    ],
    cuma: [
      '距主麻还有{süre}分钟。做好准备，前往清真寺。',
      '主麻临近，还剩{süre}分钟。',
      '赶上演讲，距主麻还有{süre}分钟。',
    ],
    camiyeGit: [
      '距{vakit}还有{süre}分钟。前往清真寺。',
      '该去清真寺了，距{vakit}还有{süre}分钟。',
      '前往清真寺礼{vakit}。',
    ],
    yatis: ['睡前礼宵礼。', '宵礼时间仍在，睡前起身礼拜。', '礼宵礼之前不要入睡。'],
    takvim: [
      '您日历中的一项活动在{vakit}时间内。',
      '{vakit}时间与一项活动冲突；不要忘记先礼拜。',
      '{süre}分钟后{vakit}时间与您的活动冲突；不要忘记礼拜。',
    ],
  },
  otomatik: {
    cuma: '距主麻的晌礼还有{sure}。做好准备，前往清真寺。',
    camiyeGiris: '距{vakit}还有{sure}。',
    camiyeHazirlan: '做好准备，前往清真寺。',
    camiyeYola: '前往清真寺。',
    takvimGiris: '您日历中的一项活动在{vakit}时间内。',
    takvimOnce: '不要忘记在活动前礼拜。',
    takvimKaplar: '不要忘记抽空礼拜。',
    yatsi: '睡前礼宵礼。',
    muhasebeTek: '今天的{vakit}似乎尚未标记。',
    muhasebeCoklu: cogul({ other: '今天似乎有{n}番礼拜尚未标记。' }),
    geceCapasi: '{süre}分钟后进入安静时段。睡前礼{vakit}。',
    kuslukSuruyor: '杜哈拜时间正在进行。',
    kuslukGirdi: '杜哈拜时间已到。正是礼两拜的好时机。',
    kuslukBitiyor: cogul({ other: '杜哈拜时间还剩{n}分钟。' }),
    evvabinSuruyor: '仍有时间礼阿瓦宾拜。',
    evvabinGirdi: '阿瓦宾拜时间。正是礼两拜的好时机。',
    evvabinKalan: cogul({ other: '阿瓦宾拜还剩{n}分钟。' }),
    teheccudSonUcte: '夜间拜时间。夜晚的最后三分之一已经开始。',
    teheccudKalan: cogul({ other: '夜间拜时间。距晨礼还有{n}分钟。' }),
  },
};
