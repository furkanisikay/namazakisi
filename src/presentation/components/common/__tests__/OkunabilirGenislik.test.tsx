/**
 * OkunabilirGenislik + useEkranSinifi — katlanabilir/tablet düzeni (issue #283).
 *
 * `useWindowDimensions` modül düzeyinde mock'lanır (react-native'in getter'ı
 * bu modülün `default`unu döndürür); Platform modülüne dokunulmaz.
 */
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { render, renderHook } from '@testing-library/react-native';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({ arkaplan: '#fafafa' }),
}));

import { OkunabilirGenislik } from '../OkunabilirGenislik';
import { useEkranSinifi } from '../../../hooks/useEkranSinifi';
import { OKUNABILIR_MAKS_GENISLIK_DP } from '../../../../core/utils/ekranSinifi';

const useWindowDimensionsMock = (
  jest.requireMock('react-native/Libraries/Utilities/useWindowDimensions') as { default: jest.Mock }
).default;

const genislikAyarla = (width: number) =>
  useWindowDimensionsMock.mockReturnValue({ width, height: 900, scale: 2, fontScale: 1 });

describe('OkunabilirGenislik', () => {
  it('telefonda içerik tam genişliktedir (sınır yok)', () => {
    genislikAyarla(411);
    const ekran = render(
      <OkunabilirGenislik>
        <Text>icerik</Text>
      </OkunabilirGenislik>
    );
    expect(ekran.getByText('icerik')).toBeTruthy();
    expect(ekran.queryByTestId('okunabilir-genislik')).toBeNull();
  });

  it('geniş pencerede içerik ≈640 dp sütunda ortalanır', () => {
    genislikAyarla(1280);
    const ekran = render(
      <OkunabilirGenislik>
        <Text>icerik</Text>
      </OkunabilirGenislik>
    );
    const dis = ekran.getByTestId('okunabilir-genislik');
    expect(StyleSheet.flatten(dis.props.style)).toMatchObject({ alignItems: 'center', backgroundColor: '#fafafa' });
    const sutun = ekran.getByTestId('okunabilir-sutun');
    expect(StyleSheet.flatten(sutun.props.style)).toMatchObject({ maxWidth: OKUNABILIR_MAKS_GENISLIK_DP });
  });

  it('katla/aç sırasında ALT AĞAÇ yeniden bağlanmaz (durum korunur)', () => {
    const bagla = jest.fn();
    const Sayac: React.FC = () => {
      React.useEffect(() => { bagla(); }, []);
      return <Text>sayac</Text>;
    };
    genislikAyarla(411);
    const ekran = render(
      <OkunabilirGenislik>
        <Sayac />
      </OkunabilirGenislik>
    );
    genislikAyarla(1280);
    ekran.rerender(
      <OkunabilirGenislik>
        <Sayac />
      </OkunabilirGenislik>
    );
    expect(ekran.getByTestId('okunabilir-genislik')).toBeTruthy();
    expect(bagla).toHaveBeenCalledTimes(1);
  });
});

describe('useEkranSinifi', () => {
  it.each([
    [411, 'kompakt'],
    [673, 'orta'],
    [1280, 'genis'],
  ])('%i dp → %s', (width, beklenen) => {
    genislikAyarla(width);
    const { result } = renderHook(() => useEkranSinifi());
    expect(result.current).toBe(beklenen);
  });
});
