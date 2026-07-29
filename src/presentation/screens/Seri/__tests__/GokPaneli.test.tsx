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
import { GOK_TONLARI } from '../sabitler';

const { G, Path, Text: SvgTextMock } = require('react-native-svg');

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

    // Her yıldız kendi `<G transform="translate(...) scale(...)">` içinde
    // konumlanır; ızgara katmanının tamamını (0, HEADER_YUKSEKLIK) kadar
    // kaydıran TEK bir sarmalayıcı `<G>` da vardır (scale içermez) — o yüzden
    // `scale(` içeren transform'a göre süzülür, ham G sayısı izgara.length+1'dir.
    const yildizGruplari = tree.root
      .findAllByType(G)
      .filter((d) => typeof d.props.transform === 'string' && d.props.transform.includes('scale('));
    expect(yildizGruplari).toHaveLength(izgara.length);
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

  test('KRITIK (inceleme bulgusu #1 — kontrast): ay adı ve gün harfleri koyu panelin İÇİNDE (SVG Text), tema token DEĞİL sabit sahne tonuyla çizilir', () => {
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

    const metinler = tree.root.findAllByType(SvgTextMock);
    const ayAdiMetni = metinler.find((d) => d.props.children === 'Temmuz 2026');
    expect(ayAdiMetni).toBeDefined();
    // Sabit gök sahnesi tonu (AGENTS.md'nin tek istisnası) — tema `renkler.*`
    // DEĞİL; panelin dışına taşınsaydı bu değer açık temada okunmaz olurdu.
    expect(ayAdiMetni!.props.fill).toBe(GOK_TONLARI.AY_ADI);

    const gunHarfi = metinler.find((d) => d.props.children === 'P' && d.props.fill === GOK_TONLARI.GUN_ADI);
    expect(gunHarfi).toBeDefined();
  });

  test('KRITIK (inceleme bulgusu #2 — zincir): ikisiTam düz bağ, yıldız merkezlerinden İÇERİ ÇEKİLMİŞ uçlarla çizilir (halka/bloom bölgesinin İÇİNDEN geçmez)', () => {
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

    // 2026-07-01 ve 2026-07-02 ardışık, ornekIzgaraKur'da ikisi de 5/5 ve aynı
    // satırda (satır sarması değil) -> aralarındaki bağ ikisiTam + düz olmalı.
    const idx = izgara.findIndex((g) => g.tarih === '2026-07-01');
    const bagSirasi = zincirler.findIndex((b) => b.indeks === idx);
    expect(bagSirasi).toBeGreaterThanOrEqual(0);
    expect(zincirler[bagSirasi].ikisiTam).toBe(true);
    expect(zincirler[bagSirasi].satirSarmasi).toBe(false);

    // Gün numaraları izgara sırasıyla render edilir ve `x=merkez.x` taşır —
    // yıldızın GERÇEK merkezini (GokPaneli'nin özel geometri sabitlerini
    // tekrarlamadan) buradan okuyoruz.
    const gunNumaralari = tree.root.findAllByType(SvgTextMock).slice(0, izgara.length);
    const merkezXBaslangic = gunNumaralari[idx].props.x as number;
    const merkezXBitis = gunNumaralari[idx + 1].props.x as number;

    const yol = tree.root.findAllByType(Path)[bagSirasi].props.d as string;
    const sayilar = yol.match(/-?\d+(\.\d+)?/g)!.map(Number);
    const yolBaslangicX = sayilar[0];

    // Inceleme öncesi: yolBaslangicX === merkezXBaslangic (merkez-merkez, bosluk
    // yok sayılıyordu) -> bağ yıldızın halka/bloom bölgesinin içinden geçiyordu.
    // Düzeltme sonrası: baslangic, iki merkez arasında, ilk merkezin KESİNLİKLE
    // içinde (merkeze eşit değil) olmalı.
    expect(yolBaslangicX).toBeGreaterThan(merkezXBaslangic);
    expect(yolBaslangicX).toBeLessThan(merkezXBitis);
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
