/**
 * Konum State Yonetimi
 * Uygulama genelinde konum bilgisini yoneten slice
 * 
 * SOLID: Single Responsibility - Sadece state yonetimi
 * Persistence islemleri LocalKonumServisi'ne devredildi
 */

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
    localKonumAyarlariniGetir,
    localKonumAyarlariniKaydet,
    localKonumVerileriniTemizle,
    KonumAyarlari,
    GpsAdres,
    Koordinatlar,
    KonumModu,
    VARSAYILAN_KONUM_AYARLARI,
} from '../../data/local/LocalKonumServisi';

// Tipleri re-export et (geriye uyumluluk icin)
export type { GpsAdres, Koordinatlar, KonumModu, KonumAyarlari };

/**
 * Konum state arayuzu
 * KonumAyarlari + yukleniyor durumu
 */
export interface KonumState extends KonumAyarlari {
    /** Konum yuklenme durumu */
    yukleniyor: boolean;
}

/**
 * Varsayilan konum state'i (Istanbul)
 */
const varsayilanKonum: KonumState = {
    ...VARSAYILAN_KONUM_AYARLARI,
    yukleniyor: false,
};

// ==================== ASYNC THUNKS ====================

/**
 * Konum ayarlarini AsyncStorage'dan yukle
 */
export const konumAyarlariniYukle = createAsyncThunk(
    'konum/yukle',
    async () => {
        const yanit = await localKonumAyarlariniGetir();
        if (!yanit.basarili) {
            throw new Error(yanit.hata || 'Konum ayarlari yuklenemedi');
        }
        return yanit.veri;
    }
);

/**
 * Konum ayarlarini AsyncStorage'a kaydet
 */
export const konumAyarlariniKaydetAsync = createAsyncThunk(
    'konum/kaydet',
    async (ayarlar: Partial<KonumState>, { getState }) => {
        const state = getState() as { konum: KonumState };
        const mevcutAyarlar = state.konum;

        // yukleniyor state'te tutulur, storage'a kaydedilmez
        const { yukleniyor: _yukleniyor, ...mevcutKonumAyarlari } = mevcutAyarlar;
        const { yukleniyor: _yeniYukleniyor, ...yeniAyarlar } = ayarlar as Partial<KonumState>;

        const guncelAyarlar: KonumAyarlari = {
            ...mevcutKonumAyarlari,
            ...yeniAyarlar,
        };

        const yanit = await localKonumAyarlariniKaydet(guncelAyarlar);
        if (!yanit.basarili) {
            throw new Error(yanit.hata || 'Konum ayarlari kaydedilemedi');
        }

        return guncelAyarlar;
    }
);

/**
 * Konum verilerini temizle (sifirla)
 */
export const konumVerileriniTemizleAsync = createAsyncThunk(
    'konum/temizle',
    async () => {
        const yanit = await localKonumVerileriniTemizle();
        if (!yanit.basarili) {
            throw new Error(yanit.hata || 'Konum verileri temizlenemedi');
        }
        return true;
    }
);

// ==================== SLICE ====================

/**
 * Konum slice tanimlamasi
 */
const konumSlice = createSlice({
    name: 'konum',
    initialState: varsayilanKonum,
    reducers: {
        /**
         * Konum ayarlarini guncelle (senkron + async kayit)
         * Eski API ile uyumluluk icin tutuluyor
         * Yeni kodlarda konumAyarlariniKaydetAsync tercih edilmeli
         */
        konumAyarlariniGuncelle: (state, action: PayloadAction<Partial<KonumState>>) => {
            const yeniState = { ...state, ...action.payload };
            console.log('[KonumSlice] State guncelleniyor (sync):', yeniState.konumModu, yeniState.seciliIlAdi);

            // Arka planda kaydet (fire-and-forget)
            // Not: Bu sync reducer icinde async islem - ideal degil ama geriye uyumluluk icin
            const { yukleniyor: _yukleniyor, ...konumAyarlari } = yeniState;
            localKonumAyarlariniKaydet(konumAyarlari)
                .then(() => console.log('[KonumSlice] Arka plan kayit basarili'))
                .catch((err) => console.error('[KonumSlice] Arka plan kayit hatasi:', err));

            return yeniState;
        },

        /**
         * Sadece koordinatlari guncelle (senkron)
         */
        koordinatlariGuncelle: (state, action: PayloadAction<Koordinatlar>) => {
            state.koordinatlar = action.payload;

            // Arka planda kaydet
            const { yukleniyor: _yukleniyor, ...konumAyarlari } = state;
            localKonumAyarlariniKaydet(konumAyarlari);
        },

        /**
         * GPS adresini guncelle (senkron)
         */
        gpsAdresiniGuncelle: (state, action: PayloadAction<GpsAdres | null>) => {
            state.gpsAdres = action.payload;
            if (action.payload) {
                state.sonGpsGuncellemesi = new Date().toISOString();
            }

            // Arka planda kaydet
            const { yukleniyor: _yukleniyor, ...konumAyarlari } = state;
            localKonumAyarlariniKaydet(konumAyarlari);
        },

        /**
         * Yukleme durumunu ayarla
         */
        yuklemeDurumunuAyarla: (state, action: PayloadAction<boolean>) => {
            state.yukleniyor = action.payload;
        },

        /**
         * Konum state'ini sifirla (senkron)
         * Async temizlik icin konumVerileriniTemizleAsync kullanin
         */
        konumStateSifirla: () => {
            // Arka planda temizle
            localKonumVerileriniTemizle();
            return varsayilanKonum;
        },
    },
    extraReducers: (builder) => {
        // Konum ayarlarini yukle
        builder
            .addCase(konumAyarlariniYukle.pending, (state) => {
                state.yukleniyor = true;
            })
            .addCase(konumAyarlariniYukle.fulfilled, (state, action) => {
                // ONEMLI: Immer'da ya state'i mutate et YA DA yeni deger return et
                if (action.payload) {
                    console.log('[KonumSlice] State guncelleniyor, konumModu:', action.payload.konumModu);
                    return { ...state, ...action.payload, yukleniyor: false };
                }
                // Payload yoksa (ilk calisma) sadece yukleniyor'u kapat
                return { ...state, yukleniyor: false };
            })
            .addCase(konumAyarlariniYukle.rejected, (state) => {
                state.yukleniyor = false;
            });

        // Konum ayarlarini kaydet (async)
        builder
            .addCase(konumAyarlariniKaydetAsync.fulfilled, (state, action) => {
                console.log('[KonumSlice] Async kayit basarili:', action.payload.konumModu);
                return { ...state, ...action.payload };
            })
            .addCase(konumAyarlariniKaydetAsync.rejected, (_state, action) => {
                console.error('[KonumSlice] Async kayit hatasi:', action.error.message);
            });

        // Konum verilerini temizle
        builder
            .addCase(konumVerileriniTemizleAsync.fulfilled, () => {
                console.log('[KonumSlice] Veriler temizlendi, varsayilana donuluyor');
                return varsayilanKonum;
            });
    },
});

export const {
    konumAyarlariniGuncelle,
    koordinatlariGuncelle,
    gpsAdresiniGuncelle,
    yuklemeDurumunuAyarla,
    konumStateSifirla,
} = konumSlice.actions;

export default konumSlice.reducer;
