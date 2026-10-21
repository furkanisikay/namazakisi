/**
 * Cihazlar arası eşitleme (issue #288) — eşitlenen İÇERİK ve içerik ÖZETİ.
 *
 * İçerik, yerel yedekle AYNI şemadır (`YedekPayload`): uygulama tarafı yeni bir
 * birleştirme yolu YAZMAZ, gelen veri `YedekBirlestirmeServisi.birlestirmePlaniOlustur`
 * ("akıllı" strateji = union, geri alma yok) ile mevcut içe aktarma zincirinden geçer.
 *
 * VERİ AZALTMA: buluta yalnız birleştirmede KULLANILAN alanlar gider. "Akıllı"
 * strateji ayarlara dokunmaz (her cihaz kendi ayarını korur) ve seviye/istatistiği
 * kayıttan yeniden türetir → `ayarlar` (konum dahil), `seviye`, `istatistik` boş
 * gönderilir. Union'da bilgi taşımayan `false` işaretler de atılır (`false || x = x`).
 *
 * ÖZET (`icerikOzeti`) "yalnız değiştiyse yükle" kararının ölçüsüdür ve YALNIZ
 * birleştirmenin YAKINSADIĞI görünüme bakar: işaretli namazlar, kılınan vakitler,
 * rozet kimlikleri, bonus puan, en uzun seri, kaza HAREKET KİMLİKLERİ, kaza temposu. Cihaza
 * özgü kalan alanlar (güncel seri ayrıntısı, rozet tarihleri) özete girseydi iki
 * cihaz HİÇ aynı özete ulaşamaz ve her eşitlemede birbirinin üzerine yükleme
 * yapardı (sonsuz ping-pong).
 */

import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex } from '@noble/hashes/utils';
import naclUtil from 'tweetnacl-util';
import { YedekPayload, NamazGunleri, GunNamazHaritasi } from '../types/YedeklemeTipleri';
import { bilinmeyenleriBirlestir, hareketleriAyristir, hareketleriBirlestir } from '../kaza/kazaHareketi';
import { olaylariBirlestir } from '../cihazAgi/olayGunlugu';

const TARIH_BICIMI = /^\d{4}-\d{2}-\d{2}$/;

const nesneMi = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === 'object' && !Array.isArray(x);

const sonluSayi = (x: unknown): number => (typeof x === 'number' && Number.isFinite(x) ? x : 0);

/** Namaz günlerinden yalnız `true` işaretleri bırakır (boş gün atılır). */
const yalnizIsaretliGunler = (gunler: NamazGunleri): NamazGunleri => {
  const sonuc: NamazGunleri = {};
  for (const [tarih, gun] of Object.entries(gunler)) {
    if (!TARIH_BICIMI.test(tarih) || !nesneMi(gun)) continue;
    const isaretli: GunNamazHaritasi = {};
    for (const [namaz, kilindi] of Object.entries(gun)) {
      if (kilindi === true) isaretli[namaz] = true;
    }
    if (Object.keys(isaretli).length > 0) sonuc[tarih] = isaretli;
  }
  return sonuc;
};

/** Kılınan vakitleri temizler (geçersiz tarih / boş dizi / metin olmayan öğe atılır). */
const temizKilinanVakitler = (deger: unknown): Record<string, string[]> => {
  const sonuc: Record<string, string[]> = {};
  if (!nesneMi(deger)) return sonuc;
  for (const [tarih, liste] of Object.entries(deger)) {
    if (!TARIH_BICIMI.test(tarih) || !Array.isArray(liste)) continue;
    const vakitler = Array.from(new Set(liste.filter((v): v is string => typeof v === 'string')));
    if (vakitler.length > 0) sonuc[tarih] = vakitler;
  }
  return sonuc;
};

/** Kaza temposunu temizler (tarih → sonlu sayı). */
const temizTempo = (deger: unknown): Record<string, number> => {
  const sonuc: Record<string, number> = {};
  if (!nesneMi(deger)) return sonuc;
  for (const [tarih, adet] of Object.entries(deger)) {
    if (TARIH_BICIMI.test(tarih) && typeof adet === 'number' && Number.isFinite(adet)) {
      sonuc[tarih] = adet;
    }
  }
  return sonuc;
};

/**
 * Kaza defteri hareketlerini doğrular ve kimliğe göre tekilleştirir (sıralı →
 * aynı küme aynı dizi). Bu sürümün çözemediği ama yapısal olarak geçerli öğe
 * (yeni sürümün hareketi) HAM olarak KORUNUR — atılsaydı bu cihaz onu buluttan
 * siler ve iki cihazın özeti hiç buluşmazdı. Yapısız öğe atlanır.
 */
const temizKazaHareketleri = (deger: unknown): unknown[] => {
  const { taninan, bilinmeyen } = hareketleriAyristir(deger);
  const birlesik = hareketleriBirlestir(taninan);
  const taninanIdler = new Set(birlesik.map((h) => h.id));
  return [...birlesik, ...bilinmeyenleriBirlestir(bilinmeyen).filter((b) => !taninanIdler.has(b.id))];
};

/** Yerel anlık görüntüyü buluta gidecek (azaltılmış) içeriğe indirir. */
export function esitlemeIcerigineIndir(yerel: YedekPayload): YedekPayload {
  return {
    namazGunleri: yalnizIsaretliGunler(yerel.namazGunleri ?? {}),
    kilinanVakitler: temizKilinanVakitler(yerel.kilinanVakitler),
    seri: nesneMi(yerel.seri) ? yerel.seri : null,
    rozetler: Array.isArray(yerel.rozetler) ? yerel.rozetler : [],
    seviye: null,
    bonusPuan: sonluSayi(yerel.bonusPuan),
    istatistik: { toplamKilinan: 0, mukemmelGun: 0, toparlanma: 0 },
    // Kaza Defteri 2.0: değişmez hareketler + defterden TÜRETİLMİŞ eski şekilli
    // anlık görüntü (`eskiAnlikGoruntuUret`). Görüntü yalnız ESKİ sürümlü cihazlar
    // içindir (onların "daha ilerlemiş olanı seç" kuralı yeni cihazı görsün).
    kaza: nesneMi(yerel.kaza) ? yerel.kaza : null,
    kazaTempo: temizTempo(yerel.kazaTempo),
    kazaHareketleri: temizKazaHareketleri(yerel.kazaHareketleri),
    ...temizOlaylar(yerel.cihazOlaylari),
    ayarlar: {},
  };
}

/**
 * Çözülmüş uzak metni güvenle `YedekPayload`'a çevirir (kurcalanmış/eksik alanlar
 * temizlenir). Nesne değilse `null`. Birleştirme servisi diziler/nesneler üzerinde
 * doğrudan gezindiği için tip doğrulaması burada yapılır.
 */
export function icerikNormalizeEt(deger: unknown): YedekPayload | null {
  if (!nesneMi(deger)) return null;
  const namazGunleri = nesneMi(deger.namazGunleri)
    ? yalnizIsaretliGunler(deger.namazGunleri as NamazGunleri)
    : {};
  return {
    namazGunleri,
    kilinanVakitler: temizKilinanVakitler(deger.kilinanVakitler),
    seri: nesneMi(deger.seri) ? deger.seri : null,
    rozetler: Array.isArray(deger.rozetler) ? deger.rozetler : [],
    seviye: null,
    bonusPuan: sonluSayi(deger.bonusPuan),
    istatistik: { toplamKilinan: 0, mukemmelGun: 0, toparlanma: 0 },
    // Eski sürümden gelen anlık görüntü: defter boşsa göç, doluysa yalnız
    // "en az bu kadar kılındı" tabanı (`eskiGorunumHareketi`).
    kaza: nesneMi(deger.kaza) ? deger.kaza : null,
    kazaTempo: temizTempo(deger.kazaTempo),
    // Alan YOKSA (eski sürümün yükü) `undefined` kalır: birleştirme eski cihazı
    // bundan tanır. Boş dizi = yeni sürüm, boş defter.
    ...(Array.isArray(deger.kazaHareketleri)
      ? { kazaHareketleri: temizKazaHareketleri(deger.kazaHareketleri) }
      : {}),
    ...temizOlaylar(deger.cihazOlaylari),
    ayarlar: {},
  };
}

/** Olay günlüğü: yalnız doğrulanan olaylar; boşsa alan HİÇ yazılmaz (eski özet birebir kalsın). */
const temizOlaylar = (ham: unknown): { cihazOlaylari?: unknown[] } => {
  const olaylar = Array.isArray(ham) ? olaylariBirlestir(ham, []) : [];
  return olaylar.length > 0 ? { cihazOlaylari: olaylar } : {};
};

/** Rozet kimliği (birleştirme servisiyle aynı anahtar: `id` ya da JSON). */
const rozetKimligi = (rozet: unknown): string => {
  const id = (rozet as { id?: unknown } | null)?.id;
  return typeof id === 'string' ? id : JSON.stringify(rozet);
};

/** Anahtarları SIRALI JSON (aynı veri → aynı dize; nesne anahtar sırası değişse bile). */
export function kanonikJson(deger: unknown): string {
  if (Array.isArray(deger)) return `[${deger.map(kanonikJson).join(',')}]`;
  if (nesneMi(deger)) {
    const anahtarlar = Object.keys(deger)
      .filter((a) => deger[a] !== undefined)
      .sort();
    return `{${anahtarlar.map((a) => `${JSON.stringify(a)}:${kanonikJson(deger[a])}`).join(',')}}`;
  }
  return JSON.stringify(deger ?? null);
}

/** Birleştirmenin yakınsadığı görünüm (özet girdisi). */
const yakinsayanGorunum = (icerik: YedekPayload): unknown => {
  const indirgenmis = esitlemeIcerigineIndir(icerik);
  const namaz = Object.entries(indirgenmis.namazGunleri).map(
    ([tarih, gun]) => [tarih, Object.keys(gun).sort()] as const
  );
  const kilinan = Object.entries(indirgenmis.kilinanVakitler).map(
    ([tarih, vakitler]) => [tarih, [...vakitler].sort()] as const
  );
  const seri = indirgenmis.seri as { enUzunSeri?: unknown } | null;
  return {
    namaz: namaz.sort((a, b) => a[0].localeCompare(b[0])),
    kilinan: kilinan.sort((a, b) => a[0].localeCompare(b[0])),
    rozetler: Array.from(new Set(indirgenmis.rozetler.map(rozetKimligi))).sort(),
    bonusPuan: indirgenmis.bonusPuan,
    enUzunSeri: sonluSayi(seri?.enUzunSeri),
    // Kaza Defteri 2.0: ilerleme SAYISI değil, hareket KİMLİK KÜMESİ (G-Set
    // birleşimi yakınsar → iki cihaz aynı özete ulaşır, ping-pong yok).
    // Çözülemeyen (yeni sürüm) öğeler de sayılır: onları koruyan iki cihaz aynı
    // özete ulaşsın.
    kazaHareketleri: (indirgenmis.kazaHareketleri ?? [])
      .map((h) => (h as { id?: unknown }).id)
      .filter((id): id is string => typeof id === 'string')
      .sort(),
    kazaTempo: indirgenmis.kazaTempo,
    // Olay günlüğü: kimlik KÜMESİ (birleşim yakınsar). Alan yoksa `undefined` → kanonik JSON
    // anahtarı hiç yazmaz, özet olay günlüğünden önceki sürümle BİREBİR aynı kalır.
    cihazOlaylari: indirgenmis.cihazOlaylari?.length
      ? indirgenmis.cihazOlaylari.map((o) => (o as { id: string }).id).sort()
      : undefined,
  };
};

/** İçeriğin yakınsayan görünümünün SHA-256 özeti (hex). */
export function icerikOzeti(icerik: YedekPayload): string {
  return bytesToHex(sha256(naclUtil.decodeUTF8(kanonikJson(yakinsayanGorunum(icerik)))));
}

// ---------------------------------------------------------------------------
// Karışık sürüm (eski sürümlü cihaz) — yükleme kararı
// ---------------------------------------------------------------------------

/** Eski sürümün (Kaza Defteri 1.x) yükü: kaza hareket alanı hiç yok. */
export const eskiSurumYukuMu = (icerik: YedekPayload): boolean => !Array.isArray(icerik.kazaHareketleri);

/** Eski sürümün kaza ilerleme ölçüsü (yoksa -1; eski motorla birebir). */
const eskiKazaIlerlemesi = (kaza: unknown): number => {
  const t = (kaza as { toplamTamamlanan?: unknown } | null)?.toplamTamamlanan;
  return typeof t === 'number' && Number.isFinite(t) ? t : -1;
};

/**
 * Eski sürümlü cihazın yükünü indirip birleştirdikten sonra birleşik hâli
 * YÜKLEMEK GEREKİR Mİ? Eski cihaz hareket kümesini okuyamaz; yalnız işaretleri
 * (union) ve "daha ilerlemiş" kaza görüntüsünü (`toplamTamamlanan` BÜYÜKSE)
 * alır. Yerel, ona alabileceği hiçbir şey vermiyorsa yükleme yapılmaz: yeni
 * cihazın görüntüsü eskininkinden gerideyken (ör. temizlikle gizlenen kılınan)
 * eski cihaz onu hiç benimsemez ve her yükleme karşı yüklemeyle döner (sonsuz
 * ping-pong). Hareket kimlikleri kıyasa GİRMEZ (eski yükte hiç yoktur).
 */
export function eskiSurumeYuklemeGerekliMi(yerel: YedekPayload, gelen: YedekPayload): boolean {
  const hareketsiz = (p: YedekPayload): string => {
    const gorunum = { ...(yakinsayanGorunum(p) as Record<string, unknown>) };
    delete gorunum.kazaHareketleri;
    return kanonikJson(gorunum);
  };
  if (hareketsiz(yerel) !== hareketsiz(gelen)) return true;
  return eskiKazaIlerlemesi(yerel.kaza) > eskiKazaIlerlemesi(gelen.kaza);
}
