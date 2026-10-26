/**
 * Rakam seçimi (Ayarlar > Dil): yalnız Arapçada görünür; seçim kaydedilir. Metin kapısı
 * takılıyken "0123" örneği Doğu Arap rakamı etkinken de Batı rakamıyla kalır (`aciklamaRakamKoru`).
 */
import * as React from 'react';
import { act, fireEvent, render, screen, setupAllComponents, waitFor } from 'react-native-css-interop/test';

jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return ({ name }: { name: string }) => <Text>{`[${name}]`}</Text>;
});
const RENKLER = { birincil: '#4CAF50', arkaplan: '#FAFAFA', kartArkaplan: '#FFFFFF', metin: '#212121', metinIkincil: '#757575', sinir: '#E0E0E0' };
jest.mock('../../../../core/theme', () => ({ useRenkler: () => RENKLER }));
jest.mock('../../../hooks/useHareketAzalt', () => ({ useHareketAzalt: () => true }));
jest.mock('../../common/KisaBildirim', () => ({ kisaBildirimGoster: jest.fn() }));
jest.mock('expo-font', () => ({ useFonts: () => [true] }));

const mockSecim = jest.fn(() => Promise.resolve(null as string | null));
const mockKaydet = jest.fn((_s: string | null) => Promise.resolve(true));
jest.mock('../../../../domain/services/DilServisi', () => ({
  DilServisi: {
    rakamSecimi: () => mockSecim(),
    rakamKaydet: (s: string | null) => mockKaydet(s),
  },
}));

import { RakamSecimi } from '../RakamSecimi';
import { aktifDiliKur, aktifDilSifirla } from '../../../../core/dil/aktifDil';
import { metinKapisiniKur } from '../../metin/MetinKapisi';

let kaldir: () => void = () => undefined;
beforeEach(() => {
  setupAllComponents();
  kaldir = metinKapisiniKur();
  mockSecim.mockReset().mockResolvedValue(null);
  mockKaydet.mockReset().mockResolvedValue(true);
});
afterEach(() => {
  kaldir();
  act(() => aktifDilSifirla());
});

it('Arapça dışında çizilmez', async () => {
  render(<RakamSecimi kod="fr" />);
  await act(async () => undefined);
  expect(screen.queryByTestId('rakam-secimi')).toBeNull();
  expect(mockSecim).not.toHaveBeenCalled();
});

it('Arapçada üç seçenek; örnekler doğru rakamla, seçim kaydedilir ve otomatik seçimi siler', async () => {
  act(() => {
    aktifDiliKur('ar');
  });
  render(<RakamSecimi kod="ar" />);
  await waitFor(() => expect(screen.getByTestId('rakam-secimi')).toBeTruthy());
  // Doğu Arap örneği ve KORUNAN Batı örneği; Batı örneği kapıdan geçse "٠١٢٣…" olurdu.
  expect(screen.getAllByText('٠١٢٣٤٥٦٧٨٩')).toHaveLength(1);
  expect(screen.getByText('0123456789')).toBeTruthy();
  expect(screen.getByRole('radio', { name: /^By country/ }).props.accessibilityState.checked).toBe(true);

  fireEvent.press(screen.getByText('Western numerals'));
  await waitFor(() => expect(mockKaydet).toHaveBeenCalledWith('latn'));
  fireEvent.press(screen.getByText('By country'));
  await waitFor(() => expect(mockKaydet).toHaveBeenLastCalledWith(null));
});
