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

/** TEMBEL: Apple Watch köprüsü native'dir; Android/test yolunda modül yüklenmesin. */
const iosKoprusu = () =>
    require('../../../modules/expo-siri-kisayollari/src') as typeof import('../../../modules/expo-siri-kisayollari/src');

/**
 * iOS'ta (Apple Watch, #285 cilası) iki düzeltme:
 *  - Bu build saat uygulamasını taşımıyorsa ayar "telefon"a düşer — saat yokken telefon
 *    uyandırmasını 3 dk geciktirmek kimseyi uyandırmamak olurdu.
 *  - Apple Watch konuşmaz → anons daima telefonda (`otomatik`). Ekran anons seçimini
 *    iOS'ta göstermez; bayat bir `saat` kaydı telefonu susturmasın.
 */
function iosAyarlari(a: SaatAyarlari): SaatAyarlari {
    let saatVar = false;
    try {
        saatVar = iosKoprusu().saatUygulamasiDestekli();
    } catch {
        saatVar = false;
    }
    return { uyandirmaYeri: saatVar ? a.uyandirmaYeri : 'telefon', anonsYeri: 'otomatik' };
}

/**
 * Saat (Wear OS / Apple Watch) iş bölümü ayarı (saat W3). Store'SUZ okunur: arka plan planlayıcıları
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
     * saat uyandırırken; Android `WearSenkron`, iOS `SaatKoprusu` deposu). Cevaplar telefonun NATIVE deposundadır — saatin
     * "kapandı" mesajı JS'i beklemeden orada işlenir. Okunamazsa yalnız ayar
     * döner (asla reddetmez): en kötü ihtimalle bir yedek bir kez daha çalar.
     */
    teslimBaglaminiOku: async (): Promise<SaatTeslimBaglami> => {
        const okunan = await LocalSaatAyarlariServisi.oku();
        const ayarlar = Platform.OS === 'ios' ? iosAyarlari(okunan) : okunan;
        if ((Platform.OS !== 'android' && Platform.OS !== 'ios') || !saatUyandiriyorMu(ayarlar)) return ayarlar;
        try {
            const ham =
                Platform.OS === 'ios'
                    ? await iosKoprusu().saatUyandirmaDurumlariniOku()
                    : await (NativeModules.WearSenkron as SaatUyandirmaKoprusu | undefined)?.saatUyandirmaDurumlari?.();
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
