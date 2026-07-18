import type { SeviyeAyari } from './matrisTipleri';
import { VARSAYILAN_SES_ADI } from './matrisTipleri';
import { ozelSesMi } from './sesKimligi';

/**
 * Ozetteki ses adi. Kullanici sistem seciciden bir ses sectiyse ADI gosterilir;
 * ad cozulememisse (ses silinmis/erisilemez) URI YAZILMAZ — ham `content://...`
 * kullaniciya hicbir sey anlatmaz, kibar bir yedek metin gosterilir.
 */
function sesAdi(seviye: SeviyeAyari): string {
  const ad = seviye.sesAdi?.trim();
  if (ad) return ad;
  return ozelSesMi(seviye.bildirimSesi) ? 'Seçtiğiniz ses' : VARSAYILAN_SES_ADI;
}

export function seviyeOzetiOlustur(seviye: SeviyeAyari): string {
  if (seviye.mod === 'sessiz') return 'Sessiz';
  const parcalar = [`${seviye.esikDk} dk kala`];
  if (seviye.mod === 'bildirim') { parcalar.push('bildirim', sesAdi(seviye)); }
  else if (seviye.mod === 'ikisi') { parcalar.push('bildirim + sesli anons', sesAdi(seviye)); }
  else { parcalar.push('sesli anons'); } // 'sesli'
  return parcalar.join(' · ');
}
