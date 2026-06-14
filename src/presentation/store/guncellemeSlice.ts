/**
 * Guncelleme Redux Slice
 * Uygulama guncelleme durumunu yonetir
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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
  /**
   * Play Store esnek guncelleme indirilip kurulmaya HAZIR mi.
   *
   * true oldugunda kullaniciya "Yeniden baslat" onayi gosterilir; uygulama
   * ONAY OLMADAN otomatik yeniden baslatilmaz (issue #91: onaysiz completeUpdate
   * kullaniciyi ekrani gormeden disari atiyordu).
   */
  indirmeTamamlandi: boolean;
  /** Hata mesaji */
  hata: string | null;
}

const baslangicDurumu: GuncellemeState = {
  kontrolEdiliyor: false,
  guncellemeMevcut: false,
  bilgi: null,
  bildirimiKapatti: false,
  indirmeTamamlandi: false,
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
    /**
     * Play Store esnek guncellemenin indirilip kurulmaya hazir oldugunu isaretler.
     * UI bunu gorunce "Yeniden baslat" onayini gosterir (otomatik restart YOK).
     */
    indirmeTamamlandiIsaretle(state) {
      state.indirmeTamamlandi = true;
    },
    /** Indirme-tamamlandi onay durumunu sifirlar (ornegin onay UI'i kapatilinca). */
    indirmeDurumuSifirla(state) {
      state.indirmeTamamlandi = false;
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

export const {
  bildirimiKapat,
  bildirimiSifirla,
  indirmeTamamlandiIsaretle,
  indirmeDurumuSifirla,
} = guncellemeSlice.actions;
export default guncellemeSlice.reducer;
