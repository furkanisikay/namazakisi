import React from 'react';
import { act } from 'react-test-renderer';
import renderer from 'react-test-renderer';

// react-native-svg icin repoda mock YOK (bu, projenin src/ icindeki ILK
// react-native-svg kullanimi) — per-file mock yaziyoruz (repo deseni).
//
// Her bilesen duz bir STRING'e indirgenir (fonksiyon/bilesen SARMALAYICI
// DEGIL): react-test-renderer herhangi bir string'i genel bir host dugumu
// olarak kabul eder ve JSX'teki cocuklari OTOMATIK render eder — bu yuzden
// Svg/G gibi konteynerler icin ayrica "children'i ilet" mantigi yazmaya
// GEREK YOK, host dugumler zaten boyle calisir. Bu ayrica su tuzagi da
// bastan onler: mock fabrikasi icinde React.createElement(...) CAGIRMAYIN —
// nativewind'in cssInterop babel eklentisi createElement cagrilarini
// yakalayip paylasilan bir '_ReactNativeCSSInterop' yardimcisina referans
// enjekte ediyor; bu referans jest'in hoisted mock fabrikasina "scope disi"
// sayilip "The module factory of jest.mock() is not allowed to reference
// any out-of-scope variables" hatasi veriyor (denendi, dogrulandi). Duz
// string export bu sorunu tamamen ortadan kaldirir.
jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Svg: 'Svg',
  G: 'G',
  Defs: 'Defs',
  RadialGradient: 'RadialGradient',
  LinearGradient: 'LinearGradient',
  Path: 'Path',
  Circle: 'Circle',
  Ellipse: 'Ellipse',
  Line: 'Line',
  Rect: 'Rect',
  Stop: 'Stop',
  Text: 'Text',
}));

jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    metinIkincil: '#757575',
    birincil: '#4CAF50',
    birincilMetin: '#FFFFFF',
  }),
}));

import { Tesbih } from '../Tesbih';
const { Circle, Ellipse } = require('react-native-svg');

const BONCUK_YARICAP = 4.6;

function boncukDaireleriBul(tree: renderer.ReactTestRenderer) {
  return tree.root.findAllByType(Circle).filter((d) => d.props.r === BONCUK_YARICAP);
}

function doluBoncukSayisi(tree: renderer.ReactTestRenderer): number {
  return boncukDaireleriBul(tree).filter((d) => d.props.fill !== 'none').length;
}

function metniBul(tree: renderer.ReactTestRenderer, parca: string): string | undefined {
  return tree.root
    .findAllByType(require('react-native').Text)
    .map((d) => (Array.isArray(d.props.children) ? d.props.children.join('') : d.props.children))
    .find((metin) => typeof metin === 'string' && metin.includes(parca));
}

function erisimEtiketiniAl(tree: renderer.ReactTestRenderer): string {
  return tree.root.findByProps({ accessibilityRole: 'progressbar' }).props.accessibilityLabel;
}

function render(ui: React.ReactElement): renderer.ReactTestRenderer {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(ui);
  });
  return tree;
}

describe('Tesbih', () => {
  test('21 günlük hedefte (Alışkanlık ustası) tam 21 boncuk render eder', () => {
    const tree = render(<Tesbih mevcutSeri={15} hedefGun={21} hedefAdi="Alışkanlık ustası" />);
    expect(boncukDaireleriBul(tree)).toHaveLength(21);
  });

  test('60 günlük hedefte 33 boncuğa (üst sınır) düşer', () => {
    const tree = render(<Tesbih mevcutSeri={40} hedefGun={60} hedefAdi="Kararlılık" />);
    expect(boncukDaireleriBul(tree)).toHaveLength(33);
  });

  test('90 günlük hedefte de 33 boncuğa düşer (aynı üst sınır)', () => {
    const tree = render(<Tesbih mevcutSeri={10} hedefGun={90} hedefAdi="Efsane" />);
    expect(boncukDaireleriBul(tree)).toHaveLength(33);
  });

  test('dolu boncuk sayısı 1 gün = 1 boncuk eşiğinde (hedef<=33) mevcutSeri ile birebir örtüşür', () => {
    // hedefGun=7 -> boncukSayisi=7, gunPerBoncuk=ceil(7/7)=1 -> dolu=min(7,3)=3.
    const tree = render(<Tesbih mevcutSeri={3} hedefGun={7} hedefAdi="İlk hafta" />);
    expect(doluBoncukSayisi(tree)).toBe(3);
    expect(boncukDaireleriBul(tree)).toHaveLength(7);
  });

  test('dolu boncuk sayısı boncuk-başına-gün oranına göre hesaplanır (hedef>33)', () => {
    // hedefGun=60 -> boncukSayisi=33, gunPerBoncuk=ceil(60/33)=2 -> dolu=min(33, floor(40/2)=20)=20.
    const tree = render(<Tesbih mevcutSeri={40} hedefGun={60} hedefAdi="Kararlılık" />);
    expect(doluBoncukSayisi(tree)).toBe(20);
  });

  test('hedefGun null iken (tüm rozetler kazanılmış) tesbih tam dolu görünür ve doğru metni taşır', () => {
    const tree = render(<Tesbih mevcutSeri={120} hedefGun={null} />);
    expect(boncukDaireleriBul(tree)).toHaveLength(33);
    expect(doluBoncukSayisi(tree)).toBe(33);
    expect(metniBul(tree, 'Tüm rozetleri tamamladınız')).toBe('Tüm rozetleri tamamladınız');
    expect(erisimEtiketiniAl(tree)).toBe('Tüm rozetleri tamamladınız: tesbih tamamen dolu.');
  });

  test('erişim etiketi referanstaki biçimle birebir aynıdır', () => {
    const tree = render(<Tesbih mevcutSeri={15} hedefGun={21} hedefAdi="Alışkanlık ustası" />);
    expect(erisimEtiketiniAl(tree)).toBe(
      "Alışkanlık ustası rozeti: 21 günün 15'i tamamlandı."
    );
  });

  test('durak diski sayısı 21 boncukta 2, 33 boncukta da 2 (son gruptan sonra durak konmaz)', () => {
    const yirmiBir = render(<Tesbih mevcutSeri={15} hedefGun={21} hedefAdi="Alışkanlık ustası" />);
    expect(yirmiBir.root.findAllByType(Ellipse)).toHaveLength(2);

    const otuzUc = render(<Tesbih mevcutSeri={10} hedefGun={60} hedefAdi="Kararlılık" />);
    expect(otuzUc.root.findAllByType(Ellipse)).toHaveLength(2);
  });

  test('alt yazı kalan gün sayısını gösterir', () => {
    const tree = render(<Tesbih mevcutSeri={15} hedefGun={21} hedefAdi="Alışkanlık ustası" />);
    expect(metniBul(tree, 'gün kaldı')).toBe('Alışkanlık ustası rozetine 6 gün kaldı');
  });

  test('erişim etiketindeki iyelik eki ünlü uyumuna göre seçilir (3 -> ü, 40 -> ı, 20 -> si)', () => {
    // hedefGun=7 -> boncukSayisi=7, gunPerBoncuk=1, dolu=min(7,3)=3 -> "3'ü".
    const uc = render(<Tesbih mevcutSeri={3} hedefGun={7} hedefAdi="İlk hafta" />);
    expect(erisimEtiketiniAl(uc)).toBe("İlk hafta rozeti: 7 günün 3'ü tamamlandı.");

    // hedefGun=60 -> tamamlanan=min(40,60)=40 -> "40'ı".
    const kirk = render(<Tesbih mevcutSeri={40} hedefGun={60} hedefAdi="Kararlılık" />);
    expect(erisimEtiketiniAl(kirk)).toBe("Kararlılık rozeti: 60 günün 40'ı tamamlandı.");

    // hedefGun=90 -> tamamlanan=min(20,90)=20 -> "20'si" (ünlüyle biten okunuş, "s" tamponu).
    const yirmi = render(<Tesbih mevcutSeri={20} hedefGun={90} hedefAdi="Efsane" />);
    expect(erisimEtiketiniAl(yirmi)).toBe("Efsane rozeti: 90 günün 20'si tamamlandı.");
  });

  test('hedefAdi eksik (undefined) olduğunda bozuk etiket YERİNE varsayılan ada düşer', () => {
    const tree = render(<Tesbih mevcutSeri={15} hedefGun={21} />);
    expect(erisimEtiketiniAl(tree)).toBe("Sıradaki hedef rozeti: 21 günün 15'i tamamlandı.");
    expect(metniBul(tree, 'gün kaldı')).toBe('Sıradaki hedef rozetine 6 gün kaldı');
  });

  test('KRITIK (inceleme bulgusu — erişilebilirlik): accessibilityValue min/max/now taşır', () => {
    // hedefGun=21 -> max=21 (hedef), now=min(mevcutSeri,hedefGun)=15 (tamamlananSayisi).
    const tree = render(<Tesbih mevcutSeri={15} hedefGun={21} hedefAdi="Alışkanlık ustası" />);
    const progressbar = tree.root.findByProps({ accessibilityRole: 'progressbar' });
    expect(progressbar.props.accessibilityValue).toEqual({ min: 0, max: 21, now: 15 });
  });

  test('hedefGun null iken accessibilityValue tesbihi tamamen dolu gösterir (max=now=boncukSayisi)', () => {
    const tree = render(<Tesbih mevcutSeri={120} hedefGun={null} />);
    const progressbar = tree.root.findByProps({ accessibilityRole: 'progressbar' });
    expect(progressbar.props.accessibilityValue).toEqual({ min: 0, max: 33, now: 33 });
  });

  test('hedefAdi boş/yalnız-boşluk string olduğunda da varsayılan ada düşer', () => {
    const bosString = render(<Tesbih mevcutSeri={15} hedefGun={21} hedefAdi="" />);
    expect(erisimEtiketiniAl(bosString)).toBe("Sıradaki hedef rozeti: 21 günün 15'i tamamlandı.");

    const bosluk = render(<Tesbih mevcutSeri={15} hedefGun={21} hedefAdi="   " />);
    expect(erisimEtiketiniAl(bosluk)).toBe("Sıradaki hedef rozeti: 21 günün 15'i tamamlandı.");
  });
});
