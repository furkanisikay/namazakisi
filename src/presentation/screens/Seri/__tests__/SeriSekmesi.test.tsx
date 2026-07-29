/**
 * SeriSekmesi — hata/yükleniyor kapıları (AGENTS.md'nin "sessiz sonsuz
 * spinner" dersi), `Tesbih`/`GokPaneli`'ye geçen prop'ların doğruluğu ve
 * `sonrakiHedefiBul` çıktısının sentence-case hedef adına doğru eşlenmesi.
 *
 * `Tesbih`/`GokPaneli` düz STRING'e mock'lanır (react-native-svg mock
 * reçetesiyle aynı gerekçe — task-4-report.md): bu, onların kendi
 * `react-native-svg` bağımlılığını hiç yüklemeden test edilebilir kılar ve
 * bu dosyanın yalnız ORKESTRASYONU (hangi prop'un nereye gittiğini) test
 * etmesini sağlar; iç SVG detayları zaten GokPaneli.test.tsx/Tesbih.test.tsx'te.
 */
import React from 'react';
import { act } from 'react-test-renderer';
import renderer from 'react-test-renderer';

jest.mock('../../../hooks/useSeriAyi', () => ({ useSeriAyi: jest.fn() }));
jest.mock('../../../store/hooks', () => ({ useAppSelector: jest.fn(), useAppDispatch: jest.fn() }));

// @expo/vector-icons native köprü ister (expo-font -> expo-modules-core) —
// jest'te suite'i hiç yüklemeden çökertir. Repo deseni (bkz. KazaDefteriSayfasi.test.tsx).
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    metin: '#15161A',
    metinIkincil: '#757575',
    birincil: '#4CAF50',
    arkaplan: '#FAFAFA',
    sinir: '#E0E0E0',
    durum: { hata: '#F44336', uyari: '#FFC107', basarili: '#4CAF50', bilgi: '#2196F3' },
  }),
}));

// Tesbih/GokPaneli düz string'e indirgenir — react-native-svg'ye hiç dokunmadan
// yalnız SeriSekmesi'nin bu bileşenlere geçtiği prop'lar test edilir.
jest.mock('../Tesbih', () => ({ Tesbih: 'Tesbih' }));
jest.mock('../GokPaneli', () => ({ GokPaneli: 'GokPaneli' }));

import { useSeriAyi } from '../../../hooks/useSeriAyi';
import { useAppSelector } from '../../../store/hooks';
import { SeriSekmesi } from '../SeriSekmesi';

const useSeriAyiMock = useSeriAyi as unknown as jest.Mock;
const useAppSelectorMock = useAppSelector as unknown as jest.Mock;

const VARSAYILAN_HOOK_SONUCU = {
  yukleniyor: false,
  hata: null as string | null,
  izgara: [],
  zincirler: [],
  ayAdi: 'Temmuz 2026',
  bugun: '2026-07-10',
  tamGunEsigi: 5,
  mevcutSeri: 15,
  erisimEtiketi: 'Temmuz 2026. 0 gün hedef tutuldu, 0 günde beş vakit tamamlandı, 0 gün dondurulmuş. Mevcut seri 15 gün.',
  yenidenDene: jest.fn(),
};

function render(ui: React.ReactElement): renderer.ReactTestRenderer {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(ui);
  });
  return tree;
}

describe('SeriSekmesi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppSelectorMock.mockImplementation((selector: (s: unknown) => unknown) =>
      selector({ seri: { seriDurumu: { enUzunSeri: 32 } } })
    );
  });

  test('yükleniyor durumunda yükleme göstergesi gösterilir, Tesbih/GokPaneli render EDİLMEZ', () => {
    useSeriAyiMock.mockReturnValue({ ...VARSAYILAN_HOOK_SONUCU, yukleniyor: true });
    const tree = render(<SeriSekmesi />);

    expect(tree.root.findAllByType('Tesbih' as never)).toHaveLength(0);
    expect(tree.root.findAllByType('GokPaneli' as never)).toHaveLength(0);
    expect(
      tree.root.findAllByType(require('react-native').Text).some((d) =>
        String(d.props.children).includes('yükleniyor')
      )
    ).toBe(true);
  });

  test('NÖBETÇİ: okuma reddedilince sonsuz spinner YOK — kibar hata + "Yeniden deneyin" gösterilir', () => {
    const yenidenDene = jest.fn();
    useSeriAyiMock.mockReturnValue({
      ...VARSAYILAN_HOOK_SONUCU,
      yukleniyor: false,
      hata: 'Diskten okunamadı',
      yenidenDene,
    });
    const tree = render(<SeriSekmesi />);

    expect(tree.root.findAllByType('GokPaneli' as never)).toHaveLength(0);
    const buton = tree.root.findByProps({ accessibilityLabel: 'Seri verilerini yeniden deneyin' });
    expect(buton).toBeTruthy();

    act(() => {
      buton.props.onPress();
    });
    expect(yenidenDene).toHaveBeenCalledTimes(1);
  });

  test('başarılı yüklemede mevcutSeri/enUzunSeri gösterilir ve GokPaneli doğru prop\'larla render edilir', () => {
    useSeriAyiMock.mockReturnValue(VARSAYILAN_HOOK_SONUCU);
    const tree = render(<SeriSekmesi />);

    const metinler = tree.root
      .findAllByType(require('react-native').Text)
      .map((d) => String(d.props.children));
    expect(metinler).toContain('15'); // mevcutSeri
    expect(metinler).toContain('32'); // enUzunSeri (rekor)

    const gokPaneli = tree.root.findByType('GokPaneli' as never);
    expect(gokPaneli.props.izgara).toBe(VARSAYILAN_HOOK_SONUCU.izgara);
    expect(gokPaneli.props.zincirler).toBe(VARSAYILAN_HOOK_SONUCU.zincirler);
    expect(gokPaneli.props.ayAdi).toBe('Temmuz 2026');
    expect(gokPaneli.props.bugun).toBe('2026-07-10');
    expect(gokPaneli.props.tamGunEsigi).toBe(5);
    expect(gokPaneli.props.mevcutSeri).toBe(15);
  });

  test('Tesbih\'e sonrakiHedefiBul çıktısı sentence-case hedef adıyla geçirilir (15 -> Alışkanlık ustası, hedef 21)', () => {
    useSeriAyiMock.mockReturnValue({ ...VARSAYILAN_HOOK_SONUCU, mevcutSeri: 15 });
    const tree = render(<SeriSekmesi />);

    const tesbih = tree.root.findByType('Tesbih' as never);
    expect(tesbih.props.mevcutSeri).toBe(15);
    expect(tesbih.props.hedefGun).toBe(21);
    expect(tesbih.props.hedefAdi).toBe('Alışkanlık ustası');
  });

  test('tüm hedefler tamamlandığında (mevcutSeri >= 90) Tesbih hedefGun=null alır, hedefAdi verilmez', () => {
    useSeriAyiMock.mockReturnValue({ ...VARSAYILAN_HOOK_SONUCU, mevcutSeri: 95 });
    const tree = render(<SeriSekmesi />);

    const tesbih = tree.root.findByType('Tesbih' as never);
    expect(tesbih.props.mevcutSeri).toBe(95);
    expect(tesbih.props.hedefGun).toBeNull();
    expect(tesbih.props.hedefAdi).toBeUndefined();
  });
});
