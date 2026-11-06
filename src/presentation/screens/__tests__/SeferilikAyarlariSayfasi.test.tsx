/**
 * Ayarlar > Namaz vakitleri > Yolculuk bilgisi (issue #296): kart anahtarı,
 * ikamet gösterimi ve Diyanet kaynakları. Mezhep seçimi Dalga 3'te Namaz vakitleri
 * sayfasına taşındı (`NamazVakitleriSayfasi.test.tsx`).
 */
import React from 'react';
import { Linking } from 'react-native';
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
    kartArkaplan: '#FFFFFF',
    arkaplan: '#FAFAFA',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    birincilMetin: '#FFFFFF',
    metin: '#212121',
    metinIkincil: '#757575',
  }),
}));
jest.mock('../../../core/feedback', () => ({ useFeedback: () => ({ butonTiklandiFeedback: jest.fn() }) }));
jest.mock('../../components/common/KisaBildirim', () => ({ kisaBildirimGoster: jest.fn() }));

import seferilikReducer from '../../store/seferilikSlice';
import { SeferilikAyarlariSayfasi } from '../SeferilikAyarlariSayfasi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { SEFERILIK_KAYNAK_LISTESI } from '../../../core/seferilik/seferilikMetni';
import { ingilizceyeGec, turkceKalanlar } from '../../../__tests__/yardimci/ingilizceDenetimi';

const ANKARA = { lat: 39.9208, lng: 32.8541 };
const ESKISEHIR = { lat: 39.7767, lng: 30.5206 };

const kur = () => {
  const store = configureStore({ reducer: { seferilik: seferilikReducer } });
  const sonuc = render(
    <Provider store={store}>
      <SeferilikAyarlariSayfasi />
    </Provider>,
  );
  return { store, ...sonuc };
};

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  await AsyncStorage.setItem(
    DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI,
    JSON.stringify({ kartAcik: true, mezhep: 'hanefi', ikamet: { ...ANKARA, ad: 'Çankaya, Ankara', kaynak: 'kullanici' } }),
  );
  await AsyncStorage.setItem(
    DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI,
    JSON.stringify({ konumModu: 'manuel', koordinatlar: ESKISEHIR, seciliIlAdi: 'Eskişehir', seciliIlceAdi: 'Tepebaşı' }),
  );
});

describe('SeferilikAyarlariSayfasi', () => {
  it('ikamet yerini ve şu anki uzaklığı gösterir; mezhebin nerede seçildiğini söyler', async () => {
    const { getByText } = kur();
    await waitFor(() => expect(getByText('Çankaya, Ankara')).toBeTruthy());
    await waitFor(() => expect(getByText(/kuş uçuşu yaklaşık \d+ km uzaktasınız/)).toBeTruthy());
    expect(getByText(/mezhebi Ayarlar › Namaz vakitleri'nden seçebilirsiniz/)).toBeTruthy();
  });

  it('mezhep seçimi bu sayfada YOK (Namaz vakitleri sayfasına taşındı)', async () => {
    const { queryByLabelText, store } = kur();
    await waitFor(() => expect(store.getState().seferilik.yuklendi).toBe(true));
    expect(queryByLabelText(/^Şâfiî/)).toBeNull();
  });

  it('"Şu anki konumu ikamet yeri yapın" diskteki konumu kullanıcı kaynağıyla kaydeder', async () => {
    const { getByLabelText, store } = kur();
    await waitFor(() => expect(store.getState().seferilik.sonKonum).not.toBeNull());
    fireEvent.press(getByLabelText('Şu anki konumunuzu ikamet yeri olarak kaydedin'));
    await waitFor(() =>
      expect(store.getState().seferilik.ayarlar.ikamet).toEqual({ ...ESKISEHIR, ad: 'Tepebaşı, Eskişehir', kaynak: 'kullanici' }),
    );
  });

  it('her Diyanet kaynağı tarayıcıda açılır', async () => {
    const ac = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const { getByLabelText, store } = kur();
    await waitFor(() => expect(store.getState().seferilik.yuklendi).toBe(true));
    for (const k of SEFERILIK_KAYNAK_LISTESI) {
      fireEvent.press(getByLabelText(`${k.etiket}. Tarayıcıda açılır`));
      expect(ac).toHaveBeenLastCalledWith(k.url);
    }
    ac.mockRestore();
  });
});

describe('SeferilikAyarlariSayfasi — İngilizce', () => {
  let geriAl: () => void;
  beforeEach(() => {
    geriAl = ingilizceyeGec();
  });
  afterEach(() => geriAl());

  it('sayfada Türkçe metin kalmaz; 190 Fetva Hattı Türkiye dışı dilde gösterilmez', async () => {
    const { toJSON, getByText, queryByText } = kur();
    await waitFor(() => expect(getByText('Çankaya, Ankara')).toBeTruthy());
    await waitFor(() => expect(getByText(/about \d+ km away/)).toBeTruthy());
    // Kaynak fetva başlıkları "(in Turkish)" etiketiyle İngilizcedir; yer adı veridir.
    const kalan = turkceKalanlar(toJSON() as never, ['Bilgi', 'Kaynak', 'Yolculuk']).filter((m) => m !== 'Çankaya, Ankara');
    expect(kalan).toEqual([]);
    expect(queryByText(/190/)).toBeNull();
  });
});
