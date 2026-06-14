import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { YedeklemeSayfasi } from '../YedeklemeSayfasi';
import { useNavigation } from '@react-navigation/native';
import { useRenkler } from '../../../../core/theme';
import { useFeedback } from '../../../../core/feedback';
import { yedeginiPaylas } from '../../../../domain/services/YedeklemeServisi';

// Mocklar
jest.mock('@react-navigation/native');
jest.mock('../../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('../../../../core/feedback', () => ({ useFeedback: jest.fn() }));
jest.mock('../../../../domain/services/YedeklemeServisi', () => ({
  yedeginiPaylas: jest.fn(),
}));
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
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

describe('YedeklemeSayfasi', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  const mockRenkler = {
    arkaplan: '#ffffff',
    kartArkaplan: '#f0f0f0',
    birincil: '#000000',
    metin: '#333333',
    metinIkincil: '#666666',
    sinir: '#cccccc',
    basarili: '#10b981',
    hata: '#ff0000',
  };

  const mockFeedback = {
    butonTiklandiFeedback: jest.fn().mockResolvedValue(undefined),
    hataFeedback: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    (useRenkler as jest.Mock).mockReturnValue(mockRenkler);
    (useFeedback as jest.Mock).mockReturnValue(mockFeedback);
    (yedeginiPaylas as jest.Mock).mockResolvedValue(undefined);
  });

  it('sayfa hatasız render olmalıdır', () => {
    const { getByText } = render(<YedeklemeSayfasi />);
    expect(getByText('Yedek oluştur')).toBeTruthy();
    expect(getByText('İçe aktar / Geri yükle')).toBeTruthy();
  });

  it('"Yedek oluştur"a basınca yedeginiPaylas çağrılmalıdır', async () => {
    const { getByText } = render(<YedeklemeSayfasi />);
    fireEvent.press(getByText('Yedek oluştur'));
    await waitFor(() => {
      expect(yedeginiPaylas).toHaveBeenCalledTimes(1);
    });
  });

  it('"İçe aktar"a basınca IceAktarmaSihirbazi rotasına gitmelidir', async () => {
    const { getByText } = render(<YedeklemeSayfasi />);
    fireEvent.press(getByText('İçe aktar / Geri yükle'));
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('IceAktarmaSihirbazi');
    });
  });

  it('yedekleme başarısız olursa hata geri bildirimi ve kibar uyarı gösterilmelidir', async () => {
    (yedeginiPaylas as jest.Mock).mockRejectedValue(new Error('boom'));
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    // Beklenen Logger.error gürültüsünü test çıktısından bastır.
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { getByText } = render(<YedeklemeSayfasi />);
    fireEvent.press(getByText('Yedek oluştur'));
    await waitFor(() => {
      expect(mockFeedback.hataFeedback).toHaveBeenCalledTimes(1);
    });
    expect(alertSpy).toHaveBeenCalledWith('Yedekleme', expect.any(String));

    alertSpy.mockRestore();
    errSpy.mockRestore();
  });
});
