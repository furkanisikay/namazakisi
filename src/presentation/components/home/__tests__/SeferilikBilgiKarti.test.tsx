/**
 * Ana ekran seferîlik bilgi kartı (issue #296).
 *
 * Ölçülen: ≈90 km uzakta kart görünür, mezhebe göre içerik değişir, kapatma
 * kartı kaldırır ve diske yazılır, "Burası evim" ikameti günceller, Diyanet
 * bağlantısı açılır; dilim yoksa (eski mock) hiçbir şey çizilmez; konum
 * diskten işlenir (store'daki İstanbul varsayılanı değil).
 */
import React from 'react';
import { Linking } from 'react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { FontAwesome5: (props: { name: string }) => <Text>{props.name}</Text> };
});
// Kaynak alt yol import'u kullanır (denetim D-20) → kök mock'u alt yola da yansıt.
jest.mock('@expo/vector-icons/FontAwesome5', () => ({ __esModule: true, default: jest.requireMock('@expo/vector-icons').FontAwesome5 }));
jest.mock('@expo/vector-icons/MaterialIcons', () => ({ __esModule: true, default: jest.requireMock('@expo/vector-icons').MaterialIcons }));
jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    kartArkaplan: '#FFFFFF',
    arkaplan: '#FAFAFA',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    birincilMetin: '#FFFFFF',
    metin: '#212121',
    metinIkincil: '#757575',
  }),
}));
jest.mock('../../common/KisaBildirim', () => ({ kisaBildirimGoster: jest.fn() }));

import seferilikReducer, { type SeferilikState } from '../../../store/seferilikSlice';
import { SeferilikBilgiKarti, useSeferilikKartiGorunur } from '../SeferilikBilgiKarti';
import { DEPOLAMA_ANAHTARLARI } from '../../../../core/constants/UygulamaSabitleri';
import { SEFERILIK_KAYNAKLARI } from '../../../../core/seferilik/seferilikMetni';
import { kisaBildirimGoster } from '../../common/KisaBildirim';

const ANKARA = { lat: 39.9208, lng: 32.8541 };
const ESKISEHIR = { lat: 39.7767, lng: 30.5206 };
const ISTANBUL = { lat: 41.0082, lng: 28.9784 };

type KonumDilimi = { koordinatlar: { lat: number; lng: number } };

const durumKur = (ek: Partial<SeferilikState> = {}): SeferilikState => ({
  ayarlar: { kartAcik: true, mezhep: 'hanefi', ikamet: { ...ANKARA, kaynak: 'kullanici' } },
  hafiza: { yolculuktaKapatildi: false },
  sonKonum: ESKISEHIR,
  sonKonumAdi: 'Tepebaşı, Eskişehir',
  yuklendi: true,
  yukleniyor: false,
  hata: null,
  ...ek,
});

const storeKur = (seferilik: SeferilikState, konum: KonumDilimi = { koordinatlar: ESKISEHIR }) =>
  configureStore({
    reducer: { seferilik: seferilikReducer, konum: (s: KonumDilimi = konum) => s },
    preloadedState: { seferilik, konum },
  });

/** Seferîlik dilimi OLMAYAN store (eski ekran test mock'ları). */
const dilimsizStoreKur = () =>
  configureStore({ reducer: { konum: (s: KonumDilimi = { koordinatlar: ESKISEHIR }) => s } });

const ciz = (store: ReturnType<typeof storeKur> | ReturnType<typeof dilimsizStoreKur>) =>
  render(
    <Provider store={store}>
      <SeferilikBilgiKarti />
    </Provider>,
  );

const diskKonumuYaz = (koordinatlar: { lat: number; lng: number }) =>
  AsyncStorage.setItem(
    DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI,
    JSON.stringify({ konumModu: 'manuel', koordinatlar, seciliIlAdi: 'Eskişehir', seciliIlceAdi: 'Tepebaşı' }),
  );

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  await diskKonumuYaz(ESKISEHIR);
  await AsyncStorage.setItem(
    DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI,
    JSON.stringify(durumKur().ayarlar),
  );
});

describe('SeferilikBilgiKarti', () => {
  it('ikametten ≈90 km uzakta kart Hanefî içerikle görünür', () => {
    const { getByText, getByTestId } = ciz(storeKur(durumKur()));
    expect(getByTestId('seferilik-bilgi-karti')).toBeTruthy();
    expect(getByText('Yolculuktasınız gibi görünüyor')).toBeTruthy();
    expect(getByText(/15 günden az/)).toBeTruthy();
    expect(getByText(/hüküm değil, bilgilendirmedir/)).toBeTruthy();
  });

  it('Şâfiî seçiliyse 4 gün kuralı anılır', () => {
    const d = durumKur();
    const { getByText, queryByText } = ciz(storeKur({ ...d, ayarlar: { ...d.ayarlar, mezhep: 'safii' } }));
    expect(getByText(/4 günden az/)).toBeTruthy();
    expect(queryByText(/15 günden az/)).toBeNull();
  });

  it('ikamete yakınken kart çizilmez', () => {
    const { queryByTestId } = ciz(storeKur(durumKur({ sonKonum: ANKARA })));
    expect(queryByTestId('seferilik-bilgi-karti')).toBeNull();
  });

  it('bu yolculukta kapatıldıysa ya da kart ayarı kapalıysa çizilmez', () => {
    expect(ciz(storeKur(durumKur({ hafiza: { yolculuktaKapatildi: true } }))).queryByTestId('seferilik-bilgi-karti')).toBeNull();
    const d = durumKur();
    expect(
      ciz(storeKur({ ...d, ayarlar: { ...d.ayarlar, kartAcik: false } })).queryByTestId('seferilik-bilgi-karti'),
    ).toBeNull();
  });

  it('dilim store\'da yoksa (eski mock) hiçbir şey çizmez ve çökmez', () => {
    expect(ciz(dilimsizStoreKur()).toJSON()).toBeNull();
  });

  it('kapatma kartı hemen kaldırır ve hafızayı diske yazar', async () => {
    const store = storeKur(durumKur());
    const { getByLabelText, queryByTestId } = ciz(store);
    fireEvent.press(getByLabelText('Yolculuk bilgi kartını kapatın'));
    expect(queryByTestId('seferilik-bilgi-karti')).toBeNull();
    await waitFor(async () =>
      expect(JSON.parse((await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.SEFERILIK_KART_HAFIZASI)) ?? 'null')).toEqual({
        yolculuktaKapatildi: true,
      }),
    );
  });

  it('"Burası evim" ikameti şu anki konuma çeker ve kart kaybolur', async () => {
    const store = storeKur(durumKur());
    const { getByLabelText, queryByTestId } = ciz(store);
    fireEvent.press(getByLabelText('Burası evim, ikamet yerim olarak kaydedin'));
    await waitFor(() => expect(queryByTestId('seferilik-bilgi-karti')).toBeNull());
    expect(store.getState().seferilik.ayarlar.ikamet).toMatchObject({ ...ESKISEHIR, kaynak: 'kullanici' });
    expect(kisaBildirimGoster).toHaveBeenCalledWith('İkamet yeriniz güncellendi');
  });

  it('Diyanet bağlantısı fetvayı açar', () => {
    const ac = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const { getByLabelText } = ciz(storeKur(durumKur()));
    fireEvent.press(getByLabelText('Diyanet fetvasını tarayıcıda okuyun'));
    expect(ac).toHaveBeenCalledWith(SEFERILIK_KAYNAKLARI.vatan.url);
    ac.mockRestore();
  });

  it('KRİTİK: konum DİSKTEN işlenir — store\'daki İstanbul varsayılanı ikamet olmaz', async () => {
    // İkamet yok; store henüz varsayılan İstanbul'da, disk Eskişehir.
    await AsyncStorage.removeItem(DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI);
    const store = storeKur(
      durumKur({ ayarlar: { kartAcik: true, mezhep: 'hanefi', ikamet: null }, sonKonum: null, yuklendi: false }),
      { koordinatlar: ISTANBUL },
    );
    // İşleme kartta değil, ana ekranda koşulsuz çalışan kancadadır (tek durum alanı).
    const Kanca = () => {
      useSeferilikKartiGorunur();
      return null;
    };
    render(
      <Provider store={store}>
        <Kanca />
      </Provider>,
    );
    await waitFor(() => expect(store.getState().seferilik.ayarlar.ikamet).not.toBeNull());
    expect(store.getState().seferilik.ayarlar.ikamet).toMatchObject({ ...ESKISEHIR, kaynak: 'ilkKonum' });
    expect(store.getState().seferilik.sonKonum).toEqual(ESKISEHIR);
  });
});
