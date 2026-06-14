/**
 * İçe Aktarma Sihirbazı testleri — kritik akış doğrulaması.
 *
 * Doğrulanan senaryolar:
 *  (1) Geçerli dosya seçilince karşılaştırma ekranı görünür.
 *  (2) "Akıllı birleştir" + "Devam Edin" → iceAktarmayiUygula dört alanı 'akilli'
 *      seçimleriyle dispatch eder.
 *  (3) Bozuk dosya (zarfiCoz → null) → kibar hata ekranı.
 *
 * Mimari: store hook'ları, servisler ve dosya seçimi mock'lanır (Yedekleme test
 * deseni); gerçek Redux store kurulmaz.
 */
import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { IceAktarmaSihirbaziSayfasi } from '../IceAktarmaSihirbaziSayfasi';

import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { useRenkler } from '../../../../../core/theme';
import { useFeedback } from '../../../../../core/feedback';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { iceAktarmayiUygula } from '../../../../store/yedeklemeSlice';
import { zarfiCoz, mevcutVeriyiTopla } from '../../../../../domain/services/YedeklemeServisi';
import { farkCikar } from '../../../../../domain/services/YedekBirlestirmeServisi';
import type { YedekPayload, FarkOzeti } from '../../../../../core/types';

// ─── Mocklar ──────────────────────────────────────────────────────────────────

jest.mock('@react-navigation/native');
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));

// expo-file-system/legacy → readAsStringAsync içerik döndürür.
const mockDosyaIcerik = jest.fn();
jest.mock('expo-file-system/legacy', () => ({
  readAsStringAsync: (...args: unknown[]) => mockDosyaIcerik(...args),
  EncodingType: { UTF8: 'utf8' },
}));

jest.mock('../../../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('../../../../../core/feedback', () => ({ useFeedback: jest.fn() }));
jest.mock('../../../../store/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));
jest.mock('../../../../store/yedeklemeSlice', () => ({
  iceAktarmayiUygula: jest.fn((arg) => ({ type: 'yedekleme/iceAktar', payload: arg })),
  durumuSifirla: jest.fn(() => ({ type: 'yedekleme/durumuSifirla' })),
}));
jest.mock('../../../../../domain/services/YedeklemeServisi', () => ({
  zarfiCoz: jest.fn(),
  mevcutVeriyiTopla: jest.fn(),
}));
jest.mock('../../../../../domain/services/YedekBirlestirmeServisi', () => ({
  farkCikar: jest.fn(),
}));
// Donanım geri tuşu hook'u: testte no-op.
jest.mock('../../../../hooks/useDonanimGeriTusu', () => ({
  useDonanimGeriTusu: jest.fn(),
}));
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { FontAwesome5: (props: { name: string }) => <Text>{props.name}</Text> };
});

// ─── Sahte veri ────────────────────────────────────────────────────────────────

const sahtePayload: YedekPayload = {
  namazGunleri: { '2026-06-10': { sabah: true }, '2026-06-11': { ogle: true } },
  kilinanVakitler: {},
  seri: null,
  rozetler: [],
  seviye: null,
  bonusPuan: 0,
  istatistik: { toplamKilinan: 2, mukemmelGun: 0, toparlanma: 0 },
  kaza: null,
  kazaTempo: {},
  ayarlar: {},
};

const sahteFark: FarkOzeti = {
  gelenGunSayisi: 2,
  mevcutGunSayisi: 1,
  cakisanGunSayisi: 1,
  rozetVar: false,
  kazaVar: false,
  ayarVar: false,
};

const mockRenkler = {
  arkaplan: '#ffffff',
  kartArkaplan: '#f0f0f0',
  metin: '#111111',
  metinIkincil: '#666666',
  sinir: '#cccccc',
  basarili: '#10b981',
  uyari: '#f59e0b',
  hata: '#ef4444',
  bilgi: '#3b82f6',
  birincil: '#2563eb',
  birincilMetin: '#ffffff',
};

describe('IceAktarmaSihirbaziSayfasi', () => {
  const mockNavigation = { goBack: jest.fn(), navigate: jest.fn() };
  const mockDispatch = jest.fn();

  // İçe aktarma durumu (selector mock'u bunu okur).
  let yedeklemeDurumu: {
    durum: string;
    hata: string | null;
    sonOzet: { yazilanAnahtarSayisi: number } | null;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    yedeklemeDurumu = { durum: 'bosta', hata: null, sonOzet: null };

    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    (useRenkler as jest.Mock).mockReturnValue(mockRenkler);
    (useFeedback as jest.Mock).mockReturnValue({
      butonTiklandiFeedback: jest.fn().mockResolvedValue(undefined),
      hataFeedback: jest.fn().mockResolvedValue(undefined),
    });
    (useAppDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useAppSelector as unknown as jest.Mock).mockImplementation(
      (selector: (s: { yedekleme: typeof yedeklemeDurumu }) => unknown) =>
        selector({ yedekleme: yedeklemeDurumu })
    );

    (mevcutVeriyiTopla as jest.Mock).mockResolvedValue({ namazGunleri: {} });
    (farkCikar as jest.Mock).mockReturnValue(sahteFark);
  });

  it('açılışta dosya seçim ekranını gösterir', () => {
    const { getByText } = render(<IceAktarmaSihirbaziSayfasi />);
    expect(getByText('Yedek Dosyanızı Seçin')).toBeTruthy();
    expect(getByText('Dosya Seçin')).toBeTruthy();
  });

  it('geçerli dosya seçilince karşılaştırma ekranı görünür', async () => {
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///yedek.json' }],
    });
    mockDosyaIcerik.mockResolvedValue('{"bicim":"namaz-akisi-yedek"}');
    (zarfiCoz as jest.Mock).mockResolvedValue(sahtePayload);

    const { getByText } = render(<IceAktarmaSihirbaziSayfasi />);
    fireEvent.press(getByText('Dosya Seçin'));

    await waitFor(() => {
      expect(getByText('Yedeğiniz Hazır')).toBeTruthy();
    });
    // Önerilen strateji ve devam butonu görünür.
    expect(getByText('Akıllı birleştir')).toBeTruthy();
    expect(getByText('Devam Edin')).toBeTruthy();
    expect(zarfiCoz).toHaveBeenCalledWith('{"bicim":"namaz-akisi-yedek"}');
  });

  it('"Akıllı birleştir" + "Devam Edin" → dört alanı akilli ile dispatch eder', async () => {
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///yedek.json' }],
    });
    mockDosyaIcerik.mockResolvedValue('{"x":1}');
    (zarfiCoz as jest.Mock).mockResolvedValue(sahtePayload);

    const { getByText } = render(<IceAktarmaSihirbaziSayfasi />);
    fireEvent.press(getByText('Dosya Seçin'));
    await waitFor(() => expect(getByText('Yedeğiniz Hazır')).toBeTruthy());

    // "Akıllı birleştir" zaten varsayılan seçili; doğrudan devam.
    fireEvent.press(getByText('Devam Edin'));

    await waitFor(() => {
      expect(iceAktarmayiUygula).toHaveBeenCalledTimes(1);
    });
    expect(iceAktarmayiUygula).toHaveBeenCalledWith({
      payload: sahtePayload,
      secimler: { namaz: 'akilli', puan: 'akilli', kaza: 'akilli', ayarlar: 'akilli' },
    });
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('bozuk dosya (zarfiCoz → null) → kibar hata ekranı gösterir', async () => {
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///bozuk.json' }],
    });
    mockDosyaIcerik.mockResolvedValue('bozuk-icerik');
    (zarfiCoz as jest.Mock).mockResolvedValue(null);

    const { getByText } = render(<IceAktarmaSihirbaziSayfasi />);
    fireEvent.press(getByText('Dosya Seçin'));

    await waitFor(() => {
      expect(getByText('Dosya Okunamadı')).toBeTruthy();
    });
    expect(getByText('Tekrar Deneyin')).toBeTruthy();
    expect(getByText('Vazgeçin')).toBeTruthy();
    expect(iceAktarmayiUygula).not.toHaveBeenCalled();
  });

  it('kullanıcı dosya seçimini iptal edince adımda kalır', async () => {
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
      canceled: true,
      assets: null,
    });

    const { getByText, queryByText } = render(<IceAktarmaSihirbaziSayfasi />);
    fireEvent.press(getByText('Dosya Seçin'));

    await waitFor(() => {
      expect(zarfiCoz).not.toHaveBeenCalled();
    });
    expect(getByText('Yedek Dosyanızı Seçin')).toBeTruthy();
    expect(queryByText('Yedeğiniz Hazır')).toBeNull();
  });
});
