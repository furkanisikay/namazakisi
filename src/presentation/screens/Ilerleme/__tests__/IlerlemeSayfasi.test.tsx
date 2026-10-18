/**
 * İlerleme sekmesi (sade tasarım Dalga 4): Seri + Kılma oranı + Rozetler TEK sayfada.
 * - Seri bölümü yalnız odaktayken çizilir (gök paneli döngüleri arka planda koşmasın),
 * - dönem seçici Haftalık/Aylık (Günlük yok; "Aylık" etiketi mağaza betiklerinin anahtarı),
 * - haftalık hedef sabit "35 namaz" DEĞİL, seri tam gün eşiğinden türer.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { IlerlemeSayfasi } from '../IlerlemeSayfasi';
import { aylikIstatistikleriYukle, haftalikIstatistikleriYukle } from '../../../store/namazSlice';

jest.mock('../../../store/hooks', () => ({ useAppSelector: jest.fn(), useAppDispatch: jest.fn() }));

jest.mock('../../../store/namazSlice', () => ({
  haftalikIstatistikleriYukle: jest.fn(() => ({ type: 'namaz/haftalik' })),
  aylikIstatistikleriYukle: jest.fn(() => ({ type: 'namaz/aylik' })),
}));

const mockOdak = { odakta: true };
jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => mockOdak.odakta,
  useFocusEffect: (cb: () => void) => {
    const React = require('react');
    React.useEffect(cb, [cb]);
  },
}));

jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    arkaplan: '#FAFAFA',
    kartArkaplan: '#FFFFFF',
    metin: '#15161A',
    metinIkincil: '#757575',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    birincilKoyu: '#2E7D32',
    birincilMetin: '#FFFFFF',
    dikkat: '#E65100',
    bilgi: '#2196F3',
    durum: { hata: '#F44336', uyari: '#FFC107', basarili: '#4CAF50', bilgi: '#2196F3', dikkat: '#E65100' },
  }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: (props: { children: React.ReactNode }) => <View {...props} /> };
});
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{props.name}</Text>;
});

// Ağır zincirler: seri gök paneli kendi testinde; paylaşım modalı native köprü çeker.
jest.mock('../../Seri/SeriSekmesi', () => ({ SeriSekmesi: () => {
  const { Text } = require('react-native');
  return <Text testID="seri-bolumu">seri</Text>;
} }));
jest.mock('../../../components/Sharing/PaylasimModal', () => ({ PaylasimModal: () => null }));
jest.mock('../../../components/Sharing/PaylasilabilirRozet', () => ({ PaylasilabilirRozet: () => null }));
jest.mock('../../../components/RozetKarti', () => ({ RozetKarti: ({ rozet }: { rozet: { ad: string } }) => {
  const { Text } = require('react-native');
  return <Text>{rozet.ad}</Text>;
} }));

const useAppSelectorMock = useAppSelector as unknown as jest.Mock;
const useAppDispatchMock = useAppDispatch as unknown as jest.Mock;

const gun = (gunAdi: string, tamamlananNamaz: number) => ({
  tarih: `2026-10-${gunAdi}`,
  gunAdi,
  toplamNamaz: 5,
  tamamlananNamaz,
  tamamlanmaYuzdesi: tamamlananNamaz * 20,
});

function stateOlustur(tamGunEsigi = 3) {
  return {
    namaz: {
      haftalikIstatistik: {
        gunlukVeriler: [gun('Pzt', 3), gun('Sal', 5), gun('Çar', 2), gun('Per', 0), gun('Cum', 4), gun('Cmt', 0), gun('Paz', 0)],
        tamamlananNamaz: 14,
        tamamlanmaYuzdesi: 40,
        toplamNamaz: 35,
        enIyiGun: gun('Sal', 5),
      },
      aylikIstatistik: {
        ayAdi: 'Ekim',
        yil: 2026,
        aktifGunSayisi: 4,
        tamamlanmaYuzdesi: 40,
        tamamlananNamaz: 14,
        namazBazindaYuzdeler: {},
      },
      yukleniyor: false,
    },
    seri: {
      ayarlar: { tamGunEsigi },
      rozetDetaylari: [
        { id: 'a', ad: 'Kazanılmamış', kazanildiMi: false },
        { id: 'b', ad: 'Kazanılmış', kazanildiMi: true },
      ],
      seviyeDurumu: null,
      toplamKilinanNamaz: 14,
    },
  };
}

describe('IlerlemeSayfasi', () => {
  const dispatchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOdak.odakta = true;
    useAppDispatchMock.mockReturnValue(dispatchMock);
    useAppSelectorMock.mockImplementation((selector: (s: ReturnType<typeof stateOlustur>) => unknown) => selector(stateOlustur()));
  });

  it('üç bölüm tek sayfada: seri, kılma oranı, rozetler', () => {
    const { getByTestId, getByText } = render(<IlerlemeSayfasi />);
    expect(getByText('İlerleme')).toBeTruthy();
    expect(getByTestId('seri-bolumu')).toBeTruthy();
    expect(getByTestId('kilma-orani-bolumu')).toBeTruthy();
    expect(getByTestId('rozetler-bolumu')).toBeTruthy();
  });

  it('odakta değilken seri bölümü ÇİZİLMEZ (gök paneli döngüleri arka planda koşmaz)', () => {
    mockOdak.odakta = false;
    const { queryByTestId, getByTestId } = render(<IlerlemeSayfasi />);
    expect(queryByTestId('seri-bolumu')).toBeNull();
    expect(getByTestId('rozetler-bolumu')).toBeTruthy();
  });

  it('dönem seçici yalnız Haftalık ve Aylık; Aylık seçilince aylık veri yüklenir', () => {
    const { getByLabelText, queryByLabelText, getByText } = render(<IlerlemeSayfasi />);
    expect(haftalikIstatistikleriYukle).toHaveBeenCalled();
    expect(queryByLabelText('Günlük')).toBeNull();
    fireEvent.press(getByLabelText('Aylık'));
    expect(aylikIstatistikleriYukle).toHaveBeenCalled();
    expect(getByText('Ekim 2026')).toBeTruthy();
  });

  it('haftalık hedef seri eşiğinden türer (eşik 3 → 21 namaz; sabit 35 / %80 YOK)', () => {
    const { getByLabelText, queryByText } = render(<IlerlemeSayfasi />);
    expect(getByLabelText('Kılınan namaz: 14 / 21')).toBeTruthy();
    expect(getByLabelText('Hedefe ulaşan gün: 3 / 7')).toBeTruthy();
    expect(queryByText('35 Namaz Hedefi')).toBeNull();
    expect(queryByText(/80% Başarı/)).toBeNull();
  });

  it('rozetler: kazanılanlar önce listelenir', () => {
    const { getAllByText } = render(<IlerlemeSayfasi />);
    const adlar = getAllByText(/Kazanıl/).map((n) => n.props.children);
    expect(adlar).toEqual(['Kazanılmış', 'Kazanılmamış']);
  });
});
