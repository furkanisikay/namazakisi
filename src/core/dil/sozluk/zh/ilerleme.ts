import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: '进度',
  kilma: {
    baslik: '礼拜率',
    haftalik: '每周',
    aylik: '每月',
    donemErisim: '礼拜率统计周期',
    hesaplaniyor: '正在计算您的礼拜率',
    bosBaslik: '暂无记录',
    bosAciklama: '标记礼拜后会显示在这里。',
    yuzde: '{n}%',
    kilinan: '已礼拜',
    oran: '比率',
    enIyiGun: '最佳的一天',
    haftaHedefi: '本周目标',
    hedefAlt: cogul({ other: '依据您的连续记录目标: 每天{n}次礼拜' }),
    kilinanNamaz: '已礼拜次数',
    hedefeUlasan: '达标天数',
    ayYil: '{yil}年{ay}',
    namazKilinanGun: '有礼拜的天数',
    vakitVakit: '按礼拜时间',
    yuzdeErisim: '{ad}: 百分之{n}',
  },
  rozetler: {
    baslik: '等级与徽章',
    seviye: '{n}级',
    puan: '积分',
    kalanErisim: cogul({ other: '距{rank}等级还差{n}积分' }),
    enYuksek: '您已达到最高等级',
    kalan: cogul({ other: '距{rank}还差{n}积分' }),
    kilinanErisim: cogul({ other: '已礼拜{n}次' }),
    namaz: cogul({ other: '次礼拜' }),
    rozetErisim: '已获得{n}枚徽章（共{toplam}枚）',
    rozet: cogul({ other: '枚徽章' }),
  },
};
