import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { LocalTakvimCakismaServisi } from '../../data/local/LocalTakvimCakismaServisi';
import { TakvimCakismaServisi } from '../../domain/services/TakvimCakismaServisi';
import {
    takvimCakismaAyarlariniBirlestir,
    varsayilanTakvimCakismaAyarlari,
    type TakvimCakismaAyarlari,
} from '../../core/takvimCakisma/takvimCakismaAyarlari';
import type { RootState } from './store';
import { metin } from '../../core/dil/aktifDil';

interface TakvimCakismaState {
    ayarlar: TakvimCakismaAyarlari;
    yukleniyor: boolean;
    hata: string | null;
}

const initialState: TakvimCakismaState = {
    ayarlar: varsayilanTakvimCakismaAyarlari(),
    yukleniyor: false,
    hata: null,
};

export const takvimCakismaAyarlariniYukle = createAsyncThunk('takvimCakisma/yukle', async () =>
    LocalTakvimCakismaServisi.getAyarlar()
);

/**
 * Ayarı kaydeder ve uyarıları YENİDEN PLANLAR (issue #291). Koordinat
 * store'dan okunup servise PARAMETRE geçilir (cuma deseni).
 *
 * RIZA: `aktif: true` yalnız `rizaZamani` ile birlikte anlamlıdır (normalize
 * rızasız açık kaydı kapatır). Kapatmak YALNIZ takvim rıza kaydını SİLER — yeniden açan
 * kullanıcı açıklamayı yeniden görür; sesli/alarm rızası (`sesliOnayi`, `alarmOnayi`)
 * ayardır, kalır (nafile emsali). Birleştirme + göç saf modülde
 * (`takvimCakismaAyarlariniBirlestir`): eski `oncedenDk` değişikliği ilk adıma yazılır.
 */
export const takvimCakismaAyariniGuncelle = createAsyncThunk(
    'takvimCakisma/guncelle',
    async (degisiklik: Partial<TakvimCakismaAyarlari>, { getState }) => {
        const state = getState() as RootState;
        const yeni: TakvimCakismaAyarlari = takvimCakismaAyarlariniBirlestir(state.takvimCakisma.ayarlar, degisiklik);

        const kaydedildi = await LocalTakvimCakismaServisi.saveAyarlar(yeni);
        if (!kaydedildi) throw new Error('Takvim çakışması ayarı kaydedilemedi');

        await TakvimCakismaServisi.getInstance().hatirlatmalariGuncelle(state.konum.koordinatlar ?? null);
        return LocalTakvimCakismaServisi.getAyarlar();
    }
);

const takvimCakismaSlice = createSlice({
    name: 'takvimCakisma',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(takvimCakismaAyarlariniYukle.pending, (state) => {
                state.yukleniyor = true;
                state.hata = null;
            })
            .addCase(takvimCakismaAyarlariniYukle.fulfilled, (state, action) => {
                state.yukleniyor = false;
                state.ayarlar = action.payload;
            })
            .addCase(takvimCakismaAyarlariniYukle.rejected, (state, action) => {
                state.yukleniyor = false;
                state.hata = action.error.message || metin().muhafizAyar.hata.yuklenemedi;
            })
            .addCase(takvimCakismaAyariniGuncelle.fulfilled, (state, action) => {
                state.ayarlar = action.payload;
            })
            .addCase(takvimCakismaAyariniGuncelle.rejected, (state, action) => {
                state.hata = action.error.message || metin().muhafizAyar.hata.guncellenemedi;
            });
    },
});

export default takvimCakismaSlice.reducer;
