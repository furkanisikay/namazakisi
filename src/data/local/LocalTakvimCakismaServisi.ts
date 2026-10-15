import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import {
    takvimCakismaAyarlariniNormalize,
    type TakvimCakismaAyarlari,
} from '../../core/takvimCakisma/takvimCakismaAyarlari';

/**
 * Takvim çakışması uyarısı ayarlarının kalıcılığı (issue #291). Store'suz ve
 * asla fırlatmaz: arka plan görevi (headless) ve konum yayması da buradan okur.
 * Bozuk kayıt varsayılana (KAPALI) düşer — rıza kaydı olmadan takvim okunmaz.
 * Takvim VERİSİ burada (ya da başka bir yerde) hiç saklanmaz; yalnız ayar.
 */
export const LocalTakvimCakismaServisi = {
    getAyarlar: async (): Promise<TakvimCakismaAyarlari> => {
        try {
            const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.TAKVIM_CAKISMA_AYARLARI);
            if (ham == null) return takvimCakismaAyarlariniNormalize(null);
            return takvimCakismaAyarlariniNormalize(JSON.parse(ham));
        } catch (e) {
            Logger.warn('LocalTakvimCakisma', 'Ayarlar okunamadi, varsayilana donuldu', e);
            return takvimCakismaAyarlariniNormalize(null);
        }
    },

    saveAyarlar: async (ayarlar: TakvimCakismaAyarlari): Promise<boolean> => {
        try {
            await AsyncStorage.setItem(
                DEPOLAMA_ANAHTARLARI.TAKVIM_CAKISMA_AYARLARI,
                JSON.stringify(takvimCakismaAyarlariniNormalize(ayarlar))
            );
            return true;
        } catch (e) {
            Logger.error('LocalTakvimCakisma', 'Ayarlar kaydedilemedi:', e);
            return false;
        }
    },
};
