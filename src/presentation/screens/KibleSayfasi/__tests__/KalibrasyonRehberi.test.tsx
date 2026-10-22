import React from 'react';
import { render, act } from '@testing-library/react-native';
import { KalibrasyonRehberi, kalibrasyonOturumunuSifirla } from '../KalibrasyonRehberi';
import { KALIBRASYON_KAPANIS_KARARLI_MS, KALIBRASYON_TESEKKUR_MS } from '../../../../core/kible/kalibrasyon';

jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    arkaplan: '#fff',
    kartArkaplan: '#f0f0f0',
    birincil: '#2E7D32',
    metin: '#333',
    metinIkincil: '#666',
    sinir: '#ccc',
    durum: { hata: '#F44336', uyari: '#FFC107', basarili: '#4CAF50', bilgi: '#2196F3' },
  }),
}));
jest.mock('@expo/vector-icons', () => ({ FontAwesome5: 'FontAwesome5' }));
// Kaynak alt yol import'u kullanır (denetim D-20) → kök mock'u alt yola da yansıt.
jest.mock('@expo/vector-icons/FontAwesome5', () => ({ __esModule: true, default: jest.requireMock('@expo/vector-icons').FontAwesome5 }));
jest.mock('react-native-svg', () => ({ __esModule: true, default: 'Svg', Svg: 'Svg', Path: 'Path' }));
jest.mock('react-native-reanimated', () => {
  const m = require('react-native-reanimated/mock');
  return { ...m, withRepeat: jest.fn(m.withRepeat), withTiming: jest.fn(m.withTiming) };
});
const { withRepeat: withRepeatMock } = require('react-native-reanimated');

const abone = jest.fn(() => () => undefined);

describe('KalibrasyonRehberi', () => {
  beforeEach(() => {
    kalibrasyonOturumunuSifirla();
    withRepeatMock.mockClear();
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it('gerek kalkınca bekler, "Teşekkürler" der, sonra kapanır ve oturumda yeniden açılmaz', () => {
    const r = render(<KalibrasyonRehberi neden="dogruluk" abone={abone} hareketAzalt={false} />);
    expect(r.getByTestId('kalibrasyon-rehberi')).toBeTruthy();
    // ∞ animasyonu kurulur (tek değer, sonsuz tekrar).
    expect(withRepeatMock).toHaveBeenCalled();

    r.rerender(<KalibrasyonRehberi neden={null} abone={abone} hareketAzalt={false} />);
    // Kısa bir düzelme hemen kapatmaz (sınırda titreyen doğruluk).
    act(() => jest.advanceTimersByTime(KALIBRASYON_KAPANIS_KARARLI_MS - 100));
    expect(r.getByTestId('kalibrasyon-rehberi')).toBeTruthy();
    act(() => jest.advanceTimersByTime(200));
    expect(r.getByText('Teşekkürler, yön artık daha doğru ✓')).toBeTruthy();
    act(() => jest.advanceTimersByTime(KALIBRASYON_TESEKKUR_MS + 10));
    expect(r.queryByTestId('kalibrasyon-tesekkur')).toBeNull();

    r.rerender(<KalibrasyonRehberi neden="alan" abone={abone} hareketAzalt={false} />);
    expect(r.queryByTestId('kalibrasyon-rehberi')).toBeNull();
  });

  it('gerek bekleme sırasında geri gelirse açık kalır', () => {
    const r = render(<KalibrasyonRehberi neden="tutarsiz" abone={abone} hareketAzalt={false} />);
    r.rerender(<KalibrasyonRehberi neden={null} abone={abone} hareketAzalt={false} />);
    act(() => jest.advanceTimersByTime(KALIBRASYON_KAPANIS_KARARLI_MS / 2));
    r.rerender(<KalibrasyonRehberi neden="tutarsiz" abone={abone} hareketAzalt={false} />);
    act(() => jest.advanceTimersByTime(KALIBRASYON_KAPANIS_KARARLI_MS * 2));
    expect(r.getByTestId('kalibrasyon-rehberi')).toBeTruthy();
  });

  it('hareket azaltılmışsa ∞ statik çizilir, animasyon kurulmaz', () => {
    const r = render(<KalibrasyonRehberi neden="dogruluk" abone={abone} hareketAzalt />);
    expect(r.getByTestId('kalibrasyon-sonsuzluk-statik', { includeHiddenElements: true })).toBeTruthy();
    expect(withRepeatMock).not.toHaveBeenCalled();
  });

  it('kalite kare aboneliğinden okunur (React state değil)', () => {
    const yerel = jest.fn(() => () => undefined);
    render(<KalibrasyonRehberi neden="dogruluk" abone={yerel} hareketAzalt={false} />);
    expect(yerel).toHaveBeenCalledTimes(1);
  });
});
