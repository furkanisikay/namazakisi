import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { VARSAYILAN_DIL, type DilKodu } from '../../core/dil/diller';
import { DilServisi } from '../../domain/services/DilServisi';
import { Logger } from '../../core/utils/Logger';
import { aktifDil } from '../../core/dil/aktifDil';

/**
 * Arayüz dili — ekranların yeniden çizilmesi için store aynası. Gerçek kaynak disk +
 * `core/dil/aktifDil` (arka planda Redux yoktur).
 */
export interface DilState {
  kod: DilKodu;
  yuklendi: boolean;
}

const initialState: DilState = { kod: VARSAYILAN_DIL, yuklendi: false };

/** `zorla`: disk yeniden okunur (yedekten geri yükleme dili değiştirmiş olabilir). */
export const diliYukle = createAsyncThunk<DilKodu, { zorla?: boolean } | undefined>('dil/yukle', (arg) =>
  DilServisi.yukle(arg?.zorla ?? false)
);

interface DurumKaynagi {
  konum?: { koordinatlar?: { lat: number; lng: number } | null };
}

/**
 * Kaydeder ve dil DEĞİŞTİYSE planlanmış metinleri yeni dilde yeniden kurar: bildirimler,
 * muhafız adımları, cuma/yatış, sesli okuma ve widget planı plan anının dilini taşır →
 * `hesapAyariniKaydet` gibi `konumDegistiUygula` yolundan yayılır (tek yayma noktası).
 */
export const diliKaydet = createAsyncThunk<DilKodu, DilKodu | 'cihaz'>('dil/kaydet', async (secim, { getState }) => {
  // 'cihaz': açık seçim silinir, cihaz dili izlenir (seçilebilir değilse Türkçe).
  const degisti = secim === 'cihaz' ? await DilServisi.cihazDilineDon() : await DilServisi.kaydet(secim);
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
    } else {
      // Konum yokken de günün ayeti metinleri yeni dilde yazılsın (yayma listesi konum ister).
      const { GununAyetiServisi } = require('../../domain/services/GununAyetiServisi') as typeof import('../../domain/services/GununAyetiServisi');
      await GununAyetiServisi.getInstance().yaz();
    }
  }
  return secim === 'cihaz' ? aktifDil() : secim;
});

/**
 * Dil değişince SORULACAK elle yazılmış sesli okuma metni sayısı ("bir kez sor" kapısı).
 * Metinlerin varsayılan dili (`ozelAnonsDili`) yeni dille aynıysa sorulmaz (geri dönüşte
 * "önceki dilde kaldı" demek yanlış olur). Hiç metin yoksa varsayılan dil yeni dil olur:
 * bundan sonra yazılanlar bu dilde yazılır.
 */
export const ozelAnonsSay = createAsyncThunk<number>('dil/ozelAnonsSay', async () => {
  const { LocalOzelAnonsServisi } = require('../../data/local/LocalOzelAnonsServisi') as typeof import('../../data/local/LocalOzelAnonsServisi');
  const yeni = aktifDil();
  const n = await LocalOzelAnonsServisi.say();
  if (n === 0) {
    await DilServisi.ozelAnonsDiliniKaydet(yeni).catch((e: unknown) => Logger.warn('dilSlice', 'Metin dili kaydedilemedi', e));
    return 0;
  }
  return (await DilServisi.ozelAnonsDili()) === yeni ? 0 : n;
});

/**
 * Kullanıcı onayladıysa elle yazılmış sesli okuma metinlerini etkin dilin hazır şablonuyla
 * değiştirir; değişen yüzeylerin slice'larını diskten yeniden yükler (eski metin ekranda kalıp
 * bir sonraki kayıtta geri yazılmasın) ve planları yeniler.
 */
export const ozelAnonslariDegistir = createAsyncThunk<number, void>('dil/ozelAnonslariDegistir', async (_, { dispatch, getState }) => {
  const { LocalOzelAnonsServisi } = require('../../data/local/LocalOzelAnonsServisi') as typeof import('../../data/local/LocalOzelAnonsServisi');
  const degisen = await LocalOzelAnonsServisi.sablonlaDegistir();
  await DilServisi.ozelAnonsDiliniKaydet(aktifDil()).catch((e: unknown) => Logger.warn('dilSlice', 'Metin dili kaydedilemedi', e));
  if (degisen.length === 0) return 0;
  try {
    const yukleyiciler: Record<string, () => unknown> = {
      muhafiz: () => (require('./muhafizSlice') as typeof import('./muhafizSlice')).muhafizAyarlariniYukle(),
      nafile: () => (require('./nafileSlice') as typeof import('./nafileSlice')).nafileAyarlariniYukle(),
      cuma: () => (require('./cumaHatirlatmaSlice') as typeof import('./cumaHatirlatmaSlice')).cumaHatirlatmaAyarlariniYukle(),
      camiyeGit: () => (require('./camiyeGitSlice') as typeof import('./camiyeGitSlice')).camiyeGitAyarlariniYukle(),
      yatis: () => (require('./yatisHatirlatmaSlice') as typeof import('./yatisHatirlatmaSlice')).yatisHatirlatmaAyarlariniYukle(),
      takvim: () => (require('./takvimCakismaSlice') as typeof import('./takvimCakismaSlice')).takvimCakismaAyarlariniYukle(),
    };
    for (const y of degisen) await dispatch(yukleyiciler[y]() as never);
  } catch (e) {
    Logger.warn('dilSlice', 'Ayarlar yeniden yüklenemedi', e);
  }
  const k = (getState() as DurumKaynagi).konum?.koordinatlar;
  if (k && !(k.lat === 0 && k.lng === 0)) {
    try {
      const { konumDegistiUygula } = require('../../domain/services/KonumDegisikligiServisi') as typeof import('../../domain/services/KonumDegisikligiServisi');
      await konumDegistiUygula(k);
    } catch (e) {
      Logger.warn('dilSlice', 'Planlar yenilenemedi', e);
    }
  }
  return degisen.length;
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
