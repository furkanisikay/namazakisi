/**
 * AsyncStorage ile local namaz verilerini yoneten servis
 * Offline kullanim ve misafir modu icin
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Namaz,
  GunlukNamazlar,
  LocalNamazVerileri,
  ApiYanit
} from '../../core/types';
import {
  NAMAZ_ISIMLERI,
  NamazAdi,
  DEPOLAMA_ANAHTARLARI
} from '../../core/constants/UygulamaSabitleri';
import { gunEkle } from '../../core/utils/TarihYardimcisi';

/**
 * Tum local verileri getirir
 */
const tumVerileriAl = async (): Promise<LocalNamazVerileri> => {
  try {
    const veri = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.NAMAZ_VERILERI);
    return veri ? JSON.parse(veri) : {};
  } catch {
    return {};
  }
};

/**
 * Tum local verileri kaydeder
 */
const tumVerileriKaydet = async (veriler: LocalNamazVerileri): Promise<void> => {
  await AsyncStorage.setItem(
    DEPOLAMA_ANAHTARLARI.NAMAZ_VERILERI,
    JSON.stringify(veriler)
  );
};

/**
 * Belirli bir tarihe ait namazlari getirir
 */
export const localNamazlariGetir = async (
  tarih: string
): Promise<ApiYanit<GunlukNamazlar>> => {
  try {
    const tumVeriler = await tumVerileriAl();
    const tarihVerileri = tumVeriler[tarih] || {};

    const namazlar: Namaz[] = NAMAZ_ISIMLERI.map((namazAdi) => ({
      namazAdi,
      tamamlandi: tarihVerileri[namazAdi] || false,
      tarih,
    }));

    return {
      basarili: true,
      veri: { tarih, namazlar },
    };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Namaz durumunu gunceller
 */
export const localNamazDurumunuGuncelle = async (
  tarih: string,
  namazAdi: NamazAdi,
  tamamlandi: boolean
): Promise<ApiYanit<void>> => {
  try {
    const tumVeriler = await tumVerileriAl();

    if (!tumVeriler[tarih]) {
      tumVeriler[tarih] = {};
    }

    tumVeriler[tarih][namazAdi] = tamamlandi;
    await tumVerileriKaydet(tumVeriler);

    return { basarili: true };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Tum namazlari toplu olarak gunceller
 */
export const localTumNamazlariGuncelle = async (
  tarih: string,
  tamamlandi: boolean
): Promise<ApiYanit<void>> => {
  try {
    const tumVeriler = await tumVerileriAl();

    tumVeriler[tarih] = {};
    NAMAZ_ISIMLERI.forEach((namazAdi) => {
      tumVeriler[tarih][namazAdi] = tamamlandi;
    });

    await tumVerileriKaydet(tumVeriler);

    return { basarili: true };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Tarih araligindaki namazlari getirir
 */
export const localTarihAraligindakiNamazlariGetir = async (
  baslangicTarihi: string,
  bitisTarihi: string
): Promise<ApiYanit<GunlukNamazlar[]>> => {
  try {
    const tumVeriler = await tumVerileriAl();
    const sonuc: GunlukNamazlar[] = [];

    // Tarih araligini olustur
    let mevcutTarih = baslangicTarihi;
    while (mevcutTarih <= bitisTarihi) {
      const tarihVerileri = tumVeriler[mevcutTarih] || {};

      const namazlar: Namaz[] = NAMAZ_ISIMLERI.map((namazAdi) => ({
        namazAdi,
        tamamlandi: tarihVerileri[namazAdi] || false,
        tarih: mevcutTarih,
      }));

      sonuc.push({ tarih: mevcutTarih, namazlar });

      // Sonraki gune gec
      mevcutTarih = gunEkle(mevcutTarih, 1);
    }

    return { basarili: true, veri: sonuc };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Tum local verileri senkronizasyon formatinda dondurur
 */
export const localVerileriSenkronizasyonIcinAl = async (): Promise<
  { tarih: string; namazAdi: NamazAdi; tamamlandi: boolean }[]
> => {
  const tumVeriler = await tumVerileriAl();
  const sonuc: { tarih: string; namazAdi: NamazAdi; tamamlandi: boolean }[] = [];

  Object.entries(tumVeriler).forEach(([tarih, namazlar]) => {
    Object.entries(namazlar).forEach(([namazAdi, tamamlandi]) => {
      if (NAMAZ_ISIMLERI.includes(namazAdi as any)) {
        sonuc.push({
          tarih,
          namazAdi: namazAdi as NamazAdi,
          tamamlandi,
        });
      }
    });
  });

  return sonuc;
};

/**
 * Local verileri temizler
 */
export const localVerileriTemizle = async (): Promise<void> => {
  await AsyncStorage.removeItem(DEPOLAMA_ANAHTARLARI.NAMAZ_VERILERI);
};

/**
 * Son senkronizasyon zamanini kaydeder
 */
export const sonSenkronizasyonuKaydet = async (): Promise<void> => {
  await AsyncStorage.setItem(
    DEPOLAMA_ANAHTARLARI.SON_SENKRONIZASYON,
    new Date().toISOString()
  );
};

/**
 * Son senkronizasyon zamanini getirir
 */
export const sonSenkronizasyonuAl = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.SON_SENKRONIZASYON);
};

