/**
 * İlçe merkezi koordinatı — çevrimdışı tablo üzerinden arama (saf).
 *
 * Neden var: turkiyeapi.dev `/provinces/<id>` yanıtındaki ilçelerde `coordinates` alanı
 * YOKTUR (2026-10-21'de ölçüldü). Eskiden ilçe seçen kullanıcıya il merkezinin koordinatı
 * yazılıyor, vakitler il merkezine göre hesaplanıyordu (İstanbul'da doğu-batı ≈ 4 dk).
 * Koordinat artık `ilceMerkezleriVerisi.ts`'teki çevrimdışı tablodan gelir (OSM, ODbL).
 *
 * Eşleştirme sırası: önce turkiyeapi ilçe kimliği, sonra il + ilçe ADI (Türkçe harf
 * duyarsız). `toLowerCase` KULLANILMAZ (Türkçe İ/ı tuzağı) — sabit harf haritası.
 */

import { ILCE_MERKEZLERI } from './ilceMerkezleriVerisi';

export interface IlceKoordinati {
  lat: number;
  lng: number;
}

const HARF_HARITASI: Record<string, string> = {
  ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', I: 'i', İ: 'i', i: 'i',
  ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u',
  â: 'a', Â: 'a', î: 'i', Î: 'i', û: 'u', Û: 'u',
};

/** Ad karşılaştırması için harf ve boşluk duyarsız anahtar ("Eyüpsultan" = "EYÜP SULTAN"). */
export function adAnahtari(ad: string): string {
  let sonuc = '';
  for (const harf of ad.normalize('NFC')) {
    const eslenen = HARF_HARITASI[harf];
    if (eslenen !== undefined) {
      sonuc += eslenen;
      continue;
    }
    const kod = harf.charCodeAt(0);
    if (kod >= 65 && kod <= 90) sonuc += String.fromCharCode(kod + 32); // A-Z (ASCII güvenli)
    else if ((kod >= 97 && kod <= 122) || (kod >= 48 && kod <= 57)) sonuc += harf;
    // boşluk, tire, nokta ve diğerleri atılır
  }
  return sonuc;
}

type Kayit = readonly [id: number, ad: string, lat: number, lng: number];

let kimlikDizini: Map<number, Kayit> | null = null;
let adDizini: Map<string, Kayit> | null = null;

function dizinleriKur(): void {
  if (kimlikDizini && adDizini) return;
  kimlikDizini = new Map();
  adDizini = new Map();
  for (const [ilId, ilceler] of Object.entries(ILCE_MERKEZLERI)) {
    for (const kayit of ilceler) {
      kimlikDizini.set(kayit[0], kayit);
      adDizini.set(`${Number(ilId)}|${adAnahtari(kayit[1])}`, kayit);
    }
  }
}

/**
 * İlçe merkezinin koordinatı; tabloda yoksa `null` (çağıran il merkezine düşer).
 * @param ilId il kimliği = plaka numarası (1–81)
 * @param ilceAdi kullanıcıya gösterilen ilçe adı
 * @param ilceId turkiyeapi.dev ilçe kimliği (varsa önce o denenir)
 */
export function ilceKoordinatiBul(
  ilId: number | null | undefined,
  ilceAdi: string | null | undefined,
  ilceId?: number | null,
): IlceKoordinati | null {
  dizinleriKur();
  let kayit: Kayit | undefined;
  if (typeof ilceId === 'number') kayit = kimlikDizini!.get(ilceId);
  if (!kayit && typeof ilId === 'number' && ilceAdi) {
    kayit = adDizini!.get(`${ilId}|${adAnahtari(ilceAdi)}`);
  }
  return kayit ? { lat: kayit[2], lng: kayit[3] } : null;
}

/** Bir ilin çevrimdışı ilçe listesi (API'ye ulaşılamayınca yedek). Ada göre sıralı. */
export function cevrimdisiIlceler(ilId: number): { id: number; ad: string; lat: number; lng: number }[] {
  const liste = ILCE_MERKEZLERI[String(ilId)] ?? [];
  return liste.map(([id, ad, lat, lng]) => ({ id, ad, lat, lng }));
}

/** Konum kaydının yalnız bu modülün okuduğu alanları (yapısal uyum). */
export interface ManuelKonumKaydi {
  konumModu: string;
  seciliIlId: number | null;
  seciliIlceId: number | null;
  seciliIlceAdi: string;
  koordinatlar: { lat: number; lng: number };
}

/** ~10 m: bunun altındaki fark yazmaya değmez (kayan nokta gürültüsü). */
const ESIK_DERECE = 1e-4;

/**
 * Göç: manuel modda ilçe seçmiş kullanıcının koordinatını ilçe merkezine çeker.
 * Manuel modda koordinat YALNIZ il/ilçe seçiminden gelir (elle koordinat girişi yok),
 * bu yüzden tablodaki ilçe merkezi her zaman doğrudur → bayrak gerekmez, idempotenttir.
 * Değişecek bir şey yoksa AYNI referansı döndürür (gereksiz disk yazımı olmasın).
 */
export function manuelIlceKoordinatiniDuzelt<T extends ManuelKonumKaydi>(kayit: T): T {
  if (kayit.konumModu !== 'manuel' || !kayit.seciliIlceAdi) return kayit;
  const dogru = ilceKoordinatiBul(kayit.seciliIlId, kayit.seciliIlceAdi, kayit.seciliIlceId);
  if (!dogru) return kayit;
  const k = kayit.koordinatlar;
  if (
    k &&
    Math.abs(k.lat - dogru.lat) < ESIK_DERECE &&
    Math.abs(k.lng - dogru.lng) < ESIK_DERECE
  ) {
    return kayit;
  }
  return { ...kayit, koordinatlar: { lat: dogru.lat, lng: dogru.lng } };
}
