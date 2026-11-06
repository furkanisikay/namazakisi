/**
 * Yazı yönü sorusu (sahip kararı 2026-10-26): iki düğme — "Şimdi yeniden başlatın" uygulamayı
 * yeniden başlatır (başlatılamazsa ertelenmiş sayılır), "Sonra" yönün yeniden başlatmada
 * değişeceğini söyler. Başka bir soru açıkken ya da soru bir modalın içinde çiziliyorken
 * kökteki modal çizilmez (iOS kardeş modal kuralı).
 */
import * as React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return ({ name }: { name: string }) => <Text>{`[${name}]`}</Text>;
});
const RENKLER = {
  birincil: '#4CAF50', arkaplan: '#FAFAFA', kartArkaplan: '#FFFFFF', metin: '#212121', metinIkincil: '#757575',
  sinir: '#E0E0E0', bilgi: '#2196F3', birincilMetin: '#FFFFFF',
};
jest.mock('../../../../core/theme', () => ({ useRenkler: () => RENKLER }));
const mockGeri = jest.fn();
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: (a: boolean, f: () => void) => mockGeri(a, f) }));
const mockKisa = jest.fn();
jest.mock('../../common/KisaBildirim', () => ({ kisaBildirimGoster: (m: string, u?: boolean) => mockKisa(m, u) }));
const mockYenidenBaslat = jest.fn(() => Promise.resolve(true));
jest.mock('../../../../../modules/expo-sistem-durumu/src', () => ({
  ...jest.requireActual('../../../../../modules/expo-sistem-durumu/src'),
  yenidenBaslat: () => mockYenidenBaslat(),
}));

import dilReducer, { yonDegisimiAyarla, type YonDegisimi } from '../../../store/dilSlice';
import { YonDegisimiModali } from '../YonDegisimiModali';
import { useYonSorusunuBeklet, useYonSorusuYerelSahip, _yonSorusuKapisiniSifirla, YON_SORUSU_BIRAKMA_GECIKMESI_MS } from '../yonSorusuKapisi';
import { tr } from '../../../../core/dil/sozluk/tr';

const m = tr.yon;

const Bekleten: React.FC<{ aktif: boolean }> = ({ aktif }) => {
  useYonSorusunuBeklet(aktif);
  return null;
};
const YerelSahip: React.FC<{ aktif: boolean }> = ({ aktif }) => {
  useYonSorusuYerelSahip(aktif);
  return null;
};

const ciz = (durum: YonDegisimi, ek?: React.ReactNode) => {
  const store = configureStore({ reducer: { dil: dilReducer } });
  store.dispatch(yonDegisimiAyarla(durum));
  const e = render(
    <Provider store={store}>
      <YonDegisimiModali />
      {ek}
    </Provider>
  );
  return { store, ...e };
};

beforeEach(() => {
  _yonSorusuKapisiniSifirla();
  mockKisa.mockReset();
  mockGeri.mockReset();
  mockYenidenBaslat.mockReset().mockResolvedValue(true);
});

it("durum 'yok' ya da 'ertelendi' iken çizilmez", () => {
  expect(ciz('yok').queryByText(m.baslik)).toBeNull();
  expect(ciz('ertelendi').queryByText(m.baslik)).toBeNull();
});

it('soruluyor: başlık, açıklama ve iki düğme; geri tuşu bağlı', () => {
  const e = ciz('soruluyor');
  expect(e.getByText(m.baslik)).toBeTruthy();
  expect(e.getByText(m.aciklama)).toBeTruthy();
  expect(e.getByRole('button', { name: m.simdiBaslat })).toBeTruthy();
  expect(e.getByRole('button', { name: m.sonra })).toBeTruthy();
  expect(mockGeri).toHaveBeenLastCalledWith(true, expect.any(Function));
});

it('"Sonra" → ertelendi + yeniden başlatmada değişeceği uzun bildirimle söylenir', async () => {
  const e = ciz('soruluyor');
  fireEvent.press(e.getByTestId('yon-sonra'));
  expect(e.store.getState().dil.yonDegisimi).toBe('ertelendi');
  expect(mockKisa).toHaveBeenCalledWith(m.bekliyor, true);
  expect(mockYenidenBaslat).not.toHaveBeenCalled();
  await waitFor(() => expect(e.queryByText(m.baslik)).toBeNull());
});

it('geri tuşu "Sonra" sayılır', () => {
  const e = ciz('soruluyor');
  const geri = mockGeri.mock.calls[mockGeri.mock.calls.length - 1][1] as () => void;
  act(() => geri());
  expect(e.store.getState().dil.yonDegisimi).toBe('ertelendi');
});

it('"Şimdi yeniden başlatın" → uygulama yeniden başlatılır', async () => {
  const e = ciz('soruluyor');
  fireEvent.press(e.getByTestId('yon-simdi'));
  await waitFor(() => expect(mockYenidenBaslat).toHaveBeenCalledTimes(1));
  expect(mockKisa).not.toHaveBeenCalled();
  expect(e.store.getState().dil.yonDegisimi).toBe('soruluyor');
});

it('yeniden başlatılamazsa ertelenmiş gibi davranılır', async () => {
  mockYenidenBaslat.mockResolvedValue(false);
  const e = ciz('soruluyor');
  fireEvent.press(e.getByTestId('yon-simdi'));
  await waitFor(() => expect(e.store.getState().dil.yonDegisimi).toBe('ertelendi'));
  expect(mockKisa).toHaveBeenCalledWith(m.bekliyor, true);
});

it('başka bir soru açıkken bekler, o kapanınca (kısa gecikmeyle) gelir', async () => {
  const store = configureStore({ reducer: { dil: dilReducer } });
  store.dispatch(yonDegisimiAyarla('soruluyor'));
  const agac = (bekle: boolean) => (
    <Provider store={store}>
      <YonDegisimiModali />
      <Bekleten aktif={bekle} />
    </Provider>
  );
  const e = render(agac(true));
  expect(e.queryByText(m.baslik)).toBeNull();
  e.rerender(agac(false));
  expect(e.queryByText(m.baslik)).toBeNull();
  await waitFor(() => expect(e.getByText(m.baslik)).toBeTruthy(), { timeout: YON_SORUSU_BIRAKMA_GECIKMESI_MS + 1000 });
});

it('soru bir modalın içinde (yerel sahip) çiziliyorken kökteki modal çizilmez', () => {
  const e = ciz('soruluyor', <YerelSahip aktif />);
  expect(e.queryByText(m.baslik)).toBeNull();
});

it('kurulum sihirbazı dil penceresi soruyu listenin yerinde KART olarak çizer (tek soru, kök susar)', async () => {
  const { DilSecimModali } = require('../DilSecimModali') as typeof import('../DilSecimModali');
  const e = ciz('soruluyor', <DilSecimModali gorunur onKapat={() => undefined} secimVar cihazYerelAyari={null} />);
  await waitFor(() => expect(e.getAllByTestId('yon-degisimi')).toHaveLength(1));
  expect(e.queryByTestId('kurulum-dil-secici')).toBeNull();
  // Pencerede geri tuşu "Sonra" sayılır, pencere listeye döner.
  const geri = mockGeri.mock.calls.filter((c) => c[0] === true).pop()![1] as () => void;
  act(() => geri());
  expect(e.store.getState().dil.yonDegisimi).toBe('ertelendi');
});
