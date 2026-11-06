/**
 * Görünüm ayarları ve "Neler yeni" sayfa çerçevesi İngilizce çizilince Türkçe metin
 * kalmaz; gezinme başlıkları (ekran + sekme) her dilde dolu (dil çıkarımı nöbetçisi).
 * "Neler yeni" İÇERİĞİ (`YeniOzellikler.ts`) bu testin kapsamı dışıdır: kart metinleri
 * sabit İngilizce bir duyuruyla değiştirilir.
 */
import * as React from 'react';
import { Dimensions } from 'react-native';
import { render } from '@testing-library/react-native';

const mockRenkler = {
  arkaplan: '#FAFAFA', kartArkaplan: '#FFFFFF', birincil: '#4CAF50', birincilMetin: '#FFFFFF', metin: '#212121',
  metinIkincil: '#757575', sinir: '#E0E0E0',
  durum: { basarili: '#4CAF50', uyari: '#FFC107', hata: '#F44336', bilgi: '#2196F3', dikkat: '#E65100' },
};
jest.mock('../../../core/theme', () => {
  const gercek = jest.requireActual('../../../core/theme/temalar');
  return {
    ...gercek,
    useRenkler: () => mockRenkler,
    useTema: () => ({ mod: 'sistem', moduDegistir: jest.fn(), palet: gercek.RENK_PALETLERI[0], tumPaletler: gercek.RENK_PALETLERI, paletiDegistir: jest.fn() }),
  };
});
jest.mock('../../../core/feedback', () => ({ useFeedback: () => ({ butonTiklandiFeedback: jest.fn().mockResolvedValue(undefined) }) }));
jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({ params: undefined }),
  useFocusEffect: (cb: () => void | (() => void)) => {
    const R = require('react');
    R.useEffect(cb, [cb]);
  },
  useIsFocused: () => true,
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{`[${props.name}]`}</Text>;
});
jest.mock('../../hooks/useSadeGorunum', () => ({ useSadeGorunum: () => ({ ayarAcik: false, yuklendi: true, ayarla: jest.fn() }) }));
jest.mock('../../hooks/useEvEkraniAyari', () => ({ useEvEkraniAyari: () => ({ acik: false, yuklendi: true }), evEkraniAyarla: jest.fn() }));
jest.mock('../../store/hooks', () => ({ useAppDispatch: () => jest.fn(), useAppSelector: () => undefined }));
jest.mock('../../../core/constants/YeniOzellikler', () => ({
  YENI_OZELLIKLER: [
    {
      id: 'ornek', surum: '1.0.0', tarih: '2026-03-05', baslik: 'Feature', aciklama: 'Details', ikon: 'star',
      platformlar: ['android', 'ios'], hedefSayfa: 'Hatirlatmalar',
      ceviri: { en: { baslik: 'Feature', aciklama: 'Details' } },
    },
    // Çevirisi olmayan duyuru İngilizcede GÖSTERİLMEZ (yarım çeviri yok).
    { id: 'cevirisiz', surum: '1.0.0', tarih: '2026-04-01', baslik: 'Yalnız Türkçe duyuru', aciklama: 'Ayrıntı', ikon: 'star', platformlar: ['android', 'ios'] },
  ],
}));

import { ingilizceyeGec, turkceKalanlar } from '../../../__tests__/yardimci/ingilizceDenetimi';
import { GorunumAyarlariSayfasi } from '../GorunumAyarlariSayfasi';
import { NelerYeniSayfasi } from '../NelerYeniSayfasi';
import { sozluk } from '../../../core/dil/aktifDil';

const YASAKLI = ['Tema', 'Renk', 'Sistem', 'Koyu', 'Gece', 'Sade', 'Ev ekran', 'Yeni', 'Neler'];
const TR = /[çğıöşüÇĞİÖŞÜ]/;

let geriAl: () => void;
beforeEach(() => {
  geriAl = ingilizceyeGec();
});
afterEach(() => {
  geriAl();
  jest.restoreAllMocks();
});

it('görünüm ayarları (tablette ev ekranı satırıyla) İngilizce', () => {
  jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 1280, height: 800, scale: 1, fontScale: 1 });
  const e = render(<GorunumAyarlariSayfasi />);
  expect(e.getByText('SIMPLE VIEW')).toBeTruthy();
  expect(e.getByText('Home display')).toBeTruthy();
  expect(e.getByText('Emerald')).toBeTruthy();
  expect(turkceKalanlar(e.toJSON() as never, YASAKLI)).toEqual([]);
});

it('"Neler yeni" çerçevesi ve tarih İngilizce', () => {
  const e = render(<NelerYeniSayfasi navigation={{ navigate: jest.fn() }} />);
  expect(e.getByText(/^5 March 2026/)).toBeTruthy();
  expect(e.getByText('Take a look')).toBeTruthy();
  expect(e.queryByText('Yalnız Türkçe duyuru')).toBeNull();
  expect(turkceKalanlar(e.toJSON() as never, YASAKLI).filter((m) => !m.includes('Namaz Akışı'))).toEqual([]);
});

it('gezinme başlıkları her dilde dolu ve İngilizcede Türkçe harfsiz', () => {
  const en = sozluk('en').genel;
  const tr = sozluk('tr').genel;
  expect(Object.keys(en.ekranlar)).toEqual(Object.keys(tr.ekranlar));
  expect([...Object.values(en.ekranlar), ...Object.values(en.sekmeler)].filter((m) => TR.test(m) || !m.trim())).toEqual([]);
  expect(tr.ekranlar.GorunumAyarlari).toBe('Görünüm');
  expect(en.ekranlar.HesapYontemiAyarlari).toBe('Calculation method');
});
