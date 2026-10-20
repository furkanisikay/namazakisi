/**
 * iPhone'da yakındaki camiler — paketlenmiş OSM verisi (`tr.bin`) saf JS ile çözülür.
 *
 * Android'de aynı sorguyu native `yakinCamiler` yapar; iPhone'da Camideyim modülü
 * yoktur. Veri bir kez okunur ve süreç boyunca bellekte tutulur (çözücü tembeldir:
 * kayıtlar ızgara dizininden yalnız sorulunca okunur). Okuma başarısızsa önbellek
 * TUTULMAZ, sonraki çağrı yeniden dener. Konum İSTENMEZ: çağıran zaten bilinen
 * konumu verir (iOS arka plan konumu bilinçli kapalı).
 */
import { camiVerisiniCoz, type CamiVerisi } from '../../core/cami/camiVerisi';
import { camiVeriBaytlariniOku } from '../../data/local/camiVeriDosyasi';

export interface YakinCamiOzeti {
    id: string;
    ad: string;
    lat: number;
    lng: number;
    mesafeM: number;
}

let veri: Promise<CamiVerisi | null> | null = null;

function veriyiAl(): Promise<CamiVerisi | null> {
    if (!veri) {
        veri = camiVeriBaytlariniOku()
            .then((b) => (b ? camiVerisiniCoz(b) : null))
            .catch(() => null)
            .then((sonuc) => {
                if (!sonuc) veri = null;
                return sonuc;
            });
    }
    return veri;
}

/** En yakın `k` cami (adı olanlar), mesafeye göre artan. Veri yoksa boş liste. */
export async function yakinCamileriBul(lat: number, lng: number, k: number): Promise<YakinCamiOzeti[]> {
    const v = await veriyiAl();
    if (!v) return [];
    return v
        .enYakinlar(lat, lng, k * 2)
        .filter((s) => s.kayit.ad.trim().length > 0)
        .slice(0, k)
        .map((s) => ({ id: s.kayit.id, ad: s.kayit.ad, lat: s.kayit.lat, lng: s.kayit.lng, mesafeM: s.mesafeM }));
}

/** Yalnız testler için. */
export function _onbellegiSifirla(): void {
    veri = null;
}
