/**
 * Ayarlar > Yardım (sade tasarım, Dalga 3): sorun bildirme, Neler yeni, Hakkında
 * ve "Kurulumu yeniden başlatın" (eski Seri ve hedefler > Tehlikeli bölge).
 */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, dispatch: mockDispatch }),
  CommonActions: { reset: jest.fn((arg) => ({ type: 'RESET', payload: arg })) },
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  removeItem: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../store/hooks', () => ({
  useAppSelector: (sec: (s: unknown) => unknown) => sec({ guncelleme: { guncellemeMevcut: false } }),
  useAppDispatch: () => jest.fn(),
}));
jest.mock('../../hooks/useYeniOzellikler', () => ({ useYeniOzellikler: () => ({ okunmamisVarMi: false }) }));
jest.mock('../../../core/theme', () => ({
  useRenkler: () => ({
    kartArkaplan: '#FFFFFF',
    arkaplan: '#FAFAFA',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    metin: '#212121',
    metinIkincil: '#757575',
    hata: '#F44336',
    durum: { basarili: '#4CAF50', bilgi: '#2196F3', hata: '#F44336', uyari: '#FFC107' },
  }),
}));
jest.mock('../../../core/feedback', () => ({ useFeedback: () => ({ butonTiklandiFeedback: jest.fn() }) }));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { FontAwesome5: (props: { name: string }) => <Text>{props.name}</Text> };
});
jest.mock('../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));

import { YardimSayfasi } from '../YardimSayfasi';
import { ingilizceyeGec, turkceKalanlar } from '../../../__tests__/yardimci/ingilizceDenetimi';

describe('YardimSayfasi', () => {
  beforeEach(() => jest.clearAllMocks());

  // AyarSatiri dokunuşu önce geri bildirimi bekler (async) → gezinme bir mikro görev sonra.
  it('satırlar kendi sayfalarına gider', async () => {
    const { getByText } = render(<YardimSayfasi />);
    fireEvent.press(getByText('Sorun bildirin'));
    await waitFor(() => expect(mockNavigate).toHaveBeenLastCalledWith('TaniGeriBildirim'));
    fireEvent.press(getByText('Neler yeni'));
    await waitFor(() => expect(mockNavigate).toHaveBeenLastCalledWith('NelerYeni'));
    fireEvent.press(getByText('Hakkında'));
    await waitFor(() => expect(mockNavigate).toHaveBeenLastCalledWith('Hakkinda'));
  });

  it('"Kurulumu yeniden başlatın" onay ister; onayda yalnız kurulum bayrağı silinir', async () => {
    const { getByText } = render(<YardimSayfasi />);
    fireEvent.press(getByText('Kurulumu yeniden başlatın'));
    await waitFor(() => expect(getByText('Kurulum yeniden başlasın mı?')).toBeTruthy());
    expect(AsyncStorage.removeItem).not.toHaveBeenCalled();

    fireEvent.press(getByText('Kurulumu açın'));
    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });
  });
});

describe('YardimSayfasi — İngilizce', () => {
  let geriAl: () => void;
  beforeEach(() => {
    geriAl = ingilizceyeGec();
  });
  afterEach(() => geriAl());

  it('satırlar ve onay modalı İngilizce', async () => {
    const e = render(<YardimSayfasi />);
    fireEvent.press(e.getByText('Restart setup'));
    await waitFor(() => expect(e.getByText('Restart setup?')).toBeTruthy());
    expect(turkceKalanlar(e.toJSON() as never, ['Kurulum', 'Neler', 'Vazge', 'Kapat', 'Yeni'])).toEqual([]);
  });
});
