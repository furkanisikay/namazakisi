/**
 * Camideyim geometrisi — SAF (Kotlin ikizi: `cekirdek/Geometri.kt`).
 *
 * Mesafe haversine; nokta-poligon testi yerel eşdikdörtgen izdüşümde (bina
 * ölçeğinde hata santimetre düzeyi).
 */
import {
    ALAN_MAX_M,
    OLCEK_MAX,
    OLCEK_MIN,
    POLIGON_TAMPON_M,
    VARSAYILAN_ALAN_M,
    type IzlenenYer,
    type LatLng,
} from './camiTipleri';

export const DUNYA_YARICAPI_M = 6_371_008.8;

const rad = (d: number): number => (d * Math.PI) / 180;

export function mesafeM(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const p1 = rad(lat1);
    const p2 = rad(lat2);
    const dp = p2 - p1;
    const dl = rad(lng2 - lng1);
    const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    return 2 * DUNYA_YARICAPI_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Merkez etrafında yerel (x, y) metre. */
function yerelXy(lat0: number, lng0: number, lat: number, lng: number): [number, number] {
    return [rad(lng - lng0) * Math.cos(rad(lat0)) * DUNYA_YARICAPI_M, rad(lat - lat0) * DUNYA_YARICAPI_M];
}

/** Ray casting. Poligon kapalı kabul edilir (son köşe ilkine bağlanır). */
export function noktaPoligondaMi(lat: number, lng: number, poligon: readonly LatLng[]): boolean {
    if (poligon.length < 3) return false;
    const [lat0, lng0] = poligon[0];
    const [px, py] = yerelXy(lat0, lng0, lat, lng);
    let icinde = false;
    for (let i = 0, j = poligon.length - 1; i < poligon.length; j = i++) {
        const [xi, yi] = yerelXy(lat0, lng0, poligon[i][0], poligon[i][1]);
        const [xj, yj] = yerelXy(lat0, lng0, poligon[j][0], poligon[j][1]);
        if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
            icinde = !icinde;
        }
    }
    return icinde;
}

const capraz = (o: readonly number[], a: readonly number[], b: readonly number[]): number =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

/**
 * Halkanın komşu olmayan iki kenarı İÇTEN kesişiyor mu? (Uç dokunuşu sayılmaz.)
 * Üretici (`cami_verisi_uret.py > kendini_kesiyor_mu`) ve Kotlin `Geometri` ile aynı kural.
 */
export function kendiniKesiyorMu(poligon: readonly LatLng[]): boolean {
    const n = poligon.length;
    if (n < 4) return false;
    const [lat0, lng0] = poligon[0];
    const p = poligon.map(([la, ln]) => yerelXy(lat0, lng0, la, ln));
    for (let i = 0; i < n; i++) {
        for (let j = i + 2; j < n; j++) {
            if (i === 0 && j === n - 1) continue;
            const a = p[i], b = p[(i + 1) % n], c = p[j], d = p[(j + 1) % n];
            const d1 = capraz(c, d, a), d2 = capraz(c, d, b), d3 = capraz(a, b, c), d4 = capraz(a, b, d);
            if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
        }
    }
    return false;
}

/** Dış bürün (Andrew, saat yönü tersi) — köşeler girdinin alt kümesidir. */
export function disBurun(poligon: readonly LatLng[]): LatLng[] {
    if (poligon.length < 3) return [...poligon];
    const [lat0, lng0] = poligon[0];
    const noktalar = poligon
        .map((q) => ({ q, xy: yerelXy(lat0, lng0, q[0], q[1]) }))
        .sort((a, b) => a.xy[0] - b.xy[0] || a.xy[1] - b.xy[1]);
    const zincir = (sira: typeof noktalar) => {
        const z: typeof noktalar = [];
        for (const s of sira) {
            while (z.length >= 2 && capraz(z[z.length - 2].xy, z[z.length - 1].xy, s.xy) <= 0) z.pop();
            z.push(s);
        }
        z.pop();
        return z;
    };
    return [...zincir(noktalar), ...zincir([...noktalar].reverse())].map((s) => s.q);
}

/**
 * Veriden okunan poligonun ONARIMI: kendini kesen halka (eski üreticinin nadir
 * basitleştirme çıktısı) ışın atma testinde "içeriyi" anlamsız böler ve haritada
 * düğümlü çizilir → dış bürüne çevrilir. Sağlam halka AYNEN döner.
 */
export function poligonuOnar(poligon: readonly LatLng[]): LatLng[] {
    return kendiniKesiyorMu(poligon) ? disBurun(poligon) : [...poligon];
}

/** Noktanın poligon kenarlarına en kısa uzaklığı (m). */
export function poligonaUzaklikM(lat: number, lng: number, poligon: readonly LatLng[]): number {
    if (poligon.length === 0) return Infinity;
    const [lat0, lng0] = poligon[0];
    const [px, py] = yerelXy(lat0, lng0, lat, lng);
    let enKisa = Infinity;
    for (let i = 0; i < poligon.length; i++) {
        const [ax, ay] = yerelXy(lat0, lng0, poligon[i][0], poligon[i][1]);
        const b = poligon[(i + 1) % poligon.length];
        const [bx, by] = yerelXy(lat0, lng0, b[0], b[1]);
        const dx = bx - ax;
        const dy = by - ay;
        const uz2 = dx * dx + dy * dy;
        const t = uz2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / uz2));
        enKisa = Math.min(enKisa, Math.hypot(px - (ax + t * dx), py - (ay + t * dy)));
    }
    return enKisa;
}

/**
 * Ölçek katsayısının ETKİN değeri: [1, 3] ve büyük binada `ALAN_MAX_M / yarıçap`
 * ile kısılır (yarıçapı 100 m olan külliye en fazla ×1,5 — ×3 komşuları yutardı).
 * Geçersiz/eksik değer 1 (özgün sınır) demektir. Kotlin ikizi `Geometri.etkinOlcek`.
 */
export function etkinOlcek(olcek: number | null | undefined, yaricapM: number): number {
    if (olcek == null || !Number.isFinite(olcek) || olcek <= OLCEK_MIN) return OLCEK_MIN;
    const ust = yaricapM > 0 ? Math.max(OLCEK_MIN, Math.min(OLCEK_MAX, ALAN_MAX_M / yaricapM)) : OLCEK_MAX;
    return Math.min(olcek, ust);
}

/**
 * Poligonu (lat0, lng0) merkezinden k katı büyütür. Yerel eşdikdörtgen izdüşümde
 * (boylam farkı cos(enlem) ile metreye çevrilir) ölçeklenip geri çevrilir — böylece
 * merkezden her köşenin METRE uzaklığı tam k katına çıkar. k ≤ 1 → aynı poligon.
 */
export function poligonuOlcekle(poligon: readonly LatLng[], lat0: number, lng0: number, k: number): LatLng[] {
    if (!(k > 1) || !Number.isFinite(k)) return poligon.map(([la, ln]) => [la, ln] as LatLng);
    const cosLat = Math.max(1e-9, Math.cos(rad(lat0)));
    return poligon.map(([la, ln]) => {
        const [x, y] = yerelXy(lat0, lng0, la, ln);
        const lat = lat0 + ((y * k) / DUNYA_YARICAPI_M) * (180 / Math.PI);
        const lng = lng0 + ((x * k) / (DUNYA_YARICAPI_M * cosLat)) * (180 / Math.PI);
        return [lat, lng] as LatLng;
    });
}

type AlanGirdisi = Pick<IzlenenYer, 'ozelAlanM' | 'yaricapM'> & { ozelOlcek?: number | null };

/**
 * Yerin algılama alanının "yarıçapı" (m) — daire alanlarda doğrudan, poligonda
 * kaydın (çevrel) yarıçapı × etkin ölçek.
 */
export function alanYaricapiM(yer: AlanGirdisi): number {
    if (yer.ozelAlanM != null && yer.ozelAlanM > 0) return yer.ozelAlanM;
    return yer.yaricapM > 0 ? yer.yaricapM * etkinOlcek(yer.ozelOlcek, yer.yaricapM) : VARSAYILAN_ALAN_M;
}

/**
 * Kararın kullandığı poligon: kullanıcı daire seçtiyse YOK; poligon varsa ölçek
 * uygulanmış hâli (ölçek yoksa özgün). Kotlin ikizi `Geometri.etkinPoligon`.
 */
export function etkinPoligon(yer: Pick<IzlenenYer, 'lat' | 'lng' | 'yaricapM' | 'poligon' | 'ozelAlanM' | 'ozelOlcek'>): LatLng[] | null {
    if (yer.ozelAlanM != null && yer.ozelAlanM > 0) return null;
    if (!yer.poligon || yer.poligon.length < 3) return null;
    const k = etkinOlcek(yer.ozelOlcek, yer.yaricapM);
    return k > OLCEK_MIN ? poligonuOlcekle(yer.poligon, yer.lat, yer.lng, k) : [...yer.poligon];
}

/**
 * Nokta yerin algılama alanında mı? Döner: alanın DIŞINDAKİ uzaklık (m); içindeyse 0.
 *
 * Kural sırası (Kotlin ile birebir):
 *  1. Kullanıcı DAİRE seçtiyse (`ozelAlanM`) → o yarıçapta daire (poligonu ezer).
 *  2. Poligon varsa → (ölçek varsa büyütülmüş) poligonun içinde ya da kenara ≤ POLIGON_TAMPON_M.
 *  3. Yoksa → kaydın yarıçapı (node: 25 m) daire.
 * Ölçek alanı OLMAYAN eski kayıt birebir eski davranışı verir.
 */
export function alanDisiUzaklikM(yer: IzlenenYer, lat: number, lng: number): number {
    const merkezeUzaklik = mesafeM(lat, lng, yer.lat, yer.lng);
    if (yer.ozelAlanM != null && yer.ozelAlanM > 0) {
        return Math.max(0, merkezeUzaklik - yer.ozelAlanM);
    }
    const poligon = etkinPoligon(yer);
    if (poligon) {
        if (noktaPoligondaMi(lat, lng, poligon)) return 0;
        return Math.max(0, poligonaUzaklikM(lat, lng, poligon) - POLIGON_TAMPON_M);
    }
    return Math.max(0, merkezeUzaklik - alanYaricapiM(yer));
}
