/**
 * Vakit Sayacı Redux Slice
 * Vakit sayacı ayarlarını yönetir
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import type { RootState } from './store';

/**
 * Vakit sayacı ayarları
 */
export interface VakitSayacAyarlari {
  aktif: boolean;  // Master toggle
  sayacBaslangicSeviyesi?: number; // 1, 2, 3, 4 (Muhafız seviyeleri)
}

interface VakitSayacState {
  ayarlar: VakitSayacAyarlari;
  yukleniyor: boolean;
  hata: string | null;
}

const initialState: VakitSayacState = {
  ayarlar: {
    aktif: false,  // Varsayılan olarak kapalı
    sayacBaslangicSeviyesi: 1, // Varsayılan olarak Seviye 1
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
        const parsed = JSON.parse(veri) as Partial<VakitSayacAyarlari> | null;
        return {
          aktif: parsed?.aktif === true,
          sayacBaslangicSeviyesi:
            typeof parsed?.sayacBaslangicSeviyesi === 'number'
              ? parsed.sayacBaslangicSeviyesi
              : 1,
        };
      }
      return { aktif: false, sayacBaslangicSeviyesi: 1 };
    } catch (error) {
      Logger.error('vakitSayacSlice', 'Ayarlar yuklenemedi', error);
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
      const state = (getState() as RootState).vakitSayac;
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
      Logger.error('vakitSayacSlice', 'Ayar guncellenemedi', error);
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
