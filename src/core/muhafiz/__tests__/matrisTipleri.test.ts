import { MUHAFIZ_VAKITLERI, SEVIYE_KADEMELERI, SES_PALETI } from '../matrisTipleri';

describe('matrisTipleri sabitleri', () => {
  test('5 muhafız vakti (gunes hariç)', () => {
    expect(MUHAFIZ_VAKITLERI).toEqual(['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi']);
    expect(MUHAFIZ_VAKITLERI).not.toContain('gunes');
  });
  test('4 sabit seviye kademesi, azalan eşik sırası', () => {
    expect(SEVIYE_KADEMELERI).toEqual(['nazik', 'uyari', 'sert', 'acil']);
  });
  test('ses paleti dolu ve id\'ler benzersiz', () => {
    expect(SES_PALETI.length).toBeGreaterThan(0);
    const idler = SES_PALETI.map((s) => s.id);
    expect(new Set(idler).size).toBe(idler.length);
  });
});
