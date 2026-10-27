import { act, renderHook } from '@testing-library/react-native';
import { aktifDiliKur, aktifDilSifirla, rakamSisteminiKur } from '../../../../core/dil/aktifDil';
import { useRakamCevir } from '../useRakamCevir';

afterEach(() => {
  act(() => aktifDilSifirla());
});

describe('useRakamCevir', () => {
  it('Türkçede ve Urducada Batı rakamı kalır', () => {
    const { result } = renderHook(() => useRakamCevir());
    expect(result.current(26)).toBe('26');
    act(() => aktifDiliKur('ur'));
    expect(result.current('2026')).toBe('2026');
  });

  it('Arapçada Doğu Arap rakamına çevirir; Batı seçimi değişince izler', () => {
    const { result } = renderHook(() => useRakamCevir());
    act(() => aktifDiliKur('ar'));
    expect(result.current('أكتوبر 2026')).toBe('أكتوبر ٢٠٢٦');
    act(() => rakamSisteminiKur('latn'));
    expect(result.current(26)).toBe('26');
  });

  it('Bengalcede Bengalce rakama çevirir; Batı seçimi değişince izler', () => {
    const { result } = renderHook(() => useRakamCevir());
    act(() => aktifDiliKur('bn'));
    expect(result.current('অক্টোবর 2026')).toBe('অক্টোবর ২০২৬');
    act(() => rakamSisteminiKur('latn'));
    expect(result.current(26)).toBe('26');
  });
});
