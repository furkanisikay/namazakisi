/**
 * Muhafiz State Yonetimi
 * Namaz hatirlatma bildirimleri ayarlari
 * SOLID: Single Responsibility - Sadece hatirlatma ayarlari
 */

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import type { MuhafizMatrisi } from '../../core/muhafiz/matrisTipleri';
import { eskidenMatriseGoc } from '../../core/muhafiz/muhafizGoc';

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
    /** Vakit x seviye matrisi (Faz 1+; eski alanlar Faz 3'e kadar paralel korunur) */
    matris?: MuhafizMatrisi;
    /**
     * Yoğunluk 'ozel' iken en son elle ayarlanan matrisin yedeği. Kullanıcı bir
     * preset'e (hafif/normal/yogun) geçtiğinde özel yapılandırma KAYBOLMASIN diye
     * burada saklanır; "Özel"e tekrar dönülünce buradan geri yüklenir.
     */
    ozelMatrisYedegi?: MuhafizMatrisi;
}

/**
 * Varsayilan muhafiz ayarlari
 */
const initialState: MuhafizAyarlari = {
    aktif: false,
    yogunluk: 'normal',
    gelismisMod: false,
    esikler: HATIRLATMA_PRESETLERI.normal.esikler,
    sikliklar: HATIRLATMA_PRESETLERI.normal.sikliklar,
    matris: eskidenMatriseGoc({
        esikler: HATIRLATMA_PRESETLERI.normal.esikler,
        sikliklar: HATIRLATMA_PRESETLERI.normal.sikliklar,
    }),
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
                // Eski veriden sadece muhafiz ile ilgili alanlari al.
                // esikler/sikliklar ALAN-BAZLI birlestirilir: diskteki nesne mevcut ama
                // icindeki bir seviyeN eksikse (bozuk/kismi kayit), nesne-duzeyi `??`
                // devreye girmez ve undefined esik/siklik matrise sizardi -> initialState
                // ile spread ederek eksik alanlari doldur.
                const temel = {
                    aktif: parsed.aktif ?? initialState.aktif,
                    yogunluk: parsed.yogunluk ?? initialState.yogunluk,
                    gelismisMod: parsed.gelismisMod ?? initialState.gelismisMod,
                    esikler: { ...initialState.esikler, ...parsed.esikler },
                    sikliklar: { ...initialState.sikliklar, ...parsed.sikliklar },
                };
                return {
                    ...temel,
                    matris: parsed.matris ?? eskidenMatriseGoc(temel),
                    // Opsiyonel alan: diskte yoksa undefined kalır ("Özel" butonu gizli kalır).
                    ozelMatrisYedegi: parsed.ozelMatrisYedegi,
                };
            }
            return null;
        } catch (hata) {
            Logger.error('MuhafizSlice', 'Muhafiz ayarlari yuklenemedi', hata);
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
            // Faz 1'de matris eski alanlarin (esik/siklik) TUREVI'dir. Eski alanlar
            // degisip matris payload'da GELMEZSE matris'i yeniden turet; aksi halde
            // matris ilk ayar degisikliginde initialState degerlerinde BAYATLAR ve
            // yukleme migrasyonu (parsed.matris dolu oldugu icin) bir daha calismaz.
            // (Faz 2'de UI matris'i dogrudan matrisiGuncelle ile yazacak.)
            if ((action.payload.esikler || action.payload.sikliklar) && !action.payload.matris) {
                yeniState.matris = eskidenMatriseGoc(yeniState);
            }
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

        /**
         * Vakit x seviye matrisini guncelle
         */
        matrisiGuncelle: (state, action: PayloadAction<MuhafizMatrisi>) => {
            const yeniState = { ...state, matris: action.payload };
            AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI, JSON.stringify(yeniState));
            return yeniState;
        },

        /**
         * 'ozel' yogunluktaki en son matrisi yedekle. Preset'e gecmeden hemen once
         * cagrilir (guvenlik agi) ve kullanici zaten 'ozel' iken her matris
         * degisikliginde cagrilir ki yedek her zaman en guncel ozel hali tutsun.
         */
        ozelMatrisYedegiGuncelle: (state, action: PayloadAction<MuhafizMatrisi>) => {
            const yeniState = { ...state, ozelMatrisYedegi: action.payload };
            AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI, JSON.stringify(yeniState));
            return yeniState;
        },

        /**
         * Yedeklenen ozel matrisi geri yukler + yogunlugu 'ozel' yapar. Yedek
         * yoksa no-op (UI "Ozel" secenegini yedek yokken zaten gostermez).
         */
        ozelYogunluguGeriYukle: (state) => {
            if (!state.ozelMatrisYedegi) return state;
            const yeniState: MuhafizAyarlari = {
                ...state,
                matris: state.ozelMatrisYedegi,
                yogunluk: 'ozel',
            };
            AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI, JSON.stringify(yeniState));
            return yeniState;
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

export const {
    muhafizAyarlariniGuncelle,
    muhafizStateSifirla,
    matrisiGuncelle,
    ozelMatrisYedegiGuncelle,
    ozelYogunluguGeriYukle,
} = muhafizSlice.actions;
export default muhafizSlice.reducer;
