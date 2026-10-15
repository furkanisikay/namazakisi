import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

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
  it('artır butonu bir sonraki adım katına oturur (5, adım 2 → 6)', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <SayisalSecici deger={5} min={0} max={10} adim={2} onChange={onChange} renk="#000" />
    );
    fireEvent.press(getByLabelText('Artır'));
    expect(onChange).toHaveBeenCalledWith(6);
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
  it('iç test senaryosu: 1 dk ve 5 adımla artır 5 verir (6 değil)', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <SayisalSecici deger={1} min={1} max={60} adim={5} onChange={onChange} renk="#000" />
    );
    fireEvent.press(getByLabelText('Artır'));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('muhafız eşiği 3 dk (ızgara dışı): artır 5, azalt min', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <SayisalSecici deger={3} min={1} max={9} adim={5} onChange={onChange} renk="#000" />
    );
    fireEvent.press(getByLabelText('Artır'));
    expect(onChange).toHaveBeenLastCalledWith(5);
    const simdi = Date.now();
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(simdi + 1000);
    try {
      fireEvent.press(getByLabelText('Azalt'));
      expect(onChange).toHaveBeenLastCalledWith(1);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('erişilebilirlik increment/decrement eylemleri adım atar', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <SayisalSecici deger={10} min={0} max={60} adim={5} onChange={onChange} renk="#000" aciklama="Süre" />
    );
    const kutu = getByLabelText('Süre');
    expect(kutu.props.accessibilityRole).toBe('adjustable');
    fireEvent(kutu, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(onChange).toHaveBeenLastCalledWith(15);
    fireEvent(kutu, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  describe('basılı tutma (yalıtılmış bileşen, sahte zamanlayıcı)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    it('tutuş boyunca değer seçicide değişir, onChange bırakınca TEK kez çağrılır', () => {
      const onChange = jest.fn();
      const { getByLabelText, getByText } = render(
        <SayisalSecici deger={10} min={0} max={100} adim={5} onChange={onChange} renk="#000" />
      );
      const artir = getByLabelText('Artır');
      fireEvent(artir, 'longPress');
      expect(getByText('15')).toBeTruthy();
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(onChange).not.toHaveBeenCalled();
      fireEvent(artir, 'pressOut');
      expect(onChange).toHaveBeenCalledTimes(1);
      const son = onChange.mock.calls[0][0];
      expect(son).toBeGreaterThan(20);
      expect(son % 5).toBe(0);
      // Bırakıştan sonra zamanlayıcı durmuş olmalı.
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('sınıra dayanınca kendiliğinden durur ve sınır değerini yazar', () => {
      const onChange = jest.fn();
      const { getByLabelText } = render(
        <SayisalSecici deger={50} min={0} max={60} adim={5} onChange={onChange} renk="#000" />
      );
      fireEvent(getByLabelText('Artır'), 'longPress');
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(60);
    });

    it('hızlanır: 2 sn tutuşta sabit aralığın üretebileceğinden fazla adım atılır', () => {
      const onChange = jest.fn();
      const { getByLabelText } = render(
        <SayisalSecici deger={0} min={0} max={1000} adim={1} onChange={onChange} renk="#000" />
      );
      const artir = getByLabelText('Artır');
      fireEvent(artir, 'longPress');
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      fireEvent(artir, 'pressOut');
      // Sabit 220 ms ile 2 sn'de ~10 adım olurdu; hızlanma bunu belirgin aşar.
      expect(onChange.mock.calls[0][0]).toBeGreaterThan(14);
    });

    it('unmount zamanlayıcıyı temizler', () => {
      const onChange = jest.fn();
      const { getByLabelText, unmount } = render(
        <SayisalSecici deger={0} min={0} max={1000} onChange={onChange} renk="#000" />
      );
      const hataSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      try {
        fireEvent(getByLabelText('Artır'), 'longPress');
        unmount();
        // Zamanlayıcı temizlenmeseydi tekrar döngüsü kendini yeniden kurardı.
        const kurSpy = jest.spyOn(global, 'setTimeout');
        act(() => {
          jest.advanceTimersByTime(5000);
        });
        expect(kurSpy).not.toHaveBeenCalled();
        kurSpy.mockRestore();
        // Tutuş yarıda kaldı: ne yazım ne de unmount sonrası setState uyarısı.
        expect(onChange).not.toHaveBeenCalled();
        expect(hataSpy).not.toHaveBeenCalled();
      } finally {
        hataSpy.mockRestore();
      }
    });
  });
});
