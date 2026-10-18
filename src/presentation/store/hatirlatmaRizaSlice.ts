import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { LocalHatirlatmaRizaServisi } from '../../data/local/LocalHatirlatmaRizaServisi';
import { rizaEkle, type HatirlatmaRizalari } from '../../core/hatirlatma/rizalar';

/**
 * TEK RIZA (sade tasarım, Dalga 3): sesli okuma + gerçek alarm onayı, tüm hatırlatmalar
 * için ortak kayıt. Ekran genel onayı `useGenelRiza` ile okur (bu kayıt VEYA eski yüzey
 * kayıtları — bkz. `core/hatirlatma/rizalar`).
 *
 * `yuklendi`: initialState ("onay yok") gerçek veri sanılmasın (AGENTS.md hidrasyon
 * kuralı) — açılışta `App.tsx` ve ekranlar yükler.
 */
export interface HatirlatmaRizaState {
    kayit: HatirlatmaRizalari;
    yuklendi: boolean;
    yukleniyor: boolean;
}

const initialState: HatirlatmaRizaState = { kayit: {}, yuklendi: false, yukleniyor: false };

type DurumKaynagi = { hatirlatmaRiza?: HatirlatmaRizaState };

/** Salt okuma (+ bir kerelik göç yazımı). Yüklüyse atlar; içe aktarma `zorla` geçer. */
export const hatirlatmaRizalariniYukle = createAsyncThunk<HatirlatmaRizalari, { zorla?: boolean } | undefined>(
    'hatirlatmaRiza/yukle',
    async () => LocalHatirlatmaRizaServisi.oku(),
    {
        condition: (arg, { getState }) => {
            if (arg?.zorla) return true;
            const d = (getState() as DurumKaynagi).hatirlatmaRiza;
            return !d || (!d.yuklendi && !d.yukleniyor);
        },
    }
);

/**
 * Kullanıcı açıklamayı EKRANDA gördü ve onayladı → ortak kayda ekle. Rıza UYDURULAMAZ:
 * bu thunk yalnız onay modalının/bilgi maddesinin gösterildiği yoldan çağrılır.
 */
export const hatirlatmaRizasiVer = createAsyncThunk(
    'hatirlatmaRiza/ver',
    async (ek: { sesliOnayi?: boolean; alarmOnayi?: boolean }) => LocalHatirlatmaRizaServisi.ver(ek)
);

const hatirlatmaRizaSlice = createSlice({
    name: 'hatirlatmaRiza',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(hatirlatmaRizalariniYukle.pending, (state) => {
                state.yukleniyor = true;
            })
            .addCase(hatirlatmaRizalariniYukle.fulfilled, (state, action) => {
                // Bu arada verilen onay (iyimser) okuma sonucuyla kaybolmasın.
                state.kayit = rizaEkle(action.payload, state.kayit);
                state.yuklendi = true;
                state.yukleniyor = false;
            })
            .addCase(hatirlatmaRizalariniYukle.rejected, (state) => {
                state.yuklendi = true;
                state.yukleniyor = false;
            })
            // İyimser: modal kapanır kapanmaz ikinci kez sorulmasın.
            .addCase(hatirlatmaRizasiVer.pending, (state, action) => {
                state.kayit = rizaEkle(state.kayit, action.meta.arg);
            })
            .addCase(hatirlatmaRizasiVer.fulfilled, (state, action) => {
                state.kayit = rizaEkle(action.payload, state.kayit);
            });
        // `ver` reddedilirse iyimser değer bu oturumda kalır (rıza ekranda VERİLDİ);
        // diske yazılamadıysa bir sonraki açılışta yeniden sorulur — yanlış yönde hata yok.
    },
});

export default hatirlatmaRizaSlice.reducer;
