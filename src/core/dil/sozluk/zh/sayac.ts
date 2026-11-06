import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: '礼拜倒计时',
    kanalAciklama: '礼拜时间结束前的倒计时通知',
    baslik: '⏱️ {ad}',
    govde: '{ad}时间即将结束。',
  },
  canli: {
    vakitGovde: '距{ad}结束还有',
    cumaBaslik: '🕌 主麻礼拜',
    cumaGovde: '距晌礼（演讲）还有',
    nafileGovde: '距{ad}结束还有',
  },
  iftar: {
    kanal: '开斋倒计时',
    kanalAciklama: '到开斋时间的倒计时通知',
    baslik: '🌙 开斋倒计时',
    govde: '听到宣礼之前不要开斋。',
    girdiBaslik: '🌙 开斋时间到了',
    girdiGovde: '开斋吉庆。',
    girdiUzun: '开斋吉庆。\n\n⚠️ 听到宣礼之前不要开斋。请在祈祷中记念我们 :)',
  },
  sahur: {
    kanal: '封斋倒计时',
    kanalAciklama: '到封斋结束（晨礼）的倒计时通知',
    baslik: '🌙 封斋倒计时',
    govde: '仍可饮食；即将开始封斋。',
    girdiBaslik: '🌙 封斋饭时间已过',
    girdiGovde: '该举意封斋了。',
    girdiUzun: '晨礼时间已到；不要忘记举意封斋。\n\n⚠️ 现在可以礼晨礼了。请在祈祷中记念我们 :)',
  },
  seri: {
    kanal: '连续记录倒计时',
    kanalAciklama: '到连续记录日结束的倒计时',
    baslik: '🔥 您的连续记录有中断风险',
    govde: '今天的礼拜尚未完成；别让连续记录中断。',
    girdiBaslik: '🔥 连续记录日已结束',
    girdiGovde: '新的一天已经开始。',
  },
};
