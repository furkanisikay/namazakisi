/**
 * Now Bar planı köprüsü (issue #282 ikinci aşama): eski native ikilide fonksiyonlar
 * yoktur → "desteklenmiyor" ve sayaçlar eski yolunda kalır. Hiçbiri fırlatmaz.
 */

const mockModul: Record<string, unknown> = {};

jest.mock('expo-modules-core', () => ({
  // Vekil: değerler çağrı anında okunur (fabrika, `mockModul` tanımından ÖNCE koşar).
  requireOptionalNativeModule: () =>
    new Proxy({}, { get: (_hedef, ad: string) => mockModul[ad] }),
}));

jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));

import { canliAyarlariniAc, canliDurumu, canliPlaniKur } from '../index';

describe('canli plan köprüsü', () => {
  beforeEach(() => {
    for (const k of Object.keys(mockModul)) delete mockModul[k];
  });

  test('eski native ikili: desteklenmiyor / false / null', async () => {
    expect(await canliDurumu()).toBe('desteklenmiyor');
    expect(await canliPlaniKur('[]')).toBe(false);
    expect(await canliAyarlariniAc()).toBeNull();
  });

  test('yalnız durum fonksiyonu varsa (plan yok) yine desteklenmiyor — planlayıcı devralmamalı', async () => {
    mockModul.canliDurumu = jest.fn().mockResolvedValue('acik');
    expect(await canliDurumu()).toBe('desteklenmiyor');
  });

  test('yeni ikili: durum ve plan geçer; bilinmeyen değer desteklenmiyor sayılır', async () => {
    mockModul.canliDurumu = jest.fn().mockResolvedValue('acik');
    mockModul.canliPlaniKur = jest.fn().mockResolvedValue(undefined);
    mockModul.canliAyarlariniAc = jest.fn().mockResolvedValue('canli');
    expect(await canliDurumu()).toBe('acik');
    expect(await canliPlaniKur('[1]')).toBe(true);
    expect(mockModul.canliPlaniKur).toHaveBeenCalledWith('[1]');
    expect(await canliAyarlariniAc()).toBe('canli');
    (mockModul.canliDurumu as jest.Mock).mockResolvedValue('uydurma');
    expect(await canliDurumu()).toBe('desteklenmiyor');
  });

  test('native hata fırlatırsa yutulur', async () => {
    mockModul.canliDurumu = jest.fn().mockRejectedValue(new Error('x'));
    mockModul.canliPlaniKur = jest.fn().mockRejectedValue(new Error('x'));
    mockModul.canliAyarlariniAc = jest.fn().mockRejectedValue(new Error('x'));
    expect(await canliDurumu()).toBe('desteklenmiyor');
    expect(await canliPlaniKur('[]')).toBe(false);
    expect(await canliAyarlariniAc()).toBeNull();
  });
});
