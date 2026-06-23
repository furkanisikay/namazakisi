/**
 * LocalKazaServisi — kaza durumu okuma DAYANIKLILIK testleri
 *
 * Yaşanmış bug: diskteki KAZA_DURUMU bozuk/beklenmedik biçimdeyse (örn. "null",
 * kesik JSON, nesne-dışı) localKazaDurumunuGetir {basarili:false} dönüyordu →
 * kazaVerileriniYukle thunk'ı reddediliyor → KazaDefteriSayfasi'nda kazaDurumu
 * null kalıp sonsuz "Yükleniyor..." gösteriliyordu (kullanıcıya hata da göstermeden).
 * Okuma ASLA kilitlenmemeli: bozuk veride boş (kullanılabilir) durumla başarılı dönmeli.
 */

import { localKazaDurumunuGetir } from '../LocalKazaServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

// In-memory AsyncStorage mock (mock* öneki: jest.mock fabrikası erişebilsin)
const mockStore = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: async (k: string) => (mockStore.has(k) ? mockStore.get(k)! : null),
    setItem: async (k: string, v: string) => {
      mockStore.set(k, v);
    },
    removeItem: async (k: string) => {
      mockStore.delete(k);
    },
  },
}));

// Logger'ı sustur (AsyncStorage/timer yan etkisi testi kirletmesin)
jest.mock('../../../core/utils/Logger', () => ({
  Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const KEY = DEPOLAMA_ANAHTARLARI.KAZA_DURUMU;

describe('LocalKazaServisi.localKazaDurumunuGetir — bozuk veri dayanıklılığı', () => {
  beforeEach(() => mockStore.clear());

  test('veri yokken boş kaza durumu ile başarılı döner', async () => {
    const y = await localKazaDurumunuGetir();
    expect(y.basarili).toBe(true);
    expect(y.veri?.namazlar.length).toBeGreaterThan(0);
  });

  test('geçerli kaza verisi normal okunur', async () => {
    mockStore.set(
      KEY,
      JSON.stringify({
        namazlar: [{ namazAdi: 'Sabah', toplamBorc: 5, kalanBorc: 3, tamamlanan: 2 }],
        toplamKalan: 3,
        toplamTamamlanan: 2,
        gunlukHedef: 5,
        gunlukTamamlanan: 0,
        gunlukHedefTarihi: '2026-01-01',
        toplamGizleMi: false,
        guncellemeTarihi: '2026-01-01',
      })
    );
    const y = await localKazaDurumunuGetir();
    expect(y.basarili).toBe(true);
    expect(y.veri?.namazlar.find((n) => n.namazAdi === 'Sabah')?.kalanBorc).toBe(3);
  });

  // ---- BUG REPRODÜKSİYONU: aşağıdakiler mevcut kodda {basarili:false} döner → sayfa kilitlenir ----

  test('KAZA_DURUMU "null" iken KİLİTLENMEZ, boş durumla başarılı döner', async () => {
    mockStore.set(KEY, 'null'); // JSON.parse('null') === null → .namazlar erişimi patlar
    const y = await localKazaDurumunuGetir();
    expect(y.basarili).toBe(true);
    expect(y.veri?.namazlar.length).toBeGreaterThan(0);
  });

  test('KAZA_DURUMU kesik/bozuk JSON iken KİLİTLENMEZ', async () => {
    mockStore.set(KEY, '{"namazlar":[{"namazAdi":"Sab'); // SyntaxError
    const y = await localKazaDurumunuGetir();
    expect(y.basarili).toBe(true);
    expect(y.veri?.namazlar.length).toBeGreaterThan(0);
  });

  test.each(['42', '"merhaba"', '[1,2,3]'])(
    'KAZA_DURUMU nesne-dışı (%s) iken KİLİTLENMEZ',
    async (bozuk) => {
      mockStore.set(KEY, bozuk);
      const y = await localKazaDurumunuGetir();
      expect(y.basarili).toBe(true);
      expect(y.veri?.namazlar.length).toBeGreaterThan(0);
    }
  );
});
