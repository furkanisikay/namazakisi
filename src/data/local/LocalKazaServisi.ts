/**
 * Kaza Defteri verilerini AsyncStorage'da yöneten servis
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { KazaDurumu, KazaNamaz, KazaNamazAdi, KAZA_NAMAZ_LISTESI } from '../../core/types/KazaTipleri';
import { ApiYanit } from '../../core/types';
import { DEPOLAMA_ANAHTARLARI, KAZA_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import { tarihiISOFormatinaCevir } from '../../core/utils/TarihYardimcisi';
import { Logger } from '../../core/utils/Logger';

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

    if (!veri) {
      return { basarili: true, veri: bosKazaDurumuOlustur() };
    }

    // Bozuk/beklenmedik veride OKUMA ASLA REDDETMEMELİ — yoksa sayfa sonsuz
    // "Yükleniyor..."da kilitlenir (kazaVerileriniYukle reddolur → kazaDurumu null).
    // Ham değeri ÜZERİNE YAZMAYIZ (kurtarma için diskte korunur), yalnızca boş
    // (kullanılabilir) durumla devam eder ve durumu loglarız.
    let parsed: unknown;
    try {
      parsed = JSON.parse(veri);
    } catch {
      Logger.warn('LocalKazaServisi', 'KAZA_DURUMU parse edilemedi, boş durumla devam ediliyor', {
        uzunluk: veri.length,
        onek: veri.slice(0, 120),
      });
      return { basarili: true, veri: bosKazaDurumuOlustur() };
    }

    // Beklenen biçim: düz nesne. null / dizi / sayı / string kullanılamaz.
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      Logger.warn('LocalKazaServisi', 'KAZA_DURUMU beklenmeyen biçimde, boş durumla devam ediliyor', {
        tip: Array.isArray(parsed) ? 'array' : typeof parsed,
      });
      return { basarili: true, veri: bosKazaDurumuOlustur() };
    }

    const durum = parsed as KazaDurumu;

    // Eski versiyondan gelen verilerde eksik alanlar olabilir
    if (!Array.isArray(durum.namazlar) || durum.namazlar.length === 0) {
      durum.namazlar = KAZA_NAMAZ_LISTESI.map(bosKazaNamazOlustur);
    }
    // Vitir sonradan eklendiyse listeye ekle
    const mevcutAdlar = durum.namazlar.map((n) => n.namazAdi);
    for (const ad of KAZA_NAMAZ_LISTESI) {
      if (!mevcutAdlar.includes(ad)) {
        durum.namazlar.push(bosKazaNamazOlustur(ad));
      }
    }
    if (durum.toplamGizleMi === undefined) {
      durum.toplamGizleMi = false;
    }
    if (durum.gunlukHedef === undefined) {
      durum.gunlukHedef = KAZA_SABITLERI.VARSAYILAN_GUNLUK_HEDEF;
    }

    return { basarili: true, veri: durum };
  } catch (error) {
    // Beklenmeyen okuma hatası (ör. AsyncStorage erişimi) — yine de kilitlenme;
    // boş durumla başarılı dön (sayfa açılsın), hatayı logla.
    Logger.error('LocalKazaServisi', 'KAZA_DURUMU okunamadı, boş durumla devam ediliyor', {
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    });
    return { basarili: true, veri: bosKazaDurumuOlustur() };
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
