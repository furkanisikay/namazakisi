/**
 * Depolama - merkezi depolama katmani testleri
 * Anahtar-bazli atomik yazma kuyrugu (lost-update korumasi) + onEk/coklu yardimcilar.
 */

import { Depolama } from '../Depolama';

// In-memory AsyncStorage mock (mock* on eki: jest.mock fabrikasi erisebilsin)
const mockStore = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: async (k: string) => (mockStore.has(k) ? mockStore.get(k)! : null),
    setItem: async (k: string, v: string) => { mockStore.set(k, v); },
    removeItem: async (k: string) => { mockStore.delete(k); },
    getAllKeys: async () => Array.from(mockStore.keys()),
    multiGet: async (ks: string[]) => ks.map((k) => [k, mockStore.has(k) ? mockStore.get(k)! : null]),
    multiRemove: async (ks: string[]) => { ks.forEach((k) => mockStore.delete(k)); },
  },
}));

describe('Depolama', () => {
  beforeEach(() => {
    mockStore.clear();
  });

  test('yaz/oku round-trip (nesne JSON)', async () => {
    await Depolama.yaz('k', { a: 1, b: 'x' });
    expect(await Depolama.oku<{ a: number; b: string }>('k')).toEqual({ a: 1, b: 'x' });
  });

  test('olmayan anahtar null doner', async () => {
    expect(await Depolama.oku('yok')).toBeNull();
  });

  test('bozuk JSON null doner (crash etmez)', async () => {
    await Depolama.hamYaz('bozuk', '{bu json degil');
    expect(await Depolama.oku('bozuk')).toBeNull();
  });

  test('guncelle ATOMIK: ayni anahtara eszamanli RMW lost-update yapmaz', async () => {
    // 5 eszamanli artirim -> kuyruk serilestirirse 5 olur; ezme olsaydi <5 olurdu.
    await Promise.all(
      Array.from({ length: 5 }, () =>
        Depolama.guncelle<number>('sayac', (m) => (m ?? 0) + 1)
      )
    );
    expect(await Depolama.oku<number>('sayac')).toBe(5);
  });

  test('onEkiOlanAnahtarlar yalniz on-ekli anahtarlari doner', async () => {
    await Depolama.yaz('namaz_2026-06-14', { sabah: true });
    await Depolama.yaz('namaz_2026-06-13', { sabah: false });
    await Depolama.yaz('ayarlar', { x: 1 });
    const anahtarlar = (await Depolama.onEkiOlanAnahtarlar('namaz_')).sort();
    expect(anahtarlar).toEqual(['namaz_2026-06-13', 'namaz_2026-06-14']);
  });

  test('cogunuOku ve cogunuSil', async () => {
    await Depolama.yaz('a', 1);
    await Depolama.yaz('b', 2);
    const okunan = await Depolama.cogunuOku(['a', 'b', 'yok']);
    expect(okunan).toEqual([['a', '1'], ['b', '2'], ['yok', null]]);

    await Depolama.cogunuSil(['a', 'b']);
    expect(await Depolama.oku('a')).toBeNull();
    expect(await Depolama.oku('b')).toBeNull();
  });

  test('sil anahtari kaldirir', async () => {
    await Depolama.yaz('k', 1);
    await Depolama.sil('k');
    expect(await Depolama.oku('k')).toBeNull();
  });
});
