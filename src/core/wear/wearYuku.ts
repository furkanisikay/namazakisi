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
import type { GeceSessizligi } from '../muhafiz/geceSessizligi';
import type { MuhafizMatrisi } from '../muhafiz/matrisTipleri';
import { MUHAFIZ_MAKS_ADIM } from '../muhafiz/matrisTipleri';
import {
    utf8BaytUzunlugu,
    wearMuhafizPlaniOlustur,
    type WearMuhafizKaydi,
} from './wearMuhafizPlani';
import { wearUyandirmaGecerliMi, type WearUyandirmaKaydi } from './wearUyandirma';
import type { AnonsYeri } from '../saat/saatAyarlari';

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

/**
 * Now Bar seçimi (issue #282 ikinci aşama) — saatin canlı sayaç (Ongoing Activity)
 * yüzeyi telefondaki AYNI kullanıcı seçimine uyar. EKLEMELİ OPSİYONEL alan:
 * eski saat yok sayar, sürüm ARTIRILMAZ (AGENTS.md); alan yoksa saat eski
 * davranışında kalır (her vakit "son dakikalar" muhafız planından).
 */
export interface WearCanliPenceresi {
    oge: string;
    baslik: string;
    /** Kısa durum metni ("İftar") */
    ad: string;
    bas: number;
    bitis: number;
    /** Küçük sayı kazanır (vakit 1 … seri 6) */
    oncelik: number;
    /** Yalnız vakit öğelerinde (kılınmışlık + "Kıldım") */
    tarih?: string;
    vakit?: string;
}

export interface WearCanli {
    /** Vakit başına: saat kendi "son dakikalar" sayacını göstersin mi? */
    vakitler: Record<'imsak' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi', boolean>;
    /** Telefonun zaman çizelgesinden öne çıkan dilimler (kronolojik). */
    pencereler: WearCanliPenceresi[];
}

export interface WearYuku {
    surum: number;
    konumAdi: string;
    kerahatDk: { suruk: number; istiva: number; gurub: number };
    gunler: WearGun[];
    /** Kronolojik hazır muhafız planı; muhafız kapalıysa boş. */
    muhafiz: WearMuhafizKaydi[];
    /** Now Bar seçimi (opsiyonel, issue #282). */
    canli?: WearCanli;
    /** Kıble için YAKLAŞIK konum (opsiyonel, saat yenileme W2) — bkz. `wearKonumuOlustur`. */
    konum?: WearKonum;
    /**
     * Saatte SESSİZ UYANDIRMA (saat W3, fikir 2) — yalnız kullanıcı "saat"/"ikisi"
     * seçtiyse yazılır (`wearUyandirma.ts`). EKLEMELİ OPSİYONEL: sürüm 2 kalır.
     */
    uyandirma?: WearUyandirmaKaydi[];
    /**
     * Muhafız anonsu nerede konuşsun? (saat W3, fikir 9) Alan YOKSA (eski telefon) saat
     * hiç konuşmaz — eski davranış. EKLEMELİ OPSİYONEL.
     */
    anonsYeri?: AnonsYeri;
}

/**
 * Saatin kıble pusulası için konum. EKLEMELİ OPSİYONEL alan (sürüm 2 kalır).
 * 1 ONDALIĞA yuvarlanır (≈ 11 km): kıble açısına etkisi ihmal edilir (≈ 0,1°),
 * kişisel konum saate tam hassasiyetle gitmez (AGENTS güvenlik kuralı: koordinat en
 * fazla `toFixed(1)`) ve kayan nokta gürültüsü her gönderimi "yeni" yapmaz.
 */
export interface WearKonum {
    lat: number;
    lng: number;
}

/** Yuvarlama tek kaynak: yük ve saat tohumu aynı kuralı kullanır. */
export function wearKonumuOlustur(k: NafileKoordinat): WearKonum | undefined {
    // `{0,0}` "henüz yapılandırılmadı" nöbetçisidir → alan HİÇ yazılmaz.
    if (!Number.isFinite(k.lat) || !Number.isFinite(k.lng) || (k.lat === 0 && k.lng === 0)) return undefined;
    const lat = Math.round(k.lat * 10) / 10;
    const lng = Math.round(k.lng * 10) / 10;
    return wearKonumuCoz({ lat, lng }) ?? undefined;
}

/**
 * GEVŞEK doğrulama (bilinçli): `konum` bozuksa YÜK geçerli kalır, yalnız kıble düşer
 * (vakit gösterimi ikincil bir alan yüzünden kaybolmasın). Kotlin `YukCozucu.konumCoz`
 * AYNI kuralı uygular.
 */
export function wearKonumuCoz(k: unknown): WearKonum | null {
    if (!k || typeof k !== 'object') return null;
    const o = k as Record<string, unknown>;
    const { lat, lng } = o;
    if (typeof lat !== 'number' || typeof lng !== 'number') return null;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    if (lat === 0 && lng === 0) return null;
    return { lat, lng };
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
    /** Gece sessizliği — gece penceresinin kayıtları süzülür (bkz. `WearMuhafizGirdisi`). */
    geceSessizligi?: GeceSessizligi;
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
    /** Now Bar seçimi ve öne çıkan dilimler (`CanliSayacPlanlayici` saat payı). */
    canli?: WearCanli;
    /**
     * Saatin kıble pusulası için yaklaşık konum eklensin mi? Yalnız Wear OS (kıble
     * orada). Apple Watch'a gönderilmez: kullanılmayan konum cihazdan çıkmasın.
     */
    kibleKonumu?: boolean;
    /** Saatin uyandırma listesi (yalnız Wear OS ve kullanıcı saati seçtiyse). */
    uyandirma?: WearUyandirmaKaydi[];
    /** Anons yeri (yalnız Wear OS). */
    anonsYeri?: AnonsYeri;
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
        ...(g.canli ? { canli: g.canli } : {}),
        ...(g.uyandirma ? { uyandirma: g.uyandirma } : {}),
        ...(g.anonsYeri ? { anonsYeri: g.anonsYeri } : {}),
    };
    const konum = g.kibleKonumu ? wearKonumuOlustur(g.koordinat) : undefined;
    if (konum) taban.konum = konum;
    const gruplar = g.muhafiz ? wearMuhafizPlaniOlustur({ koordinat: g.koordinat, bugunIso: g.bugunIso, ...g.muhafiz }) : [];
    return planiSigdir(taban, gruplar, g.baytSiniri ?? WEAR_YUK_BAYT_SINIRI);
}

/**
 * Yükü bayt sınırına sığdırır. Ölçülen şey yükün TAMAMIDIR — muhafız kayıtlarının
 * çözülmüş anons metinleri (`anons`) ve uyandırma listesi (saat W3) dahil (inceleme
 * bulgusu 9). Sığmıyorsa önce EN UZAKTAKİ muhafız vakit penceresi düşer (kronolojik
 * kesme — yakın uyarılar korunur, kısalan ufku sonraki gönderim tamamlar); plan tümden
 * düştüğü hâlde sığmıyorsa en uzak UYANDIRMA kayıtları da düşer (uyandırma muhafızdan
 * değerlidir: en son o gider). Vakitler daima gider.
 */
export function planiSigdir(
    taban: WearYuku,
    gruplar: readonly WearMuhafizKaydi[][],
    baytSiniri: number
): WearYuku {
    const sigar = (y: WearYuku): boolean => utf8BaytUzunlugu(JSON.stringify(y)) <= baytSiniri;
    for (let n = gruplar.length; n > 0; n--) {
        const aday: WearYuku = { ...taban, muhafiz: gruplar.slice(0, n).flat().sort((a, b) => a.ms - b.ms) };
        if (sigar(aday)) return aday;
    }
    const plansiz: WearYuku = { ...taban, muhafiz: [] };
    if (!plansiz.uyandirma || sigar(plansiz)) return plansiz;
    const uyandirma = [...plansiz.uyandirma].sort((a, b) => a.ms - b.ms);
    for (let n = uyandirma.length - 1; n > 0; n--) {
        const aday: WearYuku = { ...plansiz, uyandirma: uyandirma.slice(0, n) };
        if (sigar(aday)) return aday;
    }
    const { uyandirma: _dusen, ...uyandirmasiz } = plansiz;
    return uyandirmasiz;
}

const ANONS_YERLERI: readonly AnonsYeri[] = ['otomatik', 'telefon', 'saat'];

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
    }) &&
        muhafizPlaniGecerliMi(o.surum, o.muhafiz) &&
        canliGecerliMi(o.canli) &&
        wearUyandirmaGecerliMi(o.uyandirma) &&
        (o.anonsYeri === undefined || ANONS_YERLERI.includes(o.anonsYeri as AnonsYeri));
}

const CANLI_VAKITLERI = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] as const;

/** Opsiyonel; varsa tam doğrulanır (Kotlin `YukCozucu` ile aynı katılık). */
export function canliGecerliMi(c: unknown): boolean {
    if (c === undefined) return true;
    if (!c || typeof c !== 'object') return false;
    const o = c as Record<string, unknown>;
    const v = o.vakitler as Record<string, unknown> | undefined;
    if (!v || !CANLI_VAKITLERI.every((a) => typeof v[a] === 'boolean')) return false;
    if (!Array.isArray(o.pencereler)) return false;
    return o.pencereler.every((p) => {
        const r = p as Record<string, unknown>;
        return (
            typeof r.oge === 'string' &&
            typeof r.baslik === 'string' &&
            typeof r.ad === 'string' &&
            typeof r.bas === 'number' &&
            typeof r.bitis === 'number' &&
            (r.bitis as number) > (r.bas as number) &&
            Number.isInteger(r.oncelik) &&
            (r.tarih === undefined || (typeof r.tarih === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.tarih))) &&
            (r.vakit === undefined || (CANLI_VAKITLERI as readonly unknown[]).includes(r.vakit))
        );
    });
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
                (Number.isInteger(r.adim) && (r.adim as number) >= 0 && (r.adim as number) < MUHAFIZ_MAKS_ADIM)) &&
            // Eklemeli opsiyonel alan (saat W3): çözülmüş anons cümlesi.
            (r.anons === undefined || typeof r.anons === 'string')
        );
    });
}
