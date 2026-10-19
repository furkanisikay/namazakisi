/**
 * Hatırlatmalar sayfasındaki satırların ve Ayarlar kökündeki "Hatırlatmalar" satırının
 * tek satırlık CANLI özetleri (sade tasarım, Dalga 3). SAF: store/React import etmez,
 * girdiler parametredir. Metin bütçesi ≤ 6 kelime; teknik terim yok.
 *
 * Vakit adları sabit haritadan (Türkçe `toLowerCase`/`toUpperCase` İ tuzağı — AGENTS.md).
 */
import { DUZEY_ADLARI, OZEL_DUZEY_ADI, type HatirlatmaDuzeyi } from './duzeyOzeti';

export type VakitAnahtari = 'imsak' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';

const VAKIT_SIRASI: readonly VakitAnahtari[] = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];
const VAKIT_BAS: Record<VakitAnahtari, string> = { imsak: 'Sabah', ogle: 'Öğle', ikindi: 'İkindi', aksam: 'Akşam', yatsi: 'Yatsı' };
const VAKIT_KUCUK: Record<VakitAnahtari, string> = { imsak: 'sabah', ogle: 'öğle', ikindi: 'ikindi', aksam: 'akşam', yatsi: 'yatsı' };

const iki = (n: number) => String(n).padStart(2, '0');

/** "Sabah, öğle" — açık vakitlerin listesi (sıra kronolojik). */
export function vakitListesi(acik: Partial<Record<VakitAnahtari, boolean>>): string {
    const liste = VAKIT_SIRASI.filter((v) => acik[v] === true);
    return liste.map((v, i) => (i === 0 ? VAKIT_BAS[v] : VAKIT_KUCUK[v])).join(', ');
}

/** Vakit girince (vakit bildirimleri). */
export function vakitGirinceOzeti(acik: Partial<Record<VakitAnahtari, boolean>>): string {
    const sayi = VAKIT_SIRASI.filter((v) => acik[v] === true).length;
    if (sayi === 0) return 'Kapalı';
    if (sayi === 5) return 'Beş vakitte';
    return vakitListesi(acik);
}

/** Vakit çıkmadan (muhafız düzeyi). */
export function vakitCikmadanOzeti(aktif: boolean, yogunluk: string): string {
    if (!aktif) return 'Kapalı';
    if (yogunluk === 'ozel') return OZEL_DUZEY_ADI;
    const ad = DUZEY_ADLARI[yogunluk as HatirlatmaDuzeyi];
    return ad ? `${ad} düzey` : 'Açık';
}

/**
 * Gece sessizliği satırı. Kapalıyken öneri cümlesi (mevcut kullanıcı göçle açılmaz;
 * satır ne kazanacağını söyler).
 */
export function geceSessizligiOzeti(ayar: { aktif: boolean; baslangicSaat: number; baslangicDakika: number } | undefined): string {
    if (!ayar?.aktif) return 'Kapalı · açarsanız gece uyarı gelmez';
    const s = `${String(ayar.baslangicSaat).padStart(2, '0')}:${String(ayar.baslangicDakika).padStart(2, '0')}`;
    return `${s} – imsak arası uyarı gelmez`;
}

/** Adımların en erken eşiği (dk) — "ne kadar önce başlar". */
export function enErkenEsik(adimlar: ReadonlyArray<{ esikDk: number }> | undefined): number | null {
    if (!adimlar || adimlar.length === 0) return null;
    return Math.max(...adimlar.map((a) => a.esikDk));
}

/** Cuma: "Öğleden 60 dk önce". */
export function cumaOzeti(aktif: boolean, adimlar?: ReadonlyArray<{ esikDk: number }>): string {
    if (!aktif) return 'Kapalı';
    const dk = enErkenEsik(adimlar);
    return dk == null ? 'Açık' : `Öğleden ${dk} dk önce`;
}

/** Camiye gitme vakti: "Öğle, akşam · 20 dk önce". */
export function camiyeGitOzeti(
    aktif: boolean,
    vakitler: Partial<Record<VakitAnahtari, boolean>>,
    adimlar?: ReadonlyArray<{ esikDk: number }>
): string {
    if (!aktif) return 'Kapalı';
    const liste = vakitListesi(vakitler);
    if (!liste) return 'Vakit seçilmedi';
    const dk = enErkenEsik(adimlar);
    return dk == null ? liste : `${liste} · ${dk} dk önce`;
}

/** Yatmadan önce: "Yatış 23:00". */
export function yatisOzeti(aktif: boolean, saat: number, dakika: number): string {
    return aktif ? `Yatış ${iki(saat)}:${iki(dakika)}` : 'Kapalı';
}

/** Toplantı çakışırsa (takvim çakışması). */
export function takvimCakismaOzeti(aktif: boolean): string {
    return aktif ? 'Takviminize bakar' : 'Kapalı';
}

/** Günü tamamlamadıysam (seri gün sonu hatırlatması). */
export function gunSonuOzeti(g: {
    aktif: boolean;
    mod: 'otomatik' | 'sabit';
    imsakOncesiDk: number;
    saat: number;
    dakika: number;
}): string {
    if (!g.aktif) return 'Kapalı';
    return g.mod === 'otomatik' ? `İmsaktan ${g.imsakOncesiDk} dk önce` : `Her gün ${iki(g.saat)}:${iki(g.dakika)}`;
}

/** Özel gün (hatırlatmaları ve seriyi durdurur). */
export function ozelGunOzeti(modAktif: boolean, suruyor: boolean): string {
    if (suruyor) return 'Şu an sürüyor';
    return modAktif ? 'Hazır, başlatılmadı' : 'Kapalı';
}

/**
 * Ayarlar kökündeki "Hatırlatmalar" satırı: düzey + açık diğer hatırlatma sayısı.
 * "Normal düzey · 3 hatırlatma daha" / hiçbiri yoksa "Kapalı".
 */
export function hatirlatmalarOzeti(muhafizAktif: boolean, yogunluk: string, digerAcikSayisi: number): string {
    const duzey = muhafizAktif ? vakitCikmadanOzeti(true, yogunluk) : null;
    if (!duzey) return digerAcikSayisi === 0 ? 'Kapalı' : `${digerAcikSayisi} hatırlatma açık`;
    return digerAcikSayisi === 0 ? duzey : `${duzey} · ${digerAcikSayisi} hatırlatma daha`;
}
