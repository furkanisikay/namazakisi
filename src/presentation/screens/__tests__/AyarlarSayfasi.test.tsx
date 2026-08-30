/**
 * AyarlarSayfasi (Plan 1 yeniden kurulumu) render + etkileşim testleri.
 *
 * `useFocusEffect` bu repoda AyarlarSayfasi zincirinde (useAyarOzetleri
 * üzerinden) kullanılıyor — mock reçetesi task-5-brief ile birebir:
 * `useEffect`'e devredilir, böylece async okuma gerçek zamanda `waitFor` ile
 * beklenebilir (sahte zamanlayıcıya gerek yok, AGENTS.md test dersleri).
 */
import React from 'react';
import { Linking } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useRenkler, useTema } from '../../../core/theme';
import { useFeedback } from '../../../core/feedback';
import { Depolama } from '../../../data/local/Depolama';
import { YENI_OZELLIKLER } from '../../../core/constants/YeniOzellikler';
import { AyarlarSayfasi } from '../AyarlarSayfasi';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useFocusEffect: (cb: () => void | (() => void)) => {
    const React = require('react');
    React.useEffect(cb, [cb]);
  },
}));
jest.mock('../../store/hooks');
jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn(), useTema: jest.fn() }));
jest.mock('../../../core/feedback', () => ({ useFeedback: jest.fn() }));
jest.mock('../../../data/local/Depolama', () => ({ Depolama: { oku: jest.fn() } }));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('@expo/vector-icons/MaterialIcons', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{props.name}</Text>;
});

const mockRenkler = {
  arkaplan: '#ffffff',
  kartArkaplan: '#f0f0f0',
  birincil: '#4CAF50',
  birincilMetin: '#FFFFFF',
  metin: '#333333',
  metinIkincil: '#666666',
  sinir: '#cccccc',
  durum: {
    basarili: '#4CAF50',
    uyari: '#FFC107',
    hata: '#F44336',
    bilgi: '#2196F3',
  },
};

const mockTema = {
  tema: { mod: 'acik' as const, renkler: {} as unknown },
  palet: { id: 'zumrut', ad: 'Zümrüt' },
};

const stateOlustur = (ustyaz: Record<string, unknown> = {}) => ({
  konum: {
    konumModu: 'oto',
    seciliIlAdi: 'Istanbul',
    seciliIlceAdi: '',
    gpsAdres: { ilce: 'Kadıköy', il: 'İstanbul' },
    sonGpsGuncellemesi: new Date(Date.now() - 1000).toISOString(),
    akilliTakipAktif: true,
    yukleniyor: false,
  },
  muhafiz: { aktif: true, yogunluk: 'normal' },
  vakitBildirim: {
    ayarlar: { imsak: true, ogle: false, ikindi: false, aksam: true, yatsi: false },
  },
  cumaHatirlatma: { ayarlar: { aktif: false, oncedenDk: 60 } },
  seri: { ayarlar: { tamGunEsigi: 4, gunSonuBildirimAktif: true } },
  iftarSayac: { ayarlar: { aktif: false } },
  sahurSayac: { ayarlar: { aktif: false } },
  takvim: { ayarlar: { aktif: true } },
  guncelleme: { guncellemeMevcut: false },
  ozellikler: { gorulenIdler: [], kapatilanKartIdler: [], yuklendi: true },
  ...ustyaz,
});

function selectorlaKur(ustyaz: Record<string, unknown> = {}) {
  (useAppSelector as unknown as jest.Mock).mockImplementation(
    (selector: (state: ReturnType<typeof stateOlustur>) => unknown) => selector(stateOlustur(ustyaz))
  );
}

describe('AyarlarSayfasi', () => {
  const dispatchMock = jest.fn();
  const navigateMock = jest.fn();
  const titresimDurumunuDegistirMock = jest.fn();
  const sesDurumunuDegistirMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRenkler as jest.Mock).mockReturnValue(mockRenkler);
    (useTema as jest.Mock).mockReturnValue(mockTema);
    (useNavigation as jest.Mock).mockReturnValue({ navigate: navigateMock });
    (useAppDispatch as unknown as jest.Mock).mockReturnValue(dispatchMock);
    (useFeedback as jest.Mock).mockReturnValue({
      ayarlar: { titresimAktif: true, sesAktif: false },
      titresimDurumunuDegistir: titresimDurumunuDegistirMock,
      sesDurumunuDegistir: sesDurumunuDegistirMock,
      butonTiklandiFeedback: jest.fn().mockResolvedValue(undefined),
    });
    (Depolama.oku as jest.Mock).mockResolvedValue(null);
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    selectorlaKur();
  });

  it('dört grup başlığı render edilir', async () => {
    const { getByText } = render(<AyarlarSayfasi />);

    expect(getByText('Namaz vakitleri')).toBeTruthy();
    expect(getByText('Hatırlatmalar')).toBeTruthy();
    expect(getByText('Uygulama')).toBeTruthy();
    expect(getByText('Veri ve destek')).toBeTruthy();

    await act(async () => {
      await Promise.resolve();
    });
  });

  it('muhafiz satırı dinamik özeti gösterir ("Açık · normal yoğunluk")', async () => {
    const { getByText } = render(<AyarlarSayfasi />);

    expect(getByText('Açık · normal yoğunluk')).toBeTruthy();

    await act(async () => {
      await Promise.resolve();
    });
  });

  it('Konum satırına dokununca "KonumAyarlari" ile navigate çağrılır', async () => {
    const { getByText } = render(<AyarlarSayfasi />);

    fireEvent.press(getByText('Konum'));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('KonumAyarlari');
    });
  });

  it('Görünüm satırına dokununca Türkçe "ü" ile "GorünumAyarlari" ile navigate çağrılır', async () => {
    const { getByText } = render(<AyarlarSayfasi />);

    fireEvent.press(getByText('Görünüm'));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('GorünumAyarlari');
    });
  });

  it('NÖBETÇİ: yeni özellik tanıtım kartı hâlâ render edilir', async () => {
    // Sabit dize DEĞİL — katalogdan türetilir: AGENTS.md'nin duyuru reçetesi diziye
    // EN ÜSTE kayıt eklemeyi söylüyor, sabit başlık bir sonraki özellik duyurusunda
    // bu testi sebepsiz kırardı. Kart, `useYeniOzellikler` ile aynı kuraldan seçilir:
    // okunmamışlar arasında kartGoster'i olan İLK kayıt (her kayıt kart göstermez).
    const kartOzelligi = YENI_OZELLIKLER.find(o => o.kartGoster);
    expect(kartOzelligi).toBeDefined();

    const { getByText } = render(<AyarlarSayfasi />);

    expect(getByText('Uygulamaya eklendi')).toBeTruthy();
    expect(getByText(kartOzelligi!.baslik)).toBeTruthy();

    await act(async () => {
      await Promise.resolve();
    });
  });

  it('NÖBETÇİ: satır rozeti (YeniRozet) okunmamış özellik için hâlâ render edilir', async () => {
    const { getAllByText } = render(<AyarlarSayfasi />);

    // BildirimAyarlari satırı (hedefSayfa eşleşmesi) rozet taşır.
    expect(getAllByText('Yeni').length).toBeGreaterThan(0);

    await act(async () => {
      await Promise.resolve();
    });
  });

  it('bir satıra dokununca ilgili özellik görüldü işaretlenir (dispatch çağrılır)', async () => {
    const { getByText } = render(<AyarlarSayfasi />);

    fireEvent.press(getByText('Bildirimler'));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('BildirimAyarlari');
    });
    expect(dispatchMock).toHaveBeenCalled();
  });

  it('NÖBETÇİ: "Neler yeni" satırına dokununca navigate edilir ama görüldü-işaretleme dispatch EDİLMEZ', async () => {
    const { getByText } = render(<AyarlarSayfasi />);

    dispatchMock.mockClear();
    fireEvent.press(getByText('Neler yeni'));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('NelerYeni');
    });
    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it('sağlık kartı: sorun varken kartın başlığı görünür (muhafiz kapalı + tüm vakit bildirimleri kapalı)', async () => {
    selectorlaKur({
      muhafiz: { aktif: false, yogunluk: 'normal' },
      vakitBildirim: {
        ayarlar: { imsak: false, ogle: false, ikindi: false, aksam: false, yatsi: false },
      },
      cumaHatirlatma: { ayarlar: { aktif: false, oncedenDk: 60 } },
    });
    const { getByText } = render(<AyarlarSayfasi />);

    expect(getByText('Vakit hatırlatmaları kapalı')).toBeTruthy();

    await act(async () => {
      await Promise.resolve();
    });
  });

  it('sağlık kartı: sorun yokken tek satırlık özet gösterilir', async () => {
    const { getByText } = render(<AyarlarSayfasi />);

    await waitFor(() => {
      expect(getByText(/Kurulumunuz eksiksiz/)).toBeTruthy();
    });
  });

  it('sağlık kartı: sistem ayarları eylemi Linking.openSettings çağırır', async () => {
    const openSettingsSpy = jest.spyOn(Linking, 'openSettings').mockImplementation(() => Promise.resolve());
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const { getByText } = render(<AyarlarSayfasi />);

    await waitFor(() => {
      expect(getByText('İzni açın')).toBeTruthy();
    });
    fireEvent.press(getByText('İzni açın'));

    expect(openSettingsSpy).toHaveBeenCalled();
    openSettingsSpy.mockRestore();
  });

  it('Titreşim satırındaki toggle useFeedback.titresimDurumunuDegistir çağırır', async () => {
    const { getByRole } = render(<AyarlarSayfasi />);

    const anahtarlar = getByRole('switch', { name: /Titreşim/ });
    fireEvent(anahtarlar, 'valueChange', false);

    await waitFor(() => {
      expect(titresimDurumunuDegistirMock).toHaveBeenCalledWith(false);
    });
  });

  it('Ses efektleri satırındaki toggle useFeedback.sesDurumunuDegistir çağırır', async () => {
    const { getByRole } = render(<AyarlarSayfasi />);

    const anahtarlar = getByRole('switch', { name: /Ses efektleri/ });
    fireEvent(anahtarlar, 'valueChange', true);

    await waitFor(() => {
      expect(sesDurumunuDegistirMock).toHaveBeenCalledWith(true);
    });
  });

  describe('arama', () => {
    it('sorgu yazılınca gruplar ve sağlık kartı gizlenir, sonuçlar görünür; temizlenince geri gelir', async () => {
      const { getByLabelText, getByText, queryByRole, queryByText } = render(<AyarlarSayfasi />);

      await waitFor(() => {
        expect(queryByRole('header', { name: 'Namaz vakitleri' })).toBeTruthy();
      });

      fireEvent.changeText(getByLabelText('Ayarlarda arayın'), 'muhafız');

      // Grup başlıkları (accessibilityRole="header") kaybolur — bağlam
      // metni ("Hatırlatmalar") sonuç kartında geçebilir, o AYRI bir Text'tir.
      expect(queryByRole('header', { name: 'Namaz vakitleri' })).toBeNull();
      expect(queryByRole('header', { name: 'Hatırlatmalar' })).toBeNull();
      expect(queryByText(/Kurulumunuz eksiksiz/)).toBeNull();
      expect(getByText('Namaz muhafızı')).toBeTruthy();

      fireEvent.press(getByLabelText('Aramayı temizle'));

      await waitFor(() => {
        expect(queryByRole('header', { name: 'Namaz vakitleri' })).toBeTruthy();
      });
    });

    it('eşleşme yoksa kibar boş durum metni görünür', async () => {
      const { getByLabelText, getByText } = render(<AyarlarSayfasi />);

      fireEvent.changeText(getByLabelText('Ayarlarda arayın'), 'zzzzz-eslesmeyen-sorgu');

      await waitFor(() => {
        expect(getByText('Eşleşen ayar bulunamadı')).toBeTruthy();
      });
    });

    it('bir sonuca dokununca ilgili sayfaya çapasıyla navigate edilir', async () => {
      const { getByLabelText, getByText } = render(<AyarlarSayfasi />);

      fireEvent.changeText(getByLabelText('Ayarlarda arayın'), 'cuma');

      await waitFor(() => {
        expect(getByText('Cuma hatırlatması')).toBeTruthy();
      });
      fireEvent.press(getByText('Cuma hatırlatması'));

      await waitFor(() => {
        expect(navigateMock).toHaveBeenCalledWith('BildirimAyarlari', { vurgula: 'cumaHatirlatmasi' });
      });
    });
  });
});
