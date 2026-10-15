/**
 * Favori camiye yürüme süresi TAHMİNİ — SAF (issue #292).
 *
 * Kuş uçuşu mesafe sokak ağının uzunluğunu olduğundan kısa gösterir; şehir içi
 * yaya güzergâhı için kıvrım (detour) katsayısı ~1.3 alınır. Ortalama yürüme
 * hızı 1.3 m/s (≈4.7 km/sa). Sonuç bir TAHMİNDİR: kullanıcı düzeltebilir,
 * düzeltilen değer kalıcıdır (`YurumeKaynagi = 'elle'`).
 *
 * Mesafe için Camideyim'in haversine'i kullanılır (`core/cami/geometri.mesafeM`);
 * ikinci bir mesafe formülü YAZMA.
 */
import { mesafeM } from '../cami/geometri';
import type { YerKaydi } from '../cami/camiTipleri';

export const KIVRIM_KATSAYISI = 1.3;
export const YURUME_HIZI_MS = 1.3;

/** Kuş uçuşu mesafeden (m) yürüme dakikası (yuvarlanmış, en az 1). Sınırlamaz. */
export function yurumeDakikasiHesapla(kusUcusuM: number): number {
    if (!Number.isFinite(kusUcusuM) || kusUcusuM < 0) return 1;
    const saniye = (kusUcusuM * KIVRIM_KATSAYISI) / YURUME_HIZI_MS;
    return Math.max(1, Math.round(saniye / 60));
}

export interface FavoriCami {
    id: string;
    ad: string;
    mesafeM: number;
    /** Sınırlanmamış tahmin — ekran `YURUME_MAX_DK`'yı aşıp aşmadığını söyler. */
    yurumeDk: number;
}

/**
 * Konuma EN YAKIN favori camiyi bulur. Konumu bilinmeyen (lat/lng anlık
 * görüntüsü olmayan) favori atlanır; favori olmayan `kendi` yerler (iş yeri
 * mescidi vb.) bu soruya girmez — issue "favori camisi" der.
 *
 * @param konum Kullanıcının kayıtlı konumu; `null`/(0,0) = bilinmiyor → `null`.
 */
export function enYakinFavoriCami(
    yerler: Readonly<Record<string, YerKaydi>>,
    konum: { lat: number; lng: number } | null
): FavoriCami | null {
    if (!konum || (konum.lat === 0 && konum.lng === 0)) return null;
    let enIyi: FavoriCami | null = null;
    for (const [id, y] of Object.entries(yerler)) {
        if (y.durum !== 'favori' || y.lat == null || y.lng == null) continue;
        const m = mesafeM(konum.lat, konum.lng, y.lat, y.lng);
        if (!enIyi || m < enIyi.mesafeM) {
            enIyi = {
                id,
                ad: y.ad && y.ad.length > 0 ? y.ad : 'Favori caminiz',
                mesafeM: m,
                yurumeDk: yurumeDakikasiHesapla(m),
            };
        }
    }
    return enIyi;
}
