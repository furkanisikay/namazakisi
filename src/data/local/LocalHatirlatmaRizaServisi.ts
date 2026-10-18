/**
 * Tek rıza kaydı (sade tasarım, Dalga 3) — `HATIRLATMA_RIZALARI`.
 *
 * OKUMA ASLA REDDETMEZ (bozuk kayıt = onay yok; yanlış "onay var" asla). Okurken eski
 * yüzey kayıtlarındaki onayı BİR KEZ ortak kayda taşır (`rizaGocu`); eski alanlar
 * silinmez. Göç idempotenttir (taşınacak bir şey yoksa yazmaz).
 *
 * Yazım `Depolama.guncelle` ile atomik (iki yüzeyden aynı anda gelen onay birbirini
 * ezmesin) ve YALNIZ ekler: onay geri alınmaz.
 */
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import {
    rizaEkle,
    rizaGocu,
    rizaKaydiniNormalize,
    type HatirlatmaRizalari,
    type YuzeyRizaKaydi,
} from '../../core/hatirlatma/rizalar';
import { Depolama } from './Depolama';

/** Eski rızanın yaşadığı yüzey anahtarları (göç kaynağı). */
export const ESKI_RIZA_ANAHTARLARI = [
    DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI,
    DEPOLAMA_ANAHTARLARI.NAFILE_AYARLARI,
    DEPOLAMA_ANAHTARLARI.CUMA_HATIRLATMA_AYARLARI,
    DEPOLAMA_ANAHTARLARI.CAMIYE_GIT_AYARLARI,
    DEPOLAMA_ANAHTARLARI.YATIS_HATIRLATMA_AYARLARI,
    DEPOLAMA_ANAHTARLARI.TAKVIM_CAKISMA_AYARLARI,
] as const;

const guvenliCoz = (ham: string | null): YuzeyRizaKaydi | null => {
    if (ham == null) return null;
    try {
        const deger: unknown = JSON.parse(ham);
        return deger && typeof deger === 'object' && !Array.isArray(deger) ? (deger as YuzeyRizaKaydi) : null;
    } catch {
        return null;
    }
};

export const LocalHatirlatmaRizaServisi = {
    /** Ortak kaydı okur, gerekirse eski yüzey onaylarını taşıyıp yazar. */
    oku: async (): Promise<HatirlatmaRizalari> => {
        let ortak: HatirlatmaRizalari = {};
        try {
            ortak = rizaKaydiniNormalize(await Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.HATIRLATMA_RIZALARI));
        } catch (e) {
            Logger.warn('LocalHatirlatmaRizaServisi', 'Ortak rıza okunamadı', e);
            return {};
        }
        try {
            const yuzeyler = (await Depolama.cogunuOku(ESKI_RIZA_ANAHTARLARI)).map(([, ham]) => guvenliCoz(ham));
            const gocmus = rizaGocu(ortak, yuzeyler);
            if (gocmus === ortak) return ortak;
            const yazilan = await Depolama.guncelle<HatirlatmaRizalari>(DEPOLAMA_ANAHTARLARI.HATIRLATMA_RIZALARI, (m) =>
                rizaGocu(rizaKaydiniNormalize(m), yuzeyler)
            );
            return rizaKaydiniNormalize(yazilan);
        } catch (e) {
            // Göç başarısızsa bir sonraki açılışta yeniden denenir; okuma tarafı zaten
            // yüzey kayıtlarını da birleştirir (`genelRizayiTuret`).
            Logger.warn('LocalHatirlatmaRizaServisi', 'Rıza göçü yapılamadı', e);
            return ortak;
        }
    },

    /** Yeni onayı ekler (yalnız `true` alanlar; onay geri alınmaz). */
    ver: async (ek: { sesliOnayi?: boolean; alarmOnayi?: boolean }): Promise<HatirlatmaRizalari> => {
        const yazilan = await Depolama.guncelle<HatirlatmaRizalari>(DEPOLAMA_ANAHTARLARI.HATIRLATMA_RIZALARI, (m) =>
            rizaEkle(rizaKaydiniNormalize(m), ek)
        );
        return rizaKaydiniNormalize(yazilan);
    },
};
