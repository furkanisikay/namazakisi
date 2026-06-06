import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    kartArkaplan: '#fff',
    metin: '#000',
    metinIkincil: '#888',
    sinir: '#ccc',
    arkaplan: '#eee',
    birincil: '#4caf50',
  }),
}));

import { SayiGirisModali } from '../SayiGirisModali';

const temelProps = {
  gorunur: true,
  baslik: 'Test Başlık',
  aciklama: 'Açıklama',
  placeholder: 'Örn',
  onayMetni: 'Kaydet',
  deger: '5',
  onDegisim: jest.fn(),
  onIptal: jest.fn(),
  onOnay: jest.fn(),
};

describe('SayiGirisModali', () => {
  it('onay butonu onOnay çağırır', () => {
    const onOnay = jest.fn();
    const { getByLabelText } = render(<SayiGirisModali {...temelProps} onOnay={onOnay} />);
    fireEvent.press(getByLabelText('Kaydet'));
    expect(onOnay).toHaveBeenCalled();
  });

  it('iptal butonu onIptal çağırır', () => {
    const onIptal = jest.fn();
    const { getByLabelText } = render(<SayiGirisModali {...temelProps} onIptal={onIptal} />);
    fireEvent.press(getByLabelText('İptal'));
    expect(onIptal).toHaveBeenCalled();
  });
});
