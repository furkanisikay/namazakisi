/**
 * Konum State Yonetimi
 * Uygulama genelinde konum bilgisini yoneten slice
 * SOLID: Single Responsibility - Sadece konum islemleri
 */

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Depolama anahtari */
const KONUM_DEPOLAMA_ANAHTARI = '@namaz_akisi/konum_ayarlari';

/**
 * GPS adres bilgisi
 */
export interface GpsAdres {
    semt: string;
    ilce: string;
    il: string;
}

/**
 * Koordinat bilgisi
 */
export interface Koordinatlar {
    lat: number;
    lng: number;
}

/**
 * Konum modu tipi
 */
export type KonumModu = 'oto' | 'manuel';

/**
 * Konum state arayuzu
 */
export interface KonumState {
    /** Konum modu: oto (GPS) veya manuel (sehir secimi) */
    konumModu: KonumModu;
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
    /** GPS konum icin adres bilgisi */
    gpsAdres: GpsAdres | null;
    /** Koordinat bilgisi */
    koordinatlar: Koordinatlar;
    /** Konum yuklenme durumu */
    yukleniyor: boolean;
    /** Son GPS guncelleme zamani (ISO string) */
    sonGpsGuncellemesi: string | null;
    /** Akilli konum takibi aktif mi (arka plan) */
    akilliTakipAktif: boolean;
}

/**
 * Varsayilan konum state'i (Istanbul)
 */
const varsayilanKonum: KonumState = {
    konumModu: 'manuel',
    seciliSehirId: '34',
    seciliIlId: 34,
    seciliIlceId: null,
    seciliIlAdi: 'İstanbul',
    seciliIlceAdi: '',
    gpsAdres: null,
    koordinatlar: {
        lat: 41.0082,
        lng: 28.9784,
    },
    yukleniyor: false,
    sonGpsGuncellemesi: null,
    akilliTakipAktif: false,
};

/**
 * Konum ayarlarini AsyncStorage'dan yukle
 */
export const konumAyarlariniYukle = createAsyncThunk(
    'konum/yukle',
    async () => {
        try {
            console.log('[KonumSlice] AsyncStorage\'dan yukleniyor...');
            const veri = await AsyncStorage.getItem(KONUM_DEPOLAMA_ANAHTARI);
            console.log('[KonumSlice] Yuklenen veri:', veri);
            const parsed = veri ? JSON.parse(veri) : null;
            console.log('[KonumSlice] Parse edilmis veri:', parsed?.konumModu, parsed?.seciliIlAdi);
            return parsed;
        } catch (hata) {
            console.error('[KonumSlice] Konum ayarlari yuklenemedi:', hata);
            return null;
        }
    }
);

/**
 * Konum slice tanimlamasi
 */
const konumSlice = createSlice({
    name: 'konum',
    initialState: varsayilanKonum,
    reducers: {
        /**
         * Konum ayarlarini guncelle
         */
        konumAyarlariniGuncelle: (state, action: PayloadAction<Partial<KonumState>>) => {
            const yeniState = { ...state, ...action.payload };
            console.log('[KonumSlice] Kaydediliyor:', yeniState.konumModu, yeniState.seciliIlAdi);
            // Ayarlari kaydet (arka planda)
            AsyncStorage.setItem(KONUM_DEPOLAMA_ANAHTARI, JSON.stringify(yeniState))
                .then(() => console.log('[KonumSlice] AsyncStorage kayit BASARILI'))
                .catch((err) => console.error('[KonumSlice] AsyncStorage kayit HATA:', err));
            return yeniState;
        },

        /**
         * Sadece koordinatlari guncelle
         */
        koordinatlariGuncelle: (state, action: PayloadAction<Koordinatlar>) => {
            state.koordinatlar = action.payload;
            AsyncStorage.setItem(KONUM_DEPOLAMA_ANAHTARI, JSON.stringify(state));
        },

        /**
         * GPS adresini guncelle
         */
        gpsAdresiniGuncelle: (state, action: PayloadAction<GpsAdres | null>) => {
            state.gpsAdres = action.payload;
            AsyncStorage.setItem(KONUM_DEPOLAMA_ANAHTARI, JSON.stringify(state));
        },

        /**
         * Yukleme durumunu ayarla
         */
        yuklemeDurumunuAyarla: (state, action: PayloadAction<boolean>) => {
            state.yukleniyor = action.payload;
        },

        /**
         * Konum state'ini sifirla
         */
        konumStateSifirla: () => {
            AsyncStorage.removeItem(KONUM_DEPOLAMA_ANAHTARI);
            return varsayilanKonum;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(konumAyarlariniYukle.pending, (state) => {
                state.yukleniyor = true;
            })
            .addCase(konumAyarlariniYukle.fulfilled, (state, action) => {
                // ONEMLI: Immer'da ya state'i mutate et YA DA yeni deger return et, ikisini birden yapma!
                if (action.payload) {
                    console.log('[KonumSlice] State guncelleniyor, konumModu:', action.payload.konumModu);
                    return { ...state, ...action.payload, yukleniyor: false };
                }
                // Payload yoksa sadece yukleniyor'u kapat
                return { ...state, yukleniyor: false };
            })
            .addCase(konumAyarlariniYukle.rejected, (state) => {
                state.yukleniyor = false;
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
