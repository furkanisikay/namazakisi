import React from 'react';
import { act, render, renderHook } from '@testing-library/react-native';
import { VurguSaglayici, useVurguBaglami } from '../VurguSaglayici';

describe('VurguSaglayici / useVurguBaglami', () => {
  it('sağlayıcı dışında çağrılırsa hata fırlatır', () => {
    // console.error gürültüsünü sustur (React, hata fırlatan render'ı loglar)
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useVurguBaglami())).toThrow(
      'useVurguBaglami yalnızca VurguSaglayici içinde kullanılabilir',
    );
    consoleSpy.mockRestore();
  });

  it('başlangıçta hedefCapaId undefined ve tuketildiMi false döner', () => {
    const { result } = renderHook(() => useVurguBaglami(), {
      wrapper: ({ children }) => <VurguSaglayici>{children}</VurguSaglayici>,
    });

    expect(result.current.hedefCapaId).toBeUndefined();
    expect(result.current.tuketildiMi).toBe(false);
    expect(result.current.scrollRef).toEqual({ current: null });
  });

  it('hedefiAyarla hedefCapaId yazar ve tuketildiMi sıfırlar', () => {
    const { result } = renderHook(() => useVurguBaglami(), {
      wrapper: ({ children }) => <VurguSaglayici>{children}</VurguSaglayici>,
    });

    act(() => result.current.vurguyuTuket());
    expect(result.current.tuketildiMi).toBe(true);

    act(() => result.current.hedefiAyarla('konumModu'));
    expect(result.current.hedefCapaId).toBe('konumModu');
    // Yeni hedef ayarlanınca tüketim durumu sıfırlanmalı (yeni vurgu tekrar çalışabilsin)
    expect(result.current.tuketildiMi).toBe(false);
  });

  it('vurguyuTuket tuketildiMi değerini true yapar', () => {
    const { result } = renderHook(() => useVurguBaglami(), {
      wrapper: ({ children }) => <VurguSaglayici>{children}</VurguSaglayici>,
    });

    expect(result.current.tuketildiMi).toBe(false);
    act(() => result.current.vurguyuTuket());
    expect(result.current.tuketildiMi).toBe(true);
  });

  it('scrollRef referansı yeniden render sonrasında da aynı kalır (stabil ref)', () => {
    let dışScrollRef: unknown;
    const Cocuk: React.FC = () => {
      const baglam = useVurguBaglami();
      dışScrollRef = baglam.scrollRef;
      return null;
    };

    const { rerender } = render(
      <VurguSaglayici>
        <Cocuk />
      </VurguSaglayici>,
    );
    const ilkRef = dışScrollRef;

    rerender(
      <VurguSaglayici>
        <Cocuk />
      </VurguSaglayici>,
    );

    expect(dışScrollRef).toBe(ilkRef);
  });
});
