/**
 * Namaz modu (issue #277) — zamana bağlı tetiklerin SAF planı.
 *
 * Telefonun namazda NE yapacağını kullanıcı sistem ekranında (Ayarlar → Modlar)
 * seçer; uygulama yalnız NE ZAMAN açılacağını söyler. Pencereleri burada
 * hesaplayıp native'e gönderiyoruz; native yalnız sıradaki geçişe tek alarm kurar.
 *
 * Kimlik ("tur") kuralı native ile ortaktır: kullanıcı modu elle kapatırsa o
 * turda yeniden açılmaz. `cuma:<tarih>` · `vakit:<tarih>_<vakit>` · (native)
 * `cami:<tarih>_<vakit>`.
 */
import type { FarzVakit } from '../cami/camiTipleri';
import { FARZ_VAKITLER } from '../cami/camiTipleri';
import type { GunGirisleri } from '../cami/camiKarar';

/** Cuma hutbesi penceresi: öğle girişi → +50 dk (Fable tasarımı). */
export const CUMA_HUTBE_SURESI_DK = 50;
export const VAKIT_SURE_MIN_DK = 10;
export const VAKIT_SURE_MAX_DK = 40;
export const VAKIT_SURE_ADIM_DK = 5;
export const VAKIT_SURE_VARSAYILAN_DK = 20;

export interface NamazModuAyarlari {
    /** "Namaz modunu kullan" — Ayarlar → Modlar'a "Namaz" eklenir. */
    etkin: boolean;
    /** Cuma hutbesinde aç (varsayılan). */
    cuma: boolean;
    /** Her vakit girince N dk aç. */
    vakit: boolean;
    vakitSureDk: number;
    /** "Kıldım" deyince kapansın. */
    kildimKapat: boolean;
}

export const VARSAYILAN_NAMAZ_MODU_AYARLARI: NamazModuAyarlari = {
    etkin: false,
    cuma: true,
    vakit: false,
    vakitSureDk: VAKIT_SURE_VARSAYILAN_DK,
    kildimKapat: true,
};

export interface NamazModuPenceresi {
    bas: number;
    son: number;
    tur: string;
}

const DK = 60_000;

export function namazModuAyarlariniNormalize(ham: unknown): NamazModuAyarlari {
    const o = ham && typeof ham === 'object' && !Array.isArray(ham) ? (ham as Record<string, unknown>) : {};
    const sure = typeof o.vakitSureDk === 'number' && Number.isFinite(o.vakitSureDk)
        ? Math.min(VAKIT_SURE_MAX_DK, Math.max(VAKIT_SURE_MIN_DK, Math.round(o.vakitSureDk)))
        : VAKIT_SURE_VARSAYILAN_DK;
    return {
        etkin: o.etkin === true,
        cuma: o.cuma !== false,
        vakit: o.vakit === true,
        vakitSureDk: sure,
        kildimKapat: o.kildimKapat !== false,
    };
}

/**
 * Pencereleri üretir. Cuma öğlesinde hutbe penceresi varsa aynı öğle için ayrı
 * "vakit" penceresi açılmaz (ikisi aynı namaz; tek tur).
 * @param simdiMs verilirse bitmiş pencereler atılır
 */
export function namazModuPlaniOlustur(
    gunler: readonly GunGirisleri[],
    ayarlar: NamazModuAyarlari,
    simdiMs?: number
): NamazModuPenceresi[] {
    if (!ayarlar.etkin) return [];
    const sonuc: NamazModuPenceresi[] = [];
    for (const gun of gunler) {
        const hutbe = ayarlar.cuma && gun.cuma && Number.isFinite(gun.girisler.ogle);
        if (hutbe) {
            sonuc.push({ bas: gun.girisler.ogle, son: gun.girisler.ogle + CUMA_HUTBE_SURESI_DK * DK, tur: `cuma:${gun.tarih}` });
        }
        if (ayarlar.vakit) {
            for (const v of FARZ_VAKITLER) {
                if (hutbe && v === 'ogle') continue;
                const giris = gun.girisler[v];
                if (!Number.isFinite(giris)) continue;
                sonuc.push({ bas: giris, son: giris + ayarlar.vakitSureDk * DK, tur: `vakit:${gun.tarih}_${v}` });
            }
        }
    }
    return sonuc
        .filter((p) => simdiMs == null || p.son > simdiMs)
        .sort((a, b) => a.bas - b.bas);
}

/**
 * Tur kimliğinden namaz (tarih + vakit) — "Kıldım deyince kapansın" kontrolü için.
 * `saat:` = bilekten açılan mod (saat W3, `SaatKomutKurallari.namazModuIstegi`); o da
 * vaktin "Kıldım"ıyla kapanır. `saat:<gün>_serbest` (vakit bilinmiyor) namaza ÇÖZÜLMEZ.
 */
export function turdanNamaz(tur: string): { tarih: string; vakit: FarzVakit } | null {
    const m = /^(cuma|vakit|cami|saat):(\d{4}-\d{2}-\d{2})(?:_([a-z]+))?$/.exec(tur);
    if (!m) return null;
    const vakit = (m[1] === 'cuma' ? 'ogle' : m[3]) as FarzVakit | undefined;
    if (!vakit || !(FARZ_VAKITLER as readonly string[]).includes(vakit)) return null;
    return { tarih: m[2], vakit };
}
