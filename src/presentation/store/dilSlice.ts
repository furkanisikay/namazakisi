import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { VARSAYILAN_DIL, type DilKodu } from '../../core/dil/diller';
import { DilServisi } from '../../domain/services/DilServisi';
import { Logger } from '../../core/utils/Logger';

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

interface DurumKaynagi {
  konum?: { koordinatlar?: { lat: number; lng: number } | null };
}

/**
 * Kaydeder ve dil DEĞİŞTİYSE planlanmış metinleri yeni dilde yeniden kurar: bildirimler,
 * muhafız adımları, cuma/yatış, sesli okuma ve widget planı plan anının dilini taşır →
 * `hesapAyariniKaydet` gibi `konumDegistiUygula` yolundan yayılır (tek yayma noktası).
 */
export const diliKaydet = createAsyncThunk<DilKodu, DilKodu>('dil/kaydet', async (kod, { getState }) => {
  const degisti = await DilServisi.kaydet(kod);
  if (degisti) {
    try {
      // Bildirim düğmeleri gösterim anında, kanal adları sistem ayarlarında çözülür → yeni dilde
      // yeniden kaydedilir (kimlikler aynı; Android kanal adını günceller).
      const { bildirimKategorileriniKaydet } = require('../../domain/services/bildirimKategorileri') as typeof import('../../domain/services/bildirimKategorileri');
      await bildirimKategorileriniKaydet();
      const { BildirimServisi } = require('../../domain/services/BildirimServisi') as typeof import('../../domain/services/BildirimServisi');
      await BildirimServisi.getInstance().temelKanallariKur();
    } catch (e) {
      Logger.warn('dilSlice', 'Bildirim düğmeleri/kanalları yenilenemedi', e);
    }
    const k = (getState() as DurumKaynagi).konum?.koordinatlar;
    if (k && !(k.lat === 0 && k.lng === 0)) {
      try {
        // Tembel require: servis native modüller içerir (ekran testleri, AGENTS.md).
        const { konumDegistiUygula } = require('../../domain/services/KonumDegisikligiServisi') as typeof import('../../domain/services/KonumDegisikligiServisi');
        await konumDegistiUygula(k);
      } catch (e) {
        Logger.warn('dilSlice', 'Dil değişikliği yayılamadı', e);
      }
    }
  }
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
