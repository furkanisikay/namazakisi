/**
 * AyarGrubu — başlık + tek kart + çocuklar arası ayraç davranışı.
 */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { AyarGrubu } from '../AyarGrubu';

jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    birincil: '#5C6BC0',
    kartArkaplan: '#FFFFFF',
    sinir: '#E0E0E0',
  }),
}));

/** Render ağacında `borderTopWidth` taşıyan düğüm sayısını sayar (ayraç sayısı). */
function ayracSayisi(node: unknown): number {
  if (!node || typeof node !== 'object') return 0;
  let toplam = 0;
  const dugum = node as { props?: { style?: unknown }; children?: unknown[] };
  const style = dugum.props?.style;
  if (style && typeof style === 'object' && 'borderTopWidth' in (style as Record<string, unknown>)) {
    toplam += 1;
  }
  if (Array.isArray(dugum.children)) {
    for (const cocuk of dugum.children) {
      toplam += ayracSayisi(cocuk);
    }
  }
  return toplam;
}

describe('AyarGrubu', () => {
  it('başlığı ve çocukları render eder', () => {
    const { getByText } = render(
      <AyarGrubu baslik="Namaz vakitleri">
        <Text>Konum satırı</Text>
        <Text>Takvim satırı</Text>
      </AyarGrubu>
    );

    expect(getByText('Namaz vakitleri')).toBeTruthy();
    expect(getByText('Konum satırı')).toBeTruthy();
    expect(getByText('Takvim satırı')).toBeTruthy();
  });

  it('yalnızca ilk çocuk hariç aralarına ayraç ekler (3 çocuk → 2 ayraç)', () => {
    const { toJSON } = render(
      <AyarGrubu baslik="Hatırlatmalar">
        <Text>Satır 1</Text>
        <Text>Satır 2</Text>
        <Text>Satır 3</Text>
      </AyarGrubu>
    );

    expect(ayracSayisi(toJSON())).toBe(2);
  });

  it('tek çocukta ayraç eklemez', () => {
    const { toJSON } = render(
      <AyarGrubu baslik="Uygulama">
        <Text>Tek satır</Text>
      </AyarGrubu>
    );

    expect(ayracSayisi(toJSON())).toBe(0);
  });

  it('ayraç genişliği StyleSheet.hairlineWidth kullanır', () => {
    const { toJSON } = render(
      <AyarGrubu baslik="Veri ve destek">
        <Text>Satır 1</Text>
        <Text>Satır 2</Text>
      </AyarGrubu>
    );

    const bul = (node: unknown): boolean => {
      if (!node || typeof node !== 'object') return false;
      const dugum = node as { props?: { style?: unknown }; children?: unknown[] };
      const style = dugum.props?.style as { borderTopWidth?: number } | undefined;
      if (style?.borderTopWidth === StyleSheet.hairlineWidth) return true;
      if (Array.isArray(dugum.children)) return dugum.children.some(bul);
      return false;
    };

    expect(bul(toJSON())).toBe(true);
  });
});
