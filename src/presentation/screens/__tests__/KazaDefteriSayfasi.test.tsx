import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useRenkler } from '../../../core/theme';
import { gunlukHedefiGuncelle } from '../../store/kazaSlice';

// Mocklar
jest.mock('../../store/hooks');
jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('../../store/kazaSlice', () => ({
  kazaVerileriniYukle: jest.fn(() => ({ type: 'kaza/yukle' })),
  borcEkle: jest.fn((arg) => ({ type: 'kaza/borcEkle', payload: arg })),
  kazaTamamla: jest.fn((arg) => ({ type: 'kaza/tamamla', payload: arg })),
  sihirbazIleBaslat: jest.fn((arg) => ({ type: 'kaza/sihirbaz', payload: arg })),
  gunlukHedefiGuncelle: jest.fn((arg) => ({ type: 'kaza/hedef', payload: arg })),
  gizlemeToggle: jest.fn(() => ({ type: 'kaza/gizle' })),
}));
jest.mock('../../../domain/services/KazaHesaplayiciServisi', () => ({
  mekruhVakitKontrolEt: jest.fn(() => ({ mekruhMu: false, aciklama: null })),
  tahminiTarihiFormatla: jest.fn(() => '1 Ocak 2027'),
  motivasyonOnerileriHesapla: jest.fn(() => []),
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: any) => <Text>{props.name}</Text>;
});
// BildirimModali barrel import'u (@expo/vector-icons)
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { FontAwesome5: (props: any) => <Text>{props.name}</Text> };
});
// Donanım geri tuşu hook'u: pasif geç
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

const kazaDurumu = {
  toplamKalan: 10,
  toplamTamamlanan: 5,
  gunlukHedef: 0,
  gunlukTamamlanan: 0,
  toplamGizleMi: false,
  namazlar: [
    { namazAdi: 'Sabah', kalanBorc: 3 },
    { namazAdi: 'Öğle', kalanBorc: 2 },
    { namazAdi: 'İkindi', kalanBorc: 2 },
    { namazAdi: 'Akşam', kalanBorc: 1 },
    { namazAdi: 'Yatsı', kalanBorc: 2 },
    { namazAdi: 'Vitir', kalanBorc: 0 },
  ],
};

// Redux useSelector ÜRETİMDE stabil referans döndürür. Mock'ta da TEK ve SABİT bir
// state nesnesi kullan: her render'da yeni nesne dönerse `konum.koordinatlar` referansı
// değişir, mekruh useEffect'i her render tetiklenip setState ile SONSUZ DÖNGÜYE girer
// (testi asardı). Sabit referans bunu önler.
const KAZA_STATE = {
  kaza: { kazaDurumu, istatistik: null, yukleniyor: false },
  konum: { koordinatlar: { lat: 41, lng: 29 } },
};

describe('KazaDefteriSayfasi — validasyon hata modalı', () => {
  const dispatchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRenkler as jest.Mock).mockReturnValue(mockRenkler);
    (useAppDispatch as unknown as jest.Mock).mockReturnValue(dispatchMock);
    (useAppSelector as unknown as jest.Mock).mockImplementation((selector: any) =>
      selector(KAZA_STATE)
    );
  });

  const SayfaYukle = () => {
    const { KazaDefteriSayfasi } = require('../KazaDefteriSayfasi');
    return render(<KazaDefteriSayfasi />);
  };

  it('hatasız render olur', () => {
    const { getByText } = SayfaYukle();
    expect(getByText('Kaza Defteri')).toBeTruthy();
  });

  it('günlük hedefe geçersiz değer girilince tema-uyumlu hata modalı (Alert DEĞİL) açılır', async () => {
    const { getByText, getByPlaceholderText } = SayfaYukle();

    // Günlük Hedef düzenle ikonuna bas (edit) — düzenle butonu "edit" ikonu taşır
    fireEvent.press(getByText('edit'));

    // Hedef giriş modalı açılır
    const input = await waitFor(() => getByPlaceholderText('Örn: 3'));
    // Geçersiz (negatif olamaz ama harf -> NaN) giriş
    fireEvent.changeText(input, 'abc');
    fireEvent.press(getByText('Kaydet'));

    // gunlukHedefiGuncelle dispatch EDİLMEMELİ; bunun yerine hata modalı görünmeli
    expect(gunlukHedefiGuncelle).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(getByText('Geçersiz giriş')).toBeTruthy();
      expect(getByText('Geçerli bir sayı giriniz (0 = hedefsiz).')).toBeTruthy();
    });
  });

  it('hata modalında "Tamam"a basınca modal kapanır', async () => {
    const { getByText, getByPlaceholderText, getByLabelText } = SayfaYukle();
    fireEvent.press(getByText('edit'));
    const input = await waitFor(() => getByPlaceholderText('Örn: 3'));
    fireEvent.changeText(input, 'abc');
    fireEvent.press(getByText('Kaydet'));
    await waitFor(() => expect(getByText('Geçersiz giriş')).toBeTruthy());

    // Tamam = birincil eylem (kapatır)
    fireEvent.press(getByLabelText('Tamam'));
    // Modal kapanınca dispatch hâlâ çağrılmamış olmalı (sadece kapatma)
    expect(gunlukHedefiGuncelle).not.toHaveBeenCalled();
  });

  it('geçerli günlük hedef girilince gunlukHedefiGuncelle dispatch edilir (hata modalı YOK)', async () => {
    const { getByText, getByPlaceholderText, queryByText } = SayfaYukle();
    fireEvent.press(getByText('edit'));
    const input = await waitFor(() => getByPlaceholderText('Örn: 3'));
    fireEvent.changeText(input, '5');
    fireEvent.press(getByText('Kaydet'));

    expect(gunlukHedefiGuncelle).toHaveBeenCalledWith({ hedef: 5 });
    expect(queryByText('Geçersiz giriş')).toBeNull();
  });
});
