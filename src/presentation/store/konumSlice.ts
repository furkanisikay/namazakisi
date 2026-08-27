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
import type { TakipHassasiyeti } from '../../core/constants/UygulamaSabitleri';
import type { KonumYenilemeSonucu } from '../../domain/services/KonumYenilemeServisi';
import { Logger } from '../../core/utils/Logger';

export type { KonumYenilemeSonucu };

// Tipleri re-export et (geriye uyumluluk icin)
export type { GpsAdres, Koordinatlar, KonumModu, KonumAyarlari, TakipHassasiyeti };

/**
 * Konum state arayuzu
 * KonumAyarlari + yukleniyor durumu
 */
export interface KonumState extends KonumAyarlari {
    /** Konum yuklenme durumu */
    yukleniyor: boolean;
    /**
     * Kullanici tetikli "konumu yenile" islemi surerken true.
     * `yukleniyor`dan AYRI: sayfayi bloklamaz, yalnizca yenile dugmesi beklemeye gecer.
     */
    yenileniyor: boolean;
}

/**
 * Varsayilan konum state'i (Istanbul)
 */
const varsayilanKonum: KonumState = {
    ...VARSAYILAN_KONUM_AYARLARI,
    yukleniyor: false,
    yenileniyor: false,
};

/**
 * State'ten DISKE yazilacak ayarlari ayiklar.
 *
 * `yukleniyor`/`yenileniyor` gecici UI bayraklaridir; diske sizarlarsa bir sonraki
 * acilista "yukleniyor: true" olarak geri okunurlar. Bu ayiklama tek yerde durur ki
 * yeni bir UI bayragi eklendiginde dort ayri destructure guncellemek gerekmesin.
 */
function diskeYazilacakAyarlar(state: KonumState): KonumAyarlari {
    const { yukleniyor: _yukleniyor, yenileniyor: _yenileniyor, ...konumAyarlari } = state;
    return konumAyarlari;
}

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

        // Gecici UI bayraklari (yukleniyor/yenileniyor) storage'a kaydedilmez
        const {
            yukleniyor: _yeniYukleniyor,
            yenileniyor: _yeniYenileniyor,
            ...yeniAyarlar
        } = ayarlar as Partial<KonumState>;

        const guncelAyarlar: KonumAyarlari = {
            ...diskeYazilacakAyarlar(mevcutAyarlar),
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
 * Kullanici tetikli konum yenileme.
 *
 * Yazma isini `KonumYenilemeServisi` yapar (disk + konuma bagli tum tuketicilere
 * yayma); burada yalnizca sonuc store'a tasinir. Basarili olursa state DISKTEN
 * tazelenir — tek yazici disk kalsin, ayni degeri iki yerden hesaplamayalim.
 */
export const konumuYenileAsync = createAsyncThunk(
    'konum/yenile',
    async (_: void, { dispatch }) => {
        // TEMBEL YUKLEME (bilincli): `KonumYenilemeServisi` -> `KonumTakipServisi` ->
        // `KonumDegisikligiServisi` zinciri expo-task-manager ve notifee gibi NATIVE
        // koprulere baglidir. Statik import edilseydi bu grafik store'u yukleyen HER
        // ekran testine sizar ve jest'te `requireNativeModule` olmadigi icin suite'ler
        // hic calismadan patlardi (AGENTS.md native koprusu tuzagi). Thunk zaten async;
        // servis yalnizca kullanici dugmeye bastiginda yuklenir.
        //
        // `import()` DEGIL `require()`: jest (CJS) dinamik import'u
        // `--experimental-vm-modules` olmadan calistiramiyor ve thunk sessizce
        // REDDEDILIYOR — yani testte "yenileme hep basarisiz" olurdu.
        const { konumuYenile } = require('../../domain/services/KonumYenilemeServisi') as
            typeof import('../../domain/services/KonumYenilemeServisi');
        const sonuc = await konumuYenile();

        if (sonuc.durum === 'basarili') {
            await dispatch(konumAyarlariniYukle());
        }

        return sonuc;
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
            Logger.debug('KonumSlice', 'State guncelleniyor (sync)', { konumModu: yeniState.konumModu, seciliIlAdi: yeniState.seciliIlAdi });

            // Arka planda kaydet (fire-and-forget)
            // Not: Bu sync reducer icinde async islem - ideal degil ama geriye uyumluluk icin
            localKonumAyarlariniKaydet(diskeYazilacakAyarlar(yeniState))
                .then(() => Logger.debug('KonumSlice', 'Arka plan kayit basarili'))
                .catch((err) => Logger.error('KonumSlice', 'Arka plan kayit hatasi', err));

            return yeniState;
        },

        /**
         * Sadece koordinatlari guncelle (senkron)
         */
        koordinatlariGuncelle: (state, action: PayloadAction<Koordinatlar>) => {
            state.koordinatlar = action.payload;

            // Arka planda kaydet
            localKonumAyarlariniKaydet(diskeYazilacakAyarlar(state));
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
            localKonumAyarlariniKaydet(diskeYazilacakAyarlar(state));
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
                    Logger.debug('KonumSlice', 'State guncelleniyor', { konumModu: action.payload.konumModu });
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
                Logger.debug('KonumSlice', 'Async kayit basarili', { konumModu: action.payload.konumModu });
                return { ...state, ...action.payload };
            })
            .addCase(konumAyarlariniKaydetAsync.rejected, (_state, action) => {
                Logger.error('KonumSlice', 'Async kayit hatasi', action.error.message);
            });

        // Kullanici tetikli yenileme
        builder
            .addCase(konumuYenileAsync.pending, (state) => {
                state.yenileniyor = true;
            })
            .addCase(konumuYenileAsync.fulfilled, (state) => {
                // State'i `konumAyarlariniYukle` zaten diskten tazeledi; burada
                // yalnizca dugmeyi bekleme durumundan cikariyoruz.
                state.yenileniyor = false;
            })
            .addCase(konumuYenileAsync.rejected, (state, action) => {
                Logger.error('KonumSlice', 'Konum yenilenemedi', action.error.message);
                state.yenileniyor = false;
            });

        // Konum verilerini temizle
        builder
            .addCase(konumVerileriniTemizleAsync.fulfilled, () => {
                Logger.info('KonumSlice', 'Veriler temizlendi, varsayilana donuluyor');
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
