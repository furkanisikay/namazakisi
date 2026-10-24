/**
 * Etkin hesap ayarı — süreç (JS bağlamı) düzeyinde TEK durum.
 *
 * Vakit hesaplayan her yer parametreyi buradan alır: `aktifHesapParametreleri({ tarih, enlem })`.
 * Ayar diskten (`DEPOLAMA_ANAHTARLARI.HESAP_AYARI`) `HesapAyariServisi.yukle()` ile yüklenir;
 * her JS giriş noktası (uygulama açılışı, arka plan görevleri, headless görevler) hesap
 * yapmadan önce `hesapAyariHazir()`'ı bekler. Yüklenmeden önce Diyanet geçerlidir (eski
 * davranış) — bu yüzden yeni giriş noktası eklerken beklemeyi unutma.
 *
 * SAF çekirdek: React/expo import ETMEZ.
 */
import { PrayerTimes, type CalculationParameters, type Coordinates } from 'adhan';
import {
  hesapAyariNormalize,
  hesapParametreleriOlustur,
  VARSAYILAN_HESAP_AYARI,
  type HesapAyari,
  type HesapBaglami,
} from './hesapProfilleri';

let aktif: HesapAyari = { ...VARSAYILAN_HESAP_AYARI };
let surum = 0;

export function aktifHesapAyari(): HesapAyari {
  return aktif;
}

/** Ayar değiştiğinde artar; vakit önbellekleri anahtarına katar. */
export function aktifHesapSurumu(): number {
  return surum;
}

/** Etkin ayarı kurar. İçerik değiştiyse `true` döner (önbellekler tazelenmeli). */
export function aktifHesapAyariniKur(ham: unknown): boolean {
  const yeni = hesapAyariNormalize(ham);
  if (JSON.stringify(yeni) === JSON.stringify(aktif)) return false;
  aktif = yeni;
  surum += 1;
  return true;
}

export function aktifHesapParametreleri(baglam: HesapBaglami = {}): CalculationParameters {
  return hesapParametreleriOlustur(aktif, baglam);
}

/**
 * `new PrayerTimes(koordinat, tarih, aktifHesapParametreleri(...))` kısayolu: parametre
 * GÜN BAŞINA kurulur (Ramazan yatsısı, yüksek enlem). `duzenle` parametreyi hesaptan önce
 * değiştirmek içindir (ör. `rounding`).
 */
export function aktifPrayerTimes(
  koordinat: Coordinates,
  tarih: Date,
  duzenle?: (p: CalculationParameters) => void,
): PrayerTimes {
  const p = hesapParametreleriOlustur(aktif, { tarih, enlem: koordinat.latitude });
  duzenle?.(p);
  return new PrayerTimes(koordinat, tarih, p);
}

/** Yalnız testler için: varsayılana döndürür. */
export function aktifHesapSifirla(): void {
  aktif = { ...VARSAYILAN_HESAP_AYARI };
  surum += 1;
}
