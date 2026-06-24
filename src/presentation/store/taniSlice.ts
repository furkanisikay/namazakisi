import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Depolama } from '../../data/local/Depolama';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';

interface TaniState {
  sorunAlgilandi: boolean;
  baglam: string | null;
  hatirlatmaAcik: boolean;
  oturumdaGosterildi: boolean;
}

const baslangic: TaniState = {
  sorunAlgilandi: false,
  baglam: null,
  hatirlatmaAcik: true,
  oturumdaGosterildi: false,
};

export const hatirlatmaAyariniYukle = createAsyncThunk('tani/hatirlatmaYukle', async () => {
  const v = await Depolama.oku<boolean>(DEPOLAMA_ANAHTARLARI.TANI_HATIRLATMA_ACIK);
  return v === null ? true : v;
});

export const hatirlatmayiGuncelle = createAsyncThunk('tani/hatirlatmaGuncelle', async (acik: boolean) => {
  await Depolama.yaz(DEPOLAMA_ANAHTARLARI.TANI_HATIRLATMA_ACIK, acik);
  return acik;
});

const taniSlice = createSlice({
  name: 'tani',
  initialState: baslangic,
  reducers: {
    sorunBildirildi: (state, action: PayloadAction<string>) => {
      state.baglam = action.payload;
      // Yalnız bu oturumda henüz gösterilmediyse modalı uyandır
      if (!state.oturumdaGosterildi) state.sorunAlgilandi = true;
    },
    taniModaliKapat: (state) => {
      state.sorunAlgilandi = false;
      state.oturumdaGosterildi = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hatirlatmaAyariniYukle.fulfilled, (state, a) => { state.hatirlatmaAcik = a.payload; })
      .addCase(hatirlatmayiGuncelle.fulfilled, (state, a) => { state.hatirlatmaAcik = a.payload; });
  },
});

export const { sorunBildirildi, taniModaliKapat } = taniSlice.actions;
export default taniSlice.reducer;
