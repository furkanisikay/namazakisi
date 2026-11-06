/**
 * Alfabe seçimi (Ayarlar > Dil): yalnız iki alfabeli dilde (Özbekçe, Kazakça) görünür; seçenek
 * örneği her seçenekte KENDİ alfabesiyle; seçim kaydedilir, değişince planlar konum yayma
 * noktasından yeniden kurulur.
 */
import * as React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return ({ name }: { name: string }) => <Text>{`[${name}]`}</Text>;
});
const RENKLER = { birincil: '#4CAF50', arkaplan: '#FAFAFA', kartArkaplan: '#FFFFFF', metin: '#212121', metinIkincil: '#757575', sinir: '#E0E0E0' };
jest.mock('../../../../core/theme', () => ({ useRenkler: () => RENKLER }));
jest.mock('../../../hooks/useHareketAzalt', () => ({ useHareketAzalt: () => true }));

const mockSecim = jest.fn(() => Promise.resolve(null as string | null));
const mockKaydet = jest.fn((_s: string | null) => Promise.resolve(true));
jest.mock('../../../../domain/services/DilServisi', () => ({
  DilServisi: {
    yaziSecimi: () => mockSecim(),
    yaziKaydet: (s: string | null) => mockKaydet(s),
  },
}));
const mockYay = jest.fn((_k: unknown) => Promise.resolve());
jest.mock('../../../../domain/services/KonumDegisikligiServisi', () => ({ konumDegistiUygula: (k: unknown) => mockYay(k) }));

import { YaziSecimi } from '../YaziSecimi';
import dilReducer from '../../../store/dilSlice';
import { aktifDiliKur, aktifDilSifirla, sozluk } from '../../../../core/dil/aktifDil';
import type { DilKodu } from '../../../../core/dil/diller';

const ciz = (kod: DilKodu, koordinatlar: { lat: number; lng: number } | null = { lat: 41.3, lng: 69.2 }) => {
  const store = configureStore({ reducer: { dil: dilReducer, konum: (s: unknown = { koordinatlar }) => s } });
  return render(
    <Provider store={store}>
      <YaziSecimi kod={kod} />
    </Provider>
  );
};

beforeEach(() => {
  mockSecim.mockReset().mockResolvedValue(null);
  mockKaydet.mockReset().mockResolvedValue(true);
  mockYay.mockReset().mockResolvedValue(undefined);
});
afterEach(() => {
  act(() => aktifDilSifirla());
});

it('alfabe seçimi olmayan dilde (Türkçe, Rusça, Kırgızca) çizilmez', async () => {
  for (const kod of ['tr', 'ru', 'ky'] as const) {
    ciz(kod);
    await act(async () => undefined);
    expect(screen.queryByTestId('yazi-secimi')).toBeNull();
  }
  expect(mockSecim).not.toHaveBeenCalled();
});

it('Özbekçede üç seçenek, örnekler kendi alfabesinde; Kiril seçimi kaydedilir ve planlar yenilenir', async () => {
  act(() => {
    aktifDiliKur('uz');
  });
  const m = sozluk('uz').dilAyar.yazi;
  ciz('uz');
  await waitFor(() => expect(screen.getByTestId('yazi-secimi')).toBeTruthy());
  expect(screen.getAllByRole('radio')).toHaveLength(3);
  expect(screen.getByText('Oʻzbekcha')).toBeTruthy();
  expect(screen.getByText('Ўзбекча')).toBeTruthy();
  expect(screen.getByRole('radio', { name: new RegExp(`^${m.otomatik}`) }).props.accessibilityState.checked).toBe(true);

  fireEvent.press(screen.getByText(m.kiril));
  await waitFor(() => expect(mockKaydet).toHaveBeenCalledWith('cyrl'));
  await waitFor(() => expect(mockYay).toHaveBeenCalledWith({ lat: 41.3, lng: 69.2 }));

  fireEvent.press(screen.getByText(m.otomatik));
  await waitFor(() => expect(mockKaydet).toHaveBeenLastCalledWith(null));
});

it('Kazakçada kayıtlı Latin seçimi işaretli; seçim değişmediyse planlar yenilenmez', async () => {
  act(() => {
    aktifDiliKur('kk');
  });
  const m = sozluk('kk').dilAyar.yazi;
  mockSecim.mockResolvedValue('latn');
  mockKaydet.mockResolvedValue(false);
  ciz('kk');
  await waitFor(() => expect(screen.getByTestId('yazi-secimi')).toBeTruthy());
  expect(screen.getByText('Қазақша')).toBeTruthy();
  expect(screen.getByText('Qazaqşa')).toBeTruthy();
  expect(screen.getByRole('radio', { name: new RegExp(`^${m.latin}`) }).props.accessibilityState.checked).toBe(true);

  fireEvent.press(screen.getByText(m.latin));
  await waitFor(() => expect(mockKaydet).toHaveBeenCalledWith('latn'));
  expect(mockYay).not.toHaveBeenCalled();
});
