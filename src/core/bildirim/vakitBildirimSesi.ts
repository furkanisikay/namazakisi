/**
 * "Vakit girdi" bildiriminin vakit başına SESİ — SAF (React/native import ETMEZ).
 *
 * Android'de ses KANAL özelliğidir ve kanal kurulduktan sonra değiştirilemez →
 * muhafızdaki desenin aynısı: kanal id'si SESİN fonksiyonudur
 * (`vakit_bildirim_<hash8>`, `sesKimligi.sesHashi`). Ses seçilmemiş vakit bugünkü
 * TABAN `vakit_bildirim` kanalında kalır → mevcut kullanıcının bildirimi birebir aynı.
 *
 * iPhone'da kanal yoktur: ses bildirimin `sound` alanıdır (`vakitIosSesi`) —
 * uygulamanın sesi (`paket:<ad>`) ya da eklenen dosya (`dosya:<ad>`).
 *
 * Kayıt `{ [vakit]: { bildirimSesi, sesAdi? } }`; yalnız SEÇİLMİŞ sesler saklanır
 * (Android `content://`, iPhone `paket:`/`dosya:`; varsayılan = kayıt yok). Kayıt
 * CİHAZA ÖZGÜDÜR ve yedeklenmez (bkz. sabit yorumu).
 */
import type { VakitBildirimVakti } from './vakitBildirimPlani';
import { ozelSesMi, secilmisSesMi, sesGorunenAdi, sesHashi } from '../muhafiz/sesKimligi';
import { iosSesDosyasi } from '../muhafiz/ios/paketSesleri';
import { metin } from '../dil/aktifDil';

export interface VakitSesSecimi {
    /** Android `content://…` (sistem sesi ya da içe aktarılan dosya); iPhone `paket:`/`dosya:` */
    bildirimSesi: string;
    /** Görünen ad (yoksa kibar yedek metin) */
    sesAdi?: string;
}

export type VakitBildirimSesleri = Partial<Record<VakitBildirimVakti, VakitSesSecimi>>;

export const VAKIT_BILDIRIM_TABAN_KANAL = 'vakit_bildirim';
export const VAKIT_BILDIRIM_KANAL_ONEKI = 'vakit_bildirim_';

/** Ses seçilmemiş vaktin görünen adı (taban kanal sistemin bildirim sesini çalar). */
export const vakitVarsayilanSesAdi = (): string => metin().hatirlatma.vakitSesi.varsayilan;

const VAKITLER: readonly VakitBildirimVakti[] = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];

/** Diskten gelen ham değeri güvenli kayda çevirir (bozuk/varsayılan girdiler düşer). */
export function vakitSesleriniNormalize(ham: unknown): VakitBildirimSesleri {
    if (!ham || typeof ham !== 'object' || Array.isArray(ham)) return {};
    const sonuc: VakitBildirimSesleri = {};
    for (const vakit of VAKITLER) {
        const g = (ham as Record<string, unknown>)[vakit];
        if (!g || typeof g !== 'object') continue;
        const ses = (g as { bildirimSesi?: unknown }).bildirimSesi;
        if (typeof ses !== 'string' || !secilmisSesMi(ses.trim())) continue;
        const ad = (g as { sesAdi?: unknown }).sesAdi;
        sonuc[vakit] = {
            bildirimSesi: ses.trim(),
            ...(typeof ad === 'string' && ad.trim() ? { sesAdi: ad.trim().slice(0, 80) } : {}),
        };
    }
    return sonuc;
}

/** Ses → kanal id (ANDROID). Varsayılan, geçersiz ya da iPhone sesi TABAN kanaldır. */
export function vakitBildirimKanalId(ses: string | undefined | null): string {
    if (typeof ses !== 'string' || !ozelSesMi(ses)) return VAKIT_BILDIRIM_TABAN_KANAL;
    return `${VAKIT_BILDIRIM_KANAL_ONEKI}${sesHashi(ses)}`;
}

/** Görünen ad: ham URI asla gösterilmez. */
export function vakitSesGorunenAdi(secim: VakitSesSecimi | undefined): string {
    if (!secim || !secilmisSesMi(secim.bildirimSesi)) return vakitVarsayilanSesAdi();
    // Bu cihazda çalınmayan seçim (silinmiş dosya) telefonun sesini çalar → adı da o.
    return sesGorunenAdi(secim.bildirimSesi, secim.sesAdi, vakitVarsayilanSesAdi());
}

/**
 * iPhone: vaktin bildirim sesinin DOSYA ADI; seçilmemişse (ya da iPhone'da çalınamazsa)
 * `null` → bildirim bugünkü gibi `sound: true` (telefonun sesi) kalır.
 */
export function vakitIosSesi(secim: VakitSesSecimi | undefined): string | null {
    return secim ? iosSesDosyasi(secim.bildirimSesi) : null;
}

/** Android bildirim ayarlarında görünen kanal adı (taban: "Vakit Bildirimleri"). */
export function vakitKanalAdi(secim: VakitSesSecimi): string {
    return `${metin().bildirim.kanal.vakit} · ${vakitSesGorunenAdi(secim)}`;
}

/** Kaydı tek vakit için günceller; `null` = varsayılana dön (kayıttan silinir). */
export function vakitSesiniAyarla(
    sesler: VakitBildirimSesleri,
    vakit: VakitBildirimVakti,
    secim: VakitSesSecimi | null
): VakitBildirimSesleri {
    const yeni: VakitBildirimSesleri = { ...sesler };
    if (!secim || !secilmisSesMi(secim.bildirimSesi)) delete yeni[vakit];
    else yeni[vakit] = secim.sesAdi ? { bildirimSesi: secim.bildirimSesi, sesAdi: secim.sesAdi } : { bildirimSesi: secim.bildirimSesi };
    return yeni;
}

/** Bu kayıttaki benzersiz Android özel sesleri (kanal hazırlığı ve doğrulama için). */
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
