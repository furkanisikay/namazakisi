import { Depolama } from './Depolama';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import { mezhepGocKarari, mezhepNormalize, VARSAYILAN_MEZHEP, type Mezhep } from '../../core/mezhep/mezhepAyari';

/**
 * Ortak mezhep ayarı depolaması (Kaza Defteri 2.0). Store'suz okunur: kaza
 * defterinin arka plan taraması ve seferîlik kartı aynı kaynaktan beslenir.
 *
 * Göç: ortak anahtar yoksa eski `SEFERILIK_AYARLARI.mezhep` bir kez taşınır.
 * Okuma ASLA reddetmez (bozuk → Hanefî).
 */
export const LocalMezhepServisi = {
  oku: async (): Promise<Mezhep> => {
    try {
      const [ortak, seferilik] = await Promise.all([
        Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.MEZHEP_AYARI),
        Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI),
      ]);
      const karar = mezhepGocKarari(ortak, seferilik);
      if (karar.yazilmali) {
        try {
          await Depolama.yaz(DEPOLAMA_ANAHTARLARI.MEZHEP_AYARI, { mezhep: karar.mezhep });
        } catch (e) {
          Logger.warn('LocalMezhepServisi', 'Mezhep göçü yazılamadı', e);
        }
      }
      return karar.mezhep;
    } catch (e) {
      Logger.warn('LocalMezhepServisi', 'Mezhep okunamadı, varsayılan kullanılıyor', e);
      return VARSAYILAN_MEZHEP;
    }
  },

  yaz: async (mezhep: Mezhep): Promise<Mezhep> => {
    const normal = mezhepNormalize(mezhep);
    await Depolama.yaz(DEPOLAMA_ANAHTARLARI.MEZHEP_AYARI, { mezhep: normal });
    return normal;
  },
};
