import {
  MUHAFIZ_VAKITLERI,
  SEVIYE_KADEMELERI,
  VARSAYILAN_SES,
  VARSAYILAN_SES_ADI,
} from '../matrisTipleri';

describe('matrisTipleri sabitleri', () => {
  test('5 muhafız vakti (gunes hariç)', () => {
    expect(MUHAFIZ_VAKITLERI).toEqual(['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi']);
    expect(MUHAFIZ_VAKITLERI).not.toContain('gunes');
  });
  test('4 sabit seviye kademesi, azalan eşik sırası', () => {
    expect(SEVIYE_KADEMELERI).toEqual(['nazik', 'uyari', 'sert', 'acil']);
  });
  test('varsayılan ses kimliği bir URI DEĞİL — kanal id üretiminde taban kanala düşer', () => {
    expect(VARSAYILAN_SES).toBe('varsayilan');
    expect(VARSAYILAN_SES.startsWith('content://')).toBe(false);
    expect(VARSAYILAN_SES_ADI.length).toBeGreaterThan(0);
  });
});
