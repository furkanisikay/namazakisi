import { gunTamMi } from '../gunTamMi';

describe('gunTamMi', () => {
  test('esigin altindaysa tam degildir', () => {
    expect(gunTamMi(2, 5)).toBe(false);
  });

  test('esige esitse tamdir', () => {
    expect(gunTamMi(5, 5)).toBe(true);
  });

  test('esigin ustundeyse tamdir', () => {
    expect(gunTamMi(5, 3)).toBe(true);
  });

  test('sifir kilinan namaz ile sifir esik tamdir', () => {
    expect(gunTamMi(0, 0)).toBe(true);
  });
});
