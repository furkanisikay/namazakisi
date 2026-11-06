/**
 * Seri sekmesi (başlık + Tesbih + gök paneli + hata/yükleniyor kapıları) İngilizce
 * çizildiğinde Türkçe metin kalmaz. Seri sözü bir HADİSTİR: Türkçe dışında gösterilmez
 * (`hadisGosterilir`), çevrilmez.
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';

jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Svg: 'Svg',
  G: 'G',
  Defs: 'Defs',
  RadialGradient: 'RadialGradient',
  LinearGradient: 'LinearGradient',
  Path: 'Path',
  Circle: 'Circle',
  Ellipse: 'Ellipse',
  Line: 'Line',
  Rect: 'Rect',
  Stop: 'Stop',
  Text: 'Text',
}));
jest.mock('react-native-reanimated', () => {
  const m = require('react-native-reanimated/mock');
  return { ...m, cancelAnimation: jest.fn(), useReducedMotion: jest.fn(() => true) };
});
jest.mock('../../../hooks/useSeriAyi', () => ({ useSeriAyi: jest.fn() }));
jest.mock('../../../store/hooks', () => ({ useAppSelector: jest.fn(), useAppDispatch: jest.fn() }));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{`[${props.name}]`}</Text>;
});
jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    metin: '#15161A',
    metinIkincil: '#757575',
    birincil: '#4CAF50',
    birincilMetin: '#FFFFFF',
    arkaplan: '#FAFAFA',
    sinir: '#E0E0E0',
    durum: { hata: '#F44336', uyari: '#FFC107', basarili: '#4CAF50', bilgi: '#2196F3' },
  }),
}));

import { useSeriAyi } from '../../../hooks/useSeriAyi';
import { useAppSelector } from '../../../store/hooks';
import { SeriSekmesi } from '../SeriSekmesi';
import { Tesbih } from '../Tesbih';
import { aylikIzgaraOlustur } from '../../../../core/seri/aylikIzgara';
import { zincirBaglari } from '../../../../core/seri/zincir';
import { gokErisimEtiketi } from '../../../../core/seri/gokErisimEtiketi';
import { ingilizceyeGec, turkceKalanlar } from '../../../../__tests__/yardimci/ingilizceDenetimi';

const useSeriAyiMock = useSeriAyi as unknown as jest.Mock;
const useAppSelectorMock = useAppSelector as unknown as jest.Mock;

/** Türkçe harfsiz ama Türkçe sözcükler (bu sekmede geçebilecek). */
const YASAKLI = ['seri', 'Seri', 'rekor', 'rozet', 'Efsane', 'Kaynak', 'Temmuz', 'gün\\b', 'P\\b', 'C\\b'];

/** Çizilen ağaçlar test sonunda kaldırılır (dil değişimi takılı ağacı act dışında yeniden çizmesin). */
const agaclar: renderer.ReactTestRenderer[] = [];
function ciz(ui: React.ReactElement): renderer.ReactTestRenderer {
  let agac!: renderer.ReactTestRenderer;
  act(() => {
    agac = renderer.create(ui);
  });
  agaclar.push(agac);
  return agac;
}

function izgaraKur() {
  const izgara = aylikIzgaraOlustur({
    yil: 2026,
    ay: 6,
    kayitlar: {
      '2026-07-01': [true, true, true, true, true],
      '2026-07-02': [true, true, true, false, false],
    },
    dondurulmusTarihler: new Set(['2026-07-04']),
    bugun: '2026-07-10',
  });
  return { izgara, zincirler: zincirBaglari(izgara, 3) };
}

let geriAl: () => void;
beforeEach(() => {
  geriAl = ingilizceyeGec();
  useAppSelectorMock.mockImplementation((selector: (s: unknown) => unknown) => selector({ seri: { seriDurumu: { enUzunSeri: 32 } } }));
});
afterEach(() => {
  act(() => agaclar.splice(0).forEach((a) => a.unmount()));
  geriAl();
});

const hookSonucu = (ek: object = {}) => ({
  yukleniyor: false,
  hata: null as string | null,
  ...izgaraKur(),
  ayAdi: 'July 2026',
  bugun: '2026-07-10',
  tamGunEsigi: 3,
  mevcutSeri: 15,
  yenidenDene: jest.fn(),
  ...ek,
});

it('sekme gövdesi: başlık, tesbih, gök paneli (gün harfleri); hadis gösterilmez', () => {
  useSeriAyiMock.mockReturnValue(hookSonucu());
  const agac = ciz(<SeriSekmesi />);
  const govde = agac.root.findByProps({ testID: 'gok-paneli-govde' });
  act(() => {
    govde.props.onLayout({ nativeEvent: { layout: { width: 350, height: 0, x: 0, y: 0 } } });
  });
  expect(agac.root.findAllByProps({ testID: 'seri-sozu' })).toHaveLength(0);
  expect(turkceKalanlar(agac.toJSON() as never, YASAKLI)).toEqual([]);
  const metinler = JSON.stringify(agac.toJSON());
  expect(metinler).toContain('day streak');
  expect(metinler).toContain('Habit master badge: 6 days left');
});

it('hata ve yükleniyor kapıları', () => {
  // Hook'un hata metni yükleme anının dilinde kalmış olsa da ekran etkin dilden çizer.
  useSeriAyiMock.mockReturnValue(hookSonucu({ hata: 'Geçmiş kayıtlarınız şu anda okunamadı.' }));
  const hata = ciz(<SeriSekmesi />);
  expect(turkceKalanlar(hata.toJSON() as never, YASAKLI)).toEqual([]);
  expect(hata.root.findByProps({ accessibilityLabel: 'Retry loading streak data' })).toBeTruthy();
  useSeriAyiMock.mockReturnValue(hookSonucu({ yukleniyor: true }));
  expect(turkceKalanlar(ciz(<SeriSekmesi />).toJSON() as never, YASAKLI)).toEqual([]);
});

it('tesbih: hedefli, varsayılan ad ve tüm rozetler tamam', () => {
  for (const ui of [
    <Tesbih mevcutSeri={3} hedefGun={7} hedefAdi="First week" />,
    <Tesbih mevcutSeri={3} hedefGun={7} />,
    <Tesbih mevcutSeri={95} hedefGun={null} />,
  ]) {
    const agac = ciz(ui);
    expect(turkceKalanlar(agac.toJSON() as never, YASAKLI)).toEqual([]);
    const etiket = agac.root.findAll((d) => typeof d.props.accessibilityLabel === 'string')[0].props.accessibilityLabel;
    expect(turkceKalanlar([etiket], YASAKLI)).toEqual([]);
  }
  const agac = ciz(<Tesbih mevcutSeri={3} hedefGun={7} hedefAdi="First week" />);
  expect(agac.root.findByProps({ accessibilityLabel: 'First week badge: 3 of 7 days completed.' })).toBeTruthy();
});

it('gök paneli erişim etiketi İngilizce ve çoğullu', () => {
  const { izgara } = izgaraKur();
  expect(gokErisimEtiketi(izgara, 'July 2026', 1, 3)).toBe(
    'July 2026. 1 day met the goal, 1 day with all five prayers, 1 day frozen. Current streak: 1 day.'
  );
});
