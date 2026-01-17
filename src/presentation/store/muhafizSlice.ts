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

export interface MuhafizAyarlari {
    aktif: boolean;
    /** Hatirlatma yogunlugu preset secimi */
    yogunluk: HatirlatmaYogunlugu;
    /** Gelismis mod acik mi? */
    gelismisMod: boolean;
    konumModu: 'oto' | 'manuel';
    /** @deprecated Eski sistem - seciliIlId ve seciliIlceId kullanin */
    seciliSehirId: string;
    /** Secili il ID'si (1-81) */
    seciliIlId: number | null;
    /** Secili ilce ID'si */
    seciliIlceId: number | null;
    /** Secili il adi (gosterim icin) */
    seciliIlAdi: string;
    /** Secili ilce adi (gosterim icin) */
    seciliIlceAdi: string;
    /** GPS konum icin adres bilgisi (semt/ilce/il) */
    gpsAdres: {
        semt: string;
        ilce: string;
        il: string;
    } | null;
    koordinatlar: {
        lat: number;
        lng: number;
    };
    esikler: {
        seviye1: number; // dk
        seviye2: number;
        seviye3: number;
        seviye4: number;
    };
    sikliklar: {
        seviye1: number; // dk
        seviye2: number;
        seviye3: number;
        seviye4: number;
    };
}

const initialState: MuhafizAyarlari = {
    aktif: true,
    yogunluk: 'normal',
    gelismisMod: false,
    konumModu: 'manuel',
    seciliSehirId: '34', // Eski sistem - geriye uyumluluk
    seciliIlId: 34, // Istanbul
    seciliIlceId: null,
    seciliIlAdi: 'İstanbul',
    seciliIlceAdi: '',
    gpsAdres: null,
    koordinatlar: {
        lat: 41.0082,
        lng: 28.9784,
    },
    esikler: HATIRLATMA_PRESETLERI.normal.esikler,
    sikliklar: HATIRLATMA_PRESETLERI.normal.sikliklar,
};

/**
 * Muhafiz ayarlarini yukle
 */
export const muhafizAyarlariniYukle = createAsyncThunk(
    'muhafiz/yukle',
    async () => {
        try {
            const veri = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI);
            return veri ? JSON.parse(veri) : null;
        } catch (e) {
            console.error('Muhafiz ayarlari yuklenemedi:', e);
            return null;
        }
    }
);

const muhafizSlice = createSlice({
    name: 'muhafiz',
    initialState,
    reducers: {
        muhafizAyarlariniGuncelle: (state, action: PayloadAction<Partial<MuhafizAyarlari>>) => {
            const newState = { ...state, ...action.payload };
            // Ayarlari kaydet (arka planda)
            AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI, JSON.stringify(newState));
            return newState;
        },
        konumGuncelle: (state, action: PayloadAction<{ lat: number, lng: number }>) => {
            state.koordinatlar = action.payload;
            AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI, JSON.stringify(state));
        },
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

export const { muhafizAyarlariniGuncelle, konumGuncelle, muhafizStateSifirla } = muhafizSlice.actions;
export default muhafizSlice.reducer;
