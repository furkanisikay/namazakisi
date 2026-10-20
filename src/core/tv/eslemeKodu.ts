/**
 * TV'ye konum aktarma KODU (telefon → Android TV, ağsız yedek yol).
 *
 * Telefon konumunu 7 haneye sıkıştırır, kullanıcı TV'de kumandayla girer. Ağ, izin ve
 * bağımlılık gerekmez; QR yolu (aynı Wi-Fi) çalışmadığında kullanılır.
 *
 * Biçim: 6 haneli gövde + 1 Damm kontrol hanesi.
 * - Gövde = satır × 800 + sütun; 0,1° ızgara, enlem [20, 60), boylam [-20, 60)
 *   (Türkiye, Avrupa, Orta Doğu, Kuzey Afrika). 0,05°'lik en büyük sapma vakitleri
 *   birkaç saniye kaydırır; TV zaten il merkeziyle hesaplıyordu.
 * - Gövde >= 320000 ayrılmıştır (ileride başka biçim) → geçersiz.
 * - Damm: tek hane hatasını ve komşu hanelerin yer değiştirmesini HER ZAMAN yakalar;
 *   yanlış tuşlanan kod sessizce yanlış şehre düşmez.
 *
 * İkizi: `tv/.../cekirdek/EslemeKodu.kt`. İkisi de `tv/app/src/test/resources/esleme-ornekleri.json`'u
 * kabul eder; kural değişirse üçü birlikte değişir.
 *
 * Kayan nokta tuzağı: `(41.0 - 20) * 10` 209.99999 çıkabilir → hesap MİKRODERECE
 * tamsayılarıyla yapılır (`Math.round(x * 1e6)`), iki dilde de aynı.
 */

const DAMM: readonly (readonly number[])[] = [
    [0, 3, 1, 7, 5, 9, 8, 6, 4, 2],
    [7, 0, 9, 2, 1, 5, 4, 8, 6, 3],
    [4, 2, 0, 6, 8, 7, 1, 3, 5, 9],
    [1, 7, 5, 0, 9, 8, 3, 4, 2, 6],
    [6, 1, 2, 3, 0, 4, 5, 9, 7, 8],
    [3, 6, 7, 4, 2, 0, 9, 5, 8, 1],
    [5, 8, 6, 9, 7, 2, 0, 1, 3, 4],
    [8, 9, 4, 5, 3, 6, 2, 0, 1, 7],
    [9, 4, 3, 8, 6, 1, 7, 2, 0, 5],
    [2, 5, 8, 1, 4, 3, 6, 7, 9, 0],
];

export const ESLEME_KODU_UZUNLUGU = 7;
const ENLEM_TABANI_MIKRO = 20_000_000;
const BOYLAM_TABANI_MIKRO = -20_000_000;
const HUCRE_MIKRO = 100_000; // 0,1°
const SATIR_SAYISI = 400;
const SUTUN_SAYISI = 800;

/** Rakam dizisinin Damm ara durumu; 0 ise dizi (kontrol hanesi dahil) geçerlidir. */
export function dammAraDurumu(rakamlar: string): number {
    let durum = 0;
    for (const c of rakamlar) durum = DAMM[durum][c.charCodeAt(0) - 48];
    return durum;
}

/** Konumu 7 haneli koda çevirir; bölge dışındaysa `null`. */
export function konumuKodla(lat: number, lng: number): string | null {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    const satir = Math.floor((Math.round(lat * 1e6) - ENLEM_TABANI_MIKRO) / HUCRE_MIKRO);
    const sutun = Math.floor((Math.round(lng * 1e6) - BOYLAM_TABANI_MIKRO) / HUCRE_MIKRO);
    if (satir < 0 || satir >= SATIR_SAYISI || sutun < 0 || sutun >= SUTUN_SAYISI) return null;
    const govde = String(satir * SUTUN_SAYISI + sutun).padStart(6, '0');
    return govde + String(dammAraDurumu(govde));
}

/** Kodu hücre merkezine çözer; hatalıysa `null`. */
export function koduCoz(kod: string): { lat: number; lng: number } | null {
    if (!/^\d{7}$/.test(kod)) return null;
    if (dammAraDurumu(kod) !== 0) return null;
    const govde = Number(kod.slice(0, 6));
    if (govde >= SATIR_SAYISI * SUTUN_SAYISI) return null;
    const satir = Math.floor(govde / SUTUN_SAYISI);
    const sutun = govde % SUTUN_SAYISI;
    return {
        lat: (ENLEM_TABANI_MIKRO + satir * HUCRE_MIKRO + HUCRE_MIKRO / 2) / 1e6,
        lng: (BOYLAM_TABANI_MIKRO + sutun * HUCRE_MIKRO + HUCRE_MIKRO / 2) / 1e6,
    };
}

/** Okunur gösterim: "168 4892" (TV'deki kutular da 3 + 4 gruplanır). */
export function koduBicimle(kod: string): string {
    return kod.length === ESLEME_KODU_UZUNLUGU ? `${kod.slice(0, 3)} ${kod.slice(3)}` : kod;
}
