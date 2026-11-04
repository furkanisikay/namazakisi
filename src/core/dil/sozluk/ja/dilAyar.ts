import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: '言語 · Language',
  aciklama: 'アプリの言語を選んでください。通知と読み上げにも使われます。',
  grup: 'アプリの言語',
  dilAdlari: { tr: 'トルコ語', en: '英語', id: 'インドネシア語', de: 'ドイツ語', fr: 'フランス語', bs: 'ボスニア語', ru: 'ロシア語', ms: 'マレー語', ar: 'アラビア語', ur: 'ウルドゥー語', es: 'スペイン語', nl: 'オランダ語', sq: 'アルバニア語', hi: 'ヒンディー語', bn: 'ベンガル語', fa: 'ペルシア語', ps: 'パシュトゥー語', ckb: '中央クルド語', ug: 'ウイグル語', az: 'アゼルバイジャン語', uz: 'ウズベク語', kk: 'カザフ語', ky: 'キルギス語', tg: 'タジク語', sw: 'スワヒリ語', ha: 'ハウサ語', am: 'アムハラ語', om: 'オロモ語', so: 'ソマリ語', ff: 'フラ語', yo: 'ヨルバ語', zh: '簡体中国語', ta: 'タミル語', ml: 'マラヤーラム語', th: 'タイ語', ko: '韓国語', vi: 'ベトナム語', pt: 'ポルトガル語', it: 'イタリア語', sv: 'スウェーデン語', uk: 'ウクライナ語', ro: 'ルーマニア語', hr: 'クロアチア語', sr: 'セルビア語', el: 'ギリシャ語', ku: 'クルド語 (Kurmancî)', tk: 'トルクメン語', tt: 'タタール語', sd: 'シンド語', pl: 'ポーランド語', ja: '日本語', gu: 'グジャラート語', bg: 'ブルガリア語', mk: 'マケドニア語', fil: 'フィリピノ語', te: 'テルグ語', kn: 'カンナダ語', mr: 'マラーティー語', pa: 'パンジャブ語 (アラビア文字、パキスタン)', as: 'アッサム語', ne: 'ネパール語', si: 'シンハラ語', km: 'クメール語' },
  cihazDili: 'デバイスの言語',
  cihazDiliKullaniliyor: '現在：{ad}',
  cihazDiliDesteklenmiyor: 'デバイスの言語にはまだ対応していないため、トルコ語を使います。',
  beta: 'ベータ',
  betaAciklama: '{ad}・ベータ',
  notlar: {
    beta: 'ベータ版の翻訳は確認中です。不自然な表現が含まれる場合があります。',
    vakit: '言語を変えても礼拝時間の計算方法は変わりません。',
    nass: 'トルコ語以外の言語では、クルアーンの訳のみを表示します。ハディースの本文はトルコ語の出典に基づくため、表示しません。',
  },
  ozelAnons: {
    baslik: 'ご自分で書いた読み上げ文',
    govde: cogul({
      other: 'ご自分で書いた読み上げ文のうち{n}件が以前の言語のままです。新しい言語の定型文に置き換えますか？',
    }),
    degistir: '定型文に置き換える',
    koru: 'そのままにする',
    degisti: cogul({ other: '{n}件の文を置き換えました。' }),
  },
  vakitAdlari: {
    baslik: '礼拝の名前',
    aciklama: '礼拝時間の呼び方を選んでください。',
    otomatik: '国に合わせる',
    otomatikAciklama: '現在地の国で一般的な呼び方を使います。',
    takimlar: { temel: 'アラビア語の名前', diyanetDe: 'Diyanet（ドイツ語）', turkce: 'トルコ語の名前', magrip: 'マグリブ式の表記', cezayir: 'アルジェリア式の表記', afgan: 'アフガニスタンの名前' },
  },
  yazi: {
    baslik: '文字',
    aciklama: '文章を書き表す文字を選んでください。',
    otomatik: '国に合わせる',
    otomatikAciklama: '現在地の国で一般的な文字を使います。',
    latin: 'ラテン文字',
    kiril: 'キリル文字',
  },
  kaydedilemedi: '言語を保存できませんでした。もう一度お試しください。',
  sihirbazBaglantisi: '言語 · Language',
  sihirbazBaglantisiAciklama: 'アプリの言語を変更',
};
