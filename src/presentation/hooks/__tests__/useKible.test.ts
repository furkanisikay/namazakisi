import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useKible } from '../useKible';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';

// Mocklar
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchHeadingAsync: jest.fn(),
  Accuracy: {
    Balanced: 3,
  },
}));
jest.mock('expo-sensors', () => ({
  Magnetometer: {
    setUpdateInterval: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeAllListeners: jest.fn(),
  },
}));

// Adhan kutuphanesini mocklamaya gerek yok, hesaplamalari (pure function) test edebiliriz
// veya sabit bir konum verip beklenen kible acisini kontrol edebiliriz.
// Adhan'in Qibla fonksiyonu deterministiktir.

describe('useKible Hook', () => {
  let headingCallback: ((data: any) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    headingCallback = null;

    // watchHeadingAsync mock - callback'i yakala
    (Location.watchHeadingAsync as jest.Mock).mockImplementation(async (cb) => {
      headingCallback = cb;
      return { remove: jest.fn() };
    });
  });

  it('baslangicta yukleniyor durumunda olmalidir', () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockReturnValue(new Promise(() => { })); // Asili kalsin
    const { result } = renderHook(() => useKible());
    expect(result.current.yukleniyor).toBe(true);
  });

  it('konum izni verilmezse hata dondurmelidir', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useKible());

    await waitFor(() => {
      expect(result.current.yukleniyor).toBe(false);
    });

    expect(result.current.hata).toBeTruthy();
    expect(result.current.izinVerildi).toBe(false);
  });

  it('izin verilip konum alindiginda izinVerildi true, hata null olmali ve kible acisi hesaplanmalidir', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: {
        latitude: 21.4225,
        longitude: 39.8262,
      },
    });

    const { result } = renderHook(() => useKible());

    await waitFor(() => {
      expect(result.current.yukleniyor).toBe(false);
    });

    expect(result.current.izinVerildi).toBe(true);
    expect(result.current.hata).toBeNull();

    // Test adi "kible acisini hesaplamalidir" diyor; govde de bunu gercekten dogrulasin.
    // Kabe'ye cok yakin bu koordinat icin adhan fiziki referans degeri 324.89...'dur
    // (Qibla(21.4225, 39.8262) === 324.8923). Boylece izin/konum yolunun sonunda
    // gercekten bir aci hesaplandigi (0'da kalmadigi) kanitlanir.
    expect(result.current.kibleAcisi).toBeCloseTo(324.89, 1);
  });

  it('Istanbul icin kible acisini dogru hesaplamalidir', async () => {
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

    // adhan deterministiktir; gevsek aralik yerine fiziki referans degere siki bagla.
    // Bagimsiz dogrulama: Qibla(new Coordinates(41.0082, 28.9784)) === 151.6206...
    expect(result.current.kibleAcisi).toBeCloseTo(151.62, 1);
  });

  it('Berlin icin kible acisini dogru hesaplamalidir', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 52.52, longitude: 13.405 },
    });

    const { result } = renderHook(() => useKible());

    await waitFor(() => {
      expect(result.current.kibleAcisi).toBeGreaterThan(0);
    });

    // adhan fiziki referans deger: Qibla(52.52, 13.405) === 136.6849...
    // Ikinci konum, hesabin tek koordinata ezberlenmedigini (gercekten enlem/boylama
    // bagli oldugunu) kanitlar.
    expect(result.current.kibleAcisi).toBeCloseTo(136.68, 1);
  });

  it('Sydney icin kible acisini dogru hesaplamalidir (guney yarimkure, Mekke batida)', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: -33.8688, longitude: 151.2093 },
    });

    const { result } = renderHook(() => useKible());

    await waitFor(() => {
      expect(result.current.kibleAcisi).toBeGreaterThan(0);
    });

    // adhan fiziki referans deger: Qibla(-33.8688, 151.2093) === 277.4996...
    // Sydney'den Mekke bati-kuzeybati yondedir; bu anchor great-circle yonelimini
    // (sadece "kuzeydogu civari" degil) gercekten dogrular.
    expect(result.current.kibleAcisi).toBeCloseTo(277.50, 1);
  });

  it('heading verisi geldiginde pusula yonelimini guncellemelidir', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 41, longitude: 29 },
    });

    const { result } = renderHook(() => useKible());

    await waitFor(() => {
      expect(Location.watchHeadingAsync).toHaveBeenCalled();
    });

    act(() => {
      // trueHeading 90 derece (doguya bakiyor)
      if (headingCallback) {
        headingCallback({ trueHeading: 90, magHeading: 92 });
      }
    });

    // trueHeading kullanilmali (manyetik sapma duzeltmesi dahil)
    expect(result.current.pusulaYonelimi).toBeCloseTo(90, 0);
  });

  it('trueHeading negatifse magHeading kullanilmalidir', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 41, longitude: 29 },
    });

    const { result } = renderHook(() => useKible());

    await waitFor(() => {
      expect(Location.watchHeadingAsync).toHaveBeenCalled();
    });

    act(() => {
      // trueHeading negatif (kullanilabilir degil), magHeading kullanilmali
      if (headingCallback) {
        headingCallback({ trueHeading: -1, magHeading: 45 });
      }
    });

    expect(result.current.pusulaYonelimi).toBeCloseTo(45, 0);
  });
});
