import { anonsMetniniCoz, ANONS_SABLONLARI } from '../anonsMetni';

describe('anonsMetniniCoz', () => {
  test('{vakit} ve {süre} yerine gerçek değer koyar', () => {
    expect(anonsMetniniCoz('{vakit} vakti çıkıyor, son {süre} dakika.', 'ikindi', 18))
      .toBe('İkindi vakti çıkıyor, son 18 dakika.');
  });
  test('imsak → Sabah adıyla okunur', () => {
    expect(anonsMetniniCoz('{vakit} namazı', 'imsak', 5)).toBe('Sabah namazı');
  });
  test('aynı placeholder birden çok kez geçerse hepsini değiştirir', () => {
    expect(anonsMetniniCoz('{süre} - {süre}', 'ogle', 7)).toBe('7 - 7');
  });
  test('placeholder yoksa metni aynen döndürür', () => {
    expect(anonsMetniniCoz('Namaz vakti', 'aksam', 3)).toBe('Namaz vakti');
  });
  test('şablonlar vakit-agnostik ({vakit} içerir, sabit vakit adı içermez)', () => {
    for (const s of ANONS_SABLONLARI) {
      expect(s).toContain('{vakit}');
      expect(s).not.toMatch(/İkindi|Sabah|Öğle|Akşam|Yatsı/);
    }
  });
});
