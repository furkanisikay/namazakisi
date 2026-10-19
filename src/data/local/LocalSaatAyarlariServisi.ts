import { NativeModules, Platform } from 'react-native';
import { Depolama } from './Depolama';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import {
    saatAyarlariniNormalize,
    saatUyandirmaDurumlariniCoz,
    saatUyandiriyorMu,
    type SaatAyarlari,
    type SaatTeslimBaglami,
} from '../../core/saat/saatAyarlari';

interface SaatUyandirmaKoprusu {
    /** Native `SaatUyandirmaDeposu` (kimlik → `{islem, hedefMs?}` JSON); eski ikilide yok. */
    saatUyandirmaDurumlari?(): Promise<string>;
}

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

    /**
     * Plan üreticilerinin bağlamı: ayar + saatte verilmiş uyandırma cevapları (yalnız
     * Android, yalnız saat uyandırırken). Cevaplar telefonun NATIVE deposundadır — saatin
     * "kapandı" mesajı JS'i beklemeden orada işlenir. Okunamazsa yalnız ayar
     * döner (asla reddetmez): en kötü ihtimalle bir yedek bir kez daha çalar.
     */
    teslimBaglaminiOku: async (): Promise<SaatTeslimBaglami> => {
        const ayarlar = await LocalSaatAyarlariServisi.oku();
        if (Platform.OS !== 'android' || !saatUyandiriyorMu(ayarlar)) return ayarlar;
        try {
            const kopru = NativeModules.WearSenkron as SaatUyandirmaKoprusu | undefined;
            const ham = await kopru?.saatUyandirmaDurumlari?.();
            if (!ham) return ayarlar;
            return { ...ayarlar, uyandirmaDurumlari: saatUyandirmaDurumlariniCoz(JSON.parse(ham)) };
        } catch (e) {
            Logger.warn('LocalSaatAyarlari', 'Saatin uyandirma cevaplari okunamadi', e);
            return ayarlar;
        }
    },

    guncelle: async (donustur: (mevcut: SaatAyarlari) => SaatAyarlari): Promise<SaatAyarlari> =>
        Depolama.guncelle<SaatAyarlari>(DEPOLAMA_ANAHTARLARI.SAAT_AYARLARI, (ham) =>
            saatAyarlariniNormalize(donustur(saatAyarlariniNormalize(ham)))
        ),
};
