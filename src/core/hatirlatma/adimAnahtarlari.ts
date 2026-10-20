/**
 * Adım listesinin KARARLI anahtarları — ekle/sil animasyonu için (SAF).
 *
 * `SeviyeAyari` kimlik taşımaz ve adım dizisi kronolojiktir: yeni adım dizinin ORTASINA
 * eklenebilir, silme de ortadan olabilir. İndeksi anahtar yapmak, ekleme/silmede
 * sonraki her satırı "başka adım" gibi gösterirdi (yanlış satır canlanır). Bu yardımcı
 * önceki ve yeni eşik dizisini karşılaştırıp TEK ekleme/silmenin yerini bulur:
 *
 *  - uzunluk aynı → anahtarlar indeksle korunur (eşik düzenleme, aç/kapa).
 *  - +1 → ilk ayrışan indekse yeni anahtar eklenir (`sonEklenen`).
 *  - −1 → ilk ayrışan indeksteki anahtar çıkar (`sonSilinen`, eski indeksiyle).
 *  - diğer (hazır düzey, yön değişimi) → hepsi yeniden kurulur, animasyon YOK.
 *
 * Eşikler bir pencerede TEKİLDİR (`matrisGecerliMi`, ek yüzeyde `adimNormalize`), bu yüzden
 * eşik karşılaştırması ekleme/silme yerini kesin bulur. Aynı girdiyle iki kez çağrılmak
 * (React'in çift çağırması) sonucu değiştirmez: uzunluk aynı kalır, son olaylar korunur.
 */
export interface AdimAnahtarDurumu {
    anahtarlar: string[];
    esikler: number[];
    sayac: number;
    /** Son eklenen adımın anahtarı (giriş animasyonu yalnız o satırda, bir kez). */
    sonEklenen: string | null;
    /** Son silinen adımın anahtarı + ESKİ indeksi (çıkış hayaleti için). */
    sonSilinen: { anahtar: string; indeks: number } | null;
}

const yeniAnahtarlar = (n: number, baslangic: number): string[] =>
    Array.from({ length: n }, (_, i) => `adim-${baslangic + i}`);

const ilkAyrisan = (a: readonly number[], b: readonly number[]): number => {
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
    return n;
};

export function adimAnahtarlariniGuncelle(
    onceki: AdimAnahtarDurumu | null,
    esikler: readonly number[]
): AdimAnahtarDurumu {
    if (!onceki) {
        return { anahtarlar: yeniAnahtarlar(esikler.length, 0), esikler: [...esikler], sayac: esikler.length, sonEklenen: null, sonSilinen: null };
    }
    const fark = esikler.length - onceki.esikler.length;
    if (fark === 0) {
        if (onceki.esikler.every((e, i) => e === esikler[i])) return onceki;
        return { ...onceki, esikler: [...esikler] };
    }
    if (fark === 1) {
        const i = ilkAyrisan(onceki.esikler, esikler);
        const anahtar = `adim-${onceki.sayac}`;
        const anahtarlar = [...onceki.anahtarlar.slice(0, i), anahtar, ...onceki.anahtarlar.slice(i)];
        return { anahtarlar, esikler: [...esikler], sayac: onceki.sayac + 1, sonEklenen: anahtar, sonSilinen: null };
    }
    if (fark === -1) {
        const i = ilkAyrisan(onceki.esikler, esikler);
        const anahtar = onceki.anahtarlar[i];
        const anahtarlar = onceki.anahtarlar.filter((_, j) => j !== i);
        return { anahtarlar, esikler: [...esikler], sayac: onceki.sayac, sonEklenen: null, sonSilinen: { anahtar, indeks: i } };
    }
    return {
        anahtarlar: yeniAnahtarlar(esikler.length, onceki.sayac),
        esikler: [...esikler],
        sayac: onceki.sayac + esikler.length,
        sonEklenen: null,
        sonSilinen: null,
    };
}
