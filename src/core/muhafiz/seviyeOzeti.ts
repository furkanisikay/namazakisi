import type { SeviyeAyari } from './matrisTipleri';
import { sesGorunenAdi } from './sesKimligi';

/** Ozetteki ses adi — gosterim kurali `sesGorunenAdi` ile PAYLASILIR (tek kaynak). */
const sesAdi = (seviye: SeviyeAyari): string =>
  sesGorunenAdi(seviye.bildirimSesi, seviye.sesAdi);

export function seviyeOzetiOlustur(seviye: SeviyeAyari): string {
  // Motorun ic dili 'sessiz'dir; kullaniciya "Kapali" denir. "Sessiz" demek,
  // bildirimin gelip ses cikarmadigi (kanal sesi / cihazin sessiz modu) durumla
  // karisiyordu. Ayrac ' — ': digerlerindeki ' · ' AYAR YUZLERINI ayirir, bu ise
  // tek bir aciklamadir. "bildirim" degil "uyari": adim 'sesli' modda da olabilir.
  if (seviye.mod === 'sessiz') return 'Kapalı — uyarı almazsınız';
  const parcalar = [`${seviye.esikDk} dk kala`];
  if (seviye.mod === 'bildirim') { parcalar.push('bildirim', sesAdi(seviye)); }
  else if (seviye.mod === 'ikisi') { parcalar.push('bildirim + sesli anons', sesAdi(seviye)); }
  else { parcalar.push('sesli anons'); } // 'sesli'
  return parcalar.join(' · ');
}
