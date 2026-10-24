/**
 * Dinî günler — Diyanet İşleri Başkanlığı takviminden ELLE aktarılmış tablo. SAF.
 *
 * NEDEN TABLO (hesap değil): Diyanet'in hicrî takvimi 2016 Uluslararası Hicrî Takvim Birliği
 * kurallarıyla İLAN edilir; Umm al-Qura ya da `Intl` (Hermes'te takvim desteği yok) aynı günü
 * vermez. Bir gün kayan "Bayramınız mübarek olsun" yanlış dinî bilgidir → tablo dışı tarihte
 * HİÇBİR ŞEY söylenmez (`null`), asla tahmin edilmez.
 *
 * Kaynaklar (her satır):
 *  - 2026: resmî liste `vakithesaplama.diyanet.gov.tr/dinigunler.php?yil=2026` (birebir).
 *  - 2027: Diyanet'in Ağustos 2026'da duyurduğu takvim (resmî liste sayfası 2027'yi henüz
 *    yayımlamadı); ikincil kaynaklar "Diyanet teyitli" (minara.app, Millî Gazete) birbiriyle ve
 *    ay başlarıyla tutarlı: 1 Receb 1448 = 10 Ara 2026 → Miraç (26 Receb) 4 Oca 2027, 1 Şaban
 *    9 Oca → Berat (14 Şaban) 22 Oca, 1 Ramazan 8 Şub → Kadir (26 Ramazan) 5 Mar.
 *  Ayrıntı: `docs/superpowers/specs/2026-10-22-samimiyet-dini-gunler-kaynak.md`.
 *
 * YILLIK BAKIM: Diyanet her yıl ertesi yılın listesini yayımlar → yeni satırlar eklenir
 * (`ozelGunler.test.ts` sıra/tekillik nöbetçisi). Tablo bitince yalnız cuma ve vakit selamı kalır.
 *
 * GÜN SINIRI: tarih Diyanet listesindeki MİLADÎ gündür. Kandiller listede "gecesi kandil olan
 * gün" olarak yazılır (10 Aralık 2026 Perşembe = Regaib; kandil o akşam başlar) → selam o gün
 * boyunca gösterilir. Eşleme NAMAZ GÜNÜNÜN ISO dizesiyle yapılır.
 */

export type OzelGunTuru =
    | 'ramazanBayrami'
    | 'kurbanBayrami'
    | 'arefe'
    | 'kandil'
    | 'kadir'
    | 'hicriYilbasi';

/** Kandil gecesinin kimliği (ülke kuralı ve selam metni buna göre). */
export type KandilGecesi = 'regaib' | 'mirac' | 'berat' | 'mevlid';

export interface OzelGun {
    tarih: string; // YYYY-MM-DD
    tur: OzelGunTuru;
    /** Yalnız `tur: 'kandil'` için. */
    gece?: KandilGecesi;
    /** Görünen ad ("Regaib Kandili") — ekran okuyucu ve test için. */
    ad: string;
}

/** Ramazan ayı aralıkları (ilk oruç → arefe; arefe de oruçlu gündür), kapsayıcı. */
export interface RamazanAraligi {
    baslangic: string;
    bitis: string;
}

export const RAMAZAN_ARALIKLARI: readonly RamazanAraligi[] = [
    { baslangic: '2026-02-19', bitis: '2026-03-19' }, // 1447, resmî
    { baslangic: '2027-02-08', bitis: '2027-03-08' }, // 1448, 29 gün
];

export const OZEL_GUNLER: readonly OzelGun[] = [
    // ── 2026 (resmî liste) ──
    { tarih: '2026-01-15', tur: 'kandil', ad: 'Miraç Kandili', gece: 'mirac' },
    { tarih: '2026-02-02', tur: 'kandil', ad: 'Berat Kandili', gece: 'berat' },
    { tarih: '2026-03-16', tur: 'kadir', ad: 'Kadir Gecesi' },
    { tarih: '2026-03-19', tur: 'arefe', ad: 'Ramazan Bayramı Arefesi' },
    { tarih: '2026-03-20', tur: 'ramazanBayrami', ad: 'Ramazan Bayramı 1. Gün' },
    { tarih: '2026-03-21', tur: 'ramazanBayrami', ad: 'Ramazan Bayramı 2. Gün' },
    { tarih: '2026-03-22', tur: 'ramazanBayrami', ad: 'Ramazan Bayramı 3. Gün' },
    { tarih: '2026-05-26', tur: 'arefe', ad: 'Kurban Bayramı Arefesi' },
    { tarih: '2026-05-27', tur: 'kurbanBayrami', ad: 'Kurban Bayramı 1. Gün' },
    { tarih: '2026-05-28', tur: 'kurbanBayrami', ad: 'Kurban Bayramı 2. Gün' },
    { tarih: '2026-05-29', tur: 'kurbanBayrami', ad: 'Kurban Bayramı 3. Gün' },
    { tarih: '2026-05-30', tur: 'kurbanBayrami', ad: 'Kurban Bayramı 4. Gün' },
    { tarih: '2026-06-16', tur: 'hicriYilbasi', ad: 'Hicrî Yılbaşı' },
    { tarih: '2026-08-24', tur: 'kandil', ad: 'Mevlid Kandili', gece: 'mevlid' },
    { tarih: '2026-12-10', tur: 'kandil', ad: 'Regaib Kandili', gece: 'regaib' },
    // ── 2027 (Diyanet duyurusu) ──
    { tarih: '2027-01-04', tur: 'kandil', ad: 'Miraç Kandili', gece: 'mirac' },
    { tarih: '2027-01-22', tur: 'kandil', ad: 'Berat Kandili', gece: 'berat' },
    { tarih: '2027-03-05', tur: 'kadir', ad: 'Kadir Gecesi' },
    { tarih: '2027-03-08', tur: 'arefe', ad: 'Ramazan Bayramı Arefesi' },
    { tarih: '2027-03-09', tur: 'ramazanBayrami', ad: 'Ramazan Bayramı 1. Gün' },
    { tarih: '2027-03-10', tur: 'ramazanBayrami', ad: 'Ramazan Bayramı 2. Gün' },
    { tarih: '2027-03-11', tur: 'ramazanBayrami', ad: 'Ramazan Bayramı 3. Gün' },
    { tarih: '2027-05-15', tur: 'arefe', ad: 'Kurban Bayramı Arefesi' },
    { tarih: '2027-05-16', tur: 'kurbanBayrami', ad: 'Kurban Bayramı 1. Gün' },
    { tarih: '2027-05-17', tur: 'kurbanBayrami', ad: 'Kurban Bayramı 2. Gün' },
    { tarih: '2027-05-18', tur: 'kurbanBayrami', ad: 'Kurban Bayramı 3. Gün' },
    { tarih: '2027-05-19', tur: 'kurbanBayrami', ad: 'Kurban Bayramı 4. Gün' },
    { tarih: '2027-06-06', tur: 'hicriYilbasi', ad: 'Hicrî Yılbaşı' },
    { tarih: '2027-08-13', tur: 'kandil', ad: 'Mevlid Kandili', gece: 'mevlid' },
    { tarih: '2027-12-02', tur: 'kandil', ad: 'Regaib Kandili', gece: 'regaib' },
    { tarih: '2027-12-24', tur: 'kandil', ad: 'Miraç Kandili', gece: 'mirac' },
];

/** Tablonun kapsadığı son gün (sonrası bilinmiyor → özel gün selamı yok). */
export const TABLO_SON_GUNU = '2027-12-31';

export function ozelGunBul(tarihIso: string): OzelGun | null {
    return OZEL_GUNLER.find((g) => g.tarih === tarihIso) ?? null;
}

/** Bu namaz günü Ramazan'da mı (ilk oruç → arefe, kapsayıcı; dize karşılaştırması). */
export function ramazanGunuMu(tarihIso: string): boolean {
    return RAMAZAN_ARALIKLARI.some((r) => tarihIso >= r.baslangic && tarihIso <= r.bitis);
}
