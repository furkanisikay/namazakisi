import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { LocalVakitBildirimServisi, VakitBildirimAyarlari } from '../../data/local/LocalVakitBildirimServisi';
import { VakitBildirimYoneticiServisi } from '../../domain/services/VakitBildirimYoneticiServisi';

interface VakitBildirimState {
    ayarlar: VakitBildirimAyarlari;
    yukleniyor: boolean;
    hata: string | null;
}

const initialState: VakitBildirimState = {
    ayarlar: {
        imsak: false,
        ogle: false,
        ikindi: false,
        aksam: false,
        yatsi: false,
    },
    yukleniyor: false,
    hata: null,
};

// Thunks

/**
 * Ayarları yerel depolamadan yükler
 */
export const vakitBildirimAyarlariniYukle = createAsyncThunk(
    'vakitBildirim/yukle',
    async () => {
        const ayarlar = await LocalVakitBildirimServisi.getAyarlar();
        return ayarlar;
    }
);

/**
 * Tek bir vakit ayarını günceller ve bildirimleri yeniden planlar
 */
export const vakitBildirimAyariniGuncelle = createAsyncThunk(
    'vakitBildirim/guncelle',
    async ({ vakit, aktif }: { vakit: keyof VakitBildirimAyarlari; aktif: boolean }) => {
        // 1. Yerel veriyi güncelle
        const yeniAyarlar = await LocalVakitBildirimServisi.updateVakitAyar(vakit, aktif);
        if (!yeniAyarlar) throw new Error('Ayar güncellenemedi');

        // 2. Bildirimleri yeniden planla (Background service)
        const yonetici = VakitBildirimYoneticiServisi.getInstance();
        await yonetici.bildirimleriGuncelle();

        return yeniAyarlar;
    }
);

/**
 * Tüm ayarları toplu günceller (Gerekirse)
 */
export const tumVakitBildirimAyarlariniGuncelle = createAsyncThunk(
    'vakitBildirim/topluGuncelle',
    async (ayarlar: VakitBildirimAyarlari) => {
        await LocalVakitBildirimServisi.saveAyarlar(ayarlar);

        const yonetici = VakitBildirimYoneticiServisi.getInstance();
        await yonetici.bildirimleriGuncelle();

        return ayarlar;
    }
);

// Slice

const vakitBildirimSlice = createSlice({
    name: 'vakitBildirim',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Yükleme
        builder.addCase(vakitBildirimAyarlariniYukle.pending, (state) => {
            state.yukleniyor = true;
            state.hata = null;
        });
        builder.addCase(vakitBildirimAyarlariniYukle.fulfilled, (state, action) => {
            state.yukleniyor = false;
            state.ayarlar = action.payload;
        });
        builder.addCase(vakitBildirimAyarlariniYukle.rejected, (state, action) => {
            state.yukleniyor = false;
            state.hata = action.error.message || 'Ayarlar yüklenemedi';
        });

        // Güncelleme
        builder.addCase(vakitBildirimAyariniGuncelle.fulfilled, (state, action) => {
            state.ayarlar = action.payload;
        });

        // Toplu Güncelleme
        builder.addCase(tumVakitBildirimAyarlariniGuncelle.fulfilled, (state, action) => {
            state.ayarlar = action.payload;
        });
    },
});

export default vakitBildirimSlice.reducer;
