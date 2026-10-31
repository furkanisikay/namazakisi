import type { Sozluk } from '../tr';

/**
 * Basitleştirilmiş Çince vakit adları (QuranEnc `chinese_suliman` 24:58, IslamHouse "五次礼拜的时间",
 * zh.wikipedia "礼拜 (伊斯兰教)"): 晨礼 · 日出 · 晌礼 · 晡礼 · 昏礼 · 宵礼; cuma 主麻 (tek biçim; 聚礼
 * kullanılmaz). Han yazısında büyük/küçük yoktur: `buyuk` ve `kucuk` `adlar` ile aynıdır. Çizelge satırı
 * (`imsakVakti`) fecir adıdır (晨礼), "Imsak" değil.
 * Terimler: namaz 礼拜 · Kıldım "我礼了" (IslamHouse hadis çevirisi) · Kılındı "已礼拜" (türetildi) ·
 * kaza 还补 (Kaza Defteri 还补记录) · nafile 副功拜 · kerahat 禁止礼拜的时间 · kıble 朝向 (başlıkta
 * 礼拜朝向, türetildi) · seri 连续记录 · Namaz Muhafızı 礼拜守护 · hesap yöntemi 计算方法 · kuşluk 杜哈拜 ·
 * teheccüd 夜间拜 · vitir 威特尔拜 · ezan 宣礼 · abdest 小净 · cami 清真寺 · Kâbe 天房 · Allah 真主 ·
 * Kur'an 《古兰经》 (kısa etikette ayraçsız) · seferîlik 旅行 · kasr 短礼 · Camideyim "在清真寺" ·
 * toparlanma 恢复 · Hanefî 哈乃斐 · Şâfiî 沙斐仪 · "Allah kabul etsin" 愿真主准承 (准承: IslamHouse).
 * Hitap: zamir mümkün olduğunca düşer; gerekirse 您 (proje kuralı; Microsoft 你 der). İbadete çağrı
 * zamirsiz kısa emir ("该礼拜了", "谨守拜功"). Arayüzde iki nokta İngilizce ": ". Sayı ile birim
 * arasında boşluk yok ("5分钟"). Rakam Batı (0-9).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: '晨礼', gunes: '日出', ogle: '晌礼', ikindi: '晡礼', aksam: '昏礼', yatsi: '宵礼' },
  buyuk: { imsak: '晨礼', gunes: '日出', ogle: '晌礼', ikindi: '晡礼', aksam: '昏礼', yatsi: '宵礼' },
  kucuk: { imsak: '晨礼', gunes: '日出', ogle: '晌礼', ikindi: '晡礼', aksam: '昏礼', yatsi: '宵礼' },
  imsakVakti: '晨礼',
  cuma: '主麻',
  cumaKucuk: '主麻',
  gunesDogusu: '日出',
  gunesDogusuKucuk: '日出',
  durum: { kilindi: '已礼拜', vaktiGeldi: '时间已到', girmedi: '尚未入时', gecti: '未礼拜' },
  durumKucuk: { kilindi: '已礼拜', vaktiGeldi: '时间已到', girmedi: '尚未入时', gecti: '未礼拜' },
  /** "我礼了" = 用户本人的声明；状态为"已礼拜"。 */
  eylem: { kildim: '我礼了', kilindi: '已礼拜' },
  kerahatVakti: '禁止礼拜的时间',
  isaretle: '标记为已礼拜',
  geriAlEtiketi: '{durum}，点按可撤销',
  geriAlindi: '已取消标记',
};
