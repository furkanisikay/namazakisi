import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { LocalSeferilikServisi } from '../../data/local/LocalSeferilikServisi';
import { SeferilikServisi, type SeferilikDiskDurumu } from '../../domain/services/SeferilikServisi';
import {
  VARSAYILAN_SEFERILIK_AYARLARI,
  VARSAYILAN_SEFERILIK_HAFIZASI,
  type Mezhep,
  type SeferilikAyarlari,
  type SeferilikKartHafizasi,
} from '../../core/seferilik/seferilikAyarlari';
import type { Koordinat } from '../../core/seferilik/seferilikKarari';

/**
 * Seferîlik bilgi kartı (issue #296).
 *
 * - `ayarlar` (kart açık, mezhep, ikamet) KALICIDIR ve yedeklenir.
 * - `hafiza` ("bu yolculukta kapattım") cihaza özgüdür.
 * - `yuklendi`: kart disk okunmadan karar vermesin (initialState gerçek veri
 *   sanılmasın — AGENTS.md hidrasyon kuralı). Tembel yüklenir (`useSeferilik`).
 */
export interface SeferilikState {
  ayarlar: SeferilikAyarlari;
  hafiza: SeferilikKartHafizasi;
  /**
   * Son işlenen konum — DİSKTEKİ konum kaydından (store'daki konum İstanbul
   * varsayılanıyla doğar, "yüklendi" bayrağı yoktur; bkz. `SeferilikServisi`).
   */
  sonKonum: Koordinat | null;
  sonKonumAdi?: string;
  yuklendi: boolean;
  yukleniyor: boolean;
  hata: string | null;
}

const initialState: SeferilikState = {
  ayarlar: { ...VARSAYILAN_SEFERILIK_AYARLARI },
  hafiza: { ...VARSAYILAN_SEFERILIK_HAFIZASI },
  sonKonum: null,
  yuklendi: false,
  yukleniyor: false,
  hata: null,
};

type DurumKaynagi = { seferilik?: SeferilikState };

/** Salt depolama okuması. İçe aktarma `zorla` geçer (`condition` yüklüyse atlar). */
export const seferilikYukle = createAsyncThunk<SeferilikDiskDurumu, { zorla?: boolean } | undefined>(
  'seferilik/yukle',
  async () => {
    const [ayarlar, hafiza] = await Promise.all([
      LocalSeferilikServisi.ayarlariOku(),
      LocalSeferilikServisi.hafizaOku(),
    ]);
    return { ayarlar, hafiza };
  },
  {
    condition: (arg, { getState }) => {
      if (arg?.zorla) return true;
      const durum = (getState() as DurumKaynagi).seferilik;
      return !durum || (!durum.yuklendi && !durum.yukleniyor);
    },
  },
);

/** Diskteki konumu işler (ilk ikamet / eve dönüş) ve kart için saklar. */
export const seferilikKonumIsle = createAsyncThunk('seferilik/konumIsle', async () =>
  SeferilikServisi.diskKonumunuIsle(),
);

/** Kartı bu yolculuk için kapatır (ikamete dönülünce yeniden çıkabilir). */
export const seferilikKartiniKapat = createAsyncThunk('seferilik/kartiKapat', async () =>
  LocalSeferilikServisi.hafizaYaz({ yolculuktaKapatildi: true }),
);

/** Kart anahtarı ve mezhep. */
export const seferilikAyarlariniGuncelle = createAsyncThunk(
  'seferilik/ayarlariGuncelle',
  async (degisiklik: { kartAcik?: boolean; mezhep?: Mezhep }) =>
    LocalSeferilikServisi.ayarlariGuncelle((m) => ({ ...m, ...degisiklik })),
);

/**
 * "Burası evim": şu anki konumu ikamet yapar. İkamete gelindiği için yolculuk
 * da bitmiş sayılır → kapatma hafızası sıfırlanır.
 */
export const seferilikIkametiAyarla = createAsyncThunk(
  'seferilik/ikametiAyarla',
  async (arg: { konum: Koordinat; ad?: string }): Promise<SeferilikDiskDurumu> => {
    const ad = arg.ad?.trim();
    const ayarlar = await LocalSeferilikServisi.ayarlariGuncelle((m) => ({
      ...m,
      ikamet: { lat: arg.konum.lat, lng: arg.konum.lng, kaynak: 'kullanici', ...(ad ? { ad } : {}) },
    }));
    const hafiza = await LocalSeferilikServisi.hafizaYaz({ yolculuktaKapatildi: false });
    return { ayarlar, hafiza };
  },
);

const seferilikSlice = createSlice({
  name: 'seferilik',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(seferilikYukle.pending, (state) => {
        state.yukleniyor = true;
      })
      .addCase(seferilikYukle.fulfilled, (state, action) => {
        state.ayarlar = action.payload.ayarlar;
        state.hafiza = action.payload.hafiza;
        state.yuklendi = true;
        state.yukleniyor = false;
        state.hata = null;
      })
      .addCase(seferilikYukle.rejected, (state, action) => {
        // Okuma reddetmez; yine de kapı açılsın, varsayılanla devam edilsin.
        state.yuklendi = true;
        state.yukleniyor = false;
        state.hata = action.error.message || 'Ayar yüklenemedi';
      })
      .addCase(seferilikKonumIsle.fulfilled, (state, action) => {
        state.ayarlar = action.payload.ayarlar;
        state.hafiza = action.payload.hafiza;
        state.sonKonum = action.payload.konum;
        state.sonKonumAdi = action.payload.konumAdi;
        state.yuklendi = true;
      })
      // İyimser: kart dokunur dokunmaz kaybolsun.
      .addCase(seferilikKartiniKapat.pending, (state) => {
        state.hafiza = { yolculuktaKapatildi: true };
      })
      .addCase(seferilikKartiniKapat.rejected, (state, action) => {
        state.hafiza = { yolculuktaKapatildi: false };
        state.hata = action.error.message || 'Kart kapatılamadı';
      })
      .addCase(seferilikAyarlariniGuncelle.pending, (state, action) => {
        state.ayarlar = { ...state.ayarlar, ...action.meta.arg };
      })
      .addCase(seferilikAyarlariniGuncelle.fulfilled, (state, action) => {
        state.ayarlar = action.payload;
        state.hata = null;
      })
      .addCase(seferilikAyarlariniGuncelle.rejected, (state, action) => {
        state.hata = action.error.message || 'Ayar güncellenemedi';
      })
      .addCase(seferilikIkametiAyarla.fulfilled, (state, action) => {
        state.ayarlar = action.payload.ayarlar;
        state.hafiza = action.payload.hafiza;
        state.hata = null;
      })
      .addCase(seferilikIkametiAyarla.rejected, (state, action) => {
        state.hata = action.error.message || 'İkamet yeri kaydedilemedi';
      });
  },
});

export default seferilikSlice.reducer;
