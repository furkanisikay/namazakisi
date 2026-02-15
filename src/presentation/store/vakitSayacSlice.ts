/**
 * Vakit Sayacı Redux Slice
 * Vakit sayacı ayarlarını yönetir
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';

/**
 * Vakit sayacı ayarları
 */
export interface VakitSayacAyarlari {
  aktif: boolean;  // Master toggle
}

interface VakitSayacState {
  ayarlar: VakitSayacAyarlari;
  yukleniyor: boolean;
  hata: string | null;
}

const initialState: VakitSayacState = {
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
export const vakitSayacAyarlariniYukle = createAsyncThunk(
  'vakitSayac/yukle',
  async () => {
    try {
      const veri = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.VAKIT_SAYAC_AYARLARI);
      if (veri) {
        return JSON.parse(veri) as VakitSayacAyarlari;
      }
      return { aktif: false };
    } catch (error) {
      console.error('[vakitSayacSlice] Ayarlar yüklenemedi:', error);
      return { aktif: false };
    }
  }
);

/**
 * Ayarı günceller
 */
export const vakitSayacAyariniGuncelle = createAsyncThunk(
  'vakitSayac/guncelle',
  async (ayarlar: Partial<VakitSayacAyarlari>, { getState }) => {
    try {
      const state = (getState() as any).vakitSayac as VakitSayacState;
      const yeniAyarlar: VakitSayacAyarlari = {
        ...state.ayarlar,
        ...ayarlar,
      };

      await AsyncStorage.setItem(
        DEPOLAMA_ANAHTARLARI.VAKIT_SAYAC_AYARLARI,
        JSON.stringify(yeniAyarlar)
      );

      return yeniAyarlar;
    } catch (error) {
      console.error('[vakitSayacSlice] Ayar güncellenemedi:', error);
      throw error;
    }
  }
);

// Slice

const vakitSayacSlice = createSlice({
  name: 'vakitSayac',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Yükleme
    builder.addCase(vakitSayacAyarlariniYukle.pending, (state) => {
      state.yukleniyor = true;
      state.hata = null;
    });
    builder.addCase(vakitSayacAyarlariniYukle.fulfilled, (state, action) => {
      state.yukleniyor = false;
      state.ayarlar = action.payload;
    });
    builder.addCase(vakitSayacAyarlariniYukle.rejected, (state, action) => {
      state.yukleniyor = false;
      state.hata = action.error.message || 'Ayarlar yüklenemedi';
    });

    // Güncelleme
    builder.addCase(vakitSayacAyariniGuncelle.fulfilled, (state, action) => {
      state.ayarlar = action.payload;
    });
    builder.addCase(vakitSayacAyariniGuncelle.rejected, (state, action) => {
      state.hata = action.error.message || 'Ayar güncellenemedi';
    });
  },
});

export default vakitSayacSlice.reducer;
