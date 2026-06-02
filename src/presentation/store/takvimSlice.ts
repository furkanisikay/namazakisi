/**
 * Takvim Entegrasyonu State Yonetimi
 * Namaz vakitleri icin cihaz takvimi etkinlikleri ayarlari
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import type { RootState } from './store';

export type TakvimVakitAdi = 'imsak' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';

export type BaslangicTipi =
    | 'vakit_oncesi'   // vakit cikismadan X dk once
    | 'vakit_girisi'   // tam vakit girince
    | 'vakit_sonrasi'; // vakit girdikten X dk sonra

export interface VakitTakvimAyari {
    aktif: boolean;
    sureDakika: number;
    baslangicTipi: BaslangicTipi;
    dakika: number;
}

export interface TakvimAyarlari {
    aktif: boolean;
    takvimId: string | null;
    takvimAdi: string | null;
    kaciGunIlerisi: 7 | 14 | 30;
    vakitAyarlari: Record<TakvimVakitAdi, VakitTakvimAyari>;
}

interface TakvimState {
    ayarlar: TakvimAyarlari;
    yukleniyor: boolean;
    olayOlusturuluyor: boolean;
    hata: string | null;
}

const VARSAYILAN_VAKIT_AYARI: VakitTakvimAyari = {
    aktif: false,
    sureDakika: 15,
    baslangicTipi: 'vakit_girisi',
    dakika: 5,
};

export const VARSAYILAN_TAKVIM_AYARLARI: TakvimAyarlari = {
    aktif: false,
    takvimId: null,
    takvimAdi: null,
    kaciGunIlerisi: 7,
    vakitAyarlari: {
        imsak:  { ...VARSAYILAN_VAKIT_AYARI },
        ogle:   { ...VARSAYILAN_VAKIT_AYARI },
        ikindi: { ...VARSAYILAN_VAKIT_AYARI },
        aksam:  { ...VARSAYILAN_VAKIT_AYARI },
        yatsi:  { ...VARSAYILAN_VAKIT_AYARI },
    },
};

const initialState: TakvimState = {
    ayarlar: VARSAYILAN_TAKVIM_AYARLARI,
    yukleniyor: false,
    olayOlusturuluyor: false,
    hata: null,
};

export const takvimAyarlariniYukle = createAsyncThunk(
    'takvim/yukle',
    async () => {
        try {
            const veri = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.TAKVIM_AYARLARI);
            if (veri) {
                const parsed = JSON.parse(veri) as Partial<TakvimAyarlari>;
                return {
                    ...VARSAYILAN_TAKVIM_AYARLARI,
                    ...parsed,
                    vakitAyarlari: {
                        ...VARSAYILAN_TAKVIM_AYARLARI.vakitAyarlari,
                        ...parsed.vakitAyarlari,
                    },
                } as TakvimAyarlari;
            }
            return null;
        } catch (hata) {
            Logger.error('TakvimSlice', 'Takvim ayarlari yuklenemedi', hata);
            return null;
        }
    }
);

export const takvimAyarlariniGuncelle = createAsyncThunk(
    'takvim/guncelle',
    async (degisiklik: Partial<TakvimAyarlari>, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const mevcutAyarlar = state.takvim.ayarlar;
            const yeniAyarlar: TakvimAyarlari = {
                ...mevcutAyarlar,
                ...degisiklik,
                vakitAyarlari: degisiklik.vakitAyarlari
                    ? { ...mevcutAyarlar.vakitAyarlari, ...degisiklik.vakitAyarlari }
                    : mevcutAyarlar.vakitAyarlari,
            };
            await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.TAKVIM_AYARLARI, JSON.stringify(yeniAyarlar));
            return yeniAyarlar;
        } catch (hata: any) {
            Logger.error('TakvimSlice', 'Ayarlar kaydedilemedi', hata);
            return rejectWithValue(hata?.message || 'Ayarlar kaydedilemedi');
        }
    }
);

export const takvimOlaylariniOlustur = createAsyncThunk(
    'takvim/olayOlustur',
    async (
        { ayarlar, koordinatlar }: { ayarlar: TakvimAyarlari; koordinatlar: { lat: number; lng: number } },
        { rejectWithValue }
    ) => {
        try {
            const { TakvimServisi } = await import('../../domain/services/TakvimServisi');
            const sayi = await TakvimServisi.getInstance().takvimOlaylariOlustur(ayarlar, koordinatlar);
            return { olusturulanSayi: sayi };
        } catch (hata: any) {
            Logger.error('TakvimSlice', 'Olaylar olusturulamadi', hata);
            return rejectWithValue(hata?.message || 'Bilinmeyen hata');
        }
    }
);

const takvimSlice = createSlice({
    name: 'takvim',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(takvimAyarlariniYukle.pending, (state) => {
                state.yukleniyor = true;
            })
            .addCase(takvimAyarlariniYukle.fulfilled, (state, action) => {
                state.yukleniyor = false;
                if (action.payload) {
                    state.ayarlar = action.payload;
                }
            })
            .addCase(takvimAyarlariniYukle.rejected, (state) => {
                state.yukleniyor = false;
            })
            .addCase(takvimAyarlariniGuncelle.fulfilled, (state, action) => {
                state.ayarlar = action.payload;
                state.hata = null;
            })
            .addCase(takvimAyarlariniGuncelle.rejected, (state, action) => {
                state.hata = action.payload as string;
            })
            .addCase(takvimOlaylariniOlustur.pending, (state) => {
                state.olayOlusturuluyor = true;
                state.hata = null;
            })
            .addCase(takvimOlaylariniOlustur.fulfilled, (state) => {
                state.olayOlusturuluyor = false;
            })
            .addCase(takvimOlaylariniOlustur.rejected, (state, action) => {
                state.olayOlusturuluyor = false;
                state.hata = action.payload as string;
            });
    },
});

export default takvimSlice.reducer;
