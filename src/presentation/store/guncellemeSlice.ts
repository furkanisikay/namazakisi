/**
 * Guncelleme Redux Slice
 * Uygulama guncelleme durumunu yonetir
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  GuncellemeServisi,
  GuncellemeBilgisi,
} from '../../domain/services/GuncellemeServisi';

// ==================== STATE TIPI ====================

interface GuncellemeState {
  /** Kontrol yapiliyor mu */
  kontrolEdiliyor: boolean;
  /** Guncelleme mevcut mu */
  guncellemeMevcut: boolean;
  /** Guncelleme bilgileri */
  bilgi: GuncellemeBilgisi | null;
  /** Kullanici bildirimi kapatti mi */
  bildirimiKapatti: boolean;
  /** Hata mesaji */
  hata: string | null;
}

const baslangicDurumu: GuncellemeState = {
  kontrolEdiliyor: false,
  guncellemeMevcut: false,
  bilgi: null,
  bildirimiKapatti: false,
  hata: null,
};

// ==================== ASYNC THUNKLAR ====================

/**
 * Guncelleme kontrol et
 */
export const guncellemeKontrolEt = createAsyncThunk(
  'guncelleme/kontrolEt',
  async (zorla: boolean) => {
    const servis = GuncellemeServisi.getInstance();
    return await servis.guncellemeKontrolEt(zorla);
  }
);

/**
 * Guncellemeyi ertele
 */
export const guncellemeErtele = createAsyncThunk(
  'guncelleme/ertele',
  async (versiyon: string) => {
    const servis = GuncellemeServisi.getInstance();
    await servis.guncellemeErtele(versiyon);
    return versiyon;
  }
);

// ==================== SLICE ====================

const guncellemeSlice = createSlice({
  name: 'guncelleme',
  initialState: baslangicDurumu,
  reducers: {
    bildirimiKapat(state) {
      state.bildirimiKapatti = true;
    },
    bildirimiSifirla(state) {
      state.bildirimiKapatti = false;
    },
  },
  extraReducers: (builder) => {
    // Guncelleme kontrol
    builder
      .addCase(guncellemeKontrolEt.pending, (state) => {
        state.kontrolEdiliyor = true;
        state.hata = null;
      })
      .addCase(guncellemeKontrolEt.fulfilled, (state, action) => {
        state.kontrolEdiliyor = false;

        // Yeni versiyon tespit edildiyse bildirim durumunu sifirla
        // ONEMLI: eskiVer'i state.bilgi uzerine yazmadan ONCE oku
        if (action.payload.guncellemeMevcut) {
          const eskiVer = state.bilgi?.yeniVersiyon;
          const yeniVer = action.payload.bilgi?.yeniVersiyon;
          if (yeniVer && yeniVer !== eskiVer) {
            state.bildirimiKapatti = false;
          }
        }

        state.guncellemeMevcut = action.payload.guncellemeMevcut;
        state.bilgi = action.payload.bilgi;
      })
      .addCase(guncellemeKontrolEt.rejected, (state, action) => {
        state.kontrolEdiliyor = false;
        state.hata = action.error.message || 'Guncelleme kontrol edilemedi';
      });

    // Guncelleme ertele
    builder
      .addCase(guncellemeErtele.fulfilled, (state) => {
        state.bildirimiKapatti = true;
      });
  },
});

export const { bildirimiKapat, bildirimiSifirla } = guncellemeSlice.actions;
export default guncellemeSlice.reducer;
