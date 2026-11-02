import type { Sozluk } from '../tr';

export const kible: Sozluk['kible'] = {
  baslik: 'キブラ',
  yon: {
    hizali: 'キブラの方向を向いています',
    arkada: 'キブラは後ろです。向きを変えてください',
    sagda: 'キブラは右に{derece}°です',
    solda: 'キブラは左に{derece}°です',
  },
  harf: { kuzey: '北', dogu: '東', guney: '南', bati: '西' },
  sekme: {
    pusula: 'コンパス',
    pusulaErisim: 'コンパスモード',
    pusulaAciklama: 'カアバの印が上部の切り込みに重なると、キブラの方向を向いています。',
    kamera: 'カメラ',
    kameraErisim: 'カメラモード',
    kameraAciklama: 'スマートフォンを縦に持つと、キブラの方向にカアバの印が表示されます。',
  },
  sayfa: {
    baslatiliyor: 'コンパスを起動中…',
    izinKapali: '位置情報の許可がオフです。方向を調べるには現在地が必要です。',
  },
  hata: {
    izinGerekli: 'キブラの方向を調べるには位置情報の許可が必要です。',
    konumServisi: '位置情報サービスに接続できません。デバイスの位置情報の設定を確認してください。',
    baslatilamadi: 'キブラのサービスを起動できませんでした。',
  },
  pusula: {
    ufuk: '地平線',
    konumAliniyor: '現在地を取得中…',
    hazirlaniyor: 'コンパスを準備中…',
    kuzeydenAci: 'キブラは北から{derece}°',
    kabeUzakta: 'カアバまで{mesafe}',
    kuzeydenSaatYonu: '北から時計回り',
    kuzeyden: '北から{derece}°',
    kabeUzaktaKuzeyden: 'カアバまで{mesafe}、北から{derece}°',
    pusulaErisim: 'キブラのコンパス。{cumle}',
    pusulaYok: 'このデバイスにはコンパスがありません。北を基準にした方向を表示しています。',
    kayiyorsa: '方向がずれる場合は、スマートフォンを空中で8の字に動かしてください。',
    kamerayla: 'カメラで見る',
  },
  kamera: {
    pusulayiKullanin: 'コンパスを使う',
    kullanilamiyorBaslik: 'このスマートフォンではカメラ表示を使えません',
    kullanilamiyorMetin:
      'スマートフォンを縦に持つと、センサーが正確な方向を示せません。コンパスでは引き続き正しい方向を表示できます。',
    izinBaslik: 'カメラでキブラを見る',
    izinMetin:
      'スマートフォンを縦に持って周りを見回すと、キブラの方向にカアバの印が表示されます。カメラの許可が必要です。映像は記録されず、スマートフォンの外に出ることはありません。',
    kamerayiAcin: 'カメラをオンにする',
    izinKapaliBaslik: 'カメラの許可がオフです',
    izinKapaliMetin: 'カメラ表示を使うには、設定でカメラへのアクセスを許可してください。コンパスは許可がなくても使えます。',
    ayarlariAcin: '設定を開く',
    acilamadiBaslik: 'カメラを開けませんでした',
    acilamadiMetin: '今はカメラを使えません。コンパスでキブラを探せます。',
    hesaplaniyor: '方向を調べています…',
    dikTutun: 'スマートフォンを縦に持ってください',
  },
  kalibrasyon: {
    tesekkurErisim: 'ありがとうございます。方向がより正確になりました',
    tesekkur: 'ありがとうございます。方向がより正確になりました ✓',
    baslik: 'コンパスの調整',
    sallayin: 'スマートフォンを空中で8の字に動かしてください。',
    metal: '金属製の物や磁石付きのケースから離れてください。',
    dogruluk: '精度',
    simdiDegil: '今はしない',
  },
};
