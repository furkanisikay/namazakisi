import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    LocalCumaHatirlatmaServisi,
    CumaHatirlatmaAyarlari,
} from '../../data/local/LocalCumaHatirlatmaServisi';
import { CumaHatirlatmaServisi } from '../../domain/services/CumaHatirlatmaServisi';
import type { RootState } from './store';

interface CumaHatirlatmaState {
    ayarlar: CumaHatirlatmaAyarlari;
    yukleniyor: boolean;
    hata: string | null;
}

const initialState: CumaHatirlatmaState = {
    // Cuma herkese farz-i ayn degil → varsayilan KAPALI, ayardan acilir.
    // `siklik: 'birkez'` = tarihsel davranis (tek hatirlatma); periyodik
    // hatirlatma ekrandan acilir.
    ayarlar: { aktif: false, oncedenDk: 60, siklik: 'birkez' },
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
        const yeniAyarlar: CumaHatirlatmaAyarlari = {
            ...state.cumaHatirlatma.ayarlar,
            ...degisiklik,
        };

        // Disk yazimi sessizce basarisiz olabilir; planlamaya devam etmek
        // kullaniciya "kaydedildi" hissi verip ayari kaybettirirdi.
        const kaydedildi = await LocalCumaHatirlatmaServisi.saveAyarlar(yeniAyarlar);
        if (!kaydedildi) throw new Error('Cuma hatırlatma ayarı kaydedilemedi');

        await CumaHatirlatmaServisi.getInstance().hatirlatmalariGuncelle(
            state.konum.koordinatlar ?? null
        );

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
                state.hata = action.error.message || 'Ayarlar yüklenemedi';
            })
            .addCase(cumaHatirlatmaAyariniGuncelle.fulfilled, (state, action) => {
                state.ayarlar = action.payload;
            })
            .addCase(cumaHatirlatmaAyariniGuncelle.rejected, (state, action) => {
                state.hata = action.error.message || 'Ayar güncellenemedi';
            });
    },
});

export default cumaHatirlatmaSlice.reducer;
