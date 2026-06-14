/**
 * Gun-bazli local namaz verisi servisi (Faz 1).
 *
 * Veriler artik tek buyuk JSON blob'unda (NAMAZ_VERILERI) DEGIL, her gun icin ayri anahtarda
 * tutulur: `namaz_gun_<tarih>` -> { [namazAdi]: boolean }. Bu sayede tek namaz isaretlemek
 * tum gecmisi degil yalniz o gunu okur/yazar (O(n) -> O(1)).
 *
 * GUVENLI GOC: eski tek-blob, ilk erisimde gun-anahtarlarina TASINIR ama SILINMEZ (veri-kaybi
 * riski yok; bayatlar, yok sayilir). Goc idempotenttir (atomik skip-if-exists) ve bir kez calisir.
 *
 * Esyamanlilik: tum yazimlar Depolama'nin anahtar-bazli atomik kuyrugundan gecer (lost-update yok).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Namaz,
  GunlukNamazlar,
  LocalNamazVerileri,
  ApiYanit,
  VakitAdi,
} from '../../core/types';
import {
  NAMAZ_ISIMLERI,
  NamazAdi,
  DEPOLAMA_ANAHTARLARI,
} from '../../core/constants/UygulamaSabitleri';
import { gunEkle } from '../../core/utils/TarihYardimcisi';
import { Logger } from '../../core/utils/Logger';
import { Depolama } from './Depolama';

/** Tek bir gunun verisi: namazAdi -> kilindi mi. */
type GunVerisi = Record<string, boolean>;

const gunAnahtari = (tarih: string): string =>
  `${DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK}${tarih}`;

const anahtardanTarih = (anahtar: string): string =>
  anahtar.slice(DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK.length);

/**
 * Eski tek-blob verisini gun-anahtarlarina tasir (bir kez). Idempotent ve veri-kaybi-korumali:
 * - Gun-anahtari zaten varsa EZMEZ (skip-if-exists, atomik) -> goc-sonrasi yeni veriyi bozmaz.
 * - Eski blob SILINMEZ (guvenlik).
 * - Bayrak ile bir kez calisir; bayrak yoksa (kismi cokme dahil) tekrar guvenle calisabilir.
 */
const migrasyonuYurut = async (): Promise<void> => {
  const tamam = await Depolama.ham(DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_MIGRASYON);
  if (tamam === '1') return;

  const eski = await Depolama.oku<LocalNamazVerileri>(
    DEPOLAMA_ANAHTARLARI.NAMAZ_VERILERI
  );
  if (eski) {
    for (const [tarih, gun] of Object.entries(eski)) {
      // Atomik skip-if-exists: mevcut gun verisi varsa KORU (yeni isaretleri ezme).
      await Depolama.guncelle<GunVerisi>(gunAnahtari(tarih), (mevcut) =>
        mevcut ?? (gun as GunVerisi)
      );
    }
  }
  await Depolama.hamYaz(DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_MIGRASYON, '1');
};

// Bellek-ici IN-FLIGHT kilidi: eszamanli cagrilar tek gocu paylasir (her cagri blob okuyup
// donguyu tekrar kosmasin -> gecmisi cok kullanicida perf darbogazini onler). finally'de
// temizlenir => KALICI onbellek YOK: goc bitince sonraki cagri bayragi diskten yeniden okur
// (clear sonrasi testler/uygulama tekrar goc edebilir). Capraz-kontaminasyon olmaz.
let migrasyonKilidi: Promise<void> | null = null;

const migrasyonyiGarantile = async (): Promise<void> => {
  if (migrasyonKilidi) return migrasyonKilidi;
  migrasyonKilidi = migrasyonuYurut();
  try {
    await migrasyonKilidi;
  } finally {
    migrasyonKilidi = null;
  }
};

/** Bir gunun verisini getirir (yoksa bos). */
const gunVerisiniAl = async (tarih: string): Promise<GunVerisi> => {
  const veri = await Depolama.oku<GunVerisi>(gunAnahtari(tarih));
  return veri ?? {};
};

const gunlukNamazlariOlustur = (tarih: string, gun: GunVerisi): GunlukNamazlar => ({
  tarih,
  namazlar: NAMAZ_ISIMLERI.map((namazAdi) => ({
    namazAdi,
    tamamlandi: gun[namazAdi] || false,
    tarih,
  })) as Namaz[],
});

/**
 * cogunuOku'dan gelen HAM gun-anahtari degerini guvenli sekilde GunVerisi'ne cozer.
 * JSON.parse("null") -> null, JSON.parse("42") -> sayi gibi nesne-disi/null sonuclar
 * downstream'de (gun[namazAdi] / Object.entries(gun)) cokmeye yol acardi; bunlari {} yapar.
 * (Depolama.oku zaten guvenli; bu yalniz multiGet'in ham-string yolu icindir.)
 */
const hamGunVerisiniCoz = (ham: string | null | undefined): GunVerisi => {
  if (!ham) return {};
  try {
    const cozulen: unknown = JSON.parse(ham);
    return cozulen !== null && typeof cozulen === 'object'
      ? (cozulen as GunVerisi)
      : {};
  } catch {
    return {};
  }
};

/**
 * Belirli bir tarihe ait namazlari getirir
 */
export const localNamazlariGetir = async (
  tarih: string
): Promise<ApiYanit<GunlukNamazlar>> => {
  try {
    await migrasyonyiGarantile();
    const gun = await gunVerisiniAl(tarih);
    return { basarili: true, veri: gunlukNamazlariOlustur(tarih, gun) };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Namaz durumunu gunceller (yalniz o gunun anahtarini, atomik)
 */
export const localNamazDurumunuGuncelle = async (
  tarih: string,
  namazAdi: NamazAdi,
  tamamlandi: boolean
): Promise<ApiYanit<void>> => {
  try {
    await migrasyonyiGarantile();
    await Depolama.guncelle<GunVerisi>(gunAnahtari(tarih), (mevcut) => ({
      ...(mevcut ?? {}),
      [namazAdi]: tamamlandi,
    }));
    return { basarili: true };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Tum namazlari toplu olarak gunceller (gunu tamamen yeniden yazar)
 */
export const localTumNamazlariGuncelle = async (
  tarih: string,
  tamamlandi: boolean
): Promise<ApiYanit<void>> => {
  try {
    await migrasyonyiGarantile();
    const gun: GunVerisi = {};
    NAMAZ_ISIMLERI.forEach((namazAdi) => {
      gun[namazAdi] = tamamlandi;
    });
    await Depolama.yaz(gunAnahtari(tarih), gun);
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
    await migrasyonyiGarantile();
    // Aralikitaki tum gunleri TEK batch (multiGet) ile oku -> O(aralik) sirali round-trip yerine tek tur.
    const tarihler: string[] = [];
    let mevcutTarih = baslangicTarihi;
    while (mevcutTarih <= bitisTarihi) {
      tarihler.push(mevcutTarih);
      mevcutTarih = gunEkle(mevcutTarih, 1);
    }
    const ciftler = await Depolama.cogunuOku(tarihler.map(gunAnahtari));
    const hamHarita = new Map(ciftler);
    const sonuc: GunlukNamazlar[] = tarihler.map((tarih) => {
      const gun = hamGunVerisiniCoz(hamHarita.get(gunAnahtari(tarih)));
      return gunlukNamazlariOlustur(tarih, gun);
    });
    return { basarili: true, veri: sonuc };
  } catch (error) {
    return {
      basarili: false,
      hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
};

/**
 * Tum local verileri senkronizasyon/turetme formatinda dondurur.
 * (Puan reconcile bunu kullanir — davranis korunur: yalniz gercek NAMAZ_ISIMLERI dahil.)
 */
export const localVerileriSenkronizasyonIcinAl = async (): Promise<
  { tarih: string; namazAdi: NamazAdi; tamamlandi: boolean }[]
> => {
  await migrasyonyiGarantile();
  const anahtarlar = await Depolama.onEkiOlanAnahtarlar(
    DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK
  );
  const ciftler = await Depolama.cogunuOku(anahtarlar);
  const sonuc: { tarih: string; namazAdi: NamazAdi; tamamlandi: boolean }[] = [];

  for (const [anahtar, ham] of ciftler) {
    const gun = hamGunVerisiniCoz(ham);
    const tarih = anahtardanTarih(anahtar);
    Object.entries(gun).forEach(([namazAdi, tamamlandi]) => {
      if ((NAMAZ_ISIMLERI as readonly string[]).includes(namazAdi)) {
        sonuc.push({ tarih, namazAdi: namazAdi as NamazAdi, tamamlandi });
      }
    });
  }

  return sonuc;
};

/**
 * Tum local namaz verilerini temizler (tum gun-anahtarlari + eski blob)
 */
export const localVerileriTemizle = async (): Promise<void> => {
  // Once gocu tamamla: askida kalan bir gocun, silme sonrasi bayat blob'dan veri "diriltmesini"
  // engeller (goc bitince bayrak set olur, sonraki goc calismaz).
  await migrasyonyiGarantile();
  const anahtarlar = await Depolama.onEkiOlanAnahtarlar(
    DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK
  );
  await Depolama.cogunuSil(anahtarlar);
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
