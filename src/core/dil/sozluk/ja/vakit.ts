import type { Sozluk } from '../tr';

/**
 * Japonca vakit adları HadeethEnc ja (65000 "ファジュル、ズフル、アスル、マグリブ、イシャー") ve QuranEnc
 * `japanese_saeedsato` (15:73 "日の出") yazımıdır: ファジュル · 日の出 · ズフル · アスル · マグリブ · イシャー
 * (mealin "イシャーゥ"su değil). Cuma Tokyo Camii'nin "金曜礼拝"ı. Japoncada büyük/küçük harf yok:
 * `buyuk` ve `kucuk` `adlar` ile aynıdır. Çizelge satırı (`imsakVakti`) fecir adıdır (ファジュル).
 * Terimler: namaz 礼拝 · Kıldım "礼拝しました" (HadeethEnc 65097 "礼拝した"nın です/ます biçimi) · Kılındı
 * "礼拝済み" (türetildi) · kaza "やり直し" (IslamHouse ja "やり損ねた…のやり直し"; isim terimi
 * DOĞRULANMADI) · nafile 任意の礼拝 (HadeethEnc) · kerahat "礼拝が禁じられた時間" (IslamHouse ja
 * "サラーが禁じられる時間帯") · kıble キブラ · cami モスク (ana oturum kararı) · Allah アッラー ·
 * Kur'an クルアーン · abdest ウドゥー · ezan アザーン · kuşluk ドゥハー · teheccüd タハッジュド · vitir
 * ウィトル (IslamHouse ja) · seri 連続記録 · Namaz Muhafızı 礼拝見守り · hesap yöntemi 計算方法 ·
 * Hanefî ハナフィー派 · Şâfiî シャーフィイー派 · "Allah kabul etsin" アッラーが受け入れてくださいますように
 * (2:127 "お受け入れ下さい"dan türetildi).
 * Hitap: zamirsiz です/ます; istek "〜してください", düğme isim kalıbı (Microsoft ja). İbadete çağrı da
 * kibar kısa istek ("礼拝してください", "礼拝に立ってください"); 〜しなさい ve "！" yok. Tam genişlik
 * noktalama (。、「」（）：). Sayı ile birim bitişik ("5分"). Rakam Batı (0-9).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'ファジュル', gunes: '日の出', ogle: 'ズフル', ikindi: 'アスル', aksam: 'マグリブ', yatsi: 'イシャー' },
  buyuk: { imsak: 'ファジュル', gunes: '日の出', ogle: 'ズフル', ikindi: 'アスル', aksam: 'マグリブ', yatsi: 'イシャー' },
  kucuk: { imsak: 'ファジュル', gunes: '日の出', ogle: 'ズフル', ikindi: 'アスル', aksam: 'マグリブ', yatsi: 'イシャー' },
  imsakVakti: 'ファジュル',
  cuma: '金曜礼拝',
  cumaKucuk: '金曜礼拝',
  gunesDogusu: '日の出',
  gunesDogusuKucuk: '日の出',
  durum: { kilindi: '礼拝済み', vaktiGeldi: '礼拝の時間', girmedi: 'まだ時間前', gecti: '未礼拝' },
  durumKucuk: { kilindi: '礼拝済み', vaktiGeldi: '礼拝の時間', girmedi: 'まだ時間前', gecti: '未礼拝' },
  /** "礼拝しました" = kişinin kendi beyanı; durum etiketi "礼拝済み". */
  eylem: { kildim: '礼拝しました', kilindi: '礼拝済み' },
  kerahatVakti: '礼拝が禁じられた時間',
  isaretle: '礼拝済みにする',
  geriAlEtiketi: '{durum}、タップで取り消し',
  geriAlindi: '取り消しました',
};
