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

  it('throttle: 100ms içindeki ikinci basışı yutar, süre dolunca tekrar çağırır', () => {
    // Bileşenin tek non-trivial koruması: sonTiklamaRef + THROTTLE_SURESI (100ms).
    // Date.now sabitlenerek art arda basışların yutulması deterministik doğrulanır.
    const nowSpy = jest.spyOn(Date, 'now');
    try {
      const onChange = jest.fn();
      const { getByLabelText } = render(
        <SayisalSecici deger={5} min={0} max={10} adim={1} onChange={onChange} renk="#000" />
      );

      // t=1000: ilk basış geçer
      nowSpy.mockReturnValue(1000);
      fireEvent.press(getByLabelText('Artır'));
      expect(onChange).toHaveBeenCalledTimes(1);

      // t=1050 (ilk basıştan 50ms sonra, <100ms): YUTULMALI
      nowSpy.mockReturnValue(1050);
      fireEvent.press(getByLabelText('Artır'));
      expect(onChange).toHaveBeenCalledTimes(1);

      // t=1100 (ilk basıştan tam 100ms sonra, eşik DAHİL değil çünkü < kontrolü): geçmeli
      nowSpy.mockReturnValue(1100);
      fireEvent.press(getByLabelText('Artır'));
      expect(onChange).toHaveBeenCalledTimes(2);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('min sınırında azalt butonu disabled ve arkaplanı sinir rengindedir', () => {
    // deger <= min iken Azalt devre dışı; arkaplan renk yerine sinir rengine döner (#E0E0E0).
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <SayisalSecici deger={0} min={0} max={10} onChange={onChange} renk="#1565C0" />
    );
    const azaltButonu = getByLabelText('Azalt');
    expect(azaltButonu.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true })
    );
    expect(azaltButonu.props.style).toEqual(
      expect.objectContaining({ backgroundColor: '#E0E0E0' })
    );
  });

  it('max sınırında artır butonu disabled ve arkaplanı sinir rengindedir', () => {
    // deger >= max iken Artır devre dışı; arkaplan renk yerine sinir rengine döner (#E0E0E0).
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <SayisalSecici deger={10} min={0} max={10} onChange={onChange} renk="#1565C0" />
    );
    const artirButonu = getByLabelText('Artır');
    expect(artirButonu.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true })
    );
    expect(artirButonu.props.style).toEqual(
      expect.objectContaining({ backgroundColor: '#E0E0E0' })
    );
  });

  it('sınır dışındayken aktif butonun arkaplanı verilen renktir', () => {
    // deger sınırların ortasındayken her iki buton da aktif ve arkaplanı `renk` olur.
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <SayisalSecici deger={5} min={0} max={10} onChange={onChange} renk="#1565C0" />
    );
    const azaltButonu = getByLabelText('Azalt');
    const artirButonu = getByLabelText('Artır');
    expect(azaltButonu.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: false })
    );
    expect(azaltButonu.props.style).toEqual(
      expect.objectContaining({ backgroundColor: '#1565C0' })
    );
    expect(artirButonu.props.style).toEqual(
      expect.objectContaining({ backgroundColor: '#1565C0' })
    );
  });

  it('görüntülenen değer ve varsayılan birim (dk) doğru render edilir', () => {
    // Kullanıcıya gösterilen asıl bilgi: deger ve birim metni.
    const onChange = jest.fn();
    const { getByText } = render(
      <SayisalSecici deger={42} min={0} max={100} onChange={onChange} renk="#000" />
    );
    expect(getByText('42')).toBeTruthy();
    expect(getByText('dk')).toBeTruthy();
  });

  it('özel birim prop olarak verildiğinde onu render eder', () => {
    const onChange = jest.fn();
    const { getByText, queryByText } = render(
      <SayisalSecici deger={3} min={0} max={10} birim="saat" onChange={onChange} renk="#000" />
    );
    expect(getByText('3')).toBeTruthy();
    expect(getByText('saat')).toBeTruthy();
    expect(queryByText('dk')).toBeNull();
  });
});
