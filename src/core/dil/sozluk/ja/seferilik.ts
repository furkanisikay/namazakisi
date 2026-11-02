import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'ハナフィー派', safii: 'シャーフィイー派' },
  kaynaklar: {
    vatan: '旅行における本拠地、居住地、一時滞在地（トルコ語）',
    cem: '礼拝をまとめて行う（ジャムウ）ことはできますか（トルコ語）',
    baslangic: '旅行はいつ始まりますか（トルコ語）',
    ziyaret: '親の住む町を訪ねる人は旅行者ですか（トルコ語）',
  },
  bilgiNotu:
    'これは情報であり、法的判断ではありません。旅行者に当たるかどうかは、旅の目的と期間、そしてご自身の意図によります。',
  baslik: '旅行中のようです',
  mesafeSatiri: '居住地から直線距離で約{km}kmです。Diyanetが{mezhep}について伝えている内容：',
  maddeler: {
    hanefi: [
      'ハナフィー派では、旅行（サファル）の距離は約90kmです。目的地での滞在が15日未満の予定であれば旅行者に当たります。',
      '旅行者は4ラクアの義務の礼拝を2ラクアで行います（短縮、カスル）。',
      'ハナフィー派では、2つの礼拝をまとめて行う（ジャムウ）のはハッジ中のアラファとムズダリファのみです。Diyanetは、旅行のような重大な理由がある場合は他の学派の見解に従ってもよいとも伝えています。',
    ],
    safii: [
      'シャーフィイー派でも旅行の距離は約90kmです。到着日と出発日を除いて目的地での滞在が4日未満であれば、旅行の規定が続きます。',
      '旅行者は4ラクアの義務の礼拝を2ラクアで行います（短縮、カスル）。',
      'シャーフィイー派では、旅行はズフルとアスル、マグリブとイシャーをまとめて行う（ジャムウ）正当な理由です。',
    ],
  },
  ozetAcik: 'オン・{mezhep}',
  ozetKapali: 'オフ',
  baglantiAcilamadi: 'リンクを開けませんでした。インターネット接続を確認してください。',
  ikametGuncellendi: '居住地を更新しました',
  ikametKaydedilemedi: '居住地を保存できませんでした',
  kartiKapatin: '旅行カードを閉じる',
  burasiEvimErisim: 'ここが自宅です。居住地として保存します',
  burasiEvim: 'ここが自宅',
  diyanetteOkuyunErisim: 'Diyanetのファトワーをブラウザーで読む',
  diyanetteOkuyun: 'Diyanetで読む',
  sayfa: {
    kayitliKonum: '保存した場所',
    henuzKaydedilmedi: 'まだ保存されていません。最初の位置が居住地になります',
    buradasiniz: '現在ここにいます',
    uzaktasiniz: '現在、直線距離で約{km}km離れています',
    konumBilinmiyor: '現在地がまだ分かりません。先に場所を選んでください',
    giris:
      '居住地から約{km}km離れると、Diyanetのファトワーをまとめた短い情報カードがホーム画面に表示されます。カードは1回の旅につき1度だけ表示され、通知は送りません。',
    bilgiKarti: '情報カード',
    kartBaslik: '旅行の情報カード',
    gosterilir: 'ホーム画面に表示',
    gosterilmez: '表示しない',
    mezhepNotu: 'カードは選択した法学派に従います。設定 › 礼拝時間 で選べます。',
    ikametYeri: '居住地',
    ikametYapErisim: '現在地を居住地として保存します',
    ikametYap: '現在地を居住地にする',
    kaynaklar: '出典（Diyanet宗教最高評議会）',
    kaynakErisim: '{etiket}。ブラウザーで開きます',
    /** Not shown outside Turkish (Türkiye-only service). */
    fetvaHatti: '質問がある場合は、Diyanetの190番ファトワー窓口に電話できます。',
  },
};
