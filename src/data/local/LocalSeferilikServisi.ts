import { Depolama } from './Depolama';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import {
  seferilikAyarlariniNormalize,
  seferilikHafizasiniNormalize,
  type SeferilikAyarlari,
  type SeferilikKartHafizasi,
} from '../../core/seferilik/seferilikAyarlari';

/**
 * Seferîlik bilgi kartı depolaması (issue #296).
 *
 * Okuma ASLA reddetmez: bozuk/nesne-dışı kayıt varsayılana düşer (AGENTS.md
 * "sessiz sonsuz spinner" dersi). Yazımlar `Depolama.guncelle` ile atomiktir:
 * arka plan (konum değişimi yayma listesi) ile ekran aynı anda ikamet/hafıza
 * yazabilir.
 */
export const LocalSeferilikServisi = {
  ayarlariOku: async (): Promise<SeferilikAyarlari> => {
    try {
      return seferilikAyarlariniNormalize(await Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI));
    } catch (e) {
      Logger.error('LocalSeferilikServisi', 'Ayarlar okunamadi:', e);
      return seferilikAyarlariniNormalize(null);
    }
  },

  /** Atomik oku-dönüştür-yaz; sonucu (normalize edilmiş) döner. */
  ayarlariGuncelle: async (
    donustur: (mevcut: SeferilikAyarlari) => SeferilikAyarlari,
  ): Promise<SeferilikAyarlari> =>
    Depolama.guncelle<SeferilikAyarlari>(DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI, (ham) =>
      seferilikAyarlariniNormalize(donustur(seferilikAyarlariniNormalize(ham))),
    ),

  hafizaOku: async (): Promise<SeferilikKartHafizasi> => {
    try {
      return seferilikHafizasiniNormalize(await Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.SEFERILIK_KART_HAFIZASI));
    } catch (e) {
      Logger.error('LocalSeferilikServisi', 'Kart hafizasi okunamadi:', e);
      return seferilikHafizasiniNormalize(null);
    }
  },

  hafizaYaz: async (hafiza: SeferilikKartHafizasi): Promise<SeferilikKartHafizasi> => {
    const normal = seferilikHafizasiniNormalize(hafiza);
    await Depolama.yaz(DEPOLAMA_ANAHTARLARI.SEFERILIK_KART_HAFIZASI, normal);
    return normal;
  },
};
