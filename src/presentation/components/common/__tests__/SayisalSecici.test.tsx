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

  it('max sınırını aşmaz', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <SayisalSecici deger={10} min={0} max={10} onChange={onChange} renk="#000" />
    );
    fireEvent.press(getByLabelText('Artır'));
    expect(onChange).not.toHaveBeenCalledWith(11);
  });
});
