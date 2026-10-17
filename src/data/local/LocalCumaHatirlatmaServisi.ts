import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import {
    cumaAyarlariniNormalize,
    varsayilanCumaAyarlari,
    type CumaHatirlatmaAyarlari,
} from '../../core/cuma/cumaAyarlari';

/**
 * Cuma namazı hatırlatması ayarları (issue #173; ortak model — plan §5.1).
 *
 * Tip, kısıtlar, normalize ve GÖÇ saf modüldedir (`core/cuma/cumaAyarlari.ts`); bu katman
 * yalnız diske okur/yazar. Geriye uyumlu dışa aktarımlar aşağıda (ekran/testler buradan
 * içe aktarır).
 */
export {
    CUMA_ONCEDEN_MIN_DK,
    CUMA_ONCEDEN_MAX_DK,
    CUMA_ONCEDEN_ADIM_DK,
    CUMA_TEKRAR_MIN_DK,
    CUMA_TEKRAR_MAX_DK,
    CUMA_VARSAYILAN_TEKRAR_DK,
    type CumaHatirlatmaAyarlari,
} from '../../core/cuma/cumaAyarlari';

export const LocalCumaHatirlatmaServisi = {
    /** Asla fırlatmaz: bozuk kayıt / okuma hatası varsayılana (KAPALI) düşer. */
    getAyarlar: async (): Promise<CumaHatirlatmaAyarlari> => {
        try {
            return await LocalCumaHatirlatmaServisi.getAyarlarKati();
        } catch (e) {
            Logger.error('LocalCumaHatirlatmaServisi', 'Ayarlar okunamadi:', e);
            return varsayilanCumaAyarlari();
        }
    },

    /**
     * Disk OKUNAMAZSA FIRLATIR (bozuk içerik yine varsayılana düşer). Kanal çöp toplaması
     * bunu kullanır: okuma hatasında "cuma kapalı" sanıp cumanın kanallarını silmesin
     * (`ekHatirlatmaKaynaklari`).
     */
    getAyarlarKati: async (): Promise<CumaHatirlatmaAyarlari> => {
        const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.CUMA_HATIRLATMA_AYARLARI);
        if (ham == null) return varsayilanCumaAyarlari();
        let cozulen: unknown;
        try {
            cozulen = JSON.parse(ham);
        } catch {
            Logger.warn('LocalCumaHatirlatmaServisi', 'Bozuk kayit (JSON), varsayilana donuldu');
            return varsayilanCumaAyarlari();
        }
        // Nesne dışı (null / sayı / dizi) bozuk kayıt: varsayılana dön, ÇÖKME.
        if (!cozulen || typeof cozulen !== 'object' || Array.isArray(cozulen)) {
            Logger.warn('LocalCumaHatirlatmaServisi', 'Bozuk kayit, varsayilana donuldu');
            return varsayilanCumaAyarlari();
        }
        return cumaAyarlariniNormalize(cozulen);
    },

    saveAyarlar: async (ayarlar: CumaHatirlatmaAyarlari): Promise<boolean> => {
        try {
            // Normalize + TÜREV alanlar (`oncedenDk`, `siklik`) yazılır: eski sürüm okuyabilsin.
            const normalize = cumaAyarlariniNormalize(ayarlar);
            await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.CUMA_HATIRLATMA_AYARLARI, JSON.stringify(normalize));
            return true;
        } catch (e) {
            Logger.error('LocalCumaHatirlatmaServisi', 'Ayarlar kaydedilemedi:', e);
            return false;
        }
    },
};
