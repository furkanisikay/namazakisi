/**
 * Ayarlar satırının Now Bar / canlı etkinlik özeti (issue #282, iOS #295).
 * iOS'ta satır yalnız build canlı etkinlik taşıyorsa görünür; özet iPhone'da
 * desteklenmeyen öğeleri (iftar/sahur/seri) saymaz.
 */
import { Platform } from 'react-native';
import { renderHook } from '@testing-library/react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { VARSAYILAN_NOW_BAR_AYARLARI, nowBarAyariniBirlestir } from '../../../core/sayac/nowBar';
import { useNowBarOzeti } from '../useNowBarOzeti';

jest.mock('../../store/hooks');
jest.mock('../../store/nowBarSlice', () => ({ nowBarAyarlariniYukle: jest.fn(() => ({ type: 'nowBar/yukle' })) }));

const siri = require('../../../../modules/expo-siri-kisayollari/src') as { canliEtkinlikDestekli: jest.Mock };

const kur = (ayarlar = VARSAYILAN_NOW_BAR_AYARLARI) => {
  (useAppDispatch as jest.Mock).mockReturnValue(jest.fn());
  (useAppSelector as jest.Mock).mockImplementation((sec: (s: unknown) => unknown) =>
    sec({ nowBar: { ayarlar, yuklendi: true } })
  );
  return renderHook(() => useNowBarOzeti()).result.current;
};

describe('useNowBarOzeti', () => {
  afterEach(() => {
    siri.canliEtkinlikDestekli.mockReturnValue(false);
  });

  it('Android: her zaman kullanılabilir, açık öğeler sayılır', () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    expect(kur()).toEqual({ kullanilabilir: true, ozet: '7 öğe açık' });
  });

  it('iOS: canlı etkinlik desteği yoksa (widget bayrağı kapalı) satır çizilmez', () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    siri.canliEtkinlikDestekli.mockReturnValue(false);
    expect(kur().kullanilabilir).toBe(false);
  });

  it('iOS: destek varsa iftar/sahur/seri sayılmaz', () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    siri.canliEtkinlikDestekli.mockReturnValue(true);
    const ayarlar = nowBarAyariniBirlestir(VARSAYILAN_NOW_BAR_AYARLARI, 'seri', { acik: true });
    expect(kur(ayarlar)).toEqual({ kullanilabilir: true, ozet: '5 öğe açık' });
  });
});
