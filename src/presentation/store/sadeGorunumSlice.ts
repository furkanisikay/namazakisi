import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { metin } from '../../core/dil/aktifDil';
import { LocalSadeGorunumServisi } from '../../data/local/LocalSadeGorunumServisi';
import {
  VARSAYILAN_SADE_GORUNUM_AYARLARI,
  type SadeGorunumAyarlari,
} from '../../core/sade/sadeGorunum';

/**
 * Sade görünüm (issue #295).
 *
 * - `ayarlar.aktif` KALICIDIR (yedeklenir).
 * - `geciciCikis` KALICI DEĞİLDİR: 'Tüm uygulamayı açın' bağlantısı sade görünümü
 *   bu oturum için kapatır; uygulama arka plana gidince geri gelir. Yanlış bir
 *   dokunuşla tüm uygulama açılan yaşlı kullanıcı kendiliğinden geri döner; kalıcı
 *   kapatma Ayarlar > Görünüm'dendir.
 * - `yuklendi`: ana ekran disk okunmadan karar vermesin (initialState gerçek veri
 *   sanılmasın — AGENTS.md hidrasyon kuralı).
 */
export interface SadeGorunumState {
  ayarlar: SadeGorunumAyarlari;
  yuklendi: boolean;
  yukleniyor: boolean;
  geciciCikis: boolean;
  hata: string | null;
}

const initialState: SadeGorunumState = {
  ayarlar: { ...VARSAYILAN_SADE_GORUNUM_AYARLARI },
  yuklendi: false,
  yukleniyor: false,
  geciciCikis: false,
  hata: null,
};

type DurumKaynagi = { sadeGorunum?: SadeGorunumState };

/**
 * Salt `AsyncStorage` okuması — izin istemez. Ana ekran ve sekme çubuğu aynı anda
 * isteyebildiği için `condition` ikinci okumayı atlar; içe aktarma `zorla` geçer.
 */
export const sadeGorunumAyarlariniYukle = createAsyncThunk<
  SadeGorunumAyarlari,
  { zorla?: boolean } | undefined
>('sadeGorunum/yukle', async () => LocalSadeGorunumServisi.getAyarlar(), {
  condition: (arg, { getState }) => {
    if (arg?.zorla) return true;
    const durum = (getState() as DurumKaynagi).sadeGorunum;
    return !durum || (!durum.yuklendi && !durum.yukleniyor);
  },
});

export const sadeGorunumuAyarla = createAsyncThunk(
  'sadeGorunum/ayarla',
  async (aktif: boolean) => {
    const yeni: SadeGorunumAyarlari = { aktif };
    const kaydedildi = await LocalSadeGorunumServisi.saveAyarlar(yeni);
    if (!kaydedildi) throw new Error('Sade görünüm ayarı kaydedilemedi');
    return yeni;
  },
);

const sadeGorunumSlice = createSlice({
  name: 'sadeGorunum',
  initialState,
  reducers: {
    /** 'Tüm uygulamayı açın': yalnız bu oturum için normal görünüm. */
    geciciCik: (state) => {
      state.geciciCikis = true;
    },
    /** Sade görünüme geri dön (düğme ya da uygulama arka plana gidince). */
    geciciCikisiBitir: (state) => {
      state.geciciCikis = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sadeGorunumAyarlariniYukle.pending, (state) => {
        state.yukleniyor = true;
      })
      .addCase(sadeGorunumAyarlariniYukle.fulfilled, (state, action) => {
        state.ayarlar = action.payload;
        state.yuklendi = true;
        state.yukleniyor = false;
        state.hata = null;
      })
      .addCase(sadeGorunumAyarlariniYukle.rejected, (state, action) => {
        // Okuma reddetmez ama yine de: kapı açılsın, varsayılanla (kapalı) devam edilsin.
        state.yuklendi = true;
        state.yukleniyor = false;
        state.hata = action.error.message || metin().genel.hata.ayarYuklenemedi;
      })
      // İyimser: anahtar beklemeden dönsün.
      .addCase(sadeGorunumuAyarla.pending, (state, action) => {
        state.ayarlar = { aktif: action.meta.arg };
        // Açmak her zaman sade görünümü GÖSTERİR (geçici çıkış sıfırlanır).
        if (action.meta.arg) state.geciciCikis = false;
      })
      .addCase(sadeGorunumuAyarla.fulfilled, (state, action) => {
        state.ayarlar = action.payload;
        state.hata = null;
      })
      .addCase(sadeGorunumuAyarla.rejected, (state, action) => {
        state.ayarlar = { aktif: !action.meta.arg };
        state.hata = action.error.message || metin().genel.hata.ayarGuncellenemedi;
      });
  },
});

export const { geciciCik, geciciCikisiBitir } = sadeGorunumSlice.actions;
export default sadeGorunumSlice.reducer;
