import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// @expo/vector-icons'i sade string'e indir (render sırasında native font yüklemesini engeller)
jest.mock('@expo/vector-icons', () => ({ FontAwesome5: 'FontAwesome5' }));

const mockDispatch = jest.fn();
let durum = { sorunAlgilandi: true, baglam: 'Kaza yüklenemedi', hatirlatmaAcik: true, oturumdaGosterildi: false };
jest.mock('../../../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (s: (st: { tani: typeof durum }) => unknown) => s({ tani: durum }),
}));
jest.mock('../../../store/taniSlice', () => ({ taniModaliKapat: () => ({ type: 'kapat' }), hatirlatmayiGuncelle: (v: boolean) => ({ type: 'guncelle', payload: v }) }));
jest.mock('../../../../core/theme', () => ({ useRenkler: () => ({ kartArkaplan: '#FFF', metin: '#000', metinIkincil: '#777', birincil: '#4CAF50', birincilMetin: '#FFF', arkaplan: '#FAFAFA', sinir: '#E0E0E0', durum: { uyari: '#FFC107', basarili: '#4CAF50' } }) }));
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: () => {} }));
jest.mock('../TaniOnizleme', () => ({ TaniOnizleme: () => null }));

import { TaniBildirModali } from '../TaniBildirModali';

describe('TaniBildirModali', () => {
  beforeEach(() => mockDispatch.mockClear());

  test('başlık görünür', () => {
    const { getByText } = render(<TaniBildirModali />);
    expect(getByText('Bir sorun oluştu')).toBeTruthy();
  });

  test('"Bir daha sorma" → hatırlatma kapatılır', () => {
    const { getByText } = render(<TaniBildirModali />);
    fireEvent.press(getByText('Bir daha sorma'));
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'guncelle', payload: false });
  });
});
