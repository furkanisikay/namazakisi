/**
 * Seri (Streak) Hesaplayici Servisi
 * Kullanicinin namaz serisi durumunu hesaplar ve yonetir
 * 
 * Temel Kurallar:
 * - Kullanicinin belirlediği esik kadar namaz kilindiysa gun "tam" sayilir
 * - Gun bitis saati ayarlanabilir (varsayilan 05:00)
 * - Seri bozuldugunda toparlanma modu baslar
 * - Toparlanmada 5 gun tam kilinirsa onceki seri kurtarilir
 * - Toparlanmada bir gun bile kacirilirsa sifirlanir
 */

import {
  SeriDurumu,
  SeriAyarlari,
  ToparlanmaDurumu,
  VARSAYILAN_SERI_AYARLARI,
  SERI_HEDEFLERI,
  SeriHedefi,
  OzelGunAyarlari,
} from '../../core/types/SeriTipleri';
import { GunlukNamazlar } from '../../core/types';
import { tarihiISOFormatinaCevir, ISOTarihiDateNesnesiNeCevir } from '../../core/utils/TarihYardimcisi';

/**
 * Seri hesaplama sonucu
 */
export interface SeriHesaplamaSonucu {
  /** Guncel seri durumu */
  seriDurumu: SeriDurumu;
  /** Seri degisti mi */
  seriDegisti: boolean;
  /** Yeni hedef tamamlandi mi */
  yeniHedefTamamlandi: SeriHedefi | null;
  /** Toparlanma basarili oldu mu */
  toparlanmaBasarili: boolean;
  /** Seri bozuldu mu */
  seriBozuldu: boolean;
  /** Kazanilan puan */
  kazanilanPuan: number;
}

/**
 * Bugunun tarihini ISO formatinda dondurur (yyyy-MM-dd)
 */
export const bugunuAl = (): string => {
  return tarihiISOFormatinaCevir(new Date());
};

/**
 * Gun bitis saatine gore namaz gununu hesaplar
 * Ornegin saat 04:00'te islem yapilirsa ve gun bitis saati 05:00 ise,
 * bu islem onceki gune sayilir
 * 
 * @param tarihSaat - Islem tarihi ve saati
 * @param gunBitisSaati - Gun bitis saati (HH:mm formatinda)
 * @returns ISO formatinda tarih
 */
export const namazGunuHesapla = (
  tarihSaat: Date,
  gunBitisSaati: string
): string => {
  const [saat, dakika] = gunBitisSaati.split(':').map(Number);
  const bitisSaatiDakika = saat * 60 + dakika;
  const mevcutDakika = tarihSaat.getHours() * 60 + tarihSaat.getMinutes();

  // Eger mevcut saat, gun bitis saatinden onceyse, onceki gune ait
  if (mevcutDakika < bitisSaatiDakika) {
    const oncekiGun = new Date(tarihSaat);
    oncekiGun.setDate(oncekiGun.getDate() - 1);
    return tarihiISOFormatinaCevir(oncekiGun);
  }

  return tarihiISOFormatinaCevir(tarihSaat);
};

/**
 * Bir tarihin onceki gununu hesaplar
 */
export const oncekiGunuAl = (tarih: string): string => {
  const tarihObj = ISOTarihiDateNesnesiNeCevir(tarih);
  tarihObj.setDate(tarihObj.getDate() - 1);
  return tarihiISOFormatinaCevir(tarihObj);
};

/**
 * Iki tarih arasindaki gun farkini hesaplar
 */
export const gunFarkiniHesapla = (tarih1: string, tarih2: string): number => {
  const t1 = ISOTarihiDateNesnesiNeCevir(tarih1);
  const t2 = ISOTarihiDateNesnesiNeCevir(tarih2);
  
  // Zaman bilesenlerini sifirla
  t1.setHours(0, 0, 0, 0);
  t2.setHours(0, 0, 0, 0);
  
  const fark = Math.abs(t2.getTime() - t1.getTime());
  return Math.round(fark / (1000 * 60 * 60 * 24));
};

/**
 * Bir gunun tam kilinip kilinmadigini kontrol eder
 * 
 * @param gunlukNamazlar - O gune ait namaz verileri
 * @param tamGunEsigi - Tam gun icin gereken minimum namaz sayisi
 * @returns Tam kilinip kilinmadigi
 */
export const gunTamMi = (
  gunlukNamazlar: GunlukNamazlar | null,
  tamGunEsigi: number
): boolean => {
  if (!gunlukNamazlar || !gunlukNamazlar.namazlar) {
    return false;
  }

  const kilinanNamazSayisi = gunlukNamazlar.namazlar.filter(
    (n) => n.tamamlandi
  ).length;

  return kilinanNamazSayisi >= tamGunEsigi;
};

/**
 * Bir gunde kilinin namaz sayisini dondurur
 */
export const kilinanNamazSayisi = (
  gunlukNamazlar: GunlukNamazlar | null
): number => {
  if (!gunlukNamazlar || !gunlukNamazlar.namazlar) {
    return 0;
  }

  return gunlukNamazlar.namazlar.filter((n) => n.tamamlandi).length;
};

/**
 * Bos seri durumu olusturur
 */
export const bosSeriDurumuOlustur = (): SeriDurumu => ({
  mevcutSeri: 0,
  enUzunSeri: 0,
  sonTamGun: null,
  seriBaslangici: null,
  toparlanmaDurumu: null,
  dondurulduMu: false,
  dondurulmaTarihi: null,
  sonGuncelleme: new Date().toISOString(),
});

/**
 * Bir tarihin ozel gun kapsaminda olup olmadigini kontrol eder
 */
export const ozelGunAktifMi = (
  tarih: string,
  ayarlar: OzelGunAyarlari
): boolean => {
  if (!ayarlar.ozelGunModuAktif || !ayarlar.aktifOzelGun) {
    return false;
  }

  const kontrolTarihi = new Date(tarih);
  const baslangic = new Date(ayarlar.aktifOzelGun.baslangicTarihi);
  const bitis = new Date(ayarlar.aktifOzelGun.bitisTarihi);

  // Saat farklarini ortadan kaldirmak icin sadece tarih kismini karsilastiriyoruz
  kontrolTarihi.setHours(0, 0, 0, 0);
  baslangic.setHours(0, 0, 0, 0);
  bitis.setHours(0, 0, 0, 0);

  return kontrolTarihi >= baslangic && kontrolTarihi <= bitis;
};

/**
 * Toparlanma modunu baslatir
 */
export const toparlanmaModunuBaslat = (
  mevcutSeri: number,
  ayarlar: SeriAyarlari
): ToparlanmaDurumu => ({
  tamamlananGun: 0,
  baslangicTarihi: bugunuAl(),
  hedefGunSayisi: ayarlar.toparlanmaGunSayisi,
  oncekiSeri: mevcutSeri,
});

/**
 * Sonraki seri hedefini bul
 */
export const sonrakiHedefiBul = (mevcutSeri: number): SeriHedefi | null => {
  const siralliHedefler = [...SERI_HEDEFLERI].sort((a, b) => a.gun - b.gun);

  for (const hedef of siralliHedefler) {
    if (hedef.gun > mevcutSeri) {
      return hedef;
    }
  }

  return null;
};

/**
 * Tamamlanan hedefi bul (eger yeni tamamlandiysa)
 */
export const tamamlananHedefiBul = (
  eskiSeri: number,
  yeniSeri: number
): SeriHedefi | null => {
  for (const hedef of SERI_HEDEFLERI) {
    if (eskiSeri < hedef.gun && yeniSeri >= hedef.gun) {
      return hedef;
    }
  }
  return null;
};

/**
 * Ana seri hesaplama fonksiyonu
 * Gun sonunda veya namaz durumu degistiginde cagirilir
 * 
 * @param mevcutDurum - Mevcut seri durumu
 * @param bugunNamazlar - Bugunun namaz verileri
 * @param dunNamazlar - Dunun namaz verileri (opsiyonel, seri kontrolu icin)
 * @param ayarlar - Kullanici seri ayarlari
 * @returns Seri hesaplama sonucu
 */
export const seriHesapla = (
  mevcutDurum: SeriDurumu | null,
  bugunNamazlar: GunlukNamazlar | null,
  dunNamazlar: GunlukNamazlar | null,
  ayarlar: SeriAyarlari = VARSAYILAN_SERI_AYARLARI,
  ozelGunAyarlari?: OzelGunAyarlari
): SeriHesaplamaSonucu => {
  // Mevcut durum yoksa bos olustur
  let durum = mevcutDurum || bosSeriDurumuOlustur();

  // Bugun icin namaz gunu hesapla
  const bugun = namazGunuHesapla(new Date(), ayarlar.gunBitisSaati);
  const dun = oncekiGunuAl(bugun);

  // Ozel gun kontrolu
  const bugunOzelGun = ozelGunAyarlari ? ozelGunAktifMi(bugun, ozelGunAyarlari) : false;

  // Baslangic sonucu
  let sonuc: SeriHesaplamaSonucu = {
    seriDurumu: { ...durum },
    seriDegisti: false,
    yeniHedefTamamlandi: null,
    toparlanmaBasarili: false,
    seriBozuldu: false,
    kazanilanPuan: 0,
  };

  // Eger bugun ozel gun ise, seri dondurulur
  if (bugunOzelGun) {
    if (!durum.dondurulduMu) {
      sonuc.seriDurumu = {
        ...durum,
        dondurulduMu: true,
        dondurulmaTarihi: bugun,
        sonGuncelleme: new Date().toISOString(),
      };
      sonuc.seriDegisti = true;
    }
    return sonuc;
  }

  // Ozel gun degilse ve onceden dondurulduyse coz
  if (durum.dondurulduMu) {
    sonuc.seriDurumu = {
      ...durum,
      dondurulduMu: false,
      dondurulmaTarihi: null,
      // Dondurulma bittiginde serinin bozulmamasi icin son tam gunu dunden baslatiyoruz
      sonTamGun: durum.mevcutSeri > 0 ? dun : durum.sonTamGun,
      sonGuncelleme: new Date().toISOString(),
    };
    sonuc.seriDegisti = true;
    // Devam etmek icin mevcut durumu guncellemis olduk, isleme asagidan devam edecek
    // `durum` objesini de guncelle ki sonraki hesaplamalar yeni durumu kullansin
    durum = { ...sonuc.seriDurumu };
  }

  // Bugun tam kilindi mi?
  const bugunTam = gunTamMi(bugunNamazlar, ayarlar.tamGunEsigi);

  // Gun zaten islendiyse tekrar isleme
  if (durum.sonTamGun === bugun) {
    // Bugun zaten tam olarak isaretlendi, degisiklik yok
    return sonuc;
  }

  // ==================== TOPARLANMA MODUNDA MI? ====================
  if (durum.toparlanmaDurumu) {
    if (bugunTam) {
      // Toparlanmada bir gun daha tamamlandi
      const yeniTamamlanan = durum.toparlanmaDurumu.tamamlananGun + 1;

      if (yeniTamamlanan >= durum.toparlanmaDurumu.hedefGunSayisi) {
        // Toparlanma basarili! Onceki seriyi kurtar
        const kurtarilanSeri = durum.toparlanmaDurumu.oncekiSeri;

        sonuc.seriDurumu = {
          mevcutSeri: kurtarilanSeri + 1, // +1 cunku bugun de tam
          enUzunSeri: Math.max(durum.enUzunSeri, kurtarilanSeri + 1),
          sonTamGun: bugun,
          seriBaslangici: durum.seriBaslangici,
          toparlanmaDurumu: null, // Toparlanma bitti
          dondurulduMu: false,
          dondurulmaTarihi: null,
          sonGuncelleme: new Date().toISOString(),
        };

        sonuc.seriDegisti = true;
        sonuc.toparlanmaBasarili = true;
        sonuc.kazanilanPuan = 25; // Toparlanma bonusu

        // Yeni hedef kontrolu
        sonuc.yeniHedefTamamlandi = tamamlananHedefiBul(
          kurtarilanSeri,
          sonuc.seriDurumu.mevcutSeri
        );
      } else {
        // Toparlanma devam ediyor
        sonuc.seriDurumu = {
          ...durum,
          toparlanmaDurumu: {
            ...durum.toparlanmaDurumu,
            tamamlananGun: yeniTamamlanan,
          },
          sonTamGun: bugun,
          sonGuncelleme: new Date().toISOString(),
        };
        sonuc.seriDegisti = true;
        sonuc.kazanilanPuan = 10; // Toparlanma gun puani
      }
    } else {
      // Toparlanma devam ediyor ama bugun henüz tamamlanmadi
      // Eger dünü de kaçırdıysak (arada boşluk varsa) toparlanma bozulur
      const sonTam = durum.sonTamGun;
      if (sonTam && gunFarkiniHesapla(sonTam, bugun) > 1) {
        // Toparlanma bozuldu - tamamen sifirla
        sonuc.seriDurumu = bosSeriDurumuOlustur();
        sonuc.seriDegisti = true;
        sonuc.seriBozuldu = true;
      }
    }

    return sonuc;
  }

  // ==================== NORMAL MOD ====================

  // Dun kontrolu
  const dunTam = gunTamMi(dunNamazlar, ayarlar.tamGunEsigi);
  const sonTamGun = durum.sonTamGun;

  // Son tam gunun dunun tarihi olup olmadigini kontrol et
  const seriDevamEdiyor = sonTamGun === dun;

  if (bugunTam) {
    if (seriDevamEdiyor || durum.mevcutSeri === 0) {
      // Seri devam ediyor veya yeni basladi
      const yeniSeri = durum.mevcutSeri + 1;
      const eskiSeri = durum.mevcutSeri;

      sonuc.seriDurumu = {
        mevcutSeri: yeniSeri,
        enUzunSeri: Math.max(durum.enUzunSeri, yeniSeri),
        sonTamGun: bugun,
        seriBaslangici: durum.seriBaslangici || bugun,
        toparlanmaDurumu: null,
        dondurulduMu: false,
        dondurulmaTarihi: null,
        sonGuncelleme: new Date().toISOString(),
      };

      sonuc.seriDegisti = true;
      sonuc.kazanilanPuan = 10 + yeniSeri; // Tam gun + seri bonusu

      // Yeni hedef kontrolu
      sonuc.yeniHedefTamamlandi = tamamlananHedefiBul(eskiSeri, yeniSeri);
    } else if (sonTamGun && gunFarkiniHesapla(sonTamGun, bugun) > 1) {
      // Arada gun(ler) kacti - toparlanma moduna gec
      // Ama bugun tam kilindigi icin toparlanmanin ilk gunu sayilir

      sonuc.seriDurumu = {
        ...durum,
        toparlanmaDurumu: {
          tamamlananGun: 1, // Bugun ilk gun
          baslangicTarihi: bugun,
          hedefGunSayisi: ayarlar.toparlanmaGunSayisi,
          oncekiSeri: durum.mevcutSeri,
        },
        sonTamGun: bugun,
        sonGuncelleme: new Date().toISOString(),
      };

      sonuc.seriDegisti = true;
      sonuc.seriBozuldu = true;
      sonuc.kazanilanPuan = 5; // Dusuk puan - seri bozuldu ama toparlanma basladi
    }
  } else {
    // Bugun tam kilinmadi
    // Eger dun de kilinmadiysa ve seri varsa, seri bozulmus
    if (durum.mevcutSeri > 0 && sonTamGun && gunFarkiniHesapla(sonTamGun, bugun) > 1) {
      // Seri bozuldu, toparlanma henuz baslamadi
      // Kullanici bugun tam kilarsa toparlanma baslar
      sonuc.seriBozuldu = true;
    }
  }

  return sonuc;
};

/**
 * Mevcut seri durumunu ve bugunun bilgilerini birlestirir
 */
export const seriOzetiniOlustur = (
  seriDurumu: SeriDurumu | null,
  ayarlar: SeriAyarlari = VARSAYILAN_SERI_AYARLARI
): {
  mevcutSeri: number;
  enUzunSeri: number;
  sonrakiHedef: SeriHedefi | null;
  hedefeKalanGun: number;
  toparlanmaModu: boolean;
  toparlanmaIlerleme: { tamamlanan: number; hedef: number } | null;
} => {
  const durum = seriDurumu || bosSeriDurumuOlustur();
  const sonrakiHedef = sonrakiHedefiBul(durum.mevcutSeri);

  return {
    mevcutSeri: durum.mevcutSeri,
    enUzunSeri: durum.enUzunSeri,
    sonrakiHedef,
    hedefeKalanGun: sonrakiHedef ? sonrakiHedef.gun - durum.mevcutSeri : 0,
    toparlanmaModu: !!durum.toparlanmaDurumu,
    toparlanmaIlerleme: durum.toparlanmaDurumu
      ? {
        tamamlanan: durum.toparlanmaDurumu.tamamlananGun,
        hedef: durum.toparlanmaDurumu.hedefGunSayisi,
      }
      : null,
  };
};


