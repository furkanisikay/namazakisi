import reducer, {
    vakitBildirimAyarlariniYukle,
    vakitBildirimAyariniGuncelle,
    tumVakitBildirimAyarlariniGuncelle
} from '../vakitBildirimSlice';
import { LocalVakitBildirimServisi } from '../../../data/local/LocalVakitBildirimServisi';
import { VakitBildirimYoneticiServisi } from '../../../domain/services/VakitBildirimYoneticiServisi';
import { configureStore } from '@reduxjs/toolkit';

// Mock dependencies
jest.mock('../../../data/local/LocalVakitBildirimServisi');
jest.mock('../../../domain/services/VakitBildirimYoneticiServisi');

describe('vakitBildirimSlice', () => {
    let store: any;

    beforeEach(() => {
        store = configureStore({
            reducer: { vakitBildirim: reducer },
        });
        jest.clearAllMocks();
    });

    it('initial state doğru olmalı', () => {
        const state = store.getState().vakitBildirim;
        expect(state.ayarlar).toEqual({
            imsak: false,
            ogle: false,
            ikindi: false,
            aksam: false,
            yatsi: false,
        });
        expect(state.yukleniyor).toBe(false);
    });

    it('vakitBildirimAyarlariniYukle thunk çalışmalı', async () => {
        const mockAyarlar = { imsak: true, ogle: false, ikindi: true, aksam: false, yatsi: true };
        (LocalVakitBildirimServisi.getAyarlar as jest.Mock).mockResolvedValue(mockAyarlar);

        await store.dispatch(vakitBildirimAyarlariniYukle());

        const state = store.getState().vakitBildirim;
        expect(state.ayarlar).toEqual(mockAyarlar);
        expect(state.yukleniyor).toBe(false);
    });

    it('vakitBildirimAyarlariniYukle.pending: yükleme sırasında yukleniyor=true ve hata=null olmalı', async () => {
        // Servisi ASKIDA tut: thunk pending'de takılı kalsın ki ara durumu gözlemleyelim.
        let cozumle: (deger: any) => void = () => {};
        const askidaPromise = new Promise<any>((resolve) => {
            cozumle = resolve;
        });
        (LocalVakitBildirimServisi.getAyarlar as jest.Mock).mockReturnValue(askidaPromise);

        const dispatchPromise = store.dispatch(vakitBildirimAyarlariniYukle());

        // Promise henüz çözülmedi → thunk pending → ara durum gözlemlenebilir.
        const araState = store.getState().vakitBildirim;
        expect(araState.yukleniyor).toBe(true);
        expect(araState.hata).toBeNull();

        // Temizlik: promise'i çöz ve thunk'ın bitmesini bekle (askıda kalmasın).
        cozumle({ imsak: false, ogle: false, ikindi: false, aksam: false, yatsi: false });
        await dispatchPromise;

        const sonState = store.getState().vakitBildirim;
        expect(sonState.yukleniyor).toBe(false);
    });

    it('vakitBildirimAyarlariniYukle.rejected: servis reject ederse hata set edilir ve yukleniyor=false olur', async () => {
        (LocalVakitBildirimServisi.getAyarlar as jest.Mock).mockRejectedValue(
            new Error('Depolama okunamadı')
        );

        const sonuc = await store.dispatch(vakitBildirimAyarlariniYukle());

        expect(sonuc.type).toBe('vakitBildirim/yukle/rejected');

        const state = store.getState().vakitBildirim;
        // rejected reducer'ı yukleniyor'ı kapatmalı (spinner sonsuza kadar dönmemeli)
        expect(state.yukleniyor).toBe(false);
        // Hata mesajı action.error.message'tan gelmeli (slice'ta fallback de var)
        expect(state.hata).toBe('Depolama okunamadı');
        // Hata durumunda ayarlar varsayılan/önceki halinde kalmalı (bozulmamalı)
        expect(state.ayarlar).toEqual({
            imsak: false,
            ogle: false,
            ikindi: false,
            aksam: false,
            yatsi: false,
        });
    });

    it('vakitBildirimAyarlariniYukle.rejected: mesajsız reject olursa fallback hata mesajı kullanılır', async () => {
        // Mesajı olmayan bir hata → slice'taki `|| 'Ayarlar yüklenemedi'` dalı devreye girmeli.
        (LocalVakitBildirimServisi.getAyarlar as jest.Mock).mockRejectedValue(new Error());

        await store.dispatch(vakitBildirimAyarlariniYukle());

        const state = store.getState().vakitBildirim;
        expect(state.hata).toBe('Ayarlar yüklenemedi');
        expect(state.yukleniyor).toBe(false);
    });

    it('vakitBildirimAyariniGuncelle thunk çalışmalı ve servisi tetiklemeli', async () => {
        const mockAyarlar = { imsak: true, ogle: false, ikindi: false, aksam: false, yatsi: false };
        (LocalVakitBildirimServisi.updateVakitAyar as jest.Mock).mockResolvedValue(mockAyarlar);

        const mockYonetici = { bildirimleriGuncelle: jest.fn() };
        (VakitBildirimYoneticiServisi.getInstance as jest.Mock).mockReturnValue(mockYonetici);

        await store.dispatch(vakitBildirimAyariniGuncelle({ vakit: 'imsak', aktif: true }));

        const state = store.getState().vakitBildirim;
        expect(state.ayarlar).toEqual(mockAyarlar);

        expect(LocalVakitBildirimServisi.updateVakitAyar).toHaveBeenCalledWith('imsak', true);
        expect(mockYonetici.bildirimleriGuncelle).toHaveBeenCalled();

        // Sıra garantisi: önce yerel veri yazılır, SONRA bildirimler yeniden planlanır.
        // (Yarım/eski state üzerine bildirim planlanmasını önleyen üretim sözleşmesi.)
        const yazmaSirasi = (LocalVakitBildirimServisi.updateVakitAyar as jest.Mock)
            .mock.invocationCallOrder[0];
        const planlamaSirasi = mockYonetici.bildirimleriGuncelle.mock.invocationCallOrder[0];
        expect(yazmaSirasi).toBeLessThan(planlamaSirasi);
    });

    it('updateVakitAyar null dönerse bildirim planlanmamalı ve thunk reject olmalı', async () => {
        // Yerel kayıt başarısız (catch -> null) senaryosu
        (LocalVakitBildirimServisi.updateVakitAyar as jest.Mock).mockResolvedValue(null);

        const mockYonetici = { bildirimleriGuncelle: jest.fn() };
        (VakitBildirimYoneticiServisi.getInstance as jest.Mock).mockReturnValue(mockYonetici);

        const sonuc = await store.dispatch(
            vakitBildirimAyariniGuncelle({ vakit: 'imsak', aktif: true })
        );

        // Thunk reject olmalı (üretimdeki `if (!yeniAyarlar) throw` guard'ı)
        expect(sonuc.type).toBe('vakitBildirim/guncelle/rejected');
        expect((sonuc as any).error.message).toBe('Ayar güncellenemedi');

        // KRİTİK: yarım/yazılamamış state üzerine bildirim planlanmamalı
        expect(mockYonetici.bildirimleriGuncelle).not.toHaveBeenCalled();

        // State bozulmamalı (slice'da guncelle.rejected dalı yok → ayarlar varsayılan kalır)
        const state = store.getState().vakitBildirim;
        expect(state.ayarlar).toEqual({
            imsak: false,
            ogle: false,
            ikindi: false,
            aksam: false,
            yatsi: false,
        });
    });

    it('tumVakitBildirimAyarlariniGuncelle: toplu ayarı kaydeder, bildirimleri yeniden planlar ve state.ayarlar set edilir', async () => {
        const topluAyarlar = { imsak: true, ogle: true, ikindi: true, aksam: true, yatsi: true };
        (LocalVakitBildirimServisi.saveAyarlar as jest.Mock).mockResolvedValue(true);

        const mockYonetici = { bildirimleriGuncelle: jest.fn().mockResolvedValue(undefined) };
        (VakitBildirimYoneticiServisi.getInstance as jest.Mock).mockReturnValue(mockYonetici);

        await store.dispatch(tumVakitBildirimAyarlariniGuncelle(topluAyarlar));

        // fulfilled reducer'ı tüm ayar nesnesini state'e yansıtmalı
        const state = store.getState().vakitBildirim;
        expect(state.ayarlar).toEqual(topluAyarlar);

        // Yerel toplu kayıt çağrısı tam ayar nesnesiyle yapılmalı
        expect(LocalVakitBildirimServisi.saveAyarlar).toHaveBeenCalledWith(topluAyarlar);
        // Bildirimler yeniden planlanmalı
        expect(mockYonetici.bildirimleriGuncelle).toHaveBeenCalled();

        // Sıra garantisi: önce yerel veri yazılır, SONRA bildirimler planlanır.
        // (Yarım/eski toplu state üzerine bildirim planlanmasını önleyen üretim sözleşmesi.)
        const yazmaSirasi = (LocalVakitBildirimServisi.saveAyarlar as jest.Mock)
            .mock.invocationCallOrder[0];
        const planlamaSirasi = mockYonetici.bildirimleriGuncelle.mock.invocationCallOrder[0];
        expect(yazmaSirasi).toBeLessThan(planlamaSirasi);
    });
});
