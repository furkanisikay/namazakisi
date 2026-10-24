import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { VARSAYILAN_HESAP_AYARI, type HesapAyari } from '../../core/vakit/hesapProfilleri';
import { HesapAyariServisi } from '../../domain/services/HesapAyariServisi';
import { Logger } from '../../core/utils/Logger';

/**
 * Namaz vakti hesap ayarı (yöntem, ikindi, dakika düzeltmeleri) — ekranların yeniden
 * çizilmesi için store aynası. Gerçek kaynak disk + `core/vakit/aktifHesap` (arka planda
 * Redux yoktur). `yuklendi`: initialState (Diyanet) gerçek veri sanılmasın.
 */
export interface HesapState {
    ayar: HesapAyari;
    yuklendi: boolean;
    yukleniyor: boolean;
}

const initialState: HesapState = { ayar: { ...VARSAYILAN_HESAP_AYARI }, yuklendi: false, yukleniyor: false };

type DurumKaynagi = { hesap?: HesapState; konum?: { koordinatlar?: { lat: number; lng: number } } };

export const hesapAyariniYukle = createAsyncThunk<HesapAyari, { zorla?: boolean } | undefined>(
    'hesap/yukle',
    async (arg) => HesapAyariServisi.yukle(!!arg?.zorla),
    {
        condition: (arg, { getState }) => {
            if (arg?.zorla) return true;
            const d = (getState() as DurumKaynagi).hesap;
            return !d || (!d.yuklendi && !d.yukleniyor);
        },
    }
);

/**
 * Kaydeder; vakitler değiştiyse konum değişimiyle AYNI yoldan yayar (bildirim planları,
 * sayaçlar, widget, saat, TV hepsi yeni vakitleri alsın).
 */
export const hesapAyariniKaydet = createAsyncThunk<HesapAyari, HesapAyari>(
    'hesap/kaydet',
    async (ayar, { getState }) => {
        const degisti = await HesapAyariServisi.kaydet(ayar);
        const kayitli = await HesapAyariServisi.yukle();
        if (degisti) {
            const k = (getState() as DurumKaynagi).konum?.koordinatlar;
            if (k && !(k.lat === 0 && k.lng === 0)) {
                try {
                    // Tembel require: servis native modüller içerir (ekran testleri, AGENTS.md).
                    const { konumDegistiUygula } = require('../../domain/services/KonumDegisikligiServisi') as typeof import('../../domain/services/KonumDegisikligiServisi');
                    await konumDegistiUygula(k);
                } catch (e) {
                    Logger.warn('hesapSlice', 'Hesap ayarı yayılamadı', e);
                }
            }
        }
        return kayitli;
    }
);

const hesapSlice = createSlice({
    name: 'hesap',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(hesapAyariniYukle.pending, (state) => {
                state.yukleniyor = true;
            })
            .addCase(hesapAyariniYukle.fulfilled, (state, action) => {
                state.ayar = action.payload;
                state.yuklendi = true;
                state.yukleniyor = false;
            })
            .addCase(hesapAyariniYukle.rejected, (state) => {
                state.yuklendi = true;
                state.yukleniyor = false;
            })
            .addCase(hesapAyariniKaydet.fulfilled, (state, action) => {
                state.ayar = action.payload;
                state.yuklendi = true;
            });
    },
});

export default hesapSlice.reducer;
