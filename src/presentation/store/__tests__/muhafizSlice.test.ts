/**
 * muhafizSlice — davranışsal testler
 *
 * Kapsanan davranışlar:
 *  - initialState (varsayılan kapalı muhafız, 'normal' preset)
 *  - muhafizAyarlariniGuncelle: payload'u merge eder + AsyncStorage'a tam JSON yazar
 *  - muhafizStateSifirla: initialState'e döner + depolama anahtarını siler
 *  - muhafizAyarlariniYukle.fulfilled: diskten okuyup eksik alanları ?? ile doldurur
 *  - muhafizAyarlariniYukle: veri yokken null -> state değişmez
 *  - muhafizAyarlariniYukle: bozuk JSON -> catch -> null -> state değişmez (asla fırlatmaz)
 */

import reducer, {
    muhafizAyarlariniGuncelle,
    muhafizStateSifirla,
    muhafizAyarlariniYukle,
    HATIRLATMA_PRESETLERI,
    MuhafizAyarlari,
} from '../muhafizSlice';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { configureStore } from '@reduxjs/toolkit';

// In-memory AsyncStorage mock (mock* öneki: jest.mock fabrikası closure dışına erişebilsin).
// Global jest.setup mock'unu kasıtlı override ediyoruz ki yazılan ham JSON'u assert edebilelim
// ve bozuk-veri (parse hatası) dalını gerçek diskten besleyebilelim.
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

// Logger'ı sustur (catch dalı Logger.error çağırıyor; test çıktısını kirletmesin).
jest.mock('../../../core/utils/Logger', () => ({
    Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const ANAHTAR = DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI;

const yeniStore = () => configureStore({ reducer: { muhafiz: reducer } });

describe('muhafizSlice', () => {
    beforeEach(() => {
        mockStore.clear();
        jest.clearAllMocks();
    });

    describe('initialState', () => {
        it('muhafız kapalı, yogunluk normal ve esik/sikliklar normal preset olmalı', () => {
            const state = yeniStore().getState().muhafiz as MuhafizAyarlari;
            expect(state.aktif).toBe(false);
            expect(state.yogunluk).toBe('normal');
            expect(state.gelismisMod).toBe(false);
            expect(state.esikler).toEqual(HATIRLATMA_PRESETLERI.normal.esikler);
            expect(state.sikliklar).toEqual(HATIRLATMA_PRESETLERI.normal.sikliklar);
        });
    });

    describe('muhafizAyarlariniGuncelle', () => {
        it('kısmi payload state ile merge edilir; dokunulmayan alanlar korunur', () => {
            const store = yeniStore();
            store.dispatch(muhafizAyarlariniGuncelle({ aktif: true, yogunluk: 'yogun' }));

            const state = store.getState().muhafiz as MuhafizAyarlari;
            expect(state.aktif).toBe(true);
            expect(state.yogunluk).toBe('yogun');
            // Payload'da olmayan alanlar değişmemeli
            expect(state.gelismisMod).toBe(false);
            expect(state.esikler).toEqual(HATIRLATMA_PRESETLERI.normal.esikler);
        });

        it('güncellenen TAM state AsyncStorage anahtarına JSON olarak yazılır', async () => {
            const store = yeniStore();
            store.dispatch(
                muhafizAyarlariniGuncelle({
                    aktif: true,
                    gelismisMod: true,
                    esikler: { seviye1: 99, seviye2: 50, seviye3: 25, seviye4: 10 },
                })
            );

            // setItem async olduğu için mikrotask kuyruğunun boşalmasını bekle
            await Promise.resolve();

            const yazilan = mockStore.get(ANAHTAR);
            expect(yazilan).toBeDefined();
            const cozulen = JSON.parse(yazilan!);
            // Disk, reducer'ın döndürdüğü tam state'i yansıtmalı (kısmi değil)
            expect(cozulen.aktif).toBe(true);
            expect(cozulen.gelismisMod).toBe(true);
            expect(cozulen.yogunluk).toBe('normal'); // dokunulmayan alan da yazılmalı
            expect(cozulen.esikler).toEqual({ seviye1: 99, seviye2: 50, seviye3: 25, seviye4: 10 });
            expect(cozulen.sikliklar).toEqual(HATIRLATMA_PRESETLERI.normal.sikliklar);
        });

        it('ardışık güncellemeler birikerek uygulanır (son state önceki değişikliği korur)', () => {
            const store = yeniStore();
            store.dispatch(muhafizAyarlariniGuncelle({ aktif: true }));
            store.dispatch(muhafizAyarlariniGuncelle({ gelismisMod: true }));

            const state = store.getState().muhafiz as MuhafizAyarlari;
            expect(state.aktif).toBe(true); // ilk güncelleme kaybolmamalı
            expect(state.gelismisMod).toBe(true);
        });
    });

    describe('muhafizStateSifirla', () => {
        it('state initialState değerlerine döner', () => {
            const store = yeniStore();
            store.dispatch(muhafizAyarlariniGuncelle({ aktif: true, yogunluk: 'yogun', gelismisMod: true }));

            store.dispatch(muhafizStateSifirla());

            const state = store.getState().muhafiz as MuhafizAyarlari;
            expect(state.aktif).toBe(false);
            expect(state.yogunluk).toBe('normal');
            expect(state.gelismisMod).toBe(false);
            expect(state.esikler).toEqual(HATIRLATMA_PRESETLERI.normal.esikler);
        });

        it('depolama anahtarı silinir (kalıcı ayar temizlenir)', async () => {
            const store = yeniStore();
            store.dispatch(muhafizAyarlariniGuncelle({ aktif: true }));
            await Promise.resolve();
            expect(mockStore.has(ANAHTAR)).toBe(true);

            store.dispatch(muhafizStateSifirla());
            await Promise.resolve();

            expect(mockStore.has(ANAHTAR)).toBe(false);
        });
    });

    describe('muhafizAyarlariniYukle (thunk)', () => {
        it('fulfilled: diskteki tam ayarlar state e merge edilir', async () => {
            const kayitli: MuhafizAyarlari = {
                aktif: true,
                yogunluk: 'hafif',
                gelismisMod: true,
                esikler: { seviye1: 11, seviye2: 9, seviye3: 4, seviye4: 1 },
                sikliklar: { seviye1: 12, seviye2: 6, seviye3: 3, seviye4: 1 },
            };
            mockStore.set(ANAHTAR, JSON.stringify(kayitli));

            const store = yeniStore();
            const sonuc = await store.dispatch(muhafizAyarlariniYukle());

            expect(sonuc.type).toBe('muhafiz/yukle/fulfilled');
            const state = store.getState().muhafiz as MuhafizAyarlari;
            expect(state).toEqual(kayitli);
        });

        it('fulfilled: eksik alanlar ?? ile initialState varsayılanından doldurulur', async () => {
            // Diskte yalnızca 'gelismisMod' var; diğer TÜM alanlar (aktif dahil) varsayılana
            // düşmeli — her bir alanın ?? sol-tarafı null/undefined dalını kapsar.
            mockStore.set(ANAHTAR, JSON.stringify({ gelismisMod: true }));

            const store = yeniStore();
            await store.dispatch(muhafizAyarlariniYukle());

            const state = store.getState().muhafiz as MuhafizAyarlari;
            expect(state.gelismisMod).toBe(true); // diskten gelen
            expect(state.aktif).toBe(false); // varsayılan (aktif eksik -> ?? sağ taraf)
            expect(state.yogunluk).toBe('normal'); // varsayılan
            expect(state.esikler).toEqual(HATIRLATMA_PRESETLERI.normal.esikler); // varsayılan
            expect(state.sikliklar).toEqual(HATIRLATMA_PRESETLERI.normal.sikliklar); // varsayılan
        });

        it('fulfilled: aktif=false diskte olsa bile ?? ile EZİLMEZ (yanlış-pozitif null guard)', async () => {
            // ?? operatörü yalnız null/undefined'da varsayılana düşer; false korunmalı.
            // Store'u açıp aktif=true yapalım, sonra diskteki false'u yükleyip ezildiğini doğrulayalım.
            const store = yeniStore();
            store.dispatch(muhafizAyarlariniGuncelle({ aktif: true }));
            await Promise.resolve();
            // guncelle aynı anahtara yazdı; fixture'ı SONRA koy ki thunk false okusun.
            mockStore.set(ANAHTAR, JSON.stringify({ aktif: false, yogunluk: 'yogun' }));

            await store.dispatch(muhafizAyarlariniYukle());

            const state = store.getState().muhafiz as MuhafizAyarlari;
            expect(state.aktif).toBe(false); // disk değeri false, ?? ile true'ya kaçmamalı
            expect(state.yogunluk).toBe('yogun');
        });

        it('veri yoksa null döner ve fulfilled state i DEĞİŞTİRMEZ', async () => {
            const store = yeniStore();
            // Önce bilinen bir değişiklik yap, yükleme bunu bozmamalı
            store.dispatch(muhafizAyarlariniGuncelle({ aktif: true, yogunluk: 'hafif' }));
            await Promise.resolve();
            // guncelle anahtara yazdı; "veri yok" senaryosu için anahtarı temizle.
            mockStore.delete(ANAHTAR);

            const sonuc = await store.dispatch(muhafizAyarlariniYukle());

            expect(sonuc.type).toBe('muhafiz/yukle/fulfilled');
            expect(sonuc.payload).toBeNull();
            const state = store.getState().muhafiz as MuhafizAyarlari;
            // Yükleme null döndü → fulfilled reducer no-op → mevcut state korunur
            expect(state.aktif).toBe(true);
            expect(state.yogunluk).toBe('hafif');
        });

        it('bozuk JSON varsa fırlatmaz; catch null döndürür ve state korunur', async () => {
            const store = yeniStore();
            store.dispatch(muhafizAyarlariniGuncelle({ aktif: true }));
            await Promise.resolve();
            // guncelle geçerli JSON yazdı; bozuk veriyi SONRA koy ki parse hatası dalı tetiklensin.
            mockStore.set(ANAHTAR, '{bozuk-json::');

            const sonuc = await store.dispatch(muhafizAyarlariniYukle());

            // Thunk reject DEĞİL fulfilled(null) olmalı (try/catch içinde yutulur)
            expect(sonuc.type).toBe('muhafiz/yukle/fulfilled');
            expect(sonuc.payload).toBeNull();
            const state = store.getState().muhafiz as MuhafizAyarlari;
            expect(state.aktif).toBe(true); // bozuk veri mevcut state'i bozmamalı
        });
    });
});
