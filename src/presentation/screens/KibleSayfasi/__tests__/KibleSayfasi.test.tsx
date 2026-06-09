import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { KibleSayfasi } from '../KibleSayfasi';
import { guvenilirKibleHostuMu } from '../WebPusulaView';
import { useKible } from '../../../hooks/useKible';
import { useNavigation } from '@react-navigation/native';
import { useRenkler } from '../../../../core/theme';

// Mocklar
jest.mock('expo-sensors', () => ({
  Magnetometer: {
    setUpdateInterval: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));
jest.mock('adhan', () => ({
  Coordinates: jest.fn(),
  Qibla: jest.fn(() => 150),
}));
jest.mock('../../../hooks/useKible');
jest.mock('@react-navigation/native');
jest.mock('../../../../core/theme');
jest.mock('@expo/vector-icons', () => {
  const { View, Text } = require('react-native');
  return {
    FontAwesome5: (props: any) => <Text>{props.name}</Text>,
  };
});
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));
jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  return {
    WebView: (props: any) => <View testID="mock-webview" {...props} />,
  };
});
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => { };
  return Reanimated;
});

describe('KibleSayfasi', () => {
  const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };

  const mockRenkler = {
    arkaplan: '#ffffff',
    kartArkaplan: '#f0f0f0',
    birincil: '#000000',
    birincilMetin: '#ffffff',
    metin: '#333333',
    metinIkincil: '#666666',
    sinir: '#cccccc',
    hata: '#ff0000',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    (useRenkler as jest.Mock).mockReturnValue(mockRenkler);
    (useKible as jest.Mock).mockReturnValue({
      kibleAcisi: 150,
      pusulaYonelimi: 0,
      hedefAcisi: 150,
      izinVerildi: true,
      yukleniyor: false,
      hata: null,
    });
  });

  it('sayfa hatasız render olmalıdır', () => {
    const { getByText } = render(<KibleSayfasi />);
    expect(getByText('Kıbleyi Bul')).toBeTruthy();
  });

  it('geri butonuna basıldığında navigation.goBack çağrılmalıdır', () => {
    const { getByTestId } = render(<KibleSayfasi />);
    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);
    expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
  });

  it('varsayılan olarak Native Pusula (offline) modu açılmalıdır', () => {
    const { getByText } = render(<KibleSayfasi />);
    // NativePusulaView içindeki metinler
    expect(getByText('Kıble Yönü')).toBeTruthy();
    expect(getByText(/Kabe Açısı/)).toBeTruthy();
  });

  it('sekmeler arasında geçiş yapılabilmelidir (Native -> Web)', async () => {
    const { getByText, getByTestId, queryByText } = render(<KibleSayfasi />);

    // Web sekmesine tıkla
    const webTab = getByText('Google AR');
    fireEvent.press(webTab);

    // Native view gitmeli, Web view gelmeli
    await waitFor(() => {
      expect(queryByText('Kıble Yönü')).toBeNull(); // Native başlık yok
      expect(getByTestId('mock-webview')).toBeTruthy();
    });
  });

  it('hata durumunda hata mesajını göstermelidir (Native Mod)', () => {
    (useKible as jest.Mock).mockReturnValue({
      yukleniyor: false,
      hata: 'Sensör hatası',
      izinVerildi: true,
    });

    const { getByText } = render(<KibleSayfasi />);
    expect(getByText('Sensör hatası')).toBeTruthy();
  });

  it('yükleniyor durumunu göstermelidir (Native Mod)', () => {
    (useKible as jest.Mock).mockReturnValue({
      yukleniyor: true,
      hata: null,
    });

    const { getByText } = render(<KibleSayfasi />);
    expect(getByText('Pusula başlatılıyor...')).toBeTruthy();
  });

  // hizalandiMi gostergesi: NativePusulaView'de uygulamanin cekirdek vaadi.
  // Uretim mantigi: hizalandiMi = hedefAcisi < 10 || hedefAcisi > 350 (KIBLE_HIZALAMA_ESIGI = 10).
  // hedefAcisi 0 = telefon Kabe'ye dönük demektir; bu esik o aninda kullaniciya geri bildirim verir.
  describe('Kıble hizalama göstergesi (✓ Kıble yönündesiniz)', () => {
    const kibleVarsayilan = {
      kibleAcisi: 150,
      pusulaYonelimi: 0,
      izinVerildi: true,
      yukleniyor: false,
      hata: null,
    };

    it('hedefAcisi eşik altında (5°) iken hizalama mesajını göstermelidir', () => {
      (useKible as jest.Mock).mockReturnValue({ ...kibleVarsayilan, hedefAcisi: 5 });
      const { getByText } = render(<KibleSayfasi />);
      expect(getByText('✓ Kıble yönündesiniz')).toBeTruthy();
    });

    it('hedefAcisi üst eşik üstünde (358°) iken hizalama mesajını göstermelidir (0/360 sınırı)', () => {
      // 358 > (360 - 10) dalini korur; modüler sarma sonrasi Kabe'ye yakinligi dogru yakalanmali.
      (useKible as jest.Mock).mockReturnValue({ ...kibleVarsayilan, hedefAcisi: 358 });
      const { getByText } = render(<KibleSayfasi />);
      expect(getByText('✓ Kıble yönündesiniz')).toBeTruthy();
    });

    it('hedefAcisi eşik dışında (150°) iken hizalama mesajını GÖSTERMEMELİDİR', () => {
      (useKible as jest.Mock).mockReturnValue({ ...kibleVarsayilan, hedefAcisi: 150 });
      const { queryByText } = render(<KibleSayfasi />);
      expect(queryByText('✓ Kıble yönündesiniz')).toBeNull();
    });

    it('hedefAcisi tam eşikte (10°) iken hizalama mesajını GÖSTERMEMELİDİR (< katı eşitsizlik)', () => {
      // Uretim `hedefAcisi < 10` kullanir; 10 esik DAHIL DEGIL. < yerine <= regresyonu burada yakalanir.
      (useKible as jest.Mock).mockReturnValue({ ...kibleVarsayilan, hedefAcisi: 10 });
      const { queryByText } = render(<KibleSayfasi />);
      expect(queryByText('✓ Kıble yönündesiniz')).toBeNull();
    });

    it('hedefAcisi tam üst eşikte (350°) iken hizalama mesajını GÖSTERMEMELİDİR (> katı eşitsizlik)', () => {
      // Uretim `hedefAcisi > 350` kullanir; 350 esik DAHIL DEGIL. > yerine >= regresyonu burada yakalanir.
      (useKible as jest.Mock).mockReturnValue({ ...kibleVarsayilan, hedefAcisi: 350 });
      const { queryByText } = render(<KibleSayfasi />);
      expect(queryByText('✓ Kıble yönündesiniz')).toBeNull();
    });
  });

  // guvenilirKibleHostuMu: WebPusulaView navigasyon güvenlik filtresi.
  // Yalnızca Google servislerine ve about:blank'e izin verir; diğerleri reddedilir.
  describe('guvenilirKibleHostuMu — navigasyon güvenlik filtresi', () => {
    // --- İzin verilen URL'ler ---
    it('qiblafinder.withgoogle.com adresine izin vermelidir', () => {
      expect(guvenilirKibleHostuMu('https://qiblafinder.withgoogle.com/intl/tr/')).toBe(true);
    });

    it('*.google.com alt alan adlarına izin vermelidir', () => {
      expect(guvenilirKibleHostuMu('https://maps.google.com/path')).toBe(true);
    });

    it('*.gstatic.com adreslerine izin vermelidir', () => {
      expect(guvenilirKibleHostuMu('https://fonts.gstatic.com/s/font.woff2')).toBe(true);
    });

    it('*.googleapis.com adreslerine izin vermelidir', () => {
      expect(guvenilirKibleHostuMu('https://maps.googleapis.com/api')).toBe(true);
    });

    it('*.googleusercontent.com adreslerine izin vermelidir', () => {
      expect(guvenilirKibleHostuMu('https://lh3.googleusercontent.com/photo.jpg')).toBe(true);
    });

    it('about:blank adresine izin vermelidir', () => {
      expect(guvenilirKibleHostuMu('about:blank')).toBe(true);
    });

    // --- Reddedilen URL'ler ---
    it('evil.com adresini reddetmelidir', () => {
      expect(guvenilirKibleHostuMu('https://evil.com/attack')).toBe(false);
    });

    it('google.com gibi görünen sahte alanı reddetmelidir (evil.google.com.tr)', () => {
      expect(guvenilirKibleHostuMu('https://evil.google.com.tr/')).toBe(false);
    });

    it('http (şifresiz) adresleri reddetmelidir', () => {
      expect(guvenilirKibleHostuMu('http://qiblafinder.withgoogle.com/intl/tr/')).toBe(false);
    });

    it('geçersiz URL dizisini reddetmelidir', () => {
      expect(guvenilirKibleHostuMu('bu-gecersiz-bir-url')).toBe(false);
    });

    it('boş dizeyi reddetmelidir', () => {
      expect(guvenilirKibleHostuMu('')).toBe(false);
    });

    it('javascript: şemasını reddetmelidir', () => {
      expect(guvenilirKibleHostuMu('javascript:alert(1)')).toBe(false);
    });
  });

  // Kabe gostergesi ve Kabe Acisi degeri: NativePusulaView, kullaniciya kibleAcisi'ni
  // "Kabe Açısı: {Math.round(kibleAcisi)}°" olarak gosterir ve kaaba ikonunu render eder.
  describe('Kabe göstergesi ve açı gösterimi', () => {
    it('Kabe açısını Math.round ile yuvarlayarak göstermelidir', () => {
      // 151.62 -> 152 (yuvarlama yukari). Yanlis yuvarlama/format regresyonu yakalanir.
      (useKible as jest.Mock).mockReturnValue({
        kibleAcisi: 151.62,
        pusulaYonelimi: 0,
        hedefAcisi: 151.62,
        izinVerildi: true,
        yukleniyor: false,
        hata: null,
      });
      const { getByText } = render(<KibleSayfasi />);
      expect(getByText('Kabe Açısı: 152°')).toBeTruthy();
    });

    it('Kabe yön ikonunu (kaaba) render etmelidir', () => {
      const { getByText } = render(<KibleSayfasi />);
      // Mock FontAwesome5, ikonu name metni olarak render eder; kaaba gostergesinin varligini dogrular.
      expect(getByText('kaaba')).toBeTruthy();
    });
  });
});
