import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { LocalNafileServisi, nafileAyarlariniNormalize } from '../../data/local/LocalNafileServisi';
import { NafileHatirlatmaServisi } from '../../domain/services/NafileHatirlatmaServisi';
import type { NafileAyarlari, NafileTuru } from '../../core/nafile/nafileTipleri';
import type { RootState } from './store';
import { metin } from '../../core/dil/aktifDil';

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
    /** ÜÇÜNÜ BİRDEN açar/kapatır (rehber yazımı, eski çağıranlar). `gosterge` önceliklidir. */
    gostergeAktif?: boolean;
    /** Nafile başına ana ekran göstergesi (tek tek açılır/kapanır). */
    gosterge?: Partial<Record<NafileTuru, boolean>>;
    hatirlatmalar?: Partial<{
        [K in keyof NafileAyarlari['hatirlatmalar']]: Partial<NafileAyarlari['hatirlatmalar'][K]>;
    }>;
    teheccud?: Partial<NafileAyarlari['teheccud']>;
    /** Bildirim sınırı rehberinin "günü gününe kurun" önerisi (issue #298). */
    gunuGununeKur?: boolean;
    /**
     * Sesli anons rızası (issue #273) — YALNIZ `SesliOnayModal` onayında `true`
     * yazılır; muhafızın `sesliOnayi`'sinden ayrıdır.
     */
    sesliOnayi?: boolean;
    /** Gerçek alarm rızası (#74) — YALNIZ `AlarmOnayModal` onayında `true`. */
    alarmOnayi?: boolean;
}

export const nafileAyarlariniBirlestir = (
    mevcut: NafileAyarlari,
    d: NafileAyarDegisikligi
): NafileAyarlari =>
    nafileAyarlariniNormalize({
        gosterge: {
            ...(d.gostergeAktif === undefined
                ? mevcut.gosterge
                : { kusluk: d.gostergeAktif, evvabin: d.gostergeAktif, teheccud: d.gostergeAktif }),
            ...d.gosterge,
        },
        hatirlatmalar: {
            kusluk: { ...mevcut.hatirlatmalar.kusluk, ...d.hatirlatmalar?.kusluk },
            evvabin: { ...mevcut.hatirlatmalar.evvabin, ...d.hatirlatmalar?.evvabin },
        },
        teheccud: { ...mevcut.teheccud, ...d.teheccud },
        gunuGununeKur: d.gunuGununeKur ?? mevcut.gunuGununeKur,
        sesliOnayi: d.sesliOnayi ?? mevcut.sesliOnayi,
        alarmOnayi: d.alarmOnayi ?? mevcut.alarmOnayi,
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
                state.hata = action.error.message || metin().muhafizAyar.hata.yuklenemedi;
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
                state.hata = action.error.message || metin().muhafizAyar.hata.guncellenemedi;
            });
    },
});

export default nafileSlice.reducer;
