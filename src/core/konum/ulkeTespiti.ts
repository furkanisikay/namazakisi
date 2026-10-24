/**
 * Koordinattan ülke kodu (ISO alfa-2) — çevrimdışı, SAF.
 *
 * Dünya verisinde Türkiye yoktur (il/ilçe seçici OSM tablosunu kullanır); bu yüzden en
 * yakın nokta Türkiye ilçe merkezleri ile dünya şehirleri arasında aranır, hangisi daha
 * yakınsa onun ülkesi seçilir. Sınıra çok yakın noktalarda yanılabilir; GPS'in ters
 * kodlamasından gelen ülke kodu varsa o önceliklidir (çağıran verir).
 */
import { ILCE_MERKEZLERI } from './ilceMerkezleriVerisi';
import { enYakinSehir, type DunyaSehirVerisi } from './dunyaSehirleri';

function yaklasikKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const x = ((lng2 - lng1) * Math.PI / 180) * Math.cos(((lat1 + lat2) / 2) * Math.PI / 180);
  const y = (lat2 - lat1) * Math.PI / 180;
  return Math.sqrt(x * x + y * y) * 6371;
}

/** Türkiye ilçe merkezlerine en kısa mesafe (km). */
export function turkiyeyeUzaklikKm(lat: number, lng: number): number {
  let enAz = Infinity;
  for (const ilceler of Object.values(ILCE_MERKEZLERI)) {
    for (const [, , ilat, ilng] of ilceler) {
      const km = yaklasikKm(lat, lng, ilat, ilng);
      if (km < enAz) enAz = km;
    }
  }
  return enAz;
}

/** Koordinatın ülkesi; dünya verisi yoksa yalnız Türkiye'yi tanır (40 km içinde). */
export function koordinatinUlkesi(lat: number, lng: number, dunya: DunyaSehirVerisi | null): string | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return null;
  const trKm = turkiyeyeUzaklikKm(lat, lng);
  const sehir = dunya ? enYakinSehir(dunya, lat, lng) : null;
  if (sehir) {
    const sehirKm = yaklasikKm(lat, lng, sehir.lat, sehir.lng);
    return trKm <= sehirKm ? 'TR' : sehir.ulke;
  }
  return trKm <= 40 ? 'TR' : null;
}

/** Konum kaydından bilinen ülke; GPS'te kayıtta yoksa `null` (çağıran koordinattan bulur). */
export function kayitliUlkeKodu(k: {
  konumModu?: string;
  seciliIlId?: number | null;
  ulkeKodu?: string;
  dunyaSehri?: { ulke: string } | null;
}): string | null {
  if (k.dunyaSehri?.ulke) return k.dunyaSehri.ulke;
  if (k.ulkeKodu && /^[A-Z]{2}$/.test(k.ulkeKodu)) return k.ulkeKodu;
  if (k.konumModu === 'manuel' && k.seciliIlId != null) return 'TR';
  return null;
}
