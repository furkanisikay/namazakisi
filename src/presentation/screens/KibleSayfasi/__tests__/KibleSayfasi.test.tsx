import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { KibleSayfasi } from '../KibleSayfasi';
import { useKible } from '../../../hooks/useKible';
import { useIsFocused } from '@react-navigation/native';
import { useRenkler } from '../../../../core/theme';
import { HaptikServisi } from '../../../../core/feedback/HaptikServisi';

jest.mock('../../../hooks/useKible', () => {
  const gercek = jest.requireActual('../../../hooks/useKible');
  return { ...gercek, useKible: jest.fn() };
});
jest.mock('@react-navigation/native');
const mockKonum = {
  konumModu: 'manuel',
  gpsAdres: null,
  seciliIlceAdi: 'Fatih',
  seciliIlAdi: 'İstanbul',
};
jest.mock('../../../store/hooks', () => ({
  useAppSelector: (sec: (s: unknown) => unknown) => sec({ konum: mockKonum }),
}));
jest.mock('../../../../core/theme');
jest.mock('../../../../core/feedback/HaptikServisi', () => ({
  HaptikServisi: { basariTitresimi: jest.fn(() => Promise.resolve()) },
}));
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { FontAwesome5: (props: { name: string }) => <Text>{props.name}</Text> };
});
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: { children?: React.ReactNode }) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));
// Düz dize bileşenler (nativewind/jest-hoist: fabrikada createElement YOK — AGENTS.md).
jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Svg: 'Svg',
  Circle: 'Circle',
  Line: 'Line',
  Path: 'Path',
  G: 'G',
  Text: 'SvgText',
  Defs: 'Defs',
  RadialGradient: 'RadialGradient',
  Stop: 'Stop',
}));
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

const kamera = require('expo-camera');

const mockRenkler = {
  arkaplan: '#ffffff',
  kartArkaplan: '#f0f0f0',
  birincil: '#2E7D32',
  birincilMetin: '#ffffff',
  metin: '#333333',
  metinIkincil: '#666666',
  sinir: '#cccccc',
  hata: '#ff0000',
  dikkat: '#E65100',
};

const ozet = (o: Partial<{ hazir: boolean; baslik: number; fark: number | null; hizali: boolean; dik: boolean }> = {}) => ({
  hazir: true,
  baslik: 140,
  fark: 12,
  hizali: false,
  dik: false,
  ...o,
});

function kibleDurumu(ek: Record<string, unknown> = {}) {
  return {
    kibleAcisi: 151.6,
    konum: { lat: 41.0082, lng: 28.9784 },
    ozet: ozet(),
    abone: jest.fn(() => () => undefined),
    vektorGuvenilir: true,
    izinVerildi: true,
    yukleniyor: false,
    hata: null,
    izinTekrarSorulabilir: null,
    pusulaDogrulugu: 3,
    pusulaVar: true,
    izinIste: jest.fn(),
    ...ek,
  };
}

const AsyncStorage = require('@react-native-async-storage/async-storage');

describe('KibleSayfasi', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    // Kayıtlı görünüm testler arası sızmasın (Kamera seçen test sonrakini Kamera'da açardı).
    await AsyncStorage.clear?.();
    (useIsFocused as jest.Mock).mockReturnValue(true);
    (useRenkler as jest.Mock).mockReturnValue(mockRenkler);
    (useKible as jest.Mock).mockReturnValue(kibleDurumu());
    kamera.__izinAyarla({ granted: false, canAskAgain: true, status: 'undetermined' });
  });

  it('başlık ve iki mod; varsayılan Pusula (internetsiz, kamerasız)', () => {
    const { getByText, getByLabelText, getByTestId, queryByTestId } = render(<KibleSayfasi />);
    expect(getByText('Kıble')).toBeTruthy();
    expect(getByLabelText('Pusula modu').props.accessibilityState).toEqual({ selected: true });
    expect(getByLabelText('Kamera modu')).toBeTruthy();
    expect(getByTestId('kible-mod-aciklamasi').props.children).toContain('çentiğe');
    expect(queryByTestId('back-button')).toBeNull();
  });

  it('dış site / WebView YOK: kamera modu kendi görünümümüz', () => {
    const { getByLabelText, getByTestId, queryByTestId } = render(<KibleSayfasi />);
    fireEvent.press(getByLabelText('Kamera modu'));
    expect(queryByTestId('mock-webview')).toBeNull();
    expect(getByTestId('kible-mod-aciklamasi').props.children).toContain('dik tutun');
  });

  it('odakta değilken hiçbir görünüm çizilmez ve sensörler kapalı istenir', () => {
    (useIsFocused as jest.Mock).mockReturnValue(false);
    const { queryByTestId } = render(<KibleSayfasi />);
    expect(useKible).toHaveBeenCalledWith(false);
    expect(queryByTestId('kible-yon-cumlesi')).toBeNull();
  });

  it('pusula: yön cümlesi, mesafe ve kıble açısı', () => {
    const { getByTestId, getByText } = render(<KibleSayfasi />);
    expect(getByTestId('kible-yon-cumlesi').props.children).toBe('Kıble 12° sağınızda');
    expect(getByText(/Kâbe 2\.\d{3} km uzakta, kuzeyden 152°/)).toBeTruthy();
    expect(getByTestId('kible-kabe-isareti')).toBeTruthy();
  });

  it('ilk yön okuması gelmeden "hazırlanıyor"; konum yoksa "konumunuz alınıyor"', () => {
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ ozet: ozet({ hazir: false }) }));
    const a = render(<KibleSayfasi />);
    expect(a.getByTestId('kible-yon-cumlesi').props.children).toBe('Pusula hazırlanıyor…');
    a.unmount();
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ kibleAcisi: null, konum: null, ozet: ozet({ fark: null }) }));
    const b = render(<KibleSayfasi />);
    expect(b.getByTestId('kible-yon-cumlesi').props.children).toBe('Konumunuz alınıyor…');
  });

  it('hizalıyken onay işareti ve titreşim YALNIZ girişte bir kez', () => {
    const { rerender, getByTestId, queryByTestId } = render(<KibleSayfasi />);
    expect(queryByTestId('kible-hiza-onayi')).toBeNull();
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ ozet: ozet({ fark: 2, hizali: true }) }));
    rerender(<KibleSayfasi />);
    expect(getByTestId('kible-yon-cumlesi').props.children).toBe('Kıble yönündesiniz');
    expect(getByTestId('kible-hiza-onayi')).toBeTruthy();
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ ozet: ozet({ fark: 3, hizali: true, baslik: 149 }) }));
    rerender(<KibleSayfasi />);
    expect(HaptikServisi.basariTitresimi).toHaveBeenCalledTimes(1);
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ ozet: ozet({ fark: 20, hizali: false }) }));
    rerender(<KibleSayfasi />);
    expect(HaptikServisi.basariTitresimi).toHaveBeenCalledTimes(1); // çıkışta titreşim yok
  });

  it('telefon dikken pusulada "Kamerayla görün" önerisi kamera moduna geçirir', () => {
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ ozet: ozet({ dik: true }) }));
    const { getByLabelText } = render(<KibleSayfasi />);
    fireEvent.press(getByLabelText('Kamerayla görün'));
    expect(getByLabelText('Kamera modu').props.accessibilityState).toEqual({ selected: true });
  });

  it('kalibrasyon ipucu doğruluğa bağlı', () => {
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ pusulaDogrulugu: 1 }));
    const { getByTestId } = render(<KibleSayfasi />);
    expect(getByTestId('kible-kalibrasyon-belirgin')).toBeTruthy();
  });

  it('konum izni kapalıysa açıklamalı izin satırı (diyalog doğrudan açılmaz)', () => {
    (useKible as jest.Mock).mockReturnValue(
      kibleDurumu({ izinVerildi: false, hata: 'Kıble yönünü bulmak için konum izni gerekiyor.', izinTekrarSorulabilir: true }),
    );
    const { getByTestId } = render(<KibleSayfasi />);
    expect(getByTestId('kible-izin-satiri')).toBeTruthy();
  });

  it('yükleniyor ve genel hata', () => {
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ yukleniyor: true }));
    const a = render(<KibleSayfasi />);
    expect(a.getByText('Pusula başlatılıyor…')).toBeTruthy();
    a.unmount();
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ hata: 'Kıble servisi başlatılamadı.' }));
    const b = render(<KibleSayfasi />);
    expect(b.getByText('Kıble servisi başlatılamadı.')).toBeTruthy();
  });

  it('pusula algılayıcısı yoksa TAM statik pusula: kuzey yukarı, Kâbe 152°, büyük açı + yer, tek bilgi satırı', () => {
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ pusulaVar: false, ozet: ozet({ hazir: false, fark: null }) }));
    const { getByTestId, queryByTestId, getByText, queryByLabelText, UNSAFE_root } = render(<KibleSayfasi />);
    expect(getByTestId('kible-statik-aci').props.children).toEqual([152, '°']);
    expect(getByText(/^Fatih, İstanbul, Kâbe 2\.\d{3} km uzakta$/)).toBeTruthy();
    expect(getByTestId('kible-kabe-isareti')).toBeTruthy();
    // Yön harfleri SVG'de kadranla dönmez: ayrı, dik duran metin katmanı (G baş aşağı olmasın).
    const harfler = UNSAFE_root.findAll((n: { type: unknown; props: { children?: unknown } }) => n.type === 'SvgText');
    expect(harfler.length).toBe(0);
    for (const h of ['K', 'D', 'G', 'B']) expect(getByText(h)).toBeTruthy();
    expect(getByTestId('kible-statik-bilgi').props.children).toBe('Bu cihazda pusula yok; kuzeye göre yönü gösteriyoruz.');
    // Duruma uymayan yönerge ("çentiğe gelince…") ve dönen pusula ipuçları YOK.
    expect(queryByTestId('kible-mod-aciklamasi')).toBeNull();
    expect(queryByTestId('kible-yon-cumlesi')).toBeNull();
    expect(queryByLabelText('Kamerayla görün')).toBeNull();
  });

  it('yükleme ve hata ekranında mod açıklaması gizli; normalde tek satır', () => {
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ yukleniyor: true }));
    const a = render(<KibleSayfasi />);
    expect(a.queryByTestId('kible-mod-aciklamasi')).toBeNull();
    a.unmount();
    (useKible as jest.Mock).mockReturnValue(kibleDurumu());
    const b = render(<KibleSayfasi />);
    expect(b.getByTestId('kible-mod-aciklamasi').props.numberOfLines).toBe(1);
  });

  describe('son seçilen görünüm', () => {
    it('seçim kaydedilir; kamera izni varsa açılışta Kamera geri gelir', async () => {
      kamera.__izinAyarla({ granted: true, canAskAgain: true, status: 'granted' });
      const ilk = render(<KibleSayfasi />);
      await act(async () => {
        fireEvent.press(ilk.getByLabelText('Kamera modu'));
      });
      expect(await AsyncStorage.getItem('@namaz_akisi/kible_modu')).toBe('kamera');
      ilk.unmount();
      const ikinci = render(<KibleSayfasi />);
      await waitFor(() => expect(ikinci.getByLabelText('Kamera modu').props.accessibilityState).toEqual({ selected: true }));
    });

    it('kamera izni yoksa kayıt Kamera olsa da Pusula açılır (diyalog kendiliğinden çıkmaz)', async () => {
      await AsyncStorage.setItem('@namaz_akisi/kible_modu', 'kamera');
      const { getByLabelText } = render(<KibleSayfasi />);
      await act(async () => {
        await Promise.resolve();
      });
      expect(getByLabelText('Pusula modu').props.accessibilityState).toEqual({ selected: true });
      expect(kamera.__istek).not.toHaveBeenCalled();
    });
  });

  describe('kamera modu', () => {
    it('izin yoksa önce açıklama; "Kamerayı açın" sistem iznini ister', async () => {
      const { getByLabelText, getByText } = render(<KibleSayfasi />);
      fireEvent.press(getByLabelText('Kamera modu'));
      expect(getByText('Kıbleyi kamerayla görün')).toBeTruthy();
      expect(kamera.__istek).not.toHaveBeenCalled();
      await act(async () => {
        fireEvent.press(getByLabelText('Kamerayı açın'));
      });
      expect(kamera.__istek).toHaveBeenCalledTimes(1);
    });

    it('izin kalıcı reddedildiyse Ayarlar + pusulaya dönüş', () => {
      kamera.__izinAyarla({ granted: false, canAskAgain: false, status: 'denied' });
      const { getByLabelText, getByText } = render(<KibleSayfasi />);
      fireEvent.press(getByLabelText('Kamera modu'));
      expect(getByText('Kamera izni kapalı')).toBeTruthy();
      expect(getByLabelText('Ayarları açın')).toBeTruthy();
      fireEvent.press(getByLabelText('Pusulayı kullanın'));
      expect(getByLabelText('Pusula modu').props.accessibilityState).toEqual({ selected: true });
    });

    it('izin varken kamera önizlemesi + Kâbe işareti; dik değilse "dik tutun"', () => {
      kamera.__izinAyarla({ granted: true, canAskAgain: true, status: 'granted' });
      const { getByLabelText, getByTestId, UNSAFE_root } = render(<KibleSayfasi />);
      fireEvent.press(getByLabelText('Kamera modu'));
      expect(UNSAFE_root.findAll((n: { type: unknown }) => n.type === 'CameraView').length).toBeGreaterThan(0);
      expect(getByTestId('kamera-kabe-isareti')).toBeTruthy();
      expect(getByTestId('kamera-yon-cumlesi').props.children).toBe('Telefonunuzu dik tutun');
    });

    it('eksenler bu cihazda güvenilmezse kamera görünümü açılmaz, pusula önerilir', () => {
      kamera.__izinAyarla({ granted: true, canAskAgain: true, status: 'granted' });
      (useKible as jest.Mock).mockReturnValue(kibleDurumu({ vektorGuvenilir: false }));
      const { getByLabelText, getByText, UNSAFE_root } = render(<KibleSayfasi />);
      fireEvent.press(getByLabelText('Kamera modu'));
      expect(getByText('Kamera görünümü bu telefonda kullanılamıyor')).toBeTruthy();
      expect(UNSAFE_root.findAll((n: { type: unknown }) => n.type === 'CameraView').length).toBe(0);
    });
  });
});
