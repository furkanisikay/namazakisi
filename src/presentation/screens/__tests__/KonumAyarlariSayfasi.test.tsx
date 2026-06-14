import React from 'react';
import { Switch, Linking } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useRenkler } from '../../../core/theme';
import { useFeedback } from '../../../core/feedback';
import { KonumTakipServisi } from '../../../domain/services/KonumTakipServisi';

// Mocklar
jest.mock('../../store/hooks');
jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('../../../core/feedback', () => ({ useFeedback: jest.fn() }));
jest.mock('../../store/konumSlice', () => ({
  konumAyarlariniGuncelle: jest.fn((arg) => ({ type: 'konum/guncelle', payload: arg })),
}));
jest.mock('../../../domain/services/KonumTakipServisi', () => ({
  KonumTakipServisi: { getInstance: jest.fn() },
}));
jest.mock('../../../domain/services/NamazVaktiHesaplayiciServisi', () => ({
  NamazVaktiHesaplayiciServisi: { getInstance: jest.fn(() => ({})) },
}));
jest.mock('../../../domain/services/TurkiyeKonumServisi', () => ({}));
jest.mock('../../hooks/useKonumMetni', () => ({ useKonumMetni: () => 'İstanbul' }));
jest.mock('../../components/IlIlceSecici', () => ({ IlIlceSecici: () => null }));
jest.mock('../../components/KonumIzniDisclosureModali', () => ({
  KonumIzniDisclosureModali: () => null,
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: any) => <Text>{props.name}</Text>;
});
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { FontAwesome5: (props: any) => <Text>{props.name}</Text> };
});
jest.mock('../../hooks/useDonanimGeriTusu', () => ({
  useDonanimGeriTusu: jest.fn(),
}));

// react-native Linking.openSettings'i gözlemle
jest.spyOn(Linking, 'openSettings').mockImplementation(() => Promise.resolve());

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

const konumState = {
  konumModu: 'oto',
  akilliTakipAktif: false,
  takipHassasiyeti: 'dengeli',
  koordinatlar: { lat: 41.0, lng: 29.0 },
  sonGpsGuncellemesi: null,
  seciliIlId: null,
  seciliIlceId: null,
  seciliIlAdi: '',
  seciliIlceAdi: '',
};

describe('KonumAyarlariSayfasi — izin/hata bildirim modalı', () => {
  const dispatchMock = jest.fn();
  const servisMock = {
    aktifMi: jest.fn().mockResolvedValue(false),
    arkaPlanIzniVarMi: jest.fn().mockResolvedValue(true),
    baslat: jest.fn(),
    durdur: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRenkler as jest.Mock).mockReturnValue(mockRenkler);
    (useFeedback as jest.Mock).mockReturnValue({
      butonTiklandiFeedback: jest.fn().mockResolvedValue(undefined),
    });
    (useAppDispatch as unknown as jest.Mock).mockReturnValue(dispatchMock);
    (useAppSelector as unknown as jest.Mock).mockImplementation((selector: any) =>
      selector({ konum: konumState })
    );
    (KonumTakipServisi.getInstance as jest.Mock).mockReturnValue(servisMock);
    servisMock.aktifMi.mockResolvedValue(false);
    servisMock.arkaPlanIzniVarMi.mockResolvedValue(true);
  });

  const SayfaYukle = () => {
    const { KonumAyarlariSayfasi } = require('../KonumAyarlariSayfasi');
    return render(<KonumAyarlariSayfasi />);
  };

  it('hatasız render olur', async () => {
    const { getByText } = SayfaYukle();
    await waitFor(() => expect(getByText('Konum Ayarları')).toBeTruthy());
  });

  it('takip başlatılamazsa "İzin Gerekli" onay modalı (Alert DEĞİL) gösterilir', async () => {
    servisMock.baslat.mockResolvedValue(false);
    const { getByText, UNSAFE_getByType } = SayfaYukle();
    await waitFor(() => expect(getByText('Konum Ayarları')).toBeTruthy());

    // Seyahatte otomatik güncelleme switch'ini AÇ
    fireEvent(UNSAFE_getByType(Switch), 'valueChange', true);

    await waitFor(() => {
      expect(getByText('İzin Gerekli')).toBeTruthy();
      expect(getByText('Ayarlara Git')).toBeTruthy();
    });
  });

  it('"Ayarlara Git"e basınca Linking.openSettings çağrılır', async () => {
    servisMock.baslat.mockResolvedValue(false);
    const { getByText, getByLabelText, UNSAFE_getByType } = SayfaYukle();
    await waitFor(() => expect(getByText('Konum Ayarları')).toBeTruthy());

    fireEvent(UNSAFE_getByType(Switch), 'valueChange', true);
    await waitFor(() => expect(getByText('Ayarlara Git')).toBeTruthy());

    fireEvent.press(getByLabelText('Ayarlara Git'));
    expect(Linking.openSettings).toHaveBeenCalledTimes(1);
  });

  it('takip başlatma hata fırlatırsa tema-uyumlu hata modalı gösterilir', async () => {
    servisMock.baslat.mockRejectedValue(new Error('boom'));
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { getByText, UNSAFE_getByType } = SayfaYukle();
    await waitFor(() => expect(getByText('Konum Ayarları')).toBeTruthy());

    fireEvent(UNSAFE_getByType(Switch), 'valueChange', true);

    await waitFor(() => {
      expect(getByText('Bir hata oluştu')).toBeTruthy();
    });
    errSpy.mockRestore();
  });
});
