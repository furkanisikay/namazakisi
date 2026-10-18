import React from 'react';
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
// Cihazlar arası eşitleme (issue #288): varsayılan hiçbir sağlayıcı yapılandırılmamış.
const mockKullanilabilir = jest.fn((): Array<{ kimlik: string; ad: string }> => []);
jest.mock('../../../../domain/services/esitlemeSaglayicilari', () => ({
  kullanilabilirSaglayicilar: () => mockKullanilabilir(),
}));
// BildirimModali donanım geri tuşu hook'unu kullanır → test ortamında pasif geç
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({
  useDonanimGeriTusu: jest.fn(),
}));
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    FontAwesome5: (props: any) => <Text>{props.name}</Text>,
  };
});
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{props.name}</Text>;
});
// Durum kartı son dışa aktarma damgasını okur (sade tasarım Dalga 4).
jest.mock('../../../../data/local/Depolama', () => ({
  Depolama: { oku: jest.fn(async () => null) },
}));
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
    bilgi: '#2196F3',
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
    expect(getByText('Yedek oluşturun')).toBeTruthy();
    expect(getByText('Yedekten geri yükleyin')).toBeTruthy();
  });

  it('"Yedek oluştur"a basınca yedeginiPaylas çağrılmalıdır', async () => {
    const { getByText } = render(<YedeklemeSayfasi />);
    fireEvent.press(getByText('Yedek oluşturun'));
    await waitFor(() => {
      expect(yedeginiPaylas).toHaveBeenCalledTimes(1);
    });
  });

  it('"İçe aktar"a basınca IceAktarmaSihirbazi rotasına gitmelidir', async () => {
    const { getByText } = render(<YedeklemeSayfasi />);
    fireEvent.press(getByText('Yedekten geri yükleyin'));
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('IceAktarmaSihirbazi');
    });
  });

  it('yedekleme başarısız olursa hata geri bildirimi ve tema modalı (Alert DEĞİL) gösterilmelidir', async () => {
    (yedeginiPaylas as jest.Mock).mockRejectedValue(new Error('boom'));
    // Beklenen Logger.error gürültüsünü test çıktısından bastır.
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { getByText } = render(<YedeklemeSayfasi />);
    fireEvent.press(getByText('Yedek oluşturun'));
    await waitFor(() => {
      expect(mockFeedback.hataFeedback).toHaveBeenCalledTimes(1);
    });

    // Artık native Alert yerine tema-uyumlu BildirimModali görünmeli
    await waitFor(() => {
      expect(getByText('Yedek oluşturulamadı')).toBeTruthy();
    });
    // "Tekrar dene" birincil eylemi sunulmalı
    expect(getByText('Tekrar deneyin')).toBeTruthy();

    errSpy.mockRestore();
  });

  it('"Tekrar dene"ye basınca yeniden yedek oluşturulmaya çalışılır', async () => {
    (yedeginiPaylas as jest.Mock).mockRejectedValue(new Error('boom'));
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { getByText } = render(<YedeklemeSayfasi />);
    fireEvent.press(getByText('Yedek oluşturun'));
    await waitFor(() => {
      expect(getByText('Tekrar deneyin')).toBeTruthy();
    });
    expect(yedeginiPaylas).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText('Tekrar deneyin'));
    await waitFor(() => {
      expect(yedeginiPaylas).toHaveBeenCalledTimes(2);
    });

    errSpy.mockRestore();
  });

  describe('cihazlar arası eşitleme kartı (issue #288)', () => {
    afterEach(() => mockKullanilabilir.mockReturnValue([]));

    it('hiçbir sağlayıcı yapılandırılmamışken kart HİÇ görünmez', () => {
      const { queryByText } = render(<YedeklemeSayfasi />);
      expect(queryByText('Cihazlar arası eşitleme')).toBeNull();
    });

    it('sağlayıcı varken kart görünür ve eşitleme sayfasına gider', async () => {
      mockKullanilabilir.mockReturnValue([{ kimlik: 'googleDrive', ad: 'Google Drive' }]);
      const { getByText } = render(<YedeklemeSayfasi />);
      fireEvent.press(getByText('Cihazlar arası eşitleme'));
      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith('EsitlemeAyarlari');
      });
    });
  });
});
