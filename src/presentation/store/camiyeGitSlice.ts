import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { LocalCamiyeGitServisi } from '../../data/local/LocalCamiyeGitServisi';
import { CamiyeGitHatirlatmaServisi } from '../../domain/services/CamiyeGitHatirlatmaServisi';
import {
    VARSAYILAN_CAMIYE_GIT_AYARLARI,
    type CamiyeGitAyarlari,
} from '../../core/camiyeGit/camiyeGitAyarlari';
import type { RootState } from './store';

interface CamiyeGitState {
    ayarlar: CamiyeGitAyarlari;
    yukleniyor: boolean;
    hata: string | null;
}

const initialState: CamiyeGitState = {
    ayarlar: { ...VARSAYILAN_CAMIYE_GIT_AYARLARI, vakitler: { ...VARSAYILAN_CAMIYE_GIT_AYARLARI.vakitler } },
    yukleniyor: false,
    hata: null,
};

export const camiyeGitAyarlariniYukle = createAsyncThunk('camiyeGit/yukle', async () =>
    LocalCamiyeGitServisi.getAyarlar()
);

/**
 * Ayarı kaydeder ve hatırlatmaları YENİDEN PLANLAR (issue #292).
 * Koordinat store'dan okunup servise PARAMETRE geçilir (cuma deseni).
 */
export const camiyeGitAyariniGuncelle = createAsyncThunk(
    'camiyeGit/guncelle',
    async (degisiklik: Partial<CamiyeGitAyarlari>, { getState }) => {
        const state = getState() as RootState;
        const mevcut = state.camiyeGit.ayarlar;
        const yeni: CamiyeGitAyarlari = {
            ...mevcut,
            ...degisiklik,
            vakitler: { ...mevcut.vakitler, ...(degisiklik.vakitler ?? {}) },
        };
        // Tahmin değilse cami adı taşınmaz (normalize de düşürür; burada açıkça).
        if (yeni.yurumeKaynagi !== 'tahmin') delete yeni.camiAdi;

        const kaydedildi = await LocalCamiyeGitServisi.saveAyarlar(yeni);
        if (!kaydedildi) throw new Error('Camiye gitme hatırlatması kaydedilemedi');

        await CamiyeGitHatirlatmaServisi.getInstance().hatirlatmalariGuncelle(
            state.konum.koordinatlar ?? null
        );
        return LocalCamiyeGitServisi.getAyarlar();
    }
);

const camiyeGitSlice = createSlice({
    name: 'camiyeGit',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(camiyeGitAyarlariniYukle.pending, (state) => {
                state.yukleniyor = true;
                state.hata = null;
            })
            .addCase(camiyeGitAyarlariniYukle.fulfilled, (state, action) => {
                state.yukleniyor = false;
                state.ayarlar = action.payload;
            })
            .addCase(camiyeGitAyarlariniYukle.rejected, (state, action) => {
                state.yukleniyor = false;
                state.hata = action.error.message || 'Ayarlar yüklenemedi';
            })
            .addCase(camiyeGitAyariniGuncelle.fulfilled, (state, action) => {
                state.ayarlar = action.payload;
            })
            .addCase(camiyeGitAyariniGuncelle.rejected, (state, action) => {
                state.hata = action.error.message || 'Ayar güncellenemedi';
            });
    },
});

export default camiyeGitSlice.reducer;
