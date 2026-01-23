/**
 * AsyncStorage ile seri, rozet ve seviye verilerini yoneten servis
 * Offline kullanim ve misafir modu icin
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SeriDurumu,
  SeriAyarlari,
  KullaniciRozeti,
  SeviyeDurumu,
  VARSAYILAN_SERI_AYARLARI,
  OzelGunAyarlari,
} from '../../core/types/SeriTipleri';
import { ApiYanit } from '../../core/types';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { bosSeriDurumuOlustur } from '../../domain/services/SeriHesaplayiciServisi';
import {
  bosKullaniciRozetleriOlustur,
  bosSeviyeDurumuOlustur,
} from '../../domain/services/RozetYoneticisiServisi';

// ==================== SERI DURUMU ====================

/**
 * Seri durumunu local storage'dan getirir
 */
export const localSeriDurumunuGetir = async (): Promise<
  ApiYanit<SeriDurumu>
> => {
  try {
    const veri = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.SERI_DURUMU);

    if (veri) {
      return { basarili: true, veri: JSON.parse(veri) };
    }

    // Veri yoksa bos durum dondur
    const bosDurum = bosSeriDurumuOlustur();
    return { basarili: true, veri: bosDurum };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Seri durumunu local storage'a kaydeder
 */
export const localSeriDurumunuKaydet = async (
  seriDurumu: SeriDurumu
): Promise<ApiYanit<void>> => {
  try {
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.SERI_DURUMU,
      JSON.stringify(seriDurumu)
    );
    return { basarili: true };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

// ==================== ROZET VERILERI ====================

/**
 * Kullanici rozetlerini local storage'dan getirir
 */
export const localRozetleriGetir = async (): Promise<
  ApiYanit<KullaniciRozeti[]>
> => {
  try {
    const veri = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.ROZET_VERILERI);

    if (veri) {
      return { basarili: true, veri: JSON.parse(veri) };
    }

    // Veri yoksa bos liste dondur
    const bosRozetler = bosKullaniciRozetleriOlustur();
    return { basarili: true, veri: bosRozetler };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Kullanici rozetlerini local storage'a kaydeder
 */
export const localRozetleriKaydet = async (
  rozetler: KullaniciRozeti[]
): Promise<ApiYanit<void>> => {
  try {
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.ROZET_VERILERI,
      JSON.stringify(rozetler)
    );
    return { basarili: true };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

// ==================== SEVIYE DURUMU ====================

/**
 * Seviye durumunu local storage'dan getirir
 */
export const localSeviyeDurumunuGetir = async (): Promise<
  ApiYanit<SeviyeDurumu>
> => {
  try {
    const veri = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.SEVIYE_DURUMU);

    if (veri) {
      return { basarili: true, veri: JSON.parse(veri) };
    }

    // Veri yoksa bos durum dondur
    const bosDurum = bosSeviyeDurumuOlustur();
    return { basarili: true, veri: bosDurum };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Seviye durumunu local storage'a kaydeder
 */
export const localSeviyeDurumunuKaydet = async (
  seviyeDurumu: SeviyeDurumu
): Promise<ApiYanit<void>> => {
  try {
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.SEVIYE_DURUMU,
      JSON.stringify(seviyeDurumu)
    );
    return { basarili: true };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

// ==================== SERI AYARLARI ====================

/**
 * Seri ayarlarini local storage'dan getirir
 */
export const localSeriAyarlariniGetir = async (): Promise<
  ApiYanit<SeriAyarlari>
> => {
  try {
    const veri = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.SERI_AYARLARI);

    if (veri) {
      return { basarili: true, veri: JSON.parse(veri) };
    }

    // Veri yoksa varsayilan ayarlari dondur
    return { basarili: true, veri: VARSAYILAN_SERI_AYARLARI };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Seri ayarlarini local storage'a kaydeder
 */
export const localSeriAyarlariniKaydet = async (
  ayarlar: SeriAyarlari
): Promise<ApiYanit<void>> => {
  try {
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.SERI_AYARLARI,
      JSON.stringify(ayarlar)
    );
    return { basarili: true };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

// ==================== OZEL GUN AYARLARI ====================

/**
 * Varsayilan ozel gun ayarlari
 */
export const VARSAYILAN_OZEL_GUN_AYARLARI: OzelGunAyarlari = {
  ozelGunModuAktif: false,
  aktifOzelGun: null,
  gecmisKayitlar: [],
};

/**
 * Ozel gun ayarlarini local storage'dan getirir
 */
export const localOzelGunAyarlariniGetir = async (): Promise<
  ApiYanit<OzelGunAyarlari>
> => {
  try {
    const veri = await AsyncStorage.getItem(
      DEPOLAMA_ANAHTARLARI.OZEL_GUN_AYARLARI
    );

    if (veri) {
      return { basarili: true, veri: JSON.parse(veri) };
    }

    // Veri yoksa varsayilan ayarlari dondur
    return { basarili: true, veri: VARSAYILAN_OZEL_GUN_AYARLARI };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Ozel gun ayarlarini local storage'a kaydeder
 */
export const localOzelGunAyarlariniKaydet = async (
  ayarlar: OzelGunAyarlari
): Promise<ApiYanit<void>> => {
  try {
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.OZEL_GUN_AYARLARI,
      JSON.stringify(ayarlar)
    );
    return { basarili: true };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

// ==================== ISTATISTIKLER ====================

/**
 * Toplam kilinin namaz sayisini getirir
 */
export const localToplamKilinanNamaziGetir = async (): Promise<
  ApiYanit<number>
> => {
  try {
    const veri = await AsyncStorage.getItem(
      DEPOLAMA_ANAHTARLARI.TOPLAM_KILILAN_NAMAZ
    );
    return { basarili: true, veri: veri ? parseInt(veri, 10) : 0 };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Toplam kilinin namaz sayisini kaydeder
 */
export const localToplamKilinanNamaziKaydet = async (
  sayi: number
): Promise<ApiYanit<void>> => {
  try {
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.TOPLAM_KILILAN_NAMAZ,
      sayi.toString()
    );
    return { basarili: true };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Toplam kilinin namaz sayisini arttirir
 */
export const localToplamKilinanNamaziArttir = async (
  miktar: number = 1
): Promise<ApiYanit<number>> => {
  try {
    const mevcutYanit = await localToplamKilinanNamaziGetir();
    const mevcut = mevcutYanit.veri || 0;
    const yeni = mevcut + miktar;
    await localToplamKilinanNamaziKaydet(yeni);
    return { basarili: true, veri: yeni };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Toparlanma sayisini getirir
 */
export const localToparlanmaSayisiniGetir = async (): Promise<
  ApiYanit<number>
> => {
  try {
    const veri = await AsyncStorage.getItem(
      DEPOLAMA_ANAHTARLARI.TOPARLANMA_SAYISI
    );
    return { basarili: true, veri: veri ? parseInt(veri, 10) : 0 };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Toparlanma sayisini arttirir
 */
export const localToparlanmaSayisiniArttir = async (): Promise<
  ApiYanit<number>
> => {
  try {
    const mevcutYanit = await localToparlanmaSayisiniGetir();
    const mevcut = mevcutYanit.veri || 0;
    const yeni = mevcut + 1;
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.TOPARLANMA_SAYISI,
      yeni.toString()
    );
    return { basarili: true, veri: yeni };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Mukemmel gun sayisini (5/5) getirir
 */
export const localMukemmelGunSayisiniGetir = async (): Promise<
  ApiYanit<number>
> => {
  try {
    const veri = await AsyncStorage.getItem(
      DEPOLAMA_ANAHTARLARI.MUKEMMEL_GUN_SAYISI
    );
    return { basarili: true, veri: veri ? parseInt(veri, 10) : 0 };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Mukemmel gun sayisini arttirir
 */
export const localMukemmelGunSayisiniArttir = async (): Promise<
  ApiYanit<number>
> => {
  try {
    const mevcutYanit = await localMukemmelGunSayisiniGetir();
    const mevcut = mevcutYanit.veri || 0;
    const yeni = mevcut + 1;
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.MUKEMMEL_GUN_SAYISI,
      yeni.toString()
    );
    return { basarili: true, veri: yeni };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

// ==================== TOPLU ISLEMLER ====================

/**
 * Tum seri verilerini bir seferde getirir
 */
export const localTumSeriVerileriniGetir = async (): Promise<
  ApiYanit<{
    seriDurumu: SeriDurumu;
    rozetler: KullaniciRozeti[];
    seviyeDurumu: SeviyeDurumu;
    ayarlar: SeriAyarlari;
    ozelGunAyarlari: OzelGunAyarlari;
    toplamKilinanNamaz: number;
    toparlanmaSayisi: number;
    mukemmelGunSayisi: number;
  }>
> => {
  try {
    const [
      seriYanit,
      rozetYanit,
      seviyeYanit,
      ayarlarYanit,
      ozelGunYanit,
      toplamYanit,
      toparlanmaYanit,
      mukemmelYanit,
    ] = await Promise.all([
      localSeriDurumunuGetir(),
      localRozetleriGetir(),
      localSeviyeDurumunuGetir(),
      localSeriAyarlariniGetir(),
      localOzelGunAyarlariniGetir(),
      localToplamKilinanNamaziGetir(),
      localToparlanmaSayisiniGetir(),
      localMukemmelGunSayisiniGetir(),
    ]);

    return {
      basarili: true,
      veri: {
        seriDurumu: seriYanit.veri || bosSeriDurumuOlustur(),
        rozetler: rozetYanit.veri || bosKullaniciRozetleriOlustur(),
        seviyeDurumu: seviyeYanit.veri || bosSeviyeDurumuOlustur(),
        ayarlar: ayarlarYanit.veri || VARSAYILAN_SERI_AYARLARI,
        ozelGunAyarlari: ozelGunYanit.veri || VARSAYILAN_OZEL_GUN_AYARLARI,
        toplamKilinanNamaz: toplamYanit.veri || 0,
        toparlanmaSayisi: toparlanmaYanit.veri || 0,
        mukemmelGunSayisi: mukemmelYanit.veri || 0,
      },
    };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Tum seri verilerini temizler (sifirlama)
 */
export const localTumSeriVerileriniTemizle = async (): Promise<
  ApiYanit<void>
> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(DEPOLAMA_ANAHTARLARI.SERI_DURUMU),
      AsyncStorage.removeItem(DEPOLAMA_ANAHTARLARI.ROZET_VERILERI),
      AsyncStorage.removeItem(DEPOLAMA_ANAHTARLARI.SEVIYE_DURUMU),
      AsyncStorage.removeItem(DEPOLAMA_ANAHTARLARI.TOPLAM_KILILAN_NAMAZ),
      AsyncStorage.removeItem(DEPOLAMA_ANAHTARLARI.TOPARLANMA_SAYISI),
      AsyncStorage.removeItem(DEPOLAMA_ANAHTARLARI.MUKEMMEL_GUN_SAYISI),
      // Ayarlar korunur
    ]);
    return { basarili: true };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};


