import type { SeviyeAyari } from './matrisTipleri';
import type { PencereYonu } from './pencereTipleri';
import { VARSAYILAN_PENCERE_YONU } from './pencereTipleri';
import { sesGorunenAdi } from './sesKimligi';
import { adimKapaliMi, kanalAcikMi } from './kanalKumesi';

/** Ozetteki ses adi — gosterim kurali `sesGorunenAdi` ile PAYLASILIR (tek kaynak). */
const sesAdi = (seviye: SeviyeAyari): string =>
  sesGorunenAdi(seviye.bildirimSesi, seviye.sesAdi);

/**
 * Esigin okunan hali — yone gore. Cikista esik "cikisa kalan", giriste
 * "girisinden gecen" dakikadir; ayni sayi iki yonde ZIT ani gosterir.
 * Kullaniciya donuk metin (kibar "siz" kaydi, cumle parcasi).
 */
export const esikIfadesi = (esikDk: number, yon: PencereYonu): string =>
  yon === 'girisindenItibaren' ? `girişten ${esikDk} dk sonra` : `${esikDk} dk kala`;

export function seviyeOzetiOlustur(
  seviye: SeviyeAyari,
  yon: PencereYonu = VARSAYILAN_PENCERE_YONU
): string {
  // Motorun ic dili "hicbir kanal acik degil"dir; kullaniciya "Kapali" denir.
  // "Sessiz" demek, bildirimin gelip ses cikarmadigi (kanal sesi / cihazin sessiz
  // modu) durumla karisiyordu. Ayrac ' — ': digerlerindeki ' · ' AYAR YUZLERINI
  // ayirir, bu ise tek bir aciklamadir. "bildirim" degil "uyari": adim yalnizca
  // sesli anonsla da kurulmus olabilir.
  if (adimKapaliMi(seviye.kanallar)) return 'Kapalı — uyarı almazsınız';

  const bildirim = kanalAcikMi(seviye.kanallar, 'bildirim');
  const sesli = kanalAcikMi(seviye.kanallar, 'sesli');
  const parcalar = [esikIfadesi(seviye.esikDk, yon)];
  if (bildirim && sesli) parcalar.push('bildirim + sesli anons', sesAdi(seviye));
  else if (bildirim) parcalar.push('bildirim', sesAdi(seviye));
  else if (sesli) parcalar.push('sesli anons');
  // Titresim BAGIMSIZ bir kanaldir (Faz 6): otekilerin yerine gecmez, yanina
  // eklenir. Yalniz titresimle kurulmus adim da mesrudur ve KAPALI degildir.
  if (kanalAcikMi(seviye.kanallar, 'titresim')) parcalar.push('titreşim');
  return parcalar.join(' · ');
}
