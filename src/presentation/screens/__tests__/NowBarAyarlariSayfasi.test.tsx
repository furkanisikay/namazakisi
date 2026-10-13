/**
 * NowBarAyarlariSayfasi (issue #282 ikinci aşama): sistem durumu kartı, politika
 * satırı, öğe anahtarları ve başlangıç seçimi; planlar debounce'lu kurulur.
 */
import React from 'react';
import { Linking, Platform } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useRenkler } from '../../../core/theme';
import { VARSAYILAN_NOW_BAR_AYARLARI, nowBarAyariniBirlestir, type NowBarAyarlari } from '../../../core/sayac/nowBar';
import { nowBarOgesiniGuncelle } from '../../store/nowBarSlice';

jest.mock('../../store/hooks');
jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('../../store/nowBarSlice', () => ({
  nowBarOgesiniGuncelle: jest.fn((d: unknown) => ({ type: 'nowBar/guncelle', payload: d })),
  nowBarAyarlariniYukle: jest.fn(() => ({ type: 'nowBar/yukle' })),
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{props.name}</Text>;
});
const mockCanliDurumu = jest.fn();
const mockCanliAyarlariniAc = jest.fn();
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
  canliDurumu: () => mockCanliDurumu(),
  canliAyarlariniAc: () => mockCanliAyarlariniAc(),
}));
const mockNowBarDegistiUygula = jest.fn();
jest.mock('../../../domain/services/NowBarDegisikligiServisi', () => ({
  nowBarDegistiUygula: () => mockNowBarDegistiUygula(),
}));

import { NowBarAyarlariSayfasi } from '../NowBarAyarlariSayfasi';

const RENKLER = {
  birincil: '#4CAF50',
  arkaplan: '#FAFAFA',
  kartArkaplan: '#FFFFFF',
  metin: '#15161A',
  metinIkincil: '#757575',
  sinir: '#E0E0E0',
  durum: { hata: '#F44336', uyari: '#FFC107', basarili: '#4CAF50', bilgi: '#2196F3', dikkat: '#E65100' },
};

const dispatch = jest.fn();
const kur = async (ayarlar: NowBarAyarlari = VARSAYILAN_NOW_BAR_AYARLARI) => {
  (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
  (useAppSelector as jest.Mock).mockImplementation((sec: (s: unknown) => unknown) =>
    sec({ nowBar: { ayarlar, yuklendi: true } })
  );
  (useRenkler as jest.Mock).mockReturnValue(RENKLER);
  const ekran = render(<NowBarAyarlariSayfasi />);
  await act(async () => {
    await Promise.resolve();
  });
  return ekran;
};

describe('NowBarAyarlariSayfasi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Jest varsayılanı 'ios'tur; ekran platforma göre dallanır (AGENTS.md test kuralı).
    jest.replaceProperty(Platform, 'OS', 'android');
    mockCanliDurumu.mockResolvedValue('acik');
    mockCanliAyarlariniAc.mockResolvedValue('canli');
    mockNowBarDegistiUygula.mockResolvedValue(undefined);
  });

  it('politika satırı her durumda görünür; başlık gövdede tekrarlanmaz', async () => {
    const ekran = await kur();
    expect(ekran.getByTestId('now-bar-politika').props.children).toBe(
      'Google sürekli açık kartları önermez; telefonunuz öne çıkarmayı geri çekebilir.'
    );
    expect(ekran.queryByText('Now Bar ve Canlı Sayaçlar')).toBeNull();
    expect(ekran.getByText('Canlı güncellemeler açık')).toBeTruthy();
    expect(ekran.queryByLabelText('Sistem ayarlarını açın')).toBeNull();
  });

  it('sistemde kapalıyken "Sistem ayarlarını açın" eylemi çıkar ve ayarı açar', async () => {
    mockCanliDurumu.mockResolvedValue('kapali');
    const ekran = await kur();
    expect(ekran.getByText('Canlı güncellemeler kapalı')).toBeTruthy();
    fireEvent.press(ekran.getByLabelText('Sistem ayarlarını açın'));
    await waitFor(() => expect(mockCanliAyarlariniAc).toHaveBeenCalled());
  });

  it('Android 16 öncesinde açıklayıcı bilgi gösterilir', async () => {
    mockCanliDurumu.mockResolvedValue('desteklenmiyor');
    const ekran = await kur();
    expect(ekran.getByText('Android 16 ve üstünde çalışır')).toBeTruthy();
  });

  it('her vakit ayrı açılır/kapanır; seri varsayılan kapalı ve ayrıntısı gizli', async () => {
    const ekran = await kur();
    fireEvent(ekran.getByLabelText("İkindi Now Bar'da"), 'valueChange', false);
    expect(nowBarOgesiniGuncelle).toHaveBeenCalledWith({ oge: 'ikindi', degisiklik: { acik: false } });
    expect(ekran.queryByLabelText('Seri: Son 2 saatte')).toBeNull();
  });

  it('başlangıç seçimi ve "son N dk" seçicisi benzersiz etiketli', async () => {
    const ayarlar = nowBarAyariniBirlestir(VARSAYILAN_NOW_BAR_AYARLARI, 'ogle', { baslangic: 'sonDk', sonDk: 20 });
    const ekran = await kur(ayarlar);
    fireEvent.press(ekran.getByLabelText('Akşam: Vakit girince'));
    expect(nowBarOgesiniGuncelle).toHaveBeenCalledWith({ oge: 'aksam', degisiklik: { baslangic: 'girince' } });
    expect(ekran.getByLabelText('Öğle son dakika artır')).toBeTruthy();
  });

  it('planlar debounce ile TEK kez kurulur, ekrandan çıkışta bekleyen tur hemen uygulanır', async () => {
    // Gerçek zaman (AGENTS.md: sahte zamanlayıcı + RN render CI'da asılabilir).
    const ekran = await kur();
    fireEvent(ekran.getByLabelText("Öğle Now Bar'da"), 'valueChange', false);
    fireEvent(ekran.getByLabelText("Akşam Now Bar'da"), 'valueChange', false);
    expect(mockNowBarDegistiUygula).not.toHaveBeenCalled();
    await waitFor(() => expect(mockNowBarDegistiUygula).toHaveBeenCalledTimes(1));
    fireEvent(ekran.getByLabelText("Yatsı Now Bar'da"), 'valueChange', false);
    ekran.unmount();
    expect(mockNowBarDegistiUygula).toHaveBeenCalledTimes(2);
  });
});

describe('NowBarAyarlariSayfasi — iOS canlı etkinlik (#295)', () => {
  // moduleNameMapper mock'u: aynı örneğe `require` ile ulaşılır (AGENTS.md).
  const siri = require('../../../../modules/expo-siri-kisayollari/src') as { canliEtkinlikIzniAcik: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.replaceProperty(Platform, 'OS', 'ios');
    siri.canliEtkinlikIzniAcik.mockResolvedValue(true);
    mockNowBarDegistiUygula.mockResolvedValue(undefined);
  });
  afterEach(() => {
    siri.canliEtkinlikIzniAcik.mockResolvedValue(null);
  });

  it('iPhone metinleri: sınır notu dürüstçe söylenir, Android durumu sorulmaz', async () => {
    const ekran = await kur();
    expect(ekran.getByText('Canlı etkinlikler açık')).toBeTruthy();
    expect(ekran.getByTestId('now-bar-politika').props.children).toContain(
      'Canlı etkinlik yalnız uygulama açıkken başlatılabilir'
    );
    expect(ekran.getByTestId('now-bar-politika').props.children).toContain('en fazla 8 saat');
    expect(mockCanliDurumu).not.toHaveBeenCalled();
  });

  it('iftar, sahur ve seri listelenmez; vakitte "Sayaçla" seçeneği yoktur', async () => {
    const ekran = await kur();
    expect(ekran.queryByTestId('now-bar-oge-iftar')).toBeNull();
    expect(ekran.queryByTestId('now-bar-oge-sahur')).toBeNull();
    expect(ekran.queryByTestId('now-bar-oge-seri')).toBeNull();
    expect(ekran.getByTestId('now-bar-oge-cuma')).toBeTruthy();
    expect(ekran.queryByLabelText('Öğle: Sayaçla')).toBeNull();
    // Kayıttaki "sayaçla" iPhone'da son dakikalar olarak SEÇİLİ görünür (sessiz sapma yok).
    expect(ekran.getByLabelText('Öğle: Son dakikalar').props.accessibilityState).toEqual({ selected: true });
    expect(ekran.getByLabelText('Öğle son dakika artır')).toBeTruthy();
  });

  it('izin kapalıyken uygulamanın iPhone ayarları açılır', async () => {
    siri.canliEtkinlikIzniAcik.mockResolvedValue(false);
    const ac = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
    const ekran = await kur();
    expect(ekran.getByText('Canlı etkinlikler kapalı')).toBeTruthy();
    fireEvent.press(ekran.getByLabelText('Sistem ayarlarını açın'));
    await waitFor(() => expect(ac).toHaveBeenCalled());
    expect(mockCanliAyarlariniAc).not.toHaveBeenCalled();
    ac.mockRestore();
  });

  it('öğe anahtarı canlı etkinlik diliyle etiketlenir', async () => {
    const ekran = await kur();
    fireEvent(ekran.getByLabelText('İkindi canlı etkinlikte'), 'valueChange', false);
    expect(nowBarOgesiniGuncelle).toHaveBeenCalledWith({ oge: 'ikindi', degisiklik: { acik: false } });
  });
});
