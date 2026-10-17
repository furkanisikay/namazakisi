import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import {
    camiyeGitAyarlariniNormalize,
    varsayilanCamiyeGitAyarlari,
    type CamiyeGitAyarlari,
} from '../../core/camiyeGit/camiyeGitAyarlari';

/**
 * "Camide kılacağım" ayarlarının kalıcılığı (issue #292; ortak model — plan §5.2). Store'suz:
 * arka plan görevi (headless) ve konum yayması da buradan okur. Tip, normalize ve GÖÇ saf
 * modüldedir (`core/camiyeGit/camiyeGitAyarlari.ts`). Bozuk kayıt varsayılana (KAPALI)
 * düşer — sessizce yanlış saatte bildirim kurmaktansa hiç kurmamak yeğdir.
 */
export const LocalCamiyeGitServisi = {
    /** Asla fırlatmaz: bozuk kayıt / okuma hatası varsayılana (KAPALI) düşer. */
    getAyarlar: async (): Promise<CamiyeGitAyarlari> => {
        try {
            return await LocalCamiyeGitServisi.getAyarlarKati();
        } catch (e) {
            Logger.warn('LocalCamiyeGitServisi', 'Ayarlar okunamadi, varsayilana donuldu', e);
            return varsayilanCamiyeGitAyarlari();
        }
    },

    /**
     * Disk OKUNAMAZSA FIRLATIR (bozuk içerik yine varsayılana düşer). Kanal çöp toplaması
     * bunu kullanır: okuma hatasında "kapalı" sanıp bu yüzeyin kanallarını silmesin
     * (`ekHatirlatmaKaynaklari`).
     */
    getAyarlarKati: async (): Promise<CamiyeGitAyarlari> => {
        const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.CAMIYE_GIT_AYARLARI);
        if (ham == null) return varsayilanCamiyeGitAyarlari();
        let cozulen: unknown;
        try {
            cozulen = JSON.parse(ham);
        } catch {
            Logger.warn('LocalCamiyeGitServisi', 'Bozuk kayit (JSON), varsayilana donuldu');
            return varsayilanCamiyeGitAyarlari();
        }
        return camiyeGitAyarlariniNormalize(cozulen);
    },

    saveAyarlar: async (ayarlar: CamiyeGitAyarlari): Promise<boolean> => {
        try {
            await AsyncStorage.setItem(
                DEPOLAMA_ANAHTARLARI.CAMIYE_GIT_AYARLARI,
                JSON.stringify(camiyeGitAyarlariniNormalize(ayarlar))
            );
            return true;
        } catch (e) {
            Logger.error('LocalCamiyeGitServisi', 'Ayarlar kaydedilemedi:', e);
            return false;
        }
    },
};
