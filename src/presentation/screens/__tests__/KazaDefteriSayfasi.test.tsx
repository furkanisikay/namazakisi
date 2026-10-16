/**
 * Kaza Defteri 2.0 ekranları — GERÇEK kaza slice'ı + gerçek defter yolu
 * (LocalKazaServisi → KazaDefteriServisi → saf türetme) bellek-içi AsyncStorage
 * ile. Slice mock'lanmaz: eski test slice'ı mock'ladığı için olmayan bir
 * thunk'ı (`sihirbazIleBaslat`) çağıran ekran yeşil kalmıştı.
 */
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import kazaReducer, { borcEkle, kazaTamamla, kazaVerileriniYukle } from '../../store/kazaSlice';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { _testIcinSifirla, hareketleriEkle } from '../../../data/local/LocalKazaServisi';
import { gunEkle, tarihiISOFormatinaCevir } from '../../../core/utils/TarihYardimcisi';

const mockStore = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: async (k: string) => (mockStore.has(k) ? mockStore.get(k)! : null),
    setItem: async (k: string, v: string) => {
      mockStore.set(k, v);
    },
    removeItem: async (k: string) => {
      mockStore.delete(k);
    },
    getAllKeys: async () => Array.from(mockStore.keys()),
    multiGet: async (ks: readonly string[]) => ks.map((k) => [k, mockStore.has(k) ? mockStore.get(k)! : null]),
  },
}));
jest.mock('../../../core/utils/Logger', () => ({
  Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));
jest.mock('../../../core/theme', () => ({
  useRenkler: () => ({
    arkaplan: '#ffffff',
    kartArkaplan: '#f0f0f0',
    birincil: '#4CAF50',
    birincilMetin: '#FFFFFF',
    metin: '#333333',
    metinIkincil: '#666666',
    sinir: '#cccccc',
    hata: '#F44336',
    bilgi: '#2196F3',
    basarili: '#10b981',
    uyari: '#FFC107',
    dikkat: '#E65100',
    vurgu: '#00BFA5',
  }),
}));
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRoute: { params: unknown } = { params: undefined };
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useRoute: () => mockRoute,
}));
jest.mock('../../../domain/services/KazaHesaplayiciServisi', () => ({
  ...jest.requireActual('../../../domain/services/KazaHesaplayiciServisi'),
  mekruhVakitKontrolEt: jest.fn(() => ({ mekruhMu: false, aciklama: null })),
}));
jest.mock('../../../domain/services/YatisHatirlatmaServisi', () => ({
  YatisHatirlatmaServisi: { getInstance: () => ({ hatirlatmalariGuncelle: jest.fn().mockResolvedValue(undefined) }) },
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: { children: React.ReactNode }) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { FontAwesome5: (props: { name: string }) => <Text>{props.name}</Text> };
});
jest.mock('../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
jest.mock('../../components/common/KisaBildirim', () => ({ kisaBildirimGoster: jest.fn() }));

const bugun = () => tarihiISOFormatinaCevir(new Date());
const storeKur = () =>
  configureStore({
    reducer: {
      kaza: kazaReducer,
      konum: (s = { koordinatlar: { lat: 41, lng: 29 } }) => s,
    },
  });

const ciz = async (Bilesen: React.ComponentType, store = storeKur()) => {
  const r = render(
    <Provider store={store}>
      <Bilesen />
    </Provider>
  );
  await waitFor(() => expect(r.queryByText('Yükleniyor...')).toBeNull());
  return { ...r, store };
};

const anaSayfa = () => require('../KazaDefteriSayfasi').KazaDefteriSayfasi as React.ComponentType;

beforeEach(() => {
  mockStore.clear();
  _testIcinSifirla();
  jest.clearAllMocks();
  mockRoute.params = undefined;
});

describe('KazaDefteriSayfasi (ana sayfa)', () => {
  it('render olur; günlük hedefe geçersiz değer girilince tema-uyumlu hata modalı açılır', async () => {
    const { getByText, getByPlaceholderText, store } = await ciz(anaSayfa());
    expect(getByText('Kaza Defteri')).toBeTruthy();
    fireEvent.press(getByText('edit'));
    fireEvent.changeText(await waitFor(() => getByPlaceholderText('Örn: 3')), 'abc');
    fireEvent.press(getByText('Kaydet'));
    await waitFor(() => expect(getByText('Geçerli bir sayı giriniz (0 = hedefsiz).')).toBeTruthy());
    expect(store.getState().kaza.kazaDurumu!.gunlukHedef).not.toBe(Number.NaN);
  });

  it('REGRESYON: sihirbazın son adımı ÇÖKMEZ, önizleme ekranına girdiyle gider', async () => {
    const { getByText, getByPlaceholderText, getByLabelText } = await ciz(anaSayfa());
    fireEvent.press(getByText('Hesaplama sihirbazı ile başlayın'));
    fireEvent.changeText(getByPlaceholderText('Örn: 1995'), '1990');
    fireEvent.press(getByLabelText('İleri'));
    fireEvent.press(getByLabelText('İleri'));
    fireEvent.press(getByText('Önizleyin'));
    expect(mockNavigate).toHaveBeenCalledWith('KazaYenidenHesapla', {
      girdi: { dogumTarihi: '1990-01-01', ergenlikYasi: 14, kildigiTahminiYuzdesi: 0 },
    });
  });

  it('kaynak özeti ve fazla kılınan gösterilir; "Sıfırlayın" fazlayı kaldırır, kalanı değiştirmez', async () => {
    const store = storeKur();
    await store.dispatch(borcEkle({ namazAdi: 'Sabah', sayi: 2 }));
    await store.dispatch(kazaTamamla({ namazAdi: 'Sabah', sayi: 5 }));
    await store.dispatch(borcEkle({ namazAdi: 'Sabah', sayi: 4 }));
    const { getByText, getByLabelText, queryByText } = await ciz(anaSayfa(), store);
    expect(getByText('5 kılındı · 6 elle eklendi')).toBeTruthy();
    expect(getByText(/3 fazla kılınmış/)).toBeTruthy();
    fireEvent.press(getByLabelText(/fazla kılınmış\. Sıfırlamak için dokunun/));
    await act(async () => {
      fireEvent.press(getByLabelText('Sıfırlayın'));
    });
    await waitFor(() => expect(queryByText(/fazla kılınmış/)).toBeNull());
    expect(store.getState().kaza.kazaDurumu!.toplamKalan).toBe(4);
  });

  it('"Bana sorun": kontrol bekleyen günler kartı → "Hepsini ekleyin" → kart kaybolur, borç eklenir', async () => {
    await hareketleriEkle([
      { id: 'oto1', zaman: new Date().toISOString(), cihaz: 'a', kaynak: 'otoAyar', aktif: true, gun: gunEkle(bugun(), -3), kayitsiz: 'sor' },
    ]);
    const { getByTestId, getByLabelText, getByText, queryByTestId, store } = await ciz(anaSayfa());
    expect(getByTestId('kaza-bekleyen-gunler')).toBeTruthy();
    fireEvent.press(getByLabelText('Kontrol bekleyen günleri inceleyin'));
    await act(async () => {
      fireEvent.press(getByText('Hepsini ekleyin'));
    });
    await waitFor(() => expect(queryByTestId('kaza-bekleyen-gunler')).toBeNull());
    expect(store.getState().kaza.kazaDurumu!.toplamKalan).toBeGreaterThan(0);
  });

  it('bozuk ay anahtarı uyarı bandı gösterir; sayfa sonsuz yüklemede kalmaz', async () => {
    mockStore.set(`${DEPOLAMA_ANAHTARLARI.KAZA_HAREKET_ONEK}2026-03`, '{bozuk');
    const { getByTestId } = await ciz(anaSayfa());
    expect(getByTestId('kaza-bozuk-ay-bandi')).toBeTruthy();
  });

  it('otomatik ekleme çipi ve defter bağlantıları alt ekranlara gider', async () => {
    const { getByLabelText } = await ciz(anaSayfa());
    fireEvent.press(getByLabelText('Otomatik ekleme kapalı. Ayarı açın'));
    fireEvent.press(getByLabelText('Hareket geçmişini açın'));
    fireEvent.press(getByLabelText('Kayıtları temizleyin'));
    expect(mockNavigate.mock.calls.map((c) => c[0])).toEqual(['KazaOtomatikAyar', 'KazaGecmisi', 'KazaTemizlik']);
  });
});

describe('KazaDefteriSayfasi — "Her farzla bir kaza" anahtarı (issue #294)', () => {
  it('borç varken görünür ve kapatınca ayarı diske yazar', async () => {
    const store = storeKur();
    await store.dispatch(borcEkle({ namazAdi: 'Sabah', sayi: 1 }));
    const { findByLabelText } = await ciz(anaSayfa(), store);
    const anahtar = await findByLabelText('Her farzdan sonra kaza önerin');
    await act(async () => {
      fireEvent(anahtar, 'valueChange', false);
    });
    await waitFor(() =>
      expect(JSON.parse(mockStore.get(DEPOLAMA_ANAHTARLARI.KAZA_ONERI_AYARLARI)!)).toEqual({ farzSonrasiOner: false })
    );
  });

  it('borç yoksa hiç görünmez', async () => {
    const { queryByLabelText } = await ciz(anaSayfa());
    expect(queryByLabelText('Her farzdan sonra kaza önerin')).toBeNull();
  });
});

describe('KazaYenidenHesaplaSayfasi (sihirbazın önizleme adımı)', () => {
  const sayfa = () => require('../Kaza/KazaYenidenHesaplaSayfasi').KazaYenidenHesaplaSayfasi as React.ComponentType;
  const girdi = { dogumTarihi: '2000-01-01', ergenlikYasi: 14, kildigiTahminiYuzdesi: 90 };

  it('önce önizler, "Hesabı uygulayın" yeni tabanı yazar; elle eklenen korunur', async () => {
    mockRoute.params = { girdi };
    const store = storeKur();
    await store.dispatch(borcEkle({ namazAdi: 'Sabah', sayi: 30 }));
    const { findByText, getByText, getByLabelText } = await ciz(sayfa(), store);
    expect(await findByText('Elle eklenen')).toBeTruthy();
    expect(getByText('+30')).toBeTruthy();
    await act(async () => {
      fireEvent.press(getByLabelText('Hesabı uygulayın'));
    });
    await waitFor(() => expect(mockGoBack).toHaveBeenCalled());
    const d = store.getState().kaza.kazaDurumu!;
    expect(d.taban).not.toBeNull();
    expect(d.toplamKalan).toBe(d.taban!.toplam + 30);
  });

  it('göçle gelen taban değişiyorsa önizleme bunu AÇIKÇA söyler', async () => {
    mockRoute.params = { girdi };
    mockStore.set(
      DEPOLAMA_ANAHTARLARI.KAZA_DURUMU,
      JSON.stringify({ namazlar: [{ namazAdi: 'Sabah', kalanBorc: 50, tamamlanan: 7 }] })
    );
    const store = storeKur();
    await store.dispatch(kazaVerileriniYukle());
    const { findByTestId } = await ciz(sayfa(), store);
    const bant = await findByTestId('gocmis-taban-uyarisi');
    expect(bant).toBeTruthy();
  });
});

describe('KazaGecmisiSayfasi + hareket ayrıntısı', () => {
  const sayfa = () => require('../Kaza/KazaGecmisiSayfasi').KazaGecmisiSayfasi as React.ComponentType;

  it('satırlar güne göre gruplu; ayrıntıdan "Defterden çıkarın" kaydı gizler (silmez)', async () => {
    const store = storeKur();
    await store.dispatch(borcEkle({ namazAdi: 'İkindi', sayi: 2, not: 'Yolculuk' }));
    const { getByText, getByLabelText, store: s } = await ciz(sayfa(), store);
    expect(getByText('İkindi · elle eklendi')).toBeTruthy();
    expect(getByText(/^Bugün · /)).toBeTruthy();
    fireEvent.press(getByLabelText(/İkindi · elle eklendi.*Ayrıntı için dokunun/));
    await act(async () => {
      fireEvent.press(getByLabelText('Defterden çıkarın'));
    });
    await waitFor(() => expect(s.getState().kaza.kazaDurumu!.toplamKalan).toBe(0));
    expect(s.getState().kaza.hareketler.some((h) => h.kaynak === 'manuel')).toBe(true);
  });
});

describe('KazaTemizlikSayfasi', () => {
  const sayfa = () => require('../Kaza/KazaTemizlikSayfasi').KazaTemizlikSayfasi as React.ComponentType;

  it('süzgece uyan kayıt sayısını ve kalanın ne olacağını ÖNCEDEN gösterir', async () => {
    const store = storeKur();
    await store.dispatch(borcEkle({ namazAdi: 'Öğle', sayi: 3 }));
    await store.dispatch(borcEkle({ namazAdi: 'Akşam', sayi: 1 }));
    const { getByLabelText, findByText } = await ciz(sayfa(), store);
    expect(await findByText('Süzgece uyan kayıt yok')).toBeTruthy();
    fireEvent.press(getByLabelText('Elle'));
    expect(await findByText('2 kayıt gizlenecek')).toBeTruthy();
    expect(await findByText('Kalan kaza 4 → 0')).toBeTruthy();
  });
});
