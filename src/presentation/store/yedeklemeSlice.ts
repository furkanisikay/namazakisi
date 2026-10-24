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
import { mevcutVeriyiTopla, planiDiskeYaz } from '../../domain/services/YedeklemeServisi';
import { birlestirmePlaniOlustur } from '../../domain/services/YedekBirlestirmeServisi';
import { bugunuAl } from '../../core/utils/TarihYardimcisi';
import { konumAyarlariniYukle } from './konumSlice';
import { muhafizAyarlariniYukle } from './muhafizSlice';
import { vakitSayacAyarlariniYukle } from './vakitSayacSlice';
import { iftarSayacAyarlariniYukle } from './iftarSayacSlice';
import { sahurSayacAyarlariniYukle } from './sahurSayacSlice';
import { vakitBildirimAyarlariniYukle } from './vakitBildirimSlice';
import { cumaHatirlatmaAyarlariniYukle } from './cumaHatirlatmaSlice';
import { yatisHatirlatmaAyarlariniYukle } from './yatisHatirlatmaSlice';
import { YatisHatirlatmaServisi } from '../../domain/services/YatisHatirlatmaServisi';
import { takvimCakismaAyarlariniYukle } from './takvimCakismaSlice';
import { TakvimCakismaServisi } from '../../domain/services/TakvimCakismaServisi';
import { CumaHatirlatmaServisi } from '../../domain/services/CumaHatirlatmaServisi';
import { camiyeGitAyarlariniYukle } from './camiyeGitSlice';
import { CamiyeGitHatirlatmaServisi } from '../../domain/services/CamiyeGitHatirlatmaServisi';
import { nafileAyarlariniYukle } from './nafileSlice';
import { nowBarAyarlariniYukle } from './nowBarSlice';
import { sadeGorunumAyarlariniYukle } from './sadeGorunumSlice';
import { hatirlatmaRizalariniYukle } from './hatirlatmaRizaSlice';
import { hesapAyariniYukle } from './hesapSlice';
import { diliYukle } from './dilSlice';
import { seferilikYukle } from './seferilikSlice';
import { NafileHatirlatmaServisi } from '../../domain/services/NafileHatirlatmaServisi';
import { gunSonuHatirlatmalariniGuncelle } from '../../domain/services/GunSonuHatirlaticiServisi';
import { WearSenkronServisi } from '../../domain/services/WearSenkronServisi';
import { WidgetServisi } from '../../domain/services/WidgetServisi';
import { takvimAyarlariniYukle } from './takvimSlice';
import { namazlariYukle } from './namazSlice';
import {
  seriVerileriniYukle,
  seriKontrolet,
  puanlamayiYenidenHesapla,
} from './seriSlice';
import { kazaVerileriniYukle, kazaOneriAyarlariniYukle } from './kazaSlice';
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

    // 1) Planı diske yaz (anahtar-bazlı atomik Depolama; lost-update korumalı) ve
    // 2) göç bayrağını set et — açılış göçü içe-aktarılan günleri EZMESİN (spec §11).
    // Ortak disk adımı: cihazlar arası eşitlemenin arka plan yolu da buradan geçer.
    await planiDiskeYaz(plan);

    // 3) Store'u KRİTİK SIRAYLA tazele (spec §10).
    // Hesap ayarı (yöntem/ikindi) vakit hesaplayan her şeyden önce — beyaz listenin üçüncü yeri.
    await dispatch(hesapAyariniYukle({ zorla: true }));
    // Arayüz dili de planlanan metinlerden önce (bildirimler plan anının dilini taşır).
    await dispatch(diliYukle({ zorla: true }));
    await dispatch(konumAyarlariniYukle()); // önce konum (sayaç/muhafız buna bağlı)
    await Promise.all([
      dispatch(muhafizAyarlariniYukle()),
      dispatch(vakitSayacAyarlariniYukle()),
      dispatch(iftarSayacAyarlariniYukle()),
      dispatch(sahurSayacAyarlariniYukle()),
      dispatch(vakitBildirimAyarlariniYukle()),
      dispatch(cumaHatirlatmaAyarlariniYukle()),
      dispatch(yatisHatirlatmaAyarlariniYukle()),
      dispatch(takvimCakismaAyarlariniYukle()),
      dispatch(camiyeGitAyarlariniYukle()),
      dispatch(nafileAyarlariniYukle()),
      dispatch(nowBarAyarlariniYukle()),
      // Sade görünüm (issue #295): `condition` yüklüyse atlar → zorla tazele.
      dispatch(sadeGorunumAyarlariniYukle({ zorla: true })),
      // Tek rıza (Dalga 3): aynı `condition` deseni → zorla tazele.
      dispatch(hatirlatmaRizalariniYukle({ zorla: true })),
      // Seferîlik bilgi kartı (issue #296): aynı `condition` deseni → zorla tazele.
      dispatch(seferilikYukle({ zorla: true })),
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
    await dispatch(kazaOneriAyarlariniYukle());
    await dispatch(ozellikleriYukle());

    // Özel gün / seri ayarı geri yüklendiyse TÜM hatırlatmaları yeniden kur
    // (issue #272): içe aktarma diske `Depolama.yaz` ile doğrudan yazar, özel gün
    // thunk'ları çalışmaz → `ozelGunListener` TETİKLENMEZ. Yeniden kurulmazsa
    // yedekteki aralık "aktif" görünür ama muhafız/vakit/nafile/iftar/sahur/cuma
    // ve gün sonu hatırlatmaları bir sonraki tazelemeye kadar çalmaya devam eder.
    // `ozelGunDegistiUygula` tek yayma listesini (`konumDegistiUygula`) koşturur;
    // cuma/nafile/gün sonu o listede zaten var → aşağıda yeniden çağrılmaz.
    // Gün sonu hatırlatması seri AYARLARINA da bağlı olduğu için o anahtar da
    // aynı yoldan geçer. TEMBEL `require`: zincir native köprüleri çeker
    // (`ozelGunListener` ile aynı gerekçe).
    // Now Bar seçimi (issue #282) de sayaçların kendi bildirimini kurup kurmayacağını
    // belirler → geri yüklenince aynı tek yayma listesi koşar.
    const yayilmaGerekli =
      DEPOLAMA_ANAHTARLARI.OZEL_GUN_AYARLARI in plan ||
      DEPOLAMA_ANAHTARLARI.SERI_AYARLARI in plan ||
      DEPOLAMA_ANAHTARLARI.NOW_BAR_AYARLARI in plan;
    let yayildi = false;
    if (yayilmaGerekli) {
      try {
        const { ozelGunDegistiUygula } = require('../../domain/services/OzelGunDegisikligiServisi') as
          typeof import('../../domain/services/OzelGunDegisikligiServisi');
        yayildi = await ozelGunDegistiUygula();
      } catch {
        // İçe aktarma başarılı sayılmalı; planlama bir sonraki açılışta tazelenir.
      }
    }

    if (!yayildi) {
      // Cuma hatırlatmasını GERÇEKTEN yeniden planla: ayarı yüklemek yalnız ekranı
      // günceller, bildirimleri kurmaz. Yedeğinde cuma açık olan kullanıcıda ayar
      // "açık" görünüp bildirimler bir sonraki soğuk açılışa kadar kurulmazdı —
      // penceresi 4 hafta ve olay haftada bir olduğu için kaçırma riski yüksek.
      const sonKonum = (getState() as { konum?: { koordinatlar?: { lat: number; lng: number } } }).konum?.koordinatlar ?? null;
      try {
        await CumaHatirlatmaServisi.getInstance().hatirlatmalariGuncelle(sonKonum);
      } catch {
        // İçe aktarma başarılı sayılmalı; planlama bir sonraki açılışta tazelenir.
      }
      // Nafile hatırlatmaları da (issue #77): aynı gerekçe — ayarı yüklemek bildirim kurmaz.
      try {
        await NafileHatirlatmaServisi.getInstance().hatirlatmalariGuncelle(sonKonum);
      } catch {
        // İçe aktarma başarılı sayılmalı; planlama bir sonraki açılışta tazelenir.
      }
      // "Camide kılacağım" (issue #292): aynı gerekçe — ayarı yüklemek bildirim kurmaz.
      try {
        await CamiyeGitHatirlatmaServisi.getInstance().hatirlatmalariGuncelle(sonKonum);
      } catch {
        // İçe aktarma başarılı sayılmalı; planlama bir sonraki açılışta tazelenir.
      }
      // Gün sonu seri hatırlatması: konum yokken yayma koşmaz ama sabit modda /
      // 04:00 yedeğiyle yine kurulabilir; seri ayarı geri yüklendiyse burada kurulur.
      if (yayilmaGerekli) {
        await gunSonuHatirlatmalariniGuncelle(sonKonum).catch(() => undefined);
      }
    }
    // Yatış hatırlatması + gün sonu muhasebesi (issue #290): içerik namaz
    // KAYITLARINDAN üretilir ve içe aktarma onları `Depolama.yaz` ile DOĞRUDAN
    // yazar (kılınmışlık gözlemcisi tetiklenmez) → yayma koşsa da koşmasa da
    // burada yeniden planlanır. Koordinat yoksa servis kurulu planı korur.
    try {
      const sonKonum = (getState() as { konum?: { koordinatlar?: { lat: number; lng: number } } }).konum?.koordinatlar ?? null;
      await YatisHatirlatmaServisi.getInstance().hatirlatmalariGuncelle(sonKonum);
    } catch {
      // İçe aktarma başarılı sayılmalı; planlama bir sonraki açılışta tazelenir.
    }
    // Takvim çakışması uyarısı (issue #291): ayarı yüklemek bildirim kurmaz ve
    // kılınmışlık (içe aktarılan kayıtlar) uyarıyı eler → yayma koşsa da koşmasa da.
    try {
      const sonKonum = (getState() as { konum?: { koordinatlar?: { lat: number; lng: number } } }).konum?.koordinatlar ?? null;
      await TakvimCakismaServisi.getInstance().hatirlatmalariGuncelle(sonKonum);
    } catch {
      // İçe aktarma başarılı sayılmalı; planlama bir sonraki açılışta tazelenir.
    }
    // Wear OS saati (issue #269): içe aktarma kayıtları `Depolama.yaz` ile DOĞRUDAN
    // yazar (LocalNamazServisi gözlemcisinden geçmez) → saati açıkça tazele.
    await WearSenkronServisi.getInstance().gonder().catch(() => undefined);
    // Ana ekran widget'ı + hızlı ayarlar kutusu (issue #275): aynı gerekçe.
    await WidgetServisi.getInstance().kilinanlariYaz().catch(() => undefined);

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
