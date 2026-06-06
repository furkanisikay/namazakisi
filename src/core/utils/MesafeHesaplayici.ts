/**
 * Mesafe hesaplama yardımcısı
 */

/**
 * Iki koordinat arasi mesafeyi hesapla (Haversine formulu)
 * @param lat1 Birinci enlem
 * @param lng1 Birinci boylam
 * @param lat2 Ikinci enlem
 * @param lng2 Ikinci boylam
 * @returns Mesafe (metre)
 */
export function mesafeHesapla(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Dunya yaricapi (metre)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
