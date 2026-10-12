import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { LocalNafileServisi, nafileAyarlariniNormalize } from '../../data/local/LocalNafileServisi';
import { NafileHatirlatmaServisi } from '../../domain/services/NafileHatirlatmaServisi';
import type { NafileAyarlari } from '../../core/nafile/nafileTipleri';
import type { RootState } from './store';

interface NafileState {
    ayarlar: NafileAyarlari;
    /** Diskten yüklendi mi? Ana ekran şeridi initialState'i gerçek veri sanmasın. */
    yuklendi: boolean;
    hata: string | null;
}

const initialState: NafileState = {
    // Nafile gönüllüdür → hepsi KAPALI, ayardan açılır.
    ayarlar: nafileAyarlariniNormalize(null),
    yuklendi: false,
    hata: null,
};

/** Salt `AsyncStorage` okuması — izin istemez. `App.tsx` açılışta çağırır (ana ekran okur). */
export const nafileAyarlariniYukle = createAsyncThunk('nafile/yukle', async () =>
    LocalNafileServisi.getAyarlar()
);

/** Kısmi güncelleme: üst düzey alanlar + iç içe nesneler ayrı ayrı birleştirilir. */
export interface NafileAyarDegisikligi {
    gostergeAktif?: boolean;
    hatirlatmalar?: Partial<{
        [K in keyof NafileAyarlari['hatirlatmalar']]: Partial<NafileAyarlari['hatirlatmalar'][K]>;
    }>;
    teheccud?: Partial<NafileAyarlari['teheccud']>;
}

export const nafileAyarlariniBirlestir = (
    mevcut: NafileAyarlari,
    d: NafileAyarDegisikligi
): NafileAyarlari =>
    nafileAyarlariniNormalize({
        gostergeAktif: d.gostergeAktif ?? mevcut.gostergeAktif,
        hatirlatmalar: {
            kusluk: { ...mevcut.hatirlatmalar.kusluk, ...d.hatirlatmalar?.kusluk },
            evvabin: { ...mevcut.hatirlatmalar.evvabin, ...d.hatirlatmalar?.evvabin },
        },
        teheccud: { ...mevcut.teheccud, ...d.teheccud },
    });

/**
 * Ayarı kaydeder ve hatırlatmaları YENİDEN PLANLAR (ayarı yazmak bildirim kurmaz).
 * Koordinat store'dan PARAMETRE geçilir (cuma deseni).
 */
export const nafileAyariniGuncelle = createAsyncThunk(
    'nafile/guncelle',
    async (degisiklik: NafileAyarDegisikligi, { getState }) => {
        const state = getState() as RootState;
        const yeni = nafileAyarlariniBirlestir(state.nafile.ayarlar, degisiklik);

        const kaydedildi = await LocalNafileServisi.saveAyarlar(yeni);
        if (!kaydedildi) throw new Error('Nafile ayarı kaydedilemedi');

        await NafileHatirlatmaServisi.getInstance().hatirlatmalariGuncelle(
            state.konum.koordinatlar ?? null
        );
        return LocalNafileServisi.getAyarlar();
    }
);

const nafileSlice = createSlice({
    name: 'nafile',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(nafileAyarlariniYukle.fulfilled, (state, action) => {
                state.ayarlar = action.payload;
                state.yuklendi = true;
                state.hata = null;
            })
            .addCase(nafileAyarlariniYukle.rejected, (state, action) => {
                // Okuma reddetmez ama yine de: kapı açılsın, varsayılanla devam edilsin.
                state.yuklendi = true;
                state.hata = action.error.message || 'Ayarlar yüklenemedi';
            })
            // İyimser: ekran anahtarı beklemeden dönsün; disk sonucu fulfilled'da yazılır.
            .addCase(nafileAyariniGuncelle.pending, (state, action) => {
                state.ayarlar = nafileAyarlariniBirlestir(state.ayarlar, action.meta.arg);
            })
            .addCase(nafileAyariniGuncelle.fulfilled, (state, action) => {
                state.ayarlar = action.payload;
                state.hata = null;
            })
            .addCase(nafileAyariniGuncelle.rejected, (state, action) => {
                state.hata = action.error.message || 'Ayar güncellenemedi';
            });
    },
});

export default nafileSlice.reducer;
