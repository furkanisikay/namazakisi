/**
 * Ayarlar > Namaz vakitleri > Hesap yöntemi: ülkeye göre önerilen takvim, ikindi seçimi,
 * kalıcı dakika düzeltmesi. Kaydetme diske yazar ve etkin hesabı değiştirir; Türkiye'de
 * varsayılan Diyanet'tir ve hiçbir şey kendiliğinden değişmez.
 */
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('../../../core/theme', () => ({
  useRenkler: () => ({
    kartArkaplan: '#FFFFFF', arkaplan: '#FAFAFA', sinir: '#E0E0E0', birincil: '#4CAF50',
    birincilMetin: '#FFFFFF', metin: '#212121', metinIkincil: '#757575',
    durum: { basarili: '#4CAF50', uyari: '#FFC107', hata: '#F44336', bilgi: '#2196F3', dikkat: '#E65100' },
  }),
}));
jest.mock('../../../core/feedback', () => ({ useFeedback: () => ({ butonTiklandiFeedback: jest.fn() }) }));
jest.mock('../../components/common/KisaBildirim', () => ({ kisaBildirimGoster: jest.fn() }));
const mockYay = jest.fn(async () => undefined);
jest.mock('../../../domain/services/KonumDegisikligiServisi', () => ({ konumDegistiUygula: mockYay }));

import hesapReducer from '../../store/hesapSlice';
import { HesapYontemiSayfasi } from '../HesapYontemiSayfasi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { HesapAyariServisi } from '../../../domain/services/HesapAyariServisi';
import { aktifHesapAyari, aktifHesapSifirla } from '../../../core/vakit/aktifHesap';

const kur = (konum: Record<string, unknown>) => {
  const store = configureStore({ reducer: { hesap: hesapReducer, konum: (s = konum) => s } });
  const sonuc = render(
    <Provider store={store}>
      <HesapYontemiSayfasi />
    </Provider>,
  );
  return { store, ...sonuc };
};

const KUALA_LUMPUR = {
  konumModu: 'manuel', seciliIlId: null, seciliIlAdi: 'Kuala Lumpur', seciliIlceAdi: '',
  koordinatlar: { lat: 3.141, lng: 101.687 }, ulkeKodu: 'MY',
  dunyaSehri: { ad: 'Kuala Lumpur', ulke: 'MY', bolge: 'Kuala Lumpur', saatDilimi: 'Asia/Kuala_Lumpur' },
};

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  aktifHesapSifirla();
  HesapAyariServisi._sifirla();
});

describe('HesapYontemiSayfasi', () => {
  it("Türkiye'de Diyanet seçili ve ölçülmüş görünür", async () => {
    const { getByText, getAllByText, getByLabelText, store } = kur({ konumModu: 'manuel', seciliIlId: 26, seciliIlAdi: 'Eskişehir', koordinatlar: { lat: 39.77, lng: 30.52 } });
    await waitFor(() => expect(store.getState().hesap.yuklendi).toBe(true));
    expect(getAllByText('Diyanet (Türkiye)').length).toBeGreaterThan(0);
    expect(getByLabelText(/^Diyanet \(Türkiye\)\./).props.accessibilityState).toMatchObject({ selected: true });
    expect(getByText('Resmî takvimle ölçüldü')).toBeTruthy();
    expect(getByText('İkindi: Asr-ı evvel')).toBeTruthy();
  });

  it("Malezya'da JAKIM önerilir; seçince diske yazılır, etkin olur ve yayılır", async () => {
    const { getByLabelText, getByText, store } = kur(KUALA_LUMPUR);
    await waitFor(() => expect(store.getState().hesap.yuklendi).toBe(true));
    expect(getByText(/Malezya için önerilen/)).toBeTruthy();
    fireEvent.press(getByLabelText(/^JAKIM \(Malezya\)\./));
    await waitFor(async () =>
      expect(JSON.parse((await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.HESAP_AYARI)) ?? '{}').profil).toBe('jakim'),
    );
    expect(aktifHesapAyari().profil).toBe('jakim');
    await waitFor(() => expect(mockYay).toHaveBeenCalledWith({ lat: 3.141, lng: 101.687 }));
  });

  it('ikindi ve dakika düzeltmesi kalıcı yazılır', async () => {
    const { getByLabelText, store } = kur(KUALA_LUMPUR);
    await waitFor(() => expect(store.getState().hesap.yuklendi).toBe(true));
    fireEvent.press(getByLabelText(/^Asr-ı sânî\./));
    await waitFor(() => expect(store.getState().hesap.ayar.ikindi).toBe('sani'));
    fireEvent.press(getByLabelText('Akşam vaktini bir dakika geciktirin'));
    await waitFor(() => expect(store.getState().hesap.ayar.ofsetler).toEqual({ aksam: 1 }));
    const disk = JSON.parse((await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.HESAP_AYARI)) ?? '{}');
    expect(disk).toMatchObject({ ikindi: 'sani', ofsetler: { aksam: 1 }, secildi: true });
  });
});
