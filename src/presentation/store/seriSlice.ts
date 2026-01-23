/**
 * Seri (Streak) state yonetimi
 * Seri durumu, rozetler, seviye ve ayarlari yonetir (Offline-only)
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  SeriDurumu,
  SeriAyarlari,
  KullaniciRozeti,
  SeviyeDurumu,
  KutlamaBilgisi,
  RozetDetay,
  VARSAYILAN_SERI_AYARLARI,
  OzelGunAyarlari,
  OzelGunKaydi,
} from '../../core/types/SeriTipleri';
import { GunlukNamazlar } from '../../core/types';
import * as LocalSeriServisi from '../../data/local/LocalSeriServisi';
import { BildirimServisi } from '../../domain/services/BildirimServisi';
import {
  seriHesapla,
  seriOzetiniOlustur,
  kilinanNamazSayisi,
} from '../../domain/services/SeriHesaplayiciServisi';
import {
  rozetDetaylariniAl,
  tamGuncellemeyiYap,
  bosSeviyeDurumuOlustur,
} from '../../domain/services/RozetYoneticisiServisi';

// ==================== STATE TIPI ====================

interface SeriState {
  seriDurumu: SeriDurumu | null;
  seviyeDurumu: SeviyeDurumu | null;
  kullaniciRozetleri: KullaniciRozeti[];
  rozetDetaylari: RozetDetay[];
  ayarlar: SeriAyarlari;
  toplamKilinanNamaz: number;
  toparlanmaSayisi: number;
  mukemmelGunSayisi: number;
  ozelGunAyarlari: OzelGunAyarlari;
  // Kutlama queue - gosterilecek kutlamalar
  bekleyenKutlamalar: KutlamaBilgisi[];
  // UI state
  yukleniyor: boolean;
  guncelleniyor: boolean;
  hata: string | null;
  sonYukleme: string | null;
}

const baslangicDurumu: SeriState = {
  seriDurumu: null,
  seviyeDurumu: null,
  kullaniciRozetleri: [],
  rozetDetaylari: [],
  ayarlar: VARSAYILAN_SERI_AYARLARI,
  toplamKilinanNamaz: 0,
  toparlanmaSayisi: 0,
  mukemmelGunSayisi: 0,
  ozelGunAyarlari: LocalSeriServisi.VARSAYILAN_OZEL_GUN_AYARLARI,
  bekleyenKutlamalar: [],
  yukleniyor: false,
  guncelleniyor: false,
  hata: null,
  sonYukleme: null,
};

// ==================== ASYNC THUNKS ====================

/**
 * Tum seri verilerini yukler (local)
 */
export const seriVerileriniYukle = createAsyncThunk(
  'seri/seriVerileriniYukle',
  async () => {
    // Oncelikle local'den yukle
    const localYanit = await LocalSeriServisi.localTumSeriVerileriniGetir();

    if (!localYanit.basarili || !localYanit.veri) {
      throw new Error(localYanit.hata || 'Seri verileri yuklenemedi');
    }

    const veriler = localYanit.veri;

    // Rozet detaylarini olustur
    const rozetDetaylari = rozetDetaylariniAl(veriler.rozetler);

    return {
      ...veriler,
      rozetDetaylari,
    };
  }
);

/**
 * Seri ayarlarini gunceller
 */
export const seriAyarlariniGuncelle = createAsyncThunk(
  'seri/seriAyarlariniGuncelle',
  async ({ ayarlar }: { ayarlar: Partial<SeriAyarlari> }, { getState }) => {
    const state = getState() as { seri: SeriState };
    const yeniAyarlar = { ...state.seri.ayarlar, ...ayarlar };

    await LocalSeriServisi.localSeriAyarlariniKaydet(yeniAyarlar);

    // Bildirimleri planla veya iptal et
    const bildirim = BildirimServisi.getInstance();
    if (yeniAyarlar.gunSonuBildirimAktif) {
      const [saatStr, dakikaStr] = yeniAyarlar.gunBitisSaati.split(':');
      let saat = parseInt(saatStr, 10);
      let dakika = parseInt(dakikaStr, 10);

      // Bildirim dakikasini cikar
      const toplamDakika = saat * 60 + dakika - yeniAyarlar.gunSonuBildirimDk;
      const planlanmisSaat = Math.floor((toplamDakika + 1440) % 1440 / 60);
      const planlanmisDakika = (toplamDakika + 1440) % 1440 % 60;

      await bildirim.bildirimPlanla(
        'gun_sonu_hatirlatici',
        '🚨 Seri Hatırlatıcı',
        'Gün bitmek üzere! Serinizi bozmamak için bugünkü namazlarınızı girmeyi unutmayın.',
        planlanmisSaat,
        planlanmisDakika
      );
    } else {
      await bildirim.bildirimIptalEt('gun_sonu_hatirlatici');
    }

    return yeniAyarlar;
  }
);

/**
 * Gun sonu seri kontrolu ve guncellemesi
 * Namaz durumu degistiginde veya uygulama acildiginda cagirilir
 */
export const seriKontrolet = createAsyncThunk(
  'seri/seriKontrolet',
  async (
    {
      bugunNamazlar,
      dunNamazlar,
    }: {
      bugunNamazlar: GunlukNamazlar | null;
      dunNamazlar: GunlukNamazlar | null;
    },
    { getState }
  ) => {
    const state = getState() as { seri: SeriState };
    const { seriDurumu, kullaniciRozetleri, seviyeDurumu, ayarlar, ozelGunAyarlari } = state.seri;
    let { toplamKilinanNamaz, toparlanmaSayisi, mukemmelGunSayisi } = state.seri;

    // Seri hesapla
    const hesapSonucu = seriHesapla(
      seriDurumu,
      bugunNamazlar,
      dunNamazlar,
      ayarlar,
      ozelGunAyarlari
    );

    // Eger seri degismediyse sadece mevcut durumu dondur
    if (!hesapSonucu.seriDegisti) {
      return {
        seriDurumu: hesapSonucu.seriDurumu,
        kullaniciRozetleri,
        seviyeDurumu: seviyeDurumu || bosSeviyeDurumuOlustur(),
        kutlamalar: [] as KutlamaBilgisi[],
        toplamKilinanNamaz,
        toparlanmaSayisi,
        mukemmelGunSayisi,
      };
    }

    // Toparlanma basarili olduysa sayaciyi artir
    if (hesapSonucu.toparlanmaBasarili) {
      toparlanmaSayisi += 1;
      await LocalSeriServisi.localToparlanmaSayisiniArttir();
    }

    // Bugun 5/5 ise mukemmel gun sayisini artir
    const bugunKilinan = kilinanNamazSayisi(bugunNamazlar);
    if (bugunKilinan === 5) {
      mukemmelGunSayisi += 1;
      await LocalSeriServisi.localMukemmelGunSayisiniArttir();
    }

    // Tam guncellemeyi yap (rozetler, seviye, kutlamalar)
    const guncellemeSonucu = tamGuncellemeyiYap(
      hesapSonucu.seriDurumu,
      kullaniciRozetleri,
      seviyeDurumu || bosSeviyeDurumuOlustur(),
      toplamKilinanNamaz,
      toparlanmaSayisi,
      mukemmelGunSayisi,
      hesapSonucu.kazanilanPuan,
      hesapSonucu.toparlanmaBasarili
    );

    // Local'e kaydet
    await Promise.all([
      LocalSeriServisi.localSeriDurumunuKaydet(hesapSonucu.seriDurumu),
      LocalSeriServisi.localRozetleriKaydet(
        guncellemeSonucu.yeniKullaniciRozetleri
      ),
      LocalSeriServisi.localSeviyeDurumunuKaydet(
        guncellemeSonucu.yeniSeviyeDurumu
      ),
    ]);

    return {
      seriDurumu: hesapSonucu.seriDurumu,
      kullaniciRozetleri: guncellemeSonucu.yeniKullaniciRozetleri,
      seviyeDurumu: guncellemeSonucu.yeniSeviyeDurumu,
      kutlamalar: guncellemeSonucu.kutlamalar,
      toplamKilinanNamaz,
      toparlanmaSayisi,
      mukemmelGunSayisi,
    };
  }
);

/**
 * Namaz kilindiginda toplam sayiyi arttirir
 */
export const namazKilindiPuanla = createAsyncThunk(
  'seri/namazKilindiPuanla',
  async (
    {
      namazSayisi,
    }: { namazSayisi: number },
    { getState }
  ) => {
    const state = getState() as { seri: SeriState };

    // Toplam kilinin namazi artir
    const yeniToplam = state.seri.toplamKilinanNamaz + namazSayisi;
    await LocalSeriServisi.localToplamKilinanNamaziKaydet(yeniToplam);

    // Seviyeye puan ekle
    const puanEkleme = await import('../../domain/services/RozetYoneticisiServisi');
    const seviyeSonucu = puanEkleme.puanEkle(
      state.seri.seviyeDurumu || puanEkleme.bosSeviyeDurumuOlustur(),
      namazSayisi * 5 // Her namaz 5 puan
    );

    await LocalSeriServisi.localSeviyeDurumunuKaydet(seviyeSonucu.yeniDurum);

    return {
      toplamKilinanNamaz: yeniToplam,
      seviyeDurumu: seviyeSonucu.yeniDurum,
      seviyeAtlandi: seviyeSonucu.seviyeAtlandi,
      yeniSeviye: seviyeSonucu.yeniSeviye,
    };
  }
);

/**
 * Ozel gun modunu aktif/pasif yapar
 */
export const ozelGunModuDurumunuGuncelle = createAsyncThunk(
  'seri/ozelGunModuDurumunuGuncelle',
  async ({ aktif }: { aktif: boolean }, { getState }) => {
    const state = getState() as { seri: SeriState };
    const yeniAyarlar: OzelGunAyarlari = {
      ...state.seri.ozelGunAyarlari,
      ozelGunModuAktif: aktif,
    };

    await LocalSeriServisi.localOzelGunAyarlariniKaydet(yeniAyarlar);
    return yeniAyarlar;
  }
);

/**
 * Yeni bir ozel gun baslatir
 */
export const ozelGunBaslat = createAsyncThunk(
  'seri/ozelGunBaslat',
  async (
    {
      baslangicTarihi,
      bitisTarihi,
      aciklama,
    }: {
      baslangicTarihi: string;
      bitisTarihi: string;
      aciklama?: string;
    },
    { getState }
  ) => {
    const state = getState() as { seri: SeriState };

    const yeniKayit: OzelGunKaydi = {
      id: Math.random().toString(36).substring(7),
      baslangicTarihi,
      bitisTarihi,
      aciklama,
      olusturulmaTarihi: new Date().toISOString(),
    };

    const yeniAyarlar: OzelGunAyarlari = {
      ...state.seri.ozelGunAyarlari,
      aktifOzelGun: yeniKayit,
    };

    await LocalSeriServisi.localOzelGunAyarlariniKaydet(yeniAyarlar);
    return yeniAyarlar;
  }
);

/**
 * Aktif ozel gunu sonlandirir (gecmise tasir)
 */
export const ozelGunBitir = createAsyncThunk(
  'seri/ozelGunBitir',
  async (_, { getState }) => {
    const state = getState() as { seri: SeriState };
    const aktifOzelGun = state.seri.ozelGunAyarlari.aktifOzelGun;

    if (!aktifOzelGun) return state.seri.ozelGunAyarlari;

    const yeniAyarlar: OzelGunAyarlari = {
      ...state.seri.ozelGunAyarlari,
      aktifOzelGun: null,
      gecmisKayitlar: [aktifOzelGun, ...state.seri.ozelGunAyarlari.gecmisKayitlar],
    };

    await LocalSeriServisi.localOzelGunAyarlariniKaydet(yeniAyarlar);
    return yeniAyarlar;
  }
);

/**
 * Aktif ozel gunu iptal eder (silme)
 */
export const ozelGunIptal = createAsyncThunk(
  'seri/ozelGunIptal',
  async (_, { getState }) => {
    const state = getState() as { seri: SeriState };
    const aktifOzelGun = state.seri.ozelGunAyarlari.aktifOzelGun;

    if (!aktifOzelGun) return state.seri.ozelGunAyarlari;

    const yeniAyarlar: OzelGunAyarlari = {
      ...state.seri.ozelGunAyarlari,
      aktifOzelGun: null,
    };

    await LocalSeriServisi.localOzelGunAyarlariniKaydet(yeniAyarlar);
    return yeniAyarlar;
  }
);

// ==================== SLICE ====================

const seriSlice = createSlice({
  name: 'seri',
  initialState: baslangicDurumu,
  reducers: {
    /**
     * Kutlamayi gosterildi olarak isaretler (kuyruktan cikarir)
     */
    kutlamayiKaldir: (state) => {
      state.bekleyenKutlamalar = state.bekleyenKutlamalar.slice(1);
    },

    /**
     * Tum kutlamalari temizler
     */
    kutlamalariTemizle: (state) => {
      state.bekleyenKutlamalar = [];
    },

    /**
     * Hatayi temizler
     */
    hataTemizle: (state) => {
      state.hata = null;
    },

    /**
     * State'i sifirlar
     */
    seriStateSifirla: (state) => {
      return { ...baslangicDurumu, ayarlar: state.ayarlar };
    },
  },
  extraReducers: (builder) => {
    // Seri verilerini yukle
    builder
      .addCase(seriVerileriniYukle.pending, (state) => {
        state.yukleniyor = true;
        state.hata = null;
      })
      .addCase(seriVerileriniYukle.fulfilled, (state, action) => {
        state.yukleniyor = false;
        state.seriDurumu = action.payload.seriDurumu;
        state.seviyeDurumu = action.payload.seviyeDurumu;
        state.kullaniciRozetleri = action.payload.rozetler;
        state.rozetDetaylari = action.payload.rozetDetaylari;
        state.ayarlar = { ...VARSAYILAN_SERI_AYARLARI, ...action.payload.ayarlar };
        state.ozelGunAyarlari = action.payload.ozelGunAyarlari;
        state.toplamKilinanNamaz = action.payload.toplamKilinanNamaz;
        state.toparlanmaSayisi = action.payload.toparlanmaSayisi;
        state.mukemmelGunSayisi = action.payload.mukemmelGunSayisi;
        state.sonYukleme = new Date().toISOString();
      })
      .addCase(seriVerileriniYukle.rejected, (state, action) => {
        state.yukleniyor = false;
        state.hata = action.error.message || 'Seri verileri yuklenemedi';
      });

    // Seri ayarlarini guncelle
    builder
      .addCase(seriAyarlariniGuncelle.fulfilled, (state, action) => {
        state.ayarlar = action.payload;
      });

    // Seri kontrolet
    builder
      .addCase(seriKontrolet.pending, (state) => {
        state.guncelleniyor = true;
      })
      .addCase(seriKontrolet.fulfilled, (state, action) => {
        state.guncelleniyor = false;
        state.seriDurumu = action.payload.seriDurumu;
        state.kullaniciRozetleri = action.payload.kullaniciRozetleri;
        state.seviyeDurumu = action.payload.seviyeDurumu;
        state.toplamKilinanNamaz = action.payload.toplamKilinanNamaz;
        state.toparlanmaSayisi = action.payload.toparlanmaSayisi;
        state.mukemmelGunSayisi = action.payload.mukemmelGunSayisi;
        // Rozet detaylarini guncelle
        state.rozetDetaylari = rozetDetaylariniAl(
          action.payload.kullaniciRozetleri
        );
        // Kutlamalari kuyruga ekle
        if (action.payload.kutlamalar.length > 0) {
          state.bekleyenKutlamalar = [
            ...state.bekleyenKutlamalar,
            ...action.payload.kutlamalar,
          ];
        }
      })
      .addCase(seriKontrolet.rejected, (state, action) => {
        state.guncelleniyor = false;
        state.hata = action.error.message || 'Seri guncellenemedi';
      })
      // Namaz kilindi puanla
      .addCase(namazKilindiPuanla.fulfilled, (state, action) => {
        state.toplamKilinanNamaz = action.payload.toplamKilinanNamaz;
        state.seviyeDurumu = action.payload.seviyeDurumu;

        // Seviye atlandiysa kutlama ekle
        if (action.payload.seviyeAtlandi && action.payload.yeniSeviye) {
          const { seviyeKutlamasiOlustur } = require('../../domain/services/RozetYoneticisiServisi');
          state.bekleyenKutlamalar.push(
            seviyeKutlamasiOlustur(action.payload.yeniSeviye)
          );
        }
      })
      // Ozel gun thunk'lari
      .addCase(ozelGunModuDurumunuGuncelle.fulfilled, (state, action) => {
        state.ozelGunAyarlari = action.payload;
      })
      .addCase(ozelGunBaslat.fulfilled, (state, action) => {
        state.ozelGunAyarlari = action.payload;
      })
      .addCase(ozelGunBitir.fulfilled, (state, action) => {
        state.ozelGunAyarlari = action.payload;
      })
      .addCase(ozelGunIptal.fulfilled, (state, action) => {
        state.ozelGunAyarlari = action.payload;
      });
  },
});

export const {
  kutlamayiKaldir,
  kutlamalariTemizle,
  hataTemizle,
  seriStateSifirla,
} = seriSlice.actions;

export default seriSlice.reducer;

// ==================== SELECTOR'LAR ====================

import { createSelector } from '@reduxjs/toolkit';

export const seriOzetiSelector = createSelector(
  [(state: { seri: SeriState }) => state.seri.seriDurumu, (state: { seri: SeriState }) => state.seri.ayarlar],
  (seriDurumu, ayarlar) => {
    return seriOzetiniOlustur(seriDurumu, ayarlar);
  }
);

export const ilkKutlamaSelector = (state: { seri: SeriState }) => {
  return state.seri.bekleyenKutlamalar[0] || null;
};

export const kazanilanRozetSayisiSelector = (state: { seri: SeriState }) => {
  return state.seri.kullaniciRozetleri.filter((r) => r.kazanildiMi).length;
};
