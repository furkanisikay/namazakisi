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
    matrisiGuncelle,
    ozelMatrisYedegiGuncelle,
    ozelYogunluguGeriYukle,
    HATIRLATMA_PRESETLERI,
    presetAyarlariniOlustur,
    MuhafizAyarlari,
} from '../muhafizSlice';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { configureStore } from '@reduxjs/toolkit';
import { eskidenMatriseGoc } from '../../../core/muhafiz/muhafizGoc';
import { MUHAFIZ_VAKITLERI, SEVIYE_KADEMELERI } from '../../../core/muhafiz/matrisTipleri';
import type { MuhafizMatrisi } from '../../../core/muhafiz/matrisTipleri';
import { presetMatrisiOlustur, presetSesliIceriyorMu } from '../../../core/muhafiz/matrisIslemleri';
import { vakitUyariPlaniOlustur } from '../../../core/muhafiz/motorAdaptoru';

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
            // `presetGocuYapildi` VAR → bir kerelik preset göçü devreye girmez, bu test
            // saf merge davranışını ölçer (göçün kendisi ayrı describe'ta test edilir).
            const kayitli: MuhafizAyarlari = {
                aktif: true,
                yogunluk: 'hafif',
                gelismisMod: true,
                esikler: { seviye1: 11, seviye2: 9, seviye3: 4, seviye4: 1 },
                sikliklar: { seviye1: 12, seviye2: 6, seviye3: 3, seviye4: 1 },
                presetGocuYapildi: true,
            };
            mockStore.set(ANAHTAR, JSON.stringify(kayitli));

            const store = yeniStore();
            const sonuc = await store.dispatch(muhafizAyarlariniYukle());

            expect(sonuc.type).toBe('muhafiz/yukle/fulfilled');
            const state = store.getState().muhafiz as MuhafizAyarlari;
            expect(state).toEqual({ ...kayitli, matris: eskidenMatriseGoc(kayitli) });
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

const bosMatris = (): MuhafizMatrisi =>
    MUHAFIZ_VAKITLERI.reduce((a, v) => ({ ...a, [v]: { seviyeler: [] } }), {}) as MuhafizMatrisi;

describe('muhafizSlice matris', () => {
    test('initialState taze kurulumda dolu bir matris içerir', () => {
        const bas = reducer(undefined, { type: '@@INIT' });
        expect(bas.matris).toBeDefined();
        expect(Object.keys(bas.matris!).sort()).toEqual([...MUHAFIZ_VAKITLERI].sort());
    });
    test('matrisiGuncelle matrisi yazar, eski alanları bozmaz', () => {
        const bas = reducer(undefined, { type: '@@INIT' });
        const sonra = reducer(bas, matrisiGuncelle(bosMatris()));
        expect(sonra.matris!.imsak.seviyeler).toEqual([]);
        expect(sonra.esikler).toEqual(bas.esikler);   // eski alan korundu
        expect(sonra.yogunluk).toEqual(bas.yogunluk); // yogunluk'a dokunulmadı
    });
    test('muhafizAyarlariniGuncelle: esik/sıklık değişince matris senkronlanır (bayatlamaz)', () => {
        const bas = reducer(undefined, { type: '@@INIT' });
        const sonra = reducer(bas, muhafizAyarlariniGuncelle({
            yogunluk: 'yogun',
            esikler: { seviye1: 60, seviye2: 30, seviye3: 15, seviye4: 5 },
            sikliklar: { seviye1: 10, seviye2: 5, seviye3: 3, seviye4: 1 },
        }));
        // matris yeni eşiklerden türetilmeli — initialState 'Normal' değerlerinde KALMAMALI
        expect(sonra.matris!.imsak.seviyeler[0].esikDk).toBe(60); // nazik
        expect(sonra.matris!.imsak.seviyeler[3].esikDk).toBe(5);  // acil
    });
    test('muhafizAyarlariniGuncelle: matris payload gelince eski-alan senkronu onu EZMEZ', () => {
        const bas = reducer(undefined, { type: '@@INIT' });
        const sonra = reducer(bas, muhafizAyarlariniGuncelle({
            esikler: { seviye1: 60, seviye2: 30, seviye3: 15, seviye4: 5 },
            matris: bosMatris(),
        }));
        expect(sonra.matris!.imsak.seviyeler).toEqual([]); // payload matris korundu
    });
});

describe('muhafizAyarlariniYukle matris [M2]', () => {
    test('diskte matris VARSA migrasyon çalışmaz, mevcut matris korunur', async () => {
        const ozelMatris = bosMatris();
        // Bayrak VAR → preset göçü karışmaz; test yalnız M2 (matris türetme) davranışını ölçer.
        mockStore.set(
            ANAHTAR,
            JSON.stringify({ aktif: true, matris: ozelMatris, presetGocuYapildi: true })
        );
        const store = yeniStore();
        await store.dispatch(muhafizAyarlariniYukle());
        const state = store.getState().muhafiz;
        expect(state.matris).toEqual(ozelMatris); // türetilmedi, korundu
    });
});

describe('muhafizSlice ozelMatrisYedegi (özel yoğunluk hatırlama)', () => {
    test('initialState yedek içermez', () => {
        const bas = reducer(undefined, { type: '@@INIT' });
        expect(bas.ozelMatrisYedegi).toBeUndefined();
    });

    test('ozelMatrisYedegiGuncelle yedeği yazar, matrisi/yoğunluğu değiştirmez', () => {
        const bas = reducer(undefined, { type: '@@INIT' });
        const yedek = bosMatris();
        const sonra = reducer(bas, ozelMatrisYedegiGuncelle(yedek));

        expect(sonra.ozelMatrisYedegi).toEqual(yedek);
        expect(sonra.matris).toEqual(bas.matris); // aktif matrise dokunulmadı
        expect(sonra.yogunluk).toBe(bas.yogunluk); // yoğunluğa dokunulmadı
    });

    test('ozelMatrisYedegiGuncelle TAM state AsyncStorage anahtarına yazılır', async () => {
        const store = yeniStore();
        const yedek = bosMatris();
        store.dispatch(ozelMatrisYedegiGuncelle(yedek));
        await Promise.resolve();

        const yazilan = JSON.parse(mockStore.get(ANAHTAR)!);
        expect(yazilan.ozelMatrisYedegi).toEqual(yedek);
    });

    test('ozelMatrisYedegiGuncelle çağrıldıkça en son hâli tutar (üzerine yazar)', () => {
        const bas = reducer(undefined, { type: '@@INIT' });
        const ilkYedek = bosMatris();
        const sonrakiYedek = { ...bosMatris(), imsak: { seviyeler: [] } };
        let state = reducer(bas, ozelMatrisYedegiGuncelle(ilkYedek));
        state = reducer(state, ozelMatrisYedegiGuncelle(sonrakiYedek));

        expect(state.ozelMatrisYedegi).toEqual(sonrakiYedek);
    });

    test('ozelYogunluguGeriYukle yedek yoksa no-op (state değişmez)', () => {
        const bas = reducer(undefined, { type: '@@INIT' });
        const sonra = reducer(bas, ozelYogunluguGeriYukle());

        expect(sonra).toEqual(bas);
        expect(sonra.yogunluk).toBe('normal');
    });

    test('ozelYogunluguGeriYukle yedek varsa matrisi geri yükler ve yoğunluğu "ozel" yapar', () => {
        const bas = reducer(undefined, { type: '@@INIT' });
        const yedek = bosMatris();
        let state = reducer(bas, ozelMatrisYedegiGuncelle(yedek));
        // Araya bir preset uygulanmış gibi matris/yoğunluk değişsin
        state = reducer(state, muhafizAyarlariniGuncelle({ yogunluk: 'yogun' }));

        state = reducer(state, ozelYogunluguGeriYukle());

        expect(state.yogunluk).toBe('ozel');
        expect(state.matris).toEqual(yedek);
        // Yedek kendisi silinmez — tekrar preset'e geçilirse yine kullanılabilir
        expect(state.ozelMatrisYedegi).toEqual(yedek);
    });

    test('ozelYogunluguGeriYukle TAM state AsyncStorage anahtarına yazılır', async () => {
        const store = yeniStore();
        const yedek = bosMatris();
        store.dispatch(ozelMatrisYedegiGuncelle(yedek));
        await Promise.resolve();

        store.dispatch(ozelYogunluguGeriYukle());
        await Promise.resolve();

        const yazilan = JSON.parse(mockStore.get(ANAHTAR)!);
        expect(yazilan.yogunluk).toBe('ozel');
        expect(yazilan.matris).toEqual(yedek);
    });

    test('muhafizAyarlariniYukle: diskteki ozelMatrisYedegi state e yüklenir (uygulama yeniden açılınca kaybolmaz)', async () => {
        const yedek = bosMatris();
        mockStore.set(
            ANAHTAR,
            JSON.stringify({ aktif: true, yogunluk: 'normal', ozelMatrisYedegi: yedek })
        );
        const store = yeniStore();
        await store.dispatch(muhafizAyarlariniYukle());

        const state = store.getState().muhafiz as MuhafizAyarlari;
        expect(state.ozelMatrisYedegi).toEqual(yedek);
    });

    test('muhafizAyarlariniYukle: diskte ozelMatrisYedegi yoksa undefined kalır (buton gizli kalır)', async () => {
        mockStore.set(ANAHTAR, JSON.stringify({ aktif: true, yogunluk: 'normal' }));
        const store = yeniStore();
        await store.dispatch(muhafizAyarlariniYukle());

        const state = store.getState().muhafiz as MuhafizAyarlari;
        expect(state.ozelMatrisYedegi).toBeUndefined();
    });
});

describe('muhafizSlice sesliOnayi (sesli anons tek seferlik onayı)', () => {
    test('initialState onay içermez — taze kurulumda sesli hücre açılmaz', () => {
        const bas = reducer(undefined, { type: '@@INIT' });
        expect(bas.sesliOnayi).toBeUndefined();
        for (const v of MUHAFIZ_VAKITLERI) {
            expect(bas.matris![v].seviyeler.every((s) => s.mod === 'bildirim')).toBe(true);
        }
    });

    test('muhafizAyarlariniGuncelle onayı yazar ve diske kaydeder', async () => {
        const store = yeniStore();
        store.dispatch(muhafizAyarlariniGuncelle({ yogunluk: 'normal', sesliOnayi: true }));
        await Promise.resolve();

        expect((store.getState().muhafiz as MuhafizAyarlari).sesliOnayi).toBe(true);
        expect(JSON.parse(mockStore.get(ANAHTAR)!).sesliOnayi).toBe(true);
    });

    test('KALICILIK: onay uygulama yeniden açılınca kaybolmaz', async () => {
        // Tuzak: thunk'ın `temel` nesnesi opsiyonel alanları taşımazsa diske yazılan
        // onay sessizce kaybolur ve kullanıcıya modal TEKRAR gösterilirdi.
        mockStore.set(ANAHTAR, JSON.stringify({ aktif: true, yogunluk: 'yogun', sesliOnayi: true }));
        const store = yeniStore();
        await store.dispatch(muhafizAyarlariniYukle());

        expect((store.getState().muhafiz as MuhafizAyarlari).sesliOnayi).toBe(true);
    });

    test('diskte onay yoksa undefined kalır (modal yine sorulur)', async () => {
        mockStore.set(ANAHTAR, JSON.stringify({ aktif: true, yogunluk: 'normal' }));
        const store = yeniStore();
        await store.dispatch(muhafizAyarlariniYukle());

        expect((store.getState().muhafiz as MuhafizAyarlari).sesliOnayi).toBeUndefined();
    });
});

/**
 * Preset'lerin ÜRETTİĞİ uyari sayilari — motorun kendi plan fonksiyonuyla ölçülür,
 * yani burada doğrulanan sayı arka planın gerçekten göndereceği sayıdır.
 * Etkisiz tekrarı kesmenin nöbetçisi: yoğun eskiden 15/vakit üretiyordu.
 */
describe('HATIRLATMA_PRESETLERI — üretilen uyarı sayıları', () => {
    const TARAMA_SINIRI_DK = 24 * 60;

    const plan = (yogunluk: 'hafif' | 'normal' | 'yogun') => {
        const matris = presetMatrisiOlustur(HATIRLATMA_PRESETLERI[yogunluk].seviyeler, true);
        return vakitUyariPlaniOlustur(matris.ogle, TARAMA_SINIRI_DK);
    };

    test.each([
        ['hafif', 4, 0],
        ['normal', 6, 1],
        ['yogun', 7, 2],
    ] as const)('%s: %i bildirim, %i sesli anons (vakit başına)', (yogunluk, toplam, sesli) => {
        const adimlar = plan(yogunluk);
        expect(adimlar).toHaveLength(toplam);
        expect(adimlar.filter((a) => a.sesliAnons)).toHaveLength(sesli);
    });

    test('yoğun preset vakit başına 8 uyarıyı AŞMAZ (tekrar körleşmesi sınırı)', () => {
        expect(plan('yogun').length).toBeLessThanOrEqual(8);
    });

    test('hafif KASTEN sessizdir — sesli anons içermez', () => {
        expect(presetSesliIceriyorMu(HATIRLATMA_PRESETLERI.hafif.seviyeler)).toBe(false);
        expect(presetSesliIceriyorMu(HATIRLATMA_PRESETLERI.normal.seviyeler)).toBe(true);
        expect(presetSesliIceriyorMu(HATIRLATMA_PRESETLERI.yogun.seviyeler)).toBe(true);
    });

    test("sesli adımlar 'sesli' değil 'ikisi' kullanır (TTS susarsa görsel iz kalsın)", () => {
        for (const yogunluk of ['normal', 'yogun'] as const) {
            const seviyeler = HATIRLATMA_PRESETLERI[yogunluk].seviyeler;
            for (const kademe of SEVIYE_KADEMELERI) {
                expect(seviyeler[kademe].mod).not.toBe('sesli');
            }
            expect(seviyeler.acil.mod).toBe('ikisi');
        }
    });

    test('eşikler kesin azalan sıradadır (nazik → acil)', () => {
        for (const yogunluk of ['hafif', 'normal', 'yogun'] as const) {
            const s = HATIRLATMA_PRESETLERI[yogunluk].seviyeler;
            const esikler = SEVIYE_KADEMELERI.map((k) => s[k].esikDk);
            for (let i = 1; i < esikler.length; i++) {
                expect(esikler[i]).toBeLessThan(esikler[i - 1]);
            }
        }
    });

    test('yoğun preset acil adımı alarm sesiyle acil kanala düşer', () => {
        expect(HATIRLATMA_PRESETLERI.yogun.seviyeler.acil.bildirimSesi).toBe('alarm');
        expect(HATIRLATMA_PRESETLERI.normal.seviyeler.acil.bildirimSesi).not.toBe('alarm');
    });

    test("eski `sikliklar` alanı 'birkez'i eşiğe eşitleyerek türetilir", () => {
        // Eski şemada 'birkez' yok; esik === siklik eski motorda da tek atış demek.
        expect(HATIRLATMA_PRESETLERI.hafif.sikliklar).toEqual({
            seviye1: 30, seviye2: 10, seviye3: 5, seviye4: 2,
        });
        expect(HATIRLATMA_PRESETLERI.normal.sikliklar).toEqual({
            seviye1: 45, seviye2: 10, seviye3: 5, seviye4: 3,
        });
        expect(HATIRLATMA_PRESETLERI.yogun.sikliklar).toEqual({
            seviye1: 60, seviye2: 10, seviye3: 5, seviye4: 3,
        });
    });
});

/**
 * Kurulum sihirbazı yolu — sesli preset'in sihirbazdan geçince ÖLMEDİĞİNİN nöbetçisi.
 * Eski yol preset'i yalnız `esikler`/`sikliklar` olarak yazıyordu; matris reducer
 * içinde `eskidenMatriseGoc` ile türetiliyor ve mod DAİMA 'bildirim' oluyordu.
 */
describe('presetAyarlariniOlustur (sihirbaz yolu)', () => {
    test('sesli preset matrisi MOD ile birlikte üretir + onayı işaretler', () => {
        const ayar = presetAyarlariniOlustur('yogun');
        for (const v of MUHAFIZ_VAKITLERI) {
            expect(ayar.matris![v].seviyeler[3].mod).toBe('ikisi');
            expect(ayar.matris![v].seviyeler[3].anonsMetni).not.toBe('');
        }
        expect(ayar.sesliOnayi).toBe(true);
        expect(ayar.esikler).toEqual(HATIRLATMA_PRESETLERI.yogun.esikler);
    });

    test('hafif preset sessiz kalır ve onay işaretlemez', () => {
        const ayar = presetAyarlariniOlustur('hafif');
        for (const v of MUHAFIZ_VAKITLERI) {
            expect(ayar.matris![v].seviyeler.every((s) => s.mod === 'bildirim')).toBe(true);
        }
        expect(ayar.sesliOnayi).toBeUndefined();
    });

    test('REGRESYON: reducer eski-alan senkronu sihirbazın modunu EZMEZ', () => {
        // Payload'da matris geldiği için `eskidenMatriseGoc` yeniden türetme yapmamalı.
        const bas = reducer(undefined, { type: '@@INIT' });
        const sonra = reducer(bas, muhafizAyarlariniGuncelle({
            aktif: true,
            yogunluk: 'normal',
            ...presetAyarlariniOlustur('normal'),
        }));

        expect(sonra.matris!.imsak.seviyeler[3].mod).toBe('ikisi');
        expect(sonra.matris!.imsak.seviyeler[3].esikDk).toBe(3);
        expect(sonra.sesliOnayi).toBe(true);
    });
});

/**
 * Bir kerelik preset göçü — "tekrar azaltma herkese ulaşır, ses rızaya bağlı kalır".
 *
 * Göç olmasaydı yeni preset'lerin ASIL kazancı (yoğun 15 → 7 uyarı/vakit) mevcut
 * kullanıcıların hiçbirine ulaşmaz, herkes yoğunluk butonuna yeniden dokunana kadar
 * günde 75 bildirim almaya devam ederdi.
 */
describe('preset göçü (bir kerelik, iki kapılı)', () => {
    const TARAMA_SINIRI_DK = 24 * 60;

    /** Eski (göç öncesi) yoğun preset'iyle yazılmış bir disk kaydı. */
    const ESKI_YOGUN_ESIKLER = { seviye1: 60, seviye2: 30, seviye3: 15, seviye4: 5 };
    const ESKI_YOGUN_SIKLIKLAR = { seviye1: 10, seviye2: 5, seviye3: 3, seviye4: 1 };

    const eskiKayitYaz = (ustyaz: Record<string, unknown> = {}) => {
        const eski = {
            aktif: true,
            yogunluk: 'yogun',
            gelismisMod: false,
            esikler: ESKI_YOGUN_ESIKLER,
            sikliklar: ESKI_YOGUN_SIKLIKLAR,
            matris: eskidenMatriseGoc({ esikler: ESKI_YOGUN_ESIKLER, sikliklar: ESKI_YOGUN_SIKLIKLAR }),
            // presetGocuYapildi YOK — göçe girecek eski kayıt
            ...ustyaz,
        };
        mockStore.set(ANAHTAR, JSON.stringify(eski));
        return eski;
    };

    const uyariSayisi = (matris: MuhafizMatrisi) =>
        vakitUyariPlaniOlustur(matris.ogle, TARAMA_SINIRI_DK);

    it('göç ÖNCESİ eski yoğun kayıt gerçekten 15 uyarı/vakit üretiyordu (kontrol)', () => {
        const eskiMatris = eskidenMatriseGoc({
            esikler: ESKI_YOGUN_ESIKLER,
            sikliklar: ESKI_YOGUN_SIKLIKLAR,
        });
        expect(uyariSayisi(eskiMatris)).toHaveLength(15);
    });

    it('KAZANÇ: göç sonrası yoğun kullanıcı 7 uyarı/vakit alır', async () => {
        eskiKayitYaz();
        const store = yeniStore();
        await store.dispatch(muhafizAyarlariniYukle());

        const state = store.getState().muhafiz as MuhafizAyarlari;
        expect(uyariSayisi(state.matris!)).toHaveLength(7);
        expect(state.matris!.ogle.seviyeler.map((s) => s.esikDk)).toEqual([60, 30, 15, 6]);
    });

    it('KAPI 2: onay yokken sesli hücreler bildirime düşer — göç rıza yerine geçmez', async () => {
        eskiKayitYaz(); // sesliOnayi YOK
        const store = yeniStore();
        await store.dispatch(muhafizAyarlariniYukle());

        const state = store.getState().muhafiz as MuhafizAyarlari;
        for (const v of MUHAFIZ_VAKITLERI) {
            expect(state.matris![v].seviyeler.every((s) => s.mod === 'bildirim')).toBe(true);
        }
        expect(uyariSayisi(state.matris!).filter((a) => a.sesliAnons)).toHaveLength(0);
        // Onay uydurulmaz
        expect(state.sesliOnayi).toBeUndefined();
    });

    it('onay ZATEN verilmişse göç sesli hücreleri açar', async () => {
        eskiKayitYaz({ sesliOnayi: true });
        const store = yeniStore();
        await store.dispatch(muhafizAyarlariniYukle());

        const state = store.getState().muhafiz as MuhafizAyarlari;
        expect(state.matris!.ogle.seviyeler[3].mod).toBe('ikisi');
        expect(uyariSayisi(state.matris!).filter((a) => a.sesliAnons)).toHaveLength(2);
    });

    it('KAPI 1: ozel yogunluktaki kullanicinin matrisi BIRE BIR korunur', async () => {
        const ozelMatris = eskidenMatriseGoc({
            esikler: { seviye1: 77, seviye2: 33, seviye3: 12, seviye4: 4 },
            sikliklar: { seviye1: 11, seviye2: 6, seviye3: 2, seviye4: 1 },
        });
        ozelMatris.ikindi.seviyeler[0].mod = 'sessiz';
        ozelMatris.aksam.seviyeler[2].bildirimSesi = 'melodi';
        eskiKayitYaz({ yogunluk: 'ozel', matris: ozelMatris });

        const store = yeniStore();
        await store.dispatch(muhafizAyarlariniYukle());

        const state = store.getState().muhafiz as MuhafizAyarlari;
        expect(state.matris).toEqual(ozelMatris); // tek bir hücre bile değişmedi
        expect(state.yogunluk).toBe('ozel');
        // Bayrak yine de işaretlenir → her açılışta yeniden denenmez
        expect(state.presetGocuYapildi).toBe(true);
    });

    it('kullanıcının anons metni göçte korunur', async () => {
        const matris = eskidenMatriseGoc({
            esikler: ESKI_YOGUN_ESIKLER,
            sikliklar: ESKI_YOGUN_SIKLIKLAR,
        });
        for (const v of MUHAFIZ_VAKITLERI) {
            matris[v].seviyeler[3].anonsMetni = 'Kalk, {vakit} namazına {süre} dakika.';
        }
        eskiKayitYaz({ sesliOnayi: true, matris });

        const store = yeniStore();
        await store.dispatch(muhafizAyarlariniYukle());

        const state = store.getState().muhafiz as MuhafizAyarlari;
        expect(state.matris!.ogle.seviyeler[3].anonsMetni).toBe('Kalk, {vakit} namazına {süre} dakika.');
    });

    it('göç BİR KEZ çalışır: ikinci yüklemede elle değişiklik geri alınmaz', async () => {
        eskiKayitYaz();
        const store = yeniStore();
        await store.dispatch(muhafizAyarlariniYukle());

        // Kullanıcı bir adımı elle susturur (mod zamanlama ekseni değil → yoğunluk 'yogun' kalır)
        const elle = JSON.parse(JSON.stringify(store.getState().muhafiz.matris)) as MuhafizMatrisi;
        elle.ogle.seviyeler[0].mod = 'sessiz';
        store.dispatch(matrisiGuncelle(elle));
        await Promise.resolve();

        // Uygulama yeniden açılır
        const store2 = yeniStore();
        await store2.dispatch(muhafizAyarlariniYukle());

        expect((store2.getState().muhafiz as MuhafizAyarlari).matris!.ogle.seviyeler[0].mod).toBe('sessiz');
    });

    it('KALICILIK: bayrak diske yazılır ve yeniden açılışta korunur', async () => {
        eskiKayitYaz();
        const store = yeniStore();
        await store.dispatch(muhafizAyarlariniYukle());

        // Göç, ek bir dispatch beklemeden bayrağı ANINDA diske yazmalı
        expect(JSON.parse(mockStore.get(ANAHTAR)!).presetGocuYapildi).toBe(true);

        const store2 = yeniStore();
        await store2.dispatch(muhafizAyarlariniYukle());
        expect((store2.getState().muhafiz as MuhafizAyarlari).presetGocuYapildi).toBe(true);
    });

    it('bayrağı OLAN kayıt göçe girmez ve diske gereksiz yazma yapılmaz', async () => {
        const kayitli = eskiKayitYaz({ presetGocuYapildi: true });
        const oncekiJson = mockStore.get(ANAHTAR);

        const store = yeniStore();
        await store.dispatch(muhafizAyarlariniYukle());

        // Eski (15 uyarılık) matris olduğu gibi kalır — göç çalışmadı
        expect(store.getState().muhafiz.matris).toEqual(kayitli.matris);
        expect(mockStore.get(ANAHTAR)).toBe(oncekiJson);
    });

    it('diskteki yoğunluk bozuksa DOKUNMAZ (bilinmeyen preset adı)', async () => {
        const kayitli = eskiKayitYaz({ yogunluk: 'bilinmeyen' });
        const store = yeniStore();
        await store.dispatch(muhafizAyarlariniYukle());

        expect(store.getState().muhafiz.matris).toEqual(kayitli.matris);
        expect((store.getState().muhafiz as MuhafizAyarlari).presetGocuYapildi).toBe(true);
    });

    it('matris bozuksa presetten sıfırdan kurulur (göç kilitlenmez)', async () => {
        eskiKayitYaz({ matris: { imsak: { seviyeler: [] } } });
        const store = yeniStore();
        await store.dispatch(muhafizAyarlariniYukle());

        const state = store.getState().muhafiz as MuhafizAyarlari;
        expect(uyariSayisi(state.matris!)).toHaveLength(7);
    });

    it('göç eski global esik/siklik alanlarını da preset ile hizalar', async () => {
        eskiKayitYaz();
        const store = yeniStore();
        await store.dispatch(muhafizAyarlariniYukle());

        const state = store.getState().muhafiz as MuhafizAyarlari;
        expect(state.esikler).toEqual(HATIRLATMA_PRESETLERI.yogun.esikler);
        expect(state.sikliklar).toEqual(HATIRLATMA_PRESETLERI.yogun.sikliklar);
    });

    it('taze kurulum bayrakla başlar — göç hiç tetiklenmez', () => {
        const bas = reducer(undefined, { type: '@@INIT' });
        expect(bas.presetGocuYapildi).toBe(true);
    });
});
