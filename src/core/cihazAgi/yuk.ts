/**
 * Cihaz ağı yükü (şifreli kanalın DÜZ metni). Tasarım §4.4.
 *
 * İki parça, ikisi de opsiyonel:
 * - `durum`: gönderenin ANLIK GÖRÜNTÜSÜ (alıcı en sonuncuyu tutar). TV bugün bunu kullanır.
 * - `olaylar`: KİMLİKLİ, idempotent olay günlüğü (`{id, tur, …}`). Alıcı kimliğe göre BİRLEŞİM
 *   alır; aynı olay iki kez gelirse zararsızdır. Çift yönlü cihazlar (tablet ↔ telefon) "Kıldım"ı
 *   bununla taşıyacak ve alıcıda ortak "Kıldım" kuyruğuna bağlanacak (`KildimKuyrugu`,
 *   `kildimAksiyonunuIsle`) — o alıcı tarafı henüz yazılmadı (taşıma araştırması sürüyor).
 * - `sil: true`: gönderen eşleşmeyi kaldırdı → alıcı bu üyenin anahtarını siler.
 *
 * ZAMAN DAMGASI YOK (Wear dersi: aynı içerik her seferinde "yeni" sayılmasın; tekilleştirme
 * düz metin üzerinde yapılır). "Erteleme" alanı YOK: muhafızda erteleme kaldırıldı (#289, geri
 * eklenmez) — tasarım §4.4'teki `ertele` bu yüzden düştü.
 *
 * İkizi: TV `cekirdek/CihazYuku.kt`. Saf modül.
 */
import type { VakitAdi } from '../types';

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

export interface CihazOlayi {
    /** Küresel benzersiz (gönderen + yerel sayaç / rastgele); alıcı bununla tekilleştirir. */
    id: string;
    tur: 'kildim';
    /** Namaz günü (YYYY-MM-DD) ve vakit. */
    tarih: string;
    vakit: VakitAdi;
}

export interface CihazAgiYuku {
    v: number;
    durum?: DurumAnlikGoruntusu;
    olaylar?: CihazOlayi[];
    sil?: true;
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
