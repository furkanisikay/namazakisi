/**
 * Kaza Defteri verilerini AsyncStorage'da yöneten servis
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { KazaDurumu, KazaNamaz, KazaNamazAdi, KAZA_NAMAZ_LISTESI } from '../../core/types/KazaTipleri';
import { ApiYanit } from '../../core/types';
import { DEPOLAMA_ANAHTARLARI, KAZA_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import { tarihiISOFormatinaCevir } from '../../core/utils/TarihYardimcisi';

// ==================== BAŞLANGIÇ DURUMU ====================

/**
 * Boş KazaNamaz oluşturur
 */
const bosKazaNamazOlustur = (namazAdi: KazaNamazAdi): KazaNamaz => ({
  namazAdi,
  toplamBorc: 0,
  kalanBorc: 0,
  tamamlanan: 0,
});

/**
 * Yeni (boş) KazaDurumu oluşturur
 */
export const bosKazaDurumuOlustur = (): KazaDurumu => ({
  namazlar: KAZA_NAMAZ_LISTESI.map(bosKazaNamazOlustur),
  toplamKalan: 0,
  toplamTamamlanan: 0,
  gunlukHedef: KAZA_SABITLERI.VARSAYILAN_GUNLUK_HEDEF,
  gunlukTamamlanan: 0,
  gunlukHedefTarihi: tarihiISOFormatinaCevir(new Date()),
  toplamGizleMi: false,
  guncellemeTarihi: new Date().toISOString(),
});

// ==================== KAZA DURUMU ====================

/**
 * Kaza durumunu AsyncStorage'dan getirir
 */
export const localKazaDurumunuGetir = async (): Promise<ApiYanit<KazaDurumu>> => {
  try {
    const veri = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.KAZA_DURUMU);

    if (veri) {
      const parsed = JSON.parse(veri) as KazaDurumu;

      // Eski versiyondan gelen verilerde eksik alanlar olabilir
      if (!parsed.namazlar || parsed.namazlar.length === 0) {
        parsed.namazlar = KAZA_NAMAZ_LISTESI.map(bosKazaNamazOlustur);
      }
      // Vitir sonradan eklendiyse listeye ekle
      const mevcutAdlar = parsed.namazlar.map((n) => n.namazAdi);
      for (const ad of KAZA_NAMAZ_LISTESI) {
        if (!mevcutAdlar.includes(ad)) {
          parsed.namazlar.push(bosKazaNamazOlustur(ad));
        }
      }
      if (parsed.toplamGizleMi === undefined) {
        parsed.toplamGizleMi = false;
      }
      if (parsed.gunlukHedef === undefined) {
        parsed.gunlukHedef = KAZA_SABITLERI.VARSAYILAN_GUNLUK_HEDEF;
      }

      return { basarili: true, veri: parsed };
    }

    return { basarili: true, veri: bosKazaDurumuOlustur() };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Kaza durumunu AsyncStorage'a kaydeder
 */
export const localKazaDurumunuKaydet = async (
  kazaDurumu: KazaDurumu
): Promise<ApiYanit<void>> => {
  try {
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.KAZA_DURUMU,
      JSON.stringify(kazaDurumu)
    );
    return { basarili: true };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

// ==================== TEMPO GEÇMİŞİ ====================

/**
 * Günlük tamamlama geçmişini AsyncStorage'dan getirir
 * Format: { "2025-01-01": 5, "2025-01-02": 3, ... }
 */
export const localKazaTempoGecmisiniGetir = async (): Promise<ApiYanit<Record<string, number>>> => {
  try {
    const veri = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.KAZA_TEMPO_GECMIS);
    return { basarili: true, veri: veri ? JSON.parse(veri) : {} };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Bugünün tamamlama sayısını tempo geçmişine kaydeder
 */
export const localKazaTempoGuncelleGecmis = async (
  tarih: string,
  sayi: number
): Promise<ApiYanit<void>> => {
  try {
    const mevcutYanit = await localKazaTempoGecmisiniGetir();
    const gecmis = mevcutYanit.veri || {};

    // Son 30 günü tut, eskiyi sil
    const yeniGecmis: Record<string, number> = { ...gecmis, [tarih]: sayi };
    const otuzGunOnce = new Date();
    otuzGunOnce.setDate(otuzGunOnce.getDate() - 30);
    const otuzGunOnceStr = tarihiISOFormatinaCevir(otuzGunOnce);

    for (const key of Object.keys(yeniGecmis)) {
      if (key < otuzGunOnceStr) {
        delete yeniGecmis[key];
      }
    }

    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.KAZA_TEMPO_GECMIS,
      JSON.stringify(yeniGecmis)
    );
    return { basarili: true };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};
