/**
 * "Takvime ekle" sahnesi: bilgi hareketle verilmez (ekran okuyucu tek cümle duyar) ve
 * "Animasyonları azalt" açıksa sahne SON karesinde doğar (sayaç hemen hedefte).
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { TakvimeEkleHareketi } from '../TakvimeEkleHareketi';

const mockAzalt = { deger: true };
jest.mock('../../../hooks/useHareketAzalt', () => ({ useHareketAzalt: () => mockAzalt.deger }));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({ birincil: '#4CAF50', birincilMetin: '#FFFFFF', metin: '#333', basarili: '#4CAF50' }),
}));

describe('TakvimeEkleHareketi', () => {
  it('azaltılmış harekette sayaç doğrudan hedefte; erişilebilirlik cümlesi sayıyı taşır', () => {
    mockAzalt.deger = true;
    const { getByText, getByLabelText } = render(<TakvimeEkleHareketi sayi={35} />);
    expect(getByText('35')).toBeTruthy();
    expect(getByLabelText('35 etkinlik takviminize eklendi')).toBeTruthy();
  });

  it('hareket açıkken sayaç 0\'dan başlar (sahne olayla başlar, döngü yok)', () => {
    mockAzalt.deger = false;
    const { getByText } = render(<TakvimeEkleHareketi sayi={12} />);
    expect(getByText('0')).toBeTruthy();
  });
});
