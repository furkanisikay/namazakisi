/**
 * Ozellikler Slice Testleri
 * Yeni özellik duyuru durumu (görülen / kart kapatılan) yönetimi
 */

import { configureStore } from '@reduxjs/toolkit';
import ozelliklerReducer, {
    ozellikleriYukle,
    ozellikGorulduIsaretle,
    ozellikKartiKapat,
} from '../ozelliklerSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
}));

describe('ozelliklerSlice', () => {
    function storeOlustur() {
        return configureStore({
            reducer: { ozellikler: ozelliklerReducer },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware({ serializableCheck: false }),
        });
    }

    let store: ReturnType<typeof storeOlustur>;

    beforeEach(() => {
        store = storeOlustur();
        jest.clearAllMocks();
    });

    it('başlangıç state boş dizilerle başlar', () => {
        const state = store.getState().ozellikler;
        expect(state.gorulenIdler).toEqual([]);
        expect(state.kapatilanKartIdler).toEqual([]);
        expect(state.yuklendi).toBe(false);
    });

    it('AsyncStorage boşsa varsayılan boş durum yüklenir ve yuklendi=true olur', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
        await store.dispatch(ozellikleriYukle());
        const state = store.getState().ozellikler;
        expect(state.gorulenIdler).toEqual([]);
        expect(state.yuklendi).toBe(true);
    });

    it('kayıtlı durum yüklenir', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
            JSON.stringify({ gorulenIdler: ['a'], kapatilanKartIdler: ['b'] })
        );
        await store.dispatch(ozellikleriYukle());
        const state = store.getState().ozellikler;
        expect(state.gorulenIdler).toEqual(['a']);
        expect(state.kapatilanKartIdler).toEqual(['b']);
    });

    it('eksik alanlı kayıt güvenli şekilde merge edilir', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
            JSON.stringify({ gorulenIdler: ['x'] })
        );
        await store.dispatch(ozellikleriYukle());
        const state = store.getState().ozellikler;
        expect(state.gorulenIdler).toEqual(['x']);
        expect(state.kapatilanKartIdler).toEqual([]);
    });

    it('ozellikGorulduIsaretle tek id ekler ve doğru anahtar/şekille kaydeder', async () => {
        await store.dispatch(ozellikGorulduIsaretle('takvim-entegrasyonu'));
        const state = store.getState().ozellikler;
        expect(state.gorulenIdler).toContain('takvim-entegrasyonu');

        // Sadece "çağrıldı" değil; DOĞRU anahtara, DOĞRU şekille persist edilmeli.
        // Üretim id'yi gorulenIdler'a ekleyip kapatilanKartIdler'ı boş bırakmalı.
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            DEPOLAMA_ANAHTARLARI.GORULEN_OZELLIKLER,
            JSON.stringify({
                gorulenIdler: ['takvim-entegrasyonu'],
                kapatilanKartIdler: [],
            })
        );
    });

    it('ozellikGorulduIsaretle dizi kabul eder ve tekrarları teklestirir', async () => {
        await store.dispatch(ozellikGorulduIsaretle(['a', 'b']));
        await store.dispatch(ozellikGorulduIsaretle(['b', 'c']));
        const state = store.getState().ozellikler;
        expect([...state.gorulenIdler].sort()).toEqual(['a', 'b', 'c']);
    });

    it('ozellikKartiKapat kartı kapatır ama görülenleri etkilemez', async () => {
        await store.dispatch(ozellikKartiKapat('takvim-entegrasyonu'));
        const state = store.getState().ozellikler;
        expect(state.kapatilanKartIdler).toContain('takvim-entegrasyonu');
        expect(state.gorulenIdler).toEqual([]);
    });

    // KALICILIK İÇERİĞİ: ozellikKartiKapat'ın yalnızca "çağrıldığı" değil; DOĞRU
    // anahtara, DOĞRU JSON şekliyle persist ettiği doğrulanmalı. Yanlış anahtar
    // veya bozuk payload regresyonu (örn. gorulenIdler/kapatilanKartIdler
    // alanlarının yer değiştirmesi) sadece state'e bakan testlerden kaçar.
    it('ozellikKartiKapat doğru anahtar ve JSON payload ile kalıcı kaydeder', async () => {
        await store.dispatch(ozellikKartiKapat('konum-takibi'));
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            DEPOLAMA_ANAHTARLARI.GORULEN_OZELLIKLER,
            JSON.stringify({
                gorulenIdler: [],
                kapatilanKartIdler: ['konum-takibi'],
            })
        );
    });

    // INVARIANT (ÇİFT YÖNLÜ): ozellikGorulduIsaretle mevcut kapatilanKartIdler'i
    // KORUMALI (üretim kodu satır 61). Test 7 yalnızca tersini (kart kapatma
    // görülenleri etkilemez) doğruluyor; bu test ters yönü kapatarak invariant'ı
    // tam kapsar. Üretim yanlışlıkla kapatilanKartIdler'i sıfırlarsa FAIL eder.
    it('ozellikGorulduIsaretle mevcut kapatılan kartları korur', async () => {
        await store.dispatch(ozellikKartiKapat('k'));
        await store.dispatch(ozellikGorulduIsaretle('g'));
        const state = store.getState().ozellikler;
        expect(state.kapatilanKartIdler).toEqual(['k']);
        expect(state.gorulenIdler).toEqual(['g']);

        // Kalıcılığa da yansımalı: son setItem çağrısı her iki alanı korumalı.
        expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
            DEPOLAMA_ANAHTARLARI.GORULEN_OZELLIKLER,
            JSON.stringify({
                gorulenIdler: ['g'],
                kapatilanKartIdler: ['k'],
            })
        );
    });

    // BOZUK JSON DAYANIKLILIĞI: ozellikleriYukle içindeki catch dalı (JSON.parse
    // hatası → güvenli boş state) açılışta çökmeyi engelleyen güvenlik ağıdır.
    // getItem geçersiz JSON döndürünce thunk reject ETMEMELİ ve state güvenli
    // boş durumla yuklendi=true olmalı. Bu dal kırılırsa uygulama bozuk store'la
    // açılmaz; mevcut testlerden tamamen kaçan kritik bir yol.
    it('bozuk JSON yüklenince çökmeden güvenli boş duruma düşer', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('{bozuk');
        const sonuc = await store.dispatch(ozellikleriYukle());
        expect(sonuc.type).toBe('ozellikler/yukle/fulfilled');
        const state = store.getState().ozellikler;
        expect(state.gorulenIdler).toEqual([]);
        expect(state.kapatilanKartIdler).toEqual([]);
        expect(state.yuklendi).toBe(true);
    });

    // KAYDETME HATASI DAYANIKLILIĞI: setItem reject etse bile thunk catch ediyor
    // ve in-memory state YİNE DE güncelleniyor (kullanıcı oturum boyunca doğru
    // UI görür; sadece kalıcılık başarısız olur). Thunk reject ETMEMELİ.
    it('kaydetme başarısız olsa bile in-memory state güncellenir ve thunk reject olmaz', async () => {
        (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
            new Error('disk dolu')
        );
        const sonuc = await store.dispatch(ozellikGorulduIsaretle('takvim'));
        expect(sonuc.type).toBe('ozellikler/gorulduIsaretle/fulfilled');
        const state = store.getState().ozellikler;
        expect(state.gorulenIdler).toContain('takvim');
    });
});
