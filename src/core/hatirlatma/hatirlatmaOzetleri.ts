/**
 * Hatırlatmalar sayfasındaki satırların ve Ayarlar kökündeki "Hatırlatmalar" satırının
 * tek satırlık CANLI özetleri (sade tasarım, Dalga 3). SAF: store/React import etmez,
 * girdiler parametredir. Metin bütçesi ≤ 6 kelime; teknik terim yok.
 *
 * Vakit adları sabit haritadan (Türkçe `toLowerCase`/`toUpperCase` İ tuzağı — AGENTS.md).
 */
import { DUZEY_ADLARI, OZEL_DUZEY, type HatirlatmaDuzeyi } from './duzeyOzeti';
import { bicim, metin, sayili } from '../dil/aktifDil';

export type VakitAnahtari = 'imsak' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';

const VAKIT_SIRASI: readonly VakitAnahtari[] = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];

const iki = (n: number) => String(n).padStart(2, '0');

/** "Sabah, öğle" — açık vakitlerin listesi (sıra kronolojik). */
export function vakitListesi(acik: Partial<Record<VakitAnahtari, boolean>>): string {
    const liste = VAKIT_SIRASI.filter((v) => acik[v] === true);
    const { adlar, kucuk } = metin().vakit;
    return liste.map((v, i) => (i === 0 ? adlar[v] : kucuk[v])).join(', ');
}

/** Vakit girince (vakit bildirimleri). */
export function vakitGirinceOzeti(acik: Partial<Record<VakitAnahtari, boolean>>): string {
    const sayi = VAKIT_SIRASI.filter((v) => acik[v] === true).length;
    const o = metin().hatirlatma.ozet;
    if (sayi === 0) return o.kapali;
    if (sayi === 5) return o.besVakitte;
    return vakitListesi(acik);
}

/** Vakit çıkmadan (muhafız düzeyi). */
export function vakitCikmadanOzeti(aktif: boolean, yogunluk: string): string {
    const o = metin().hatirlatma.ozet;
    if (!aktif) return o.kapali;
    if (yogunluk === 'ozel') return OZEL_DUZEY.ad;
    const ad = DUZEY_ADLARI[yogunluk as HatirlatmaDuzeyi];
    return ad ? bicim(o.duzey, { ad }) : o.acik;
}

/**
 * Gece sessizliği satırı. Kapalıyken öneri cümlesi (mevcut kullanıcı göçle açılmaz;
 * satır ne kazanacağını söyler).
 */
export function geceSessizligiOzeti(ayar: { aktif: boolean; baslangicSaat: number; baslangicDakika: number } | undefined): string {
    const o = metin().hatirlatma.ozet;
    if (!ayar?.aktif) return o.geceKapali;
    const saat = `${String(ayar.baslangicSaat).padStart(2, '0')}:${String(ayar.baslangicDakika).padStart(2, '0')}`;
    return bicim(o.geceAcik, { saat });
}

/** Adımların en erken eşiği (dk) — "ne kadar önce başlar". */
export function enErkenEsik(adimlar: ReadonlyArray<{ esikDk: number }> | undefined): number | null {
    if (!adimlar || adimlar.length === 0) return null;
    return Math.max(...adimlar.map((a) => a.esikDk));
}

/** Cuma: "Öğleden 60 dk önce". */
export function cumaOzeti(aktif: boolean, adimlar?: ReadonlyArray<{ esikDk: number }>): string {
    const o = metin().hatirlatma.ozet;
    if (!aktif) return o.kapali;
    const dk = enErkenEsik(adimlar);
    return dk == null ? o.acik : bicim(o.cuma, { dk });
}

/** Camiye gitme vakti: "Öğle, akşam: 20 dk önce" (orta nokta ayracı yok — görsel dil kuralı). */
export function camiyeGitOzeti(
    aktif: boolean,
    vakitler: Partial<Record<VakitAnahtari, boolean>>,
    adimlar?: ReadonlyArray<{ esikDk: number }>
): string {
    const o = metin().hatirlatma.ozet;
    if (!aktif) return o.kapali;
    const liste = vakitListesi(vakitler);
    if (!liste) return o.vakitSecilmedi;
    const dk = enErkenEsik(adimlar);
    return dk == null ? liste : bicim(o.camiye, { liste, dk });
}

/** Yatmadan önce: "Yatış 23:00". */
export function yatisOzeti(aktif: boolean, saat: number, dakika: number): string {
    const o = metin().hatirlatma.ozet;
    return aktif ? bicim(o.yatis, { saat: `${iki(saat)}:${iki(dakika)}` }) : o.kapali;
}

/** Toplantı çakışırsa (takvim çakışması). */
export function takvimCakismaOzeti(aktif: boolean): string {
    const o = metin().hatirlatma.ozet;
    return aktif ? o.takvim : o.kapali;
}

/** Günü tamamlamadıysam (seri gün sonu hatırlatması). */
export function gunSonuOzeti(g: {
    aktif: boolean;
    mod: 'otomatik' | 'sabit';
    imsakOncesiDk: number;
    saat: number;
    dakika: number;
}): string {
    const o = metin().hatirlatma.ozet;
    if (!g.aktif) return o.kapali;
    return g.mod === 'otomatik'
        ? bicim(o.gunSonuOto, { dk: g.imsakOncesiDk })
        : bicim(o.gunSonuSabit, { saat: `${iki(g.saat)}:${iki(g.dakika)}` });
}

/** Özel gün (hatırlatmaları ve seriyi durdurur). */
export function ozelGunOzeti(modAktif: boolean, suruyor: boolean): string {
    const o = metin().hatirlatma.ozet;
    if (suruyor) return o.ozelSuruyor;
    return modAktif ? o.ozelHazir : o.kapali;
}

/**
 * Ayarlar kökündeki "Hatırlatmalar" satırı: düzey + açık diğer hatırlatma sayısı.
 * "Normal düzey, 3 hatırlatma daha" / hiçbiri yoksa "Kapalı".
 */
export function hatirlatmalarOzeti(muhafizAktif: boolean, yogunluk: string, digerAcikSayisi: number): string {
    const duzey = muhafizAktif ? vakitCikmadanOzeti(true, yogunluk) : null;
    const o = metin().hatirlatma.ozet;
    if (!duzey) return digerAcikSayisi === 0 ? o.kapali : sayili(o.acikSayisi, digerAcikSayisi);
    return digerAcikSayisi === 0 ? duzey : sayili(o.dahaSayisi, digerAcikSayisi, { duzey });
}
