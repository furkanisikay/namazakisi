import type { SeviyeAyari } from './matrisTipleri';
import type { PencereYonu } from './pencereTipleri';
import { VARSAYILAN_PENCERE_YONU } from './pencereTipleri';
import { sesGorunenAdi } from './sesKimligi';

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
  // Motorun ic dili 'sessiz'dir; kullaniciya "Kapali" denir. "Sessiz" demek,
  // bildirimin gelip ses cikarmadigi (kanal sesi / cihazin sessiz modu) durumla
  // karisiyordu. Ayrac ' — ': digerlerindeki ' · ' AYAR YUZLERINI ayirir, bu ise
  // tek bir aciklamadir. "bildirim" degil "uyari": adim 'sesli' modda da olabilir.
  if (seviye.mod === 'sessiz') return 'Kapalı — uyarı almazsınız';
  const parcalar = [esikIfadesi(seviye.esikDk, yon)];
  if (seviye.mod === 'bildirim') { parcalar.push('bildirim', sesAdi(seviye)); }
  else if (seviye.mod === 'ikisi') { parcalar.push('bildirim + sesli anons', sesAdi(seviye)); }
  else { parcalar.push('sesli anons'); } // 'sesli'
  return parcalar.join(' · ');
}
