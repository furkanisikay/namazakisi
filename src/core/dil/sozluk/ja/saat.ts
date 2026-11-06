import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'スマートフォンで',
    telefonAciklama: 'ファジュルのアラームとタハッジュドの目覚ましがスマートフォンで鳴ります。',
    saatBaslik: 'ウォッチで静かに',
    saatAciklama:
      '手首だけが振動するので、隣で寝ている人を起こしません。ウォッチで止めないと、{dk}分後に予備としてスマートフォンが鳴ります。ウォッチにNamaz Akışıが入っていないか最新でない場合は、毎朝スマートフォンが{dk}分遅れて鳴ります。',
    saatAciklamaIos:
      '手首だけが振動するので、隣で寝ている人を起こしません。ウォッチで止めないと、{dk}分後に予備としてiPhoneが鳴ります。',
    ikisiBaslik: '両方で',
    ikisiAciklama: 'ウォッチとスマートフォンが同時に鳴ります。ウォッチで止めるとスマートフォンも止まります。',
    ikisiAciklamaIos: 'ウォッチとiPhoneが同時に鳴ります。ウォッチで止めるとiPhoneも止まります。',
  },
  anons: {
    otomatikBaslik: 'スマートフォンで、離れているときはウォッチで',
    otomatikAciklama:
      'スマートフォンが手元にあるときはスマートフォンが読み上げ、ウォッチはあえて黙ります（2台が同じ文を読まないように）。スマートフォンが離れているときはウォッチが読み上げます。',
    saatBaslik: 'ウォッチのみ',
    saatAciklama:
      '常にウォッチが読み上げ、スマートフォンは黙ります。ウォッチの充電中、スマートフォンと接続していないとき、またはNamaz Akışıが入っていないときは何も読み上げません。それを避けたい場合は、最初の選択肢を使ってください。',
    telefonBaslik: 'スマートフォンのみ',
    telefonAciklama: 'ウォッチは読み上げません。',
  },
  ayarlar: {
    secenekErisim: '{baslik}。{aciklama}',
    girisIos:
      'Apple WatchにNamaz Akışıが入っていれば、iPhoneと役割を分担します。ここでは目覚ましを鳴らす場所を選びます。',
    giris:
      'ウォッチにNamaz Akışıが入っていれば、スマートフォンと役割を分担します。ここでは目覚ましを鳴らす場所と、お知らせを読み上げる場所を選びます。',
    uyandirmaBaslik: '目覚ましをどこで鳴らしますか？',
    uyandirmaNotu:
      '目覚ましとは、「時間が終わる前に」のリマインダーでファジュルにオンにする本物のアラームと、任意の礼拝でオンにするタハッジュドの目覚ましのことです。',
    uyandirmaNotuIos:
      'watchOSでは、ウォッチのアプリが開いている間しか静かなアラームを設定できません。1日に1回ウォッチでNamaz Akışıを開くと、次の目覚ましがそのとき設定されます。ウォッチの充電中やアプリを開かなかった場合は、iPhoneの予備が鳴ります。',
    uyandirmaNotuAndroid: '充電中のウォッチは鳴りません。代わりにスマートフォンが鳴ります。',
    muhafizAyarlari: '「時間が終わる前に」の設定を開く',
    nafileAyarlari: '任意の礼拝の設定を開く',
    bilektenBaslik: '手首からできること',
    bilektenIos: [
      'iPhoneが離れているときは、リマインダーがウォッチで鳴ります。両方では鳴りません。',
      '礼拝したものを手首から記録できます。iPhoneが記録を保存します。',
      'Digital Crownでタスビーフを数え、ウォッチでキブラを探せます。',
    ],
    anonsBaslik: '読み上げをどこで行いますか？',
    anonsNotu:
      '読み上げがオンのリマインダーだけが読み上げられます。2台が同じ文を同時に読むことはありません。モスクにいるときや礼拝モードがオンのときも、ウォッチは黙ります。ウォッチにスピーカー、音声読み上げエンジン、またはアプリの言語の音声がない場合は、振動のみです。ウォッチの音は、Namaz Akışıのウォッチアプリの「音をテスト」ですぐに確かめられます。',
    bilekten: [
      'ウォッチのボタンで礼拝モードをオン・オフできます（礼拝時間の終わりまで、最長30分）。',
      'モスクではウォッチに状態が表示され、「ここはモスクではありません」や「モスクにいますか？」に手首から答えられます。',
      'ウォッチに収まらない画面（やり直し記録、モスクにいます、設定）は「スマートフォンで開く」でスマートフォンに開きます。',
    ],
    namazModuNotu: 'ウォッチから礼拝モードをオンにするには、まずスマートフォンで一度オンにしてください。',
    namazModuAyarlari: '礼拝モードの設定を開く',
  },
  sayfa: {
    akilliSaat: 'スマートウォッチ',
    appleWatchOzet: '目覚ましを鳴らす場所',
    saatOzet: '目覚ましと読み上げの場所',
    canliEtkinlikler: 'ライブアクティビティ',
    canliSayaclar: 'ライブカウントダウン',
    geriSayim: 'カウントダウン',
    gelismisErisim: '詳細設定。オートメーションと「礼拝しました」を記録するアプリ',
    gelismis: '詳細設定',
    otomasyonlar: 'オートメーション',
    otomasyonBaslik: 'オートメーションで使う',
    otomasyonOzet: 'Samsungのモードとルーチン、Tasker、MacroDroid',
    kildimBaslik: '「礼拝しました」を記録するアプリ',
    kildimOzet: '許可したアプリ',
  },
};
