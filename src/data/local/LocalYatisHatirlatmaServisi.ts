import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import {
    YATIS_DAKIKA_ADIM,
    YATIS_ONCE_ADIM_DK,
    YATIS_ONCE_MAX_DK,
    YATIS_ONCE_MIN_DK,
    YATIS_SAATLERI,
    YATIS_VARSAYILAN_AYARLARI,
    type YatisAyarlari,
} from '../../core/yatis/yatisPlani';

/**
 * Yatış hatırlatması ayarları (issue #290) — VARSAYILAN KAPALI.
 *
 * Bozuk/eksik alan varsayılana düşer: bozuk bir "önce" değeri (0, NaN)
 * yatış anının kendisine ya da geçmişe kurulan bildirim demek olurdu.
 */
const sayiMi = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

const adimaYuvarla = (deger: number, adim: number): number => Math.round(deger / adim) * adim;

export function yatisAyarlariniNormalizeEt(ham: unknown): YatisAyarlari {
    const v = YATIS_VARSAYILAN_AYARLARI;
    if (!ham || typeof ham !== 'object' || Array.isArray(ham)) return { ...v };
    const a = ham as Record<string, unknown>;
    const saat = sayiMi(a.saat) && YATIS_SAATLERI.includes(Math.round(a.saat)) ? Math.round(a.saat) : v.saat;
    const dakika = sayiMi(a.dakika)
        ? Math.min(55, Math.max(0, adimaYuvarla(a.dakika, YATIS_DAKIKA_ADIM)))
        : v.dakika;
    const onceDk = sayiMi(a.onceDk)
        ? Math.min(YATIS_ONCE_MAX_DK, Math.max(YATIS_ONCE_MIN_DK, adimaYuvarla(a.onceDk, YATIS_ONCE_ADIM_DK)))
        : v.onceDk;
    return {
        aktif: a.aktif === true,
        saat,
        dakika,
        onceDk,
        yatsiHatirlatmasi: typeof a.yatsiHatirlatmasi === 'boolean' ? a.yatsiHatirlatmasi : v.yatsiHatirlatmasi,
        muhasebe: typeof a.muhasebe === 'boolean' ? a.muhasebe : v.muhasebe,
    };
}

export const LocalYatisHatirlatmaServisi = {
    getAyarlar: async (): Promise<YatisAyarlari> => {
        try {
            const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.YATIS_HATIRLATMA_AYARLARI);
            if (ham == null) return { ...YATIS_VARSAYILAN_AYARLARI };
            return yatisAyarlariniNormalizeEt(JSON.parse(ham));
        } catch (e) {
            Logger.error('LocalYatisHatirlatmaServisi', 'Ayarlar okunamadi:', e);
            return { ...YATIS_VARSAYILAN_AYARLARI };
        }
    },

    saveAyarlar: async (ayarlar: YatisAyarlari): Promise<boolean> => {
        try {
            await AsyncStorage.setItem(
                DEPOLAMA_ANAHTARLARI.YATIS_HATIRLATMA_AYARLARI,
                JSON.stringify(yatisAyarlariniNormalizeEt(ayarlar))
            );
            return true;
        } catch (e) {
            Logger.error('LocalYatisHatirlatmaServisi', 'Ayarlar kaydedilemedi:', e);
            return false;
        }
    },
};
