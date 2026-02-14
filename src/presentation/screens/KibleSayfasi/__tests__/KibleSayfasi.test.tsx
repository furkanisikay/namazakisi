import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { KibleSayfasi } from '../KibleSayfasi';
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
});
