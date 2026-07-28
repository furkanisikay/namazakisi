import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';

/**
 * Cuma namazi hatirlatmasi ayarlari (issue #173).
 *
 * VARSAYILAN KAPALI: cuma namazi herkese farz-i ayn degildir; ozellik ayardan
 * acilir. Cinsiyet/durum verisi TOPLANMAZ — karar kullanicinindir.
 */
export interface CumaHatirlatmaAyarlari {
    aktif: boolean;
    /** Ogle vaktinden kac dakika once hatirlatilsin (cemaate yetisme suresi). */
    oncedenDk: number;
}

export const CUMA_ONCEDEN_MIN_DK = 15;
export const CUMA_ONCEDEN_MAX_DK = 180;
export const CUMA_ONCEDEN_ADIM_DK = 15;

const VARSAYILAN_AYARLAR: CumaHatirlatmaAyarlari = {
    aktif: false,
    oncedenDk: 60,
};

/** Diskten gelen degeri guvenli araliga cekar (bozuk kayit planlamayi bozmasin). */
const oncedenDkNormalize = (deger: unknown): number => {
    if (typeof deger !== 'number' || !Number.isFinite(deger)) return VARSAYILAN_AYARLAR.oncedenDk;
    return Math.min(CUMA_ONCEDEN_MAX_DK, Math.max(CUMA_ONCEDEN_MIN_DK, Math.round(deger)));
};

export const LocalCumaHatirlatmaServisi = {
    getAyarlar: async (): Promise<CumaHatirlatmaAyarlari> => {
        try {
            const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.CUMA_HATIRLATMA_AYARLARI);
            if (ham == null) return VARSAYILAN_AYARLAR;

            const cozulen = JSON.parse(ham);
            // Nesne disi (null / sayi / dizi) bozuk kayit: varsayilana don, COKME.
            if (!cozulen || typeof cozulen !== 'object' || Array.isArray(cozulen)) {
                Logger.warn('LocalCumaHatirlatmaServisi', 'Bozuk kayit, varsayilana donuldu');
                return VARSAYILAN_AYARLAR;
            }

            return {
                aktif: cozulen.aktif === true,
                oncedenDk: oncedenDkNormalize(cozulen.oncedenDk),
            };
        } catch (e) {
            Logger.error('LocalCumaHatirlatmaServisi', 'Ayarlar okunamadi:', e);
            return VARSAYILAN_AYARLAR;
        }
    },

    saveAyarlar: async (ayarlar: CumaHatirlatmaAyarlari): Promise<boolean> => {
        try {
            const normalize: CumaHatirlatmaAyarlari = {
                aktif: ayarlar.aktif === true,
                oncedenDk: oncedenDkNormalize(ayarlar.oncedenDk),
            };
            await AsyncStorage.setItem(
                DEPOLAMA_ANAHTARLARI.CUMA_HATIRLATMA_AYARLARI,
                JSON.stringify(normalize)
            );
            return true;
        } catch (e) {
            Logger.error('LocalCumaHatirlatmaServisi', 'Ayarlar kaydedilemedi:', e);
            return false;
        }
    },
};
