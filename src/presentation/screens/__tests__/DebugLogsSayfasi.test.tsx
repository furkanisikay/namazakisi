import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useRenkler } from '../../../core/theme';
import { Logger } from '../../../core/utils/Logger';

// Mocklar
jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('../../../core/utils/Logger', () => {
  const actual = jest.requireActual('../../../core/utils/Logger');
  return {
    LogLevel: actual.LogLevel,
    Logger: {
      getLogs: jest.fn(() => []),
      isEnabled: jest.fn(() => true),
      setEnabled: jest.fn().mockResolvedValue(true),
      clearLogs: jest.fn().mockResolvedValue(undefined),
      exportLogs: jest.fn(() => 'log icerigi'),
      error: jest.fn(),
    },
  };
});
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));
const mockDosyaYaz = jest.fn().mockResolvedValue(undefined);
jest.mock('expo-file-system/next', () => ({
  File: jest.fn().mockImplementation(() => ({
    write: mockDosyaYaz,
    uri: 'file://tmp/logs.txt',
  })),
  Paths: { cache: 'file://cache' },
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: any) => <Text>{props.name}</Text>;
});
jest.mock('@expo/vector-icons/MaterialIcons', () => {
  const { Text } = require('react-native');
  return (props: any) => <Text>{`mi:${props.name}`}</Text>;
});
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { FontAwesome5: (props: any) => <Text>{props.name}</Text> };
});
jest.mock('../../hooks/useDonanimGeriTusu', () => ({
  useDonanimGeriTusu: jest.fn(),
}));

const mockRenkler = {
  arkaplan: '#ffffff',
  kartArkaplan: '#f0f0f0',
  birincil: '#4CAF50',
  metin: '#333333',
  metinIkincil: '#666666',
  sinir: '#cccccc',
  hata: '#F44336',
  bilgi: '#2196F3',
  basarili: '#10b981',
};

describe('DebugLogsSayfasi — onay/bildirim modalı', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRenkler as jest.Mock).mockReturnValue(mockRenkler);
    (Logger.getLogs as jest.Mock).mockReturnValue([
      { timestamp: Date.now(), level: 'INFO', tag: 'Test', message: 'merhaba' },
    ]);
    (Logger.isEnabled as jest.Mock).mockReturnValue(true);
  });

  const SayfaYukle = () => {
    const { DebugLogsSayfasi } = require('../DebugLogsSayfasi');
    return render(<DebugLogsSayfasi />);
  };

  it('hatasız render olur', async () => {
    const { getByText } = SayfaYukle();
    await waitFor(() => expect(getByText('Debug Modu')).toBeTruthy());
  });

  it('"Temizle"ye basınca yıkıcı onay modalı (Alert DEĞİL) açılır', async () => {
    const { getByText } = SayfaYukle();
    await waitFor(() => expect(getByText('Temizle')).toBeTruthy());

    fireEvent.press(getByText('Temizle'));

    await waitFor(() => {
      expect(getByText('Logları Temizle')).toBeTruthy();
      expect(getByText('Tüm loglar silinecek. Emin misiniz?')).toBeTruthy();
    });
  });

  it('onayda Logger.clearLogs çağrılır', async () => {
    const { getByText, getByLabelText } = SayfaYukle();
    await waitFor(() => expect(getByText('Temizle')).toBeTruthy());

    fireEvent.press(getByText('Temizle'));
    await waitFor(() => expect(getByText('Logları Temizle')).toBeTruthy());

    // Onay modalındaki yıkıcı birincil eylem etiketi de "Temizle"
    fireEvent.press(getByLabelText('Temizle'));
    await waitFor(() => {
      expect(Logger.clearLogs).toHaveBeenCalledTimes(1);
    });
  });

  it('onayda "İptal"e basınca clearLogs çağrılmaz', async () => {
    const { getByText, getByLabelText } = SayfaYukle();
    await waitFor(() => expect(getByText('Temizle')).toBeTruthy());

    fireEvent.press(getByText('Temizle'));
    await waitFor(() => expect(getByText('Logları Temizle')).toBeTruthy());

    fireEvent.press(getByLabelText('İptal'));
    expect(Logger.clearLogs).not.toHaveBeenCalled();
  });

  it('paylaşılan log dosyası MASKELENMİŞ olarak yazılır (konum sızmaz)', async () => {
    (Logger.exportLogs as jest.Mock).mockReturnValue(
      ['{', '  "il": "İstanbul",', '  "konum": "41.0082, 28.9784"', '}'].join('\n'),
    );
    const Sharing = require('expo-sharing');
    const { getByText } = SayfaYukle();
    await waitFor(() => expect(getByText('Paylaş')).toBeTruthy());

    fireEvent.press(getByText('Paylaş'));

    await waitFor(() => expect(Sharing.shareAsync).toHaveBeenCalled());
    expect(mockDosyaYaz).toHaveBeenCalledTimes(1);
    const yazilan = mockDosyaYaz.mock.calls[0][0] as string;
    expect(yazilan).not.toContain('İstanbul');
    expect(yazilan).not.toContain('41.0082');
    expect(yazilan).not.toContain('28.9784');
    expect(yazilan).toContain('[konum gizlendi]');
  });

  it('debug ayarı kaydedilemezse hata bildirim modalı gösterilir', async () => {
    (Logger.setEnabled as jest.Mock).mockResolvedValue(false);
    (Logger.isEnabled as jest.Mock).mockReturnValue(false);
    const { getByText, UNSAFE_getAllByType } = SayfaYukle();
    await waitFor(() => expect(getByText('Debug Modu')).toBeTruthy());

    const { Switch } = require('react-native');
    fireEvent(UNSAFE_getAllByType(Switch)[0], 'valueChange', true);

    await waitFor(() => {
      expect(getByText('Ayar kaydedilemedi')).toBeTruthy();
    });
  });
});
