/**
 * Muhafiz State Yonetimi
 * Namaz hatirlatma bildirimleri ayarlari
 * SOLID: Single Responsibility - Sadece hatirlatma ayarlari
 */

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';

/**
 * Hatirlatma yogunlugu preset tipleri
 * 'ozel' secilirse kullanici gelismis ayarlardan kendisi yapar
 */
export type HatirlatmaYogunlugu = 'hafif' | 'normal' | 'yogun' | 'ozel';

/**
 * Preset ayarlari - kullanici basitce secsin
 */
export const HATIRLATMA_PRESETLERI: Record<Exclude<HatirlatmaYogunlugu, 'ozel'>, {
    aciklama: string;
    ikon: string;
    esikler: { seviye1: number; seviye2: number; seviye3: number; seviye4: number };
    sikliklar: { seviye1: number; seviye2: number; seviye3: number; seviye4: number };
}> = {
    hafif: {
        aciklama: 'Az hatırlatma',
        ikon: '🔔',
        esikler: { seviye1: 30, seviye2: 10, seviye3: 5, seviye4: 2 },
        sikliklar: { seviye1: 30, seviye2: 10, seviye3: 5, seviye4: 2 },
    },
    normal: {
        aciklama: 'Dengeli',
        ikon: '🔔🔔',
        esikler: { seviye1: 45, seviye2: 25, seviye3: 10, seviye4: 3 },
        sikliklar: { seviye1: 20, seviye2: 10, seviye3: 5, seviye4: 2 },
    },
    yogun: {
        aciklama: 'Çok hatırlatma',
        ikon: '🔔🔔🔔',
        esikler: { seviye1: 60, seviye2: 30, seviye3: 15, seviye4: 5 },
        sikliklar: { seviye1: 10, seviye2: 5, seviye3: 3, seviye4: 1 },
    },
};

/**
 * Muhafiz ayarlari arayuzu
 * Sadece hatirlatma ile ilgili alanlar
 */
export interface MuhafizAyarlari {
    /** Muhafiz aktif mi */
    aktif: boolean;
    /** Hatirlatma yogunlugu preset secimi */
    yogunluk: HatirlatmaYogunlugu;
    /** Gelismis mod acik mi */
    gelismisMod: boolean;
    /** Seviye esikleri (dakika) */
    esikler: {
        seviye1: number;
        seviye2: number;
        seviye3: number;
        seviye4: number;
    };
    /** Tekrar sikliklari (dakika) */
    sikliklar: {
        seviye1: number;
        seviye2: number;
        seviye3: number;
        seviye4: number;
    };
}

/**
 * Varsayilan muhafiz ayarlari
 */
const initialState: MuhafizAyarlari = {
    aktif: true,
    yogunluk: 'normal',
    gelismisMod: false,
    esikler: HATIRLATMA_PRESETLERI.normal.esikler,
    sikliklar: HATIRLATMA_PRESETLERI.normal.sikliklar,
};

/**
 * Muhafiz ayarlarini AsyncStorage'dan yukle
 */
export const muhafizAyarlariniYukle = createAsyncThunk(
    'muhafiz/yukle',
    async () => {
        try {
            const veri = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI);
            if (veri) {
                const parsed = JSON.parse(veri);
                // Eski veriden sadece muhafiz ile ilgili alanlari al
                return {
                    aktif: parsed.aktif ?? initialState.aktif,
                    yogunluk: parsed.yogunluk ?? initialState.yogunluk,
                    gelismisMod: parsed.gelismisMod ?? initialState.gelismisMod,
                    esikler: parsed.esikler ?? initialState.esikler,
                    sikliklar: parsed.sikliklar ?? initialState.sikliklar,
                };
            }
            return null;
        } catch (hata) {
            console.error('Muhafiz ayarlari yuklenemedi:', hata);
            return null;
        }
    }
);

/**
 * Muhafiz slice tanimlamasi
 */
const muhafizSlice = createSlice({
    name: 'muhafiz',
    initialState,
    reducers: {
        /**
         * Muhafiz ayarlarini guncelle
         */
        muhafizAyarlariniGuncelle: (state, action: PayloadAction<Partial<MuhafizAyarlari>>) => {
            const yeniState = { ...state, ...action.payload };
            // Ayarlari kaydet
            AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI, JSON.stringify(yeniState));
            return yeniState;
        },

        /**
         * Muhafiz state'ini sifirla
         */
        muhafizStateSifirla: () => {
            AsyncStorage.removeItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI);
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(muhafizAyarlariniYukle.fulfilled, (state, action) => {
            if (action.payload) {
                return { ...state, ...action.payload };
            }
        });
    },
});

export const { muhafizAyarlariniGuncelle, muhafizStateSifirla } = muhafizSlice.actions;
export default muhafizSlice.reducer;
