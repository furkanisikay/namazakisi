/**
 * Tek rıza dilimi + ekran seçicisi (sade tasarım, Dalga 3).
 */
import { configureStore } from '@reduxjs/toolkit';
import hatirlatmaRizaReducer, { hatirlatmaRizalariniYukle, hatirlatmaRizasiVer } from '../hatirlatmaRizaSlice';
import { genelRizaSec } from '../../hooks/useGenelRiza';
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

const magazaKur = () => configureStore({ reducer: { hatirlatmaRiza: hatirlatmaRizaReducer } });

beforeEach(() => mockStore.clear());

describe('hatirlatmaRizaSlice', () => {
    it('açılışta eski yüzey onayını yükler (göç) ve `yuklendi` işaretler', async () => {
        mockStore.set(DEPOLAMA_ANAHTARLARI.NAFILE_AYARLARI, JSON.stringify({ sesliOnayi: true }));
        const m = magazaKur();
        expect(m.getState().hatirlatmaRiza.yuklendi).toBe(false);
        await m.dispatch(hatirlatmaRizalariniYukle());
        expect(m.getState().hatirlatmaRiza).toMatchObject({ yuklendi: true, kayit: { sesliOnayi: true } });
    });

    it('onay iyimser yazılır ve diske gider', async () => {
        const m = magazaKur();
        const vaat = m.dispatch(hatirlatmaRizasiVer({ alarmOnayi: true }));
        expect(m.getState().hatirlatmaRiza.kayit).toEqual({ alarmOnayi: true });
        await vaat;
        expect(JSON.parse(mockStore.get(DEPOLAMA_ANAHTARLARI.HATIRLATMA_RIZALARI)!)).toEqual({ alarmOnayi: true });
    });
});

describe('genelRizaSec', () => {
    it('ortak kayıt VEYA herhangi bir yüzey — dilim yoksa yalnız yüzeyler', () => {
        expect(genelRizaSec({})).toEqual({ sesli: false, alarm: false });
        expect(genelRizaSec({ takvimCakisma: { ayarlar: { alarmOnayi: true } } })).toEqual({ sesli: false, alarm: true });
        expect(genelRizaSec({ muhafiz: { sesliOnayi: true } })).toEqual({ sesli: true, alarm: false });
        expect(genelRizaSec({ hatirlatmaRiza: { kayit: { sesliOnayi: true } } })).toEqual({ sesli: true, alarm: false });
    });
});
