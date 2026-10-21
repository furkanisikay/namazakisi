/**
 * Kararlı içerik özeti — "aynı girdi mi?" sorusunu diskte küçük bir dizeyle sormak için.
 *
 * KRİPTOGRAFİK DEĞİL. İki bağımsız FNV-1a 32-bit (farklı başlangıç tabanları) + uzunluk:
 * rastgele iki girdinin çakışması ~2^-64; amaç kötü niyetli girdiye dayanıklılık değil,
 * aynı ayarın her turda aynı izi üretmesidir. `Math.imul` 32-bit taşmayı Hermes'te de
 * doğru yapar. SAF: React/expo import etmez.
 */

const nesneMi = (d: unknown): d is Record<string, unknown> =>
    typeof d === 'object' && d !== null && !Array.isArray(d) && !(d instanceof Date);

/**
 * Anahtarları SIRALI JSON: nesne anahtar sırası değişse de aynı veri aynı dizeyi verir.
 * `undefined` alanlar atlanır (JSON.stringify gibi); `Date` epoch ms olarak yazılır.
 */
export function kanonikJsonOlustur(deger: unknown): string {
    if (deger instanceof Date) return String(deger.getTime());
    if (Array.isArray(deger)) return `[${deger.map(kanonikJsonOlustur).join(',')}]`;
    if (nesneMi(deger)) {
        const anahtarlar = Object.keys(deger)
            .filter((a) => deger[a] !== undefined)
            .sort();
        return `{${anahtarlar.map((a) => `${JSON.stringify(a)}:${kanonikJsonOlustur(deger[a])}`).join(',')}}`;
    }
    return JSON.stringify(deger ?? null);
}

const fnv1a = (metin: string, taban: number): string => {
    let h = taban;
    for (let i = 0; i < metin.length; i++) {
        h ^= metin.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).padStart(8, '0');
};

/** Metnin kararlı özeti (16 hex + uzunluk). */
export function metinOzeti(metin: string): string {
    return `${fnv1a(metin, 0x811c9dc5)}${fnv1a(metin, 0x01234567)}-${metin.length.toString(36)}`;
}

/** Değerin kanonik JSON'unun özeti. */
export function kararliOzet(deger: unknown): string {
    return metinOzeti(kanonikJsonOlustur(deger));
}
