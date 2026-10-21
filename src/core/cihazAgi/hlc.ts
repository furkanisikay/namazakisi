/**
 * Hibrit mantıksal saat (HLC; Kulkarni ve ark. 2014) — cihazlar arası "son yazan kazanır"
 * kararı için. Duvar saati kayan iki cihazda da sıra korunur: her olay, yerel saatten ve
 * görülen en büyük HLC'den BÜYÜK bir değer alır.
 *
 * Dize biçimi SABİT GENİŞLİKLİDİR ki sözlük sırası = zaman sırası olsun:
 *   `<ms, 15 hane, sıfır dolgulu>-<sayaç, 4 hex>-<cihaz kimliği>`
 * Eşit ms + eşit sayaçta cihaz kimliği eşitliği bozar (toplam sıra; iki cihaz aynı kararı verir).
 * Saf modül.
 */

export interface Hlc {
    ms: number;
    sayac: number;
    cihaz: string;
}

const SAYAC_TAVANI = 0xffff;
const DESEN = /^(\d{15})-([0-9a-f]{4})-([0-9a-f]{16})$/;
/** Gelen HLC yerel saatten bu kadar ilerideyse yok sayılır (kurcalanmış/bozuk saat sıçratmasın). */
export const AZAMI_ILERI_KAYMA_MS = 24 * 60 * 60_000;

export const hlcYaz = (h: Hlc): string => `${String(Math.max(0, Math.floor(h.ms))).padStart(15, '0')}-${h.sayac.toString(16).padStart(4, '0')}-${h.cihaz}`;

export function hlcCoz(s: unknown): Hlc | null {
    if (typeof s !== 'string') return null;
    const m = DESEN.exec(s);
    return m ? { ms: Number(m[1]), sayac: parseInt(m[2], 16), cihaz: m[3] } : null;
}

/** Sözlük sırasıyla karşılaştırma (biçim sabit genişlikli olduğu için zaman sırasıdır). */
export const hlcKarsilastir = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/** Yerel olay: `max(yerel.ms, şimdi)`; aynı ms ise sayaç +1. */
export function hlcIlerlet(yerel: Hlc, simdiMs: number): Hlc {
    if (simdiMs > yerel.ms) return { ms: simdiMs, sayac: 0, cihaz: yerel.cihaz };
    return yerel.sayac < SAYAC_TAVANI ? { ...yerel, sayac: yerel.sayac + 1 } : { ms: yerel.ms + 1, sayac: 0, cihaz: yerel.cihaz };
}

/** Gelen olayı gördükten sonraki yerel HLC (alma kuralı). Aşırı ileri saat yok sayılır. */
export function hlcAl(yerel: Hlc, gelen: Hlc | null, simdiMs: number): Hlc {
    if (!gelen || gelen.ms > simdiMs + AZAMI_ILERI_KAYMA_MS) return hlcIlerlet(yerel, simdiMs);
    const ms = Math.max(yerel.ms, gelen.ms, simdiMs);
    let sayac: number;
    if (ms === yerel.ms && ms === gelen.ms) sayac = Math.max(yerel.sayac, gelen.sayac) + 1;
    else if (ms === yerel.ms) sayac = yerel.sayac + 1;
    else if (ms === gelen.ms) sayac = gelen.sayac + 1;
    else sayac = 0;
    return sayac > SAYAC_TAVANI ? { ms: ms + 1, sayac: 0, cihaz: yerel.cihaz } : { ms, sayac, cihaz: yerel.cihaz };
}
