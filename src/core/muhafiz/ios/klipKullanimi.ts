/**
 * iOS ANONS KLIPLERININ COP TOPLAMA KARARI (saf).
 *
 * SAF modul: `react-native`/`expo-*` import ETMEZ, diske dokunmaz. Yalniz
 * "hangi klipler tutulmali?" sorusunu cevaplar.
 *
 * ---------------------------------------------------------------------------
 * NEDEN "BU TURDA KULLANILMAYANI SIL" YETMEZ (tasarim tuzagi)
 *
 * Planlama yalniz BUGUNUN KILINMAMIS vakitlerini kapsar. Kullanici ogleyi
 * kildiginda yeniden planlama turunda ogle hic planlanmaz → onun klipleri o
 * turda "kullanilmayan" gorunur. Bunlari silseydik ertesi gun ayni klipler
 * YENIDEN sentezlenmek zorunda kalirdi — ve ertesi gunun ilk planlamasi arka
 * plan gorevinden gelirse (kullanici uygulamayi acmadiysa) sentez YAPILAMAZ
 * (bkz. `IosMuhafizTeslimcisi` baglam kurali), uyari varsayilan sese duser.
 * Yani her gun namaz kilan kullanici, tam da kildigi icin, ertesi gun anonsu
 * DUYMAZDI.
 *
 * COZUM: yasa dayali tutma. Her klibin SON KULLANILDIGI gun kaydedilir; son
 * `KLIP_TUTMA_GUNU` gun icinde en az bir kez planlanmis klip korunur. Ayar
 * degisince eskiyen klipler bir hafta icinde kendiliginden temizlenir.
 */

/** Klip adi → son kullanildigi gun (`YYYY-MM-DD`). */
export type KlipKullanimKaydi = Record<string, string>;

/** Bir klip en son kullanimindan bu kadar gun sonra silinir. */
export const KLIP_TUTMA_GUNU = 7;

const GUN_MS = 24 * 60 * 60 * 1000;

/** `YYYY-MM-DD` → yerel gece yarisi (ms). Gecersizse `NaN`. */
function gunMs(tarih: string): number {
    const parca = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tarih);
    if (!parca) return NaN;
    return new Date(Number(parca[1]), Number(parca[2]) - 1, Number(parca[3])).getTime();
}

/** Iki gun arasindaki tam gun farki (`sonra - once`). DST'de yuvarlanir. */
export function gunFarki(once: string, sonra: string): number {
    return Math.round((gunMs(sonra) - gunMs(once)) / GUN_MS);
}

/**
 * Bu turda kullanilan klipleri kayda isler ve TUTULACAK kaydi dondurur.
 *
 * Donen kayit hem diske yazilir hem de korunacak ad listesidir: kayitta
 * olmayan her klip silinebilir.
 *
 * Bozuk girdi (nesne olmayan kayit, gecersiz tarih) sessizce elenir — kayit
 * cihazdan okunur ve bozuk bir satir butun GC'yi durdurmamali. Bozuk tarihli
 * satir SILINIR (tutulmaz): tutulsaydi o dosya asla temizlenemezdi.
 */
export function klipKaydiniGuncelle(
    mevcut: unknown,
    kullanilanlar: Iterable<string>,
    bugun: string,
    tutmaGunu: number = KLIP_TUTMA_GUNU
): KlipKullanimKaydi {
    const sonuc: KlipKullanimKaydi = {};

    if (mevcut && typeof mevcut === 'object' && !Array.isArray(mevcut)) {
        for (const [ad, tarih] of Object.entries(mevcut as Record<string, unknown>)) {
            if (typeof tarih !== 'string') continue;
            const fark = gunFarki(tarih, bugun);
            if (!Number.isFinite(fark)) continue;
            if (fark < tutmaGunu) sonuc[ad] = tarih;
        }
    }

    for (const ad of kullanilanlar) sonuc[ad] = bugun;
    return sonuc;
}

/** Yerel tarihten `YYYY-MM-DD`. */
export function gunAnahtari(tarih: Date): string {
    const iki = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${tarih.getFullYear()}-${iki(tarih.getMonth() + 1)}-${iki(tarih.getDate())}`;
}
