/**
 * Rakam seçimi (Ayarlar > Dil): yalnız yerel rakamlı dilde (Arapça, Bengalce) görünür; seçim
 * kaydedilir. Metin kapısı takılıyken "0123" örneği yerel rakam etkinken de Batı rakamıyla kalır
 * (`aciklamaRakamKoru`).
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
import { aktifDiliKur, aktifDilSifirla, sozluk } from '../../../../core/dil/aktifDil';

const AR = sozluk('ar').rakam;
const BN = sozluk('bn').rakam;
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

it('yerel rakamı olmayan dilde (Fransızca, Urduca) çizilmez', async () => {
  render(<RakamSecimi kod="fr" />);
  await act(async () => undefined);
  expect(screen.queryByTestId('rakam-secimi')).toBeNull();
  render(<RakamSecimi kod="ur" />);
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
  expect(screen.getByRole('radio', { name: new RegExp(`^${AR.otomatik}`) }).props.accessibilityState.checked).toBe(true);

  fireEvent.press(screen.getByText(AR.bati));
  await waitFor(() => expect(mockKaydet).toHaveBeenCalledWith('latn'));
  fireEvent.press(screen.getByText(AR.otomatik));
  await waitFor(() => expect(mockKaydet).toHaveBeenLastCalledWith(null));
});

it('Bengalcede yerel seçenek Bengalce rakamdır (Doğu Arap değil); seçim "beng" kaydedilir', async () => {
  act(() => {
    aktifDiliKur('bn');
  });
  mockSecim.mockResolvedValue('latn');
  render(<RakamSecimi kod="bn" />);
  await waitFor(() => expect(screen.getByTestId('rakam-secimi')).toBeTruthy());
  expect(screen.getByText('০১২৩৪৫৬৭৮৯')).toBeTruthy();
  expect(screen.getByText('0123456789')).toBeTruthy();
  expect(screen.queryByText('٠١٢٣٤٥٦٧٨٩')).toBeNull();
  expect(screen.getAllByRole('radio')).toHaveLength(3);
  expect(screen.getByRole('radio', { name: new RegExp(`^${BN.bati}`) }).props.accessibilityState.checked).toBe(true);

  fireEvent.press(screen.getByText(BN.dogu));
  await waitFor(() => expect(mockKaydet).toHaveBeenCalledWith('beng'));
});
