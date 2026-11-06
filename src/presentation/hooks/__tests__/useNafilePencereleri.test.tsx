/**
 * Nöbetçi: hesap yöntemi değişince nafile pencereleri yeniden hesaplanır (konum aynı kalsa da).
 * Yaşanmış: Kuala Lumpur'da JAKIM'e geçince ana ekrandaki kuşluk Diyanet saatinde kalmıştı.
 */
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { act, renderHook } from '@testing-library/react-native';
import { useNafilePencereleri } from '../useNafilePencereleri';
import { aktifHesapAyariniKur, aktifHesapSifirla } from '../../../core/vakit/aktifHesap';
import type { HesapAyari } from '../../../core/vakit/hesapProfilleri';
import { bugunuAl } from '../../../core/utils/TarihYardimcisi';

const hesap = createSlice({
  name: 'hesap',
  initialState: { ayar: { profil: 'diyanet' } as HesapAyari, yuklendi: true, yukleniyor: false },
  reducers: {
    kur: (s, a: PayloadAction<HesapAyari>) => {
      s.ayar = a.payload;
    },
  },
});
const konum = createSlice({ name: 'konum', initialState: { koordinatlar: { lat: 3.1412, lng: 101.6865 } }, reducers: {} });

afterEach(() => aktifHesapSifirla());

it('yöntem değişince kuşluk penceresi yeni yöntemin güneşine göre hesaplanır', () => {
  const store = configureStore({ reducer: { hesap: hesap.reducer, konum: konum.reducer } });
  const sarmal = ({ children }: { children: React.ReactNode }) => <Provider store={store}>{children}</Provider>;
  const { result } = renderHook(() => useNafilePencereleri(bugunuAl()), { wrapper: sarmal });
  const kusluk = () => result.current.pencereler.find((p) => p.tur === 'kusluk');
  const diyanet = kusluk();
  expect(diyanet).toBeTruthy();

  act(() => {
    // Sıra uygulamadaki gibi: önce çekirdek etkin ayar (servis), sonra store.
    aktifHesapAyariniKur({ profil: 'jakim' });
    store.dispatch(hesap.actions.kur({ profil: 'jakim' }));
  });
  const jakim = kusluk();
  expect(jakim).toBeTruthy();
  expect(jakim!.baslangic.getTime()).not.toBe(diyanet!.baslangic.getTime());
});
