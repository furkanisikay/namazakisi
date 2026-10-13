/**
 * Telefon → Wear OS saat YÜK SÖZLEŞMESİ (issue #269) — SAF.
 *
 * Vakitler TELEFONDA hesaplanır (tek hesap kaynağı: `CalculationMethod.Turkey()`),
 * saat yalnız gösterir; saatte ikinci bir adhan kopyası sessiz sapma doğururdu.
 *
 * Sözleşme İKİ TARAFTA kilitlidir: bu dosyanın doğrulayıcısı ve Kotlin
 * `YukCozucu` aynı örnek dosyayı (`wear/app/src/test/resources/ornek-yuk.json`)
 * kabul etmek zorundadır. Şema değişirse `WEAR_YUK_SURUMU` artırılır; eski
 * saat yeni sürümü görünce eski veriyi gösterip güncelleme ister.
 *
 * SÜRÜM 2 (issue #280 — telefon yanında değilken de hatırlatma):
 * - `gunler` ufku 8 → 31 gün (≈6 KB): telefon günlerce görünmese de saat vakitleri bilir.
 * - `muhafiz`: telefonun motoruyla üretilmiş HAZIR plan (`wearMuhafizPlani.ts`).
 *   Saat yalnız sıradaki alarmı kurar; ikinci motor yoktur.
 * - Yeni saat v1 yükünü de okur (plan boş sayılır).
 *
 * Anahtar uzayı TEK: `VakitAdi` (imsak|gunes|ogle|ikindi|aksam|yatsi). `NamazAdi`
 * değerleri ('Öğle', 'İkindi') diakritikli olduğu için sözleşmeye girmez.
 */
import type { VakitAdi } from '../types';
import { KAZA_SABITLERI } from '../constants/UygulamaSabitleri';
import { gunEkle } from '../utils/TarihYardimcisi';
import { gunVakitleriniHesapla, type NafileKoordinat } from '../nafile/gunVakitleri';
import type { MuhafizMatrisi } from '../muhafiz/matrisTipleri';
import { MUHAFIZ_MAKS_ADIM } from '../muhafiz/matrisTipleri';
import {
    utf8BaytUzunlugu,
    wearMuhafizPlaniOlustur,
    type WearMuhafizKaydi,
} from './wearMuhafizPlani';

export const WEAR_YUK_SURUMU = 2;

/** Dün + bugün + 29 gün (30 günlük ileri ufuk): bağlantı haftalarca kopsa da saat vakitleri bilir. */
export const WEAR_GUN_SAYISI = 31;

/**
 * Yükün UTF-8 bayt sınırı. DataItem en fazla 100 KB taşır; DataMap çerçevesi ve
 * anahtarlar için pay bırakılır. Aşılırsa plan SONDAN, vakit bütünlüğüyle kısalır.
 */
export const WEAR_YUK_BAYT_SINIRI = 90_000;

export const WEAR_VAKITLER: readonly VakitAdi[] = ['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi'];

/**
 * Kerahat pencereleri (dk) — `KazaHesaplayiciServisi.mekruhVakitKontrolEt` ile AYNI
 * sabitler. Saata YÜKLE gönderilir ki ikinci bir kopya tutulmasın.
 */
export const WEAR_KERAHAT_DK = {
    suruk: KAZA_SABITLERI.MEKRUH_TOLERANS_DK,
    istiva: 5,
    gurub: KAZA_SABITLERI.MEKRUH_TOLERANS_DK,
} as const;

export interface WearGun {
    tarih: string;
    /** Giriş anları, epoch ms. */
    vakitler: Record<VakitAdi, number>;
    /** Yalnız dün ve bugün dolu; diğer günler boş dizi. `gunes` asla yer almaz. */
    kilinan: VakitAdi[];
}

export interface WearYuku {
    surum: number;
    konumAdi: string;
    kerahatDk: { suruk: number; istiva: number; gurub: number };
    gunler: WearGun[];
    /** Kronolojik hazır muhafız planı; muhafız kapalıysa boş. */
    muhafiz: WearMuhafizKaydi[];
}

export interface WearMuhafizYukGirdisi {
    aktif: boolean;
    matris: MuhafizMatrisi;
    /** `Date.now()` — enjekte edilir (testte sabit). */
    simdiMs: number;
    /** tarih → kılınmış vakitler (muhafız kılınmışlığı + namaz kaydı birleşimi). */
    kilinanlar: Record<string, readonly VakitAdi[]>;
    /** Özel gün kapısı — o günün pencereleri planlanmaz (bkz. `WearMuhafizGirdisi`). */
    ozelGundeMi?: (tarih: string) => boolean;
    ufukMs?: number;
}

export interface WearYukGirdisi {
    koordinat: NafileKoordinat;
    /** Takvim günü ('YYYY-MM-DD') — `bugunuAl()` ile enjekte edilir (testte sabit tarih yok). */
    bugunIso: string;
    konumAdi: string;
    /** tarih → kılınan vakitler (yalnız dün ve bugün okunur). */
    kilinanlar: Record<string, VakitAdi[]>;
    /** Verilmezse plan boş gider (muhafız bilgisi okunamadı). */
    muhafiz?: WearMuhafizYukGirdisi;
    /** Testte küçük sınır denemek için. */
    baytSiniri?: number;
}

export function wearYukuOlustur(g: WearYukGirdisi): WearYuku {
    const dun = gunEkle(g.bugunIso, -1);
    const gunler: WearGun[] = [];
    for (let i = 0; i < WEAR_GUN_SAYISI; i++) {
        const tarih = gunEkle(dun, i);
        const v = gunVakitleriniHesapla(g.koordinat, tarih);
        const kilinanKaynak = i < 2 ? g.kilinanlar[tarih] ?? [] : [];
        gunler.push({
            tarih,
            vakitler: {
                imsak: v.imsak.getTime(),
                gunes: v.gunes.getTime(),
                ogle: v.ogle.getTime(),
                ikindi: v.ikindi.getTime(),
                aksam: v.aksam.getTime(),
                yatsi: v.yatsi.getTime(),
            },
            // Sözleşme sırası sabit + güneş hiçbir zaman "kılınmış" değildir.
            kilinan: WEAR_VAKITLER.filter((a) => a !== 'gunes' && kilinanKaynak.includes(a)),
        });
    }
    const taban: WearYuku = {
        surum: WEAR_YUK_SURUMU,
        konumAdi: g.konumAdi,
        kerahatDk: { ...WEAR_KERAHAT_DK },
        gunler,
        muhafiz: [],
    };
    if (!g.muhafiz) return taban;

    const gruplar = wearMuhafizPlaniOlustur({ koordinat: g.koordinat, bugunIso: g.bugunIso, ...g.muhafiz });
    return planiSigdir(taban, gruplar, g.baytSiniri ?? WEAR_YUK_BAYT_SINIRI);
}

/**
 * Planı bayt sınırına sığdırır: sığmıyorsa EN UZAKTAKİ vakit penceresi düşer
 * (kronolojik kesme — yakın uyarılar korunur, kısalan ufku sonraki gönderim
 * tamamlar). Hiçbir pencere sığmazsa plan boş gider; vakitler yine gider.
 */
export function planiSigdir(
    taban: WearYuku,
    gruplar: readonly WearMuhafizKaydi[][],
    baytSiniri: number
): WearYuku {
    for (let n = gruplar.length; n >= 0; n--) {
        const aday: WearYuku = { ...taban, muhafiz: gruplar.slice(0, n).flat().sort((a, b) => a.ms - b.ms) };
        if (n === 0 || utf8BaytUzunlugu(JSON.stringify(aday)) <= baytSiniri) return aday;
    }
    return taban;
}

/** Sözleşme doğrulayıcısı — Kotlin `YukCozucu`nun aynası (ortak örnek dosyayla test edilir). */
export function wearYukuGecerliMi(y: unknown): y is WearYuku {
    if (!y || typeof y !== 'object') return false;
    const o = y as Record<string, unknown>;
    if (typeof o.surum !== 'number' || typeof o.konumAdi !== 'string') return false;
    const k = o.kerahatDk as Record<string, unknown> | undefined;
    if (!k || !['suruk', 'istiva', 'gurub'].every((a) => typeof k[a] === 'number')) return false;
    if (!Array.isArray(o.gunler) || o.gunler.length === 0) return false;
    return o.gunler.every((gun) => {
        const g = gun as Record<string, unknown>;
        if (typeof g.tarih !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(g.tarih)) return false;
        const v = g.vakitler as Record<string, unknown> | undefined;
        if (!v || !WEAR_VAKITLER.every((a) => typeof v[a] === 'number')) return false;
        return (
            Array.isArray(g.kilinan) &&
            g.kilinan.every((a) => typeof a === 'string' && a !== 'gunes' && WEAR_VAKITLER.includes(a as VakitAdi))
        );
    }) && muhafizPlaniGecerliMi(o.surum, o.muhafiz);
}

/** v1'de alan yoktur (boş plan); v2+'da kayıt dizisi zorunludur. */
function muhafizPlaniGecerliMi(surum: number, plan: unknown): boolean {
    if (surum < 2) return plan === undefined;
    if (!Array.isArray(plan)) return false;
    return plan.every((k) => {
        const r = k as Record<string, unknown>;
        return (
            typeof r.id === 'string' &&
            typeof r.ms === 'number' &&
            typeof r.tarih === 'string' &&
            /^\d{4}-\d{2}-\d{2}$/.test(r.tarih) &&
            typeof r.vakit === 'string' &&
            r.vakit !== 'gunes' &&
            WEAR_VAKITLER.includes(r.vakit as VakitAdi) &&
            [1, 2, 3, 4].includes(r.seviye as number) &&
            typeof r.baslik === 'string' &&
            typeof r.govde === 'string' &&
            typeof r.titresim === 'boolean' &&
            typeof r.acil === 'boolean' &&
            // Eklemeli opsiyonel alan (issue #274): yoksa eski telefon yükü.
            (r.adim === undefined ||
                (Number.isInteger(r.adim) && (r.adim as number) >= 0 && (r.adim as number) < MUHAFIZ_MAKS_ADIM))
        );
    });
}
