import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: '您的连续记录正在延续',
    enUzun: cogul({ other: '最长连续记录: {n}天' }),
    gunBuyuk: cogul({ other: '天' }),
    sonrakiHedef: '下一个目标: 第{hedef}天（{durum}）',
    kalanGun: cogul({ other: '还剩{n}天' }),
    tamamlandi: '已完成',
    paylasErisim: '分享您的进度',
    paylasBuyuk: '分享您的进度',
  },

  hedefler: {
    ilk_adim: { ad: '第一周', aciklama: '连续7天不间断礼拜', cumle: '第一周' },
    aliskanlik_ustasi: { ad: '习惯大师', aciklama: '21天 - 养成习惯的阶段', cumle: '习惯大师' },
    kararlilik: { ad: '坚定', aciklama: '60天不间断', cumle: '坚定' },
    efsane: { ad: '传奇', aciklama: '90天 - 非凡的毅力', cumle: '传奇' },
  },

  /** 经典等级名称，按含义译出。 */
  seviyeler: ['初学者', '求知者', '行道者', '追随者', '明悟者', '哈菲兹', '完美者'],

  rozetler: {
    ilk_adim: { ad: '第一步', aciklama: '您完成了第一周。', kosul: '连续记录7天' },
    aliskanlik_ustasi: {
      ad: '习惯大师',
      aciklama: '21天 - 养成习惯的阶段已完成。',
      kosul: '连续记录21天',
    },
    kararlilik: { ad: '坚定者', aciklama: '您连续60天不间断礼拜。', kosul: '连续记录60天' },
    efsane: { ad: '传奇', aciklama: '90天 - 您展现了非凡的毅力。', kosul: '连续记录90天' },
    toparlanma_ustasi: {
      ad: '恢复大师',
      aciklama: '您完成了3次恢复模式。',
      kosul: '恢复3次',
    },
    mukemmeliyetci: { ad: '完美主义者', aciklama: '您连续30天五番礼拜全部完成。', kosul: '30天五番全礼' },
    yuz_namaz: { ad: '100番礼拜', aciklama: '您累计礼拜100番。', kosul: '礼拜100番' },
    bin_namaz: { ad: '1000番礼拜', aciklama: '您累计礼拜1000番。', kosul: '礼拜1000番' },
  },

  rozetSeviyeleri: { bronz: '铜', gumus: '银', altin: '金', elmas: '钻石' },

  gunBitis: {
    erken: '适合早睡的人',
    varsayilan: '默认 - 多数地方在晨礼之前',
    gec: '适合晚睡的人',
  },

  kutlama: {
    rozetEklendi: '🏅 已加入您的徽章收藏',
    paylasin: '分享',
    rozetBaslik: '愿真主使之持久',
    rozetMesaj: '您获得了“{ad}”徽章。',
    hedefBaslik: cogul({ other: '{n}天' }),
    hedefMesaj: '您完成了“{ad}”目标。愿真主使之持久。',
    yeniRank: '新等级: {rank}',
    seviyeBaslik: '您的新等级',
    seviyeMesaj: '您现在以“{rank}”继续前行。愿真主使之持久。',
    toparlanmaBaslik: '您的连续记录已恢复',
    toparlanmaMesaj: cogul({
      other: '您{n}天的连续记录从中断处继续。愿真主赐予坚定。',
    }),
    enUzunBaslik: '您最长的连续记录',
    enUzunMesaj: cogul({
      other: '{n}天: 这是您迄今最长的连续记录。愿真主使之持久。',
    }),
  },

  sekme: {
    hataOkunamadi: '目前无法读取您过去的记录。',
    yenidenErisim: '重新加载连续记录数据',
    yenidenDeneyin: '重试',
    yukleniyor: '正在加载您的连续记录数据...',
    gunlukSeri: '天连续记录',
    rekor: '纪录',
    sozErisim: '{metin} 来源: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: '下一个目标',
    tumu: '您已完成所有徽章',
    kalan: cogul({ other: '{ad}徽章: 还剩{n}天' }),
    tumuErisim: '您已完成所有徽章: 念珠已满。',
    erisim: '{ad}徽章: 已完成{n}天，共{hedef}天。',
  },

  gok: {
    gunHarfleri: ['一', '二', '三', '四', '五', '六', '日'],
    erisim: '{ay}。{hedef}，{bes}，{donmus}。{seri}',
    hedefTutuldu: cogul({ other: '{n}天达到目标' }),
    besVakit: cogul({ other: '{n}天五番礼拜全部完成' }),
    dondurulmus: cogul({ other: '{n}天已冻结' }),
    mevcutSeri: cogul({ other: '当前连续记录: {n}天。' }),
  },

  hedefAyar: {
    azalt: '减少',
    deger: '数值',
    artir: '增加',
    esik: cogul({ other: '{n}番礼拜' }),
    sifirlaBaslik: '重置连续记录',
    sifirlaMesaj: '您的所有连续记录数据（连续记录、徽章、积分）都将被重置。此操作无法撤销。要继续吗？',
    sifirla: '重置',
    iptal: '取消',
    basarili: '完成',
    sifirlandi: '您的连续记录数据已重置。',
    hedefAyarlari: '目标设置',
    tamGunEsigi: '全天门槛',
    tamGunAciklama: '设置一天至少需要礼几番，这一天才计入连续记录',
    sifirlama: '重置',
    verileriSifirla: '重置连续记录数据',
    verileriSifirlaAlt: '删除所有连续记录、徽章和积分数据',
  },

  rozetKarti: {
    erisim: '{ad}徽章，{durum}',
    kazanildi: '已获得',
    kilitli: '未解锁',
  },

  toparlanma: {
    kartBaslik: '恢复模式',
    kartAltBaslik: '您可以找回连续记录',
    kartMesaj: '您可以从中断处继续您{vurgu}的连续记录。',
    oncekiGun: cogul({ other: '{n}天' }),
    ilerleme: '已完成{tamam}/{hedef}天',
    kalan: cogul({
      other: '再完成{n}天的五番礼拜，您的连续记录就会从中断处继续。',
    }),
    bugun: '完成今天，您的连续记录就会从中断处继续。',
    uyari: '这些天必须连续；如果中间缺了一天，恢复会重新开始。',
    kapatErisim: '关闭恢复详情',
    anladim: '知道了',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: '分享您的进度',
    hazirDegilBaslik: '图片尚未就绪',
    hazirDegilMesaj: '图片尚未就绪。几秒后再试一次。',
    olusturulamadiBaslik: '无法创建图片',
    olusturulamadiMesaj: '创建图片时出现问题。再试一次。',
    kullanilamiyorBaslik: '无法分享',
    kullanilamiyorMesaj: '此设备不支持分享。',
    kapat: '关闭',
    hikaye: '添加到您的快拍',
    platformlar: '可以分享到 Instagram、WhatsApp 等平台。',
    tamam: '好',
    seriEnUzun: cogul({ other: '我最长的连续记录: {n}天' }),
    seriZincir: cogul({ other: '天从未中断' }),
    seriSoz: '“每天一小步，心中大安宁。🔥”',
    rozetYeni: '我获得了新徽章',
    rozetSozleri: [
      '今天我为自己迈出了好的一步。🌟',
      '我坚定地继续前行；这枚徽章属于我。💪',
      '我赶上了早晨的吉庆。🌅',
      '我是这股滋养心灵的潮流中的一员。✨',
      '小小的步伐带来巨大的安宁。🍃',
    ],
    etiketler: {
      rozet_kazanildi: '我获得了新徽章',
      hedef_tamamlandi: '我达成了目标',
      seviye_atlandi: '升级了',
      toparlanma_tamamlandi: '重回正轨',
      en_uzun_seri: '新纪录',
      varsayilan: '成就',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['愿我的主使之持久。🤲', '小小的步伐带来巨大的安宁。🍃', '愿真主赐予我们所有人坚定。🌱'],
      hedef_tamamlandi: ['小小的步伐带来巨大的安宁。🍃', '愿真主使之持久。🤲', '每天再进一步。🌱'],
      seviye_atlandi: ['每天再前进一点；愿真主使之容易。🍃', '愿真主使之持久。🤲', '旅程仍在继续。🌱'],
      toparlanma_tamamlandi: ['重要的不是跌倒，而是站起来。🔄', '愿真主赐予坚定。🤲', '每条路都要靠忍耐走完。🌱'],
      en_uzun_seri: ['每天一小步，心中大安宁。🍃', '愿真主使之持久。🤲', '愿我的主赐予我们所有人坚定。🌱'],
    },
  },
};
