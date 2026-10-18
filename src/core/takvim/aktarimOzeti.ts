/**
 * "Takvime aktarılmayı bekleyen değişiklik var mı?" — SAF (sade tasarım Dalga 4).
 *
 * Takvim entegrasyonunda ayar değişikliği takvime KENDİLİĞİNDEN yansımaz: etkinlikler
 * ancak "Takvime ekleyin" ile (öncekiler silinip) yeniden yazılır. Eskiden bunu yalnız
 * en alttaki 15 kelimelik bir not söylüyordu → ayar ile takvim sessizce ayrışıyordu.
 * Kendiliğinden yeniden oluşturmak ise uygulama DIŞINA geri alınamaz yazım + silme
 * demek (ve "davranış değişmez" kısıtı) → seçilen yol KALICI BANT:
 *   son başarılı aktarımdaki ayarların özeti ≠ şimdiki özet  ⇒  "Bekleyen değişiklik".
 *
 * Özete yalnız takvime yazılanı etkileyen alanlar girer (takvim, gün sayısı, vakit
 * ayarları); ana anahtar (`aktif`) ve takvimin görünen adı girmez.
 */

export interface AktarimVakitAyari {
    aktif: boolean;
    sureDakika: number;
    baslangicTipi: string;
    dakika: number;
}

export interface AktarimAyarlari {
    takvimId: string | null;
    kaciGunIlerisi: number;
    vakitAyarlari: Record<string, AktarimVakitAyari>;
}

/** Anahtar sırasından bağımsız, kararlı özet dizesi. */
export function aktarimOzeti(a: AktarimAyarlari): string {
    const vakitler = Object.keys(a.vakitAyarlari ?? {})
        .sort()
        .map((v) => {
            const x = a.vakitAyarlari[v];
            return [v, x?.aktif === true, x?.sureDakika ?? null, x?.baslangicTipi ?? null, x?.dakika ?? null];
        });
    return JSON.stringify({ t: a.takvimId ?? null, g: a.kaciGunIlerisi, v: vakitler });
}

/**
 * Bekleyen değişiklik: daha önce en az bir kez aktarılmış VE ayarlar o günden beri değişmiş.
 * Hiç aktarılmadıysa (`sonOzet` null) bant YOK — o durumda ana düğme zaten tek yol.
 */
export function bekleyenDegisiklikVarMi(sonOzet: string | null | undefined, a: AktarimAyarlari): boolean {
    if (!sonOzet) return false;
    return sonOzet !== aktarimOzeti(a);
}
