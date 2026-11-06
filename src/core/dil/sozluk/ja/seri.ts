import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Seri 連続記録, toparlanma 立て直し. Paylaşım metinleri kullanıcının ağzından; "！" ve övgü yok. */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: '連続記録が続いています',
    enUzun: cogul({ other: '最長の連続記録：{n}日' }),
    gunBuyuk: cogul({ other: '日' }),
    sonrakiHedef: '次の目標：{hedef}日目（{durum}）',
    kalanGun: cogul({ other: '残り{n}日' }),
    tamamlandi: '達成しました',
    paylasErisim: '進捗を共有',
    paylasBuyuk: '進捗を共有',
  },

  hedefler: {
    ilk_adim: { ad: '最初の1週間', aciklama: '7日間続けて礼拝する', cumle: '最初の1週間' },
    aliskanlik_ustasi: { ad: '習慣の達人', aciklama: '21日・習慣が身につく期間', cumle: '習慣の達人' },
    kararlilik: { ad: '揺るぎなさ', aciklama: '60日間続けて', cumle: '揺るぎなさ' },
    efsane: { ad: 'レジェンド', aciklama: '90日・たゆまぬ継続', cumle: 'レジェンド' },
  },

  /** Klasik derece adları, harf çevirisiyle (çeviri değil). */
  seviyeler: ['ムブタディー', 'ターリブ', 'サーリク', 'ムリード', 'アーリフ', 'ハーフィズ', 'カーミル'],

  rozetler: {
    ilk_adim: { ad: '最初の一歩', aciklama: '最初の1週間を達成しました。', kosul: '7日連続' },
    aliskanlik_ustasi: {
      ad: '習慣の達人',
      aciklama: '21日・習慣が身につく期間を達成しました。',
      kosul: '21日連続',
    },
    kararlilik: { ad: '揺るぎない人', aciklama: '60日間続けて礼拝しました。', kosul: '60日連続' },
    efsane: { ad: 'レジェンド', aciklama: '90日・たゆまぬ継続を示しました。', kosul: '90日連続' },
    toparlanma_ustasi: {
      ad: '立て直しの達人',
      aciklama: '立て直しモードを3回達成しました。',
      kosul: '立て直し3回',
    },
    mukemmeliyetci: { ad: '完璧主義者', aciklama: '30日間5/5で礼拝しました。', kosul: '5/5の礼拝を30日' },
    yuz_namaz: { ad: '100回の礼拝', aciklama: '合計100回礼拝しました。', kosul: '100回礼拝する' },
    bin_namaz: { ad: '1000回の礼拝', aciklama: '合計1000回礼拝しました。', kosul: '1000回礼拝する' },
  },

  rozetSeviyeleri: { bronz: 'ブロンズ', gumus: 'シルバー', altin: 'ゴールド', elmas: 'ダイヤモンド' },

  gunBitis: {
    erken: '早く寝る方向け',
    varsayilan: '標準・ほとんどの地域でファジュルの前',
    gec: '遅く寝る方向け',
  },

  kutlama: {
    rozetEklendi: '🏅 バッジのコレクションに追加しました',
    paylasin: '共有',
    rozetBaslik: 'アッラーが続けさせてくださいますように',
    rozetMesaj: '「{ad}」のバッジを獲得しました。',
    hedefBaslik: cogul({ other: '{n}日' }),
    hedefMesaj: '「{ad}」の目標を達成しました。アッラーが続けさせてくださいますように。',
    yeniRank: '新しい段階：{rank}',
    seviyeBaslik: '新しいレベル',
    seviyeMesaj: 'これからは「{rank}」として続けます。アッラーが続けさせてくださいますように。',
    toparlanmaBaslik: '連続記録が戻りました',
    toparlanmaMesaj: cogul({
      other: '{n}日の連続記録が途切れた所から続きます。アッラーが揺るぎなさを授けてくださいますように。',
    }),
    enUzunBaslik: '最長の連続記録',
    enUzunMesaj: cogul({
      other: '{n}日：これまでで最長の連続記録です。アッラーが続けさせてくださいますように。',
    }),
  },

  sekme: {
    hataOkunamadi: '過去の記録を今は読み込めませんでした。',
    yenidenErisim: '連続記録のデータを再読み込み',
    yenidenDeneyin: '再試行',
    yukleniyor: '連続記録のデータを読み込み中…',
    gunlukSeri: '日連続',
    rekor: '最高記録',
    sozErisim: '{metin} 出典：{kaynak}',
  },

  tesbih: {
    varsayilanHedef: '次の目標',
    tumu: 'すべてのバッジを獲得しました',
    kalan: cogul({ other: '{ad}のバッジ：残り{n}日' }),
    tumuErisim: 'すべてのバッジを獲得しました。タスビーフが満ちています。',
    erisim: '{ad}のバッジ：{hedef}日中{n}日達成。',
  },

  gok: {
    gunHarfleri: ['月', '火', '水', '木', '金', '土', '日'],
    erisim: '{ay}。{hedef}、{bes}、{donmus}。{seri}',
    hedefTutuldu: cogul({ other: '目標を達成した日：{n}日' }),
    besVakit: cogul({ other: '5回すべて礼拝した日：{n}日' }),
    dondurulmus: cogul({ other: '凍結した日：{n}日' }),
    mevcutSeri: cogul({ other: '現在の連続記録：{n}日。' }),
  },

  hedefAyar: {
    azalt: '減らす',
    deger: '値',
    artir: '増やす',
    esik: cogul({ other: '{n}回の礼拝' }),
    sifirlaBaslik: '連続記録をリセット',
    sifirlaMesaj: '連続記録のすべてのデータ（連続記録、バッジ、ポイント）がリセットされます。元に戻せません。続けますか？',
    sifirla: 'リセット',
    iptal: 'キャンセル',
    basarili: '完了',
    sifirlandi: '連続記録のデータをリセットしました。',
    hedefAyarlari: '目標の設定',
    tamGunEsigi: '1日の達成基準',
    tamGunAciklama: 'その日が連続記録に数えられるために必要な、1日の最低礼拝回数を設定します',
    sifirlama: 'リセット',
    verileriSifirla: '連続記録のデータをリセット',
    verileriSifirlaAlt: '連続記録、バッジ、ポイントのデータをすべて削除します',
  },

  rozetKarti: {
    erisim: '{ad}のバッジ、{durum}',
    kazanildi: '獲得済み',
    kilitli: 'ロック中',
  },

  toparlanma: {
    kartBaslik: '立て直しモード',
    kartAltBaslik: '連続記録を取り戻せます',
    kartMesaj: '{vurgu}の連続記録を途切れた所から続けられます。',
    oncekiGun: cogul({ other: '{n}日' }),
    ilerleme: '{hedef}日中{tamam}日達成',
    kalan: cogul({
      other: 'あと{n}日5回の礼拝をすべて終えると、連続記録が途切れた所から続きます。',
    }),
    bugun: '今日を終えると、連続記録が途切れた所から続きます。',
    uyari: '日は連続している必要があります。途中で1日でも抜けると、立て直しは最初からになります。',
    kapatErisim: '立て直しの詳細を閉じる',
    anladim: 'わかりました',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: '進捗を共有',
    hazirDegilBaslik: '画像の準備ができていません',
    hazirDegilMesaj: '画像の準備がまだできていません。数秒後にもう一度お試しください。',
    olusturulamadiBaslik: '画像を作成できませんでした',
    olusturulamadiMesaj: '画像の作成中に問題が発生しました。もう一度お試しください。',
    kullanilamiyorBaslik: '共有を使えません',
    kullanilamiyorMesaj: 'このデバイスでは共有を使えません。',
    kapat: '閉じる',
    hikaye: 'ストーリーに追加',
    platformlar: 'Instagram、WhatsAppなどで共有できます。',
    tamam: 'OK',
    seriEnUzun: cogul({ other: '最長の連続記録：{n}日' }),
    seriZincir: cogul({ other: '日、途切れずに続けました' }),
    seriSoz: '「毎日の小さな一歩が、心に大きな安らぎを。🔥」',
    rozetYeni: '新しいバッジを獲得しました',
    rozetSozleri: [
      '今日、自分のために良い一歩を踏み出しました。🌟',
      '決意を持って続けています。このバッジは私のものです。💪',
      '朝の恵みに間に合いました。🌅',
      '心に良いこの流れの一部になっています。✨',
      '小さな一歩が大きな安らぎをもたらします。🍃',
    ],
    etiketler: {
      rozet_kazanildi: '新しいバッジを獲得しました',
      hedef_tamamlandi: '目標を達成しました',
      seviye_atlandi: 'レベルアップ',
      toparlanma_tamamlandi: '軌道に戻りました',
      en_uzun_seri: '新記録',
      varsayilan: '達成',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['主が続けさせてくださいますように。🤲', '小さな一歩が大きな安らぎをもたらします。🍃', 'アッラーが私たちみなに揺るぎなさを授けてくださいますように。🌱'],
      hedef_tamamlandi: ['小さな一歩が大きな安らぎをもたらします。🍃', 'アッラーが続けさせてくださいますように。🤲', '毎日もう一歩。🌱'],
      seviye_atlandi: [
        '毎日少しずつ先へ。アッラーが易しくしてくださいますように。🍃',
        'アッラーが続けさせてくださいますように。🤲',
        '旅は続きます。🌱',
      ],
      toparlanma_tamamlandi: [
        '大切なのは倒れないことではなく、立ち上がることです。🔄',
        'アッラーが揺るぎなさを授けてくださいますように。🤲',
        'どの道も忍耐とともに歩むものです。🌱',
      ],
      en_uzun_seri: [
        '毎日の小さな一歩が、心に大きな安らぎを。🍃',
        'アッラーが続けさせてくださいますように。🤲',
        '主が私たちみなに揺るぎなさを授けてくださいますように。🌱',
      ],
    },
  },
};
