import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TaniOnizleme } from '../TaniOnizleme';

jest.mock('../../../../core/theme', () => ({ useRenkler: () => ({
  arkaplan: '#FAFAFA', kartArkaplan: '#FFF', metin: '#000', metinIkincil: '#777',
  birincil: '#4CAF50', sinir: '#E0E0E0', durum: { basarili: '#4CAF50', hata: '#F44336', uyari: '#FFC107' },
}) }));
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: (_gorunur: boolean, _onKapat: () => void) => {} }));
const mockAc = jest.fn((_o?: unknown) => Promise.resolve('gonderildi'));
jest.mock('../../../../domain/services/TaniGonderServisi', () => ({ taniEpostasiniAc: (o: unknown) => mockAc(o) }));

// FontAwesome5 mock'u
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: any) => <Text>{props.name}</Text>;
});
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { FontAwesome5: (props: any) => <Text>{props.name}</Text> };
});

describe('TaniOnizleme', () => {
  beforeEach(() => mockAc.mockClear());

  test('şeffaf içerik: gönderilmeyecekler listelenir', () => {
    const { getByText } = render(<TaniOnizleme gorunur baglam="x" onKapat={() => {}} onLoglariGor={() => {}} />);
    expect(getByText('Gönderilmeyecek')).toBeTruthy();
    expect(getByText(/Namaz, kaza, puan/)).toBeTruthy();
  });

  test('E-postayı aç → servis konumDahil:false ile çağrılır', async () => {
    const { getByText } = render(<TaniOnizleme gorunur baglam="x" onKapat={() => {}} onLoglariGor={() => {}} />);
    fireEvent.press(getByText('E-postayı aç'));
    await waitFor(() => expect(mockAc).toHaveBeenCalledWith(expect.objectContaining({ konumDahil: false })));
  });

  test('sonuç "gonderildi" → teyit (başarı) modalı görünür + onKapat çağrılır', async () => {
    mockAc.mockResolvedValueOnce('gonderildi');
    const onKapat = jest.fn();
    const { getByText } = render(<TaniOnizleme gorunur baglam="x" onKapat={onKapat} onLoglariGor={() => {}} />);
    fireEvent.press(getByText('E-postayı aç'));
    await waitFor(() => expect(getByText('Teşekkürler')).toBeTruthy());
    expect(onKapat).toHaveBeenCalled();
  });

  test('sonuç "hata" → hata modalı görünür + önizleme açık kalır (onKapat çağrılmaz)', async () => {
    mockAc.mockResolvedValueOnce('hata');
    const onKapat = jest.fn();
    const { getByText } = render(<TaniOnizleme gorunur baglam="x" onKapat={onKapat} onLoglariGor={() => {}} />);
    fireEvent.press(getByText('E-postayı aç'));
    await waitFor(() => expect(getByText('Gönderilemedi')).toBeTruthy());
    expect(onKapat).not.toHaveBeenCalled();
  });
});
