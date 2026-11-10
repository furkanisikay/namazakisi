/**
 * Duvar sahnesi, kilit ekranı saat alanı: mihrap yıldızı saat alanına değiyorsa çizilmez, kemer
 * saat alanında `saatSolmasi` maskesiyle solar (durakları birebir), gök cismi saat alanından kaçar.
 * Ana ekranda (saat alanı yok) maske yok, yıldız çizilir.
 */
import React from 'react';
import renderer, { act, type ReactTestRenderer } from 'react-test-renderer';
import { DuvarSahnesi, type YaziKutusu } from '../DuvarSahnesi';
import { VARSAYILAN_DUVAR_AYARI, type DuvarKagidiAyari } from '../../../../../core/icerik/gununAyetiYuku';
import { GOK_SAHNELERI, cisimKonumuSec, saatSolmasi, type SaatAlani } from '../../../../../core/icerik/duvarTasarimi';
import { saatSolmasiDuraklari } from '../../../../../core/icerik/duvarCizimi';

// react-native-svg: her bileşen düz STRING (GokPaneli.test reçetesi).
jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Svg: 'Svg',
  G: 'G',
  Defs: 'Defs',
  RadialGradient: 'RadialGradient',
  LinearGradient: 'LinearGradient',
  Mask: 'Mask',
  Pattern: 'Pattern',
  Path: 'Path',
  Circle: 'Circle',
  Line: 'Line',
  Polygon: 'Polygon',
  Rect: 'Rect',
  Stop: 'Stop',
}));

const G = 330;
const Y = 700;
/** Android kilit ekranında varsayılan yazı yeri (%66–%80). */
const KUTU: YaziKutusu = [0.09, 0.66, 0.91, 0.8];
const ALAN: SaatAlani = [0.26, 0.64];
const MIHRAP: DuvarKagidiAyari = { ...VARSAYILAN_DUVAR_AYARI, zemin: 'gece', sus: { tur: 'mihrap', belirginlik: 0.5 } };

function ciz(ayar: DuvarKagidiAyari, saatAlani: SaatAlani | null, kutu: YaziKutusu = KUTU): ReactTestRenderer {
  let agac: ReactTestRenderer | undefined;
  act(() => {
    agac = renderer.create(<DuvarSahnesi genislik={G} yukseklik={Y} ayar={ayar} kutu={kutu} kimlik="t" saatAlani={saatAlani} />);
  });
  if (!agac) throw new Error('çizilmedi');
  return agac;
}

describe('DuvarSahnesi — kilit ekranı saat alanı', () => {
  it('mihrap yıldızı saat alanına değiyorsa çizilmez; ana ekranda çizilir', () => {
    // Yıldız kutunun %5 üstünde (≈%61): varsayılan Android saat alanının (%26–%64) içinde.
    expect(ciz(MIHRAP, ALAN).root.findAllByProps({ testID: 'duvar-mihrap-yildiz' })).toHaveLength(0);
    expect(ciz(MIHRAP, null).root.findAllByProps({ testID: 'duvar-mihrap-yildiz' })).toHaveLength(1);
    // Saat alanı yukarıda kalırsa (%10–%30) yıldız yine çizilir.
    expect(ciz(MIHRAP, [0.1, 0.3]).root.findAllByProps({ testID: 'duvar-mihrap-yildiz' })).toHaveLength(1);
  });

  it('kemer saat alanında solma maskesiyle çizilir; geçiş durakları saatSolmasi ile aynı', () => {
    const agac = ciz(MIHRAP, ALAN);
    const kemer = agac.root.findByProps({ testID: 'duvar-mihrap-kemer' });
    expect(kemer.props.mask).toBe('url(#t-saat)');
    const gecis = agac.root.findByProps({ id: 't-solma' });
    expect(gecis.props).toMatchObject({ gradientUnits: 'userSpaceOnUse', y1: 0, y2: Y });
    const duraklar = gecis.findAllByType('Stop' as never).map((d) => [d.props.offset, d.props.stopOpacity]);
    expect(duraklar).toEqual((saatSolmasiDuraklari(ALAN) ?? []).map((d) => [d.konum, d.opaklik]));
    for (const [konum, opaklik] of duraklar) expect(opaklik).toBeCloseTo(saatSolmasi(konum, ALAN), 12);
    // Ana ekran: maske yok.
    const ana = ciz(MIHRAP, null);
    expect(ana.root.findByProps({ testID: 'duvar-mihrap-kemer' }).props.mask).toBeUndefined();
    expect(ana.root.findAllByProps({ id: 't-solma' })).toHaveLength(0);
  });

  it('gök cismi saat alanına girmez (cisimKonumuSec ile aynı yer)', () => {
    const ayar: DuvarKagidiAyari = { ...VARSAYILAN_DUVAR_AYARI, zemin: 'kusluk', sus: { tur: 'yok', belirginlik: 0.5 } };
    const cisim = GOK_SAHNELERI.kusluk.cisim;
    if (!cisim) throw new Error('kuşlukta cisim var');
    const beklenen = cisimKonumuSec(cisim, KUTU, Y / G, ALAN);
    if (!beklenen) throw new Error('kuşlukta cisim çizilmeli');
    const daireler = ciz(ayar, ALAN).root.findAll((d) => (d.type as unknown) === 'Circle' && d.props.r === cisim.r * G);
    expect(daireler).toHaveLength(1);
    expect(daireler[0].props.cx).toBeCloseTo(beklenen[0] * G, 6);
    expect(daireler[0].props.cy).toBeCloseTo(beklenen[1] * Y, 6);
    // İlk aday (%36) saat alanının içinde: saat alanı yokken oraya konardı.
    expect(cisim.konumlar[0][1]).toBeGreaterThan(ALAN[0]);
    expect(beklenen[1]).not.toBeCloseTo(cisim.konumlar[0][1], 3);
  });
});
