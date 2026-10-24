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
const mockCanliTaniHam = jest.fn();
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
  canliDurumu: () => mockCanliDurumu(),
  canliAyarlariniAc: () => mockCanliAyarlariniAc(),
  canliTaniHam: () => mockCanliTaniHam(),
}));
const mockCihaz: { surum: unknown; samsung: boolean | null; esliSaat: string | null } = { surum: null, samsung: null, esliSaat: null };
jest.mock('../../hooks/useCihazDurumu', () => ({
  useCihazDurumu: () => ({ durum: mockCihaz, yenile: jest.fn() }),
}));
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: mockNavigate }) }));
const mockYedekYenidenDene = jest.fn(async () => undefined);
jest.mock('../../../domain/services/CanliSayacPlanlayici', () => ({
  CanliSayacPlanlayici: { getInstance: () => ({ yedekYenidenDene: () => mockYedekYenidenDene() }) },
}));
const mockNowBarDegistiUygula = jest.fn();
jest.mock('../../../domain/services/NowBarDegisikligiServisi', () => ({
  nowBarDegistiUygula: () => mockNowBarDegistiUygula(),
}));

import { NowBarAyarlariSayfasi } from '../NowBarAyarlariSayfasi';
import { ingilizceyeGec, turkceKalanlar } from '../../../__tests__/yardimci/ingilizceDenetimi';

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
const kur = async (ayarlar: NowBarAyarlari = VARSAYILAN_NOW_BAR_AYARLARI, ek: Record<string, unknown> = {}) => {
  (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
  (useAppSelector as jest.Mock).mockImplementation((sec: (s: unknown) => unknown) =>
    sec({ nowBar: { ayarlar, yuklendi: true }, ...ek })
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
    mockCanliTaniHam.mockResolvedValue(null);
    mockNowBarDegistiUygula.mockResolvedValue(undefined);
    mockCihaz.surum = { platform: 'android', ana: 36, alt: 0, tam: '16' };
    mockCihaz.samsung = null;
    mockCihaz.esliSaat = null;
  });

  it('Android: politika cümlesi ana kartta YOK (tanı ayrıntısında); başlık gövdede tekrarlanmaz', async () => {
    const ekran = await kur();
    expect(ekran.queryByTestId('now-bar-politika')).toBeNull();
    expect(ekran.queryByText('Now Bar ve Canlı Sayaçlar')).toBeNull();
    expect(ekran.getByText('Canlı güncellemeler açık')).toBeTruthy();
    expect(ekran.queryByLabelText('Sistem ayarlarını açın')).toBeNull();
  });

  it('vakit sayacı KAPALIYKEN: üstte TEK satır + "Açın"; "Sayaçla" devre dışı, etkin seçim "Vakit girince"', async () => {
    const ekran = await kur(VARSAYILAN_NOW_BAR_AYARLARI, { vakitSayac: { ayarlar: { aktif: false } } });
    expect(ekran.getAllByTestId('now-bar-sayac-kapali')).toHaveLength(1);
    expect(ekran.queryByText(/Vakit sayacı kapalı olduğu için/)).toBeNull();
    const sayacla = ekran.getByLabelText('Öğle: Sayaçla');
    expect(sayacla.props.accessibilityState).toMatchObject({ selected: false, disabled: true });
    expect(ekran.getByLabelText('Öğle: Vakit girince').props.accessibilityState).toMatchObject({ selected: true });
    fireEvent.press(ekran.getByLabelText('Vakit sayacını açın'));
    expect(mockNavigate).toHaveBeenCalledWith('BildirimAyarlari');
  });

  it('vakit sayacı açıkken tek satır YOK ve "Sayaçla" seçili kalır', async () => {
    const ekran = await kur(VARSAYILAN_NOW_BAR_AYARLARI, { vakitSayac: { ayarlar: { aktif: true } } });
    expect(ekran.queryByTestId('now-bar-sayac-kapali')).toBeNull();
    expect(ekran.getByLabelText('Öğle: Sayaçla').props.accessibilityState).toMatchObject({ selected: true });
  });

  it('tanı okunamazsa (eski ikili) tanı kartı HİÇ çizilmez', async () => {
    const ekran = await kur();
    expect(ekran.queryByTestId('now-bar-tani')).toBeNull();
  });

  it('SAHA: şartlar tamam ama sistem öne çıkarmadı (Samsung) → teşhis + geliştirici seçeneği yönlendirmesi + ayrıntılar', async () => {
    mockCanliTaniHam.mockResolvedValue(
      JSON.stringify({
        sdkInt: 36,
        sdkTam: 3600000,
        samsung: true,
        oneUi: '8.0',
        izinVar: true,
        planOlaySayisi: 2,
        sonrakiAlarmMs: null,
        sonPlanMs: null,
        gosterilenler: ['sayac_2026-10-19_ikindi'],
        sonGosterim: {
          zamanMs: 0,
          id: 'sayac_2026-10-19_ikindi',
          tema: 'vakit',
          kanalId: 'canli_sayac',
          kanalOnemi: 3,
          oneCikarilabilir: true,
          izinVar: true,
          oneCikarildi: false,
          hata: null,
        },
        aktifBildirimler: [],
      })
    );
    const ekran = await kur();
    await waitFor(() => expect(ekran.getByTestId('now-bar-tani')).toBeTruthy());
    expect(ekran.getByTestId('now-bar-tani-teshis').props.children).toContain("Now Bar'a almadı");
    expect(ekran.getByTestId('now-bar-tani-samsung').props.children).toContain('Live notifications for all apps');
    expect(ekran.queryByTestId('now-bar-tani-ayrinti')).toBeNull();
    expect(ekran.getByTestId('now-bar-tani-teshis').props.children).toContain('bir kez daha denenir');
    fireEvent.press(ekran.getByLabelText('Tanı ayrıntılarını gösterin'));
    await waitFor(() => expect(ekran.getByTestId('now-bar-tani-ayrinti')).toBeTruthy());
    expect(ekran.getByText(/sistem öne çıkardı: hayır/)).toBeTruthy();
    // Politika cümlesi ayrıntıya taşındı (görsel inceleme).
    expect(ekran.getByTestId('now-bar-politika').props.children).toBe(
      'Google sürekli açık kartları önermez; telefonunuz öne çıkarmayı geri çekebilir.'
    );
    // Tanıyı yenilemek muhafız yedeğine bir deneme hakkı daha verir (sahip kararı).
    expect(mockYedekYenidenDene).toHaveBeenCalled();
  });

  it('sistemde kapalıyken "Sistem ayarlarını açın" eylemi çıkar ve ayarı açar', async () => {
    mockCanliDurumu.mockResolvedValue('kapali');
    const ekran = await kur();
    expect(ekran.getByText('Canlı güncellemeler kapalı')).toBeTruthy();
    fireEvent.press(ekran.getByLabelText('Sistem ayarlarını açın'));
    await waitFor(() => expect(mockCanliAyarlariniAc).toHaveBeenCalled());
  });

  it('Android 16 öncesinde GERÇEK sürümle söylenir; Wear cümlesi yalnız bağlı saat varken', async () => {
    mockCanliDurumu.mockResolvedValue('desteklenmiyor');
    mockCihaz.surum = { platform: 'android', ana: 34, alt: 0, tam: '14' };
    const ekran = await kur();
    expect(ekran.getByText('Bu telefonda canlı sayaç yok')).toBeTruthy();
    expect(ekran.getByText(/bu telefon Android 14/)).toBeTruthy();
    expect(ekran.queryByText(/Wear OS/)).toBeNull();
    expect(ekran.queryByLabelText('Sistem ayarlarını açın')).toBeNull();
  });

  it('Android 16+ cihazda "desteklenmiyor" (geçici hata) → sürüm cümlesi YOK (sus)', async () => {
    mockCanliDurumu.mockResolvedValue('desteklenmiyor');
    const ekran = await kur();
    expect(ekran.queryByText(/Android 16 ile gelir/)).toBeNull();
    expect(ekran.queryByText('Bu telefonda canlı sayaç yok')).toBeNull();
  });

  it('"Now Bar" adı yalnız Samsung cihazda geçer', async () => {
    const ekran = await kur();
    expect(ekran.queryByText(/Now Bar'da görünür/)).toBeNull();
    expect(ekran.getByText(/zamanı gelince durum çubuğunda görünür/)).toBeTruthy();
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
    // Uzun pencere kesilmez, geç başlar (`iosGorunurBaslangic`) — ekran bunu söyler.
    expect(ekran.getByTestId('now-bar-politika').props.children).toContain('bitişten 8 saat önce başlar');
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

describe('NowBarAyarlariSayfasi — İngilizce', () => {
  const siri = require('../../../../modules/expo-siri-kisayollari/src') as { canliEtkinlikIzniAcik: jest.Mock };
  const YASAKLI = ['Sayac', 'Vakit', 'vakit', 'dk\\b', 'Seri\\b', 'Sabah', 'Kapat', 'Sistem', 'Canli'];
  // Tanı ayrıntısındaki ham kimlikler (tema `vakit`, kanal kimliği) destek içindir; dil dışı.
  const kalan = (ekran: ReturnType<typeof render>) =>
    turkceKalanlar(ekran.toJSON() as never, YASAKLI).filter((m: string) => !m.startsWith('Last shown:'));
  let geriAl: () => void;
  beforeEach(() => {
    jest.clearAllMocks();
    geriAl = ingilizceyeGec();
    mockCanliAyarlariniAc.mockResolvedValue('canli');
    mockCanliTaniHam.mockResolvedValue(null);
    mockNowBarDegistiUygula.mockResolvedValue(undefined);
    mockCihaz.surum = { platform: 'android', ana: 36, alt: 0, tam: '16' };
    mockCihaz.samsung = null;
    mockCihaz.esliSaat = null;
  });
  afterEach(() => {
    act(() => geriAl());
    siri.canliEtkinlikIzniAcik.mockResolvedValue(null);
  });

  it('Android: açık, kapalı, desteklenmiyor (Android 14, saat bağlı) ve vakit sayacı kapalı', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    mockCanliDurumu.mockResolvedValue('acik');
    const acik = await kur(VARSAYILAN_NOW_BAR_AYARLARI, { vakitSayac: { ayarlar: { aktif: false } } });
    expect(kalan(acik)).toEqual([]);
    expect(acik.getByText('Live updates on')).toBeTruthy();
    acik.unmount();
    mockCanliDurumu.mockResolvedValue('kapali');
    const kapali = await kur();
    expect(kalan(kapali)).toEqual([]);
    kapali.unmount();
    mockCanliDurumu.mockResolvedValue('desteklenmiyor');
    mockCihaz.surum = { platform: 'android', ana: 34, alt: 0, tam: '14' };
    mockCihaz.esliSaat = 'Pixel Watch';
    expect(kalan(await kur())).toEqual([]);
  });

  it('Android Samsung: tanı teşhisi ve açılan ayrıntılar', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    mockCanliDurumu.mockResolvedValue('acik');
    mockCihaz.samsung = true;
    mockCanliTaniHam.mockResolvedValue(
      JSON.stringify({
        sdkInt: 36,
        sdkTam: 3600000,
        samsung: true,
        oneUi: '8.0',
        izinVar: true,
        planOlaySayisi: 2,
        sonrakiAlarmMs: null,
        sonPlanMs: null,
        gosterilenler: ['sayac_2026-10-19_ikindi'],
        sonGosterim: {
          zamanMs: 0,
          id: 'sayac_2026-10-19_ikindi',
          tema: 'vakit',
          kanalId: 'canli_sayac',
          kanalOnemi: 3,
          oneCikarilabilir: true,
          izinVar: true,
          oneCikarildi: false,
          hata: null,
        },
        aktifBildirimler: [],
      })
    );
    const ekran = await kur();
    await waitFor(() => expect(ekran.getByTestId('now-bar-tani')).toBeTruthy());
    fireEvent.press(ekran.getByTestId('now-bar-tani').findAll((d) => d.props.accessibilityRole === 'button')[0]);
    await waitFor(() => expect(ekran.getByTestId('now-bar-tani-ayrinti')).toBeTruthy());
    expect(kalan(ekran)).toEqual([]);
  });

  it('iPhone: canlı etkinlik açık ve kapalı', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    siri.canliEtkinlikIzniAcik.mockResolvedValue(true);
    const acik = await kur();
    expect(kalan(acik)).toEqual([]);
    acik.unmount();
    siri.canliEtkinlikIzniAcik.mockResolvedValue(false);
    expect(kalan(await kur())).toEqual([]);
  });
});
