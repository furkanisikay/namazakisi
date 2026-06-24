import React from 'react';
import { render } from '@testing-library/react-native';
import { TaniGeriBildirimSayfasi } from '../TaniGeriBildirimSayfasi';

const mockDispatch = jest.fn();
jest.mock('../../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (s: (st: { tani: { hatirlatmaAcik: boolean } }) => unknown) => s({ tani: { hatirlatmaAcik: true } }),
}));
jest.mock('../../store/taniSlice', () => ({ hatirlatmayiGuncelle: (v: boolean) => ({ type: 'g', payload: v }) }));
jest.mock('../../../core/theme', () => ({ useRenkler: () => ({ arkaplan: '#FAFAFA', kartArkaplan: '#FFF', metin: '#000', metinIkincil: '#777', birincil: '#4CAF50', birincilMetin: '#FFF', sinir: '#E0E0E0', durum: { basarili: '#4CAF50', hata: '#F44336' } }) }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
jest.mock('../../components/Tani/TaniOnizleme', () => ({ TaniOnizleme: () => null }));
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: jest.fn() }) }));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: any) => <Text>{props.name}</Text>;
});
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { FontAwesome5: (props: any) => <Text>{props.name}</Text> };
});

describe('TaniGeriBildirimSayfasi', () => {
  test('Sorun Bildir butonu görünür', () => {
    const { getByText } = render(<TaniGeriBildirimSayfasi />);
    expect(getByText('Sorun Bildir')).toBeTruthy();
  });

  test('Sorun algılandığında hatırlat toggle görünür', () => {
    const { getByText } = render(<TaniGeriBildirimSayfasi />);
    expect(getByText('Sorun algılandığında hatırlat')).toBeTruthy();
  });

  test('Gönderilecek bilgiyi önizle butonu görünür', () => {
    const { getByText } = render(<TaniGeriBildirimSayfasi />);
    expect(getByText('Gönderilecek bilgiyi önizle')).toBeTruthy();
  });

  test('Tanı kayıtlarını görüntüle butonu görünür', () => {
    const { getByText } = render(<TaniGeriBildirimSayfasi />);
    expect(getByText('Tanı kayıtlarını görüntüle')).toBeTruthy();
  });
});
