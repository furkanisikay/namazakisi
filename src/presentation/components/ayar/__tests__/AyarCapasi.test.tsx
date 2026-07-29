import React from 'react';
import type { ForwardedRef, PropsWithChildren } from 'react';
import { act, render, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, Animated, InteractionManager } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { AyarCapasi } from '../AyarCapasi';
import { VurguSaglayici } from '../VurguSaglayici';
import { useVurguKurulumu } from '../useVurguKurulumu';

// Tema renklerini deterministik sabit bir palete sabitle (KerahatOnayModal.test.tsx deseni).
jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({ birincil: '#4CAF50' }),
}));

// global-constraints.md test mock reçetesi.
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(() => ({ params: undefined })),
  useFocusEffect: (cb: () => void | (() => void)) => {
    const ReactActual = require('react');
    ReactActual.useEffect(cb, [cb]);
  },
}));

const mockUseRoute = useRoute as unknown as jest.Mock;

// `ScrollView.getInnerViewRef` ve `View.measureLayout` gerçek cihazda native ölçüm
// yapar; jest'in mockNativeComponent'i measureLayout'u no-op bırakır (callback hiç
// tetiklenmez). Bu yüzden bu iki bileşeni test dosyasında kontrol edilebilir hale
// getiriyoruz — geri kalan her şey (Animated, InteractionManager, AccessibilityInfo)
// gerçek react-native davranışını korur.
const mockScrollTo = jest.fn();
const mockMeasureLayout = jest.fn();

jest.mock('react-native', () => {
  // DİKKAT: `{...RN}` (object spread) YAPMA — react-native/index.js her export'u
  // lazy getter olarak tanımlar; spread hepsini ANINDA değerlendirir ve jest
  // ortamında bulunmayan native modüllere (ör. DevMenu) ulaşıp suite'i çökertir.
  // Yalnız ihtiyaç duyulan iki property'yi Object.defineProperty ile değiştir.
  const RN = jest.requireActual('react-native');
  const ReactActual = require('react');
  // Gerçek View'i ÖNCEDEN yakala — Mock bileşenler render anında `RN.View`
  // okusaydı, aşağıdaki Object.defineProperty'den SONRA kendi kendine
  // (MockView'e) sonsuz özyineleme yapardı.
  const GercekView = RN.View;

  const MockScrollView = ReactActual.forwardRef(
    (props: PropsWithChildren<Record<string, unknown>>, ref: ForwardedRef<unknown>) => {
      ReactActual.useImperativeHandle(ref, () => ({
        getInnerViewRef: () => ({}),
        scrollTo: mockScrollTo,
      }));
      return ReactActual.createElement(GercekView, { collapsable: false }, props.children);
    },
  );

  const MockView = ReactActual.forwardRef(
    (props: PropsWithChildren<Record<string, unknown>>, ref: ForwardedRef<unknown>) => {
      ReactActual.useImperativeHandle(ref, () => ({
        measureLayout: mockMeasureLayout,
      }));
      return ReactActual.createElement(GercekView, { collapsable: false }, props.children);
    },
  );

  Object.defineProperty(RN, 'ScrollView', { value: MockScrollView, configurable: true, enumerable: true });
  Object.defineProperty(RN, 'View', { value: MockView, configurable: true, enumerable: true });

  return RN;
});

function Sayfa({ children }: { children: React.ReactNode }) {
  const { ScrollView } = require('react-native');
  const scrollRef = useVurguKurulumu();
  return <ScrollView ref={scrollRef}>{children}</ScrollView>;
}

function kur(children: React.ReactNode) {
  return render(
    <VurguSaglayici>
      <Sayfa>{children}</Sayfa>
    </VurguSaglayici>,
  );
}

describe('AyarCapasi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRoute.mockReturnValue({ params: undefined });
    // InteractionManager'ın gerçek zamanlaması testleri yavaşlatır/kararsızlaştırır;
    // görevi anında çalıştıracak şekilde sabitliyoruz (native-stack giriş animasyonu
    // burada zaten yok).
    jest.spyOn(InteractionManager, 'runAfterInteractions').mockImplementation(((task: () => void) => {
      task();
      return { then: jest.fn(), done: jest.fn(), cancel: jest.fn() };
    }) as typeof InteractionManager.runAfterInteractions);
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    // Gerçek Animated zamanlaması (requestAnimationFrame tabanlı) jest'in "node"
    // ortamında test bittikten sonra da tikleyip açık handle bırakır (nabız
    // 4x300ms = 1200ms > Jest'in 1sn'lik "did not exit" eşiği). Assertion'lar
    // yalnız HANGİ Animated çağrısının yapıldığını (nabız mı sabit tint mi)
    // önemsiyor, gerçek animasyonun bitmesini değil — .start() callback'ini
    // anında (senkron) tüketen bir sahte ile değiştir.
    const sahteBaslat = (cb?: (sonuc: { finished: boolean }) => void) => cb?.({ finished: true });
    jest.spyOn(Animated, 'timing').mockReturnValue({ start: sahteBaslat } as unknown as Animated.CompositeAnimation);
    jest.spyOn(Animated, 'sequence').mockReturnValue({ start: sahteBaslat } as unknown as Animated.CompositeAnimation);
    jest.spyOn(Animated, 'delay').mockReturnValue({ start: sahteBaslat } as unknown as Animated.CompositeAnimation);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('vurgula parametresi yokken ölçüm hiç denenmez', () => {
    kur(
      <AyarCapasi id="konumModu">
        <></>
      </AyarCapasi>,
    );

    expect(mockMeasureLayout).not.toHaveBeenCalled();
    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it('eşleşmeyen id ile ölçüm denenmez', () => {
    mockUseRoute.mockReturnValue({ params: { vurgula: 'baskaCapa' } });

    kur(
      <AyarCapasi id="konumModu">
        <></>
      </AyarCapasi>,
    );

    expect(mockMeasureLayout).not.toHaveBeenCalled();
    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it('eşleşen id ile ölçülür ve scrollTo çağrılır (üst boşluk 16px düşülür)', async () => {
    mockUseRoute.mockReturnValue({ params: { vurgula: 'konumModu' } });

    kur(
      <AyarCapasi id="konumModu">
        <></>
      </AyarCapasi>,
    );

    expect(mockMeasureLayout).toHaveBeenCalledTimes(1);
    const basariCallback = mockMeasureLayout.mock.calls[0][1];

    act(() => {
      basariCallback(0, 220, 300, 50);
    });

    await waitFor(() => {
      expect(mockScrollTo).toHaveBeenCalledWith({ y: 204, animated: true });
    });
    // Nabız: 4 adımlı Animated.sequence (Animated.delay YOK — bu, sabit-tint yoluna özgü).
    expect(Animated.sequence).toHaveBeenCalledTimes(1);
    expect(Animated.timing).toHaveBeenCalledTimes(4);
    expect(Animated.delay).not.toHaveBeenCalled();
  });

  it('ölçülen y ofset 16dan küçükse 0a kırpılır (negatif kaydırma olmaz)', async () => {
    mockUseRoute.mockReturnValue({ params: { vurgula: 'konumModu' } });

    kur(
      <AyarCapasi id="konumModu">
        <></>
      </AyarCapasi>,
    );

    const basariCallback = mockMeasureLayout.mock.calls[0][1];
    act(() => {
      basariCallback(0, 5, 300, 50);
    });

    await waitFor(() => {
      expect(mockScrollTo).toHaveBeenCalledWith({ y: 0, animated: true });
    });
  });

  it('measureLayout hata geri çağrısı tetiklendiğinde çökme olmaz ve scrollTo çağrılmaz', () => {
    mockUseRoute.mockReturnValue({ params: { vurgula: 'konumModu' } });

    kur(
      <AyarCapasi id="konumModu">
        <></>
      </AyarCapasi>,
    );

    const hataCallback = mockMeasureLayout.mock.calls[0][2];
    expect(() => act(() => hataCallback())).not.toThrow();
    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it('reduced motion açıkken animasyonsuz kaydırır (nabız animasyonu başlatılmaz)', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    mockUseRoute.mockReturnValue({ params: { vurgula: 'konumModu' } });

    kur(
      <AyarCapasi id="konumModu">
        <></>
      </AyarCapasi>,
    );

    const basariCallback = mockMeasureLayout.mock.calls[0][1];
    act(() => {
      basariCallback(0, 100, 300, 50);
    });

    await waitFor(() => {
      expect(mockScrollTo).toHaveBeenCalledWith({ y: 84, animated: false });
    });
    // Sabit tint yolu: nabız (4x Animated.timing) BAŞLATILMAZ; yalnız
    // delay + tek timing (2sn sonra sönme) kullanılır.
    expect(Animated.delay).toHaveBeenCalledTimes(1);
    expect(Animated.timing).toHaveBeenCalledTimes(1);
  });

  it('vurgu bir kez çalışır — ikinci odaklanmada tekrar ölçülmez', async () => {
    mockUseRoute.mockReturnValue({ params: { vurgula: 'konumModu' } });

    const { rerender } = kur(
      <AyarCapasi id="konumModu">
        <></>
      </AyarCapasi>,
    );

    expect(mockMeasureLayout).toHaveBeenCalledTimes(1);
    const basariCallback = mockMeasureLayout.mock.calls[0][1];
    act(() => {
      basariCallback(0, 100, 300, 50);
    });
    await waitFor(() => expect(mockScrollTo).toHaveBeenCalledTimes(1));

    mockMeasureLayout.mockClear();

    // Aynı sayfa yeniden render edilse (ör. odak tekrar tetiklense) dahi
    // tüketilmiş vurgu bir daha ölçülmemeli.
    rerender(
      <VurguSaglayici>
        <Sayfa>
          <AyarCapasi id="konumModu">
            <></>
          </AyarCapasi>
        </Sayfa>
      </VurguSaglayici>,
    );

    expect(mockMeasureLayout).not.toHaveBeenCalled();
  });
});
