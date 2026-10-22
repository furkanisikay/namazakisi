/**
 * "Kıldım" anının karşılığı — kılınan namazdan sonra söylenen dua (sahip isteği: "Kılındı"
 * yerine "Allah kabul etsin"). SAF: store/RN/Logger import etmez; Kotlin (Wear, Android
 * bildirim) ve Swift (Apple Watch) ikizleri sabit "Allah kabul etsin"i kullanır.
 *
 * Kurallar:
 * - YALNIZ geleneksel, herkesin bildiği kalıplar (yeni dua UYDURULMAZ): "Allah kabul etsin",
 *   "Kabul olsun", "Rabbim kabul etsin". Baskın kalıp "Allah kabul etsin"dir (dört yuvanın ikisi).
 * - DÖNÜŞÜM RASTGELE DEĞİL, deterministiktir: `(gün sırası + vakit sırası) % 4`. Aynı gün ve
 *   vakit her çizimde aynı metni verir (ekran saniyede bir çizilir, metin titremez); aynı gün
 *   art arda iki vakit asla aynı kalıbı almaz; günler arasında sıra kayar → bayatlamaz.
 * - Gün sırası NAMAZ GÜNÜNÜN ISO dizesinden UTC ile hesaplanır (saat dilimi kaydırmaz).
 * - Ek selam yalnız iki vakitte: sabah → "Hayırlı sabahlar", yatsı → "Hayırlı geceler"
 *   (günün başı ve sonu; diğer vakitlerde ek söz gürültüdür).
 */

/** Dört yuva; "Allah kabul etsin" iki kez → baskın kalıp. Sıra değişirse test değişir. */
export const KABUL_DUALARI = [
    'Allah kabul etsin',
    'Kabul olsun',
    'Allah kabul etsin',
    'Rabbim kabul etsin',
] as const;

/** Sesli asistan, saat, bildirim gibi tek kalıplı yüzeylerin metni. */
export const KABUL_DUASI = 'Allah kabul etsin';

export type KabulDuasi = (typeof KABUL_DUALARI)[number];

/** Vakit anahtarı → sıra. Hem `VakitAdi` ('imsak') hem görünen `NamazAdi` ('Sabah') kabul edilir. */
const VAKIT_SIRASI: Record<string, number> = {
    imsak: 0,
    sabah: 0,
    Sabah: 0,
    ogle: 1,
    Öğle: 1,
    Cuma: 1,
    ikindi: 2,
    İkindi: 2,
    aksam: 3,
    Akşam: 3,
    yatsi: 4,
    Yatsı: 4,
};

/** "YYYY-MM-DD" → 1970'ten beri gün (UTC). Geçersizse 0 (yine deterministik). */
export function gunSirasi(tarihIso: string): number {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tarihIso);
    if (!m) return 0;
    return Math.floor(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / 86_400_000);
}

export function vakitSirasi(vakit: string): number {
    return VAKIT_SIRASI[vakit] ?? 0;
}

/** Bilinen bir farz vaktiyse sırası, değilse (güneş, bilinmeyen) `null`. */
export function bilinenVakitSirasi(vakit: string | undefined): number | null {
    if (vakit === undefined || !Object.prototype.hasOwnProperty.call(VAKIT_SIRASI, vakit)) return null;
    return VAKIT_SIRASI[vakit];
}

/** O gün o vakit için söylenecek dua (deterministik). */
export function kabulDuasi(tarihIso: string, vakit: string): KabulDuasi {
    const n = KABUL_DUALARI.length;
    const i = (((gunSirasi(tarihIso) + vakitSirasi(vakit)) % n) + n) % n;
    return KABUL_DUALARI[i];
}

/** Duanın ardından söylenebilecek kısa selam ya da `null` (yalnız sabah ve yatsı). */
export function kabulEkSelami(vakit: string): string | null {
    const s = bilinenVakitSirasi(vakit);
    if (s === 0) return 'Hayırlı sabahlar';
    if (s === 4) return 'Hayırlı geceler';
    return null;
}

/** Ekran okuyucu ve kısa bildirim için tek cümle: "Allah kabul etsin. Hayırlı sabahlar." */
export function kabulCumlesi(tarihIso: string, vakit: string): string {
    const ek = kabulEkSelami(vakit);
    return ek ? `${kabulDuasi(tarihIso, vakit)}. ${ek}.` : `${kabulDuasi(tarihIso, vakit)}.`;
}

/** Günün beş vakti tamamlanınca (iki satır: P1/P2 için kısa ana satır + bilgi satırı). */
export const TAM_GUN_METNI = {
    ana: 'Allah kabul etsin',
    alt: 'Bugün beş vakti tamamladınız.',
} as const;

/** Kaza namazı işaretlenince (defter + kaza önerisi aynı söz). */
export function kazaKabulMetni(kucukVakitAdi: string): string {
    return `Bir ${kucukVakitAdi} kazası defterinizden düşüldü. ${KABUL_DUASI}.`;
}

/** Tesbihat tamamlanınca (saat ikizleri aynı sözü yazar). */
export const TESBIHAT_TAMAM_METNI = KABUL_DUASI;

/** Kurulum sihirbazı bitince ("Her şey hazır" başlığının alt satırının başı). */
export const KURULUM_BITTI_SELAMI = 'Hayırlı olsun.';
