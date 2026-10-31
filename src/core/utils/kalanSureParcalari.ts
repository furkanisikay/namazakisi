/**
 * Geri sayımın GÖRÜNEN biçimi — birimli parçalar (saat, TV ve sade görünümle aynı dil).
 *
 * Ana ekran sayacı "01:09:09" yazıyordu: duvar saatinin yanında saat gibi okunur, kaç
 * saat/dakika olduğu tek bakışta anlaşılmaz. Kurallar (Wear `AnaEkranKarari.sayac` ve
 * TV `Bicim.kalanParcalari` ikizi):
 *  - bir saat ve üstü: "1 sa 9 dk" (saniye yok — saatlerce saniye saymak gürültü)
 *  - bir saatin altı:  "9 dk 05 sn" (saniye iki haneli → satır oynamaz)
 *  - bir dakikanın altı: "42 sn"
 * SAF: girdi AnaSayfa'nın ürettiği "SS:DD:ss" dizesidir; bozuksa olduğu gibi tek parça döner.
 */
import { metin, sayili } from '../dil/aktifDil';
import { parcali } from '../dil/sure';

export interface SureParcasi {
  sayi: string;
  birim: string;
}

type Birim = 'sa' | 'dk' | 'sn';

function kodluParcalar(ssddss: string): { sayi: string; kod: Birim | null }[] {
  const eslesme = /^(\d+):(\d{2}):(\d{2})$/.exec(ssddss.trim());
  if (!eslesme) return [{ sayi: ssddss, kod: null }];
  const sa = Number(eslesme[1]);
  const dk = Number(eslesme[2]);
  const sn = eslesme[3];
  if (sa > 0) return [{ sayi: String(sa), kod: 'sa' }, { sayi: String(dk), kod: 'dk' }];
  if (dk > 0) return [{ sayi: String(dk), kod: 'dk' }, { sayi: sn, kod: 'sn' }];
  return [{ sayi: String(Number(sn)), kod: 'sn' }];
}

/** Birimler etkin dilde ("1 sa 9 dk" / "1 h 9 min"). */
export function kalanSureParcalari(ssddss: string): SureParcasi[] {
  const kisa = metin().sure.kisa;
  return kodluParcalar(ssddss).map((p) => ({ sayi: p.sayi, birim: p.kod ? kisa[p.kod] : '' }));
}

/**
 * Ekran okuyucu metni: "1 saat 9 dakika", "9 dakika 5 saniye", "42 saniye". Parçalar
 * sözlüğün `sure.parcali` kalıbıyla birleşir (Çincede boşluksuz).
 */
export function kalanSureSesli(ssddss: string): string {
  const s = metin().sure;
  const uzun = { sa: s.saat, dk: s.dakika, sn: s.saniye };
  return parcali(kodluParcalar(ssddss).map((p) => (p.kod ? sayili(uzun[p.kod], Number(p.sayi)) : p.sayi)));
}
