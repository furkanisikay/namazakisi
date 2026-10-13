/**
 * CANLI SAYAÇ PAYI DEĞİŞTİ GÖZLEMCİSİ (Now Bar → Wear OS, issue #282 ikinci aşama).
 *
 * `CanliSayacPlanlayici` saatin payını (`CANLI_SAAT_VERISI`) diske yazınca haber
 * verir; `WearSenkronServisi.baslat` dinler ve saati tazeler.
 *
 * AYRI ve IMPORTSUZ DOSYA (`muhafizPlaniGozlemcisi` deseni): planlayıcı saat
 * servisini doğrudan yüklerse saat servisinin native köprü grafiği, sayaç
 * servislerini yükleyen her teste taşınırdı. Dinleyici yoksa (headless görev)
 * saat bir sonraki gönderimde (15 dk görevi, açılış) payı diskten okur.
 */

let dinleyici: (() => void) | null = null;

export const canliSaatDinleyicisiniAyarla = (fn: (() => void) | null): void => {
    dinleyici = fn;
};

/** Dinleyici hatası planlamayı ASLA düşürmez. */
export const canliSaatPayiDegisti = (): void => {
    try {
        dinleyici?.();
    } catch {
        // saat tazelenemedi: bir sonraki gönderim diskten okur
    }
};
