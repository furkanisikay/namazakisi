/**
 * Yedekleme (içe-aktarma) slice + orkestratör thunk.
 *
 * İçe-aktarmanın SON adımı: saf birleştirme planını (`YedekBirlestirmeServisi`) diske
 * yazar (`Depolama`), göç bayrağını set eder (açılış göçü içe-aktarılanı ezmesin) ve
 * store'u spec §10 sırasıyla tazeler. reconcile zinciri (`seriKontrolet →
 * puanlamayiYenidenHesapla`) SIRALI çalışır — paralel DEĞİL (AGENTS.md yarış kuralı:
 * `seviyeDurumu` tek-yazıcı reconcile).
 *
 * Tasarım: docs/superpowers/specs/2026-06-14-yerel-yedekleme-aktarim-design.md (§10)
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { YedekPayload, KategoriSecimleri, GunlukNamazlar } from '../../core/types';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Depolama } from '../../data/local/Depolama';
import { mevcutVeriyiTopla } from '../../domain/services/YedeklemeServisi';
import { birlestirmePlaniOlustur } from '../../domain/services/YedekBirlestirmeServisi';
import { bugunuAl } from '../../core/utils/TarihYardimcisi';
import { konumAyarlariniYukle } from './konumSlice';
import { muhafizAyarlariniYukle } from './muhafizSlice';
import { vakitSayacAyarlariniYukle } from './vakitSayacSlice';
import { iftarSayacAyarlariniYukle } from './iftarSayacSlice';
import { sahurSayacAyarlariniYukle } from './sahurSayacSlice';
import { vakitBildirimAyarlariniYukle } from './vakitBildirimSlice';
import { takvimAyarlariniYukle } from './takvimSlice';
import { namazlariYukle } from './namazSlice';
import {
  seriVerileriniYukle,
  seriKontrolet,
  puanlamayiYenidenHesapla,
} from './seriSlice';
import { kazaVerileriniYukle } from './kazaSlice';
import { ozellikleriYukle } from './ozelliklerSlice';

export interface YedeklemeState {
  durum: 'bosta' | 'uygulaniyor' | 'tamam' | 'hata';
  hata: string | null;
  sonOzet: { yazilanAnahtarSayisi: number } | null;
}

const baslangicDurumu: YedeklemeState = {
  durum: 'bosta',
  hata: null,
  sonOzet: null,
};

/**
 * İçe-aktarmayı uygular: mevcut veriyi topla → plan üret → diske yaz → göç bayrağı →
 * store'u §10 sırasıyla tazele → reconcile (sıralı).
 */
export const iceAktarmayiUygula = createAsyncThunk(
  'yedekleme/iceAktar',
  async (
    arg: { payload: YedekPayload; secimler: KategoriSecimleri },
    { dispatch, getState }
  ) => {
    const mevcut = await mevcutVeriyiTopla();
    const plan = birlestirmePlaniOlustur(mevcut, arg.payload, arg.secimler);

    // 1) Planı diske yaz (anahtar-bazlı atomik Depolama; lost-update korumalı).
    for (const [anahtar, deger] of Object.entries(plan)) {
      await Depolama.yaz(anahtar, deger);
    }

    // 2) Göç bayrağını set et — açılış göçü içe-aktarılan günleri EZMESİN (spec §11).
    await Depolama.hamYaz(DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_MIGRASYON, '1');

    // 3) Store'u KRİTİK SIRAYLA tazele (spec §10).
    await dispatch(konumAyarlariniYukle()); // önce konum (sayaç/muhafız buna bağlı)
    await Promise.all([
      dispatch(muhafizAyarlariniYukle()),
      dispatch(vakitSayacAyarlariniYukle()),
      dispatch(iftarSayacAyarlariniYukle()),
      dispatch(sahurSayacAyarlariniYukle()),
      dispatch(vakitBildirimAyarlariniYukle()),
      dispatch(takvimAyarlariniYukle()),
    ]);
    await dispatch(namazlariYukle({ tarih: bugunuAl() }));
    await dispatch(seriVerileriniYukle());

    // reconcile SIRALI (paralel DEĞİL — AGENTS.md tek-yazıcı/yarış kuralı):
    // seriKontrolet bugünün namazlarını ister; namazlariYukle ile tazelenen state'ten al.
    const bugunNamazlar =
      ((getState() as { namaz?: { gunlukNamazlar: GunlukNamazlar | null } }).namaz
        ?.gunlukNamazlar) ?? null;
    await dispatch(seriKontrolet({ bugunNamazlar, dunNamazlar: null }));
    await dispatch(puanlamayiYenidenHesapla({ sessiz: true }));

    await dispatch(kazaVerileriniYukle());
    await dispatch(ozellikleriYukle());

    return { yazilanAnahtarSayisi: Object.keys(plan).length };
  }
);

const yedeklemeSlice = createSlice({
  name: 'yedekleme',
  initialState: baslangicDurumu,
  reducers: {
    /** Sihirbaz tekrar açıldığında durumu sıfırlar. */
    durumuSifirla: () => baslangicDurumu,
  },
  extraReducers: (builder) => {
    builder
      .addCase(iceAktarmayiUygula.pending, (state) => {
        state.durum = 'uygulaniyor';
        state.hata = null;
      })
      .addCase(iceAktarmayiUygula.fulfilled, (state, action) => {
        state.durum = 'tamam';
        state.hata = null;
        state.sonOzet = action.payload;
      })
      .addCase(iceAktarmayiUygula.rejected, (state, action) => {
        state.durum = 'hata';
        state.hata = action.error.message ?? 'İçe aktarma başarısız oldu';
      });
  },
});

export const { durumuSifirla } = yedeklemeSlice.actions;
export default yedeklemeSlice.reducer;
