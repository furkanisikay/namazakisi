import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import {
    varsayilanYatisAyarlari,
    yatisAyarlariniNormalize,
    type YatisAyarlari,
} from '../../core/yatis/yatisAyarlari';

/**
 * Yatış hatırlatması ayarları (issue #290; ortak model — plan §5.3) — VARSAYILAN KAPALI.
 *
 * Tip, kısıtlar, normalize ve GÖÇ saf modüldedir (`core/yatis/yatisAyarlari.ts`); bu katman
 * yalnız diske okur/yazar. Bozuk/eksik alan varsayılana düşer: bozuk bir "önce" değeri
 * (0, NaN) yatış anının kendisine ya da geçmişe kurulan bildirim demek olurdu.
 */

/** Geriye uyumlu ad (testler ve eski çağıranlar). */
export const yatisAyarlariniNormalizeEt = yatisAyarlariniNormalize;

export const LocalYatisHatirlatmaServisi = {
    /** Asla fırlatmaz: bozuk kayıt / okuma hatası varsayılana (KAPALI) düşer. */
    getAyarlar: async (): Promise<YatisAyarlari> => {
        try {
            return await LocalYatisHatirlatmaServisi.getAyarlarKati();
        } catch (e) {
            Logger.error('LocalYatisHatirlatmaServisi', 'Ayarlar okunamadi:', e);
            return varsayilanYatisAyarlari();
        }
    },

    /**
     * Disk OKUNAMAZSA FIRLATIR (bozuk içerik yine varsayılana düşer). Kanal çöp toplaması
     * bunu kullanır: okuma hatasında "kapalı" sanıp yatışın kanallarını silmesin
     * (`ekHatirlatmaKaynaklari`).
     */
    getAyarlarKati: async (): Promise<YatisAyarlari> => {
        const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.YATIS_HATIRLATMA_AYARLARI);
        if (ham == null) return varsayilanYatisAyarlari();
        let cozulen: unknown;
        try {
            cozulen = JSON.parse(ham);
        } catch {
            Logger.warn('LocalYatisHatirlatmaServisi', 'Bozuk kayit (JSON), varsayilana donuldu');
            return varsayilanYatisAyarlari();
        }
        return yatisAyarlariniNormalize(cozulen);
    },

    saveAyarlar: async (ayarlar: YatisAyarlari): Promise<boolean> => {
        try {
            // Normalize + TÜREV `onceDk` yazılır: eski sürüm okuyabilsin.
            await AsyncStorage.setItem(
                DEPOLAMA_ANAHTARLARI.YATIS_HATIRLATMA_AYARLARI,
                JSON.stringify(yatisAyarlariniNormalize(ayarlar))
            );
            return true;
        } catch (e) {
            Logger.error('LocalYatisHatirlatmaServisi', 'Ayarlar kaydedilemedi:', e);
            return false;
        }
    },
};
