import type { Sozluk } from '../tr';

/**
 * 中国穆斯林（回族等）的固有说法，不是翻译。"准承"见 IslamHouse《副功拜》（"主啊，求您准承吧"），
 * "吉庆"为祝福用语（同上）；"愿真主准承"这一短句由此推导，待母语读者确认。
 * 圣纪、登霄为中文通用节日名；盖德尔夜见 IslamHouse。不赞美，不用感叹号。
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: '愿真主赐福。',
  kabulDualari: ['愿真主准承', '愿主准承', '愿真主准承', '求主准承吧'],
  kabulDuasi: '愿真主准承',
  ekSabah: '愿您早晨吉庆',
  ekYatsi: '愿您夜晚安宁',
  tamGunAna: '愿真主准承',
  tamGunAlt: '您今天已完成全部五番礼拜。',
  kazaKabul: '已从您的还补记录中减去一次{vakit}。{dua}。',
  kandilGeceleri: {
    regaib: '赖哲卜之夜吉庆',
    mirac: '登霄夜吉庆',
    berat: '拜拉特夜吉庆',
    mevlid: '圣纪吉庆',
  },
  selamlar: {
    sahur: '封斋吉庆',
    bayram: '节日吉庆',
    iftar: '开斋吉庆',
    kadir: '盖德尔夜吉庆',
    arefe: '节前吉庆',
    hicriYilbasi: '伊斯兰新年吉庆',
    cuma: '主麻吉庆',
    ramazan: '斋月吉庆',
    sabah: '愿您早晨吉庆',
  },
};
