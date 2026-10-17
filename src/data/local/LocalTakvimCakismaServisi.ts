import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import {
    takvimCakismaAyarlariniNormalize,
    varsayilanTakvimCakismaAyarlari,
    type TakvimCakismaAyarlari,
} from '../../core/takvimCakisma/takvimCakismaAyarlari';

/**
 * Takvim çakışması uyarısı ayarlarının kalıcılığı (issue #291; ortak model — plan §5.4).
 * Store'suz: arka plan görevi (headless) ve konum yayması da buradan okur. Tip, normalize
 * ve GÖÇ saf modüldedir (`core/takvimCakisma/takvimCakismaAyarlari.ts`).
 * Bozuk kayıt varsayılana (KAPALI) düşer — rıza kaydı olmadan takvim okunmaz.
 * Takvim VERİSİ burada (ya da başka bir yerde) hiç saklanmaz; yalnız ayar.
 */
export const LocalTakvimCakismaServisi = {
    /** Asla fırlatmaz: bozuk kayıt / okuma hatası varsayılana (KAPALI) düşer. */
    getAyarlar: async (): Promise<TakvimCakismaAyarlari> => {
        try {
            return await LocalTakvimCakismaServisi.getAyarlarKati();
        } catch (e) {
            Logger.warn('LocalTakvimCakisma', 'Ayarlar okunamadi, varsayilana donuldu', e);
            return varsayilanTakvimCakismaAyarlari();
        }
    },

    /**
     * Disk OKUNAMAZSA FIRLATIR (bozuk içerik yine varsayılana düşer). Kanal çöp toplaması
     * bunu kullanır: okuma hatasında "kapalı" sanıp bu yüzeyin kanallarını silmesin
     * (`ekHatirlatmaKaynaklari`).
     */
    getAyarlarKati: async (): Promise<TakvimCakismaAyarlari> => {
        const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.TAKVIM_CAKISMA_AYARLARI);
        if (ham == null) return varsayilanTakvimCakismaAyarlari();
        let cozulen: unknown;
        try {
            cozulen = JSON.parse(ham);
        } catch {
            Logger.warn('LocalTakvimCakisma', 'Bozuk kayit (JSON), varsayilana donuldu');
            return varsayilanTakvimCakismaAyarlari();
        }
        return takvimCakismaAyarlariniNormalize(cozulen);
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
