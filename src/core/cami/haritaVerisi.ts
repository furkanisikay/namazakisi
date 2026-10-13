/**
 * Camideyim haritası (issue #297 Faz 2) — SAF veri katmanı.
 *
 * Harita bileşeni (MapLibre) yalnız GeoJSON çizer; hangi yerin hangi alanla, hangi
 * renk sınıfıyla görüneceği burada hesaplanır ve test edilir. Algılama alanı
 * native karar katmanıyla AYNI kuraldan gelir (`alanYaricapiM`, `geofenceYaricapiM`):
 * kullanıcı alanı poligonu ezer; poligon yoksa daire. Haritada görünen şekil ile
 * kararın kullandığı şekil ayrışırsa kullanıcı yanlış alanı ayarlar.
 */
import type { Feature, FeatureCollection, Point, Polygon, Position } from 'geojson';
import { geofenceYaricapiM } from './camiKarar';
import { DUNYA_YARICAPI_M, alanYaricapiM } from './geometri';
import type { LatLng, YerKaydi } from './camiTipleri';

/** Anahtarsız vektör karolar (OpenFreeMap; © OpenMapTiles, veri © OpenStreetMap katkıcıları). */
export const HARITA_STILI_ACIK = 'https://tiles.openfreemap.org/styles/liberty';
export const HARITA_STILI_KOYU = 'https://tiles.openfreemap.org/styles/dark';
/** Haritada aynı anda gösterilen en yakın cami sayısı (native sorgu tavanı 150). */
export const HARITA_CAMI_SAYISI = 60;
/** Açılış yakınlığı: birkaç sokak görünsün, 10–150 m'lik alanlar seçilebilsin. */
export const HARITA_BASLANGIC_YAKINLIGI = 16;

export type HaritaYeriTuru = 'cami' | 'kendi' | 'haric';

export interface HaritaYeri {
    id: string;
    ad: string;
    lat: number;
    lng: number;
    /** OSM kaydının kendi yarıçapı (0 = nokta → varsayılan alan) */
    yaricapM: number;
    poligon: LatLng[] | null;
    /** Kullanıcının seçtiği alan (m) — poligonu ezer */
    alanM: number | null;
    tur: HaritaYeriTuru;
    favori: boolean;
}

/** Native `yakinCamiler` çıktısının haritanın kullandığı kısmı. */
export interface HaritaKaynakCami {
    id: string;
    ad: string;
    lat: number;
    lng: number;
    yaricapM: number;
    poligon?: [number, number][] | null;
}

/**
 * Yakın OSM camileri + kullanıcının kendi yerleri / favorileri / hariçleri → tek liste.
 * Ekranda olmayan uzaktaki favori ya da kendi yer, kayıtlı konumuyla eklenir.
 */
export function haritaYerleriniBirlestir(
    yakinlar: readonly HaritaKaynakCami[],
    yerler: Readonly<Record<string, YerKaydi>>
): HaritaYeri[] {
    const sonuc: HaritaYeri[] = [];
    const var_ = new Set<string>();
    for (const c of yakinlar) {
        const ayar = yerler[c.id];
        sonuc.push({
            id: c.id,
            ad: c.ad,
            lat: c.lat,
            lng: c.lng,
            yaricapM: c.yaricapM,
            poligon: c.poligon && c.poligon.length >= 3 ? c.poligon : null,
            alanM: ayar?.alanM ?? null,
            tur: ayar?.durum === 'haric' ? 'haric' : 'cami',
            favori: ayar?.durum === 'favori',
        });
        var_.add(c.id);
    }
    for (const [id, ayar] of Object.entries(yerler)) {
        if (var_.has(id) || typeof ayar.lat !== 'number' || typeof ayar.lng !== 'number') continue;
        if (!ayar.kendi && ayar.durum === 'normal') continue;
        sonuc.push({
            id,
            ad: ayar.ad ?? '',
            lat: ayar.lat,
            lng: ayar.lng,
            yaricapM: 0,
            poligon: null,
            alanM: ayar.alanM ?? null,
            tur: ayar.durum === 'haric' ? 'haric' : ayar.kendi ? 'kendi' : 'cami',
            favori: ayar.durum === 'favori',
        });
    }
    return sonuc;
}

/** Merkez etrafında [boylam, enlem] daire halkası (kapalı). Bina ölçeğinde yerel izdüşüm yeter. */
export function daireHalkasi(lat: number, lng: number, yaricapM: number, kenar = 48): Position[] {
    const halka: Position[] = [];
    const dLat = (yaricapM / DUNYA_YARICAPI_M) * (180 / Math.PI);
    const dLng = dLat / Math.max(1e-6, Math.cos((lat * Math.PI) / 180));
    for (let i = 0; i <= kenar; i++) {
        const a = (2 * Math.PI * (i % kenar)) / kenar;
        halka.push([lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)]);
    }
    return halka;
}

/** Kararın kullandığı algılama alanı: kullanıcı alanı > bina poligonu > varsayılan daire. */
export function alanHalkasi(y: HaritaYeri): Position[] {
    if (y.alanM == null && y.poligon) {
        const halka: Position[] = y.poligon.map(([la, ln]) => [ln, la]);
        halka.push(halka[0]);
        return halka;
    }
    return daireHalkasi(y.lat, y.lng, alanYaricapiM({ ozelAlanM: y.alanM, yaricapM: y.yaricapM }));
}

export interface HaritaKatmanlari {
    alanlar: FeatureCollection<Polygon>;
    uyandirma: FeatureCollection<Polygon>;
    noktalar: FeatureCollection<Point>;
}

/** Bir yerin ekranda görünen algılama alanı yarıçapı (m) — panel stepper'ı için. */
export const gorunenAlanM = (y: HaritaYeri): number => alanYaricapiM({ ozelAlanM: y.alanM, yaricapM: y.yaricapM });

/**
 * Harita katmanları. Uyandırma çemberi (telefonun ilk uyandığı ~100 m çevre) yalnız
 * SEÇİLİ yer için çizilir — hepsine çizmek sık camili mahallede haritayı boğardı.
 */
export function haritaKatmanlariOlustur(yerler: readonly HaritaYeri[], seciliId: string | null): HaritaKatmanlari {
    const ozellik = (y: HaritaYeri) => ({ id: y.id, tur: y.tur, favori: y.favori ? 1 : 0, secili: y.id === seciliId ? 1 : 0 });
    const alanlar: Feature<Polygon>[] = yerler.map((y) => ({
        type: 'Feature',
        id: y.id,
        properties: ozellik(y),
        geometry: { type: 'Polygon', coordinates: [alanHalkasi(y)] },
    }));
    const secili = yerler.find((y) => y.id === seciliId && y.tur !== 'haric');
    const uyandirma: Feature<Polygon>[] = secili
        ? [
              {
                  type: 'Feature',
                  id: `${secili.id}#uyandirma`,
                  properties: { id: secili.id },
                  geometry: {
                      type: 'Polygon',
                      coordinates: [
                          daireHalkasi(secili.lat, secili.lng, geofenceYaricapiM({ ozelAlanM: secili.alanM, yaricapM: secili.yaricapM })),
                      ],
                  },
              },
          ]
        : [];
    const noktalar: Feature<Point>[] = yerler.map((y) => ({
        type: 'Feature',
        id: y.id,
        properties: ozellik(y),
        geometry: { type: 'Point', coordinates: [y.lng, y.lat] },
    }));
    return {
        alanlar: { type: 'FeatureCollection', features: alanlar },
        uyandirma: { type: 'FeatureCollection', features: uyandirma },
        noktalar: { type: 'FeatureCollection', features: noktalar },
    };
}

/** MapLibre basma olayındaki özelliklerden yer kimliği (yoksa null). */
export function basilanYerKimligi(ozellikler: readonly { properties?: unknown }[] | undefined): string | null {
    for (const o of ozellikler ?? []) {
        const p = o?.properties as { id?: unknown } | null | undefined;
        if (p && typeof p.id === 'string') return p.id;
    }
    return null;
}
