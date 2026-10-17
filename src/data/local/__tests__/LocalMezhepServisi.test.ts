/**
 * Ortak mezhep ayarı depolaması: açılıştaki okuma varsayılanı KALICI yazmaz;
 * yalnız seferîlik kaydındaki gerçek mezhep bir kez taşınır.
 */
import { LocalMezhepServisi } from '../LocalMezhepServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

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
    getAllKeys: async () => Array.from(mockStore.keys()),
    multiGet: async (ks: readonly string[]) => ks.map((k) => [k, mockStore.has(k) ? mockStore.get(k)! : null]),
  },
}));

jest.mock('../../../core/utils/Logger', () => ({
  Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

beforeEach(() => mockStore.clear());

describe('LocalMezhepServisi', () => {
  it('boş cihazda varsayılan Hanefî döner ama ortak ayar YAZILMAZ; sonra gelen eski seferîlik mezhebi geçerli olur', async () => {
    expect(await LocalMezhepServisi.oku()).toBe('hanefi');
    expect(mockStore.has(DEPOLAMA_ANAHTARLARI.MEZHEP_AYARI)).toBe(false);

    // Eski yedek (yalnız seferîlik mezhebi) geri yüklendi.
    mockStore.set(DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI, JSON.stringify({ mezhep: 'safii' }));
    expect(await LocalMezhepServisi.oku()).toBe('safii');
    expect(JSON.parse(mockStore.get(DEPOLAMA_ANAHTARLARI.MEZHEP_AYARI)!)).toEqual({ mezhep: 'safii' });
  });

  it('kullanıcının seçimi bilinçli olarak işaretlenir', async () => {
    await LocalMezhepServisi.yaz('safii');
    expect(JSON.parse(mockStore.get(DEPOLAMA_ANAHTARLARI.MEZHEP_AYARI)!)).toEqual({ mezhep: 'safii', secildi: true });
    expect(await LocalMezhepServisi.oku()).toBe('safii');
  });
});
