/**
 * Toparlanma hedef gun sayisinin normalizasyonu (SAF).
 *
 * `toparlanmaGunSayisi` kullanicinin degistirebildigi bir ayar DEGIL, uygulamanin kuralidir;
 * ancak diske tum seri ayarlariyla birlikte yazildigi icin eski kurulumlarda BAYAT kalir
 * (ornegin kural 5 gunken kaydedilmis bir cihaz, kural 2'ye insin de hala 5 gorur).
 * Bu yuzden ayar okunurken guncel kurala cekilir ve devam eden bir toparlanma varsa
 * hedefi de asagi tasinir.
 */

import { ToparlanmaDurumu } from '../types/SeriTipleri';

/**
 * Devam eden bir toparlanmanin hedefini guncel kurala ceker.
 *
 * Kurallar:
 * - Hedef ASLA yukseltilmez (kullaniciyi kurtarmaya daha uzak bir yere itmez).
 * - Hedef, tamamlanan gun sayisinin altina VEYA esitine indirilmez: aksi halde kart
 *   "2/2 tamamlandi" gorunur ama seri kurtarilmamis olurdu (motor kurtarmayi ancak yeni
 *   bir tam gunde isler). Taban `tamamlananGun + 1` = "bir sonraki tam gunde biter".
 *
 * @param durum - Mevcut toparlanma durumu (null ise dokunulmaz)
 * @param guncelHedef - Guncel kuraldaki hedef gun sayisi
 * @returns Hedefi normalize edilmis durum; degisiklik yoksa AYNI referans
 */
export function toparlanmaHedefiniNormalize(
  durum: ToparlanmaDurumu | null,
  guncelHedef: number
): ToparlanmaDurumu | null {
  if (!durum) {
    return durum;
  }

  const taban = Math.max(guncelHedef, durum.tamamlananGun + 1);
  const yeniHedef = Math.min(durum.hedefGunSayisi, taban);

  if (yeniHedef === durum.hedefGunSayisi) {
    return durum;
  }

  return { ...durum, hedefGunSayisi: yeniHedef };
}
