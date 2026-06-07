import React from 'react';
import { act } from 'react-test-renderer';
import renderer from 'react-test-renderer';
import { HomeHeader } from '../HomeHeader';
import { SERI_RENKLERI } from '../../../../core/constants/UygulamaSabitleri';

jest.mock('@expo/vector-icons', () => ({ FontAwesome5: 'FontAwesome5' }));
jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    kartArkaplan: '#FFF',
    arkaplan: '#F5F5F5',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    metin: '#212121',
    metinIkincil: '#757575',
    durum: { uyari: '#FF6B35', hata: '#F44336', basarili: '#4CAF50' },
  }),
  useTema: () => ({ koyuMu: false }),
}));
jest.mock('../../../../core/utils/TarihYardimcisi', () => ({
  tarihiGorunumFormatinaCevir: () => '21 Mart 2026',
  gunAdiniAl: () => 'Cumartesi',
}));

jest.useFakeTimers();

const temelProps = {
  tarih: '2026-03-21',
  streakGun: 10,
  bugunMu: true,
  onTarihTikla: jest.fn(),
  onSeriTikla: jest.fn(),
};

/**
 * Ağaçtan "fire" (alev) ikonu node'unu bulup gerçek `color` prop'unu döndürür.
 * Arka plan (SERI_RENKLERI.ATES + '20') veya alttaki etiket (satır 153'te
 * hardcoded '#f59e0b') gibi sızıntı kaynaklarını DEVRE DIŞI bırakır:
 * yalnızca ikona uygulanan `atesRenk` hesaplaması test edilir.
 */
function atesIkonRenginiAl(tree: renderer.ReactTestRenderer): string {
  // name === 'fire' yalnızca tek FontAwesome5 alev ikonuna uyar (kıble ikonu name="compass").
  const ikonlar = tree.root.findAll((node) => node.props?.name === 'fire');
  expect(ikonlar).toHaveLength(1);
  return ikonlar[0].props.color;
}

/**
 * Seri (ateş) butonunun (TouchableOpacity) style'ından opacity değerini döndürür.
 * Aynı accessibilityLabel hem butonda hem ikonda olduğundan, style != null
 * filtresiyle butonu seçeriz (ikonun style prop'u yoktur).
 */
function seriButonOpacityAl(
  tree: renderer.ReactTestRenderer,
  etiket: string
): number | undefined {
  const dugumler = tree.root.findAll(
    (n) => n.props?.accessibilityLabel === etiket && n.props?.style != null
  );
  const stiller = dugumler.map((n) => n.props.style).flat();
  const opacityStili = stiller.find(
    (s: { opacity?: number } | undefined) => s && typeof s.opacity === 'number'
  );
  return opacityStili?.opacity;
}

describe('HomeHeader — Kademeli Ateş İkonu', () => {
  it('normal modda ateş ikonu SERI_RENKLERI.ATES renginde (#FF6B35)', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<HomeHeader {...temelProps} />); });
    // İkonun gerçek color prop'u üretim sabitiyle (string literal değil) doğrulanır.
    expect(atesIkonRenginiAl(tree!)).toBe(SERI_RENKLERI.ATES);
    expect(SERI_RENKLERI.ATES).toBe('#FF6B35');
    // Normal modda donukluk olmamalı: opacity tam (1).
    expect(seriButonOpacityAl(tree!, 'Seri: 10 gün')).toBe(1);
  });

  it('toparlanma gün 0/3 → gri/donuk', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <HomeHeader {...temelProps} toparlanmaModu={true} toparlanmaIlerleme={{ tamamlanan: 0, hedef: 3 }} />
      );
    });
    // ilerleme === 0 → gri renk
    expect(atesIkonRenginiAl(tree!)).toBe('#9ca3af');
    // 'donuk' davranışı: buton opacity'si 0.5 olmalı (sönük görünüm)
    expect(seriButonOpacityAl(tree!, 'Toparlanma modu: 0/3 gün tamamlandı')).toBe(0.5);
  });

  it('toparlanma gün 1/3 → amber', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <HomeHeader {...temelProps} toparlanmaModu={true} toparlanmaIlerleme={{ tamamlanan: 1, hedef: 3 }} />
      );
    });
    // ilerleme 1/3 (<0.5) → amber. Etiketten (hardcoded '#f59e0b') değil,
    // ikonun gerçek atesRenk'i doğrulanır.
    expect(atesIkonRenginiAl(tree!)).toBe('#f59e0b');
    expect(seriButonOpacityAl(tree!, 'Toparlanma modu: 1/3 gün tamamlandı')).toBe(0.7);
  });

  it('toparlanma gün 2/3 → turuncu', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <HomeHeader {...temelProps} toparlanmaModu={true} toparlanmaIlerleme={{ tamamlanan: 2, hedef: 3 }} />
      );
    });
    // ilerleme 2/3 (<1) → turuncu
    expect(atesIkonRenginiAl(tree!)).toBe('#f97316');
    expect(seriButonOpacityAl(tree!, 'Toparlanma modu: 2/3 gün tamamlandı')).toBe(0.85);
  });

  it('toparlanma tamamlandı 3/3 → tam alev (SERI_RENKLERI.ATES, opak)', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <HomeHeader {...temelProps} toparlanmaModu={true} toparlanmaIlerleme={{ tamamlanan: 3, hedef: 3 }} />
      );
    });
    // ilerleme === 1 → tam alev rengine geri döner, opacity 1
    expect(atesIkonRenginiAl(tree!)).toBe(SERI_RENKLERI.ATES);
    expect(seriButonOpacityAl(tree!, 'Toparlanma modu: 3/3 gün tamamlandı')).toBe(1);
  });

  it('recovery label X/Y gösterir', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <HomeHeader {...temelProps} toparlanmaModu={true} toparlanmaIlerleme={{ tamamlanan: 1, hedef: 3 }} />
      );
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('1/3');
  });
});
