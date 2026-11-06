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
import { ingilizceyeGec, turkceKalanlar } from '../../../__tests__/yardimci/ingilizceDenetimi';

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
  it('render olur; "Diğer" > Günlük hedef → geçersiz değer girilince tema-uyumlu hata modalı açılır', async () => {
    const { getByText, getByLabelText, getByPlaceholderText, store } = await ciz(anaSayfa());
    expect(getByText('Kaza Defteri')).toBeTruthy();
    fireEvent.press(getByLabelText('Diğer: hedef, geçmiş, ayarlar'));
    fireEvent.press(getByLabelText(/^Günlük hedef./));
    // Menü kapanır, hedef modalı kapanış bittikten sonra açılır (iOS iki modalı üst üste sunamaz).
    fireEvent.changeText(await waitFor(() => getByPlaceholderText('Örn: 3')), 'abc');
    fireEvent.press(getByText('Kaydet'));
    await waitFor(() => expect(getByText('Geçerli bir sayı giriniz (0 = hedefsiz).')).toBeTruthy());
    expect(store.getState().kaza.kazaDurumu!.gunlukHedef).not.toBe(Number.NaN);
  });

  it('sade kök: hedef, tempo, sihirbaz, ayar ve bağlantı satırları kökte DEĞİL, "Diğer"de', async () => {
    const store = storeKur();
    await store.dispatch(borcEkle({ namazAdi: 'Sabah', sayi: 10 }));
    const { queryByText, queryByLabelText, getByLabelText, getByTestId } = await ciz(anaSayfa(), store);
    expect(queryByText('Hesaplama sihirbazı ile başlayın')).toBeNull();
    expect(queryByLabelText('Her farzdan sonra kaza önerin')).toBeNull();
    expect(queryByText(/Henüz günlük hedef belirlenmedi/)).toBeNull();
    expect(queryByText('Toplu Tamamla')).toBeNull();
    fireEvent.press(getByLabelText('Diğer: hedef, geçmiş, ayarlar'));
    expect(getByTestId('kaza-tempo')).toBeTruthy();
  });

  it('REGRESYON: sihirbazın son adımı ÇÖKMEZ, önizleme ekranına girdiyle gider', async () => {
    const { getByText, getByPlaceholderText, getByLabelText } = await ciz(anaSayfa());
    fireEvent.press(getByLabelText('Diğer: hedef, geçmiş, ayarlar'));
    fireEvent.press(getByLabelText(/^Kazamı hesaplayın\./));
    fireEvent.changeText(await waitFor(() => getByPlaceholderText('Örn: 1995')), '1990');
    fireEvent.press(getByLabelText('İleri'));
    fireEvent.press(getByLabelText('İleri'));
    fireEvent.press(getByText('Önizleyin'));
    expect(mockNavigate).toHaveBeenCalledWith('KazaYenidenHesapla', {
      girdi: { dogumTarihi: '1990-01-01', ergenlikYasi: 14, kildigiTahminiYuzdesi: 0 },
    });
  });

  it('vakit satırında kalan sayısı soldaki alanda esner ("+" düğmesinin altına binmez)', async () => {
    const store = storeKur();
    await store.dispatch(borcEkle({ namazAdi: 'Sabah', sayi: 116 }));
    const { getByTestId } = await ciz(anaSayfa(), store);
    const kalan = getByTestId('kaza-kalan-Sabah');
    expect(kalan.props.numberOfLines).toBe(2);
    expect(kalan.parent?.parent?.props.style).toMatchObject({ flex: 1 });
  });

  it('vakit satırında tek eylem adı "Kıldım"; uzun basış sayı sorar, onay da "Kıldım"', async () => {
    const store = storeKur();
    await store.dispatch(borcEkle({ namazAdi: 'Sabah', sayi: 3 }));
    const { getByLabelText, getAllByText, findByText } = await ciz(anaSayfa(), store);
    fireEvent(getByLabelText('Sabah kazasını kıldım olarak işaretleyin'), 'longPress');
    expect(await findByText('Kıldım — Sabah')).toBeTruthy();
    expect(getAllByText('Kıldım').length).toBeGreaterThan(0);
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

  it('"Diğer" menüsündeki satırlar alt ekranlara gider', async () => {
    const { getByLabelText } = await ciz(anaSayfa());
    fireEvent.press(getByLabelText('Diğer: hedef, geçmiş, ayarlar'));
    fireEvent.press(getByLabelText('Kaza ayarları. Otomatik ekleme kapalı'));
    // Sayfa geçişi menü KAPANDIKTAN sonra (modal kapanış beklemesi) — anında değil.
    expect(mockNavigate).not.toHaveBeenCalled();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
    fireEvent.press(getByLabelText('Diğer: hedef, geçmiş, ayarlar'));
    fireEvent.press(getByLabelText('Hareket geçmişi'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(2));
    fireEvent.press(getByLabelText('Diğer: hedef, geçmiş, ayarlar'));
    fireEvent.press(getByLabelText('Kayıtları temizleyin'));
    await waitFor(() =>
      expect(mockNavigate.mock.calls.map((c) => c[0])).toEqual(['KazaOtomatikAyar', 'KazaGecmisi', 'KazaTemizlik'])
    );
  });
});

describe('Kaza ayarları — "Her farzla bir kaza" anahtarı (issue #294; Dalga 4: kökten buraya taşındı)', () => {
  const ayarSayfasi = () => require('../Kaza/KazaOtomatikAyarSayfasi').KazaOtomatikAyarSayfasi as React.ComponentType;

  it('kapatınca ayarı diske yazar (yol değişmedi: KAZA_ONERI_AYARLARI)', async () => {
    const { findByLabelText } = await ciz(ayarSayfasi());
    const anahtar = await findByLabelText('Her farzdan sonra kaza önerin');
    await act(async () => {
      fireEvent(anahtar, 'valueChange', false);
    });
    await waitFor(() =>
      expect(JSON.parse(mockStore.get(DEPOLAMA_ANAHTARLARI.KAZA_ONERI_AYARLARI)!)).toEqual({ farzSonrasiOner: false })
    );
  });

  it('kaza kökünde artık görünmez', async () => {
    const store = storeKur();
    await store.dispatch(borcEkle({ namazAdi: 'Sabah', sayi: 1 }));
    const { queryByLabelText } = await ciz(anaSayfa(), store);
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

describe('Kaza Defteri ekranları — İngilizce', () => {
  /** Türkçe harfsiz ama Türkçe sözcükler (bu ekranlarda geçebilecek). */
  const YASAKLI = [
    'Kaza', 'kaza', 'Sabah', 'Vitir', 'vitir', 'Elle', 'elle', 'Otomatik', 'otomatik', 'Hesaplama', 'Temizlik',
    'Tempo', 'Tamam', 'Geri', 'Kaydet', 'Kalan', 'Neden', 'Kimlik', 'Cihaz', 'Mezhep', 'Vakit', 'vakit', 'Ekim',
    'Kaynak', 'Ekleyin', 'Taban', 'namaz', 'Namaz', 'Borç', 'kayıt', 'Yok sayın', 'Hepsini', 'Tarih', 'Son \\d', 'Hanefi',
  ];
  let geriAl: () => void;
  beforeEach(() => {
    geriAl = ingilizceyeGec();
  });
  // Dil geri dönerken takılı ekranlar yeniden çizilir → act içinde.
  afterEach(() => act(() => geriAl()));

  const cizEn = async (Bilesen: React.ComponentType, store = storeKur()) => {
    const r = render(
      <Provider store={store}>
        <Bilesen />
      </Provider>
    );
    await waitFor(() => expect(r.queryByText('Loading...')).toBeNull());
    return { ...r, store };
  };
  const kalan = (r: { toJSON: () => unknown }) => turkceKalanlar(r.toJSON() as never, YASAKLI);

  it('kök sayfa: kalan kartı, kaynak özeti, fazla, bekleyen günler, bozuk ay bandı ve modallar', async () => {
    mockStore.set(`${DEPOLAMA_ANAHTARLARI.KAZA_HAREKET_ONEK}2026-03`, '{bozuk');
    await hareketleriEkle([
      { id: 'oto1', zaman: new Date().toISOString(), cihaz: 'a', kaynak: 'otoAyar', aktif: true, gun: gunEkle(bugun(), -3), kayitsiz: 'sor' },
    ]);
    const store = storeKur();
    await store.dispatch(borcEkle({ namazAdi: 'Öğle', sayi: 2 }));
    await store.dispatch(kazaTamamla({ namazAdi: 'Öğle', sayi: 5 }));
    const r = await cizEn(anaSayfa(), store);
    expect(r.getByText('Qada log')).toBeTruthy();
    expect(r.getByText('Dhuhr')).toBeTruthy();
    expect(r.getByLabelText('Mark a Dhuhr qada as prayed')).toBeTruthy();
    expect(r.getByText(/3 extra prayed/)).toBeTruthy();
    expect(kalan(r)).toEqual([]);

    // "Diğer" menüsü (tempo + satırlar)
    fireEvent.press(r.getByLabelText('More: goal, history, settings'));
    expect(kalan(r)).toEqual([]);
    // Günlük hedef → geçersiz giriş modalı
    fireEvent.press(r.getByLabelText(/^Daily goal\./));
    fireEvent.changeText(await waitFor(() => r.getByPlaceholderText('E.g. 3')), 'abc');
    fireEvent.press(r.getByText('Save'));
    await waitFor(() => expect(r.getByText('Enter a valid number (0 = no goal).')).toBeTruthy());
    expect(kalan(r)).toEqual([]);
  });

  it('kök sayfa: kontrol bekleyen günler sayfası ve sihirbaz adımları', async () => {
    await hareketleriEkle([
      { id: 'oto1', zaman: new Date().toISOString(), cihaz: 'a', kaynak: 'otoAyar', aktif: true, gun: gunEkle(bugun(), -3), kayitsiz: 'sor' },
    ]);
    const r = await cizEn(anaSayfa());
    fireEvent.press(r.getByLabelText('Review the days waiting for a decision'));
    expect(r.getByText('Add all')).toBeTruthy();
    expect(kalan(r)).toEqual([]);

    const r2 = await cizEn(anaSayfa());
    fireEvent.press(r2.getByLabelText('More: goal, history, settings'));
    fireEvent.press(r2.getByLabelText(/^Calculate my qada\./));
    fireEvent.changeText(await waitFor(() => r2.getByPlaceholderText('E.g. 1995')), '1990');
    expect(kalan(r2)).toEqual([]);
    fireEvent.press(r2.getByLabelText('Next'));
    expect(r2.getByText('At what age did you reach puberty?')).toBeTruthy();
    expect(kalan(r2)).toEqual([]);
    fireEvent.press(r2.getByLabelText('Next'));
    expect(r2.getByText('Preview')).toBeTruthy();
    expect(kalan(r2)).toEqual([]);
  });

  it('geçmiş + hareket ayrıntısı', async () => {
    const sayfa = require('../Kaza/KazaGecmisiSayfasi').KazaGecmisiSayfasi as React.ComponentType;
    const store = storeKur();
    await store.dispatch(borcEkle({ namazAdi: 'İkindi', sayi: 2 }));
    const r = await cizEn(sayfa, store);
    expect(r.getByText('Asr · added manually')).toBeTruthy();
    expect(r.getByText(/^Today · /)).toBeTruthy();
    expect(kalan(r)).toEqual([]);
    fireEvent.press(r.getByLabelText(/Asr · added manually.*Tap for details\./));
    expect(r.getByLabelText('Remove from the log')).toBeTruthy();
    expect(kalan(r)).toEqual([]);
  });

  it('kaza ayarları', async () => {
    const sayfa = require('../Kaza/KazaOtomatikAyarSayfasi').KazaOtomatikAyarSayfasi as React.ComponentType;
    const r = await cizEn(sayfa);
    await r.findByLabelText('Suggest a qada after each obligatory prayer');
    await waitFor(() => expect(r.queryByText('Reading your school of thought…')).toBeNull());
    expect(r.getByText('Last 7 days')).toBeTruthy();
    expect(kalan(r)).toEqual([]);
  });

  it('temizlik', async () => {
    const sayfa = require('../Kaza/KazaTemizlikSayfasi').KazaTemizlikSayfasi as React.ComponentType;
    const store = storeKur();
    await store.dispatch(borcEkle({ namazAdi: 'Öğle', sayi: 3 }));
    await store.dispatch(borcEkle({ namazAdi: 'Akşam', sayi: 1 }));
    const r = await cizEn(sayfa, store);
    expect(await r.findByText('No records match the filter')).toBeTruthy();
    fireEvent.press(r.getByLabelText('Manual'));
    expect(await r.findByText('2 records will be hidden')).toBeTruthy();
    expect(await r.findByText('Qada left 4 → 0')).toBeTruthy();
    expect(kalan(r)).toEqual([]);
  });

  it('yeniden hesapla', async () => {
    const sayfa = require('../Kaza/KazaYenidenHesaplaSayfasi').KazaYenidenHesaplaSayfasi as React.ComponentType;
    mockRoute.params = { girdi: { dogumTarihi: '2000-01-01', ergenlikYasi: 14, kildigiTahminiYuzdesi: 90 } };
    const store = storeKur();
    await store.dispatch(borcEkle({ namazAdi: 'Sabah', sayi: 30 }));
    const r = await cizEn(sayfa, store);
    expect(await r.findByText('Added manually')).toBeTruthy();
    expect(r.getByLabelText('Apply calculation')).toBeTruthy();
    expect(kalan(r)).toEqual([]);
  });
});
