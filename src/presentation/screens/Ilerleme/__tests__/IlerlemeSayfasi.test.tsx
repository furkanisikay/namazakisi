/**
 * İlerleme sekmesi (sade tasarım Dalga 4): Seri + Kılma oranı + Rozetler TEK sayfada.
 * - Seri bölümü yalnız odaktayken çizilir (gök paneli döngüleri arka planda koşmasın),
 * - dönem seçici Haftalık/Aylık (Günlük yok; "Aylık" etiketi mağaza betiklerinin anahtarı),
 * - haftalık hedef sabit "35 namaz" DEĞİL, seri tam gün eşiğinden türer.
 */
import React from 'react';
import { cleanup, render, fireEvent } from '@testing-library/react-native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { IlerlemeSayfasi } from '../IlerlemeSayfasi';
import { aylikIstatistikleriYukle, haftalikIstatistikleriYukle } from '../../../store/namazSlice';
import { ingilizceyeGec, turkceKalanlar } from '../../../../__tests__/yardimci/ingilizceDenetimi';

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

describe('IlerlemeSayfasi — İngilizce', () => {
  /** Türkçe harfsiz ama Türkçe sözcükler (bu sayfada geçebilecek). */
  const YASAKLI = ['Seviye', 'Puan', 'puan', 'namaz', 'rozet', 'Oran', 'Vakit', 'vakit', 'Ekim', 'Pzt\\b', 'Sal\\b', 'Per\\b', 'Cum\\b', 'Paz\\b', 'Sabah'];
  const gunEn = (tarih: string, tamamlananNamaz: number) => ({
    tarih,
    gunAdi: 'Pzt', // slice'ta yükleme anının dilinde saklı ad — ekranda KULLANILMAMALI
    toplamNamaz: 5,
    tamamlananNamaz,
    tamamlanmaYuzdesi: tamamlananNamaz * 20,
  });
  const durum = () => {
    const temel = stateOlustur();
    return {
      ...temel,
      namaz: {
        ...temel.namaz,
        haftalikIstatistik: {
          ...temel.namaz.haftalikIstatistik,
          gunlukVeriler: [12, 13, 14, 15, 16, 17, 18].map((g, i) => gunEn(`2026-10-${g}`, [3, 5, 2, 0, 4, 0, 0][i])),
          enIyiGun: gunEn('2026-10-13', 5),
        },
        aylikIstatistik: {
          ...temel.namaz.aylikIstatistik,
          ay: 9,
          namazBazindaYuzdeler: { Sabah: 40, 'Öğle': 60, 'İkindi': 20, 'Akşam': 80, 'Yatsı': 100 },
        },
      },
      seri: {
        ...temel.seri,
        // Rozet kartı bu dosyada ad'ı düz yazan bir mock'tur (kendi İngilizce testi Sharing/__tests__/ingilizce).
        rozetDetaylari: [],
        // Slice'ta Türkçe saklanmış kopyalar (yükleme anının dili): ekran kimlikten çizer.
        seviyeDurumu: { mevcutSeviye: 2, toplamPuan: 150, mevcutSeviyePuani: 50, sonrakiSeviyeKalanPuan: 150, rank: 'Tâlip', rankIkonu: '⭐' },
      },
    };
  };
  let geriAl: () => void;
  beforeEach(() => {
    jest.clearAllMocks();
    mockOdak.odakta = true;
    useAppDispatchMock.mockReturnValue(jest.fn());
    useAppSelectorMock.mockImplementation((selector: (s: ReturnType<typeof durum>) => unknown) => selector(durum()));
    geriAl = ingilizceyeGec();
  });
  afterEach(() => {
    // Önce ağaçları kaldır: dil geri dönerken takılı ekranlar act dışında yeniden çizilmesin.
    cleanup();
    geriAl();
  });

  it('başlık, haftalık oran, seviye kartı İngilizce; gün ve rank adı kimlikten', () => {
    const r = render(<IlerlemeSayfasi />);
    expect(r.getByText('Progress')).toBeTruthy();
    expect(r.getByText('Mon')).toBeTruthy();
    expect(r.getByLabelText('Prayers prayed: 14 / 21')).toBeTruthy();
    expect(r.getByText('Talib')).toBeTruthy();
    expect(r.getByText('150 points to Salik')).toBeTruthy();
    expect(turkceKalanlar(r.toJSON() as never, YASAKLI)).toEqual([]);
  });

  it('aylık oran: ay adı numaradan, vakit adları İngilizce', () => {
    const r = render(<IlerlemeSayfasi />);
    fireEvent.press(r.getByLabelText('Monthly'));
    expect(r.getByText('October 2026')).toBeTruthy();
    expect(r.getByText('Dhuhr')).toBeTruthy();
    expect(r.getByText('100%')).toBeTruthy();
    expect(turkceKalanlar(r.toJSON() as never, YASAKLI)).toEqual([]);
  });
});
