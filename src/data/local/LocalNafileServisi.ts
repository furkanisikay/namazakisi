import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import {
    NAFILE_OFSET_MAX_DK,
    NAFILE_OFSET_MIN_DK,
    TEHECCUD_IMSAK_ONCESI_MAX_DK,
    TEHECCUD_IMSAK_ONCESI_MIN_DK,
    VARSAYILAN_NAFILE_AYARLARI,
    nafileHatirlatmaAcikMi,
    type GunduzHatirlatmaAyari,
    type NafileAyarlari,
    type TeheccudAyari,
} from '../../core/nafile/nafileTipleri';

/**
 * Nafile namaz ayarları (issue #77).
 *
 * Okuma ASLA reddetmez: bozuk/nesne-dışı kayıt varsayılana, eksik alan
 * varsayılandan tamamlanır, sınır dışı sayı kenetlenir (`LocalCumaHatirlatmaServisi`
 * deseni; AGENTS.md "sessiz sonsuz spinner" dersi).
 */

const nesneMi = (d: unknown): d is Record<string, unknown> =>
    !!d && typeof d === 'object' && !Array.isArray(d);

const sayiKenetle = (deger: unknown, min: number, max: number, varsayilan: number): number => {
    if (typeof deger !== 'number' || !Number.isFinite(deger)) return varsayilan;
    return Math.min(max, Math.max(min, Math.round(deger)));
};

const gunduzNormalize = (ham: unknown, varsayilan: GunduzHatirlatmaAyari): GunduzHatirlatmaAyari => {
    if (!nesneMi(ham)) return { ...varsayilan };
    return {
        aktif: ham.aktif === true,
        ofsetDk: sayiKenetle(ham.ofsetDk, NAFILE_OFSET_MIN_DK, NAFILE_OFSET_MAX_DK, varsayilan.ofsetDk),
    };
};

const teheccudNormalize = (ham: unknown): TeheccudAyari => {
    const v = VARSAYILAN_NAFILE_AYARLARI.teheccud;
    if (!nesneMi(ham)) return { ...v };
    return {
        aktif: ham.aktif === true,
        hedef: ham.hedef === 'imsaktanOnce' ? 'imsaktanOnce' : 'sonUcteBir',
        imsaktanOnceDk: sayiKenetle(
            ham.imsaktanOnceDk,
            TEHECCUD_IMSAK_ONCESI_MIN_DK,
            TEHECCUD_IMSAK_ONCESI_MAX_DK,
            v.imsaktanOnceDk
        ),
        uyandirma: ham.uyandirma === true,
    };
};

/** Herhangi bir değeri geçerli `NafileAyarlari`ya çevirir (disk + slice + yedek yolu). */
export const nafileAyarlariniNormalize = (ham: unknown): NafileAyarlari => {
    if (!nesneMi(ham)) {
        return {
            ...VARSAYILAN_NAFILE_AYARLARI,
            hatirlatmalar: {
                kusluk: { ...VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar.kusluk },
                evvabin: { ...VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar.evvabin },
            },
            teheccud: { ...VARSAYILAN_NAFILE_AYARLARI.teheccud },
        };
    }
    const hatirlatmalar = nesneMi(ham.hatirlatmalar) ? ham.hatirlatmalar : {};
    return {
        gostergeAktif: ham.gostergeAktif === true,
        hatirlatmalar: {
            kusluk: gunduzNormalize(hatirlatmalar.kusluk, VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar.kusluk),
            evvabin: gunduzNormalize(hatirlatmalar.evvabin, VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar.evvabin),
        },
        teheccud: teheccudNormalize(ham.teheccud),
        // Yalnız AÇIKKEN yazılır: eski kayıt / varsayılan birebir aynı nesneyi üretir.
        ...(ham.gunuGununeKur === true ? { gunuGununeKur: true } : {}),
    };
};

/** En az bir hatırlatma açık mı? — saf tanım `nafileTipleri`nde (bildirim defteri de kullanır). */
export { nafileHatirlatmaAcikMi };

export const LocalNafileServisi = {
    getAyarlar: async (): Promise<NafileAyarlari> => {
        try {
            const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.NAFILE_AYARLARI);
            if (ham == null) return nafileAyarlariniNormalize(null);
            let cozulen: unknown;
            try {
                cozulen = JSON.parse(ham);
            } catch {
                Logger.warn('LocalNafileServisi', 'Bozuk kayit (JSON), varsayilana donuldu');
                return nafileAyarlariniNormalize(null);
            }
            if (!nesneMi(cozulen)) {
                Logger.warn('LocalNafileServisi', 'Bozuk kayit (nesne degil), varsayilana donuldu');
            }
            return nafileAyarlariniNormalize(cozulen);
        } catch (e) {
            Logger.error('LocalNafileServisi', 'Ayarlar okunamadi:', e);
            return nafileAyarlariniNormalize(null);
        }
    },

    saveAyarlar: async (ayarlar: NafileAyarlari): Promise<boolean> => {
        try {
            await AsyncStorage.setItem(
                DEPOLAMA_ANAHTARLARI.NAFILE_AYARLARI,
                JSON.stringify(nafileAyarlariniNormalize(ayarlar))
            );
            return true;
        } catch (e) {
            Logger.error('LocalNafileServisi', 'Ayarlar kaydedilemedi:', e);
            return false;
        }
    },
};
