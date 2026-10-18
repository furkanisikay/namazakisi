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
 * ayarları ve KONUM — konum değişince etkinlik saatleri de değişir); ana anahtar
 * (`aktif`) ve takvimin görünen adı girmez. Konum 2 ondalığa (~1 km) yuvarlanır:
 * GPS titremesi bant çıkarmasın. Etkinlikler silinince son özet TEMİZLENİR (bant
 * silinmiş etkinliklerin "güncellenmesini" istemesin).
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

export interface AktarimKonumu {
    lat: number;
    lng: number;
}

const konumIzi = (k: AktarimKonumu | null | undefined): string | null =>
    k && Number.isFinite(k.lat) && Number.isFinite(k.lng) ? `${k.lat.toFixed(2)},${k.lng.toFixed(2)}` : null;

/** Anahtar sırasından bağımsız, kararlı özet dizesi. */
export function aktarimOzeti(a: AktarimAyarlari, konum?: AktarimKonumu | null): string {
    const vakitler = Object.keys(a.vakitAyarlari ?? {})
        .sort()
        .map((v) => {
            const x = a.vakitAyarlari[v];
            return [v, x?.aktif === true, x?.sureDakika ?? null, x?.baslangicTipi ?? null, x?.dakika ?? null];
        });
    return JSON.stringify({ t: a.takvimId ?? null, g: a.kaciGunIlerisi, v: vakitler, k: konumIzi(konum) });
}

/**
 * Bekleyen değişiklik: daha önce en az bir kez aktarılmış VE ayarlar o günden beri değişmiş.
 * Hiç aktarılmadıysa (`sonOzet` null) bant YOK — o durumda ana düğme zaten tek yol.
 */
export function bekleyenDegisiklikVarMi(
    sonOzet: string | null | undefined,
    a: AktarimAyarlari,
    konum?: AktarimKonumu | null
): boolean {
    if (!sonOzet) return false;
    return sonOzet !== aktarimOzeti(a, konum);
}
