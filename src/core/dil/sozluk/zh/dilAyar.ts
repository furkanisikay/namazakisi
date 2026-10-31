import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: '语言 · Language',
  aciklama: '选择应用语言。通知和朗读也使用该语言。',
  grup: '应用语言',
  dilAdlari: { tr: '土耳其语', en: '英语', id: '印度尼西亚语', de: '德语', fr: '法语', bs: '波斯尼亚语', ru: '俄语', ms: '马来语', ar: '阿拉伯语', ur: '乌尔都语', es: '西班牙语', nl: '荷兰语', sq: '阿尔巴尼亚语', hi: '印地语', bn: '孟加拉语', fa: '波斯语', ps: '普什图语', ckb: '中库尔德语', ug: '维吾尔语', az: '阿塞拜疆语', uz: '乌兹别克语', kk: '哈萨克语', ky: '柯尔克孜语', tg: '塔吉克语', sw: '斯瓦希里语', ha: '豪萨语', am: '阿姆哈拉语', om: '奥罗莫语', so: '索马里语', ff: '富拉语', yo: '约鲁巴语', zh: '简体中文', ta: '泰米尔语', ml: '马拉雅拉姆语', th: '泰语', ko: '韩语', vi: '越南语' },
  cihazDili: '设备语言',
  cihazDiliKullaniliyor: '当前为{ad}',
  cihazDiliDesteklenmiyor: '暂不支持您的设备语言；将使用土耳其语。',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Beta 版翻译正在审校中，部分文字可能不够完善。',
    vakit: '语言不会改变礼拜时间的计算方式。',
    nass: '在土耳其语以外的语言中，只显示《古兰经》译文；圣训文本来自土耳其语资料，因此不显示。',
  },
  ozelAnons: {
    baslik: '您编写的朗读文本',
    govde: cogul({
      other: '您编写的{n}条朗读文本仍为之前的语言。要替换为新语言的现成文本吗？',
    }),
    degistir: '替换为现成文本',
    koru: '保持不变',
    degisti: cogul({ other: '已替换{n}条文本。' }),
  },
  vakitAdlari: {
    baslik: '礼拜名称',
    aciklama: '选择礼拜时间的名称。',
    otomatik: '按国家/地区',
    otomatikAciklama: '使用您所在国家/地区常用的名称。',
    takimlar: { temel: '阿拉伯语名称', diyanetDe: 'Diyanet（德语）', turkce: '土耳其语名称', magrip: '马格里布拼写', cezayir: '阿尔及利亚拼写', afgan: '阿富汗名称' },
  },
  yazi: {
    baslik: '字母',
    aciklama: '选择文字所用的字母。',
    otomatik: '按国家/地区',
    otomatikAciklama: '使用您所在国家/地区常用的字母。',
    latin: '拉丁字母',
    kiril: '西里尔字母',
  },
  kaydedilemedi: '无法保存语言。再试一次。',
  sihirbazBaglantisi: '语言 · Language',
  sihirbazBaglantisiAciklama: '更改应用语言',
};
