import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { LocalYatisHatirlatmaServisi } from '../../data/local/LocalYatisHatirlatmaServisi';
import { YatisHatirlatmaServisi } from '../../domain/services/YatisHatirlatmaServisi';
import {
    varsayilanYatisAyarlari,
    yatisAyarlariniBirlestir,
    type YatisAyarlari,
} from '../../core/yatis/yatisAyarlari';
import type { RootState } from './store';

/**
 * Yatış saatine göre yatsı hatırlatması + gün sonu muhasebesi (issue #290).
 * Desen: `cumaHatirlatmaSlice` (`*Yukle` / `*Guncelle`).
 */
interface YatisHatirlatmaState {
    ayarlar: YatisAyarlari;
    yukleniyor: boolean;
    hata: string | null;
}

const initialState: YatisHatirlatmaState = {
    // VARSAYILAN KAPALI: yatış saati kişiseldir, ayardan açılır.
    ayarlar: varsayilanYatisAyarlari(),
    yukleniyor: false,
    hata: null,
};

export const yatisHatirlatmaAyarlariniYukle = createAsyncThunk('yatisHatirlatma/yukle', async () =>
    LocalYatisHatirlatmaServisi.getAyarlar()
);

/**
 * Ayarı kaydeder ve hatırlatmaları YENİDEN PLANLAR (koordinat store'dan).
 * Disk yazımı başarısızsa planlamaya devam edilmez (cuma deseni). Kısmi değişiklik
 * (adımlar, rızalar ya da eski `onceDk`) `yatisAyarlariniBirlestir`'den geçer: türev alan
 * adımlardan yeniden yazılır, rızalar yalnız ekranın açıkça geçtiği değerle değişir.
 */
export const yatisHatirlatmaAyariniGuncelle = createAsyncThunk(
    'yatisHatirlatma/guncelle',
    async (degisiklik: Partial<YatisAyarlari>, { getState }) => {
        const state = getState() as RootState;
        const yeni: YatisAyarlari = yatisAyarlariniBirlestir(state.yatisHatirlatma.ayarlar, degisiklik);
        const kaydedildi = await LocalYatisHatirlatmaServisi.saveAyarlar(yeni);
        if (!kaydedildi) throw new Error('Yatış hatırlatması ayarı kaydedilemedi');

        const normalize = await LocalYatisHatirlatmaServisi.getAyarlar();
        await YatisHatirlatmaServisi.getInstance().hatirlatmalariGuncelle(
            state.konum.koordinatlar ?? null,
            normalize
        );
        return normalize;
    }
);

const yatisHatirlatmaSlice = createSlice({
    name: 'yatisHatirlatma',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(yatisHatirlatmaAyarlariniYukle.pending, (state) => {
                state.yukleniyor = true;
                state.hata = null;
            })
            .addCase(yatisHatirlatmaAyarlariniYukle.fulfilled, (state, action) => {
                state.yukleniyor = false;
                state.ayarlar = action.payload;
            })
            .addCase(yatisHatirlatmaAyarlariniYukle.rejected, (state, action) => {
                state.yukleniyor = false;
                state.hata = action.error.message || 'Ayarlar yüklenemedi';
            })
            .addCase(yatisHatirlatmaAyariniGuncelle.fulfilled, (state, action) => {
                state.ayarlar = action.payload;
            })
            .addCase(yatisHatirlatmaAyariniGuncelle.rejected, (state, action) => {
                state.hata = action.error.message || 'Ayar güncellenemedi';
            });
    },
});

export default yatisHatirlatmaSlice.reducer;
