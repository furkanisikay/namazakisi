/**
 * Ana ekranda kerahat metni hangi durumda ne der? SAF.
 *
 * Gurub (güneş batışı) kerahatinde servisin metni "Akşam ezanını bekleyiniz" der.
 * Bu, kaza ve nafile için doğrudur; ama O GÜNÜN İKİNDİSİ için yanlış hedeftir:
 * Hanefî mezhebine ve Diyanet'e göre o günün ikindisi gurub vaktinde kerahatle de olsa
 * kılınır (vakti çıkmadan kılmak, kazaya bırakmaktan iyidir). Ekran ikindisi henüz
 * kılınmamış kişiye "bekleyin" deseydi vaktin çıkmasına yol açardı.
 *
 * Kural:
 *  - gurub + bugünün ikindisi kılınmadı → "şimdi kılabilirsiniz" (GURUB_IKINDI_METNI),
 *  - gurub + ikindi kılındı / ikindinin durumu bilinmiyor → servisin metni (değişmez),
 *  - şuruk / istiva → servisin metni (değişmez).
 * Kaza defterindeki uyarı bu fonksiyondan geçmez (kaza için "bekleyin" doğrudur).
 */

export type KerahatTuru = 'suruk' | 'istiva' | 'gurub';

export const GURUB_IKINDI_METNI =
    'Güneş batış vaktidir (gurub). Bugünün ikindisini henüz kılmadıysanız şimdi kılabilirsiniz.';

export interface KerahatGirdisi {
    /** Servisin metni (`mekruhVakitKontrolEt(..., 'farz')`). */
    aciklama: string | null;
    tur?: KerahatTuru;
    /** Aktif günün ikindisi kılındı mı? `null` = kayıt henüz okunmadı (bilinmiyor). */
    ikindiKilindi: boolean | null;
}

export function kerahatMetniSec({ aciklama, tur, ikindiKilindi }: KerahatGirdisi): string | null {
    if (!aciklama) return null;
    if (tur === 'gurub' && ikindiKilindi === false) return GURUB_IKINDI_METNI;
    return aciklama;
}
