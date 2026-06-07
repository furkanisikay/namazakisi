import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => 'FontAwesome5');
jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    kartArkaplan: '#FFFFFF',
    sinir: '#E0E0E0',
    metin: '#212121',
    metinIkincil: '#757575',
  }),
}));

import { SayisalSecici } from '../SayisalSecici';

describe('SayisalSecici', () => {
  it('artır butonu onChange(deger + adim) çağırır', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <SayisalSecici deger={5} min={0} max={10} adim={2} onChange={onChange} renk="#000" />
    );
    fireEvent.press(getByLabelText('Artır'));
    expect(onChange).toHaveBeenCalledWith(7);
  });

  it('azalt butonu onChange(deger - adim) çağırır', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <SayisalSecici deger={5} min={0} max={10} onChange={onChange} renk="#000" />
    );
    fireEvent.press(getByLabelText('Azalt'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('artır clamp ile max değeri üretir', () => {
    // adim, max sınırını aştırsa bile Math.min ile max'a kelepçelenmeli
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <SayisalSecici deger={9} min={0} max={10} adim={5} onChange={onChange} renk="#000" />
    );
    fireEvent.press(getByLabelText('Artır')); // Math.min(10, 9+5)=10
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('max değerindeyken artır butonu onChange çağırmaz', () => {
    // deger >= max iken buton devre dışı; onChange hiç çağrılmamalı
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <SayisalSecici deger={10} min={0} max={10} onChange={onChange} renk="#000" />
    );
    fireEvent.press(getByLabelText('Artır'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('azalt clamp ile min değeri üretir', () => {
    // adim, min sınırını aştırsa bile Math.max ile min'e kelepçelenmeli
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <SayisalSecici deger={1} min={0} max={10} adim={5} onChange={onChange} renk="#000" />
    );
    fireEvent.press(getByLabelText('Azalt')); // Math.max(0, 1-5)=0
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('min değerindeyken azalt butonu onChange çağırmaz', () => {
    // deger <= min iken buton devre dışı; onChange hiç çağrılmamalı
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <SayisalSecici deger={0} min={0} max={10} onChange={onChange} renk="#000" />
    );
    fireEvent.press(getByLabelText('Azalt'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
