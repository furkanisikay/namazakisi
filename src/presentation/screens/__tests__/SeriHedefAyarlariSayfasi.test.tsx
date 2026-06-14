import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useRenkler } from '../../../core/theme';
import { useFeedback } from '../../../core/feedback';
import { seriStateSifirla } from '../../store/seriSlice';

// Mocklar
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  CommonActions: { reset: jest.fn((arg) => ({ type: 'RESET', payload: arg })) },
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  removeItem: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../store/hooks');
jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('../../../core/feedback', () => ({ useFeedback: jest.fn() }));
jest.mock('../../store/seriSlice', () => ({
  seriAyarlariniGuncelle: jest.fn((arg) => ({ type: 'seri/ayar', payload: arg })),
  seriStateSifirla: jest.fn(() => ({ type: 'seri/sifirla' })),
  ozelGunModuDurumunuGuncelle: jest.fn((arg) => ({ type: 'seri/ozelMod', payload: arg })),
  ozelGunBaslat: jest.fn((arg) => ({ type: 'seri/ozelBaslat', payload: arg })),
}));
// OzelGunTakvimi modal'ını sade bir bileşene indir (takvim iç bağımlılıklarından kaçın)
jest.mock('../../components', () => ({
  OzelGunTakvimi: () => null,
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: any) => <Text>{props.name}</Text>;
});
// BildirimModali barrel import'u (@expo/vector-icons) için de mock gerekir
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { FontAwesome5: (props: any) => <Text>{props.name}</Text> };
});
// BildirimModali içindeki donanım geri tuşu hook'u: pasif geç
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

describe('SeriHedefAyarlariSayfasi', () => {
  const dispatchMock = jest.fn();

  const seriState = {
    ayarlar: { tamGunEsigi: 4 },
    ozelGunAyarlari: { ozelGunModuAktif: false, aktifOzelGun: null },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({ dispatch: jest.fn() });
    (useRenkler as jest.Mock).mockReturnValue(mockRenkler);
    (useFeedback as jest.Mock).mockReturnValue({
      butonTiklandiFeedback: jest.fn().mockResolvedValue(undefined),
    });
    (useAppDispatch as unknown as jest.Mock).mockReturnValue(dispatchMock);
    (useAppSelector as unknown as jest.Mock).mockImplementation((selector: any) =>
      selector({ seri: seriState })
    );
  });

  // require burada — mock'lar kurulduktan sonra modül yüklensin
  const SayfaYukle = () => {
    const { SeriHedefAyarlariSayfasi } = require('../SeriHedefAyarlariSayfasi');
    return render(<SeriHedefAyarlariSayfasi />);
  };

  it('hatasız render olur', () => {
    const { getByText } = SayfaYukle();
    expect(getByText('Tam Gün Eşiği')).toBeTruthy();
    expect(getByText('Seri Verilerini Sıfırla')).toBeTruthy();
  });

  it('"Seri Verilerini Sıfırla"ya basınca onay modalı (Alert DEĞİL) açılır', () => {
    const { getByText } = SayfaYukle();
    fireEvent.press(getByText('Seri Verilerini Sıfırla'));
    // Tema-uyumlu onay modalı görünmeli
    expect(getByText('Seri Sıfırla')).toBeTruthy();
    expect(getByText(/geri alınamaz/)).toBeTruthy();
    // Yıkıcı birincil eylem etiketi
    expect(getByText('Sıfırla')).toBeTruthy();
  });

  it('onay modalında "Sıfırla"ya basınca seriStateSifirla dispatch edilir ve başarı modalı gösterilir', async () => {
    const { getByText, getByLabelText } = SayfaYukle();
    fireEvent.press(getByText('Seri Verilerini Sıfırla'));
    fireEvent.press(getByLabelText('Sıfırla'));

    expect(seriStateSifirla).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'seri/sifirla' });

    await waitFor(() => {
      expect(getByText('Seri verileriniz sıfırlandı.')).toBeTruthy();
    });
  });

  it('onay modalında "İptal"e basınca sıfırlama yapılmaz', () => {
    const { getByText, getByLabelText } = SayfaYukle();
    fireEvent.press(getByText('Seri Verilerini Sıfırla'));
    fireEvent.press(getByLabelText('İptal'));
    expect(seriStateSifirla).not.toHaveBeenCalled();
  });

  it('"Kurulum Sihirbazını Yeniden Çalıştır"a basınca onay modalı açılır ve onayda kurulum bayrağı silinir', async () => {
    const navDispatch = jest.fn();
    (useNavigation as jest.Mock).mockReturnValue({ dispatch: navDispatch });

    const { getByText, getByLabelText } = SayfaYukle();
    fireEvent.press(getByText('Kurulum Sihirbazını Yeniden Çalıştır'));
    expect(getByText('Kurulumu Sıfırla')).toBeTruthy();

    fireEvent.press(getByLabelText('Sihirbazı Aç'));
    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(1);
      expect(navDispatch).toHaveBeenCalledTimes(1);
    });
  });
});
