/**
 * Telefon → Wear OS saat YÜK SÖZLEŞMESİ (issue #269) — SAF.
 *
 * Vakitler TELEFONDA hesaplanır (tek hesap kaynağı: `CalculationMethod.Turkey()`),
 * saat yalnız gösterir; saatte ikinci bir adhan kopyası sessiz sapma doğururdu.
 *
 * Sözleşme İKİ TARAFTA kilitlidir: bu dosyanın doğrulayıcısı ve Kotlin
 * `YukCozucu` aynı örnek dosyayı (`wear/app/src/test/resources/ornek-yuk.json`)
 * kabul etmek zorundadır. Şema değişirse `WEAR_YUK_SURUMU` artırılır; eski
 * saat yeni sürümü görünce eski veriyi gösterip "telefonu güncelleyin" der.
 *
 * Anahtar uzayı TEK: `VakitAdi` (imsak|gunes|ogle|ikindi|aksam|yatsi). `NamazAdi`
 * değerleri ('Öğle', 'İkindi') diakritikli olduğu için sözleşmeye girmez.
 */
import type { VakitAdi } from '../types';
import { KAZA_SABITLERI } from '../constants/UygulamaSabitleri';
import { gunEkle } from '../utils/TarihYardimcisi';
import { gunVakitleriniHesapla, type NafileKoordinat } from '../nafile/gunVakitleri';

export const WEAR_YUK_SURUMU = 1;

/** Dün + bugün + 6 gün: bağlantı bir hafta kopsa da saat doğru gösterir; dün gece yarısı sonrası içindir. */
export const WEAR_GUN_SAYISI = 8;

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
}

export interface WearYukGirdisi {
    koordinat: NafileKoordinat;
    /** Takvim günü ('YYYY-MM-DD') — `bugunuAl()` ile enjekte edilir (testte sabit tarih yok). */
    bugunIso: string;
    konumAdi: string;
    /** tarih → kılınan vakitler (yalnız dün ve bugün okunur). */
    kilinanlar: Record<string, VakitAdi[]>;
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
    return { surum: WEAR_YUK_SURUMU, konumAdi: g.konumAdi, kerahatDk: { ...WEAR_KERAHAT_DK }, gunler };
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
    });
}
