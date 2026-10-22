import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';
import {
  BOS_DOGRULUK_IZI,
  DOGRULUK_KARARLI_MS,
  KibleKaresi,
  OZET_ARALIGI_MS,
  dogrulukAdimi,
  kalibrasyonIpucu,
  useKible,
} from '../useKible';
import * as Location from 'expo-location';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  watchHeadingAsync: jest.fn(),
  Accuracy: { Balanced: 3 },
}));

type Dinleyici = (e: { x: number; y: number; z: number }) => void;
const mockSensor = {
  hareket: null as ((e: unknown) => void) | null,
  manyetik: null as Dinleyici | null,
  hareketKaldir: jest.fn(),
  manyetikKaldir: jest.fn(),
};
jest.mock('expo-sensors', () => ({
  DeviceMotion: {
    setUpdateInterval: jest.fn(),
    addListener: jest.fn((cb: (e: unknown) => void) => {
      mockSensor.hareket = cb;
      return { remove: mockSensor.hareketKaldir };
    }),
  },
  Magnetometer: {
    setUpdateInterval: jest.fn(),
    // Çözülmeyen söz: test gövdesi bittikten sonra state yazıp act gürültüsü üretmesin.
    isAvailableAsync: jest.fn(() => new Promise(() => undefined)),
    addListener: jest.fn((cb: Dinleyici) => {
      mockSensor.manyetik = cb;
      return { remove: mockSensor.manyetikKaldir };
    }),
  },
}));

/** Düz telefon, üst kenar `h`° (manyetik) — `kible.test.ts` ile aynı duruş üreticisi. */
function duzOkuma(h: number) {
  const r = (h * Math.PI) / 180;
  const s = Math.sin(r);
  const c = Math.cos(r);
  const alan = { e: 0, n: 27, u: -40 };
  return {
    asagi: { x: 0, y: 0, z: -9.81 },
    manyetik: { x: alan.e * c - alan.n * s, y: alan.e * s + alan.n * c, z: alan.u },
  };
}

describe('useKible', () => {
  let headingCallback: ((data: any) => void) | null = null;
  const headingKaldir = jest.fn();
  let simdi = 1_000_000;
  let saat: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    headingCallback = null;
    mockSensor.hareket = null;
    mockSensor.manyetik = null;
    simdi = 1_000_000;
    saat = jest.spyOn(Date, 'now').mockImplementation(() => simdi);
    (Location.watchHeadingAsync as jest.Mock).mockImplementation(async (cb) => {
      headingCallback = cb;
      return { remove: headingKaldir };
    });
    (Location.getLastKnownPositionAsync as jest.Mock).mockResolvedValue(null);
  });
  afterEach(() => saat.mockRestore());

  /** Bir sensör turu: önce manyetik, sonra hareket (hesap hareket olayında yapılır). */
  const sur = (h: number, ilerleMs = 20) =>
    act(() => {
      simdi += ilerleMs;
      const o = duzOkuma(h);
      mockSensor.manyetik?.(o.manyetik);
      mockSensor.hareket?.({ accelerationIncludingGravity: o.asagi });
    });

  it('başlangıçta yükleniyor', () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useKible());
    expect(result.current.yukleniyor).toBe(true);
  });

  it('konum izni yoksa hata döner ve sensör açılmaz', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    const { result } = renderHook(() => useKible());
    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
    expect(result.current.hata).toBeTruthy();
    expect(result.current.izinVerildi).toBe(false);
    expect(mockSensor.hareket).toBeNull();
    expect(Location.watchHeadingAsync).not.toHaveBeenCalled();
  });

  it('KÖK NEDEN: GPS sabitlemesi BEKLENMEDEN sensörler açılır ve yükleme biter', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockReturnValue(new Promise(() => {})); // GPS hiç gelmiyor
    const { result } = renderHook(() => useKible());
    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
    await waitFor(() => expect(Location.watchHeadingAsync).toHaveBeenCalled());
    expect(mockSensor.hareket).not.toBeNull();
    expect(mockSensor.manyetik).not.toBeNull();
    expect(result.current.kibleAcisi).toBeNull();
  });

  it('son bilinen konum ANINDA kıble açısını verir; taze konum sonra inceltir', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getLastKnownPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 41.0082, longitude: 28.9784 } });
    let tazeCoz: (v: unknown) => void = () => undefined;
    (Location.getCurrentPositionAsync as jest.Mock).mockReturnValue(new Promise((r) => (tazeCoz = r)));
    const { result } = renderHook(() => useKible());
    // Qibla(41.0082, 28.9784) === 151.6206 (adhan fiziki referans)
    await waitFor(() => expect(result.current.kibleAcisi).toBeCloseTo(151.62, 1));
    await act(async () => tazeCoz({ coords: { latitude: 52.52, longitude: 13.405 } }));
    await waitFor(() => expect(result.current.kibleAcisi).toBeCloseTo(136.68, 1)); // Berlin
    expect(result.current.konum).toEqual({ lat: 52.52, lng: 13.405 });
  });

  it.each([
    [21.4225, 39.8262, 324.89],
    [-33.8688, 151.2093, 277.5],
  ])('kıble açısı adhan ile (%d, %d → %d°)', async (lat, lng, beklenen) => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: lat, longitude: lng } });
    const { result } = renderHook(() => useKible());
    await waitFor(() => expect(result.current.kibleAcisi).not.toBeNull());
    expect(result.current.kibleAcisi!).toBeCloseTo(beklenen, 0);
  });

  it('vektör yolu: kare aboneye gider, gerçek kuzey = manyetik + sapma; fark kıble − yön', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 41.0082, longitude: 28.9784 } });
    const { result } = renderHook(() => useKible());
    await waitFor(() => expect(result.current.kibleAcisi).not.toBeNull());
    await waitFor(() => expect(headingCallback).not.toBeNull());
    const kareler: KibleKaresi[] = [];
    act(() => {
      result.current.abone((k) => kareler.push(k));
    });
    // Sapma: gerçek 106, manyetik 100 → +6°
    act(() => headingCallback?.({ trueHeading: 106, magHeading: 100, accuracy: 3 }));
    for (let i = 0; i < 40; i++) sur(140);
    const son = kareler[kareler.length - 1];
    expect(son.baslik).toBeCloseTo(146, 0);
    expect(son.fark!).toBeCloseTo(151.62 - 146, 0);
    expect(son.taban).not.toBeNull();
    expect(son.dikOrani).toBe(0);
  });

  it('TAKILMA KÖK NEDENİ: 50 Hz sensör akışı React state\'ini ~4/sn\'den sık YAZMAZ', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 41.0082, longitude: 28.9784 } });
    let render = 0;
    const { result } = renderHook(() => {
      render += 1;
      return useKible();
    });
    await waitFor(() => expect(result.current.kibleAcisi).not.toBeNull());
    await waitFor(() => expect(mockSensor.hareket).not.toBeNull());
    sur(0);
    const once = render;
    // 1 saniyede 50 farklı okuma (yön sürekli değişiyor)
    for (let i = 0; i < 50; i++) sur(i * 2);
    const sure = 1000;
    expect(render - once).toBeLessThanOrEqual(Math.ceil(sure / OZET_ARALIGI_MS) + 2);
  });

  it('hizaya girince özet HEMEN (kısma beklemeden) güncellenir', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 41.0082, longitude: 28.9784 } });
    const { result } = renderHook(() => useKible());
    await waitFor(() => expect(result.current.kibleAcisi).not.toBeNull());
    await waitFor(() => expect(mockSensor.hareket).not.toBeNull());
    for (let i = 0; i < 50; i++) sur(140); // fark ≈ 11,6° → hizada değil
    expect(result.current.ozet.hizali).toBe(false);
    let son: KibleKaresi | null = null;
    act(() => {
      result.current.abone((k) => (son = k));
    });
    // Her adımda derece değişir (özet sık yazılmak ister); hizaya girdiği İLK karede özet
    // kısma penceresini beklemeden hizalı olmalı.
    let girdi = false;
    for (let i = 0; i < 60 && !girdi; i++) {
      sur(152, 8);
      if (son && Math.abs((son as KibleKaresi).fark!) < 10) {
        girdi = true;
        expect(result.current.ozet.hizali).toBe(true);
      }
    }
    expect(girdi).toBe(true);
  });

  it('manyetometre susarsa yön konum servisinden gelir (kamera tabanı yok)', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 41.0082, longitude: 28.9784 } });
    const { result } = renderHook(() => useKible());
    await waitFor(() => expect(headingCallback).not.toBeNull());
    const kareler: KibleKaresi[] = [];
    act(() => {
      result.current.abone((k) => kareler.push(k));
    });
    for (let i = 0; i < 10; i++) {
      act(() => {
        simdi += 50;
        headingCallback?.({ trueHeading: 200, magHeading: 194, accuracy: 2 });
      });
    }
    const son = kareler[kareler.length - 1];
    expect(son.baslik).toBeCloseTo(200, 0);
    expect(son.taban).toBeNull();
  });

  it('eksen denetimi: düz tutuşta platform pusulasıyla sürekli uyuşmazlık → konum yönüne düşer', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 41.0082, longitude: 28.9784 } });
    const { result } = renderHook(() => useKible());
    await waitFor(() => expect(headingCallback).not.toBeNull());
    await waitFor(() => expect(mockSensor.hareket).not.toBeNull());
    for (let i = 0; i < 60; i++) {
      act(() => headingCallback?.({ trueHeading: 300, magHeading: 300, accuracy: 3 }));
      sur(120); // vektör 120 diyor, platform 300: 180° ters
    }
    expect(result.current.vektorGuvenilir).toBe(false);
    const kareler: KibleKaresi[] = [];
    act(() => {
      result.current.abone((k) => kareler.push(k));
    });
    for (let i = 0; i < 20; i++) {
      act(() => headingCallback?.({ trueHeading: 300, magHeading: 300, accuracy: 3 }));
      sur(120);
    }
    expect(Math.abs(kareler[kareler.length - 1].baslik - 300)).toBeLessThan(2);
    expect(kareler[kareler.length - 1].taban).toBeNull();
  });

  it('uyuşan eksenler kamera görünümünü doğrular', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 41.0082, longitude: 28.9784 } });
    const { result } = renderHook(() => useKible());
    await waitFor(() => expect(headingCallback).not.toBeNull());
    await waitFor(() => expect(mockSensor.hareket).not.toBeNull());
    for (let i = 0; i < 50; i++) {
      act(() => headingCallback?.({ trueHeading: 126, magHeading: 120, accuracy: 3 }));
      sur(120);
    }
    expect(result.current.vektorGuvenilir).toBe(true);
  });

  it('aktif değilken (sekme odakta değil) hiçbir sensör açılmaz', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 41, longitude: 29 } });
    const { result } = renderHook(() => useKible(false));
    await waitFor(() => expect(result.current.izinVerildi).toBe(true));
    expect(mockSensor.hareket).toBeNull();
    expect(Location.watchHeadingAsync).not.toHaveBeenCalled();
  });

  it('uygulama arka plana gidince sensörler kapanır, öne gelince yeniden açılır', async () => {
    const handlerlar: Array<(d: string) => void> = [];
    const ekle = jest.spyOn(AppState, 'addEventListener').mockImplementation(((_t: string, h: (d: string) => void) => {
      handlerlar.push(h);
      return { remove: jest.fn() };
    }) as never);
    try {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 41, longitude: 29 } });
      renderHook(() => useKible());
      await waitFor(() => expect(Location.watchHeadingAsync).toHaveBeenCalledTimes(1));
      await act(async () => handlerlar.forEach((h) => h('background')));
      expect(mockSensor.hareketKaldir).toHaveBeenCalled();
      expect(mockSensor.manyetikKaldir).toHaveBeenCalled();
      expect(headingKaldir).toHaveBeenCalled();
      await act(async () => handlerlar.forEach((h) => h('active')));
      await waitFor(() => expect(Location.watchHeadingAsync).toHaveBeenCalledTimes(2));
    } finally {
      ekle.mockRestore();
    }
  });

  it('unmount sonrası abonelikler kaldırılır', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 41, longitude: 29 } });
    const { unmount } = renderHook(() => useKible());
    await waitFor(() => expect(headingCallback).not.toBeNull());
    unmount();
    expect(headingKaldir).toHaveBeenCalled();
    expect(mockSensor.hareketKaldir).toHaveBeenCalled();
    expect(() => headingCallback?.({ trueHeading: 10, magHeading: 10, accuracy: 3 })).not.toThrow();
  });

  it('konum servisi kullanılamıyorsa özel kullanıcı mesajı', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(new Error('Current location is unavailable.'));
    const { result } = renderHook(() => useKible());
    await waitFor(() => expect(result.current.hata).toBeTruthy());
    expect(result.current.hata).toContain('Konum servislerine erişilemiyor');
  });

  it('GPS yokken uygulamanın KAYITLI konumu kullanılır (hata yok, kıble açısı var)', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    await AsyncStorage.setItem('@namaz_akisi/konum_ayarlari', JSON.stringify({ koordinatlar: { lat: 41.0082, lng: 28.9784 } }));
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(new Error('Current location is unavailable.'));
    const { result } = renderHook(() => useKible());
    await waitFor(() => expect(result.current.kibleAcisi).not.toBeNull());
    expect(result.current.hata).toBeNull();
    await AsyncStorage.removeItem('@namaz_akisi/konum_ayarlari');
  });

  it('genel hatada genel mesaj; son bilinen konum varsa hata YOK', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(new Error('patladı'));
    const { result } = renderHook(() => useKible());
    await waitFor(() => expect(result.current.hata).toBe('Kıble servisi başlatılamadı.'));

    (Location.getLastKnownPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 41, longitude: 29 } });
    const ikinci = renderHook(() => useKible());
    await waitFor(() => expect(ikinci.result.current.kibleAcisi).not.toBeNull());
    expect(ikinci.result.current.hata).toBeNull();
  });

  it('öne gelişte izin İSTENMEZ, yalnız okunur; verildiyse servis yeniden başlar', async () => {
    const handlerlar: Array<(d: string) => void> = [];
    const ekle = jest.spyOn(AppState, 'addEventListener').mockImplementation(((_t: string, h: (d: string) => void) => {
      handlerlar.push(h);
      return { remove: jest.fn() };
    }) as never);
    try {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied', canAskAgain: true });
      const { result } = renderHook(() => useKible());
      await waitFor(() => expect(result.current.yukleniyor).toBe(false));
      expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
      await act(async () => {
        handlerlar.forEach((h) => h('active'));
        await Promise.resolve();
      });
      expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 41, longitude: 29 } });
      await act(async () => {
        handlerlar.forEach((h) => h('active'));
        await Promise.resolve();
      });
      await waitFor(() => expect(result.current.izinVerildi).toBe(true));
    } finally {
      ekle.mockRestore();
    }
  });

  it('izinIste diyalog AÇMAZ, durumu yeniden okur', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied', canAskAgain: true });
    const { result } = renderHook(() => useKible());
    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 41, longitude: 29 } });
    await act(async () => {
      await result.current.izinIste();
    });
    await waitFor(() => expect(result.current.izinVerildi).toBe(true));
    expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });

  it('izin reddinde tekrar sorulabilirlik açığa çıkar', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied', canAskAgain: false });
    const { result } = renderHook(() => useKible());
    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
    expect(result.current.izinTekrarSorulabilir).toBe(false);
  });

  it('pusula doğruluğu yalnız KARARLI olunca yazılır', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 41, longitude: 29 } });
    const { result } = renderHook(() => useKible());
    await waitFor(() => expect(headingCallback).not.toBeNull());
    const oku = (accuracy: number, ilerleMs: number) =>
      act(() => {
        simdi += ilerleMs;
        headingCallback?.({ trueHeading: 10, magHeading: 10, accuracy });
      });
    for (let i = 0; i < 4; i++) oku(0, 100);
    expect(result.current.pusulaDogrulugu).toBeNull();
    oku(3, 100);
    oku(3, 500);
    expect(result.current.pusulaDogrulugu).toBeNull();
    oku(3, 600);
    expect(result.current.pusulaDogrulugu).toBe(3);
    oku(0, 100);
    oku(3, 100);
    expect(result.current.pusulaDogrulugu).toBe(3);
  });

  it('TİTREME KÖK NEDENİ: el ivmesi (füzyon dışı) yönü oynatmaz — "aşağı" füzyonlu yerçekiminden', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 41, longitude: 29 } });
    const { result } = renderHook(() => useKible());
    await waitFor(() => expect(mockSensor.hareket).not.toBeNull());
    const kareler: KibleKaresi[] = [];
    act(() => {
      result.current.abone((k) => kareler.push(k));
    });
    // Düz telefon 140°; el her karede ±2 m/s² sallıyor. `acceleration` (doğrusal) bunu taşır →
    // füzyonlu aşağı = dahil − doğrusal sabit kalır. Eski zincir dahil vektörü süzüyordu.
    for (let i = 0; i < 100; i++) {
      act(() => {
        simdi += 20;
        const o = duzOkuma(140);
        const el = i % 2 === 0 ? 2 : -2;
        mockSensor.manyetik?.(o.manyetik);
        mockSensor.hareket?.({
          accelerationIncludingGravity: { x: o.asagi.x + el, y: o.asagi.y - el, z: o.asagi.z },
          acceleration: { x: el, y: -el, z: 0 },
        });
      });
    }
    const son = kareler.slice(-40).map((k) => k.baslik);
    expect(Math.max(...son) - Math.min(...son)).toBeLessThan(0.3);
    expect(son[son.length - 1]).toBeCloseTo(140, 0);
  });

  it('manyetik alan uzun süre aralık dışındaysa teşhis "alanBozuk" olur, kalite düşer', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 41, longitude: 29 } });
    const { result } = renderHook(() => useKible());
    await waitFor(() => expect(mockSensor.hareket).not.toBeNull());
    let son: KibleKaresi | null = null;
    act(() => {
      result.current.abone((k) => (son = k));
    });
    for (let i = 0; i < 30; i++) sur(100);
    expect(result.current.teshis.alanBozuk).toBe(false);
    expect((son as unknown as KibleKaresi).kalite).toBeCloseTo(1, 1);
    // Mıknatıslı kılıf: alan 6 kat (≈290 µT), 2 sn
    for (let i = 0; i < 100; i++) {
      act(() => {
        simdi += 20;
        const o = duzOkuma(100);
        mockSensor.manyetik?.({ x: o.manyetik.x * 6, y: o.manyetik.y * 6, z: o.manyetik.z * 6 });
        mockSensor.hareket?.({ accelerationIncludingGravity: o.asagi });
      });
    }
    expect(result.current.teshis.alanBozuk).toBe(true);
    expect((son as unknown as KibleKaresi).kalite).toBeLessThan(0.1);
  });
});

describe('dogrulukAdimi (saf)', () => {
  it('aynı değer hem birkaç okuma hem kısa süre boyunca sürmeden kararlı sayılmaz', () => {
    let iz = BOS_DOGRULUK_IZI;
    const adim = (okuma: number, ms: number) => {
      const r = dogrulukAdimi(iz, okuma, ms);
      iz = r.iz;
      return r.kararli;
    };
    expect(adim(1, 0)).toBeNull();
    expect(adim(1, 2000)).toBeNull();
    expect(adim(1, 2001)).toBe(1);
    expect(adim(2, 2002)).toBeNull();
    expect(adim(2, 2003)).toBeNull();
    expect(adim(2, 2004)).toBeNull();
    expect(adim(2, 2002 + DOGRULUK_KARARLI_MS)).toBe(2);
  });
});

describe('kalibrasyonIpucu', () => {
  it('doğruluğa bağlı: düşük → belirgin, iyi → yok, bilinmiyor → sönük', () => {
    expect(kalibrasyonIpucu(0)).toBe('belirgin');
    expect(kalibrasyonIpucu(1)).toBe('belirgin');
    expect(kalibrasyonIpucu(2)).toBeNull();
    expect(kalibrasyonIpucu(3)).toBeNull();
    expect(kalibrasyonIpucu(null)).toBe('sonuk');
  });
});
