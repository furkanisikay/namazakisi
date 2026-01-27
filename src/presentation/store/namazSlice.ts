/**
 * Namaz state yonetimi
 * Sadece Local veri kaynaklarini yonetir (Offline-only)
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  GunlukNamazlar,
  HaftalikIstatistik,
  AylikIstatistik,
  GunlukIstatistik,
} from '../../core/types';
import { NamazAdi, NAMAZ_ISIMLERI } from '../../core/constants/UygulamaSabitleri';
import * as LocalNamazServisi from '../../data/local/LocalNamazServisi';
import {
  bugunuAl,
  gunEkle,
  gunAdiniAl,
  haftaninBaslangiciniAl,
  ayinIlkGunuAl,
  ayinSonGunuAl,
  ayAdiniAl,
  tarihAraliginiAl,
} from '../../core/utils/TarihYardimcisi';

interface NamazState {
  mevcutTarih: string;
  gunlukNamazlar: GunlukNamazlar | null;
  haftalikIstatistik: HaftalikIstatistik | null;
  aylikIstatistik: AylikIstatistik | null;
  yukleniyor: boolean;
  guncelleniyor: boolean;
  hata: string | null;
}

const baslangicDurumu: NamazState = {
  mevcutTarih: bugunuAl(),
  gunlukNamazlar: null,
  haftalikIstatistik: null,
  aylikIstatistik: null,
  yukleniyor: false,
  guncelleniyor: false,
  hata: null,
};

/**
 * Istatistik hesaplama yardimci fonksiyonu
 */
const istatistikHesapla = (namazlar: GunlukNamazlar): { toplam: number; tamamlanan: number; yuzde: number } => {
  const toplam = namazlar.namazlar.length;
  const tamamlanan = namazlar.namazlar.filter(n => n.tamamlandi).length;
  const yuzde = toplam > 0 ? Math.round((tamamlanan / toplam) * 100) : 0;
  return { toplam, tamamlanan, yuzde };
};

/**
 * Belirli bir tarihe ait namazlari yukler
 */
export const namazlariYukle = createAsyncThunk(
  'namaz/namazlariYukle',
  async ({ tarih }: { tarih: string }) => {
    const yanit = await LocalNamazServisi.localNamazlariGetir(tarih);
    if (!yanit.basarili || !yanit.veri) {
      throw new Error(yanit.hata || 'Namazlar yuklenemedi');
    }
    return yanit.veri;
  }
);

/**
 * Namaz durumunu degistirir
 */
export const namazDurumunuDegistir = createAsyncThunk(
  'namaz/namazDurumunuDegistir',
  async (
    { tarih, namazAdi, tamamlandi }:
      { tarih: string; namazAdi: NamazAdi; tamamlandi: boolean }
  ) => {
    await LocalNamazServisi.localNamazDurumunuGuncelle(tarih, namazAdi, tamamlandi);
    return { tarih, namazAdi, tamamlandi };
  }
);

/**
 * Tum namazlari tamamlandi olarak isaretler
 */
export const tumNamazlariTamamla = createAsyncThunk(
  'namaz/tumNamazlariTamamla',
  async ({ tarih }: { tarih: string }) => {
    await LocalNamazServisi.localTumNamazlariGuncelle(tarih, true);
    return tarih;
  }
);

/**
 * Tum namazlari tamamlanmadi olarak isaretler
 */
export const tumNamazlariSifirla = createAsyncThunk(
  'namaz/tumNamazlariSifirla',
  async ({ tarih }: { tarih: string }) => {
    await LocalNamazServisi.localTumNamazlariGuncelle(tarih, false);
    return tarih;
  }
);

/**
 * Haftalik istatistikleri yukler
 */
export const haftalikIstatistikleriYukle = createAsyncThunk(
  'namaz/haftalikIstatistikleriYukle',
  async () => {
    const bugun = bugunuAl();
    const haftaninBaslangici = haftaninBaslangiciniAl(bugun);
    const haftaninBitisi = gunEkle(haftaninBaslangici, 6);

    const yanit = await LocalNamazServisi.localTarihAraligindakiNamazlariGetir(
      haftaninBaslangici,
      haftaninBitisi
    );
    const gunlukVeriler = yanit.veri || [];

    // Eksik gunleri tamamla
    const tumTarihler = tarihAraliginiAl(haftaninBaslangici, haftaninBitisi);
    const mevcutTarihler = new Set(gunlukVeriler.map(g => g.tarih));

    tumTarihler.forEach(tarih => {
      if (!mevcutTarihler.has(tarih)) {
        gunlukVeriler.push({
          tarih,
          namazlar: NAMAZ_ISIMLERI.map(namazAdi => ({
            namazAdi,
            tamamlandi: false,
            tarih,
          })),
        });
      }
    });

    // Tarihe gore sirala
    gunlukVeriler.sort((a, b) => a.tarih.localeCompare(b.tarih));

    // Istatistikleri hesapla
    const gunlukIstatistikler: GunlukIstatistik[] = gunlukVeriler.map(gun => {
      const stats = istatistikHesapla(gun);
      return {
        tarih: gun.tarih,
        gunAdi: gunAdiniAl(gun.tarih).substring(0, 3),
        toplamNamaz: stats.toplam,
        tamamlananNamaz: stats.tamamlanan,
        tamamlanmaYuzdesi: stats.yuzde,
      };
    });

    const toplamNamaz = gunlukIstatistikler.reduce((acc, g) => acc + g.toplamNamaz, 0);
    const tamamlananNamaz = gunlukIstatistikler.reduce((acc, g) => acc + g.tamamlananNamaz, 0);
    const enIyiGun = gunlukIstatistikler.reduce((max, g) =>
      g.tamamlanmaYuzdesi > (max?.tamamlanmaYuzdesi || 0) ? g : max,
      gunlukIstatistikler[0] || null
    );

    const haftalikIstatistik: HaftalikIstatistik = {
      baslangicTarihi: haftaninBaslangici,
      bitisTarihi: haftaninBitisi,
      toplamNamaz,
      tamamlananNamaz,
      tamamlanmaYuzdesi: toplamNamaz > 0 ? Math.round((tamamlananNamaz / toplamNamaz) * 100) : 0,
      gunlukVeriler: gunlukIstatistikler,
      enIyiGun,
    };

    return haftalikIstatistik;
  }
);

/**
 * Aylik istatistikleri yukler
 */
export const aylikIstatistikleriYukle = createAsyncThunk(
  'namaz/aylikIstatistikleriYukle',
  async () => {
    const bugun = bugunuAl();
    const ayinBaslangici = ayinIlkGunuAl(bugun);
    const ayinBitisi = ayinSonGunuAl(bugun);
    const tarihObj = new Date(bugun);

    const yanit = await LocalNamazServisi.localTarihAraligindakiNamazlariGetir(
      ayinBaslangici,
      ayinBitisi
    );
    const gunlukVeriler = yanit.veri || [];

    // Namaz bazinda sayilari hesapla
    const namazSayilari: Record<string, { tamamlanan: number; toplam: number }> = {};
    NAMAZ_ISIMLERI.forEach(namazAdi => {
      namazSayilari[namazAdi] = { tamamlanan: 0, toplam: 0 };
    });

    let toplamNamaz = 0;
    let tamamlananNamaz = 0;
    const aktifGunler = new Set<string>();

    gunlukVeriler.forEach(gun => {
      gun.namazlar.forEach(namaz => {
        toplamNamaz++;
        namazSayilari[namaz.namazAdi].toplam++;

        if (namaz.tamamlandi) {
          tamamlananNamaz++;
          namazSayilari[namaz.namazAdi].tamamlanan++;
          aktifGunler.add(gun.tarih);
        }
      });
    });

    const namazBazindaYuzdeler: Record<NamazAdi, number> = {} as Record<NamazAdi, number>;
    NAMAZ_ISIMLERI.forEach(namazAdi => {
      const { tamamlanan, toplam } = namazSayilari[namazAdi];
      namazBazindaYuzdeler[namazAdi] = toplam > 0 ? Math.round((tamamlanan / toplam) * 100) : 0;
    });

    const aylikIstatistik: AylikIstatistik = {
      ay: tarihObj.getMonth(),
      yil: tarihObj.getFullYear(),
      ayAdi: ayAdiniAl(tarihObj.getMonth()),
      toplamNamaz,
      tamamlananNamaz,
      tamamlanmaYuzdesi: toplamNamaz > 0 ? Math.round((tamamlananNamaz / toplamNamaz) * 100) : 0,
      aktifGunSayisi: aktifGunler.size,
      namazBazindaYuzdeler,
    };

    return aylikIstatistik;
  }
);

const namazSlice = createSlice({
  name: 'namaz',
  initialState: baslangicDurumu,
  reducers: {
    tarihiDegistir: (state, action: PayloadAction<string>) => {
      state.mevcutTarih = action.payload;
    },
    hataTemizle: (state) => {
      state.hata = null;
    },
  },
  extraReducers: (builder) => {
    // Namazlari yukle
    builder
      .addCase(namazlariYukle.pending, (state) => {
        state.yukleniyor = true;
        state.hata = null;
      })
      .addCase(namazlariYukle.fulfilled, (state, action) => {
        state.yukleniyor = false;
        state.gunlukNamazlar = action.payload;
        // Not: mevcutTarih artik burada guncellenmeyecek.
        // Tarih degisikligi sadece tarihiDegistir action'i ile yonetilir.
        // Bu degisiklik Issue #13'u (DateTimePicker tarih secme problemi) cozer.
      })
      .addCase(namazlariYukle.rejected, (state, action) => {
        state.yukleniyor = false;
        state.hata = action.error.message || 'Namazlar yuklenemedi';
      });

    // Namaz durumu degistir
    builder
      .addCase(namazDurumunuDegistir.pending, (state) => {
        state.guncelleniyor = true;
      })
      .addCase(namazDurumunuDegistir.fulfilled, (state, action) => {
        state.guncelleniyor = false;
        if (state.gunlukNamazlar && state.gunlukNamazlar.tarih === action.payload.tarih) {
          const namaz = state.gunlukNamazlar.namazlar.find(
            n => n.namazAdi === action.payload.namazAdi
          );
          if (namaz) {
            namaz.tamamlandi = action.payload.tamamlandi;
          }
        }
      })
      .addCase(namazDurumunuDegistir.rejected, (state, action) => {
        state.guncelleniyor = false;
        state.hata = action.error.message || 'Namaz durumu guncellenemedi';
      });

    // Tum namazlari tamamla
    builder
      .addCase(tumNamazlariTamamla.fulfilled, (state, action) => {
        if (state.gunlukNamazlar && state.gunlukNamazlar.tarih === action.payload) {
          state.gunlukNamazlar.namazlar.forEach(namaz => {
            namaz.tamamlandi = true;
          });
        }
      });

    // Tum namazlari sifirla
    builder
      .addCase(tumNamazlariSifirla.fulfilled, (state, action) => {
        if (state.gunlukNamazlar && state.gunlukNamazlar.tarih === action.payload) {
          state.gunlukNamazlar.namazlar.forEach(namaz => {
            namaz.tamamlandi = false;
          });
        }
      });

    // Haftalik istatistikler
    builder
      .addCase(haftalikIstatistikleriYukle.pending, (state) => {
        state.yukleniyor = true;
      })
      .addCase(haftalikIstatistikleriYukle.fulfilled, (state, action) => {
        state.yukleniyor = false;
        state.haftalikIstatistik = action.payload;
      })
      .addCase(haftalikIstatistikleriYukle.rejected, (state, action) => {
        state.yukleniyor = false;
        state.hata = action.error.message || 'Haftalik istatistikler yuklenemedi';
      });

    // Aylik istatistikler
    builder
      .addCase(aylikIstatistikleriYukle.pending, (state) => {
        state.yukleniyor = true;
      })
      .addCase(aylikIstatistikleriYukle.fulfilled, (state, action) => {
        state.yukleniyor = false;
        state.aylikIstatistik = action.payload;
      })
      .addCase(aylikIstatistikleriYukle.rejected, (state, action) => {
        state.yukleniyor = false;
        state.hata = action.error.message || 'Aylik istatistikler yuklenemedi';
      });
  },
});

export const { tarihiDegistir, hataTemizle } = namazSlice.actions;
export default namazSlice.reducer;

