/**
 * Kaza Defteri state yönetimi
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { KazaDurumu, KazaNamazAdi, HesaplamaSihirbazGirdisi } from '../../core/types/KazaTipleri';
import * as LocalKazaServisi from '../../data/local/LocalKazaServisi';
import {
  hesaplaTahminiBorcMiktari,
  borcuVakitlerePaylaştır,
  kazaIstatistikHesapla,
} from '../../domain/services/KazaHesaplayiciServisi';
import { KazaIstatistik } from '../../core/types/KazaTipleri';

// ==================== STATE TİPİ ====================

interface KazaState {
  kazaDurumu: KazaDurumu | null;
  istatistik: KazaIstatistik | null;
  tempoGecmis: Record<string, number>;
  yukleniyor: boolean;
  hata: string | null;
}

const baslangicDurumu: KazaState = {
  kazaDurumu: null,
  istatistik: null,
  tempoGecmis: {},
  yukleniyor: false,
  hata: null,
};

// ==================== YARDIMCI FONKSİYONLAR ====================

/**
 * KazaDurumu içindeki toplamları yeniden hesaplar
 */
const toplamlarıYenile = (durumu: KazaDurumu): KazaDurumu => {
  const toplamKalan = durumu.namazlar.reduce((sum, n) => sum + n.kalanBorc, 0);
  const toplamTamamlanan = durumu.namazlar.reduce((sum, n) => sum + n.tamamlanan, 0);
  return { ...durumu, toplamKalan, toplamTamamlanan };
};

/**
 * Günlük sayacı kontrol eder ve gerekirse sıfırlar
 */
const gunlukSayaciKontrolEt = (durumu: KazaDurumu): KazaDurumu => {
  const bugun = new Date().toISOString().split('T')[0];
  if (durumu.gunlukHedefTarihi !== bugun) {
    return {
      ...durumu,
      gunlukTamamlanan: 0,
      gunlukHedefTarihi: bugun,
    };
  }
  return durumu;
};

// ==================== ASYNC THUNKS ====================

/**
 * Kaza verilerini yükler (başlangıçta çağrılır)
 */
export const kazaVerileriniYukle = createAsyncThunk('kaza/yukle', async () => {
  const [kazaYanit, tempoYanit] = await Promise.all([
    LocalKazaServisi.localKazaDurumunuGetir(),
    LocalKazaServisi.localKazaTempoGecmisiniGetir(),
  ]);

  const tempoGecmis = tempoYanit.veri || {};
  let kazaDurumu = kazaYanit.veri || LocalKazaServisi.bosKazaDurumuOlustur();

  // Günlük sayacı kontrol et
  kazaDurumu = gunlukSayaciKontrolEt(kazaDurumu);

  const istatistik = kazaIstatistikHesapla(kazaDurumu.toplamKalan, tempoGecmis);

  return { kazaDurumu, tempoGecmis, istatistik };
});

/**
 * Belirli bir namaz türüne borç ekler
 */
export const borcEkle = createAsyncThunk(
  'kaza/borcEkle',
  async (
    { namazAdi, sayi }: { namazAdi: KazaNamazAdi; sayi: number },
    { getState }
  ) => {
    const state = getState() as { kaza: KazaState };
    let durumu = state.kaza.kazaDurumu || LocalKazaServisi.bosKazaDurumuOlustur();

    const yeniNamazlar = durumu.namazlar.map((n) => {
      if (n.namazAdi === namazAdi) {
        return {
          ...n,
          toplamBorc: n.toplamBorc + sayi,
          kalanBorc: n.kalanBorc + sayi,
        };
      }
      return n;
    });

    durumu = toplamlarıYenile({
      ...durumu,
      namazlar: yeniNamazlar,
      guncellemeTarihi: new Date().toISOString(),
    });

    await LocalKazaServisi.localKazaDurumunuKaydet(durumu);

    const istatistik = kazaIstatistikHesapla(
      durumu.toplamKalan,
      state.kaza.tempoGecmis
    );

    return { kazaDurumu: durumu, istatistik };
  }
);

/**
 * Kaza tamamlar (tek ya da toplu)
 * namazAdi null ise genel tamamlama (en yüksek kalan vakitten düşer)
 */
export const kazaTamamla = createAsyncThunk(
  'kaza/tamamla',
  async (
    { namazAdi, sayi }: { namazAdi: KazaNamazAdi | null; sayi: number },
    { getState }
  ) => {
    const state = getState() as { kaza: KazaState };
    let durumu = state.kaza.kazaDurumu || LocalKazaServisi.bosKazaDurumuOlustur();

    let yeniNamazlar = [...durumu.namazlar];

    if (namazAdi) {
      // Belirli bir namaz türünden düş
      yeniNamazlar = yeniNamazlar.map((n) => {
        if (n.namazAdi === namazAdi) {
          const yeniKalan = Math.max(0, n.kalanBorc - sayi);
          const düşülen = n.kalanBorc - yeniKalan;
          return {
            ...n,
            kalanBorc: yeniKalan,
            tamamlanan: n.tamamlanan + düşülen,
          };
        }
        return n;
      });
    } else {
      // Genel tamamlama: En yüksek kalan vakitten düş
      let kalanDüşülecek = sayi;
      yeniNamazlar = yeniNamazlar
        .slice()
        .sort((a, b) => b.kalanBorc - a.kalanBorc)
        .map((n) => {
          if (kalanDüşülecek <= 0 || n.kalanBorc <= 0) return n;
          const düşülen = Math.min(n.kalanBorc, kalanDüşülecek);
          kalanDüşülecek -= düşülen;
          return {
            ...n,
            kalanBorc: n.kalanBorc - düşülen,
            tamamlanan: n.tamamlanan + düşülen,
          };
        });
      // Orijinal sırayı koru
      yeniNamazlar = durumu.namazlar.map(
        (orig) => yeniNamazlar.find((n) => n.namazAdi === orig.namazAdi) || orig
      );
    }

    const yeniGunlukTamamlanan = durumu.gunlukTamamlanan + sayi;

    durumu = toplamlarıYenile({
      ...durumu,
      namazlar: yeniNamazlar,
      gunlukTamamlanan: yeniGunlukTamamlanan,
      guncellemeTarihi: new Date().toISOString(),
    });

    // Tempo geçmişini güncelle
    const bugun = new Date().toISOString().split('T')[0];
    const yeniTempoGecmis = {
      ...state.kaza.tempoGecmis,
      [bugun]: yeniGunlukTamamlanan,
    };
    await LocalKazaServisi.localKazaTempoGuncelleGecmis(bugun, yeniGunlukTamamlanan);
    await LocalKazaServisi.localKazaDurumunuKaydet(durumu);

    const istatistik = kazaIstatistikHesapla(durumu.toplamKalan, yeniTempoGecmis);

    return { kazaDurumu: durumu, tempoGecmis: yeniTempoGecmis, istatistik };
  }
);

/**
 * Hesaplama sihirbazıyla borçları doldurur
 */
export const sihirbazIleBaslat = createAsyncThunk(
  'kaza/sihirbazIleBaslat',
  async (girdi: HesaplamaSihirbazGirdisi, { getState }) => {
    const state = getState() as { kaza: KazaState };
    let durumu = state.kaza.kazaDurumu || LocalKazaServisi.bosKazaDurumuOlustur();

    const toplamBorc = hesaplaTahminiBorcMiktari(girdi);
    const dagılım = borcuVakitlerePaylaştır(toplamBorc);

    const yeniNamazlar = durumu.namazlar.map((n) => ({
      ...n,
      toplamBorc: dagılım[n.namazAdi] || 0,
      kalanBorc: dagılım[n.namazAdi] || 0,
    }));

    durumu = toplamlarıYenile({
      ...durumu,
      namazlar: yeniNamazlar,
      guncellemeTarihi: new Date().toISOString(),
    });

    await LocalKazaServisi.localKazaDurumunuKaydet(durumu);

    const istatistik = kazaIstatistikHesapla(
      durumu.toplamKalan,
      state.kaza.tempoGecmis
    );

    return { kazaDurumu: durumu, istatistik };
  }
);

/**
 * Günlük hedefi günceller
 */
export const gunlukHedefiGuncelle = createAsyncThunk(
  'kaza/gunlukHedefiGuncelle',
  async ({ hedef }: { hedef: number }, { getState }) => {
    const state = getState() as { kaza: KazaState };
    const durumu = {
      ...(state.kaza.kazaDurumu || LocalKazaServisi.bosKazaDurumuOlustur()),
      gunlukHedef: Math.max(0, hedef),
      guncellemeTarihi: new Date().toISOString(),
    };

    await LocalKazaServisi.localKazaDurumunuKaydet(durumu);
    return durumu;
  }
);

/**
 * Gizlilik toggle'ını değiştirir
 */
export const gizlemeToggle = createAsyncThunk(
  'kaza/gizlemeToggle',
  async (_, { getState }) => {
    const state = getState() as { kaza: KazaState };
    const durumu = {
      ...(state.kaza.kazaDurumu || LocalKazaServisi.bosKazaDurumuOlustur()),
      toplamGizleMi: !state.kaza.kazaDurumu?.toplamGizleMi,
      guncellemeTarihi: new Date().toISOString(),
    };

    await LocalKazaServisi.localKazaDurumunuKaydet(durumu);
    return durumu;
  }
);

// ==================== SLICE ====================

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
        state.kazaDurumu = action.payload.kazaDurumu;
        state.tempoGecmis = action.payload.tempoGecmis;
        state.istatistik = action.payload.istatistik;
      })
      .addCase(kazaVerileriniYukle.rejected, (state, action) => {
        state.yukleniyor = false;
        state.hata = action.error.message || 'Kaza verileri yüklenemedi';
      })

      .addCase(borcEkle.fulfilled, (state, action) => {
        state.kazaDurumu = action.payload.kazaDurumu;
        state.istatistik = action.payload.istatistik;
      })

      .addCase(kazaTamamla.fulfilled, (state, action) => {
        state.kazaDurumu = action.payload.kazaDurumu;
        state.tempoGecmis = action.payload.tempoGecmis;
        state.istatistik = action.payload.istatistik;
      })

      .addCase(sihirbazIleBaslat.fulfilled, (state, action) => {
        state.kazaDurumu = action.payload.kazaDurumu;
        state.istatistik = action.payload.istatistik;
      })

      .addCase(gunlukHedefiGuncelle.fulfilled, (state, action) => {
        state.kazaDurumu = action.payload;
      })

      .addCase(gizlemeToggle.fulfilled, (state, action) => {
        state.kazaDurumu = action.payload;
      });
  },
});

export const { hataTemizle } = kazaSlice.actions;
export default kazaSlice.reducer;
