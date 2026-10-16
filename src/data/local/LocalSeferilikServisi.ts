import { Depolama } from './Depolama';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import { LocalMezhepServisi } from './LocalMezhepServisi';
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
  /**
   * `mezhep` ORTAK ayardan gelir (Kaza Defteri 2.0 ile ortaklaştı); bu kayıttaki
   * eski alan yalnız göç kaynağıdır (`LocalMezhepServisi`).
   */
  ayarlariOku: async (): Promise<SeferilikAyarlari> => {
    try {
      const [ayarlar, mezhep] = await Promise.all([
        Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI),
        LocalMezhepServisi.oku(),
      ]);
      return { ...seferilikAyarlariniNormalize(ayarlar), mezhep };
    } catch (e) {
      Logger.error('LocalSeferilikServisi', 'Ayarlar okunamadi:', e);
      return seferilikAyarlariniNormalize(null);
    }
  },

  /**
   * Atomik oku-dönüştür-yaz; sonucu (normalize edilmiş) döner. Mezhep değişikliği
   * çağıran tarafından ÖNCE ortak ayara yazılır; dönen değer ortak ayarı yansıtır.
   */
  ayarlariGuncelle: async (
    donustur: (mevcut: SeferilikAyarlari) => SeferilikAyarlari,
  ): Promise<SeferilikAyarlari> => {
    const mezhep = await LocalMezhepServisi.oku();
    const sonuc = await Depolama.guncelle<SeferilikAyarlari>(DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI, (ham) =>
      seferilikAyarlariniNormalize(donustur({ ...seferilikAyarlariniNormalize(ham), mezhep })),
    );
    return { ...sonuc, mezhep };
  },

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
