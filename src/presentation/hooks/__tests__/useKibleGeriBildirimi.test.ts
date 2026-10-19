import { DUYURU_ACI_ADIMI, DUYURU_ARALIGI_MS, duyurulmaliMi } from '../useKibleGeriBildirimi';

describe('duyurulmaliMi (sözlü yön kısması)', () => {
  it('ilk geçerli özet duyurulur; açı yoksa duyuru yok', () => {
    expect(duyurulmaliMi(null, { fark: 30, hizali: false }, 0)).toBe(true);
    expect(duyurulmaliMi(null, { fark: null, hizali: false }, 0)).toBe(false);
  });

  it('hizalanma değişimi aralık beklemeden duyurulur, hizalıyken susar', () => {
    const son = { ms: 0, fark: 12, hizali: false };
    expect(duyurulmaliMi(son, { fark: 5, hizali: true }, 100)).toBe(true);
    expect(duyurulmaliMi({ ms: 0, fark: 5, hizali: true }, { fark: 2, hizali: true }, DUYURU_ARALIGI_MS * 5)).toBe(false);
  });

  it('açı ancak aralık dolunca ve en az adım kadar değişince', () => {
    const son = { ms: 0, fark: 40, hizali: false };
    expect(duyurulmaliMi(son, { fark: 20, hizali: false }, DUYURU_ARALIGI_MS - 1)).toBe(false);
    expect(duyurulmaliMi(son, { fark: 40 - DUYURU_ACI_ADIMI + 1, hizali: false }, DUYURU_ARALIGI_MS)).toBe(false);
    expect(duyurulmaliMi(son, { fark: 40 - DUYURU_ACI_ADIMI, hizali: false }, DUYURU_ARALIGI_MS)).toBe(true);
  });
});
