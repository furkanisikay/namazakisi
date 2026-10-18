import { Depolama } from './Depolama';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import { saatAyarlariniNormalize, type SaatAyarlari } from '../../core/saat/saatAyarlari';

/**
 * Saat (Wear OS) iş bölümü ayarı (saat W3). Store'SUZ okunur: arka plan planlayıcıları
 * (muhafız, nafile, saat yükü, bildirim defteri) Redux'u görmez.
 *
 * Okuma ASLA reddetmez — bozuk kayıt varsayılana düşer (varsayılan = bugünkü davranış:
 * telefon uyandırır, telefon konuşur). Yazım atomiktir (`Depolama.guncelle`).
 */
export const LocalSaatAyarlariServisi = {
    oku: async (): Promise<SaatAyarlari> => {
        try {
            return saatAyarlariniNormalize(await Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.SAAT_AYARLARI));
        } catch (e) {
            Logger.warn('LocalSaatAyarlari', 'Saat ayarlari okunamadi; varsayilan kullaniliyor', e);
            return saatAyarlariniNormalize(null);
        }
    },

    guncelle: async (donustur: (mevcut: SaatAyarlari) => SaatAyarlari): Promise<SaatAyarlari> =>
        Depolama.guncelle<SaatAyarlari>(DEPOLAMA_ANAHTARLARI.SAAT_AYARLARI, (ham) =>
            saatAyarlariniNormalize(donustur(saatAyarlariniNormalize(ham)))
        ),
};
