import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { LocalNowBarServisi } from '../../data/local/LocalNowBarServisi';
import {
  nowBarAyariniBirlestir,
  nowBarAyarlariniNormalize,
  type NowBarAyarlari,
  type NowBarOgeAyari,
  type NowBarOgesi,
} from '../../core/sayac/nowBar';
import type { RootState } from './store';
import { metin } from '../../core/dil/aktifDil';

/**
 * Now Bar ve canlı sayaçlar seçimi (issue #282 ikinci aşama).
 *
 * Ayarı yazmak planları KURMAZ: ekran değişiklikleri debounce'lu olarak
 * `NowBarDegisikligiServisi.nowBarDegistiUygula`'yı çağırır (art arda
 * dokunuşlar tek yeniden planlamaya iner).
 */
interface NowBarState {
  ayarlar: NowBarAyarlari;
  /** Diskten yüklendi mi? Ayarlar satırı initialState'i gerçek veri sanmasın. */
  yuklendi: boolean;
  hata: string | null;
}

const initialState: NowBarState = {
  ayarlar: nowBarAyarlariniNormalize(null),
  yuklendi: false,
  hata: null,
};

/** Salt `AsyncStorage` okuması — izin istemez. */
export const nowBarAyarlariniYukle = createAsyncThunk('nowBar/yukle', async () => LocalNowBarServisi.getAyarlar());

export interface NowBarOgeDegisikligi {
  oge: NowBarOgesi;
  degisiklik: Partial<NowBarOgeAyari>;
}

export const nowBarOgesiniGuncelle = createAsyncThunk(
  'nowBar/guncelle',
  async ({ oge, degisiklik }: NowBarOgeDegisikligi, { getState }) => {
    const state = getState() as RootState;
    const yeni = nowBarAyariniBirlestir(state.nowBar.ayarlar, oge, degisiklik);
    const kaydedildi = await LocalNowBarServisi.saveAyarlar(yeni);
    if (!kaydedildi) throw new Error('Now Bar ayarı kaydedilemedi');
    return yeni;
  }
);

const nowBarSlice = createSlice({
  name: 'nowBar',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(nowBarAyarlariniYukle.fulfilled, (state, action) => {
        state.ayarlar = action.payload;
        state.yuklendi = true;
        state.hata = null;
      })
      .addCase(nowBarAyarlariniYukle.rejected, (state, action) => {
        // Okuma reddetmez ama yine de: kapı açılsın, varsayılanla devam edilsin.
        state.yuklendi = true;
        state.hata = action.error.message || metin().muhafizAyar.hata.yuklenemedi;
      })
      // İyimser: anahtar beklemeden dönsün.
      .addCase(nowBarOgesiniGuncelle.pending, (state, action) => {
        state.ayarlar = nowBarAyariniBirlestir(state.ayarlar, action.meta.arg.oge, action.meta.arg.degisiklik);
      })
      .addCase(nowBarOgesiniGuncelle.fulfilled, (state, action) => {
        state.ayarlar = action.payload;
        state.hata = null;
      })
      .addCase(nowBarOgesiniGuncelle.rejected, (state, action) => {
        state.hata = action.error.message || metin().muhafizAyar.hata.guncellenemedi;
      });
  },
});

export default nowBarSlice.reducer;
