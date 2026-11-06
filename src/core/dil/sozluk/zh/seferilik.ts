import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: '哈乃斐', safii: '沙斐仪' },
  kaynaklar: {
    vatan: '旅行意义上的家乡、居所与暂住（土耳其语）',
    cem: '可以并礼吗？（土耳其语）',
    baslangic: '旅行从何时开始？（土耳其语）',
    ziyaret: '回父母所在城市探望的人算旅行者吗？（土耳其语）',
  },
  bilgiNotu: '这是信息，不是教法判断。您是否算旅行者，取决于旅行的目的、时长以及您的举意。',
  baslik: '您似乎正在旅行',
  mesafeSatiri: '您距居住地直线距离约{km}公里。Diyanet 就{mezhep}学派所作的说明:',
  maddeler: {
    hanefi: [
      '在哈乃斐学派中，旅行距离约为90公里。打算在目的地停留不足15天的人算作旅行者。',
      '旅行者将四拜的主命拜减为两拜（短礼）。',
      '在哈乃斐学派中，并礼仅限于朝觐期间的阿拉法特和穆兹达里法。Diyanet 还指出，遇到旅行等重大理由时，可以遵从其他学派的观点。',
    ],
    safii: [
      '在沙斐仪学派中，旅行距离同样约为90公里。在目的地的停留若不足4天（不计到达和离开的日子），旅行的教法规定仍然适用。',
      '旅行者将四拜的主命拜减为两拜（短礼）。',
      '在沙斐仪学派中，旅行是将晌礼与晡礼、昏礼与宵礼并礼的正当理由。',
    ],
  },
  ozetAcik: '开启 · {mezhep}',
  ozetKapali: '关闭',
  baglantiAcilamadi: '无法打开链接。检查您的网络连接。',
  ikametGuncellendi: '您的居住地已更新',
  ikametKaydedilemedi: '无法保存您的居住地',
  kartiKapatin: '关闭旅行卡片',
  burasiEvimErisim: '这里是我的家，保存为我的居住地',
  burasiEvim: '这里是家',
  diyanetteOkuyunErisim: '在浏览器中阅读 Diyanet 的教法意见',
  diyanetteOkuyun: '在 Diyanet 阅读',
  sayfa: {
    kayitliKonum: '已保存的位置',
    henuzKaydedilmedi: '尚未保存——您的第一个位置将作为居住地',
    buradasiniz: '您现在在这里',
    uzaktasiniz: '您现在距离直线约{km}公里',
    konumBilinmiyor: '尚不知道您的位置；先选择一个位置',
    giris:
      '当您距居住地约{km}公里时，主屏幕上会出现一张简短的信息卡片，概述 Diyanet 的教法意见。每次旅行只出现一次，不发送通知。',
    bilgiKarti: '信息卡片',
    kartBaslik: '旅行信息卡片',
    gosterilir: '在主屏幕上显示',
    gosterilmez: '不显示',
    mezhepNotu: '卡片遵循您的学派；可在 设置 › 礼拜时间 中选择。',
    ikametYeri: '居住地',
    ikametYapErisim: '将当前位置保存为居住地',
    ikametYap: '将当前位置设为居住地',
    kaynaklar: '资料来源（Diyanet 宗教事务最高委员会）',
    kaynakErisim: '{etiket}。在浏览器中打开',
    /** Not shown outside Turkish (Türkiye-only service). */
    fetvaHatti: '如有疑问，可拨打 Diyanet 的190教法热线。',
  },
};
