/**
 * Kerahat sınırları — SAF, tek kaynak.
 */
import { KAZA_SABITLERI } from '../constants/UygulamaSabitleri';

const DK = 60_000;

/**
 * İkindide güneşin sararması (gurub kerahati) başlangıcı: akşam girişi −
 * `MEKRUH_TOLERANS_DK`.
 *
 * TEK KAYNAK: `KazaHesaplayiciServisi.mekruhVakitKontrolEt` gurub penceresini ve
 * takvim çakışması (#291) ikindinin son uygun anını buradan alır. İkindinin çıkışı
 * akşamın girişidir.
 */
export const gurubKerahatiBaslangiciMs = (aksamGirisMs: number): number =>
    aksamGirisMs - KAZA_SABITLERI.MEKRUH_TOLERANS_DK * DK;
