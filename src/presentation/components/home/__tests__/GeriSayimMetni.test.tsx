/**
 * GeriSayimMetni (denetim D-03): saniyelik iş yalnız bu küçük metinde yaşar.
 * Gerçek zamanlayıcıyla ölçülür (sahte zamanlayıcı + render CI'da asılır — test tuzakları).
 */
import React from 'react';
import { AppState } from 'react-native';
import { act, render, waitFor } from '@testing-library/react-native';

import { GeriSayimMetni, hedefMsCoz, kalanSureMetni } from '../GeriSayimMetni';

describe('kalanSureMetni', () => {
  it('SS:DD:ss biçimi, saniye aşağı yuvarlanır', () => {
    expect(kalanSureMetni(1000 + (2 * 3600 + 5 * 60 + 9) * 1000 + 999, 1000)).toBe('02:05:09');
  });

  it('hedef yok / geçmiş / bozuk → 00:00:00', () => {
    expect(kalanSureMetni(null, 0)).toBe('00:00:00');
    expect(kalanSureMetni(500, 1000)).toBe('00:00:00');
    expect(kalanSureMetni(Number.NaN, 0)).toBe('00:00:00');
  });

  it('hedefMsCoz boş/bozuk dizeyi null yapar', () => {
    expect(hedefMsCoz('')).toBeNull();
    expect(hedefMsCoz(undefined)).toBeNull();
    expect(hedefMsCoz('bozuk')).toBeNull();
    expect(hedefMsCoz('2026-01-01T00:00:00.000Z')).toBe(Date.UTC(2026, 0, 1));
  });
});

describe('GeriSayimMetni', () => {
  it('gerçek zamanda saniyede bir azalır', async () => {
    const hedef = new Date(Date.now() + 10_500).toISOString();
    const ekran = render(<GeriSayimMetni hedefIso={hedef} testID="sayac" />);
    const ilk = ekran.getByTestId('sayac').props.children as string;
    expect(ilk).toMatch(/^00:00:1[0-9]$|^00:00:0[0-9]$/);
    await waitFor(() => expect(ekran.getByTestId('sayac').props.children).not.toBe(ilk), { timeout: 2500 });
  });

  it('sıfıra inince onBitti BİR KEZ çağrılır, metin 00:00:00 kalır', async () => {
    const onBitti = jest.fn();
    const hedef = new Date(Date.now() + 300).toISOString();
    const ekran = render(<GeriSayimMetni hedefIso={hedef} onBitti={onBitti} testID="sayac" />);
    await waitFor(() => expect(onBitti).toHaveBeenCalledTimes(1), { timeout: 2500 });
    expect(ekran.getByTestId('sayac').props.children).toBe('00:00:00');
    await act(async () => { await new Promise((r) => setTimeout(r, 300)); });
    expect(onBitti).toHaveBeenCalledTimes(1);
  });

  it('uygulama arka plandayken zamanlayıcı KURULMAZ (metin donar)', async () => {
    const dinleyiciler: ((d: string) => void)[] = [];
    const ekle = jest.spyOn(AppState, 'addEventListener').mockImplementation((_olay, cb) => {
      dinleyiciler.push(cb as (d: string) => void);
      return { remove: jest.fn() } as unknown as ReturnType<typeof AppState.addEventListener>;
    });
    try {
      const hedef = new Date(Date.now() + 10_500).toISOString();
      const ekran = render(<GeriSayimMetni hedefIso={hedef} testID="sayac" />);
      act(() => { dinleyiciler.forEach((cb) => cb('background')); });
      const donmus = ekran.getByTestId('sayac').props.children as string;
      await act(async () => { await new Promise((r) => setTimeout(r, 1300)); });
      expect(ekran.getByTestId('sayac').props.children).toBe(donmus);
      // Öne gelince hemen doğru değere atlar.
      act(() => { dinleyiciler.forEach((cb) => cb('active')); });
      expect(ekran.getByTestId('sayac').props.children).not.toBe(donmus);
    } finally {
      ekle.mockRestore();
    }
  });
});
