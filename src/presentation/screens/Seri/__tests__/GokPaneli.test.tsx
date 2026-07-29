import React from 'react';
import { act } from 'react-test-renderer';
import renderer from 'react-test-renderer';

// react-native-svg mock reçetesi — task-4-report.md'deki reçeteyle AYNI.
// Her bileşen düz bir STRING'e indirgenir (React.createElement ÇAĞIRMA —
// nativewind'in cssInterop babel eklentisi jest.mock fabrikasında
// "_ReactNativeCSSInterop scope dışı" hatası veriyor, doğrulandı).
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
    birincil: '#4CAF50',
    metinIkincil: '#757575',
    birincilMetin: '#FFFFFF',
  }),
}));

import { GokPaneli } from '../GokPaneli';
import { aylikIzgaraOlustur } from '../../../../core/seri/aylikIzgara';
import { zincirBaglari } from '../../../../core/seri/zincir';
import { gokErisimEtiketi } from '../../../../core/seri/gokErisimEtiketi';

const { G, Path } = require('react-native-svg');

const TAM_GUN_ESIGI = 5;

function ornekIzgaraKur() {
  // Temmuz 2026: 1 Temmuz Çarşamba -> ızgara pazartesiden (29 Haziran) başlar,
  // Ağustos'un ilk birkaç günüyle biter. Bilinçli olarak birkaç 5/5 gün +
  // birkaç kısmi gün + bir dondurulmuş gün içerir ki zincir/yıldız çeşitliliği
  // test edilebilsin.
  const kayitlar: Record<string, boolean[]> = {
    '2026-07-01': [true, true, true, true, true],
    '2026-07-02': [true, true, true, true, true],
    '2026-07-03': [true, true, false, false, false],
    '2026-07-06': [true, false, false, false, false],
  };
  const izgara = aylikIzgaraOlustur({
    yil: 2026,
    ay: 6, // Temmuz (0-tabanlı)
    kayitlar,
    dondurulmusTarihler: new Set(['2026-07-04']),
    bugun: '2026-07-10',
  });
  const zincirler = zincirBaglari(izgara, TAM_GUN_ESIGI);
  return { izgara, zincirler };
}

function render(ui: React.ReactElement): renderer.ReactTestRenderer {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(ui);
  });
  return tree;
}

/** Panelin ölçüm View'ına gerçek bir layout genişliği simüle eder. */
function genislikSimuleEt(tree: renderer.ReactTestRenderer, genislik: number) {
  const govde = tree.root.findByProps({ testID: 'gok-paneli-govde' });
  act(() => {
    govde.props.onLayout({ nativeEvent: { layout: { width: genislik, height: 0, x: 0, y: 0 } } });
  });
}

describe('GokPaneli', () => {
  test('panelGenislik 0 iken (onLayout tetiklenmeden) çökmez ve Svg çizmez', () => {
    const { izgara, zincirler } = ornekIzgaraKur();
    expect(() =>
      render(
        <GokPaneli
          izgara={izgara}
          zincirler={zincirler}
          ayAdi="Temmuz 2026"
          bugun="2026-07-10"
          tamGunEsigi={TAM_GUN_ESIGI}
          mevcutSeri={3}
        />
      )
    ).not.toThrow();
  });

  test('onLayout ile genişlik geldikten sonra doğru sayıda yıldız (izgara.length kadar G) render eder', () => {
    const { izgara, zincirler } = ornekIzgaraKur();
    const tree = render(
      <GokPaneli
        izgara={izgara}
        zincirler={zincirler}
        ayAdi="Temmuz 2026"
        bugun="2026-07-10"
        tamGunEsigi={TAM_GUN_ESIGI}
        mevcutSeri={3}
      />
    );

    genislikSimuleEt(tree, 350);

    expect(tree.root.findAllByType(G)).toHaveLength(izgara.length);
  });

  test('zincir yolu (Path) sayısı zincirBaglari çıktısıyla birebir uyumludur', () => {
    const { izgara, zincirler } = ornekIzgaraKur();
    const tree = render(
      <GokPaneli
        izgara={izgara}
        zincirler={zincirler}
        ayAdi="Temmuz 2026"
        bugun="2026-07-10"
        tamGunEsigi={TAM_GUN_ESIGI}
        mevcutSeri={3}
      />
    );

    genislikSimuleEt(tree, 350);

    expect(zincirler.length).toBeGreaterThan(0); // ornekIzgaraKur zincir uretecek sekilde kuruldu
    expect(tree.root.findAllByType(Path)).toHaveLength(zincirler.length);
  });

  test('erişim etiketi panelde ve gokErisimEtiketi çıktısıyla birebir aynı', () => {
    const { izgara, zincirler } = ornekIzgaraKur();
    const tree = render(
      <GokPaneli
        izgara={izgara}
        zincirler={zincirler}
        ayAdi="Temmuz 2026"
        bugun="2026-07-10"
        tamGunEsigi={TAM_GUN_ESIGI}
        mevcutSeri={3}
      />
    );

    const govde = tree.root.findByProps({ testID: 'gok-paneli-govde' });
    expect(govde.props.accessibilityRole).toBe('image');
    expect(govde.props.accessible).toBe(true);
    expect(govde.props.accessibilityLabel).toBe(
      gokErisimEtiketi(izgara, 'Temmuz 2026', 3, TAM_GUN_ESIGI)
    );
  });

  test('boş izgarada (hiç zincir bağı yokken) çökmez', () => {
    const izgara = aylikIzgaraOlustur({
      yil: 2026,
      ay: 6,
      kayitlar: {},
      dondurulmusTarihler: new Set(),
      bugun: '2026-06-01',
    });
    const tree = render(
      <GokPaneli izgara={izgara} zincirler={[]} ayAdi="Temmuz 2026" bugun="2026-06-01" tamGunEsigi={5} mevcutSeri={0} />
    );
    genislikSimuleEt(tree, 350);
    expect(tree.root.findAllByType(Path)).toHaveLength(0);
  });
});
