/**
 * Seri Sayacı Redux Slice
 * Seri sayacı (imsak geri sayım) ayarlarını yönetir
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';

export interface SeriSayacAyarlari {
  aktif: boolean;
}

interface SeriSayacState {
  ayarlar: SeriSayacAyarlari;
  yukleniyor: boolean;
  hata: string | null;
}

const initialState: SeriSayacState = {
  ayarlar: {
    aktif: false,
  },
  yukleniyor: false,
  hata: null,
};

/**
 * Ayarları yerel depolamadan yükler
 */
export const seriSayacAyarlariniYukle = createAsyncThunk(
  'seriSayac/yukle',
  async () => {
    try {
      const veri = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.SERI_SAYAC_AYARLARI);
      if (veri) {
        return JSON.parse(veri) as SeriSayacAyarlari;
      }
      return { aktif: false };
    } catch (error) {
      return { aktif: false };
    }
  }
);

/**
 * Ayarı günceller ve depolar
 */
export const seriSayacAyariniGuncelle = createAsyncThunk(
  'seriSayac/guncelle',
  async (ayarlar: Partial<SeriSayacAyarlari>, { getState }) => {
    try {
      const state = (getState() as any).seriSayac as SeriSayacState;
      const yeniAyarlar: SeriSayacAyarlari = {
        ...state.ayarlar,
        ...ayarlar,
      };

      await AsyncStorage.setItem(
        DEPOLAMA_ANAHTARLARI.SERI_SAYAC_AYARLARI,
        JSON.stringify(yeniAyarlar)
      );

      return yeniAyarlar;
    } catch (error) {
      throw error;
    }
  }
);

const seriSayacSlice = createSlice({
  name: 'seriSayac',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(seriSayacAyarlariniYukle.pending, (state) => {
      state.yukleniyor = true;
      state.hata = null;
    });
    builder.addCase(seriSayacAyarlariniYukle.fulfilled, (state, action) => {
      state.yukleniyor = false;
      state.ayarlar = action.payload;
    });
    builder.addCase(seriSayacAyarlariniYukle.rejected, (state, action) => {
      state.yukleniyor = false;
      state.hata = action.error.message || 'Ayarlar yüklenemedi';
    });

    builder.addCase(seriSayacAyariniGuncelle.fulfilled, (state, action) => {
      state.ayarlar = action.payload;
    });
    builder.addCase(seriSayacAyariniGuncelle.rejected, (state, action) => {
      state.hata = action.error.message || 'Ayar güncellenemedi';
    });
  },
});

export default seriSayacSlice.reducer;
