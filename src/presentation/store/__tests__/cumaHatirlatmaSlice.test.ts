/**
 * cumaHatirlatmaSlice — cuma hatırlatması ayar state'i DAVRANIŞ testleri
 *
 * Kapsanan davranışlar:
 * - Varsayılan state: kapalı + 60 dk (cuma herkese farz-ı ayn değil → opt-in)
 * - Yükleme: pending/fulfilled/rejected (reddedilse bile state kullanılabilir kalır)
 * - Güncelleme: kısmi değişikliğin mevcut ayarlarla BİRLEŞTİRİLMESİ
 * - Güncelleme: kayıttan SONRA yeniden planlama + koordinatın PARAMETRE geçmesi
 *   (servis bellek-içi hesaplayıcı konfigine bağlı değil)
 * - Diskten dönen NORMALİZE değerin state'e yazılması
 */

import reducer, {
    cumaHatirlatmaAyarlariniYukle,
    cumaHatirlatmaAyariniGuncelle,
} from '../cumaHatirlatmaSlice';
import {
    LocalCumaHatirlatmaServisi,
    CumaHatirlatmaAyarlari,
} from '../../../data/local/LocalCumaHatirlatmaServisi';
import { CumaHatirlatmaServisi } from '../../../domain/services/CumaHatirlatmaServisi';
import { configureStore } from '@reduxjs/toolkit';

// Mock dependencies
jest.mock('../../../data/local/LocalCumaHatirlatmaServisi');
jest.mock('../../../domain/services/CumaHatirlatmaServisi');

const VARSAYILAN: CumaHatirlatmaAyarlari = { aktif: false, oncedenDk: 60 };

// Store'daki konum: thunk koordinatı buradan okuyup servise PARAMETRE geçmeli.
let konumKoordinatlari: { lat: number; lng: number } | null = null;
const konumReducer = () => ({ koordinatlar: konumKoordinatlari });

const storeOlustur = () =>
    configureStore({
        reducer: { cumaHatirlatma: reducer, konum: konumReducer },
    });

let store: ReturnType<typeof storeOlustur>;
let mockServis: { hatirlatmalariGuncelle: jest.Mock };

beforeEach(() => {
    jest.clearAllMocks();
    konumKoordinatlari = { lat: 41.0082, lng: 28.9784 };
    store = storeOlustur();

    mockServis = { hatirlatmalariGuncelle: jest.fn().mockResolvedValue(undefined) };
    (CumaHatirlatmaServisi.getInstance as jest.Mock).mockReturnValue(mockServis);
    (LocalCumaHatirlatmaServisi.saveAyarlar as jest.Mock).mockResolvedValue(true);
    (LocalCumaHatirlatmaServisi.getAyarlar as jest.Mock).mockResolvedValue(VARSAYILAN);
});

describe('cumaHatirlatmaSlice — başlangıç durumu', () => {
    test('varsayılan KAPALI ve 60 dk önceden olmalı', () => {
        const state = store.getState().cumaHatirlatma;

        // Cuma herkese farz-ı ayn değil → özellik ayardan açılır, kendiliğinden açılmaz.
        expect(state.ayarlar).toEqual({ aktif: false, oncedenDk: 60 });
        expect(state.yukleniyor).toBe(false);
        expect(state.hata).toBeNull();
    });
});

describe('cumaHatirlatmaAyarlariniYukle', () => {
    test('diskteki ayarları state\'e alır ve yukleniyor kapanır', async () => {
        const kayitli: CumaHatirlatmaAyarlari = { aktif: true, oncedenDk: 90 };
        (LocalCumaHatirlatmaServisi.getAyarlar as jest.Mock).mockResolvedValue(kayitli);

        await store.dispatch(cumaHatirlatmaAyarlariniYukle());

        const state = store.getState().cumaHatirlatma;
        expect(state.ayarlar).toEqual(kayitli);
        expect(state.yukleniyor).toBe(false);
        expect(state.hata).toBeNull();
    });

    test('pending: yükleme sırasında yukleniyor=true ve hata=null olmalı', async () => {
        // Servisi ASKIDA tut: thunk pending'de takılı kalsın ki ara durumu gözlemleyelim.
        let cozumle: (deger: CumaHatirlatmaAyarlari) => void = () => { };
        const askidaPromise = new Promise<CumaHatirlatmaAyarlari>((resolve) => {
            cozumle = resolve;
        });
        (LocalCumaHatirlatmaServisi.getAyarlar as jest.Mock).mockReturnValue(askidaPromise);

        const dispatchPromise = store.dispatch(cumaHatirlatmaAyarlariniYukle());

        const araState = store.getState().cumaHatirlatma;
        expect(araState.yukleniyor).toBe(true);
        expect(araState.hata).toBeNull();

        // Temizlik: promise'i çöz ve thunk'ın bitmesini bekle (askıda kalmasın).
        cozumle(VARSAYILAN);
        await dispatchPromise;

        expect(store.getState().cumaHatirlatma.yukleniyor).toBe(false);
    });

    test('rejected: yukleniyor kapanır, hata dolar ve ayarlar kullanılabilir kalır', async () => {
        (LocalCumaHatirlatmaServisi.getAyarlar as jest.Mock).mockRejectedValue(
            new Error('Depolama okunamadı')
        );

        const sonuc = await store.dispatch(cumaHatirlatmaAyarlariniYukle());
        expect(sonuc.type).toBe('cumaHatirlatma/yukle/rejected');

        const state = store.getState().cumaHatirlatma;
        // Spinner sonsuza kadar dönmemeli (sessiz sonsuz yükleme tuzağı)
        expect(state.yukleniyor).toBe(false);
        expect(state.hata).toBe('Depolama okunamadı');
        // Ekran render edilebilir kalmalı: ayarlar varsayılan halinde durur
        expect(state.ayarlar).toEqual(VARSAYILAN);
    });

    test('rejected: mesaj alanı olmayan hatada yedek metin kullanılır', async () => {
        // `message` alanı HİÇ olmayan bir red → slice'taki `?? 'Ayarlar yüklenemedi'` dalı.
        // (Not: `new Error()` message'ı '' verir; `??` boş dizeyi yakalamaz — bkz. rapor.)
        (LocalCumaHatirlatmaServisi.getAyarlar as jest.Mock).mockRejectedValue({
            name: 'DepolamaHatasi',
        });

        await store.dispatch(cumaHatirlatmaAyarlariniYukle());

        const state = store.getState().cumaHatirlatma;
        expect(state.hata).toBe('Ayarlar yüklenemedi');
        expect(state.yukleniyor).toBe(false);
    });
});

describe('cumaHatirlatmaAyariniGuncelle', () => {
    test('kısmi değişikliği mevcut ayarlarla BİRLEŞTİRİP diske yazar', async () => {
        // Önce state'i "45 dk önceden" haline getir
        (LocalCumaHatirlatmaServisi.getAyarlar as jest.Mock).mockResolvedValue({
            aktif: false,
            oncedenDk: 45,
        });
        await store.dispatch(cumaHatirlatmaAyarlariniYukle());

        (LocalCumaHatirlatmaServisi.getAyarlar as jest.Mock).mockResolvedValue({
            aktif: true,
            oncedenDk: 45,
        });

        // Yalnız `aktif` geçiliyor → `oncedenDk` KORUNMALI (sıfırlanmamalı)
        await store.dispatch(cumaHatirlatmaAyariniGuncelle({ aktif: true }));

        expect(LocalCumaHatirlatmaServisi.saveAyarlar).toHaveBeenCalledWith({
            aktif: true,
            oncedenDk: 45,
        });
        expect(store.getState().cumaHatirlatma.ayarlar).toEqual({ aktif: true, oncedenDk: 45 });
    });

    test('yalnız oncedenDk geçilince aktif korunur', async () => {
        (LocalCumaHatirlatmaServisi.getAyarlar as jest.Mock).mockResolvedValue({
            aktif: true,
            oncedenDk: 60,
        });
        await store.dispatch(cumaHatirlatmaAyarlariniYukle());

        (LocalCumaHatirlatmaServisi.getAyarlar as jest.Mock).mockResolvedValue({
            aktif: true,
            oncedenDk: 120,
        });

        await store.dispatch(cumaHatirlatmaAyariniGuncelle({ oncedenDk: 120 }));

        expect(LocalCumaHatirlatmaServisi.saveAyarlar).toHaveBeenCalledWith({
            aktif: true,
            oncedenDk: 120,
        });
    });

    test('kaydettikten SONRA hatırlatmaları yeniden planlar', async () => {
        await store.dispatch(cumaHatirlatmaAyariniGuncelle({ aktif: true }));

        expect(LocalCumaHatirlatmaServisi.saveAyarlar).toHaveBeenCalled();
        expect(mockServis.hatirlatmalariGuncelle).toHaveBeenCalledTimes(1);

        // Sıra garantisi: önce yerel veri yazılır, SONRA bildirimler planlanır.
        // (Servis ayarı diskten okuduğu için yarım/eski state üzerine planlama olmamalı.)
        const yazmaSirasi = (LocalCumaHatirlatmaServisi.saveAyarlar as jest.Mock)
            .mock.invocationCallOrder[0];
        const planlamaSirasi = mockServis.hatirlatmalariGuncelle.mock.invocationCallOrder[0];
        expect(yazmaSirasi).toBeLessThan(planlamaSirasi);
    });

    /**
     * Disk yazımı fırlatmadan `false` dönebilir. Bu durumda planlamaya devam
     * etmek kullanıcıya "kaydedildi" hissi verir ama ayar bir sonraki açılışta
     * kaybolur — üstelik bildirimler kaydedilmemiş ayara göre kurulmuş olur.
     */
    test('disk yazımı başarısız olursa planlama YAPILMAZ ve hata dolar', async () => {
        (LocalCumaHatirlatmaServisi.saveAyarlar as jest.Mock).mockResolvedValueOnce(false);

        await store.dispatch(cumaHatirlatmaAyariniGuncelle({ aktif: true }));

        expect(mockServis.hatirlatmalariGuncelle).not.toHaveBeenCalled();
        expect(store.getState().cumaHatirlatma.hata).toBeTruthy();
    });

    test('KRİTİK: servise store\'daki koordinat PARAMETRE olarak geçilir', async () => {
        konumKoordinatlari = { lat: 39.9334, lng: 32.8597 };
        store = storeOlustur();

        await store.dispatch(cumaHatirlatmaAyariniGuncelle({ aktif: true }));

        // Servis bellek-içi hesaplayıcı konfigine bağlı olmamalı; koordinat dışarıdan gelir.
        expect(mockServis.hatirlatmalariGuncelle).toHaveBeenCalledWith({
            lat: 39.9334,
            lng: 32.8597,
        });
    });

    test('konum yoksa servise null geçilir (undefined değil)', async () => {
        konumKoordinatlari = null;
        store = storeOlustur();

        await store.dispatch(cumaHatirlatmaAyariniGuncelle({ aktif: true }));

        expect(mockServis.hatirlatmalariGuncelle).toHaveBeenCalledWith(null);
    });

    test('diskten dönen NORMALİZE değeri state\'e yazar (sınır dışı düzeltilmiş gelir)', async () => {
        // Kullanıcı/çağıran 999 dk istese bile disk katmanı üst sınıra çeker.
        (LocalCumaHatirlatmaServisi.getAyarlar as jest.Mock).mockResolvedValue({
            aktif: true,
            oncedenDk: 180,
        });

        await store.dispatch(cumaHatirlatmaAyariniGuncelle({ aktif: true, oncedenDk: 999 }));

        // Ham istek diske gider (normalizasyon depolama katmanının sorumluluğu)...
        expect(LocalCumaHatirlatmaServisi.saveAyarlar).toHaveBeenCalledWith({
            aktif: true,
            oncedenDk: 999,
        });
        // ...ama state'e diskten okunan DÜZELTİLMİŞ değer yazılır.
        expect(store.getState().cumaHatirlatma.ayarlar).toEqual({ aktif: true, oncedenDk: 180 });
    });

    test('rejected: kayıt patlarsa hata dolar ve ayarlar bozulmaz', async () => {
        (LocalCumaHatirlatmaServisi.saveAyarlar as jest.Mock).mockRejectedValue(
            new Error('disk dolu')
        );

        const sonuc = await store.dispatch(cumaHatirlatmaAyariniGuncelle({ aktif: true }));

        expect(sonuc.type).toBe('cumaHatirlatma/guncelle/rejected');
        expect(store.getState().cumaHatirlatma.hata).toBe('disk dolu');
        expect(store.getState().cumaHatirlatma.ayarlar).toEqual(VARSAYILAN);
        // Yazılamayan ayar üzerine bildirim planlanmamalı
        expect(mockServis.hatirlatmalariGuncelle).not.toHaveBeenCalled();
    });
});
