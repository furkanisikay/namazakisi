/**
 * useYeniOzellikler Hook Testleri
 *
 * Hook'un GERÇEK türetme mantığını davranışsal olarak doğrular:
 *   - okunmamis: gorulenIdler filtresi (sürüm/görüldü ayıklama)
 *   - kart: kartGoster + kapatilanKartIdler ile tek (ilk) tanıtım kartı seçimi
 *   - sayfaOkunmamisMi / sayfayiGorulduIsaretle: hedefSayfa eşlemesi
 *   - dispatch sonrası türevlerin (okunmamisVarMi, kart) güncellenmesi
 *
 * Katalog (YENI_OZELLIKLER) sabit ama ileride değişebilir; testin kararlı
 * kalması için katalog mocklanır → filtreleme dalları kontrollü veriyle test edilir.
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ozelliklerReducer from '../../store/ozelliklerSlice';
import { useYeniOzellikler } from '../useYeniOzellikler';

// AsyncStorage: thunk'lar (gorulduIsaretle / kartiKapat) içeride kullanır
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
}));

// Katalog mocklanır: kontrollü, sabit bir senaryoyla filtreleme dalları test edilir.
//   - A: kartGoster=true, hedefSayfa='SayfaA'  (en güncel — kart adayı)
//   - B: kartGoster=true, hedefSayfa='SayfaB'  (ikinci kart adayı)
//   - C: kartGoster=false, hedefSayfa yok      (kart adayı DEĞİL)
jest.mock('../../../core/constants/YeniOzellikler', () => ({
    YENI_OZELLIKLER: [
        {
            id: 'a',
            surum: '0.3.0',
            tarih: '2026-03-01',
            baslik: 'A',
            aciklama: 'A açıklama',
            ikon: 'star',
            hedefSayfa: 'SayfaA',
            kartGoster: true,
        },
        {
            id: 'b',
            surum: '0.2.0',
            tarih: '2026-02-01',
            baslik: 'B',
            aciklama: 'B açıklama',
            ikon: 'star',
            hedefSayfa: 'SayfaB',
            kartGoster: true,
        },
        {
            id: 'c',
            surum: '0.1.0',
            tarih: '2026-01-01',
            baslik: 'C',
            aciklama: 'C açıklama',
            ikon: 'star',
            kartGoster: false,
        },
    ],
}));

function storeOlustur(onYukleme?: { gorulenIdler?: string[]; kapatilanKartIdler?: string[] }) {
    const store = configureStore({
        reducer: { ozellikler: ozelliklerReducer },
        middleware: (g) => g({ serializableCheck: false }),
    });
    // Slice'ın yalnızca extraReducers'ı olduğu için başlangıç durumunu
    // thunk fulfilled action'ı taklit ederek enjekte ederiz.
    if (onYukleme) {
        store.dispatch({
            type: 'ozellikler/yukle/fulfilled',
            payload: {
                gorulenIdler: onYukleme.gorulenIdler ?? [],
                kapatilanKartIdler: onYukleme.kapatilanKartIdler ?? [],
            },
        });
    }
    return store;
}

function sar(store: ReturnType<typeof storeOlustur>) {
    return ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
    );
}

describe('useYeniOzellikler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('hiçbir özellik görülmemişse tümü okunmamış sayılır', () => {
        const store = storeOlustur();
        const { result } = renderHook(() => useYeniOzellikler(), { wrapper: sar(store) });

        expect(result.current.okunmamis.map((o) => o.id)).toEqual(['a', 'b', 'c']);
        expect(result.current.okunmamisVarMi).toBe(true);
    });

    it('görülen idler okunmamış listesinden çıkarılır', () => {
        const store = storeOlustur({ gorulenIdler: ['a', 'c'] });
        const { result } = renderHook(() => useYeniOzellikler(), { wrapper: sar(store) });

        expect(result.current.okunmamis.map((o) => o.id)).toEqual(['b']);
        expect(result.current.okunmamisVarMi).toBe(true);
    });

    it('tüm özellikler görülünce okunmamisVarMi false olur', () => {
        const store = storeOlustur({ gorulenIdler: ['a', 'b', 'c'] });
        const { result } = renderHook(() => useYeniOzellikler(), { wrapper: sar(store) });

        expect(result.current.okunmamis).toEqual([]);
        expect(result.current.okunmamisVarMi).toBe(false);
        expect(result.current.kart).toBeNull();
    });

    it('kart, kartGoster=true olan ilk (en güncel) okunmamış özelliği seçer', () => {
        const store = storeOlustur();
        const { result } = renderHook(() => useYeniOzellikler(), { wrapper: sar(store) });

        // a kartGoster=true ve en üstte → kart=a (c kartGoster=false, aday değil)
        expect(result.current.kart?.id).toBe('a');
    });

    it('kart, kapatılan veya görülen kartı atlayıp bir sonraki adaya geçer', () => {
        // a görülmüş VE kartı kapatılmış → sıradaki kartGoster adayı b
        const store = storeOlustur({ gorulenIdler: [], kapatilanKartIdler: ['a'] });
        const { result } = renderHook(() => useYeniOzellikler(), { wrapper: sar(store) });

        expect(result.current.kart?.id).toBe('b');
    });

    it('kartGoster=false olan özellik kart olarak seçilmez', () => {
        // a ve b görülmüş; geriye yalnız c (kartGoster=false) kalır → kart null
        const store = storeOlustur({ gorulenIdler: ['a', 'b'] });
        const { result } = renderHook(() => useYeniOzellikler(), { wrapper: sar(store) });

        expect(result.current.okunmamis.map((o) => o.id)).toEqual(['c']);
        expect(result.current.kart).toBeNull();
    });

    it('sayfaOkunmamisMi yalnızca eşleşen hedefSayfa için true döner', () => {
        const store = storeOlustur();
        const { result } = renderHook(() => useYeniOzellikler(), { wrapper: sar(store) });

        expect(result.current.sayfaOkunmamisMi('SayfaA')).toBe(true);
        expect(result.current.sayfaOkunmamisMi('SayfaB')).toBe(true);
        expect(result.current.sayfaOkunmamisMi('OlmayanSayfa')).toBe(false);
    });

    it('isaretle dispatch sonrası okunmamış listesi ve türevleri günceller', async () => {
        const store = storeOlustur();
        const { result } = renderHook(() => useYeniOzellikler(), { wrapper: sar(store) });

        expect(result.current.kart?.id).toBe('a');

        await act(async () => {
            result.current.isaretle('a');
        });

        await waitFor(() => {
            expect(result.current.okunmamis.map((o) => o.id)).toEqual(['b', 'c']);
        });
        // 'a' okununca kart bir sonraki adaya (b) kayar
        expect(result.current.kart?.id).toBe('b');
    });

    it('sayfayiGorulduIsaretle yalnızca o sayfaya ait okunmamışları görülmüş yapar', async () => {
        const store = storeOlustur();
        const { result } = renderHook(() => useYeniOzellikler(), { wrapper: sar(store) });

        await act(async () => {
            result.current.sayfayiGorulduIsaretle('SayfaA');
        });

        await waitFor(() => {
            expect(result.current.sayfaOkunmamisMi('SayfaA')).toBe(false);
        });
        // Yalnızca SayfaA işaretlendi; b (SayfaB) hâlâ okunmamış
        expect(result.current.sayfaOkunmamisMi('SayfaB')).toBe(true);
        expect(result.current.okunmamis.map((o) => o.id)).toEqual(['b', 'c']);
    });

    it('eşleşmeyen sayfa için sayfayiGorulduIsaretle hiçbir şeyi değiştirmez', async () => {
        const store = storeOlustur();
        const { result } = renderHook(() => useYeniOzellikler(), { wrapper: sar(store) });

        const oncekiSayisi = result.current.okunmamis.length;

        await act(async () => {
            result.current.sayfayiGorulduIsaretle('OlmayanSayfa');
        });

        expect(result.current.okunmamis.length).toBe(oncekiSayisi);
    });

    it('kartiKapat kartı gizler ama özelliği okunmamış bırakır', async () => {
        const store = storeOlustur();
        const { result } = renderHook(() => useYeniOzellikler(), { wrapper: sar(store) });

        expect(result.current.kart?.id).toBe('a');

        await act(async () => {
            result.current.kartiKapat('a');
        });

        await waitFor(() => {
            expect(result.current.kart?.id).toBe('b');
        });
        // Kart kapandı ama 'a' hâlâ okunmamış (rozet kalır)
        expect(result.current.okunmamis.map((o) => o.id)).toContain('a');
    });
});
