/**
 * Sahur Sayacı Redux Slice
 * Sahur sayacı ayarlarını yönetir
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';

/**
 * Sahur sayacı ayarları
 */
export interface SahurSayacAyarlari {
    aktif: boolean;  // Master toggle
}

interface SahurSayacState {
    ayarlar: SahurSayacAyarlari;
    yukleniyor: boolean;
    hata: string | null;
}

const initialState: SahurSayacState = {
    ayarlar: {
        aktif: false,  // Varsayılan olarak kapalı
    },
    yukleniyor: false,
    hata: null,
};

// Thunks

/**
 * Ayarları yerel depolamadan yükler
 */
export const sahurSayacAyarlariniYukle = createAsyncThunk(
    'sahurSayac/yukle',
    async () => {
        try {
            const veri = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.SAHUR_SAYAC_AYARLARI);
            if (veri) {
                return JSON.parse(veri) as SahurSayacAyarlari;
            }
            return { aktif: false };
        } catch (error) {
            return { aktif: false };
        }
    }
);

/**
 * Ayarı günceller
 */
export const sahurSayacAyariniGuncelle = createAsyncThunk(
    'sahurSayac/guncelle',
    async (ayarlar: Partial<SahurSayacAyarlari>, { getState }) => {
        try {
            const state = (getState() as any).sahurSayac as SahurSayacState;
            const yeniAyarlar: SahurSayacAyarlari = {
                ...state.ayarlar,
                ...ayarlar,
            };

            await AsyncStorage.setItem(
                DEPOLAMA_ANAHTARLARI.SAHUR_SAYAC_AYARLARI,
                JSON.stringify(yeniAyarlar)
            );

            return yeniAyarlar;
        } catch (error) {
            throw error;
        }
    }
);

// Slice

const sahurSayacSlice = createSlice({
    name: 'sahurSayac',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Yükleme
        builder.addCase(sahurSayacAyarlariniYukle.pending, (state) => {
            state.yukleniyor = true;
            state.hata = null;
        });
        builder.addCase(sahurSayacAyarlariniYukle.fulfilled, (state, action) => {
            state.yukleniyor = false;
            state.ayarlar = action.payload;
        });
        builder.addCase(sahurSayacAyarlariniYukle.rejected, (state, action) => {
            state.yukleniyor = false;
            state.hata = action.error.message || 'Ayarlar yüklenemedi';
        });

        // Güncelleme
        builder.addCase(sahurSayacAyariniGuncelle.fulfilled, (state, action) => {
            state.ayarlar = action.payload;
        });
        builder.addCase(sahurSayacAyariniGuncelle.rejected, (state, action) => {
            state.hata = action.error.message || 'Ayar güncellenemedi';
        });
    },
});

export default sahurSayacSlice.reducer;
