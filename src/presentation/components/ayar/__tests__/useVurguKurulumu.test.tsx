import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { useRoute } from '@react-navigation/native';
import { useVurguKurulumu } from '../useVurguKurulumu';
import { VurguSaglayici, useVurguBaglami } from '../VurguSaglayici';

// global-constraints.md test mock reçetesi: useRoute de dahil olmak üzere
// (eksikse sayfa render'da çöker).
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(() => ({ params: undefined })),
  useFocusEffect: (cb: () => void | (() => void)) => {
    const ReactActual = require('react');
    ReactActual.useEffect(cb, [cb]);
  },
}));

const mockUseRoute = useRoute as unknown as jest.Mock;

function kur() {
  return renderHook(
    () => {
      const scrollRefDonen = useVurguKurulumu();
      const baglam = useVurguBaglami();
      return { scrollRefDonen, baglam };
    },
    { wrapper: ({ children }) => <VurguSaglayici>{children}</VurguSaglayici> },
  );
}

describe('useVurguKurulumu', () => {
  beforeEach(() => {
    mockUseRoute.mockReturnValue({ params: undefined });
  });

  it('route.params tanımsızken hedefCapaId undefined kalır (savunmalı okuma — çökme yok)', () => {
    const { result } = kur();
    expect(result.current.baglam.hedefCapaId).toBeUndefined();
  });

  it('route.params.vurgula değeri sağlayıcıya yazılır', () => {
    mockUseRoute.mockReturnValue({ params: { vurgula: 'konumModu' } });
    const { result } = kur();
    expect(result.current.baglam.hedefCapaId).toBe('konumModu');
  });

  it('döndürülen ref, sağlayıcının scrollRef ile aynı referanstır', () => {
    const { result } = kur();
    expect(result.current.scrollRefDonen).toBe(result.current.baglam.scrollRef);
  });
});
