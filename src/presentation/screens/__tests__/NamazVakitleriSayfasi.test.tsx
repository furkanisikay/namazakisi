/**
 * Ayarlar > Namaz vakitleri (sade tasarım, Dalga 3): Konum · Yolculuk bilgisi ·
 * takvim satırları + MEZHEP seçimi (Yolculuk bilgisi sayfasından taşındı).
 * Mezhep yazma yolu değişmedi: seferîlik dilimi → `SEFERILIK_AYARLARI`.
 */
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('../../../core/theme', () => ({
  useRenkler: () => ({
    kartArkaplan: '#FFFFFF',
    arkaplan: '#FAFAFA',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    birincilMetin: '#FFFFFF',
    metin: '#212121',
    metinIkincil: '#757575',
  }),
}));
jest.mock('../../../core/feedback', () => ({ useFeedback: () => ({ butonTiklandiFeedback: jest.fn() }) }));
jest.mock('../../hooks/useKonumYenile', () => ({
  useKonumYenile: () => ({ yenilenebilir: false, yenileniyor: false, yenile: jest.fn() }),
}));

import seferilikReducer from '../../store/seferilikSlice';
import takvimReducer from '../../store/takvimSlice';
import { NamazVakitleriSayfasi } from '../NamazVakitleriSayfasi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

const konumDurumu = {
  konumModu: 'manuel',
  gpsAdres: null,
  seciliIlceAdi: 'Tepebaşı',
  seciliIlAdi: 'Eskişehir',
};

const kur = () => {
  const store = configureStore({
    reducer: {
      seferilik: seferilikReducer,
      takvim: takvimReducer,
      konum: (s = konumDurumu) => s,
    },
  });
  const sonuc = render(
    <Provider store={store}>
      <NamazVakitleriSayfasi />
    </Provider>,
  );
  return { store, ...sonuc };
};

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  await AsyncStorage.setItem(
    DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI,
    JSON.stringify({ kartAcik: true, mezhep: 'hanefi' }),
  );
});

describe('NamazVakitleriSayfasi', () => {
  it('konum özetini ve üç satırı gösterir; satırlar kendi sayfalarına gider', async () => {
    const { getByText, store } = kur();
    await waitFor(() => expect(store.getState().seferilik.yuklendi).toBe(true));
    expect(getByText('Tepebaşı, Eskişehir · manuel')).toBeTruthy();
    // AyarSatiri dokunuşu önce geri bildirimi bekler (async) → gezinme bir mikro görev sonra.
    fireEvent.press(getByText('Yolculuk bilgisi'));
    await waitFor(() => expect(mockNavigate).toHaveBeenLastCalledWith('SeferilikAyarlari'));
    fireEvent.press(getByText('Vakitleri takvime ekleyin'));
    await waitFor(() => expect(mockNavigate).toHaveBeenLastCalledWith('TakvimAyarlari'));
    fireEvent.press(getByText('Konum'));
    await waitFor(() => expect(mockNavigate).toHaveBeenLastCalledWith('KonumAyarlari'));
  });

  it('mezhep seçimi aynı yoldan diske yazılır ve vakitleri değiştirmediği söylenir', async () => {
    const { getByLabelText, getByText, store } = kur();
    await waitFor(() => expect(store.getState().seferilik.yuklendi).toBe(true));
    expect(getByText('Yolculuk kartını ve kazada vitri belirler; vakitleri değiştirmez.')).toBeTruthy();
    fireEvent.press(getByLabelText(/^Şâfiî\./));
    await waitFor(async () =>
      expect(JSON.parse((await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI)) ?? '{}').mezhep).toBe('safii'),
    );
    expect(getByLabelText(/^Şâfiî\./).props.accessibilityState).toMatchObject({ selected: true });
  });
});
