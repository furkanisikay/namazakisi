/**
 * Yedek birleştirme servisi — içe-aktarmanın beyni (SAF; AsyncStorage'a DOKUNMAZ).
 *
 * Mevcut veri ile gelen yedeği karşılaştırıp fark çıkarır (`farkCikar`) ve seçilen
 * stratejilerle bir yazım planı (anahtar → değer) üretir (`birlestirmePlaniOlustur`).
 * Gerçek yazımı ve store tazelemeyi orkestratör thunk (Task 7) yapar — bu servis
 * yalnız NE yazılacağını hesaplar.
 *
 * Temel sözleşme: HİÇBİR strateji yıkıcı değildir — anahtar SİLİNMEZ, mevcut-yalnız
 * günler korunur. "akilli" ASLA bir namazı tamamlanmıştan tamamlanmamışa geri almaz.
 *
 * Mimari: domain saf kalır (store/sunuma bağımsız). Plan anahtarları daima
 * `DEPOLAMA_ANAHTARLARI`'ndan türetilir (hardcode yok). Paylaşılan tipler `core/types`.
 *
 * Tasarım: docs/superpowers/specs/2026-06-14-yerel-yedekleme-aktarim-design.md
 */

import {
  YedekPayload,
  NamazGunleri,
  GunNamazHaritasi,
  KategoriStratejisi,
  KategoriSecimleri,
  FarkOzeti,
  YazimPlani,
} from '../../core/types';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import {
  bilinmeyenleriBirlestir,
  hareketAyi,
  hareketleriAyristir,
  hareketleriBirlestir,
  type KazaHareketi,
} from '../../core/kaza/kazaHareketi';
import { defterDoluMu, eskiDurumdanHareketler, eskiGorunumHareketi } from '../../core/kaza/kazaDefteriHesabi';
import { mezhepSecildiMi, seferilikMezhebi } from '../../core/mezhep/mezhepAyari';

/** Kılınan-vakitler anahtar öneki: `${MUHAFIZ_AYARLARI}_kilinan_<tarih>`. */
const KILINAN_VAKIT_ONEK = `${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_`;

/** Ayar payload alanı → AsyncStorage anahtarı eşlemesi (uzerineYaz için). */
const AYAR_ANAHTARLARI: Record<string, string> = {
  muhafiz: DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI,
  vakitBildirim: DEPOLAMA_ANAHTARLARI.VAKIT_BILDIRIM_AYARLARI,
  konum: DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI,
  takvim: DEPOLAMA_ANAHTARLARI.TAKVIM_AYARLARI,
  vakitSayac: DEPOLAMA_ANAHTARLARI.VAKIT_SAYAC_AYARLARI,
  sahurSayac: DEPOLAMA_ANAHTARLARI.SAHUR_SAYAC_AYARLARI,
  iftarSayac: DEPOLAMA_ANAHTARLARI.IFTAR_SAYAC_AYARLARI,
  seriAyarlari: DEPOLAMA_ANAHTARLARI.SERI_AYARLARI,
  ozelGun: DEPOLAMA_ANAHTARLARI.OZEL_GUN_AYARLARI,
  cumaHatirlatma: DEPOLAMA_ANAHTARLARI.CUMA_HATIRLATMA_AYARLARI,
  nafile: DEPOLAMA_ANAHTARLARI.NAFILE_AYARLARI,
  yatisHatirlatma: DEPOLAMA_ANAHTARLARI.YATIS_HATIRLATMA_AYARLARI,
  nowBar: DEPOLAMA_ANAHTARLARI.NOW_BAR_AYARLARI,
  camiyeGit: DEPOLAMA_ANAHTARLARI.CAMIYE_GIT_AYARLARI,
  kazaOneri: DEPOLAMA_ANAHTARLARI.KAZA_ONERI_AYARLARI,
  sadeGorunum: DEPOLAMA_ANAHTARLARI.SADE_GORUNUM_AYARLARI,
  seferilik: DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI,
  takvimCakisma: DEPOLAMA_ANAHTARLARI.TAKVIM_CAKISMA_AYARLARI,
  kazaAyarlari: DEPOLAMA_ANAHTARLARI.KAZA_AYARLARI,
  mezhep: DEPOLAMA_ANAHTARLARI.MEZHEP_AYARI,
  hatirlatmaRizalari: DEPOLAMA_ANAHTARLARI.HATIRLATMA_RIZALARI,
};

/**
 * Dört kategoride de "akıllı" strateji (union; hiçbir şey geri alınmaz, ayarlara
 * dokunulmaz). Cihazlar arası eşitleme (issue #288) daima bunu kullanır — son
 * yazan kazanır YOKTUR.
 */
export const AKILLI_SECIMLER: Readonly<KategoriSecimleri> = Object.freeze({
  namaz: 'akilli',
  puan: 'akilli',
  kaza: 'akilli',
  ayarlar: 'akilli',
});

/** Ham hareket dizisinin bu sürümün çözebildiği kısmı (çözülemeyenler planda ayrıca korunur). */
export const kazaHareketleriniCoz = (ham: unknown): KazaHareketi[] => hareketleriAyristir(ham).taninan;

/** İki tarafta da bulunan tarihlerin (kümeler kesişimi) sayısı. */
const cakisanSayisi = (a: Record<string, unknown>, b: Record<string, unknown>): number =>
  Object.keys(a).filter((tarih) => tarih in b).length;

/**
 * Mevcut ile gelen yedeği karşılaştırıp kullanıcıya gösterilecek özeti çıkarır.
 * Salt-okunur (saf): hiçbir plan/yazım üretmez.
 */
export const farkCikar = (mevcut: YedekPayload, gelen: YedekPayload): FarkOzeti => {
  const ayarVar =
    !!gelen.ayarlar &&
    Object.values(gelen.ayarlar).some((deger) => deger !== null && deger !== undefined);

  return {
    gelenGunSayisi: Object.keys(gelen.namazGunleri).length,
    mevcutGunSayisi: Object.keys(mevcut.namazGunleri).length,
    cakisanGunSayisi: cakisanSayisi(mevcut.namazGunleri, gelen.namazGunleri),
    rozetVar: gelen.rozetler.length > 0,
    kazaVar: gelen.kaza != null || kazaHareketleriniCoz(gelen.kazaHareketleri).length > 0,
    ayarVar,
  };
};

/**
 * İki namaz-günleri haritasını seçilen stratejiyle birleştirir (test için export).
 * - akilli: gün+namaz bazında `Boolean(mevcut) || Boolean(gelen)` (union, geri alma YOK).
 * - uzerineYaz: çakışan günde gelen kazanır; gelen-yalnız eklenir; mevcut-yalnız korunur.
 * - eksikleriEkle: yalnız mevcutta olmayan günler eklenir; çakışan gün atlanır (mevcut korunur).
 */
export const birlestirNamazGunleri = (
  strateji: KategoriStratejisi,
  mevcut: NamazGunleri,
  gelen: NamazGunleri
): NamazGunleri => {
  const sonuc: NamazGunleri = {};
  // Mevcut günleri her zaman taşı (hiçbir strateji yıkıcı değil).
  for (const tarih of Object.keys(mevcut)) {
    sonuc[tarih] = { ...mevcut[tarih] };
  }

  for (const tarih of Object.keys(gelen)) {
    const gelenGun = gelen[tarih] ?? {};
    const mevcutGun = sonuc[tarih];

    if (mevcutGun === undefined) {
      // Gelen-yalnız gün: her stratejide eklenir.
      sonuc[tarih] = { ...gelenGun };
      continue;
    }

    if (strateji === 'eksikleriEkle') {
      // Çakışan gün: mevcut korunur, atla.
      continue;
    }

    if (strateji === 'uzerineYaz') {
      sonuc[tarih] = { ...gelenGun };
      continue;
    }

    // akilli: namaz bazında union (true tarafta korunur, geri alma yok).
    const birlesik: GunNamazHaritasi = { ...mevcutGun };
    for (const namaz of Object.keys(gelenGun)) {
      birlesik[namaz] = Boolean(mevcutGun[namaz]) || Boolean(gelenGun[namaz]);
    }
    sonuc[tarih] = birlesik;
  }

  return sonuc;
};

/** Kılınan-vakit dizilerini stratejiyle birleştirir (tarih → string[]). */
const birlestirKilinanVakitler = (
  strateji: KategoriStratejisi,
  mevcut: Record<string, string[]>,
  gelen: Record<string, string[]>
): Record<string, string[]> => {
  const sonuc: Record<string, string[]> = {};
  for (const tarih of Object.keys(mevcut)) {
    sonuc[tarih] = Array.isArray(mevcut[tarih]) ? [...mevcut[tarih]] : [];
  }

  for (const tarih of Object.keys(gelen)) {
    // Bozuk/elle değiştirilmiş yedekte gelen[tarih] dizi olmayabilir → güvenli daralt.
    const gelenDizi = Array.isArray(gelen[tarih]) ? gelen[tarih] : [];
    const mevcutDizi = sonuc[tarih];

    if (mevcutDizi === undefined) {
      sonuc[tarih] = [...gelenDizi];
      continue;
    }
    if (strateji === 'eksikleriEkle') continue;
    if (strateji === 'uzerineYaz') {
      sonuc[tarih] = [...gelenDizi];
      continue;
    }
    // akilli: küme birleşimi.
    sonuc[tarih] = Array.from(new Set([...mevcutDizi, ...gelenDizi]));
  }

  return sonuc;
};

/** id'ye göre tekilleştirerek rozetleri birleştirir (her iki taraftaki kazanımlar). */
const rozetleriBirlestir = (mevcut: unknown[], gelen: unknown[]): unknown[] => {
  const birlesik: unknown[] = [];
  const gorulenIdler = new Set<string>();
  for (const rozet of [...mevcut, ...gelen]) {
    const id = (rozet as { id?: unknown })?.id;
    const anahtar = typeof id === 'string' ? id : JSON.stringify(rozet);
    if (gorulenIdler.has(anahtar)) continue;
    gorulenIdler.add(anahtar);
    birlesik.push(rozet);
  }
  return birlesik;
};

/** Etkilenen namaz günlerini ve kılınan vakitleri plana ekler. */
const namazPlaniEkle = (
  plan: YazimPlani,
  strateji: KategoriStratejisi,
  mevcut: YedekPayload,
  gelen: YedekPayload
): void => {
  const birlesikGunler = birlestirNamazGunleri(
    strateji,
    mevcut.namazGunleri,
    gelen.namazGunleri
  );
  const birlesikKilinan = birlestirKilinanVakitler(
    strateji,
    mevcut.kilinanVakitler,
    gelen.kilinanVakitler
  );

  // Yalnız ETKİLENEN (gelenden değişen/eklenen) tarihleri plana koy.
  for (const tarih of Object.keys(gelen.namazGunleri)) {
    if (strateji === 'eksikleriEkle' && tarih in mevcut.namazGunleri) continue;
    plan[`${DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK}${tarih}`] = birlesikGunler[tarih];
  }
  for (const tarih of Object.keys(gelen.kilinanVakitler)) {
    if (strateji === 'eksikleriEkle' && tarih in mevcut.kilinanVakitler) continue;
    plan[`${KILINAN_VAKIT_ONEK}${tarih}`] = birlesikKilinan[tarih];
  }
};

/** unknown'dan güvenli sayı okur (sayı değilse 0). */
const sayiAl = (deger: unknown): number =>
  typeof deger === 'number' && Number.isFinite(deger) ? deger : 0;

/**
 * Akıllı modda seri (streak) durumunu birleştirir. `enUzunSeri` (rekor) yol-bağımlıdır;
 * reconcile onu kayıttan TÜRETMEZ → birleştirmezsek boş cihaza akıllı içe-aktarmada
 * yedekteki rekor kaybolur. Kural:
 * - Yedekte seri yoksa → undefined (yazma, mevcut korunur).
 * - Mevcut seri yoksa (yeni/boş cihaz) → yedeğin serisini tümden geri yükle.
 * - İkisi de varsa → mevcut güncel durum korunur (reconcile sonradan kayıttan yeniden
 *   hesaplar), yalnız `enUzunSeri = max(mevcut, gelen)` alınır (rekor kaybolmaz).
 */
const seriBirlestir = (mevcut: unknown, gelen: unknown): unknown | undefined => {
  if (gelen === null || gelen === undefined || typeof gelen !== 'object') return undefined;
  if (mevcut === null || mevcut === undefined || typeof mevcut !== 'object') return gelen;
  const m = mevcut as Record<string, unknown>;
  const g = gelen as Record<string, unknown>;
  return { ...m, enUzunSeri: Math.max(sayiAl(m.enUzunSeri), sayiAl(g.enUzunSeri)) };
};

/** Puan kategorisini plana ekler (bonus/rozet/seri; uzerineYaz'da ek olarak seviye/istatistik). */
const puanPlaniEkle = (
  plan: YazimPlani,
  strateji: KategoriStratejisi,
  mevcut: YedekPayload,
  gelen: YedekPayload
): void => {
  if (strateji === 'eksikleriEkle') return;

  if (strateji === 'akilli') {
    // bonusPuan reconcile'dan ÖNCE diske yazılmalı (AGENTS.md) → plana koy.
    plan[DEPOLAMA_ANAHTARLARI.BONUS_PUAN] = Math.max(mevcut.bonusPuan, gelen.bonusPuan);
    plan[DEPOLAMA_ANAHTARLARI.ROZET_VERILERI] = rozetleriBirlestir(
      mevcut.rozetler,
      gelen.rozetler
    );
    // Seri: enUzunSeri (rekor) reconcile'dan türetilemez → birleştir (yoksa rekor kaybolur).
    const birlesikSeri = seriBirlestir(mevcut.seri, gelen.seri);
    if (birlesikSeri !== undefined) {
      plan[DEPOLAMA_ANAHTARLARI.SERI_DURUMU] = birlesikSeri;
    }
    // seviye/istatistik YAZILMAZ — Task 7'de reconcile birleşmiş kayıtlardan türetir.
    return;
  }

  // uzerineYaz: tüm puan/seviye/istatistik/seri anahtarları gelenden.
  plan[DEPOLAMA_ANAHTARLARI.BONUS_PUAN] = gelen.bonusPuan;
  plan[DEPOLAMA_ANAHTARLARI.ROZET_VERILERI] = gelen.rozetler;
  plan[DEPOLAMA_ANAHTARLARI.SERI_DURUMU] = gelen.seri;
  plan[DEPOLAMA_ANAHTARLARI.SEVIYE_DURUMU] = gelen.seviye;
  plan[DEPOLAMA_ANAHTARLARI.TOPLAM_KILILAN_NAMAZ] = gelen.istatistik.toplamKilinan;
  plan[DEPOLAMA_ANAHTARLARI.MUKEMMEL_GUN_SAYISI] = gelen.istatistik.mukemmelGun;
  plan[DEPOLAMA_ANAHTARLARI.TOPARLANMA_SAYISI] = gelen.istatistik.toparlanma;
};

/** Göç/eski yedek bağlamı (testte sabitlenir). */
export interface BirlestirmeBaglami {
  zaman: string;
  cihaz: string;
}

/**
 * Kaza kategorisini plana ekler (Kaza Defteri 2.0).
 *
 * Defter DEĞİŞMEZ hareketlerden oluşur → üç stratejide de birleşim KİMLİĞE
 * GÖREDİR (G-Set; değişmeli, tekrar uygulanabilir). "Üzerine yaz" bile mevcut
 * hareketleri silmez: hareket bir olgudur, istenmeyen kayıt temizlikle
 * (geri alınabilir) gizlenir. Plan ay anahtarlarına bölünür; `planiDiskeYaz`
 * bunları defterin tek kapısından (kimlik birleşimi) yazar.
 *
 * ESKİ YEDEK / ESKİ SÜRÜMLÜ CİHAZ (yalnız `kaza` anlık görüntüsü): defter boşsa
 * göç onun üzerinden yapılır; doluysa ikinci bir göç tabanı EKLENMEZ, yalnız
 * `eskiGorunum` ("en az bu kadar kılındı") hareketi yazılır. Çözülemeyen (yeni
 * sürüm) hareketler de plana AYNEN girer.
 */
const kazaPlaniEkle = (
  plan: YazimPlani,
  strateji: KategoriStratejisi,
  mevcut: YedekPayload,
  gelen: YedekPayload,
  baglam: BirlestirmeBaglami
): void => {
  const mevcutAyrim = hareketleriAyristir(mevcut.kazaHareketleri);
  const gelenAyrim = hareketleriAyristir(gelen.kazaHareketleri);
  const mevcutHareketler = mevcutAyrim.taninan;
  let gelenHareketler: KazaHareketi[] = gelenAyrim.taninan;
  // ESKİ SÜRÜMÜN YÜKÜ (hareket alanı hiç yok): anlık görüntü yalnız göç kaynağıdır.
  // Defter boşsa göç (içerikten türeyen `goc-` kimlikleri → tekrar uygulanabilir);
  // doluysa yalnız "en az bu kadar kılındı" tabanı (eski cihazda kılınanlar
  // kaybolmasın, karışık sürüm eşitlemesi buluşsun). Borç yönü ALINMAZ.
  const eskiSurumYuku = !Array.isArray(gelen.kazaHareketleri) && gelen.kaza != null;
  if (eskiSurumYuku) {
    if (!defterDoluMu(mevcutHareketler)) {
      gelenHareketler = eskiDurumdanHareketler(gelen.kaza, baglam.zaman, baglam.cihaz)?.hareketler ?? [];
    } else {
      const taban = eskiGorunumHareketi(gelen.kaza, baglam.zaman, baglam.cihaz);
      gelenHareketler = taban && !mevcutHareketler.some((h) => h.id === taban.id) ? [taban] : [];
    }
  }
  const gelenBilinmeyen = gelenAyrim.bilinmeyen;
  if (gelenHareketler.length > 0 || gelenBilinmeyen.length > 0) {
    const birlesik = hareketleriBirlestir(mevcutHareketler, gelenHareketler);
    const taninanIdler = new Set(birlesik.map((h) => h.id));
    const bilinmeyen = bilinmeyenleriBirlestir(mevcutAyrim.bilinmeyen, gelenBilinmeyen).filter(
      (b) => !taninanIdler.has(b.id)
    );
    const etkilenenAylar = new Set([...gelenHareketler.map(hareketAyi), ...gelenBilinmeyen.map(hareketAyi)]);
    const aylar = new Map<string, unknown[]>();
    for (const h of [...birlesik, ...bilinmeyen]) {
      const ay = hareketAyi(h);
      if (!etkilenenAylar.has(ay)) continue;
      aylar.set(ay, [...(aylar.get(ay) ?? []), h]);
    }
    for (const [ay, liste] of aylar) plan[`${DEPOLAMA_ANAHTARLARI.KAZA_HAREKET_ONEK}${ay}`] = liste;
  }

  // Eski tempo geçmişi (göç öncesi günler).
  if (strateji === 'eksikleriEkle') return;
  if (strateji === 'uzerineYaz') {
    plan[DEPOLAMA_ANAHTARLARI.KAZA_TEMPO_GECMIS] = gelen.kazaTempo;
    return;
  }
  const birlesikTempo: Record<string, number> = { ...mevcut.kazaTempo };
  for (const tarih of Object.keys(gelen.kazaTempo ?? {})) {
    birlesikTempo[tarih] = Math.max(birlesikTempo[tarih] ?? 0, gelen.kazaTempo[tarih]);
  }
  plan[DEPOLAMA_ANAHTARLARI.KAZA_TEMPO_GECMIS] = birlesikTempo;
};

/** Ayarlar kategorisini plana ekler (yalnız uzerineYaz yazar; akilli/eksikleriEkle dokunmaz). */
const ayarPlaniEkle = (
  plan: YazimPlani,
  strateji: KategoriStratejisi,
  mevcut: YedekPayload,
  gelen: YedekPayload
): void => {
  if (strateji !== 'uzerineYaz') return; // akilli: cihaz korunur; eksikleriEkle: dokunma.

  const ayarlar = gelen.ayarlar ?? {};
  for (const [alan, anahtar] of Object.entries(AYAR_ANAHTARLARI)) {
    const deger = ayarlar[alan];
    if (deger !== null && deger !== undefined) {
      plan[anahtar] = deger;
    }
  }
  // ESKİ YEDEK (ortak mezhep anahtarından önce): mezhep yalnız seferîlik kaydında.
  // Ortak ayar ona taşınmazsa açılışta yazılmış ortak ayar kazanır ve Şâfiî
  // kullanıcıya vitir borcu eklenirdi. Kullanıcının bilinçli seçimi EZİLMEZ.
  if (ayarlar.mezhep === null || ayarlar.mezhep === undefined) {
    const eski = seferilikMezhebi(ayarlar.seferilik);
    if (eski && !mezhepSecildiMi(mevcut.ayarlar?.mezhep)) {
      plan[DEPOLAMA_ANAHTARLARI.MEZHEP_AYARI] = { mezhep: eski };
    }
  }
};

/**
 * Seçilen kategori stratejileriyle eksiksiz bir yazım planı (anahtar → değer) üretir.
 * Saf: yalnız hesaplar, yazmaz. Boş plan = hiçbir şey yazma.
 */
export const birlestirmePlaniOlustur = (
  mevcut: YedekPayload,
  gelen: YedekPayload,
  secimler: KategoriSecimleri,
  baglam: BirlestirmeBaglami = { zaman: new Date().toISOString(), cihaz: 'yedek' }
): YazimPlani => {
  const plan: YazimPlani = {};
  namazPlaniEkle(plan, secimler.namaz, mevcut, gelen);
  puanPlaniEkle(plan, secimler.puan, mevcut, gelen);
  kazaPlaniEkle(plan, secimler.kaza, mevcut, gelen, baglam);
  ayarPlaniEkle(plan, secimler.ayarlar, mevcut, gelen);
  return plan;
};
