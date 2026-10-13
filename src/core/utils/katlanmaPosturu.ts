/**
 * Katlanabilir cihaz postürü ve ana ekran gün düzeni kararı (issue #283).
 *
 * MASAÜSTÜ POSTÜRÜ: Galaxy Z Fold/Flip yarı açık, alt yarısı masada, üst yarısı
 * dik (Jetpack WindowManager: `FoldingFeature.state == HALF_OPENED` ve
 * `orientation == HORIZONTAL`). Menteşenin ÜSTÜNDE büyük geri sayım + şu anki
 * vakit (dik duran ekran — dokunulmaz, bakılır), ALTINDA günlük akış (masadaki
 * yarı — dokunulur).
 *
 * SAF: react-native'e ve native köprüye bağımlı değildir. Native ham veriyi
 * `modules/expo-katlanma-posturu` yollar; burada DOĞRULANIR. Bozuk/eksik veri
 * daima "düz"e düşer — bilinen düzen her durumda çalışır, masaüstü düzeni ancak
 * menteşe sınırı geçerliyse.
 */
import { ikiBolmeliMi, type EkranSinifi } from './ekranSinifi';

/** `duz`: katlanma yok ya da tam açık · `masaustu`: yarı açık + yatay menteşe · `kitap`: yarı açık + dikey menteşe. */
export type PosturTuru = 'duz' | 'masaustu' | 'kitap';

/** Menteşe sınırı — dp, React kök görünümüne (pencereye) göre. */
export interface MenteseSiniri {
    sol: number;
    ust: number;
    sag: number;
    alt: number;
}

export interface Postur {
    tur: PosturTuru;
    /** Yalnız yarı açık postürlerde dolu. */
    mentese: MenteseSiniri | null;
}

export const DUZ_POSTUR: Postur = Object.freeze({ tur: 'duz', mentese: null }) as Postur;

/** Ana ekran gün sayfasının yerleşimi. */
export type GunDuzeni = 'tek' | 'ikiBolme' | 'masaustu';

/**
 * Masaüstü düzeninde bir yarının taşıması gereken en küçük yükseklik (dp).
 * Daha küçükse (menteşe sayfanın kenarına çok yakın — ör. başlık menteşeyi
 * aşmış) iki yarı anlamsızlaşır; o zaman eşit bölmeye düşülür.
 */
export const MASAUSTU_MIN_YARI_DP = 120;

const sayiMi = (d: unknown): d is number => typeof d === 'number' && Number.isFinite(d);

function siniriCoz(ham: unknown): MenteseSiniri | null {
    if (!ham || typeof ham !== 'object') return null;
    const s = ham as Record<string, unknown>;
    if (!sayiMi(s.sol) || !sayiMi(s.ust) || !sayiMi(s.sag) || !sayiMi(s.alt)) return null;
    // Ters/negatif kutu = bozuk veri.
    if (s.alt < s.ust || s.sag < s.sol || s.alt < 0 || s.sag < 0) return null;
    return { sol: s.sol, ust: s.ust, sag: s.sag, alt: s.alt };
}

/**
 * Native'den gelen ham postürü doğrular. Masaüstü için menteşe sınırı ŞARTTIR
 * (yarıları ona göre çizeriz); sınır bozuksa "düz" döner.
 */
export function posturuCoz(ham: unknown): Postur {
    if (!ham || typeof ham !== 'object') return DUZ_POSTUR;
    const p = ham as Record<string, unknown>;
    if (p.durum !== 'yariAcik') return DUZ_POSTUR;
    const mentese = siniriCoz(p.sinir);
    if (!mentese) return DUZ_POSTUR;
    if (p.yon === 'yatay') return { tur: 'masaustu', mentese };
    if (p.yon === 'dikey') return { tur: 'kitap', mentese };
    return DUZ_POSTUR;
}

/** İki postür aynı mı (gereksiz yeniden çizimi önlemek için değer karşılaştırması). */
export function posturlerAyniMi(a: Postur, b: Postur): boolean {
    if (a.tur !== b.tur) return false;
    if (a.mentese === b.mentese) return true;
    if (!a.mentese || !b.mentese) return false;
    return (
        a.mentese.sol === b.mentese.sol &&
        a.mentese.ust === b.mentese.ust &&
        a.mentese.sag === b.mentese.sag &&
        a.mentese.alt === b.mentese.alt
    );
}

/**
 * Gün sayfası düzeni. Masaüstü postürü pencere sınıfından ÖNCE gelir: Z Flip'in
 * iç ekranı kompakt, yatay tutulan Fold iç ekranı geniştir — ikisinde de
 * yarı açıkken üst yarı ayaktadır ve iki bölmeli yan yana düzen yanlış yarıya
 * düşerdi. "Kitap" postürü (dikey menteşe) iki bölmeli düzenle zaten uyumludur.
 */
export function gunDuzeniSec(sinif: EkranSinifi, postur: Postur): GunDuzeni {
    if (postur.tur === 'masaustu') return 'masaustu';
    return ikiBolmeliMi(sinif) ? 'ikiBolme' : 'tek';
}

export interface MasaustuBolmeleri {
    /** Sayfanın üstünden menteşenin üst kenarına kadar (dp). */
    ustYukseklik: number;
    /** Menteşenin kendi kalınlığı (görsel ayraç; çoğu cihazda 0). */
    menteseYukseklik: number;
    /** Menteşenin alt kenarından sayfanın altına kadar (dp). */
    altYukseklik: number;
}

/**
 * Sayfanın pencerede ölçülen konumundan (`measureInWindow`) iki yarının
 * yüksekliklerini hesaplar. Menteşe sayfanın içinde değilse ya da bir yarı
 * `MASAUSTU_MIN_YARI_DP`'den küçük kalıyorsa `null` → çağıran eşit bölmeye düşer.
 */
export function masaustuBolmeleriHesapla(
    mentese: MenteseSiniri,
    sayfaUstY: number,
    sayfaYukseklik: number,
): MasaustuBolmeleri | null {
    if (!sayiMi(sayfaUstY) || !sayiMi(sayfaYukseklik) || sayfaYukseklik <= 0) return null;
    const ustYukseklik = mentese.ust - sayfaUstY;
    const menteseYukseklik = Math.max(0, mentese.alt - mentese.ust);
    const altYukseklik = sayfaUstY + sayfaYukseklik - mentese.alt;
    if (ustYukseklik < MASAUSTU_MIN_YARI_DP || altYukseklik < MASAUSTU_MIN_YARI_DP) return null;
    return { ustYukseklik, menteseYukseklik, altYukseklik };
}
