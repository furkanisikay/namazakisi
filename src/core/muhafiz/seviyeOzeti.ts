import type { SeviyeAyari } from './matrisTipleri';
import { SES_PALETI } from './matrisTipleri';

function sesAdi(id: string): string {
  return SES_PALETI.find((s) => s.id === id)?.ad ?? id;
}

export function seviyeOzetiOlustur(seviye: SeviyeAyari): string {
  if (seviye.mod === 'sessiz') return 'Sessiz';
  const parcalar = [`${seviye.esikDk} dk kala`];
  if (seviye.mod === 'bildirim') { parcalar.push('bildirim', sesAdi(seviye.bildirimSesi)); }
  else if (seviye.mod === 'ikisi') { parcalar.push('bildirim + sesli anons', sesAdi(seviye.bildirimSesi)); }
  else { parcalar.push('sesli anons'); } // 'sesli'
  return parcalar.join(' · ');
}
