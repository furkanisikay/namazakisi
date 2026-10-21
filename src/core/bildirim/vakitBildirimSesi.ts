/**
 * "Vakit girdi" bildiriminin vakit başına SESİ — SAF (React/native import ETMEZ).
 *
 * Android'de ses KANAL özelliğidir ve kanal kurulduktan sonra değiştirilemez →
 * muhafızdaki desenin aynısı: kanal id'si SESİN fonksiyonudur
 * (`vakit_bildirim_<hash8>`, `sesKimligi.sesHashi`). Ses seçilmemiş vakit bugünkü
 * TABAN `vakit_bildirim` kanalında kalır → mevcut kullanıcının bildirimi birebir aynı.
 *
 * Kayıt `{ [vakit]: { bildirimSesi, sesAdi? } }`; yalnız `content://` sesler saklanır
 * (varsayılan = kayıt yok). Kayıt CİHAZA ÖZGÜDÜR ve yedeklenmez (bkz. sabit yorumu).
 */
import type { VakitBildirimVakti } from './vakitBildirimPlani';
import { ozelSesMi, sesHashi } from '../muhafiz/sesKimligi';

export interface VakitSesSecimi {
    /** `content://…` (sistem sesi ya da kullanıcının içe aktardığı dosya) */
    bildirimSesi: string;
    /** Görünen ad (yoksa kibar yedek metin) */
    sesAdi?: string;
}

export type VakitBildirimSesleri = Partial<Record<VakitBildirimVakti, VakitSesSecimi>>;

export const VAKIT_BILDIRIM_TABAN_KANAL = 'vakit_bildirim';
export const VAKIT_BILDIRIM_KANAL_ONEKI = 'vakit_bildirim_';

/** Ses seçilmemiş vaktin görünen adı (taban kanal sistemin bildirim sesini çalar). */
export const VAKIT_VARSAYILAN_SES_ADI = 'Telefonun bildirim sesi';

const VAKITLER: readonly VakitBildirimVakti[] = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];

/** Diskten gelen ham değeri güvenli kayda çevirir (bozuk/varsayılan girdiler düşer). */
export function vakitSesleriniNormalize(ham: unknown): VakitBildirimSesleri {
    if (!ham || typeof ham !== 'object' || Array.isArray(ham)) return {};
    const sonuc: VakitBildirimSesleri = {};
    for (const vakit of VAKITLER) {
        const g = (ham as Record<string, unknown>)[vakit];
        if (!g || typeof g !== 'object') continue;
        const ses = (g as { bildirimSesi?: unknown }).bildirimSesi;
        if (typeof ses !== 'string' || !ozelSesMi(ses.trim())) continue;
        const ad = (g as { sesAdi?: unknown }).sesAdi;
        sonuc[vakit] = {
            bildirimSesi: ses.trim(),
            ...(typeof ad === 'string' && ad.trim() ? { sesAdi: ad.trim().slice(0, 80) } : {}),
        };
    }
    return sonuc;
}

/** Ses → kanal id. Varsayılan (ya da geçersiz) ses TABAN kanaldır. */
export function vakitBildirimKanalId(ses: string | undefined | null): string {
    if (typeof ses !== 'string' || !ozelSesMi(ses)) return VAKIT_BILDIRIM_TABAN_KANAL;
    return `${VAKIT_BILDIRIM_KANAL_ONEKI}${sesHashi(ses)}`;
}

/** Görünen ad: ham URI asla gösterilmez. */
export function vakitSesGorunenAdi(secim: VakitSesSecimi | undefined): string {
    if (!secim || !ozelSesMi(secim.bildirimSesi)) return VAKIT_VARSAYILAN_SES_ADI;
    return secim.sesAdi?.trim() || 'Seçtiğiniz ses';
}

/** Android bildirim ayarlarında görünen kanal adı (taban: "Vakit Bildirimleri"). */
export function vakitKanalAdi(secim: VakitSesSecimi): string {
    return `Vakit Bildirimleri · ${vakitSesGorunenAdi(secim)}`;
}

/** Kaydı tek vakit için günceller; `null` = varsayılana dön (kayıttan silinir). */
export function vakitSesiniAyarla(
    sesler: VakitBildirimSesleri,
    vakit: VakitBildirimVakti,
    secim: VakitSesSecimi | null
): VakitBildirimSesleri {
    const yeni: VakitBildirimSesleri = { ...sesler };
    if (!secim || !ozelSesMi(secim.bildirimSesi)) delete yeni[vakit];
    else yeni[vakit] = secim.sesAdi ? { bildirimSesi: secim.bildirimSesi, sesAdi: secim.sesAdi } : { bildirimSesi: secim.bildirimSesi };
    return yeni;
}

/** Bu kayıttaki benzersiz özel sesler (kanal hazırlığı ve doğrulama için). */
export function benzersizVakitSesleri(sesler: VakitBildirimSesleri): VakitSesSecimi[] {
    const gorulen = new Map<string, VakitSesSecimi>();
    for (const vakit of VAKITLER) {
        const s = sesler[vakit];
        if (s && ozelSesMi(s.bildirimSesi) && !gorulen.has(s.bildirimSesi)) gorulen.set(s.bildirimSesi, s);
    }
    return [...gorulen.values()];
}

/** Doğrulanamayan (çözülemeyen) sesleri düşürür; değişiklik yoksa AYNI referans. */
export function cozulemeyenVakitSesleriniDusur(
    sesler: VakitBildirimSesleri,
    cozulemeyen: ReadonlySet<string>
): VakitBildirimSesleri {
    if (cozulemeyen.size === 0) return sesler;
    let degisti = false;
    const yeni: VakitBildirimSesleri = {};
    for (const vakit of VAKITLER) {
        const s = sesler[vakit];
        if (!s) continue;
        if (cozulemeyen.has(s.bildirimSesi)) degisti = true;
        else yeni[vakit] = s;
    }
    return degisti ? yeni : sesler;
}
