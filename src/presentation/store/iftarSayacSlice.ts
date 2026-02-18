/**
 * İftar Sayacı Redux Slice
 * İftar sayacı ayarlarını yönetir
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';

/**
 * İftar sayacı ayarları
 */
export interface IftarSayacAyarlari {
  aktif: boolean;  // Master toggle
}

interface IftarSayacState {
  ayarlar: IftarSayacAyarlari;
  yukleniyor: boolean;
  hata: string | null;
}

const initialState: IftarSayacState = {
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
export const iftarSayacAyarlariniYukle = createAsyncThunk(
  'iftarSayac/yukle',
  async () => {
    try {
      const veri = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.IFTAR_SAYAC_AYARLARI);
      if (veri) {
        return JSON.parse(veri) as IftarSayacAyarlari;
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
export const iftarSayacAyariniGuncelle = createAsyncThunk(
  'iftarSayac/guncelle',
  async (ayarlar: Partial<IftarSayacAyarlari>, { getState }) => {
    try {
      const state = (getState() as any).iftarSayac as IftarSayacState;
      const yeniAyarlar: IftarSayacAyarlari = {
        ...state.ayarlar,
        ...ayarlar,
      };

      await AsyncStorage.setItem(
        DEPOLAMA_ANAHTARLARI.IFTAR_SAYAC_AYARLARI,
        JSON.stringify(yeniAyarlar)
      );

      return yeniAyarlar;
    } catch (error) {
      throw error;
    }
  }
);

// Slice

const iftarSayacSlice = createSlice({
  name: 'iftarSayac',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Yükleme
    builder.addCase(iftarSayacAyarlariniYukle.pending, (state) => {
      state.yukleniyor = true;
      state.hata = null;
    });
    builder.addCase(iftarSayacAyarlariniYukle.fulfilled, (state, action) => {
      state.yukleniyor = false;
      state.ayarlar = action.payload;
    });
    builder.addCase(iftarSayacAyarlariniYukle.rejected, (state, action) => {
      state.yukleniyor = false;
      state.hata = action.error.message || 'Ayarlar yüklenemedi';
    });

    // Güncelleme
    builder.addCase(iftarSayacAyariniGuncelle.fulfilled, (state, action) => {
      state.ayarlar = action.payload;
    });
    builder.addCase(iftarSayacAyariniGuncelle.rejected, (state, action) => {
      state.hata = action.error.message || 'Ayar güncellenemedi';
    });
  },
});

export default iftarSayacSlice.reducer;
