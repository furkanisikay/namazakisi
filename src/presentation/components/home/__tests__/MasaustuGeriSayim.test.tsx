import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@expo/vector-icons', () => ({ FontAwesome5: 'FontAwesome5' }));
// Kaynak alt yol import'u kullanır (denetim D-20) → kök mock'u alt yola da yansıt.
jest.mock('@expo/vector-icons/FontAwesome5', () => ({ __esModule: true, default: jest.requireMock('@expo/vector-icons').FontAwesome5 }));
jest.mock('@expo/vector-icons/MaterialIcons', () => ({ __esModule: true, default: jest.requireMock('@expo/vector-icons').MaterialIcons }));
jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    birincil: '#4CAF50',
    metin: '#212121',
    metinIkincil: '#757575',
    durum: { basarili: '#4CAF50' },
  }),
}));

import { MasaustuGeriSayim } from '../MasaustuGeriSayim';

// Sayaç (useKalanSure, D-03) `Date.now()` okur: sabit "şimdi" ile metin deterministik.
const SIMDI = Date.UTC(2026, 0, 1, 12, 0, 0);
beforeAll(() => { jest.spyOn(Date, 'now').mockReturnValue(SIMDI); });
afterAll(() => { jest.restoreAllMocks(); });

const temel = {
  vakitAdi: 'İkindi',
  // Hedef 1:02:03 sonrası → sayaç "01:02:03".
  hedefIso: new Date(SIMDI + (3600 + 2 * 60 + 3) * 1000 + 500).toISOString(),
  vakitAraligi: '15:45 - 18:20',
  tamamlandi: false,
  kilitli: false,
};

describe('MasaustuGeriSayim', () => {
  it('vakit adı, büyük sayaç ve çıkışa kalan açıklaması', () => {
    const ekran = render(<MasaustuGeriSayim {...temel} />);
    expect(ekran.getByText('İkindi')).toBeTruthy();
    expect(ekran.getByText('01:02:03')).toBeTruthy();
    expect(ekran.getByText('ŞU ANKİ VAKİT')).toBeTruthy();
    expect(ekran.getByText(/Vaktin çıkmasına kalan · 15:45 - 18:20/)).toBeTruthy();
    expect(ekran.queryByText('Kılındı')).toBeNull();
  });

  it('salt gösterimdir: basılabilir düğme YOK (dik duran yarıya dokunulmaz)', () => {
    const ekran = render(<MasaustuGeriSayim {...temel} />);
    expect(ekran.queryAllByRole('button')).toHaveLength(0);
  });

  it('kılındıysa çip; güneş→öğle arasında "sıradaki vakit" ve girişe kalan', () => {
    const kilindi = render(<MasaustuGeriSayim {...temel} tamamlandi />);
    expect(kilindi.getByText('Kılındı')).toBeTruthy();

    const kilitli = render(<MasaustuGeriSayim {...temel} vakitAdi="Öğle" kilitli />);
    expect(kilitli.getByText('SIRADAKİ VAKİT')).toBeTruthy();
    expect(kilitli.getByText(/Vaktin girmesine kalan/)).toBeTruthy();
  });

  it('ekran okuyucu tek düğümde tüm durumu okur', () => {
    const ekran = render(<MasaustuGeriSayim {...temel} tamamlandi />);
    expect(
      ekran.getByLabelText('İkindi vakti, 15:45 - 18:20. Vaktin çıkmasına kalan 01:02:03. Kılındı.')
    ).toBeTruthy();
  });
});
