/**
 * Cihaz ağı yükü (şifreli kanalın DÜZ metni). Tasarım §4.4.
 *
 * İki parça, ikisi de opsiyonel:
 * - `durum`: gönderenin ANLIK GÖRÜNTÜSÜ (alıcı en sonuncuyu tutar). TV bugün bunu kullanır.
 * - `olaylar`: KİMLİKLİ, idempotent olay günlüğü (`olayGunlugu.ts`): alıcı kimliğe göre BİRLEŞİM
 *   alır; aynı olay iki kez gelirse zararsızdır. Çift yönlü cihazlar (tablet ↔ telefon) "Kıldım"ı,
 *   kaza hareketini ve ayarı bununla taşır.
 * - `sil: true`: gönderen eşleşmeyi kaldırdı → alıcı bu üyenin anahtarını siler.
 *
 * ZAMAN DAMGASI YOK (Wear dersi: aynı içerik her seferinde "yeni" sayılmasın; tekilleştirme
 * düz metin üzerinde yapılır). "Erteleme" alanı YOK: muhafızda erteleme kaldırıldı (#289, geri
 * eklenmez) — tasarım §4.4'teki `ertele` bu yüzden düştü.
 *
 * İkizi: TV `cekirdek/CihazYuku.kt`. Saf modül.
 */
import type { VakitAdi } from '../types';
import type { GunlukOlayi } from './olayGunlugu';

export const YUK_SURUMU = 2;
/** Gövde sınırı alıcıda 8 KB; yük bunun çok altında kalmalı (nöbetçi test ≤ 1 KB). */
export const YUK_AZAMI_BAYT = 1024;

export interface DurumAnlikGoruntusu {
    /** Gönderenin konum adı (ör. "Kadıköy, İstanbul"). */
    ad?: string;
    konum?: { lat: number; lng: number };
    /** Dün + bugün kılınan farzlar (namaz günü → vakit). */
    kilinan: Record<string, VakitAdi[]>;
    /** Seri dondurulmuş özel gün: TV bandı da susar. */
    ozelGun: boolean;
    /** Kullanıcı TV'deki sessiz vakit bandını istiyor mu. */
    tvHatirlat: boolean;
    /** "TV'de durumum sayılsın" (kişi başına, varsayılan KAPALI). */
    durumumSayilsin: boolean;
    /** Cuma kartı: yürüme + hazırlık = öğleden kaç dk önce çıkmalı (null = bilinmiyor). */
    cuma: { aktif: boolean; cikisDk: number | null };
    /** Ramazan: TV büyük iftar/sahur sayacını gösterir. */
    ramazan: boolean;
}

/** Olay günlüğünün tel biçimi (`olayGunlugu.ts`; TV yalnız `kildim`i okur, gerisini atlar). */
export type CihazOlayi = GunlukOlayi;

export interface CihazAgiYuku {
    v: number;
    durum?: DurumAnlikGoruntusu;
    olaylar?: CihazOlayi[];
    sil?: true;
    /** Çift yönlü cihaz: gönderenin olay günlüğünde bildiği aralık (karşı taraf eksiğini yollar). */
    bilinen?: Record<string, number>;
}

/** Çift yönlü alıcıda düz yükü güvenle çözer (TV'nin `CihazYuku.kt` ayrıştırıcısının JS ikizi). */
export function yukCoz(duz: string | null): { olaylar: unknown[]; bilinen: Record<string, number>; sil: boolean } | null {
    if (!duz) return null;
    try {
        const o = JSON.parse(duz) as Record<string, unknown>;
        if (!o || typeof o !== 'object' || o.v !== YUK_SURUMU) return null;
        const bilinen: Record<string, number> = {};
        if (o.bilinen && typeof o.bilinen === 'object') {
            for (const [c, n] of Object.entries(o.bilinen as Record<string, unknown>)) {
                if (/^[0-9a-f]{16}$/.test(c) && Number.isInteger(n) && (n as number) >= 0) bilinen[c] = n as number;
            }
        }
        return { olaylar: Array.isArray(o.olaylar) ? o.olaylar.slice(0, 200) : [], bilinen, sil: o.sil === true };
    } catch {
        return null;
    }
}

const VAKITLER: readonly VakitAdi[] = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];

/** Yükü kararlı (anahtar sırası sabit) JSON'a çevirir — tekilleştirme bu dizeyle yapılır. */
export function yukuYaz(yuk: CihazAgiYuku): string {
    const d = yuk.durum;
    const durum = d
        ? {
              ...(d.ad ? { ad: d.ad.slice(0, 60) } : {}),
              ...(d.konum ? { konum: { lat: yuvarla(d.konum.lat), lng: yuvarla(d.konum.lng) } } : {}),
              kilinan: Object.fromEntries(
                  Object.keys(d.kilinan)
                      .sort()
                      .map((g) => [g, VAKITLER.filter((v) => d.kilinan[g]?.includes(v))]),
              ),
              ozelGun: d.ozelGun,
              tvHatirlat: d.tvHatirlat,
              durumumSayilsin: d.durumumSayilsin,
              cuma: { aktif: d.cuma.aktif, cikisDk: d.cuma.cikisDk },
              ramazan: d.ramazan,
          }
        : undefined;
    return JSON.stringify({
        v: YUK_SURUMU,
        ...(durum ? { durum } : {}),
        ...(yuk.olaylar && yuk.olaylar.length > 0 ? { olaylar: yuk.olaylar } : {}),
        ...(yuk.sil ? { sil: true } : {}),
        ...(yuk.bilinen ? { bilinen: Object.fromEntries(Object.keys(yuk.bilinen).sort().map((k) => [k, yuk.bilinen![k]])) } : {}),
    });
}

/** ~1 km (0,01°): vakit için fazlasıyla yeterli, ev adresini açık etmez (denetim D-01). */
const yuvarla = (x: number) => Math.round(x * 100) / 100;

/** UTF-8 bayt uzunluğu (Hermes'te TextEncoder'a güvenmeden). */
export function baytUzunlugu(s: string): number {
    let n = 0;
    for (const c of s) {
        const k = c.codePointAt(0) ?? 0;
        n += k < 0x80 ? 1 : k < 0x800 ? 2 : k < 0x10000 ? 3 : 4;
    }
    return n;
}
