import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import type { Siklik } from '../../core/muhafiz/matrisTipleri';

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
    /**
     * Hatirlatma TEKRARLANSIN MI (Faz 4 — periyodik cuma)?
     *
     * `'birkez'` = tarihsel davranis: yalniz `oncedenDk` aninda tek bildirim.
     * `{ herDk: n }` = `oncedenDk` dakika kala baslar, vakit girene kadar n
     * dakikada bir hatirlatir. Motorun `Siklik` tipiyle AYNIdir: pencere
     * (`ogle - oncedenDk` → `ogle`) ortak plan ureticisine verilir, ayri bir
     * "cuma zamanlama mantigi" YOKTUR.
     *
     * ALAN YOKSA `'birkez'` — eski kayit birebir eski davranisi uretir, goc yok.
     */
    siklik: Siklik;
}

export const CUMA_ONCEDEN_MIN_DK = 15;
export const CUMA_ONCEDEN_MAX_DK = 180;
export const CUMA_ONCEDEN_ADIM_DK = 15;

/**
 * Tekrar araligi sinirlari.
 *
 * Alt sinir 5 dk (muhafizin 1 dk'si DEGIL): cuma hatirlatmasi "vakit cikiyor"
 * degil "camiye yetis" mantigindadir; dakika dakika uyarmak faydasiz gurultudur.
 * Ust sinir 60 dk — daha genisi `oncedenDk` ust siniriyla (180) anlamsizlasir.
 */
export const CUMA_TEKRAR_MIN_DK = 5;
export const CUMA_TEKRAR_MAX_DK = 60;
export const CUMA_VARSAYILAN_TEKRAR_DK = 15;

const VARSAYILAN_AYARLAR: CumaHatirlatmaAyarlari = {
    aktif: false,
    oncedenDk: 60,
    siklik: 'birkez',
};

/** Diskten gelen degeri guvenli araliga cekar (bozuk kayit planlamayi bozmasin). */
const oncedenDkNormalize = (deger: unknown): number => {
    if (typeof deger !== 'number' || !Number.isFinite(deger)) return VARSAYILAN_AYARLAR.oncedenDk;
    return Math.min(CUMA_ONCEDEN_MAX_DK, Math.max(CUMA_ONCEDEN_MIN_DK, Math.round(deger)));
};

/**
 * Bozuk/eksik `siklik` degeri `'birkez'`e duser.
 *
 * Sessizce "birkez"e dusmek bilinclidir: bozuk bir sayidan (0, negatif, NaN)
 * periyodik plan uretmek tek cumada yuzlerce bildirim demek olurdu.
 */
const siklikNormalize = (deger: unknown): Siklik => {
    if (deger === 'birkez') return 'birkez';
    if (!deger || typeof deger !== 'object' || Array.isArray(deger)) return 'birkez';
    const herDk = (deger as { herDk?: unknown }).herDk;
    if (typeof herDk !== 'number' || !Number.isFinite(herDk) || herDk <= 0) return 'birkez';
    return {
        herDk: Math.min(CUMA_TEKRAR_MAX_DK, Math.max(CUMA_TEKRAR_MIN_DK, Math.round(herDk))),
    };
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
                siklik: siklikNormalize(cozulen.siklik),
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
                siklik: siklikNormalize(ayarlar.siklik),
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
