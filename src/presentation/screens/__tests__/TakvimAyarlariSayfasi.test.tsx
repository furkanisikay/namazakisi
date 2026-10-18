/**
 * Takvim entegrasyonu (sade tasarım Dalga 4):
 *  - ana anahtar açılırken izin yoksa ÖNCE açıklama (rıza) modalı; sistem diyaloğu
 *    yalnız kabulden sonra (modal kapanınca) — doğrudan istenmez,
 *  - izin yokken "takvim bulunamadı" denmez; sebep + tek düğme,
 *  - son aktarımdan beri ayar değiştiyse kalıcı "bekleyen değişiklik" bandı.
 */
import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { aktarimOzeti } from '../../../core/takvim/aktarimOzeti';
import { VARSAYILAN_TAKVIM_AYARLARI } from '../../store/takvimSlice';

const mockDepo = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (k: string) => mockDepo.get(k) ?? null),
    setItem: jest.fn(async (k: string, v: string) => {
      mockDepo.set(k, v);
    }),
  },
}));

const mockIzin = { durum: 'verildi' as 'verildi' | 'sorulabilir' | 'reddedildi' };
const mockIste = jest.fn(async () => ({ status: 'granted' }));
jest.mock('../../../domain/services/CihazDurumOkuyucu', () => ({
  alaniOku: jest.fn(async () => mockIzin.durum),
}));
jest.mock('expo-calendar/legacy', () => ({ requestCalendarPermissionsAsync: () => mockIste() }));

const mockTakvimler = jest.fn(async () => [{ id: 'k1', title: 'Kişisel', color: '#00f' }]);
jest.mock('../../../domain/services/TakvimServisi', () => ({
  TakvimServisi: { getInstance: () => ({ cihazTakvimleriniGetir: () => mockTakvimler() }) },
}));
jest.mock('../../../domain/services/NamazVaktiHesaplayiciServisi', () => ({
  NamazVaktiHesaplayiciServisi: { getInstance: () => ({ getGunlukVakitler: () => null }) },
}));
jest.mock('../../../core/feedback', () => ({ useFeedback: () => ({ butonTiklandiFeedback: jest.fn(async () => undefined) }) }));
jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({ params: undefined }),
  useFocusEffect: (cb: () => void) => {
    const React = require('react');
    React.useEffect(cb, [cb]);
  },
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
jest.mock('../../components/common/KisaBildirim', () => ({ kisaBildirimGoster: jest.fn() }));
jest.mock('../../../core/theme', () => ({
  useRenkler: () => ({
    arkaplan: '#fff', kartArkaplan: '#f0f0f0', birincil: '#4CAF50', birincilMetin: '#FFFFFF', metin: '#333',
    metinIkincil: '#666', sinir: '#ccc', hata: '#F44336', bilgi: '#2196F3', basarili: '#4CAF50', dikkat: '#E65100',
    uyari: '#FFC107', durum: { hata: '#F44336', bilgi: '#2196F3', basarili: '#4CAF50', uyari: '#FFC107', dikkat: '#E65100' },
  }),
}));

const mockDispatch = jest.fn((x: unknown) => x);
const mockState = { takvim: { ayarlar: { ...VARSAYILAN_TAKVIM_AYARLARI }, olayOlusturuluyor: false }, konum: { koordinatlar: { lat: 41, lng: 29 } } };
jest.mock('../../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (sec: (s: typeof mockState) => unknown) => sec(mockState),
}));
jest.mock('../../store/takvimSlice', () => {
  const gercek = jest.requireActual('../../store/takvimSlice');
  return {
    ...gercek,
    takvimAyarlariniYukle: () => ({ type: 'takvim/yukle' }),
    takvimAyarlariniGuncelle: (d: unknown) => ({ type: 'takvim/guncelle', payload: d }),
  };
});

const sayfa = () => require('../TakvimAyarlariSayfasi').TakvimAyarlariSayfasi as React.ComponentType;

beforeEach(() => {
  jest.clearAllMocks();
  mockDepo.clear();
  mockIzin.durum = 'verildi';
  mockState.takvim.ayarlar = { ...VARSAYILAN_TAKVIM_AYARLARI };
});

describe('TakvimAyarlariSayfasi — izin akışı', () => {
  it('izin yokken anahtarı açmak önce açıklama modalını açar, sistem diyaloğunu DOĞRUDAN istemez', async () => {
    mockIzin.durum = 'sorulabilir';
    const Sayfa = sayfa();
    const { getAllByLabelText, getByTestId } = render(<Sayfa />);
    await act(async () => {
      await Promise.resolve();
    });
    fireEvent.press(getAllByLabelText('Vakitleri takvime ekleyin')[0]);
    expect(getByTestId('takvim-riza-modali')).toBeTruthy();
    expect(mockIste).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalledWith({ type: 'takvim/guncelle', payload: { aktif: true } });
  });

  it('açıkken izin yoksa "takvim bulunamadı" denmez; izin satırı çıkar ve takvim listesi OKUNMAZ', async () => {
    mockIzin.durum = 'reddedildi';
    mockState.takvim.ayarlar = { ...VARSAYILAN_TAKVIM_AYARLARI, aktif: true };
    const Sayfa = sayfa();
    const { findByTestId, queryByText } = render(<Sayfa />);
    expect(await findByTestId('takvim-izin-satiri')).toBeTruthy();
    expect(queryByText(/düzenlenebilir takvim bulunamadı/)).toBeNull();
    expect(mockTakvimler).not.toHaveBeenCalled();
  });
});

describe('TakvimAyarlariSayfasi — bekleyen değişiklik', () => {
  it('hiç aktarılmadıysa bant yok', async () => {
    mockState.takvim.ayarlar = { ...VARSAYILAN_TAKVIM_AYARLARI, aktif: true, takvimId: 'k1' };
    const Sayfa = sayfa();
    const { queryByTestId, findByText } = render(<Sayfa />);
    expect(await findByText('Kişisel')).toBeTruthy();
    expect(queryByTestId('takvim-bekleyen-degisiklik')).toBeNull();
  });

  it('son aktarımdan beri ayar değiştiyse kalıcı bant + "Şimdi aktarın"', async () => {
    const eski = { ...VARSAYILAN_TAKVIM_AYARLARI, aktif: true, takvimId: 'k1' };
    mockDepo.set('@namaz_akisi/takvim_son_aktarim', aktarimOzeti(eski));
    mockState.takvim.ayarlar = { ...eski, kaciGunIlerisi: 14 };
    const Sayfa = sayfa();
    const { findByTestId, getByLabelText } = render(<Sayfa />);
    expect(await findByTestId('takvim-bekleyen-degisiklik')).toBeTruthy();
    expect(getByLabelText('Şimdi aktarın')).toBeTruthy();
  });

  it('ayar son aktarımla aynıysa bant yok', async () => {
    const ayar = { ...VARSAYILAN_TAKVIM_AYARLARI, aktif: true, takvimId: 'k1' };
    mockDepo.set('@namaz_akisi/takvim_son_aktarim', aktarimOzeti(ayar));
    mockState.takvim.ayarlar = ayar;
    const Sayfa = sayfa();
    const { queryByTestId, findByText } = render(<Sayfa />);
    expect(await findByText('Kişisel')).toBeTruthy();
    await waitFor(() => expect(queryByTestId('takvim-bekleyen-degisiklik')).toBeNull());
  });
});
