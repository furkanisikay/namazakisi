import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useKible } from '../useKible';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';

// Mocklar
jest.mock('expo-location');
jest.mock('expo-sensors', () => ({
  Magnetometer: {
    setUpdateInterval: jest.fn(),
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
  },
}));

// Adhan kütüphanesini mocklamaya gerek yok, hesaplamaları (pure function) test edebiliriz
// veya sabit bir konum verip beklenen kıble açısını kontrol edebiliriz.
// Adhan'ın Qibla fonksiyonu deterministiktir.

describe('useKible Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('başlangıçta yükleniyor durumunda olmalıdır', () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockReturnValue(new Promise(() => {})); // Asılı kalsın
    const { result } = renderHook(() => useKible());
    expect(result.current.yukleniyor).toBe(true);
  });

  it('konum izni verilmezse hata döndürmelidir', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useKible());

    await waitFor(() => {
      expect(result.current.yukleniyor).toBe(false);
    });

    expect(result.current.hata).toBeTruthy();
    expect(result.current.izinVerildi).toBe(false);
  });

  it('konum izni verilirse ve konum alınırsa kıble açısını hesaplamalıdır', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: {
        latitude: 21.4225, // Mekke'ye yakın bir yer (Mekke: 21.4225° N, 39.8262° E)
        longitude: 39.8262,
      },
    });

    const { result } = renderHook(() => useKible());

    await waitFor(() => {
      expect(result.current.yukleniyor).toBe(false);
    });

    expect(result.current.izinVerildi).toBe(true);
    expect(result.current.hata).toBeNull();
    // Mekke'de kıble açısı tanımsız veya 0 olabilir, ama hook bir sayı dönmeli.
    // Başka bir yer deneyelim: İstanbul (41.0082, 28.9784) -> Kıble yaklaşık 147-150 derece arası olmalı
  });

  it('İstanbul için kıble açısını doğru hesaplamalıdır', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: {
        latitude: 41.0082,
        longitude: 28.9784,
      },
    });

    const { result } = renderHook(() => useKible());

    await waitFor(() => {
      expect(result.current.kibleAcisi).toBeGreaterThan(0);
    });

    // Yaklaşık değer kontrolü
    expect(Math.round(result.current.kibleAcisi)).toBeGreaterThan(140);
    expect(Math.round(result.current.kibleAcisi)).toBeLessThan(160);
  });

  it('manyetometre verisi geldiğinde pusula yönelimini güncellemelidir', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 41, longitude: 29 },
    });

    let listenerCallback: (data: any) => void;
    (Magnetometer.addListener as jest.Mock).mockImplementation((cb) => {
      listenerCallback = cb;
      return { remove: jest.fn() };
    });

    const { result } = renderHook(() => useKible());

    await waitFor(() => {
      expect(Magnetometer.addListener).toHaveBeenCalled();
    });

    act(() => {
      // Kuzey (x=0, y=-1 gibi düşünülebilir ama sensör verisine göre değişir)
      // Kodumuzda: atan2(y, x) * 180/PI - 90
      // x=0, y=1 => atan2(1, 0) = 90 derece. 90 - 90 = 0 derece.
      if (listenerCallback) {
        listenerCallback({ x: 0, y: 1, z: 0 });
      }
    });

    // Hook içinde logic: angle = angle - 90;
    // atan2(1, 0) = 90 deg. 90-90 = 0.
    expect(result.current.pusulaYonelimi).toBeCloseTo(0, 1);
  });
});
