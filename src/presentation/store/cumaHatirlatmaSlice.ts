import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { LocalCumaHatirlatmaServisi } from '../../data/local/LocalCumaHatirlatmaServisi';
import {
    cumaAyarlariniBirlestir,
    varsayilanCumaAyarlari,
    type CumaHatirlatmaAyarlari,
} from '../../core/cuma/cumaAyarlari';
import { CumaHatirlatmaServisi } from '../../domain/services/CumaHatirlatmaServisi';
import { CamiyeGitHatirlatmaServisi } from '../../domain/services/CamiyeGitHatirlatmaServisi';
import type { RootState } from './store';
import { metin } from '../../core/dil/aktifDil';

interface CumaHatirlatmaState {
    ayarlar: CumaHatirlatmaAyarlari;
    yukleniyor: boolean;
    hata: string | null;
}

const initialState: CumaHatirlatmaState = {
    // Cuma herkese farz-i ayn degil → varsayilan KAPALI, ayardan acilir.
    // Tek adım, 60 dk önce, tek atış = tarihsel davranış (ortak model, plan §5.1).
    ayarlar: varsayilanCumaAyarlari(),
    yukleniyor: false,
    hata: null,
};

export const cumaHatirlatmaAyarlariniYukle = createAsyncThunk(
    'cumaHatirlatma/yukle',
    async () => LocalCumaHatirlatmaServisi.getAyarlar()
);

/**
 * Ayari kaydeder ve hatirlatmalari YENIDEN PLANLAR.
 *
 * Koordinat store'dan okunur; `NamazVaktiHesaplayiciServisi.getKonfig()` bellek-ici
 * oldugu ve her yolda kurulu olmadigi icin servise parametre gecilir.
 */
export const cumaHatirlatmaAyariniGuncelle = createAsyncThunk(
    'cumaHatirlatma/guncelle',
    async (degisiklik: Partial<CumaHatirlatmaAyarlari>, { getState }) => {
        const state = getState() as RootState;
        // Kısmi değişiklik (adımlar, rızalar ya da eski `oncedenDk`/`siklik`) birleştirilip
        // NORMALIZE edilir — türev alanlar adımlardan yeniden yazılır. Rıza alanları
        // (`sesliOnayi`, `alarmOnayi`) yalnız ekranın açıkça geçtiği değerle değişir.
        const yeniAyarlar: CumaHatirlatmaAyarlari = cumaAyarlariniBirlestir(
            state.cumaHatirlatma.ayarlar,
            degisiklik
        );

        // Disk yazimi sessizce basarisiz olabilir; planlamaya devam etmek
        // kullaniciya "kaydedildi" hissi verip ayari kaybettirirdi.
        const kaydedildi = await LocalCumaHatirlatmaServisi.saveAyarlar(yeniAyarlar);
        if (!kaydedildi) throw new Error('Cuma hatırlatma ayarı kaydedilemedi');

        await CumaHatirlatmaServisi.getInstance().hatirlatmalariGuncelle(
            state.konum.koordinatlar ?? null
        );

        // "Camide kılacağım" (issue #292) cuma günü öğleyi cuma AÇIKKEN atlar →
        // cuma açılıp kapanınca o plan da yeniden kurulmalı. Hatası cuma ayarını düşürmez.
        if (degisiklik.aktif !== undefined) {
            try {
                await CamiyeGitHatirlatmaServisi.getInstance().hatirlatmalariGuncelle(
                    state.konum.koordinatlar ?? null
                );
            } catch {
                // Bir sonraki açılış/arka plan turu tazeler.
            }
        }

        // Diskteki normalize edilmis hali dondur (sinir disi deger duzeltilmis olur).
        return LocalCumaHatirlatmaServisi.getAyarlar();
    }
);

const cumaHatirlatmaSlice = createSlice({
    name: 'cumaHatirlatma',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(cumaHatirlatmaAyarlariniYukle.pending, (state) => {
                state.yukleniyor = true;
                state.hata = null;
            })
            .addCase(cumaHatirlatmaAyarlariniYukle.fulfilled, (state, action) => {
                state.yukleniyor = false;
                state.ayarlar = action.payload;
            })
            .addCase(cumaHatirlatmaAyarlariniYukle.rejected, (state, action) => {
                state.yukleniyor = false;
                state.hata = action.error.message || metin().muhafizAyar.hata.yuklenemedi;
            })
            .addCase(cumaHatirlatmaAyariniGuncelle.fulfilled, (state, action) => {
                state.ayarlar = action.payload;
            })
            .addCase(cumaHatirlatmaAyariniGuncelle.rejected, (state, action) => {
                state.hata = action.error.message || metin().muhafizAyar.hata.guncellenemedi;
            });
    },
});

export default cumaHatirlatmaSlice.reducer;
