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
  PUAN_DEGERLERI,
} from '../../core/types/SeriTipleri';
import { GunlukNamazlar } from '../../core/types';
import * as LocalSeriServisi from '../../data/local/LocalSeriServisi';
import { localVerileriSenkronizasyonIcinAl } from '../../data/local/LocalNamazServisi';
import { puanlamayiYenidenDegerlendir } from '../../domain/services/PuanlamaServisi';
import { BildirimServisi } from '../../domain/services/BildirimServisi';
import { KonumYoneticiServisi } from '../../domain/services/KonumYoneticiServisi';
import {
  seriHesapla,
  seriOzetiniOlustur,
} from '../../domain/services/SeriHesaplayiciServisi';
import {
  rozetDetaylariniAl,
  tamGuncellemeyiYap,
  bosSeviyeDurumuOlustur,
  puanEkle,
  seviyeHesapla,
  seviyeKutlamasiOlustur,
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
  // Karma turev/defter modeli: tabanPuan kayittan turev, bonusPuan kalici.
  // toplamPuan (= seviyeDurumu.toplamPuan) = tabanPuan + bonusPuan.
  tabanPuan: number;
  bonusPuan: number;
  // Bu yuklemede bonusPuan migrasyonu yapildi mi? Ilk senkronu yalniz migrasyonda SESSIZ
  // tutmak icin (de-inflasyon yanlis "seviye atladin" kutlamasi tetiklemesin; migrasyon yoksa
  // arka planda kazanilan seviye atlamasi yutulmasin).
  migreEdildi: boolean;
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
  tabanPuan: 0,
  bonusPuan: 0,
  migreEdildi: false,
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

    // bonusPuan'i tek dogru kaynaktan (disk) yukle. null ise MIGRATE et (ilk calisma):
    // eski toplamPuan - eski taban (sisme cikarimda sadelesir, mesru bonus korunur).
    // Migrasyon BURADA (yuklemede) yapilir ki seriKontrolet/reconcile'dan ONCE kesinlessin;
    // boylece "bayat-0 uzerine yazma" yarisi ve migrasyon-atlama kaynakli VERI KAYBI olusmaz.
    const bonusHam = (await LocalSeriServisi.localBonusPuaniGetir()).veri;
    let bonusPuan: number;
    let migreEdildi = false;
    if (bonusHam === null || bonusHam === undefined) {
      const eskiToplamPuan = veriler.seviyeDurumu?.toplamPuan ?? 0;
      const eskiTaban = veriler.toplamKilinanNamaz * PUAN_DEGERLERI.namaz_kilindi;
      bonusPuan = Math.max(0, eskiToplamPuan - eskiTaban);
      await LocalSeriServisi.localBonusPuaniKaydet(bonusPuan);
      migreEdildi = true;
    } else {
      bonusPuan = bonusHam;
    }

    return {
      ...veriler,
      rozetDetaylari,
      bonusPuan,
      migreEdildi,
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
      let planlanmisSaat: number;
      let planlanmisDakika: number;

      if (yeniAyarlar.gunSonuBildirimModu === 'sabit') {
        // SABIT MOD: Kullanicinin sectigi sabit saat ve dakika
        planlanmisSaat = yeniAyarlar.bildirimSaati;
        planlanmisDakika = yeniAyarlar.bildirimDakikasi;
      } else {
        // OTOMATIK MOD: Imsak vaktinden X dakika once
        const konumServisi = KonumYoneticiServisi.getInstance();
        const imsakVakti = konumServisi.sonrakiGunImsakVaktiGetir();

        if (imsakVakti) {
          const imsakDakikaTarih = new Date(imsakVakti);
          imsakDakikaTarih.setMinutes(imsakDakikaTarih.getMinutes() - yeniAyarlar.bildirimImsakOncesiDk);

          planlanmisSaat = imsakDakikaTarih.getHours();
          planlanmisDakika = imsakDakikaTarih.getMinutes();
        } else {
          // Konum yoksa varsayilan (Eski davranis: 05:00 - 60dk = 04:00)
          planlanmisSaat = 4;
          planlanmisDakika = 0;
        }
      }

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
    const { seriDurumu, kullaniciRozetleri, seviyeDurumu, ayarlar, ozelGunAyarlari, toplamKilinanNamaz, mukemmelGunSayisi } = state.seri;
    let toparlanmaSayisi = state.seri.toparlanmaSayisi;
    let bonusPuan = state.seri.bonusPuan;

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
        kutlamalar: [] as KutlamaBilgisi[],
        toparlanmaSayisi,
        bonusPuan,
      };
    }

    // Toparlanma basarili olduysa sayaciyi artir
    if (hesapSonucu.toparlanmaBasarili) {
      toparlanmaSayisi += 1;
      await LocalSeriServisi.localToparlanmaSayisiniArttir();
    }

    // NOT: mukemmel gun artik kayittan TUREVdir (puanlamayiYenidenHesapla); burada artirilmaz.
    // tamGuncellemeyiYap'a gecilen seviyeDurumu invariant'i (= tabanPuan + bonusPuan) korur;
    // donen toplamKazanilanPuan bonusPuan'a eklenir, seviye buna gore guncellenir.
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

    bonusPuan += guncellemeSonucu.toplamKazanilanPuan;

    // TEK-YAZICI: seriKontrolet seviyeDurumu/seviye-kutlamasi URETMEZ; bunun tek sahibi
    // puanlamayiYenidenHesapla (reconcile). Burada yalniz seri/rozet/toparlanma + bonusPuan
    // yazilir. Seviye atlama kutlamasi reconcile'a birakilir (cift kutlama/yaris olmasin).
    const kutlamalar = guncellemeSonucu.kutlamalar.filter(
      (k) => k.tip !== 'seviye_atlandi'
    );

    // Local'e kaydet (seviyeDurumu HARIC — onu reconcile yazar)
    await Promise.all([
      LocalSeriServisi.localSeriDurumunuKaydet(hesapSonucu.seriDurumu),
      LocalSeriServisi.localRozetleriKaydet(
        guncellemeSonucu.yeniKullaniciRozetleri
      ),
      LocalSeriServisi.localBonusPuaniKaydet(bonusPuan),
    ]);

    return {
      seriDurumu: hesapSonucu.seriDurumu,
      kullaniciRozetleri: guncellemeSonucu.yeniKullaniciRozetleri,
      kutlamalar,
      toparlanmaSayisi,
      bonusPuan,
    };
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { seri: SeriState };
      // Yuklenmeden VEYA baska bir seriKontrolet in-flight iken atla: eszamanli oku-degistir-yaz
      // (cift toparlanma artisi) ve cift seviye kutlamasi yarisini onler.
      return !!state.seri.sonYukleme && !state.seri.guncelleniyor;
    },
  }
);

// NOT: namazKilindiPuanla KALDIRILDI. Olay-tetiklemeli +5/+1 artisi toggle ile sismeye
// yol aciyordu (ve arka plan/un-toggle ile tutarsizlasiyordu). Yerine puanlamayiYenidenHesapla
// (kayittan turev) gecti; taban puan/sayac tek dogru kaynaktan hesaplanir.

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

/**
 * Puanlamayi tek dogru kaynaktan (namaz kayitlari) yeniden hesaplar (reconcile).
 * tabanPuan / toplamKilinanNamaz / mukemmelGun TURETILIR; bonusPuan kalici korunur.
 * Ilk calismada bonusPuan migrate edilir: eski toplamPuan - eski taban (sisme cikarimda
 * sadelesir, mesru bonuslar korunur). sessiz=true ise kutlama uretmez (acilis/migrasyon),
 * sessiz=false ise yalniz gercek seviye atlamada kutlar.
 */
export const puanlamayiYenidenHesapla = createAsyncThunk(
  'seri/puanlamayiYenidenHesapla',
  async (arg: { sessiz?: boolean } | undefined, { getState }) => {
    const state = (getState() as { seri: SeriState }).seri;
    const sessiz = arg?.sessiz ?? true;

    // Tek dogru kaynak: tum namaz kayitlari
    const kayitlar = await localVerileriSenkronizasyonIcinAl();
    const turev = puanlamayiYenidenDegerlendir(kayitlar, state.ayarlar.tamGunEsigi);

    // bonusPuan tek dogru kaynaktan = state (yuklemede disk'ten migrate edilerek set edildi,
    // seriKontrolet gunceller). Reconcile bonusPuan'a DOKUNMAZ; yalniz seviyeyi turetir
    // (tek-yazici). Migrasyon seriVerileriniYukle'ye tasindi -> burada yari/atlama riski yok.
    const bonusPuan = state.bonusPuan;

    const toplamPuan = turev.tabanPuan + bonusPuan;
    const eskiSeviye = state.seviyeDurumu?.mevcutSeviye ?? 1;
    const seviyeDurumu = puanEkle(bosSeviyeDurumuOlustur(), toplamPuan).yeniDurum;
    const seviyeAtlandi = !sessiz && seviyeDurumu.mevcutSeviye > eskiSeviye;

    await Promise.all([
      LocalSeriServisi.localToplamKilinanNamaziKaydet(turev.toplamKilinanNamaz),
      LocalSeriServisi.localMukemmelGunSayisiniKaydet(turev.mukemmelGunSayisi),
      LocalSeriServisi.localSeviyeDurumunuKaydet(seviyeDurumu),
    ]);

    return {
      toplamKilinanNamaz: turev.toplamKilinanNamaz,
      mukemmelGunSayisi: turev.mukemmelGunSayisi,
      tabanPuan: turev.tabanPuan,
      bonusPuan,
      seviyeDurumu,
      seviyeAtlandi,
      yeniSeviye: seviyeAtlandi ? seviyeHesapla(toplamPuan) : null,
    };
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { seri: SeriState };
      // Seri verileri yuklenmeden calistirma (race condition korumasi)
      return !!state.seri.sonYukleme;
    },
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
        // bonusPuan tek dogru kaynaktan (disk/migrasyon) yuklendi; tabanPuan invariant'i koru
        // (reconcile birazdan kayittan kesin degeri turetecek).
        state.bonusPuan = action.payload.bonusPuan;
        state.tabanPuan = Math.max(0, (action.payload.seviyeDurumu?.toplamPuan ?? 0) - action.payload.bonusPuan);
        state.migreEdildi = action.payload.migreEdildi;
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
        // seviyeDurumu TEK-YAZICI: yalniz reconcile yazar; seriKontrolet dokunmaz (yaris/cift-yazici yok)
        state.toparlanmaSayisi = action.payload.toparlanmaSayisi;
        state.bonusPuan = action.payload.bonusPuan;
        // toplamKilinanNamaz / mukemmelGunSayisi artik turev (puanlamayiYenidenHesapla) — burada yazilmaz
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
      // Puanlama reconcile (turev) — toplamKilinan/mukemmelGun/taban kayittan, bonus korunur
      .addCase(puanlamayiYenidenHesapla.fulfilled, (state, action) => {
        state.toplamKilinanNamaz = action.payload.toplamKilinanNamaz;
        state.mukemmelGunSayisi = action.payload.mukemmelGunSayisi;
        state.tabanPuan = action.payload.tabanPuan;
        state.bonusPuan = action.payload.bonusPuan;
        state.seviyeDurumu = action.payload.seviyeDurumu;
        if (action.payload.seviyeAtlandi && action.payload.yeniSeviye) {
          const yeniSeviyeNo = action.payload.yeniSeviye.seviye;
          // Ayni seviye icin kuyrukta zaten kutlama varsa tekrar ekleme (eszamanli reconcile cift kutlamasi)
          const zatenVar = state.bekleyenKutlamalar.some(
            (k) =>
              k.tip === 'seviye_atlandi' &&
              (k.ekstraVeri as { seviye?: { seviye?: number } })?.seviye?.seviye === yeniSeviyeNo
          );
          if (!zatenVar) {
            state.bekleyenKutlamalar.push(
              seviyeKutlamasiOlustur(action.payload.yeniSeviye)
            );
          }
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
