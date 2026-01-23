/**
 * Rozet ve Seviye Yonetici Servisi
 * Kullanicinin kazandigi rozetleri ve seviye ilerlemesini yonetir
 */

import {
  RozetTanimi,
  KullaniciRozeti,
  RozetDetay,
  SeviyeDurumu,
  SeviyeTanimi,
  RozetSeviyesi,
  ROZET_TANIMLARI,
  SEVIYE_TANIMLARI,
  PUAN_DEGERLERI,
  ROZET_SEVIYE_CARPANI,
  KutlamaBilgisi,
  KutlamaTipi,
  SeriDurumu,
} from '../../core/types/SeriTipleri';

// ==================== ROZET YONETIMI ====================

/**
 * Bos kullanici rozetleri olusturur (hicbiri kazanilmamis)
 */
export const bosKullaniciRozetleriOlustur = (): KullaniciRozeti[] => {
  return ROZET_TANIMLARI.map((tanim) => ({
    rozetId: tanim.id,
    kazanildiMi: false,
    kazanilmaTarihi: null,
  }));
};

/**
 * Rozet detaylarini birlestirir (tanim + kullanici durumu)
 */
export const rozetDetaylariniAl = (
  kullaniciRozetleri: KullaniciRozeti[]
): RozetDetay[] => {
  return ROZET_TANIMLARI.map((tanim) => {
    const kullaniciRozeti = kullaniciRozetleri.find(
      (kr) => kr.rozetId === tanim.id
    ) || {
      rozetId: tanim.id,
      kazanildiMi: false,
      kazanilmaTarihi: null,
    };

    return {
      ...tanim,
      ...kullaniciRozeti,
    };
  });
};

/**
 * Bir rozeti kazanilmis olarak isaretler
 */
export const rozetiKazan = (
  kullaniciRozetleri: KullaniciRozeti[],
  rozetId: string
): { rozetler: KullaniciRozeti[]; kazanilanRozet: RozetTanimi | null } => {
  const rozetTanimi = ROZET_TANIMLARI.find((r) => r.id === rozetId);
  
  if (!rozetTanimi) {
    return { rozetler: kullaniciRozetleri, kazanilanRozet: null };
  }

  const mevcutRozet = kullaniciRozetleri.find((kr) => kr.rozetId === rozetId);
  
  // Zaten kazanilmissa degisiklik yapma
  if (mevcutRozet?.kazanildiMi) {
    return { rozetler: kullaniciRozetleri, kazanilanRozet: null };
  }

  const yeniRozetler = kullaniciRozetleri.map((kr) => {
    if (kr.rozetId === rozetId) {
      return {
        ...kr,
        kazanildiMi: true,
        kazanilmaTarihi: new Date().toISOString(),
      };
    }
    return kr;
  });

  // Eger rozet listede yoksa ekle
  if (!mevcutRozet) {
    yeniRozetler.push({
      rozetId,
      kazanildiMi: true,
      kazanilmaTarihi: new Date().toISOString(),
    });
  }

  return { rozetler: yeniRozetler, kazanilanRozet: rozetTanimi };
};

/**
 * Seri rozetlerini kontrol eder ve kazanilmasi gerekenleri dondurur
 */
export const seriRozetleriniKontrolEt = (
  mevcutSeri: number,
  kullaniciRozetleri: KullaniciRozeti[]
): RozetTanimi[] => {
  const kazanilacakRozetler: RozetTanimi[] = [];

  const seriRozetleri = ROZET_TANIMLARI.filter((r) => r.tip === 'seri');

  for (const rozet of seriRozetleri) {
    const kullaniciRozeti = kullaniciRozetleri.find(
      (kr) => kr.rozetId === rozet.id
    );

    // Rozet henuz kazanilmamis ve kosul saglanmis
    if (!kullaniciRozeti?.kazanildiMi && mevcutSeri >= rozet.kosul) {
      kazanilacakRozetler.push(rozet);
    }
  }

  return kazanilacakRozetler;
};

/**
 * Toplam namaz rozetlerini kontrol eder
 */
export const toplamNamazRozetleriniKontrolEt = (
  toplamNamaz: number,
  kullaniciRozetleri: KullaniciRozeti[]
): RozetTanimi[] => {
  const kazanilacakRozetler: RozetTanimi[] = [];

  const toplamRozetleri = ROZET_TANIMLARI.filter((r) => r.tip === 'toplam');

  for (const rozet of toplamRozetleri) {
    const kullaniciRozeti = kullaniciRozetleri.find(
      (kr) => kr.rozetId === rozet.id
    );

    if (!kullaniciRozeti?.kazanildiMi && toplamNamaz >= rozet.kosul) {
      kazanilacakRozetler.push(rozet);
    }
  }

  return kazanilacakRozetler;
};

/**
 * Ozel rozetleri kontrol eder (toparlanma ustasi, mukemmeliyetci vb.)
 */
export const ozelRozetleriKontrolEt = (
  toparlanmaSayisi: number,
  mukemmelGunSayisi: number,
  kullaniciRozetleri: KullaniciRozeti[]
): RozetTanimi[] => {
  const kazanilacakRozetler: RozetTanimi[] = [];

  // Toparlanma Ustasi
  const toparlanmaUstasi = ROZET_TANIMLARI.find(
    (r) => r.id === 'toparlanma_ustasi'
  );
  if (toparlanmaUstasi) {
    const kullaniciRozeti = kullaniciRozetleri.find(
      (kr) => kr.rozetId === toparlanmaUstasi.id
    );
    if (
      !kullaniciRozeti?.kazanildiMi &&
      toparlanmaSayisi >= toparlanmaUstasi.kosul
    ) {
      kazanilacakRozetler.push(toparlanmaUstasi);
    }
  }

  // Mukemmeliyetci
  const mukemmeliyetci = ROZET_TANIMLARI.find(
    (r) => r.id === 'mukemmeliyetci'
  );
  if (mukemmeliyetci) {
    const kullaniciRozeti = kullaniciRozetleri.find(
      (kr) => kr.rozetId === mukemmeliyetci.id
    );
    if (
      !kullaniciRozeti?.kazanildiMi &&
      mukemmelGunSayisi >= mukemmeliyetci.kosul
    ) {
      kazanilacakRozetler.push(mukemmeliyetci);
    }
  }

  return kazanilacakRozetler;
};

/**
 * Kazanilan rozet sayisini dondurur
 */
export const kazanilanRozetSayisi = (
  kullaniciRozetleri: KullaniciRozeti[]
): number => {
  return kullaniciRozetleri.filter((kr) => kr.kazanildiMi).length;
};

// ==================== SEVIYE YONETIMI ====================

/**
 * Bos seviye durumu olusturur
 */
export const bosSeviyeDurumuOlustur = (): SeviyeDurumu => ({
  mevcutSeviye: 1,
  toplamPuan: 0,
  mevcutSeviyePuani: 0,
  sonrakiSeviyeKalanPuan: SEVIYE_TANIMLARI[1]?.minPuan || 100,
  rank: SEVIYE_TANIMLARI[0].rank,
  rankIkonu: SEVIYE_TANIMLARI[0].ikon,
});

/**
 * Puana gore seviyeyi hesaplar
 */
export const seviyeHesapla = (toplamPuan: number): SeviyeTanimi => {
  let mevcutSeviye = SEVIYE_TANIMLARI[0];

  for (const seviye of SEVIYE_TANIMLARI) {
    if (toplamPuan >= seviye.minPuan) {
      mevcutSeviye = seviye;
    } else {
      break;
    }
  }

  return mevcutSeviye;
};

/**
 * Bir sonraki seviyeyi bul
 */
export const sonrakiSeviyeyiBul = (
  mevcutSeviye: number
): SeviyeTanimi | null => {
  const sonrakiIndex = SEVIYE_TANIMLARI.findIndex(
    (s) => s.seviye === mevcutSeviye
  ) + 1;
  
  if (sonrakiIndex < SEVIYE_TANIMLARI.length) {
    return SEVIYE_TANIMLARI[sonrakiIndex];
  }
  
  return null;
};

/**
 * Puan ekler ve seviye durumunu gunceller
 */
export const puanEkle = (
  mevcutDurum: SeviyeDurumu,
  eklenecekPuan: number
): { yeniDurum: SeviyeDurumu; seviyeAtlandi: boolean; yeniSeviye: SeviyeTanimi | null } => {
  const yeniToplamPuan = mevcutDurum.toplamPuan + eklenecekPuan;
  const eskiSeviye = mevcutDurum.mevcutSeviye;
  const yeniSeviyeTanimi = seviyeHesapla(yeniToplamPuan);
  
  const sonrakiSeviye = sonrakiSeviyeyiBul(yeniSeviyeTanimi.seviye);
  const sonrakiSeviyeMinPuan = sonrakiSeviye?.minPuan || yeniToplamPuan;

  const yeniDurum: SeviyeDurumu = {
    mevcutSeviye: yeniSeviyeTanimi.seviye,
    toplamPuan: yeniToplamPuan,
    mevcutSeviyePuani: yeniToplamPuan - yeniSeviyeTanimi.minPuan,
    sonrakiSeviyeKalanPuan: sonrakiSeviyeMinPuan - yeniToplamPuan,
    rank: yeniSeviyeTanimi.rank,
    rankIkonu: yeniSeviyeTanimi.ikon,
  };

  const seviyeAtlandi = yeniSeviyeTanimi.seviye > eskiSeviye;

  return {
    yeniDurum,
    seviyeAtlandi,
    yeniSeviye: seviyeAtlandi ? yeniSeviyeTanimi : null,
  };
};

/**
 * Rozet kazanildiginda verilecek puani hesaplar
 */
export const rozetPuaniHesapla = (rozetSeviyesi: RozetSeviyesi): number => {
  return PUAN_DEGERLERI.rozet_kazanildi * ROZET_SEVIYE_CARPANI[rozetSeviyesi];
};

// ==================== KUTLAMA YONETIMI ====================

/**
 * Rozet kazanildi kutlamasi olusturur
 */
export const rozetKutlamasiOlustur = (rozet: RozetTanimi): KutlamaBilgisi => ({
  tip: 'rozet_kazanildi',
  baslik: 'Tebrikler!',
  mesaj: `"${rozet.ad}" rozetini kazandiniz!`,
  ikon: rozet.ikon,
  ekstraVeri: { rozet },
});

/**
 * Hedef tamamlandi kutlamasi olusturur
 */
export const hedefKutlamasiOlustur = (
  hedefGun: number,
  hedefAd: string
): KutlamaBilgisi => ({
  tip: 'hedef_tamamlandi',
  baslik: `${hedefGun} Gun!`,
  mesaj: `"${hedefAd}" hedefini tamamladiniz!`,
  ikon: '🎯',
  ekstraVeri: { hedefGun, hedefAd },
});

/**
 * Seviye atlandi kutlamasi olusturur
 */
export const seviyeKutlamasiOlustur = (
  yeniSeviye: SeviyeTanimi
): KutlamaBilgisi => ({
  tip: 'seviye_atlandi',
  baslik: 'Seviye Atladin!',
  mesaj: `Artik bir "${yeniSeviye.rank}" olarak devam ediyorsunuz!`,
  ikon: yeniSeviye.ikon,
  ekstraVeri: { seviye: yeniSeviye },
});

/**
 * Toparlanma tamamlandi kutlamasi olusturur
 */
export const toparlanmaKutlamasiOlustur = (
  kurtarilanSeri: number
): KutlamaBilgisi => ({
  tip: 'toparlanma_tamamlandi',
  baslik: 'Seri Kurtarildi!',
  mesaj: `${kurtarilanSeri} gunluk serinizi basariyla kurtardiniz!`,
  ikon: '🔄',
  ekstraVeri: { kurtarilanSeri },
});

/**
 * En uzun seri kutlamasi olusturur
 */
export const enUzunSeriKutlamasiOlustur = (seri: number): KutlamaBilgisi => ({
  tip: 'en_uzun_seri',
  baslik: 'Yeni Rekor!',
  mesaj: `${seri} gunluk yeni en uzun seri rekorunuz!`,
  ikon: '🏆',
  ekstraVeri: { seri },
});

// ==================== BIRLESIK ISLEMLER ====================

/**
 * Seri guncellendikten sonra tum kontrolleri yapar
 * Rozetler, seviye, kutlamalar
 */
export interface GuncellemeSonucu {
  yeniKullaniciRozetleri: KullaniciRozeti[];
  yeniSeviyeDurumu: SeviyeDurumu;
  kazanilanRozetler: RozetTanimi[];
  kutlamalar: KutlamaBilgisi[];
  toplamKazanilanPuan: number;
}

export const tamGuncellemeyiYap = (
  seriDurumu: SeriDurumu,
  kullaniciRozetleri: KullaniciRozeti[],
  seviyeDurumu: SeviyeDurumu,
  toplamKilinanNamaz: number,
  toparlanmaSayisi: number,
  mukemmelGunSayisi: number,
  seridenKazanilanPuan: number,
  toparlanmaBasariliMi: boolean
): GuncellemeSonucu => {
  const kutlamalar: KutlamaBilgisi[] = [];
  let yeniRozetler = [...kullaniciRozetleri];
  let toplamPuan = seridenKazanilanPuan;
  const kazanilanRozetler: RozetTanimi[] = [];

  // 1. Seri rozetlerini kontrol et
  const seriRozetleri = seriRozetleriniKontrolEt(
    seriDurumu.mevcutSeri,
    yeniRozetler
  );
  
  for (const rozet of seriRozetleri) {
    const sonuc = rozetiKazan(yeniRozetler, rozet.id);
    yeniRozetler = sonuc.rozetler;
    if (sonuc.kazanilanRozet) {
      kazanilanRozetler.push(sonuc.kazanilanRozet);
      toplamPuan += rozetPuaniHesapla(rozet.seviye);
      kutlamalar.push(rozetKutlamasiOlustur(rozet));
    }
  }

  // 2. Toplam namaz rozetlerini kontrol et
  const toplamRozetleri = toplamNamazRozetleriniKontrolEt(
    toplamKilinanNamaz,
    yeniRozetler
  );
  
  for (const rozet of toplamRozetleri) {
    const sonuc = rozetiKazan(yeniRozetler, rozet.id);
    yeniRozetler = sonuc.rozetler;
    if (sonuc.kazanilanRozet) {
      kazanilanRozetler.push(sonuc.kazanilanRozet);
      toplamPuan += rozetPuaniHesapla(rozet.seviye);
      kutlamalar.push(rozetKutlamasiOlustur(rozet));
    }
  }

  // 3. Ozel rozetleri kontrol et
  const ozelRozetler = ozelRozetleriKontrolEt(
    toparlanmaSayisi,
    mukemmelGunSayisi,
    yeniRozetler
  );
  
  for (const rozet of ozelRozetler) {
    const sonuc = rozetiKazan(yeniRozetler, rozet.id);
    yeniRozetler = sonuc.rozetler;
    if (sonuc.kazanilanRozet) {
      kazanilanRozetler.push(sonuc.kazanilanRozet);
      toplamPuan += rozetPuaniHesapla(rozet.seviye);
      kutlamalar.push(rozetKutlamasiOlustur(rozet));
    }
  }

  // 4. Toparlanma kutlamasi
  if (toparlanmaBasariliMi && seriDurumu.toparlanmaDurumu === null) {
    kutlamalar.push(
      toparlanmaKutlamasiOlustur(seriDurumu.mevcutSeri)
    );
  }

  // 5. Seviye guncelle
  const seviyeSonucu = puanEkle(seviyeDurumu, toplamPuan);
  
  if (seviyeSonucu.seviyeAtlandi && seviyeSonucu.yeniSeviye) {
    kutlamalar.push(seviyeKutlamasiOlustur(seviyeSonucu.yeniSeviye));
  }

  return {
    yeniKullaniciRozetleri: yeniRozetler,
    yeniSeviyeDurumu: seviyeSonucu.yeniDurum,
    kazanilanRozetler,
    kutlamalar,
    toplamKazanilanPuan: toplamPuan,
  };
};


