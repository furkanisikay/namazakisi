/** Ülke değişince bir kez sorulan "bölgenizin takvimi" önerisi. */
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../../../domain/services/KonumDegisikligiServisi', () => ({ konumDegistiUygula: jest.fn(async () => undefined) }));
jest.mock('../../../data/local/dunyaSehirVerisi', () => ({ dunyaSehirVerisiniAl: jest.fn(async () => null) }));

import hesapReducer, { hesapAyariniYukle } from '../../store/hesapSlice';
import { useBolgeTakvimiOnerisi } from '../useBolgeTakvimiOnerisi';
import { HesapAyariServisi } from '../../../domain/services/HesapAyariServisi';
import { aktifHesapAyari, aktifHesapSifirla } from '../../../core/vakit/aktifHesap';

const kur = async (konum: Record<string, unknown>) => {
  const store = configureStore({ reducer: { hesap: hesapReducer, konum: (s = konum) => s } });
  await store.dispatch(hesapAyariniYukle());
  const sarmal = ({ children }: { children: React.ReactNode }) => <Provider store={store}>{children}</Provider>;
  return { store, ...renderHook(() => useBolgeTakvimiOnerisi(), { wrapper: sarmal }) };
};

beforeEach(async () => {
  await AsyncStorage.clear();
  aktifHesapSifirla();
  HesapAyariServisi._sifirla();
});

describe('useBolgeTakvimiOnerisi', () => {
  it("Türkiye'deki kullanıcıya hiçbir şey önerilmez", async () => {
    const { result } = await kur({ konumModu: 'manuel', seciliIlId: 34, koordinatlar: { lat: 41, lng: 29 } });
    expect(result.current).toBeNull();
  });

  it('Malezya: JAKIM önerilir; kabul edilince geçer ve bir daha sorulmaz', async () => {
    const { result, store } = await kur({
      konumModu: 'manuel', seciliIlId: null, koordinatlar: { lat: 3.14, lng: 101.69 },
      dunyaSehri: { ad: 'Kuala Lumpur', ulke: 'MY', bolge: '', saatDilimi: 'Asia/Kuala_Lumpur' },
    });
    expect(result.current?.oneri.profil).toBe('jakim');
    await act(async () => result.current?.kabul());
    await waitFor(() => expect(store.getState().hesap.ayar).toMatchObject({ profil: 'jakim', sorulanUlkeler: ['MY'] }));
    expect(aktifHesapAyari().profil).toBe('jakim');
    expect(result.current).toBeNull();
  });

  it('reddedilince yöntem değişmez ama bir daha sorulmaz', async () => {
    const { result, store } = await kur({ konumModu: 'oto', koordinatlar: { lat: 52.52, lng: 13.4 }, ulkeKodu: 'GB' });
    expect(result.current?.oneri.profil).toBe('moonsighting');
    await act(async () => result.current?.reddet());
    await waitFor(() => expect(store.getState().hesap.ayar).toEqual({ profil: 'diyanet', sorulanUlkeler: ['GB'] }));
    expect(result.current).toBeNull();
  });
});
