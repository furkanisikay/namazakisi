/**
 * Kaza Defteri 2.0 state yönetimi.
 *
 * Store yalnız TÜRETİLMİŞ görünümü tutar; kaynak diskteki hareket defteridir.
 * Her yazım thunk'ı defterin TEK kapısından (`LocalKazaServisi.hareketleriEkle`)
 * geçer ve görünümü DİSKTEN yeniden türetir: bildirimdeki "Kazaya ekle"
 * (headless) ya da başka bir cihazdan eşitlenen hareket bellekteki eski durumla
 * ezilemez (AGENTS.md "kaza yazma tabanı disktir" kuralı, artık yapısal).
 *
 * `kazaVerileriniYukle` ASLA reddetmez (render kapısı `yukleniyor || !kazaDurumu`).
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { KazaIstatistik, KazaNamazAdi } from '../../core/types/KazaTipleri';
import { kazaIstatistikHesapla } from '../../domain/services/KazaHesaplayiciServisi';
import * as KazaDefteri from '../../domain/services/KazaDefteriServisi';
import * as LocalKaza from '../../data/local/LocalKazaServisi';
import { LocalKazaOneriServisi } from '../../data/local/LocalKazaOneriServisi';
import { Logger } from '../../core/utils/Logger';
import { tarihiISOFormatinaCevir } from '../../core/utils/TarihYardimcisi';
import {
  VARSAYILAN_KAZA_ONERI_AYARLARI,
  type KazaOneriAyarlari,
} from '../../core/kaza/farzSonrasiKazaOnerisi';
import {
  KAZA_ADINDAN_VAKTE,
  hareketKimligi,
  type KayitsizGunTercihi,
  type KazaHareketi,
  type KazaVakti,
} from '../../core/kaza/kazaHareketi';
import {
  defterHesapla,
  otomatikBaslangicGecerliMi,
  yeniTabanOnizlemesi,
  type KazaDefterGorunumu,
  type OrtusmeSecimi,
} from '../../core/kaza/kazaDefteriHesabi';

// ==================== STATE TİPİ ====================

interface KazaState {
  /** Türetilmiş görünüm (eski `KazaDurumu` ile şekil-uyumlu + defter alanları). */
  kazaDurumu: KazaDefterGorunumu | null;
  istatistik: KazaIstatistik | null;
  tempoGecmis: Record<string, number>;
  /** Defterin saklanan hareketleri (geçmiş ekranı). */
  hareketler: KazaHareketi[];
  /** Okunamayan ay anahtarları (uyarı bandı). */
  bozukAylar: string[];
  /** Eski kayıt okunamadığı için göç yapılamadı. */
  eskiKayitBozuk: boolean;
  sonTarama: string | null;
  cihaz: string | null;
  yukleniyor: boolean;
  hata: string | null;
  /** "Her farzdan sonra kaza önerin" ayarı (issue #294). */
  oneriAyarlari: KazaOneriAyarlari;
  /** Diskten okundu mu? Anahtar initialState'i gerçek veri sanmasın. */
  oneriAyarlariYuklendi: boolean;
}

const baslangicDurumu: KazaState = {
  kazaDurumu: null,
  istatistik: null,
  tempoGecmis: {},
  hareketler: [],
  bozukAylar: [],
  eskiKayitBozuk: false,
  sonTarama: null,
  cihaz: null,
  yukleniyor: false,
  hata: null,
  oneriAyarlari: { ...VARSAYILAN_KAZA_ONERI_AYARLARI },
  oneriAyarlariYuklendi: false,
};

interface DefterYuku {
  kazaDurumu: KazaDefterGorunumu;
  istatistik: KazaIstatistik;
  tempoGecmis: Record<string, number>;
  hareketler: KazaHareketi[];
  bozukAylar: string[];
  eskiKayitBozuk: boolean;
  sonTarama: string | null;
  cihaz: string;
}

const yukeCevir = (s: KazaDefteri.DefterSonucu): DefterYuku => ({
  kazaDurumu: s.gorunum,
  istatistik: kazaIstatistikHesapla(s.gorunum.toplamKalan, s.gorunum.tempoGecmis),
  tempoGecmis: s.gorunum.tempoGecmis,
  hareketler: [...s.girdi.hareketler],
  bozukAylar: s.bozukAylar,
  eskiKayitBozuk: s.eskiKayitBozuk,
  sonTarama: s.sonTarama,
  cihaz: s.cihaz,
});

/** Son çare: hiçbir şey okunamadıysa bile ekran açılsın (boş defter). */
const bosYuk = (): DefterYuku => {
  const bugun = tarihiISOFormatinaCevir(new Date());
  const gorunum = defterHesapla({
    hareketler: [],
    bugunNamazGunu: bugun,
    bugunTakvim: bugun,
    isaretliler: {},
    ozelGunler: new Set(),
    vitirDahil: false,
    gunlukHedef: LocalKaza.VARSAYILAN_KAZA_AYARLARI.gunlukHedef,
    toplamGizleMi: false,
  });
  return {
    kazaDurumu: gorunum,
    istatistik: kazaIstatistikHesapla(0, {}),
    tempoGecmis: {},
    hareketler: [],
    bozukAylar: [],
    eskiKayitBozuk: false,
    sonTarama: null,
    cihaz: '',
  };
};

const vakit = (namazAdi: KazaNamazAdi): KazaVakti => {
  const v = KAZA_ADINDAN_VAKTE[namazAdi];
  if (!v) throw new Error(`Bilinmeyen kaza vakti: ${namazAdi}`);
  return v;
};

const pozitif = (sayi: number): number => {
  if (!Number.isInteger(sayi) || sayi <= 0) throw new Error('Geçersiz sayı');
  return sayi;
};

// ==================== ASYNC THUNKS ====================

/**
 * Defteri yükler ve otomatik tarama günlüğünü tazeler. ASLA REDDETMEZ: okuma
 * başarısız olsa da boş (kullanılabilir) görünümle `fulfilled` döner.
 */
export const kazaVerileriniYukle = createAsyncThunk('kaza/yukle', async (): Promise<DefterYuku> => {
  try {
    const sonuc = (await KazaDefteri.taramaYap()) ?? (await KazaDefteri.defteriHesapla());
    return yukeCevir(sonuc);
  } catch (e) {
    Logger.error('kazaSlice', 'Kaza defteri türetilemedi, boş görünümle açılıyor', e);
    return bosYuk();
  }
});

/** Bir vakte elle borç ekler (`manuel` hareketi). */
export const borcEkle = createAsyncThunk(
  'kaza/borcEkle',
  async ({ namazAdi, sayi, not }: { namazAdi: KazaNamazAdi; sayi: number; not?: string }) =>
    yukeCevir(
      await KazaDefteri.yazVeHesapla(async (temel) => [
        KazaDefteri.hareketUret.manuel(await temel('manuel'), vakit(namazAdi), pozitif(sayi), not?.trim() || undefined),
      ])
    )
);

/**
 * Kaza kıldı (`kilindi`, vakit ZORUNLU). Vakit seçmeden "genel tamamlama"
 * KALDIRILDI (sahip kararı): arayüzde onu çağıran bir düğme yoktu.
 */
export const kazaTamamla = createAsyncThunk(
  'kaza/tamamla',
  async ({ namazAdi, sayi }: { namazAdi: KazaNamazAdi; sayi: number }) =>
    yukeCevir(
      await KazaDefteri.yazVeHesapla(async (temel) => [
        KazaDefteri.hareketUret.kilindi(await temel('kilindi'), vakit(namazAdi), pozitif(sayi)),
      ])
    )
);

/**
 * Yeni hesaplanan tabanı yazar. Eski taban SİLİNMEZ (tarihçe). Önizleme
 * (`yeniTabanOnizlemesi`) diskten TAZE okunan girdiyle yeniden kurulur; örtüşme
 * seçimi "gizle" ise aynı işlemde tek bir geri alınabilir temizlik yazılır.
 */
export const yeniTabanUygula = createAsyncThunk(
  'kaza/yeniTaban',
  async (arg: { taban: Record<KazaVakti, number>; kapsamBitis?: string; ortusme: OrtusmeSecimi }) => {
    const { girdi, cihaz } = await KazaDefteri.defteriHesapla();
    const zaman = new Date();
    const kapsamBitis = arg.kapsamBitis ?? girdi.bugunNamazGunu;
    const onizleme = yeniTabanOnizlemesi(girdi, arg.taban, kapsamBitis, zaman.toISOString(), cihaz, (onek) =>
      hareketKimligi(onek, zaman.getTime())
    );
    await LocalKaza.hareketleriEkle(onizleme.yazilacak[arg.ortusme]);
    return yukeCevir(await KazaDefteri.defteriHesapla());
  }
);

/** Günlük hedef (defter ayarı). */
export const gunlukHedefiGuncelle = createAsyncThunk('kaza/gunlukHedefiGuncelle', async ({ hedef }: { hedef: number }) => {
  await LocalKaza.ayarlariGuncelle((m) => ({ ...m, gunlukHedef: Math.max(0, Math.floor(hedef)) }));
  return yukeCevir(await KazaDefteri.defteriHesapla());
});

/** Toplamı gizle/göster (defter ayarı). */
export const gizlemeToggle = createAsyncThunk('kaza/gizlemeToggle', async () => {
  await LocalKaza.ayarlariGuncelle((m) => ({ ...m, toplamGizleMi: !m.toplamGizleMi }));
  return yukeCevir(await KazaDefteri.defteriHesapla());
});

/**
 * Otomatik eklemeyi açar/kapatır ya da işaretsiz gün tercihini değiştirir.
 * Ayar DEFTERDEDİR (`otoAyar`): iki cihaz aynı izdüşümü hesaplar. `gun`
 * verilmezse bugünün namaz günü (açılan gün kapanınca sayılır; geçmişe
 * kendiliğinden GİTMEZ). Geçmiş tarama `gun`u geriye verir (önizlemeden sonra).
 */
export const otomatikAyarla = createAsyncThunk(
  'kaza/otomatikAyarla',
  async (arg: { aktif: boolean; kayitsiz?: KayitsizGunTercihi; gun?: string }) => {
    const bugun = KazaDefteri.bugunNamazGunuAl();
    const gun = arg.gun ?? bugun;
    // Geçersiz, gelecekteki ya da `GECMIS_TARAMA_AZAMI_GUN`'den eski başlangıç
    // YAZILMAZ (izdüşüm penceresi bozuk aralıkla şişmesin).
    if (!otomatikBaslangicGecerliMi(gun, bugun)) throw new Error('Otomatik ekleme başlangıcı geçersiz');
    const sonuc = await KazaDefteri.yazVeHesapla(async (temel) => [
      KazaDefteri.hareketUret.otoAyar(await temel('oto'), arg.aktif, gun, arg.kayitsiz),
    ]);
    // Gün sonu muhasebesi (#290) "işaretlemezseniz kazaya eklenecek" satırını
    // bu ayara göre yazar → plan tazelensin. TEMBEL require: bildirim köprüsü.
    try {
      const { YatisHatirlatmaServisi } = require('../../domain/services/YatisHatirlatmaServisi') as
        typeof import('../../domain/services/YatisHatirlatmaServisi');
      void YatisHatirlatmaServisi.getInstance().hatirlatmalariGuncelle();
    } catch {
      // Plan bir sonraki tazelemede (açılış / 15 dk görevi) güncellenir.
    }
    return yukeCevir(sonuc);
  }
);

/** "Kontrol bekleyen gün" kararı. */
export const gunKarariVer = createAsyncThunk(
  'kaza/gunKarari',
  async (arg: { gunler: string[]; karar: 'ekle' | 'yoksay' }) =>
    yukeCevir(
      await KazaDefteri.yazVeHesapla(async (temel) => {
        const liste: KazaHareketi[] = [];
        for (const gun of arg.gunler) liste.push(KazaDefteri.hareketUret.gunKarari(await temel('karar'), gun, arg.karar));
        return liste;
      })
    )
);

/** Seçili kayıtları gizler (silme YOK). Dönen `temizlikId` "Geri al" içindir. */
export const temizlikUygula = createAsyncThunk('kaza/temizlik', async (arg: { hedefIdler: string[] }) => {
  if (arg.hedefIdler.length === 0) throw new Error('Gizlenecek kayıt yok');
  let temizlikId = '';
  const sonuc = await KazaDefteri.yazVeHesapla(async (temel) => {
    const h = KazaDefteri.hareketUret.temizlik(await temel('temizlik'), arg.hedefIdler);
    temizlikId = h.id;
    return [h];
  });
  return { ...yukeCevir(sonuc), temizlikId };
});

/** Bir temizliği geri alır (o da bir harekettir). */
export const temizlikGeriAl = createAsyncThunk('kaza/temizlikGeriAl', async (arg: { temizlikId: string }) =>
  yukeCevir(
    await KazaDefteri.yazVeHesapla(async (temel) => [
      KazaDefteri.hareketUret.temizlikGeriAl(await temel('geri'), arg.temizlikId),
    ])
  )
);

/**
 * "Fazla kılınanı sıfırla": fazla kılınan sayı AYRI bir akümülatördedir
 * (sonradan eklenen borçtan düşülmez). Her vakit için NEGATİF bir `duzeltme`
 * yazılır; fold onu yalnız fazladan düşer — kalan DEĞİŞMEZ.
 */
export const fazlayiSifirla = createAsyncThunk('kaza/fazlayiSifirla', async () => {
  const { gorunum } = await KazaDefteri.defteriHesapla();
  return yukeCevir(
    await KazaDefteri.yazVeHesapla(async (temel) => {
      const liste: KazaHareketi[] = [];
      for (const [ad, adet] of Object.entries(gorunum.fazla)) {
        const v = KAZA_ADINDAN_VAKTE[ad];
        if (v && adet > 0) liste.push(KazaDefteri.hareketUret.duzeltme(await temel('duzeltme'), v, -adet));
      }
      return liste;
    })
  );
});

/**
 * "Her farzla bir kaza" önerisi ayarı (issue #294). Salt `AsyncStorage` okuması,
 * ASLA reddetmez (bozuk kayıt → varsayılan açık).
 */
export const kazaOneriAyarlariniYukle = createAsyncThunk('kaza/oneriAyarlariniYukle', async () =>
  LocalKazaOneriServisi.ayarlariGetir()
);

export const kazaOneriAyarlariniGuncelle = createAsyncThunk(
  'kaza/oneriAyarlariniGuncelle',
  async (ayarlar: KazaOneriAyarlari) => {
    const kaydedildi = await LocalKazaOneriServisi.ayarlariKaydet(ayarlar);
    if (!kaydedildi) throw new Error('Kaza önerisi ayarı kaydedilemedi');
    return ayarlar;
  }
);

// ==================== SLICE ====================

const defteriYaz = (state: KazaState, yuk: DefterYuku) => {
  state.kazaDurumu = yuk.kazaDurumu;
  state.istatistik = yuk.istatistik;
  state.tempoGecmis = yuk.tempoGecmis;
  state.hareketler = yuk.hareketler;
  state.bozukAylar = yuk.bozukAylar;
  state.eskiKayitBozuk = yuk.eskiKayitBozuk;
  state.sonTarama = yuk.sonTarama;
  state.cihaz = yuk.cihaz;
  state.hata = null;
};

const YAZIM_THUNKLARI = [
  borcEkle,
  kazaTamamla,
  yeniTabanUygula,
  gunlukHedefiGuncelle,
  gizlemeToggle,
  otomatikAyarla,
  gunKarariVer,
  temizlikUygula,
  temizlikGeriAl,
  fazlayiSifirla,
] as const;

const kazaSlice = createSlice({
  name: 'kaza',
  initialState: baslangicDurumu,
  reducers: {
    hataTemizle: (state) => {
      state.hata = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(kazaVerileriniYukle.pending, (state) => {
        state.yukleniyor = true;
        state.hata = null;
      })
      .addCase(kazaVerileriniYukle.fulfilled, (state, action) => {
        state.yukleniyor = false;
        defteriYaz(state, action.payload);
      })
      .addCase(kazaVerileriniYukle.rejected, (state, action) => {
        // Thunk reddetmez; yine de kapı kilitlenmesin.
        state.yukleniyor = false;
        state.hata = action.error.message || 'Kaza verileri yüklenemedi';
      })
      .addCase(kazaOneriAyarlariniYukle.fulfilled, (state, action) => {
        state.oneriAyarlari = action.payload;
        state.oneriAyarlariYuklendi = true;
      })
      // İyimser: anahtar beklemeden dönsün; yazım başarısızsa geri alınır.
      .addCase(kazaOneriAyarlariniGuncelle.pending, (state, action) => {
        state.oneriAyarlari = action.meta.arg;
      })
      .addCase(kazaOneriAyarlariniGuncelle.fulfilled, (state, action) => {
        state.oneriAyarlari = action.payload;
        state.oneriAyarlariYuklendi = true;
      })
      .addCase(kazaOneriAyarlariniGuncelle.rejected, (state, action) => {
        state.oneriAyarlari = { farzSonrasiOner: !action.meta.arg.farzSonrasiOner };
      });
    for (const thunk of YAZIM_THUNKLARI) {
      builder.addCase(thunk.fulfilled, (state, action) => {
        defteriYaz(state, action.payload as DefterYuku);
      });
      builder.addCase(thunk.rejected, (state, action) => {
        state.hata = action.error.message || 'Kaza defterine yazılamadı';
      });
    }
  },
});

export const { hataTemizle } = kazaSlice.actions;
export default kazaSlice.reducer;
