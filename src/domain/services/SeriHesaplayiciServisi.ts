/**
 * Seri (Streak) Hesaplayici Servisi
 * Kullanicinin namaz serisi durumunu hesaplar ve yonetir
 * 
 * Temel Kurallar:
 * - Kullanicinin belirlediği esik kadar namaz kilindiysa gun "tam" sayilir
 * - Seri gunu ERTESI IMSAK'ta biter; imsak kaynagi yoksa 05:00'e duser
 *   (bkz. `namazGunuHesapla`)
 * - Seri bozuldugunda toparlanma modu baslar
 * - Toparlanmada `toparlanmaGunSayisi` (varsayilan 2) gun tam kilinirsa onceki seri kurtarilir
 * - Toparlanmada bir gun bile kacirilirsa sifirlanir
 */

import {
  SeriDurumu,
  SeriAyarlari,
  ToparlanmaDurumu,
  BugunOncesiSnapshot,
  VARSAYILAN_SERI_AYARLARI,
  SERI_HEDEFLERI,
  SeriHedefi,
  OzelGunAyarlari,
} from '../../core/types/SeriTipleri';
import { GunlukNamazlar } from '../../core/types';
import { tarihiISOFormatinaCevir, ISOTarihiDateNesnesiNeCevir } from '../../core/utils/TarihYardimcisi';
import { gunTamMi as gunTamMiSaf } from '../../core/seri/gunTamMi';
import { NamazVaktiHesaplayiciServisi } from './NamazVaktiHesaplayiciServisi';

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
  /**
   * Ayni-gun geri-alimi BUGUN tamamlanmis bir toparlanmayi geri sardi mi.
   *
   * `toparlanmaSayisi` olay-tetiklemeli KALICI bir sayactir (rozet kosulu: 3 kez
   * toparlanma) ve `toparlanmaBasarili` her tetiklendiginde artar. Geri-alim
   * toparlanmayi yeniden tamamlanabilir hale getirdigi icin, geri sarma da
   * bildirilmezse kullanici son namazi isaretle/geri-al yaparak sayaci sinirsizca
   * sisirebilir (AGENTS.md: "olay-tetiklemeli sayac artirma" tuzagi).
   */
  toparlanmaGeriAlindi: boolean;
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
 * Imsak kaynagi hazir olmadiginda (konum yok / hesaplayici yapilandirilmamis)
 * kullanilan SABIT gun siniri. Eski (imsak oncesi) davranisin birebir aynisi.
 */
export const VARSAYILAN_GUN_SINIRI_SAATI = '05:00';

/**
 * Verilen TAKVIM GUNUNUN imsak (fajr) vaktini dondurur; kaynak hazir degilse `null`.
 * Enjekte edilebilir olmasi testleri deterministik kilar (gercek konum/mevsim gerekmez).
 */
export type ImsakSaglayici = (tarih: Date) => Date | null;

/**
 * Uretim saglayicisi: `NamazVaktiHesaplayiciServisi`.
 *
 * NEDEN BU SERVIS (`KonumYoneticiServisi` DEGIL): `KonumYoneticiServisi.durum.koordinatlar`
 * uretimde HIC doldurulmuyor (`koordinatlarAyarla`/`durumYukle` yalnizca testlerden
 * cagriliyor) -> ona baglansaydik gun siniri sahada DAIMA 05:00 fallback'inde kalir,
 * duzeltme sessizce olu dogardi. Gercekten hidrate edilen kaynak `NamazVaktiHesaplayiciServisi`
 * (`App.tsx` acilis zinciri, `AnaSayfa`, `KonumDegisikligiServisi.konumDegistiUygula`).
 *
 * `{lat:0,lng:0}` bu projede "henuz yapilandirilmadi" nobetcisidir (AGENTS.md) -> imsak
 * hesaplanmaz; aksi halde Gine Korfezi'ne gore ~08:00'lik bir gun siniri olusurdu.
 */
export const uygulamaImsakSaglayici: ImsakSaglayici = (tarih) => {
  const servis = NamazVaktiHesaplayiciServisi.getInstance();
  const konfig = servis.getKonfig();
  if (!konfig || (konfig.latitude === 0 && konfig.longitude === 0)) {
    return null;
  }
  return servis.getGunlukVakitler(tarih)?.imsak ?? null;
};

/** 'HH:mm' -> gun ici dakika. Bozuk girdide varsayilan sinira duser. */
const saatMetniniDakikayaCevir = (saatMetni: string): number => {
  const [saat, dakika] = saatMetni.split(':').map(Number);
  if (!Number.isFinite(saat) || !Number.isFinite(dakika)) {
    const [vSaat, vDakika] = VARSAYILAN_GUN_SINIRI_SAATI.split(':').map(Number);
    return vSaat * 60 + vDakika;
  }
  return saat * 60 + dakika;
};

/**
 * Saglayicidan gelen imsak degerini DOGRULAR; guvenilmezse `null` doner (-> sabit sinir).
 * Saglayici uc bir konumda baska bir takvim gunune dusen bir deger dondurebilir; o zaman
 * saat:dakika okumasi anlamsizlasir.
 */
const guvenliImsakAl = (tarihSaat: Date, imsakSaglayici: ImsakSaglayici): Date | null => {
  let imsak: Date | null;
  try {
    imsak = imsakSaglayici(tarihSaat);
  } catch {
    return null;
  }

  if (!imsak || Number.isNaN(imsak.getTime())) {
    return null;
  }
  if (
    imsak.getFullYear() !== tarihSaat.getFullYear() ||
    imsak.getMonth() !== tarihSaat.getMonth() ||
    imsak.getDate() !== tarihSaat.getDate()
  ) {
    return null;
  }
  return imsak;
};

/**
 * O anki gun sinirini (gun ici dakika cinsinden) dondurur.
 * TEK KAYNAK: seri gunu ertesi imsakta biter; imsak yoksa `gunBitisSaati`.
 */
export const gunSiniriDakikasiniHesapla = (
  tarihSaat: Date,
  gunBitisSaati: string = VARSAYILAN_GUN_SINIRI_SAATI,
  imsakSaglayici: ImsakSaglayici = uygulamaImsakSaglayici
): number => {
  const imsak = guvenliImsakAl(tarihSaat, imsakSaglayici);
  if (imsak) {
    return imsak.getHours() * 60 + imsak.getMinutes();
  }
  return saatMetniniDakikayaCevir(gunBitisSaati);
};

/**
 * Gun sinirina gore namaz gununu hesaplar.
 *
 * Seri gunu ERTESI IMSAK'ta biter: imsaktan onceki her islem ONCEKI gune sayilir.
 * Kayma CIFT YONLUDUR — yazin imsak (~03:30) 05:00'ten once oldugu icin sinir GERIYE
 * (04:00 artik BUGUNE sayilir), kisin (~06:40) sonra oldugu icin ILERI kayar
 * (05:30 artik DUNE sayilir). Imsak kaynagi hazir degilse `gunBitisSaati` (05:00)
 * fallback'i uygulanir ve eski davranis birebir korunur.
 *
 * Kalici veri BOZULMAZ: `sonTamGun`/`bugunOncesi.tarih` duz ISO tarih dizeleridir;
 * sinir kaydiginda eski bir snapshot en fazla "bayat" sayilir ve `bugunOncesi.tarih === bugun`
 * kapisinda dusurulur (uygulanmaz).
 *
 * @param tarihSaat - Islem tarihi ve saati
 * @param gunBitisSaati - Imsak kaynagi yokken kullanilan sabit sinir (HH:mm)
 * @param imsakSaglayici - Imsak kaynagi (testte enjekte edilir)
 * @returns ISO formatinda tarih
 */
export const namazGunuHesapla = (
  tarihSaat: Date,
  gunBitisSaati: string = VARSAYILAN_GUN_SINIRI_SAATI,
  imsakSaglayici: ImsakSaglayici = uygulamaImsakSaglayici
): string => {
  const sinirDakika = gunSiniriDakikasiniHesapla(tarihSaat, gunBitisSaati, imsakSaglayici);
  const mevcutDakika = tarihSaat.getHours() * 60 + tarihSaat.getMinutes();

  // Sinirdan onceyse (imsak henuz girmedi) onceki gune ait
  if (mevcutDakika < sinirDakika) {
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
 * Esik kurali `src/core/seri/gunTamMi.ts`'de SAF olarak tutulur (seri motoru
 * ve gok takimyildizi haritasi ayni kurali kullanir, kopyalanmaz); burada
 * yalnizca gunluk kayittan kilinan sayi cikarilip oraya delege edilir.
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

  return gunTamMiSaf(kilinanNamazSayisi, tamGunEsigi);
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
 * Bugun YENI tam sayildiysa ayni-gun geri-alimi icin snapshot'i ve bugun verilen bonusu
 * sonuca yazar.
 *
 * HEM toparlanma HEM normal mod yolunda cagrilmali: yalnizca birinde cagrilirsa otekinde
 * ONCEKI GUNDEN kalan snapshot state'te yasamaya devam eder ve ayni-gun geri-alimi yanlis
 * gune sarar (yasanmis bug: toparlanmanin 2. gunu geri alinip tekrar isaretlenince
 * ilerleme 2/N -> 1/N'e dusuyordu).
 */
const bugunSnapshotunuYaz = (
  sonuc: SeriHesaplamaSonucu,
  bugun: string,
  snapshot: BugunOncesiSnapshot
): SeriHesaplamaSonucu => {
  if (!sonuc.seriDegisti || sonuc.seriDurumu.sonTamGun !== bugun) {
    return sonuc;
  }

  return {
    ...sonuc,
    seriDurumu: {
      ...sonuc.seriDurumu,
      bugunOncesi: snapshot,
      bugunKazanilanPuan: sonuc.kazanilanPuan,
    },
  };
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
  const sonuc: SeriHesaplamaSonucu = {
    seriDurumu: { ...durum },
    seriDegisti: false,
    yeniHedefTamamlandi: null,
    toparlanmaBasarili: false,
    toparlanmaGeriAlindi: false,
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

  // Bugun "tam" sayilmadan ONCEki durum (Bug #4: ayni-gun geri-alimi icin saklanir)
  const bugunOncesiSnapshot: BugunOncesiSnapshot = {
    tarih: bugun,
    mevcutSeri: durum.mevcutSeri,
    enUzunSeri: durum.enUzunSeri,
    sonTamGun: durum.sonTamGun,
    seriBaslangici: durum.seriBaslangici,
    toparlanmaDurumu: durum.toparlanmaDurumu,
    dondurulduMu: durum.dondurulduMu,
    dondurulmaTarihi: durum.dondurulmaTarihi,
  };

  // Bugun zaten islenmisse:
  if (durum.sonTamGun === bugun) {
    if (bugunTam) {
      // Hala tam -> degisiklik yok (idempotent)
      return sonuc;
    }
    // Bug #4: bugun artik tam DEGIL -> bugunu geri al (snapshot'tan once-bugun durumuna don)
    // KRITIK: snapshot yalnizca BUGUNE aitse uygulanir. Baska bir gunun snapshot'i
    // (ornegin toparlanmanin 1. gununden kalan) uygulanirsa toparlanma ilerlemesi
    // sifirlanir ve tekrar isaretleyince yepyeni bir toparlanma baslar (1/N).
    if (durum.bugunOncesi && durum.bugunOncesi.tarih === bugun) {
      sonuc.seriDurumu = {
        ...durum.bugunOncesi,
        bugunOncesi: null,
        bugunKazanilanPuan: null,
        sonGuncelleme: new Date().toISOString(),
      };
      sonuc.seriDegisti = true;
      // Faz 1b: bugun verilen seri/gun bonusunu da geri al (negatif kazanilanPuan).
      sonuc.kazanilanPuan = -(durum.bugunKazanilanPuan ?? 0);
      // Bugun BITEN bir toparlanma geri sariliyorsa (snapshot toparlanmadaydi, guncel
      // durum toparlanmayi bitirmisti) `toparlanmaSayisi` da geri alinmali; aksi halde
      // isaretle/geri-al dongusu sayaci ve `toparlanma_ustasi` rozetini sisirir.
      sonuc.toparlanmaGeriAlindi =
        durum.toparlanmaDurumu === null && durum.bugunOncesi.toparlanmaDurumu !== null;
    }
    return sonuc;
  }

  // ==================== TOPARLANMA MODUNDA MI? ====================
  if (durum.toparlanmaDurumu) {
    if (bugunTam) {
      // Toparlanmada bir gun daha tamamlandi
      const yeniTamamlanan = durum.toparlanmaDurumu.tamamlananGun + 1;

      if (yeniTamamlanan >= durum.toparlanmaDurumu.hedefGunSayisi) {
        // Toparlanma basarili! Onceki seriyi kurtar.
        // Toparlanmada kilinan TUM gunler serinin uzerine eklenir (yalniz bugun degil):
        // kullanici o gunleri de gercekten tam kildi, seri kesintisiz devam etmis sayilir.
        const kurtarilanSeri = durum.toparlanmaDurumu.oncekiSeri;
        const yeniSeri = kurtarilanSeri + yeniTamamlanan;

        sonuc.seriDurumu = {
          mevcutSeri: yeniSeri,
          enUzunSeri: Math.max(durum.enUzunSeri, yeniSeri),
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

    // Toparlanma yolunda da snapshot tazelenmeli (aksi halde onceki gunun snapshot'i kalir)
    return bugunSnapshotunuYaz(sonuc, bugun, bugunOncesiSnapshot);
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
      // Arada gun(ler) kacti - seri bozuldu
      if (durum.mevcutSeri >= 7) {
        // 7+ gunluk seri: toparlanma moduna gec
        // Bugun tam kilindigi icin toparlanmanin ilk gunu sayilir
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
        sonuc.kazanilanPuan = 5; // Dusuk puan - seri bozuldu ama toparlanma basladi
      } else {
        // 7 gunun altinda seri: toparlanma yok, sifirdan yeni seri baslat
        sonuc.seriDurumu = {
          mevcutSeri: 1,
          enUzunSeri: Math.max(durum.enUzunSeri, 1),
          sonTamGun: bugun,
          seriBaslangici: bugun,
          toparlanmaDurumu: null,
          dondurulduMu: false,
          dondurulmaTarihi: null,
          sonGuncelleme: new Date().toISOString(),
        };
        sonuc.kazanilanPuan = 10;
      }
      sonuc.seriDegisti = true;
      sonuc.seriBozuldu = true;
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

  // Bug #4 + Faz 1b: Bugun YENI tam sayildiysa onceki-durum snapshot'ini ve bugun verilen
  // bonusu sakla (ayni-gun geri-alimi hem seriyi hem bonusu geri alabilsin).
  return bugunSnapshotunuYaz(sonuc, bugun, bugunOncesiSnapshot);
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


