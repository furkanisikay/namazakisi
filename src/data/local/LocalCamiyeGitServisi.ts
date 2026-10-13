import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import {
    camiyeGitAyarlariniNormalize,
    VARSAYILAN_CAMIYE_GIT_AYARLARI,
    type CamiyeGitAyarlari,
} from '../../core/camiyeGit/camiyeGitAyarlari';

/**
 * "Camide kılacağım" ayarlarının kalıcılığı (issue #292). Store'suz ve asla
 * fırlatmaz: arka plan görevi (headless) ve konum yayması da buradan okur.
 * Bozuk kayıt varsayılana (KAPALI) düşer — sessizce yanlış saatte bildirim
 * kurmaktansa hiç kurmamak yeğdir.
 */
export const LocalCamiyeGitServisi = {
    getAyarlar: async (): Promise<CamiyeGitAyarlari> => {
        try {
            const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.CAMIYE_GIT_AYARLARI);
            if (ham == null) return camiyeGitAyarlariniNormalize(null);
            return camiyeGitAyarlariniNormalize(JSON.parse(ham));
        } catch (e) {
            Logger.warn('LocalCamiyeGitServisi', 'Ayarlar okunamadi, varsayilana donuldu', e);
            return camiyeGitAyarlariniNormalize(VARSAYILAN_CAMIYE_GIT_AYARLARI);
        }
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
