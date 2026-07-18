import type { SeviyeAyari } from './matrisTipleri';
import { sesGorunenAdi } from './sesKimligi';

/** Ozetteki ses adi — gosterim kurali `sesGorunenAdi` ile PAYLASILIR (tek kaynak). */
const sesAdi = (seviye: SeviyeAyari): string =>
  sesGorunenAdi(seviye.bildirimSesi, seviye.sesAdi);

export function seviyeOzetiOlustur(seviye: SeviyeAyari): string {
  if (seviye.mod === 'sessiz') return 'Sessiz';
  const parcalar = [`${seviye.esikDk} dk kala`];
  if (seviye.mod === 'bildirim') { parcalar.push('bildirim', sesAdi(seviye)); }
  else if (seviye.mod === 'ikisi') { parcalar.push('bildirim + sesli anons', sesAdi(seviye)); }
  else { parcalar.push('sesli anons'); } // 'sesli'
  return parcalar.join(' · ');
}
