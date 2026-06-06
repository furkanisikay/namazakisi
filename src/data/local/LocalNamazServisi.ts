/**
 * AsyncStorage ile local namaz verilerini yoneten servis
 * Offline kullanim ve misafir modu icin
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Namaz,
  GunlukNamazlar,
  LocalNamazVerileri,
  ApiYanit,
  VakitAdi
} from '../../core/types';
import {
  NAMAZ_ISIMLERI,
  NamazAdi,
  DEPOLAMA_ANAHTARLARI
} from '../../core/constants/UygulamaSabitleri';
import { gunEkle } from '../../core/utils/TarihYardimcisi';
import { Logger } from '../../core/utils/Logger';

/**
 * Tum local verileri getirir
 */
const tumVerileriAl = async (): Promise<LocalNamazVerileri> => {
  try {
    const veri = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.NAMAZ_VERILERI);
    return veri ? JSON.parse(veri) : {};
  } catch (error) {
    Logger.error('LocalNamaz', 'Namaz verileri okunamadı', error);
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
 * Tek anahtarda (NAMAZ_VERILERI) read-modify-write yapan yazma işlemlerini
 * serileştiren kuyruk. AsyncStorage atomik değildir; eşzamanlı güncellemeler
 * birbirinin yazımını ezmesin (lost update) diye tüm mutasyonlar bu zincir
 * üzerinden sırayla çalışır.
 */
let yazmaKuyrugu: Promise<unknown> = Promise.resolve();

const yazmaSirasinaAl = <T>(islem: () => Promise<T>): Promise<T> => {
  const sonuc = yazmaKuyrugu.then(islem, islem);
  // Bir işlemin hatası kuyruğu kırmasın diye zinciri her durumda sürdür.
  yazmaKuyrugu = sonuc.then(
    () => undefined,
    () => undefined
  );
  return sonuc;
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
): Promise<ApiYanit<void>> =>
  yazmaSirasinaAl(async () => {
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
  });

/**
 * Tum namazlari toplu olarak gunceller
 */
export const localTumNamazlariGuncelle = async (
  tarih: string,
  tamamlandi: boolean
): Promise<ApiYanit<void>> =>
  yazmaSirasinaAl(async () => {
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
  });

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

/**
 * Belirli bir tarih icin "kilinan" olarak isaretlenmis vakitleri dondurur.
 * Muhafiz storage key'ini (MUHAFIZ_AYARLARI_kilinan_<tarih>) okur;
 * ArkaplanMuhafiz ve VakitSayac servisleri ayni kaydi paylasir.
 */
export const kilinanVakitleriAl = async (tarih: string): Promise<VakitAdi[]> => {
  try {
    const anahtar = `${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_${tarih}`;
    const veri = await AsyncStorage.getItem(anahtar);
    if (veri) {
      // Bozuk/beklenmedik veri tipine karsi koru (downstream .includes/.map crash'ini onler)
      const parsed = JSON.parse(veri);
      return Array.isArray(parsed) ? (parsed as VakitAdi[]) : [];
    }
    return [];
  } catch (error) {
    Logger.error('LocalNamaz', 'Kılınan vakitler alınamadı', error);
    return [];
  }
};

