import { useMemo } from 'react';
import type { KonumAyarlari } from '../store/konumSlice';

/**
 * Konum ayarlarından kullanıcıya gösterilecek konum metnini üretir (saf fonksiyon).
 * KonumAyarlari ve MuhafizAyarlari ekranları için tek kaynak.
 */
export function konumMetniHesapla(konumAyarlari: KonumAyarlari): string {
  if (konumAyarlari.konumModu === 'oto') {
    if (konumAyarlari.gpsAdres) {
      const { ilce, il } = konumAyarlari.gpsAdres;
      if (ilce && il) return `${ilce}, ${il}`;
      return ilce || il || 'GPS konumu alındı';
    }
    return 'Konum takip ediliyor';
  }
  if (konumAyarlari.seciliIlceAdi && konumAyarlari.seciliIlAdi) {
    return `${konumAyarlari.seciliIlceAdi}, ${konumAyarlari.seciliIlAdi}`;
  }
  return konumAyarlari.seciliIlAdi || 'Konum seçilmedi';
}

/**
 * konumMetniHesapla'nın memoize edilmiş hook sarmalayıcısı.
 */
export function useKonumMetni(konumAyarlari: KonumAyarlari): string {
  return useMemo(() => konumMetniHesapla(konumAyarlari), [konumAyarlari]);
}
