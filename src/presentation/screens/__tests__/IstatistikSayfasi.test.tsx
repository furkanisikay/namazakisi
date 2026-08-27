/**
 * IstatistikSayfasi — dördüncü ("Seri") sekmenin eklenmesi mevcut üç sekmeyi
 * (Günlük/Haftalık/Aylık) BOZMAMALI. Bu smoke test dört sekmenin de render
 * olduğunu, mevcut üçünün hâlâ seçilebildiğini ve "Seri" sekmesine
 * geçildiğinde `SeriSekmesi`'nin (mock) render edildiğini doğrular —
 * `SeriSekmesi`'nin kendi iç davranışı `SeriSekmesi.test.tsx`'te.
 */
import React from 'react';
import { act } from 'react-test-renderer';
import renderer from 'react-test-renderer';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { IstatistikSayfasi } from '../IstatistikSayfasi';

jest.mock('../../store/hooks', () => ({ useAppSelector: jest.fn(), useAppDispatch: jest.fn() }));

jest.mock('../../store/namazSlice', () => ({
  namazlariYukle: jest.fn((arg) => ({ type: 'namaz/gunluk', payload: arg })),
  haftalikIstatistikleriYukle: jest.fn(() => ({ type: 'namaz/haftalik' })),
  aylikIstatistikleriYukle: jest.fn(() => ({ type: 'namaz/aylik' })),
}));

jest.mock('../../../core/theme', () => ({
  useRenkler: () => ({
    arkaplan: '#FAFAFA',
    kartArkaplan: '#FFFFFF',
    metin: '#15161A',
    metinIkincil: '#757575',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    birincilKoyu: '#2E7D32',
    durum: { hata: '#F44336', uyari: '#FFC107', basarili: '#4CAF50', bilgi: '#2196F3' },
  }),
}));

// react-native-safe-area-context native context ister; testte düz View'e indirger.
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: (props: { children: React.ReactNode }) => <View {...props} /> };
});

jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{props.name}</Text>;
});

// Seri sekmesinin kendi (ağır) render zincirini burada tekrar kurmuyoruz —
// yalnız DOĞRU KOŞULDA render edildiğini doğrulamak yeterli.
jest.mock('../Seri/SeriSekmesi', () => ({ SeriSekmesi: 'SeriSekmesi' }));

const useAppSelectorMock = useAppSelector as unknown as jest.Mock;
const useAppDispatchMock = useAppDispatch as unknown as jest.Mock;

function stateOlustur() {
  return {
    auth: { kullanici: null },
    namaz: {
      gunlukNamazlar: { tarih: '2026-07-10', namazlar: [] },
      haftalikIstatistik: { gunlukVeriler: [], tamamlananNamaz: 0, tamamlanmaYuzdesi: 0, enIyiGun: null },
      aylikIstatistik: {
        ayAdi: 'Temmuz',
        yil: 2026,
        aktifGunSayisi: 0,
        tamamlanmaYuzdesi: 0,
        tamamlananNamaz: 0,
        namazBazindaYuzdeler: {},
      },
      yukleniyor: false,
    },
  };
}

describe('IstatistikSayfasi', () => {
  const dispatchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAppDispatchMock.mockReturnValue(dispatchMock);
    useAppSelectorMock.mockImplementation((selector: (s: ReturnType<typeof stateOlustur>) => unknown) =>
      selector(stateOlustur())
    );
  });

  function render() {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<IstatistikSayfasi />);
    });
    return tree;
  }

  test('dört sekme de render olur (Günlük, Haftalık, Aylık, Seri)', () => {
    const tree = render();
    const metinler = tree.root
      .findAllByType(require('react-native').Text)
      .map((d) => (Array.isArray(d.props.children) ? d.props.children.join('') : d.props.children));

    expect(metinler).toContain('Günlük');
    expect(metinler).toContain('Haftalık');
    expect(metinler).toContain('Aylık');
    expect(metinler).toContain('Seri');
  });

  test('mevcut üç sekme HÂLÂ ÇALIŞIR: Haftalık ve Aylık sekmelerine geçilebilir, çökme yok', () => {
    const tree = render();
    const butonlar = tree.root.findAllByType(require('react-native').TouchableOpacity);

    expect(() => {
      act(() => {
        butonlar[1].props.onPress(); // Haftalık
      });
    }).not.toThrow();

    expect(() => {
      act(() => {
        butonlar[2].props.onPress(); // Aylık
      });
    }).not.toThrow();

    expect(() => {
      act(() => {
        butonlar[0].props.onPress(); // geri Günlük
      });
    }).not.toThrow();
  });

  test('NÖBETÇİ: sayfa "Seri" sekmesiyle AÇILIR (açılış sekmesi)', () => {
    const tree = render();
    expect(tree.root.findAllByType('SeriSekmesi' as never)).toHaveLength(1);
  });

  test('"Seri" sekmesinden çıkıp geri dönülünce SeriSekmesi yine render edilir', () => {
    const tree = render();
    const butonlar = tree.root.findAllByType(require('react-native').TouchableOpacity);

    act(() => {
      butonlar[0].props.onPress(); // Günlük
    });
    expect(tree.root.findAllByType('SeriSekmesi' as never)).toHaveLength(0);

    act(() => {
      butonlar[3].props.onPress(); // Seri
    });
    expect(tree.root.findAllByType('SeriSekmesi' as never)).toHaveLength(1);
  });
});
