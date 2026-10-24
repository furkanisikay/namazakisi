import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { VARSAYILAN_DIL, type DilKodu } from '../../core/dil/diller';
import { DilServisi } from '../../domain/services/DilServisi';

/**
 * Arayüz dili — ekranların yeniden çizilmesi için store aynası. Gerçek kaynak disk +
 * `core/dil/aktifDil` (arka planda Redux yoktur).
 */
export interface DilState {
  kod: DilKodu;
  yuklendi: boolean;
}

const initialState: DilState = { kod: VARSAYILAN_DIL, yuklendi: false };

export const diliYukle = createAsyncThunk<DilKodu>('dil/yukle', () => DilServisi.yukle());

/**
 * Kaydeder. DİKKAT (seçici açılmadan ÖNCE yapılmalı): planlanmış metinler (bildirim,
 * muhafız adımları, cuma/yatış, sesli okuma, widget) eski dilde kalır → `hesapAyariniKaydet`
 * gibi `konumDegistiUygula` yolundan yeniden kurulmalı.
 */
export const diliKaydet = createAsyncThunk<DilKodu, DilKodu>('dil/kaydet', async (kod) => {
  await DilServisi.kaydet(kod);
  return kod;
});

const dilSlice = createSlice({
  name: 'dil',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(diliYukle.fulfilled, (s, a) => {
      s.kod = a.payload;
      s.yuklendi = true;
    });
    b.addCase(diliYukle.rejected, (s) => {
      s.yuklendi = true;
    });
    b.addCase(diliKaydet.fulfilled, (s, a) => {
      s.kod = a.payload;
    });
  },
});

export default dilSlice.reducer;
