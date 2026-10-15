import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import { gunEkle } from '../../core/utils/TarihYardimcisi';
import {
    VARSAYILAN_NAFILE_AYARLARI,
    nafileHatirlatmaAcikMi,
    type NafileAyarlari,
    type NafileTuru,
} from '../../core/nafile/nafileTipleri';
import { gunduzNafileNormalize, teheccudNormalize } from '../../core/nafile/nafileAdimlari';

/**
 * Nafile namaz ayarları (issue #77, #273).
 *
 * Okuma ASLA reddetmez: bozuk/nesne-dışı kayıt varsayılana, eksik alan
 * varsayılandan tamamlanır, sınır dışı sayı kenetlenir (`LocalCumaHatirlatmaServisi`
 * deseni; AGENTS.md "sessiz sonsuz spinner" dersi). Eski tek-ofsetli kayıt
 * normalize sırasında adımlı modele GÖÇER (`nafileAdimlari.ts`; saf, idempotent).
 */

const nesneMi = (d: unknown): d is Record<string, unknown> =>
    !!d && typeof d === 'object' && !Array.isArray(d);

const TURLER: NafileTuru[] = ['kusluk', 'evvabin', 'teheccud'];

/** Herhangi bir değeri geçerli `NafileAyarlari`ya çevirir (disk + slice + yedek yolu). */
export const nafileAyarlariniNormalize = (ham: unknown): NafileAyarlari => {
    const v = VARSAYILAN_NAFILE_AYARLARI;
    const kaynak = nesneMi(ham) ? ham : {};
    const hatirlatmalar = nesneMi(kaynak.hatirlatmalar) ? kaynak.hatirlatmalar : {};
    // Nafile başına gösterge (eski kayıtta yok → üçü de eski tek bayrağı alır).
    const eskiGosterge = kaynak.gostergeAktif === true;
    const hamGosterge = nesneMi(kaynak.gosterge) ? kaynak.gosterge : {};
    const gosterge = {} as Record<NafileTuru, boolean>;
    for (const tur of TURLER) {
        const deger = hamGosterge[tur];
        gosterge[tur] = typeof deger === 'boolean' ? deger : eskiGosterge;
    }
    const sonuc: NafileAyarlari = {
        gostergeAktif: TURLER.some((t) => gosterge[t]),
        gosterge,
        hatirlatmalar: {
            kusluk: gunduzNafileNormalize(hatirlatmalar.kusluk, v.hatirlatmalar.kusluk),
            evvabin: gunduzNafileNormalize(hatirlatmalar.evvabin, v.hatirlatmalar.evvabin),
        },
        teheccud: teheccudNormalize(kaynak.teheccud, v.teheccud),
        // Yalnız AÇIKKEN yazılır: eski kayıt / varsayılan birebir aynı nesneyi üretir.
        ...(kaynak.gunuGununeKur === true ? { gunuGununeKur: true } : {}),
    };
    // Rıza kaydı yalnız AÇIKÇA true ise taşınır (uydurulamaz; yoksa alan hiç yazılmaz).
    if (kaynak.sesliOnayi === true) sonuc.sesliOnayi = true;
    return sonuc;
};

/** En az bir hatırlatma açık mı? — saf tanım `nafileTipleri`nde (bildirim defteri de kullanır). */
export { nafileHatirlatmaAcikMi };

/** "Kıldım" hafızası: { 'YYYY-MM-DD': NafileTuru[] } — bkz. `NAFILE_KILINAN`. */
export type NafileKilinanKaydi = Record<string, NafileTuru[]>;

/** Kıldım hafızası kaç gün tutulur (teheccüd dünün gecesi olabilir). */
const KILINAN_TUTMA_GUNU = 3;


const kilinanNormalize = (ham: unknown): NafileKilinanKaydi => {
    if (!nesneMi(ham)) return {};
    const sonuc: NafileKilinanKaydi = {};
    for (const [gun, turler] of Object.entries(ham)) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(gun) || !Array.isArray(turler)) continue;
        const temiz = TURLER.filter((t) => turler.includes(t));
        if (temiz.length > 0) sonuc[gun] = temiz;
    }
    return sonuc;
};

/** ISO günleri dize olarak karşılaştırılır (`new Date('YYYY-MM-DD')` UTC tuzağı). */
const budanmis = (kayit: NafileKilinanKaydi, enEskiIso: string): NafileKilinanKaydi => {
    const sonuc: NafileKilinanKaydi = {};
    for (const [gun, turler] of Object.entries(kayit)) {
        if (gun >= enEskiIso) sonuc[gun] = turler;
    }
    return sonuc;
};

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

    /** Kıldım hafızası — asla reddetmez (bozuk kayıt = boş). */
    getKilinanlar: async (): Promise<NafileKilinanKaydi> => {
        try {
            const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.NAFILE_KILINAN);
            return ham ? kilinanNormalize(JSON.parse(ham)) : {};
        } catch {
            return {};
        }
    },

    /**
     * (gün, tür) "kılındı" diye işaretlenir; `KILINAN_TUTMA_GUNU`'nden eski
     * günler budanır. `bugunIso` ENJEKTE edilir (testte sabit tarih yazılmaz).
     */
    kilindiIsaretle: async (gunIso: string, tur: NafileTuru, bugunIso: string): Promise<void> => {
        try {
            const mevcut = await LocalNafileServisi.getKilinanlar();
            const enEski = gunEkle(bugunIso, -KILINAN_TUTMA_GUNU);
            const kayit = budanmis(mevcut, enEski);
            const turler = new Set(kayit[gunIso] ?? []);
            turler.add(tur);
            kayit[gunIso] = TURLER.filter((t) => turler.has(t));
            await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.NAFILE_KILINAN, JSON.stringify(kayit));
        } catch (e) {
            Logger.error('LocalNafileServisi', 'Kildim kaydi yazilamadi:', e);
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
