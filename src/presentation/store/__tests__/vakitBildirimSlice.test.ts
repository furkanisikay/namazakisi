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
    });
});
