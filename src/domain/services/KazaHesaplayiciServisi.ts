/**
 * Kaza Defteri hesaplama servisi
 * Sihirbaz hesabı, motivasyon önerileri, tempo analizi ve mekruh vakit kontrolü
 */

import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import {
  HesaplamaSihirbazGirdisi,
  MotivasyonOnerisi,
  KazaIstatistik,
  KAZA_NAMAZ_LISTESI,
} from '../../core/types/KazaTipleri';
import { KAZA_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import { tarihiISOFormatinaCevir } from '../../core/utils/TarihYardimcisi';

// ==================== SİHİRBAZ HESABI ====================

/**
 * Doğum tarihi ve ergenlik yaşına göre toplam kaza borcu tahminini hesaplar.
 * Sonuç her vakitten eşit dağıtılmak üzere toplam namaz sayısıdır.
 *
 * @returns Tahmini toplam namaz borcu (6 vakitle çarpılmış, ergenlikten bugüne kadar)
 */
export const hesaplaTahminiBorcMiktari = (girdi: HesaplamaSihirbazGirdisi): number => {
  const { dogumTarihi, ergenlikYasi, kildigiTahminiYuzdesi } = girdi;

  const dogumDate = new Date(dogumTarihi);
  const ergenlikDate = new Date(dogumDate);
  ergenlikDate.setFullYear(dogumDate.getFullYear() + ergenlikYasi);

  const bugun = new Date();

  // Ergenlik tarihi henüz gelmediyse borç yok
  if (ergenlikDate > bugun) return 0;

  const msPerGun = 1000 * 60 * 60 * 24;
  const ergenliktenBugüneGun = Math.floor(
    (bugun.getTime() - ergenlikDate.getTime()) / msPerGun
  );

  // 6 vakit: Sabah, Öğle, İkindi, Akşam, Yatsı, Vitir
  const toplamVakitSayisi = KAZA_NAMAZ_LISTESI.length;
  const toplamBorcNamaz = ergenliktenBugüneGun * toplamVakitSayisi;

  // Kılınan yüzdeyi düş
  const kildigiOran = Math.min(100, Math.max(0, kildigiTahminiYuzdesi)) / 100;
  const kalinanBorc = Math.round(toplamBorcNamaz * (1 - kildigiOran));

  return kalinanBorc;
};

/**
 * Toplam borcu 6 vakite eşit böler (her vakit için kaza sayısı)
 */
export const borcuVakitlerePaylaştır = (toplamBorc: number): Record<string, number> => {
  const vakitSayisi = KAZA_NAMAZ_LISTESI.length;
  const perVakit = Math.floor(toplamBorc / vakitSayisi);
  const kalan = toplamBorc % vakitSayisi;

  const dagılım: Record<string, number> = {};
  KAZA_NAMAZ_LISTESI.forEach((ad, index) => {
    dagılım[ad] = perVakit + (index < kalan ? 1 : 0);
  });
  return dagılım;
};

// ==================== MOTİVASYON ÖNERİLERİ ====================

/**
 * "Her vakitten sonra X kaza kılsan Y günde biter" önerilerini üretir
 */
export const motivasyonOnerileriHesapla = (toplamKalan: number): MotivasyonOnerisi[] => {
  if (toplamKalan <= 0) return [];

  const vakitSayisi = KAZA_NAMAZ_LISTESI.length;

  return KAZA_SABITLERI.MOTIVASYON_SENARYOLARI.map((kazaAdediPerVakit) => {
    const toplamGunlukKaza = kazaAdediPerVakit * vakitSayisi;
    const tamamlanmaGunSayisi = Math.ceil(toplamKalan / toplamGunlukKaza);
    const tamamlanmaAySayisi = parseFloat((tamamlanmaGunSayisi / 30).toFixed(1));

    let aciklama: string;
    if (tamamlanmaGunSayisi <= 30) {
      aciklama = `Her vakitten sonra ${kazaAdediPerVakit} kaza kılsan ${tamamlanmaGunSayisi} günde biter`;
    } else if (tamamlanmaAySayisi <= 12) {
      aciklama = `Her vakitten sonra ${kazaAdediPerVakit} kaza kılsan ~${Math.ceil(tamamlanmaAySayisi)} ayda biter`;
    } else {
      const yil = parseFloat((tamamlanmaAySayisi / 12).toFixed(1));
      aciklama = `Her vakitten sonra ${kazaAdediPerVakit} kaza kılsan ~${yil} yılda biter`;
    }

    return {
      kazaAdediPerVakit,
      toplamGunlukKaza,
      tamamlanmaGunSayisi,
      tamamlanmaAySayisi,
      aciklama,
    };
  });
};

// ==================== TEMPO & TAHMİN ====================

/**
 * Son N günün tempo geçmişinden haftalık ortalama hesaplar ve tahmini bitiş tarihini döner
 */
export const kazaIstatistikHesapla = (
  toplamKalan: number,
  tempoGecmis: Record<string, number>
): KazaIstatistik => {
  const motivasyonOnerileri = motivasyonOnerileriHesapla(toplamKalan);

  if (toplamKalan <= 0) {
    return {
      haftaOrtalamasi: 0,
      tahminiTamamlanmaTarihi: null,
      tahminiTamamlanmaGunSayisi: null,
      motivasyonOnerileri,
    };
  }

  // Son 7 günün ortalamasını hesapla
  const bugun = new Date();
  let toplamSon7Gun = 0;
  let gunSayisi = 0;

  for (let i = 0; i < KAZA_SABITLERI.TEMPO_HESAP_GUNLERI; i++) {
    const tarih = new Date(bugun);
    tarih.setDate(bugun.getDate() - i);
    const tarihStr = tarihiISOFormatinaCevir(tarih);
    if (tempoGecmis[tarihStr] !== undefined) {
      toplamSon7Gun += tempoGecmis[tarihStr];
      gunSayisi++;
    }
  }

  if (gunSayisi === 0) {
    return {
      haftaOrtalamasi: 0,
      tahminiTamamlanmaTarihi: null,
      tahminiTamamlanmaGunSayisi: null,
      motivasyonOnerileri,
    };
  }

  const haftaOrtalamasi = parseFloat((toplamSon7Gun / gunSayisi).toFixed(1));

  if (haftaOrtalamasi <= 0) {
    return {
      haftaOrtalamasi: 0,
      tahminiTamamlanmaTarihi: null,
      tahminiTamamlanmaGunSayisi: null,
      motivasyonOnerileri,
    };
  }

  const tahminiTamamlanmaGunSayisi = Math.ceil(toplamKalan / haftaOrtalamasi);
  const tahminiTarih = new Date(bugun);
  tahminiTarih.setDate(bugun.getDate() + tahminiTamamlanmaGunSayisi);

  return {
    haftaOrtalamasi,
    tahminiTamamlanmaTarihi: tarihiISOFormatinaCevir(tahminiTarih),
    tahminiTamamlanmaGunSayisi,
    motivasyonOnerileri,
  };
};

/**
 * Tahmini bitiş tarihini insan dostu formatta döner
 * Örn: "14 Temmuz 2026" veya "~3 ay sonra"
 */
export const tahminiTarihiFormatla = (tarihStr: string): string => {
  const tarih = new Date(tarihStr);
  const aylar = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];
  return `${tarih.getDate()} ${aylar[tarih.getMonth()]} ${tarih.getFullYear()}`;
};

// ==================== MEKRUH VAKİT KONTROLÜ ====================

export interface MekruhVakitBilgisi {
  mekruhMu: boolean;
  aciklama: string | null;
  bitis: Date | null; // mekruh bitiş zamanı
}

/**
 * Verilen koordinatlar için mevcut anın mekruh vakit olup olmadığını kontrol eder.
 *
 * Hanefî mezhebine göre 3 mekruh vakit:
 * 1. Güneş doğarken (şuruk): Güneş doğumundan ~20 dakika sonrasına kadar
 * 2. Güneş tam tepede (istiwa): Öğle ezanından ~5 dakika önce (süre çok kısa)
 * 3. Güneş batarken (gurub): İkindi namazı kılındıktan sonra güneş batana kadar
 *
 * Not: Bu uygulama pratik bir uyarı verir; tam fıkhi taklit yerine geçmez.
 */
export const mekruhVakitKontrolEt = (
  latitude: number,
  longitude: number
): MekruhVakitBilgisi => {
  try {
    const coordinates = new Coordinates(latitude, longitude);
    const params = CalculationMethod.Turkey();
    const now = new Date();
    const prayerTimes = new PrayerTimes(coordinates, now, params);

    const sunrise = prayerTimes.sunrise;
    const dhuhr = prayerTimes.dhuhr;
    const sunset = prayerTimes.maghrib; // Akşam = Gün batımı

    const toleransMs = KAZA_SABITLERI.MEKRUH_TOLERANS_DK * 60 * 1000;
    const istiwaToleransMs = 5 * 60 * 1000; // İstiwa için 5 dakika

    // 1. Şuruk: Güneş doğumundan 20 dakika sonrasına kadar
    const surukBitis = new Date(sunrise.getTime() + toleransMs);
    if (now >= sunrise && now <= surukBitis) {
      return {
        mekruhMu: true,
        aciklama:
          'Güneş doğuş vaktidir (şuruk). Bu vakitte kaza namazı kılınması mekruhtur. Güneş iyice yükselene kadar bekleyiniz.',
        bitis: surukBitis,
      };
    }

    // 2. İstiwa: Öğle ezanından 5 dakika önce
    const istawaBasi = new Date(dhuhr.getTime() - istiwaToleransMs);
    if (now >= istawaBasi && now <= dhuhr) {
      return {
        mekruhMu: true,
        aciklama:
          'Güneş tam tepede (istiwa vakti). Bu vakitte kaza namazı kılınması mekruhtur. Öğle ezanını bekleyiniz.',
        bitis: dhuhr,
      };
    }

    // 3. Gurub: Güneş batmadan önceki ~20 dakika (pratik yaklaşım).
    // Fıkhi kural: İkindi kılındıktan sonra güneş batana kadar mekruhtur.
    // Ancak İkindi vakti bilgisi olmadan bu sınırı belirlemek mümkün değil;
    // gün batımından 20 dakika geriye bakarak yaklaşık bir uyarı veriliyor.
    const gurubBasi = new Date(sunset.getTime() - toleransMs);
    if (now >= gurubBasi && now <= sunset) {
      return {
        mekruhMu: true,
        aciklama:
          'Güneş batış vaktidir (gurub). Bu vakitte kaza namazı kılınması mekruhtur. Akşam ezanını bekleyiniz.',
        bitis: sunset,
      };
    }

    return { mekruhMu: false, aciklama: null, bitis: null };
  } catch {
    // Koordinat yoksa uyarı verme
    return { mekruhMu: false, aciklama: null, bitis: null };
  }
};
