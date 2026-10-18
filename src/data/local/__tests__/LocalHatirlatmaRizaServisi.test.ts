/**
 * Tek rıza kaydı (sade tasarım, Dalga 3): eski yüzey onayları bir kez ortak kayda
 * göç eder; okuma asla reddetmez ve hiçbir onay uydurulmaz.
 */
import { LocalHatirlatmaRizaServisi } from '../LocalHatirlatmaRizaServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

const mockStore = new Map<string, string>();
const mockYazimSayisi = { n: 0 };
jest.mock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: {
        getItem: async (k: string) => (mockStore.has(k) ? mockStore.get(k)! : null),
        setItem: async (k: string, v: string) => {
            mockYazimSayisi.n += 1;
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

const ORTAK = DEPOLAMA_ANAHTARLARI.HATIRLATMA_RIZALARI;

beforeEach(() => {
    mockStore.clear();
    mockYazimSayisi.n = 0;
});

describe('LocalHatirlatmaRizaServisi', () => {
    it('boş cihaz: onay yok, HİÇBİR ŞEY yazılmaz', async () => {
        expect(await LocalHatirlatmaRizaServisi.oku()).toEqual({});
        expect(mockStore.has(ORTAK)).toBe(false);
        expect(mockYazimSayisi.n).toBe(0);
    });

    it('eski muhafız sesli onayı ve cuma alarm onayı ortak kayda BİR KEZ taşınır; eski alanlar silinmez', async () => {
        const muhafiz = JSON.stringify({ aktif: true, sesliOnayi: true });
        const cuma = JSON.stringify({ aktif: true, alarmOnayi: true });
        mockStore.set(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI, muhafiz);
        mockStore.set(DEPOLAMA_ANAHTARLARI.CUMA_HATIRLATMA_AYARLARI, cuma);

        expect(await LocalHatirlatmaRizaServisi.oku()).toEqual({ sesliOnayi: true, alarmOnayi: true });
        expect(JSON.parse(mockStore.get(ORTAK)!)).toEqual({ sesliOnayi: true, alarmOnayi: true });
        expect(mockStore.get(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI)).toBe(muhafiz);
        expect(mockStore.get(DEPOLAMA_ANAHTARLARI.CUMA_HATIRLATMA_AYARLARI)).toBe(cuma);

        // İkinci okuma: göç idempotent, yeniden yazılmaz.
        const once = mockYazimSayisi.n;
        await LocalHatirlatmaRizaServisi.oku();
        expect(mockYazimSayisi.n).toBe(once);
    });

    it('bozuk yüzey kaydı ya da bozuk ortak kayıt onay UYDURMAZ ve okuma reddetmez', async () => {
        mockStore.set(DEPOLAMA_ANAHTARLARI.NAFILE_AYARLARI, '{kesik');
        mockStore.set(DEPOLAMA_ANAHTARLARI.YATIS_HATIRLATMA_AYARLARI, 'null');
        mockStore.set(ORTAK, '42');
        await expect(LocalHatirlatmaRizaServisi.oku()).resolves.toEqual({});
    });

    it('ver: yalnız ekler, var olan onayı korur', async () => {
        await LocalHatirlatmaRizaServisi.ver({ alarmOnayi: true });
        await LocalHatirlatmaRizaServisi.ver({ sesliOnayi: true, alarmOnayi: false });
        expect(JSON.parse(mockStore.get(ORTAK)!)).toEqual({ alarmOnayi: true, sesliOnayi: true });
    });
});
