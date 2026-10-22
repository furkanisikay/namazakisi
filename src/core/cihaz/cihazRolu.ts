/**
 * "Hatırlatmaları bu cihazda kur" — TEK BEYİN ilkesi.
 *
 * Aynı kişinin ikinci cihazı (tablet, iPad) muhafız, nafile, cuma, vakit bildirimi,
 * sayaçlar ve diğer hatırlatmaları KURMAZ: aynı uyarı telefonla birlikte iki kez
 * çalardı. İkinci cihaz vakitleri gösterir, "Kıldım" işaretler — hatırlatmayı telefon
 * verir. Ev ekranı modu (tablet pano) açıksa hatırlatma hiç kurulmaz.
 *
 * SAF: depolama/React yok. Cihazın telefon olup olmadığı bilinmez (eşitleme yükü cihaz
 * bilgisi taşımaz), bu yüzden geniş ekranlı cihazda kullanıcıya BİR KEZ sorulur;
 * telefonda sorulmaz (varsayılan "ana"). Rol bilinmiyorken hatırlatma KURULUR: mevcut
 * kurulumda sessizce hatırlatma kesmektense soruyu beklemek yeğdir.
 */

export type CihazRolu = 'ana' | 'ikincil';

export interface CihazRoluAyari {
    /** Yoksa henüz seçilmedi (telefonda varsayılan ana sayılır). */
    rol?: CihazRolu;
    /** Geniş ekranda soru bir kez gösterildi (yanıtsız kapatılsa da tekrar sorulmaz). */
    soruldu?: boolean;
}

/** Sorunun gösterildiği en küçük ekran kenarı (dp): tablet, iPad, Fold iç ekranı. */
export const ROL_SORUSU_KISA_KENAR_DP = 600;

/** Diskten gelen ham değeri güvenle çözer; bozuksa boş ayar (rol bilinmiyor). */
export function cihazRoluCoz(ham: unknown): CihazRoluAyari {
    if (!ham || typeof ham !== 'object') return {};
    const n = ham as Record<string, unknown>;
    const ayar: CihazRoluAyari = {};
    if (n.rol === 'ana' || n.rol === 'ikincil') ayar.rol = n.rol;
    if (n.soruldu === true) ayar.soruldu = true;
    return ayar;
}

/** Hatırlatmalar bu cihazda kurulur mu? Tek karar — her planlayıcı buradan geçer. */
export function hatirlatmaKurulurMu(ayar: CihazRoluAyari, evEkraniAcik: boolean): boolean {
    if (evEkraniAcik) return false;
    return ayar.rol !== 'ikincil';
}

/** "Bu cihaz sizin ana telefonunuz mu?" sorusu gösterilmeli mi? */
export function rolSorulmaliMi(ayar: CihazRoluAyari, kisaKenarDp: number): boolean {
    if (ayar.rol !== undefined || ayar.soruldu) return false;
    return Number.isFinite(kisaKenarDp) && kisaKenarDp >= ROL_SORUSU_KISA_KENAR_DP;
}
