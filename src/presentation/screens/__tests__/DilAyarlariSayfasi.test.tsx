/**
 * Dil sayfası: cihaz dili + seçilebilir diller (ad kendi dilinde), beta rozeti, notlar;
 * dil değişince elle yazılmış sesli okuma metinleri için BİR KEZ sorulur.
 */
import * as React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return ({ name }: { name: string }) => <Text>{`[${name}]`}</Text>;
});
const RENKLER = {
  birincil: '#4CAF50', arkaplan: '#FAFAFA', kartArkaplan: '#FFFFFF', metin: '#212121', metinIkincil: '#757575',
  sinir: '#E0E0E0', basarili: '#4CAF50', dikkat: '#E65100', bilgi: '#2196F3', hata: '#F44336', uyari: '#FFC107',
  durum: { bilgi: '#2196F3', uyari: '#FFC107', dikkat: '#E65100', basarili: '#4CAF50', hata: '#F44336' },
  birincilMetin: '#FFFFFF',
};
jest.mock('../../../core/theme', () => ({ useRenkler: () => RENKLER, useTema: () => ({ koyuMu: false }) }));
jest.mock('../../hooks/useHareketAzalt', () => ({ useHareketAzalt: () => true }));
jest.mock('../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: () => undefined }));
const mockKisa = jest.fn();
jest.mock('../../components/common/KisaBildirim', () => ({ kisaBildirimGoster: (m: string) => mockKisa(m) }));

// İngilizce henüz seçicide kapalı: sayfanın çok dilli hâlini sınamak için açılır.
jest.mock('../../../core/dil/diller', () => {
  const gercek = jest.requireActual('../../../core/dil/diller');
  return { ...gercek, DILLER: gercek.DILLER.map((d: object) => ({ ...d, secilebilir: true })), cihazDilindenSec: (y: string | null) => (y?.startsWith('en') ? 'en' : null) };
});

const mockSecimVar = jest.fn(() => Promise.resolve(true));
const mockKaydet = jest.fn((_k: string) => Promise.resolve(true));
const mockMetinDili = jest.fn(() => Promise.resolve('tr'));
const mockMetinDiliKaydet = jest.fn((_k: string) => Promise.resolve());
jest.mock('../../../domain/services/DilServisi', () => {
  const { aktifDiliKur } = jest.requireActual('../../../core/dil/aktifDil');
  return {
    cihazYerelAyari: () => 'de_DE',
    DilServisi: {
      secimVar: () => mockSecimVar(),
      kaydet: (k: string) => {
        aktifDiliKur(k);
        return mockKaydet(k);
      },
      cihazDilineDon: () => Promise.resolve(false),
      yukle: () => Promise.resolve('tr'),
      ozelAnonsDili: () => mockMetinDili(),
      ozelAnonsDiliniKaydet: (k: string) => mockMetinDiliKaydet(k),
    },
  };
});
jest.mock('../../../domain/services/bildirimKategorileri', () => ({ bildirimKategorileriniKaydet: () => Promise.resolve() }));
jest.mock('../../../domain/services/BildirimServisi', () => ({
  BildirimServisi: { getInstance: () => ({ temelKanallariKur: () => Promise.resolve() }) },
}));
const mockSay = jest.fn(() => Promise.resolve(0));
const mockDegistir = jest.fn(() => Promise.resolve([] as string[]));
jest.mock('../../../data/local/LocalOzelAnonsServisi', () => ({
  LocalOzelAnonsServisi: { say: () => mockSay(), sablonlaDegistir: () => mockDegistir() },
}));

import dilReducer from '../../store/dilSlice';
import { DilAyarlariSayfasi } from '../DilAyarlariSayfasi';
import { aktifDilSifirla } from '../../../core/dil/aktifDil';
import { turkceKalanlar } from '../../../__tests__/yardimci/ingilizceDenetimi';

const ciz = () => {
  const store = configureStore({ reducer: { dil: dilReducer, konum: (s: unknown = { koordinatlar: null }) => s } });
  return { store, ...render(<Provider store={store}><DilAyarlariSayfasi /></Provider>) };
};

beforeEach(() => {
  mockSecimVar.mockReset().mockResolvedValue(true);
  mockKaydet.mockReset().mockResolvedValue(true);
  mockSay.mockReset().mockResolvedValue(0);
  mockDegistir.mockReset().mockResolvedValue([]);
  mockKisa.mockReset();
  mockMetinDili.mockReset().mockResolvedValue('tr');
  mockMetinDiliKaydet.mockReset().mockResolvedValue(undefined);
});
afterEach(() => aktifDilSifirla());

it('Türkçe: diller kendi adıyla, açıklama arayüz dilinde; desteklenmeyen cihaz dili söylenir', async () => {
  const e = ciz();
  expect(e.getByText('Türkçe')).toBeTruthy();
  expect(e.getByText('English')).toBeTruthy();
  expect(e.getByText('İngilizce · Beta')).toBeTruthy();
  expect(e.getByText('Cihazınızın dili henüz yok; Türkçe kullanılıyor.')).toBeTruthy();
  expect(e.getByText('Dil, namaz vakitlerinin hesabını değiştirmez.')).toBeTruthy();
  // Türkçede hadis gösterilir → hadis notu yok; Türkçe beta değil → beta notu yok.
  expect(e.queryByText(/hadis metinleri/)).toBeNull();
  expect(e.queryByText(/Beta çeviriler/)).toBeNull();
  await waitFor(() => expect(e.getByRole('radio', { name: /^Türkçe/ }).props.accessibilityState.checked).toBe(true));
});

it('İngilizce seçilince ekran İngilizce çizilir, notlar görünür; özel metin yoksa soru yok', async () => {
  const e = ciz();
  await waitFor(() => expect(mockSecimVar).toHaveBeenCalled());
  fireEvent.press(e.getByText('English'));
  await waitFor(() => expect(e.store.getState().dil.kod).toBe('en'));
  await waitFor(() => expect(e.getByText('Turkish')).toBeTruthy());
  expect(e.getByText(/only Quran translations are shown/)).toBeTruthy();
  expect(e.getByText(/Beta translations/)).toBeTruthy();
  expect(turkceKalanlar(e.toJSON() as never, ['Dil\\b', 'Cihaz', 'Hazır']).filter((m) => !/^Türkçe(\. Turkish)?$/.test(m))).toEqual([]);
  expect(mockSay).toHaveBeenCalledTimes(1);
  expect(e.queryByText('Read-aloud texts you wrote')).toBeNull();
});

it('elle yazılmış metin varsa bir kez sorulur; "değiştirin" servisi çağırır', async () => {
  mockSay.mockResolvedValue(2);
  mockDegistir.mockResolvedValue(['muhafiz', 'cuma']);
  const e = ciz();
  await waitFor(() => expect(mockSecimVar).toHaveBeenCalled());
  fireEvent.press(e.getByText('English'));
  await waitFor(() => expect(e.getByText('Read-aloud texts you wrote')).toBeTruthy());
  expect(e.getByText(/2 read-aloud texts you wrote are still in the previous language/)).toBeTruthy();
  fireEvent.press(e.getByText('Replace with ready-made text'));
  await waitFor(() => expect(mockDegistir).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(mockKisa).toHaveBeenCalledWith('2 texts replaced.'));
});

it('"olduğu gibi bırakın" hiçbir şey değiştirmez', async () => {
  mockSay.mockResolvedValue(1);
  const e = ciz();
  await waitFor(() => expect(mockSecimVar).toHaveBeenCalled());
  fireEvent.press(e.getByText('English'));
  await waitFor(() => expect(e.getByText('Keep as is')).toBeTruthy());
  fireEvent.press(e.getByText('Keep as is'));
  await waitFor(() => expect(e.queryByText('Read-aloud texts you wrote')).toBeNull());
  expect(mockDegistir).not.toHaveBeenCalled();
});

it('metinlerin dili yeni dille aynıysa (geri dönüş) sorulmaz; metin yoksa yeni dil varsayılır', async () => {
  mockSay.mockResolvedValue(3);
  mockMetinDili.mockResolvedValue('en');
  const e = ciz();
  await waitFor(() => expect(mockSecimVar).toHaveBeenCalled());
  fireEvent.press(e.getByText('English'));
  await waitFor(() => expect(mockSay).toHaveBeenCalledTimes(1));
  expect(e.queryByText('Read-aloud texts you wrote')).toBeNull();
  expect(mockMetinDiliKaydet).not.toHaveBeenCalled();

  mockSay.mockResolvedValue(0);
  fireEvent.press(e.getByText('Türkçe'));
  await waitFor(() => expect(mockMetinDiliKaydet).toHaveBeenCalledWith('tr'));
});
