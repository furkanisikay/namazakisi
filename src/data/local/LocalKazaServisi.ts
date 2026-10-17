/**
 * Kaza Defteri 2.0 — depolama katmanı (değişmez hareket defteri).
 *
 * Anahtarlar AYLIK: `kaza_hareket_<YYYY-MM>` (hareketin `zaman`ının UTC ayı).
 * Otomatik ekleme yılda yüzlerce hareket üretebilir; tek JSON anahtar Android'de
 * satır boyutu sınırına yıllar içinde yaklaşırdı.
 *
 * TEK YAZICI: `hareketleriEkle` — `Depolama.hamGuncelle` atomik kuyruğunda
 * "kimlik yoksa ekle" (G-Set birleşimi). Ekran, bildirim "Kazaya ekle"
 * (headless), sihirbaz, temizlik, göç, yedek/eşitleme aynı kapıdan geçer.
 *
 * DAYANIKLILIK (AGENTS.md kaza dersi): okuma ASLA reddetmez. Bozuk bir ay
 * anahtarı atlanır, ÜZERİNE YAZILMAZ (kurtarma için diskte kalır), Logger'a
 * yazılır ve sonuçta raporlanır; o aya düşen yeni hareketler `_k<n>` ekli
 * kardeş anahtara yazılır. Eski `KAZA_DURUMU` göçten sonra da SİLİNMEZ.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI, KAZA_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import type { ApiYanit } from '../../core/types';
import { Depolama } from './Depolama';
import {
  bilinmeyenHareketMi,
  bilinmeyenleriBirlestir,
  hareketAyi,
  hareketKimligi,
  hareketNormalize,
  hareketleriAyristir,
  hareketleriBirlestir,
  isoGunMu,
  referansOlustur,
  type BilinmeyenHareket,
  type KazaHareketi,
  type KazaVakti,
} from '../../core/kaza/kazaHareketi';
import { defterDoluMu, eskiDurumdanHareketler } from '../../core/kaza/kazaDefteriHesabi';

const ONEK = DEPOLAMA_ANAHTARLARI.KAZA_HAREKET_ONEK;
const KURTARMA_DENEMESI = 5;

// ==================== AYARLAR ====================

/** Defter ayarları (otomatik ekleme DEFTERDEDİR, burada değil). */
export interface KazaAyarlari {
  gunlukHedef: number;
  toplamGizleMi: boolean;
}

export const VARSAYILAN_KAZA_AYARLARI: KazaAyarlari = {
  gunlukHedef: KAZA_SABITLERI.VARSAYILAN_GUNLUK_HEDEF,
  toplamGizleMi: false,
};

export function kazaAyarlariniNormalize(ham: unknown): KazaAyarlari {
  if (!ham || typeof ham !== 'object' || Array.isArray(ham)) return { ...VARSAYILAN_KAZA_AYARLARI };
  const k = ham as Record<string, unknown>;
  const hedef = k.gunlukHedef;
  return {
    gunlukHedef:
      typeof hedef === 'number' && Number.isFinite(hedef) && hedef >= 0
        ? Math.min(Math.floor(hedef), 10_000)
        : VARSAYILAN_KAZA_AYARLARI.gunlukHedef,
    toplamGizleMi: k.toplamGizleMi === true,
  };
}

export async function ayarlariOku(): Promise<KazaAyarlari> {
  try {
    return kazaAyarlariniNormalize(await Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.KAZA_AYARLARI));
  } catch {
    return { ...VARSAYILAN_KAZA_AYARLARI };
  }
}

export async function ayarlariGuncelle(donustur: (m: KazaAyarlari) => KazaAyarlari): Promise<KazaAyarlari> {
  return Depolama.guncelle<KazaAyarlari>(DEPOLAMA_ANAHTARLARI.KAZA_AYARLARI, (ham) =>
    kazaAyarlariniNormalize(donustur(kazaAyarlariniNormalize(ham)))
  );
}

// ==================== CİHAZ KİMLİĞİ ====================

let cihazOnbellegi: string | null = null;
/** `yeniHareketTemeli`'nin son verdiği an (süreç içi kesin artan zaman). */
let sonHareketMs = 0;

/** Kısa, kalıcı, cihaza özgü kimlik (yedeklenmez). Okunamazsa geçici bir kimlik. */
export async function cihazKimligiAl(): Promise<string> {
  if (cihazOnbellegi) return cihazOnbellegi;
  try {
    const mevcut = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.CIHAZ_KIMLIGI);
    if (mevcut && /^[0-9a-z]{4,16}$/.test(mevcut)) {
      cihazOnbellegi = mevcut;
      return mevcut;
    }
    let yeni = '';
    for (let i = 0; i < 6; i++) yeni += Math.floor(Math.random() * 36).toString(36);
    await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.CIHAZ_KIMLIGI, yeni);
    cihazOnbellegi = yeni;
    return yeni;
  } catch {
    return 'gecici';
  }
}

/** Yalnız testler: bellek-içi önbellekleri sıfırlar. */
export function _testIcinSifirla(): void {
  cihazOnbellegi = null;
  gocKilidi = null;
  sonHareketMs = 0;
}

// ==================== OKUMA ====================

interface AyIcerigi {
  taninan: KazaHareketi[];
  /** Bu sürümün çözemediği (yeni sürümden) öğeler — yazarken GERİ KONUR. */
  bilinmeyen: BilinmeyenHareket[];
}

/** Ham ay değerini çözer: `null` = BOZUK (dizi-dışı ya da ayrıştırılamaz). */
function hamAyiCoz(ham: string | null): AyIcerigi | null {
  if (ham === null) return { taninan: [], bilinmeyen: [] };
  let cozulen: unknown;
  try {
    cozulen = JSON.parse(ham);
  } catch {
    return null;
  }
  if (!Array.isArray(cozulen)) return null;
  return hareketleriAyristir(cozulen);
}

export interface DefterOkumasi {
  hareketler: KazaHareketi[];
  /**
   * Yeni bir sürümün yazdığı, bu sürümün çözemediği öğeler (ileri uyumluluk).
   * Hesaba girmez; yedek/eşitleme yüküne AYNEN konur.
   */
  bilinmeyenler: BilinmeyenHareket[];
  /** Okunamayan (bozuk) ay anahtarları — ekran uyarı bandı gösterir. */
  bozukAylar: string[];
  /** Eski KAZA_DURUMU okunamadığı için göç tamamlanamadı. */
  eskiKayitBozuk: boolean;
}

async function hamDefteriOku(): Promise<Omit<DefterOkumasi, 'eskiKayitBozuk'>> {
  const anahtarlar = await Depolama.onEkiOlanAnahtarlar(ONEK);
  const ciftler = await Depolama.cogunuOku(anahtarlar);
  const bozukAylar: string[] = [];
  const listeler: KazaHareketi[][] = [];
  const bilinmeyenListeler: BilinmeyenHareket[][] = [];
  for (const [anahtar, ham] of ciftler) {
    const ay = hamAyiCoz(ham);
    if (ay === null) {
      bozukAylar.push(anahtar);
      Logger.warn('LocalKazaServisi', 'Kaza ayı okunamadı, atlanıyor (diskte korunuyor)', {
        anahtar,
        uzunluk: ham?.length ?? 0,
      });
      continue;
    }
    listeler.push(ay.taninan);
    bilinmeyenListeler.push(ay.bilinmeyen);
  }
  const hareketler = hareketleriBirlestir(...listeler);
  const taninanIdler = new Set(hareketler.map((h) => h.id));
  return {
    hareketler,
    bilinmeyenler: bilinmeyenleriBirlestir(...bilinmeyenListeler).filter((b) => !taninanIdler.has(b.id)),
    bozukAylar,
  };
}

/** Defterin tamamı (göç önce garanti edilir). ASLA reddetmez. */
export async function defteriOku(): Promise<DefterOkumasi> {
  let eskiKayitBozuk = false;
  try {
    eskiKayitBozuk = (await gocuGarantile()).eskiKayitBozuk;
  } catch (e) {
    Logger.error('LocalKazaServisi', 'Kaza göçü çalıştırılamadı', e);
  }
  try {
    return { ...(await hamDefteriOku()), eskiKayitBozuk };
  } catch (e) {
    Logger.error('LocalKazaServisi', 'Kaza defteri okunamadı, boş defterle devam ediliyor', e);
    return { hareketler: [], bilinmeyenler: [], bozukAylar: [], eskiKayitBozuk };
  }
}

// ==================== YAZMA (TEK KAPI) ====================

/**
 * Hareketleri deftere ekler (kimlik zaten varsa YAZILMAZ). Bu sürümün
 * çözemediği ama yapısal olarak geçerli öğe (yedekten/buluttan gelen yeni
 * sürüm hareketi) HAM olarak korunur; yapısız değer atlanır. Mevcut ayın
 * bilinmeyen öğeleri de yazarken GERİ KONUR (ileri uyumluluk). Bozuk ay
 * anahtarına dokunulmaz → kardeş anahtar. Fırlatabilir (çağıran reddeder).
 */
export async function hareketleriEkle(liste: readonly unknown[]): Promise<number> {
  const aylar = new Map<string, AyIcerigi>();
  const ayGrubu = (ay: string): AyIcerigi => {
    let g = aylar.get(ay);
    if (!g) {
      g = { taninan: [], bilinmeyen: [] };
      aylar.set(ay, g);
    }
    return g;
  };
  for (const ham of liste) {
    const h = hareketNormalize(ham);
    if (h) ayGrubu(hareketAyi(h)).taninan.push(h);
    else if (bilinmeyenHareketMi(ham)) ayGrubu(hareketAyi(ham)).bilinmeyen.push(ham);
    else Logger.warn('LocalKazaServisi', 'Geçersiz kaza hareketi atlandı', { tur: typeof ham });
  }
  let eklenen = 0;
  for (const [ay, grup] of aylar) {
    let yazildi = false;
    for (let deneme = 0; deneme <= KURTARMA_DENEMESI && !yazildi; deneme++) {
      const anahtar = deneme === 0 ? `${ONEK}${ay}` : `${ONEK}${ay}_k${deneme}`;
      let bozuk = false;
      await Depolama.hamGuncelle(anahtar, (ham) => {
        const mevcut = hamAyiCoz(ham);
        if (mevcut === null) {
          bozuk = true;
          return null; // bozuk kaydın ÜSTÜNE YAZMA
        }
        const birlesik = hareketleriBirlestir(mevcut.taninan, grup.taninan);
        const taninanIdler = new Set(birlesik.map((x) => x.id));
        const bilinmeyen = bilinmeyenleriBirlestir(mevcut.bilinmeyen, grup.bilinmeyen).filter(
          (b) => !taninanIdler.has(b.id)
        );
        const yeni = birlesik.length + bilinmeyen.length - mevcut.taninan.length - mevcut.bilinmeyen.length;
        eklenen += Math.max(0, yeni);
        return yeni > 0 || ham === null ? JSON.stringify([...birlesik, ...bilinmeyen]) : null;
      });
      if (bozuk) {
        Logger.warn('LocalKazaServisi', 'Kaza ayı bozuk, kardeş anahtara yazılıyor', { anahtar });
        continue;
      }
      yazildi = true;
    }
    if (!yazildi) throw new Error('Kaza defterine yazılamadı');
  }
  return eklenen;
}


/**
 * Yeni bir hareketin ortak alanları (zaman + cihaz + kimlik).
 *
 * Saat verilmezse zaman süreç içinde KESİN ARTANDIR: fold aynı `zaman`daki iki
 * hareketi kimlik önekine göre sıralar (`kilindi` < `manuel`); aynı milisaniyede
 * art arda "borç ekle" + "kıldım" yazılırsa kılınan önce uygulanıp fazlaya
 * gider, kalan düşmezdi.
 */
export async function yeniHareketTemeli(onek: string, simdi?: Date): Promise<Pick<KazaHareketi, 'id' | 'zaman' | 'cihaz'>> {
  let an = simdi;
  if (!an) {
    const ms = Math.max(Date.now(), sonHareketMs + 1);
    sonHareketMs = ms;
    an = new Date(ms);
  }
  return { id: hareketKimligi(onek, an.getTime()), zaman: an.toISOString(), cihaz: await cihazKimligiAl() };
}

// ==================== GÖÇ (KAZA_DURUMU → defter) ====================

let gocKilidi: Promise<{ eskiKayitBozuk: boolean }> | null = null;

async function gocuYurut(): Promise<{ eskiKayitBozuk: boolean }> {
  if ((await Depolama.ham(DEPOLAMA_ANAHTARLARI.KAZA_DEFTERI_GOCU)) === '1') return { eskiKayitBozuk: false };
  const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.KAZA_DURUMU);
  let cozulen: unknown = undefined;
  let ayristi = false;
  if (ham !== null) {
    try {
      cozulen = JSON.parse(ham);
      ayristi = true;
    } catch {
      ayristi = false;
    }
  }
  // JSON `null` BOŞ kayıttır, bozuk değil: eski "üzerine yaz" içe aktarması
  // kazasız yedekte `kaza ?? null` yazıyordu. Ayrıştırılamayan metin ise
  // bozuktur (aşağıda; bayrak yazılmaz, ham kayıt korunur).
  if (ham !== null && !(ayristi && cozulen === null)) {
    const sonuc = eskiDurumdanHareketler(cozulen, new Date().toISOString(), await cihazKimligiAl());
    if (!sonuc) {
      // Bayrak YAZILMAZ: kayıt diskte kalır, ekran "eski kayıt okunamadı" der.
      Logger.warn('LocalKazaServisi', 'Eski KAZA_DURUMU okunamadı; göç yapılmadı, ham kayıt korunuyor', {
        uzunluk: ham.length,
        onek: ham.slice(0, 80),
      });
      return { eskiKayitBozuk: true };
    }
    const mevcut = await hamDefteriOku();
    if (defterDoluMu(mevcut.hareketler)) {
      // Başka cihazdan/yedekten defter zaten geldi: ikinci bir göç tabanı EKLENMEZ.
      Logger.info('LocalKazaServisi', 'Defter dolu; eski kaza kaydı göç edilmeden bırakıldı');
    } else if (sonuc.hareketler.length > 0) {
      await hareketleriEkle(sonuc.hareketler);
    }
    if ((await Depolama.ham(DEPOLAMA_ANAHTARLARI.KAZA_AYARLARI)) === null) {
      await Depolama.yaz(
        DEPOLAMA_ANAHTARLARI.KAZA_AYARLARI,
        kazaAyarlariniNormalize({ ...VARSAYILAN_KAZA_AYARLARI, ...sonuc.ayarlar })
      );
    }
  }
  await Depolama.hamYaz(DEPOLAMA_ANAHTARLARI.KAZA_DEFTERI_GOCU, '1');
  return { eskiKayitBozuk: false };
}

/**
 * Göç bir kez ve idempotent: bayrak + bellek-içi in-flight kilidi
 * (`LocalNamazServisi.migrasyonyiGarantile` deseni; kalıcı önbellek YOK).
 */
export async function gocuGarantile(): Promise<{ eskiKayitBozuk: boolean }> {
  if (gocKilidi) return gocKilidi;
  gocKilidi = gocuYurut();
  try {
    return await gocKilidi;
  } finally {
    gocKilidi = null;
  }
}

// ==================== YARDIMCI OKUMALAR ====================

/** Göç öncesi günlerin tempo geçmişi (eski anahtar; yalnız okunur). */
export async function eskiTempoOku(): Promise<Record<string, number>> {
  try {
    const veri = await Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.KAZA_TEMPO_GECMIS);
    if (!veri || typeof veri !== 'object' || Array.isArray(veri)) return {};
    const sonuc: Record<string, number> = {};
    for (const [gun, adet] of Object.entries(veri as Record<string, unknown>)) {
      if (isoGunMu(gun) && typeof adet === 'number' && Number.isFinite(adet) && adet > 0) sonuc[gun] = adet;
    }
    return sonuc;
  } catch {
    return {};
  }
}

export async function sonTaramaOku(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.KAZA_SON_TARAMA);
  } catch {
    return null;
  }
}

export async function sonTaramaYaz(zaman: string): Promise<void> {
  try {
    await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.KAZA_SON_TARAMA, zaman);
  } catch {
    // Yalnız ekrandaki "son tarama" çipi; kayıp önemsiz.
  }
}

// ==================== BİLDİRİMDEN "KAZAYA EKLE" (#290, headless) ====================

/**
 * Gün sonu muhasebesindeki "Kazaya ekle": her eksik vakit için REFERANSLI bir
 * `bildirim` hareketi. Referans otomatik izdüşümle aynı gün+vakit olduğu için
 * o vakit ayrıca otomatik sayılmaz (çift borç yok). Store'suz çalışır.
 */
export async function localKazayaBorcEkle(
  eklenecekler: ReadonlyArray<{ gun: string; vakit: KazaVakti }>
): Promise<ApiYanit<number>> {
  try {
    await gocuGarantile();
    const simdi = new Date();
    const cihaz = await cihazKimligiAl();
    const hareketler: KazaHareketi[] = eklenecekler
      .filter((e) => isoGunMu(e.gun))
      .map((e, i) => ({
        id: hareketKimligi(`bildirim-${i}`, simdi.getTime()),
        zaman: simdi.toISOString(),
        cihaz,
        kaynak: 'bildirim',
        vakit: e.vakit,
        adet: 1,
        referans: referansOlustur(e.gun, e.vakit),
      }));
    if (hareketler.length === 0) return { basarili: true, veri: 0 };
    return { basarili: true, veri: await hareketleriEkle(hareketler) };
  } catch (error) {
    return { basarili: false, hata: error instanceof Error ? error.message : 'Bilinmeyen hata' };
  }
}
