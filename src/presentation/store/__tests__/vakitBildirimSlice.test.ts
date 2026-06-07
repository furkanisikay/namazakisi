import reducer, {
    vakitBildirimAyarlariniYukle,
    vakitBildirimAyariniGuncelle
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
});
