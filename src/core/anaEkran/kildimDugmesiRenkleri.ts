/**
 * Vakit kartı "Kıldım" düğmesinin metin renkleri — ÖLÇEREK seçilir (AGENTS.md kontrast tuzağı).
 *
 * Düğme dolu zeminlidir: kılınmamışken palet `birincil`, kılınmışken `basarili` (yeşil),
 * vakit girmemişken `metinIkincil` (gri). Beyaz metin bu zeminlerin çoğunda AA'yı TUTMAZ
 * (Zümrüt `#4CAF50` ≈ 2.8:1, Güneş `#FF9800` ≈ 2.2:1). Her zemin için beyaz ile koyu metin
 * arasından kontrastı yüksek olan alınır; nöbetçi test tüm paletlerde ve iki temada ≥ 4.5:1
 * ister (18 px kalın metin "büyük metin" eşiğinin altındadır).
 *
 * SAF: React/native import yok.
 */
import { okunurMetinRengi } from '../sade/sadeGorunum';

/** Açık temanın metin rengi — temadan bağımsız sabit koyu aday (koyu temada `metin` beyazdır). */
export const KOYU_METIN_ADAYI = '#212121';

export interface KildimDugmesiRenkGirdisi {
    birincil: string;
    basarili: string;
    metinIkincil: string;
    /** Birincil üzerindeki varsayılan metin (beyaz). */
    birincilMetin: string;
}

export interface KildimDugmesiRenkleri {
    /** Kılınmamış (birincil zemin) içerik rengi. */
    isaretleMetin: string;
    /** Kılınmış (yeşil zemin) içerik rengi. */
    kilindiMetin: string;
    /** Vakit girmemiş (gri zemin) içerik rengi. */
    girmediMetin: string;
}

export function kildimDugmesiRenkleri(g: KildimDugmesiRenkGirdisi): KildimDugmesiRenkleri {
    const adaylar = [g.birincilMetin, KOYU_METIN_ADAYI];
    return {
        isaretleMetin: okunurMetinRengi(g.birincil, adaylar),
        kilindiMetin: okunurMetinRengi(g.basarili, adaylar),
        girmediMetin: okunurMetinRengi(g.metinIkincil, adaylar),
    };
}
