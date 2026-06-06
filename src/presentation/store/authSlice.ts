/**
 * Authentication state yonetimi
 * Sadece yerel mod (Offline-only)
 */

import { createSlice } from '@reduxjs/toolkit';
import { Kullanici, AuthDurumu, SenkronizasyonDurumu } from '../../core/types';

interface AuthState {
  kullanici: Kullanici | null;
  durum: AuthDurumu;
  hata: string | null;
  senkronizasyon: SenkronizasyonDurumu;
}

const baslangicDurumu: AuthState = {
  kullanici: {
    id: 'local-user',
    email: 'yerel@kullanici.com',
    adSoyad: 'Misafir Kullanıcı',
    olusturulmaTarihi: new Date().toISOString(),
  },
  durum: 'girisYapildi', // Varsayılan olarak giriş yapılmış kabul ediyoruz
  hata: null,
  senkronizasyon: {
    sonSenkronizasyon: null,
    senkronizeEdiliyor: false,
    hata: null,
    bekleyenDegisiklikSayisi: 0,
  },
};

const authSlice = createSlice({
  name: 'auth',
  initialState: baslangicDurumu,
  reducers: {
    hataTemizle: (state) => {
      state.hata = null;
    },
  },
});

export const { hataTemizle } = authSlice.actions;
export default authSlice.reducer;

