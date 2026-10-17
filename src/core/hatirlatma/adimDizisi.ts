/**
 * ORTAK HATIRLATMA ADIM DİZİSİ — SAF (ortak hatırlatma yüzeyleri, plan §3.1).
 *
 * Nafile (#273) ile başlayan model artık her ek hatırlatma yüzeyinin (cuma,
 * camiye gitme, yatış, takvim çakışması) dilidir: `{ aktif, adimlar: SeviyeAyari[] }`.
 * Muhafızın bir vaktiyle aynı şekil; farkı yalnız KISITLAR:
 *   - en fazla `maksAdim` adım (yüzeye göre),
 *   - TON YOK: her adım 'nazik', `acilKanal: false` (acil kanal Rahatsız Etmeyin'i
 *     deler; bu yüzeylerin hiçbiri "vakit çıkıyor" değildir),
 *   - tekrar aralığı `tekrarMinDk..tekrarMaxDk`, eşik `esikMinDk..esikMaxDk`,
 *   - eşikler tekil, dizi KRONOLOJİK.
 * Kısıtlar NORMALİZE ile zorlanır: diskten ya da yedekten ne gelirse gelsin motor
 * aynı şeyi görür. Normalize kullanıcının seçtiği alanları (kanallar, alarm + kapsamı,
 * ses + adı, kapalı adımın kanal hafızası) KORUMAK zorundadır — atarsa ekrandaki her
 * anahtar yeniden açılışta sessizce geri döner.
 *
 * Bu dosya `core/nafile/nafileAdimlari.ts`'in genellemesidir; nafile kendi
 * sabitleriyle bunun üstüne kuruludur (nafile testleri değişmeden geçer).
 */
import type { SeviyeAyari, Siklik, UyariKanallari, VakitMuhafizAyari } from '../muhafiz/matrisTipleri';
import { VARSAYILAN_SES } from '../muhafiz/matrisTipleri';
import { ozelSesMi } from '../muhafiz/sesKimligi';
import type { PencereYonu } from '../muhafiz/pencereTipleri';
import { kronolojikSirala } from '../muhafiz/aktifSeviye';
import { ESIK_GUVENLIK_TAVANI, ESIK_MUTLAK_MIN } from '../muhafiz/esikSinirlari';
import { yeniAdimEsigi } from '../muhafiz/adimDuzenleme';

/** Bir yüzeyin adım kısıtları. */
export interface AdimKisitlari {
    maksAdim: number;
    tekrarMinDk: number;
    tekrarMaxDk: number;
    /** Eşik alt/üst sınırı (dk). Verilmezse motorun mutlak sınırları. */
    esikMinDk?: number;
    esikMaxDk?: number;
    /**
     * Eşik adımı (dk). Verilirse YENİ adım bu adımın katlarında aranır (cuma: 15).
     * Verilmezse muhafızın dakika dakika arama kuralı (`yeniAdimEsigi`).
     */
    esikAdimDk?: number;
}

/** Ek hatırlatma yüzeylerinin ortak üst sınırı (plan §3.1). */
export const EK_HATIRLATMA_MAKS_ADIM = 3;

/** Ayarın adım kısmı — yön opsiyoneldir (sabit yönlü yüzeylerde yazılmaz). */
export interface AdimliAyar {
    aktif: boolean;
    adimlar: SeviyeAyari[];
}

const nesneMi = (d: unknown): d is Record<string, unknown> =>
    !!d && typeof d === 'object' && !Array.isArray(d);

export const sayiKenetle = (deger: unknown, min: number, max: number, varsayilan: number): number => {
    if (typeof deger !== 'number' || !Number.isFinite(deger)) return varsayilan;
    return Math.min(max, Math.max(min, Math.round(deger)));
};

const esikMin = (k: AdimKisitlari): number => k.esikMinDk ?? ESIK_MUTLAK_MIN;
const esikMax = (k: AdimKisitlari): number => k.esikMaxDk ?? ESIK_GUVENLIK_TAVANI;

/** Yeni bir ek hatırlatma adımı — nazik, varsayılan ses, acil değil. */
export function ekAdim(esikDk: number, siklik: Siklik = 'birkez', kanallar: UyariKanallari = { bildirim: true }): SeviyeAyari {
    return {
        kademe: 'nazik',
        kanallar,
        esikDk,
        siklik,
        bildirimSesi: VARSAYILAN_SES,
        acilKanal: false,
        anonsMetni: '',
    };
}

/** Kanal kümesinin yalnız tanınan, AÇIK alanları. */
const kanalAlanlari = (ham: Record<string, unknown>): UyariKanallari => {
    const k: UyariKanallari = {};
    if (ham.bildirim === true) k.bildirim = true;
    if (ham.sesli === true) k.sesli = true;
    if (ham.titresim === true) k.titresim = true;
    if (ham.alarm === true) k.alarm = true;
    return k;
};

/**
 * Kanal kümesi. Hiçbir kanal açık değilse adım KAPALIDIR ("Kapalı" çipi). Yalnız
 * titreşim/alarm açıkken bildirim de açılır: titreşim tek başına sessiz bir uyarıdır,
 * alarmın tekrarları da bildirimle gelir — ikisi de bildirimsiz kalırsa adım fiilen
 * konuşmazdı. Bozuk (nesne olmayan) kayıt bildirime düşer.
 */
export const kanallarNormalize = (ham: unknown): UyariKanallari => {
    if (!nesneMi(ham)) return { bildirim: true };
    const k = kanalAlanlari(ham);
    const acikVar = k.bildirim || k.sesli || k.titresim || k.alarm;
    if (acikVar && !k.bildirim && !k.sesli) k.bildirim = true;
    return k;
};

/** Kapalı adımın kanal hafızası (`seviyeAcKapa`); boş/bozuksa yok sayılır. */
const oncekiKanallarNormalize = (ham: unknown): UyariKanallari | undefined => {
    if (!nesneMi(ham)) return undefined;
    const k = kanallarNormalize(ham);
    return k.bildirim || k.sesli ? k : undefined;
};

export const siklikNormalize = (ham: unknown, k: Pick<AdimKisitlari, 'tekrarMinDk' | 'tekrarMaxDk'>): Siklik => {
    if (nesneMi(ham) && typeof ham.herDk === 'number' && Number.isFinite(ham.herDk)) {
        return { herDk: sayiKenetle(ham.herDk, k.tekrarMinDk, k.tekrarMaxDk, k.tekrarMinDk) };
    }
    return 'birkez';
};

/**
 * Tek bir adımı yüzey kısıtlarına çeker; çözülemezse `null`. Ton/aciliyet/anons
 * metni ZORLANIR; kullanıcının seçtikleri (kanallar, bildirim sesi + adı, kapalı
 * adımın kanal hafızası, alarm kapsamı) KORUNUR.
 */
export function adimNormalize(ham: unknown, k: AdimKisitlari): SeviyeAyari | null {
    if (!nesneMi(ham) || typeof ham.esikDk !== 'number' || !Number.isFinite(ham.esikDk)) return null;
    const kanallar = kanallarNormalize(ham.kanallar);
    const adim = ekAdim(
        sayiKenetle(ham.esikDk, esikMin(k), esikMax(k), esikMin(k)),
        siklikNormalize(ham.siklik, k),
        kanallar
    );
    if (typeof ham.bildirimSesi === 'string' && ham.bildirimSesi.length > 0) {
        adim.bildirimSesi = ham.bildirimSesi;
        if (typeof ham.sesAdi === 'string' && ham.sesAdi.length > 0) adim.sesAdi = ham.sesAdi;
    }
    // Hafıza YALNIZ kapalı adımda anlamlıdır ("oncekiKanallar var ⟺ adım kapalı").
    const kapali = !(kanallar.bildirim || kanallar.sesli || kanallar.titresim || kanallar.alarm);
    const hafiza = kapali ? oncekiKanallarNormalize(ham.oncekiKanallar) : undefined;
    if (hafiza) adim.oncekiKanallar = hafiza;
    // Alarm kapsamı (#74): yalnız "Her uyarıda" yazılır; yokluğu "yalnız ilk" demektir.
    if (ham.alarmKapsami === 'hepsi') adim.alarmKapsami = 'hepsi';
    return adim;
}

/**
 * Adım dizisini normalize eder: kronolojik sıra, tekil eşik, en fazla `maksAdim`,
 * en az 1 (boşsa `yedekEsikDk` ile tek adım).
 */
export function adimlariNormalize(ham: unknown, yon: PencereYonu, yedekEsikDk: number, k: AdimKisitlari): SeviyeAyari[] {
    const adimlar = Array.isArray(ham)
        ? ham.map((a) => adimNormalize(a, k)).filter((a): a is SeviyeAyari => a !== null)
        : [];
    const tekil: SeviyeAyari[] = [];
    for (const a of kronolojikSirala(adimlar, yon)) {
        if (!tekil.some((t) => t.esikDk === a.esikDk)) tekil.push(a);
    }
    const sonuc = tekil.slice(0, k.maksAdim);
    return sonuc.length > 0 ? sonuc : [ekAdim(yedekEsikDk)];
}

/** Bir adım daha eklenebilir mi? */
export const adimEklenebilirMi = (ayar: AdimliAyar, k: Pick<AdimKisitlari, 'maksAdim'>): boolean =>
    ayar.adimlar.length < k.maksAdim;

/**
 * Yeni adımın eşiği. `esikAdimDk` yoksa muhafızla aynı yer kuralı (`yeniAdimEsigi`
 * — en erken adımın 15 dk öncesi, pencereye sığdırılır). Varsa en erken adımdan bir
 * adım ÖNCE, `esikAdimDk` katlarında ve `[esikMin, esikMax]` içinde en yakın boş değer.
 */
export function yeniEkAdimEsigi(
    adimlar: readonly SeviyeAyari[],
    yon: PencereYonu,
    k: AdimKisitlari,
    pencereUzunluguDk?: number
): number | null {
    if (k.esikAdimDk === undefined) return yeniAdimEsigi(adimlar, yon, pencereUzunluguDk);
    const adim = k.esikAdimDk;
    const min = esikMin(k);
    const max = esikMax(k);
    const dolu = new Set(adimlar.map((a) => a.esikDk));
    const giris = yon === 'girisindenItibaren';
    const ilk = kronolojikSirala(adimlar, yon)[0];
    const hedef = ilk ? (giris ? ilk.esikDk - adim : ilk.esikDk + adim) : min;
    const kirpilmis = Math.min(max, Math.max(min, hedef));
    const erken = giris ? -1 : 1;
    for (let fark = 0; fark * adim <= max - min; fark++) {
        for (const aday of [kirpilmis + erken * fark * adim, kirpilmis - erken * fark * adim]) {
            if (aday >= min && aday <= max && !dolu.has(aday)) return aday;
        }
    }
    return null;
}

/** Yeni adım ekler (tek atış, yalnız bildirim). Eklenemiyorsa AYNI referans döner. */
export function adimEkle<T extends AdimliAyar>(
    ayar: T,
    yon: PencereYonu,
    k: AdimKisitlari,
    pencereUzunluguDk?: number
): T {
    if (!adimEklenebilirMi(ayar, k)) return ayar;
    const esik = yeniEkAdimEsigi(ayar.adimlar, yon, k, pencereUzunluguDk);
    if (esik === null) return ayar;
    return { ...ayar, adimlar: kronolojikSirala([...ayar.adimlar, ekAdim(esik)], yon) };
}

/** Adımı siler — son adım silinmez (kartın anahtarı kapatır). AYNI referans döner. */
export function adimSil<T extends AdimliAyar>(ayar: T, indeks: number): T {
    if (ayar.adimlar.length <= 1 || indeks < 0 || indeks >= ayar.adimlar.length) return ayar;
    return { ...ayar, adimlar: ayar.adimlar.filter((_, i) => i !== indeks) };
}

/**
 * Adımı günceller ve diziyi KRONOLOJİK tutar. Kısıtlar burada da zorlanır: ortak
 * modal bir adımı muhafız alanlarıyla döndürse bile diske kısıt dışı bir şey yazılmaz.
 */
export function adimGuncelle<T extends AdimliAyar>(
    ayar: T,
    indeks: number,
    yeni: SeviyeAyari,
    yon: PencereYonu,
    k: AdimKisitlari
): T {
    if (indeks < 0 || indeks >= ayar.adimlar.length) return ayar;
    const temiz = adimNormalize(yeni, k);
    if (!temiz) return ayar;
    const adimlar = ayar.adimlar.map((a, i) => (i === indeks ? temiz : a));
    return { ...ayar, adimlar: adimlariNormalize(adimlar, yon, temiz.esikDk, k) };
}

/** Adımların kullandığı BENZERSİZ özel ses URI'leri (yalnız açık ayarlar). */
export function adimOzelSesleri(ayarlar: readonly AdimliAyar[]): string[] {
    const sesler = new Set<string>();
    for (const n of ayarlar) {
        if (!n.aktif) continue;
        for (const s of n.adimlar) {
            if (s && ozelSesMi(s.bildirimSesi)) sesler.add(s.bildirimSesi);
        }
    }
    return [...sesler];
}

/**
 * ÇÖZÜLEMEYEN özel sesleri varsayılana düşürür (muhafızın `cozulemeyenSesleriDusur`
 * ikizi). Değişiklik yoksa AYNI referans döner.
 */
export function adimCozulemeyenSesleriDusur<T extends AdimliAyar>(ayar: T, cozulemeyen: ReadonlySet<string>): T {
    if (cozulemeyen.size === 0) return ayar;
    if (!ayar.adimlar.some((s) => s && cozulemeyen.has(s.bildirimSesi))) return ayar;
    return {
        ...ayar,
        adimlar: ayar.adimlar.map((s) =>
            s && cozulemeyen.has(s.bildirimSesi) ? { ...s, bildirimSesi: VARSAYILAN_SES, sesAdi: undefined } : s
        ),
    };
}

/** GERÇEK ALARM kanalı sesleri (muhafız alarm kanal çöp toplaması bunları KORUR). */
export function adimAlarmSesleri(ayarlar: readonly AdimliAyar[]): string[] {
    const sesler = new Set<string>();
    for (const n of ayarlar) {
        if (!n.aktif) continue;
        for (const s of n.adimlar) {
            if (s.kanallar?.alarm === true) sesler.add(s.bildirimSesi ?? VARSAYILAN_SES);
        }
    }
    return [...sesler];
}

/**
 * Bildirim KANALI ihtiyacı (ortak muhafız kanal uzayı): yalnız açık ayarlar.
 * `MuhafizKanalServisi` hem oluştururken hem çöp toplarken bunu okur.
 */
export function adimKanalAyarlari(ayarlar: readonly (AdimliAyar & { yon?: PencereYonu })[]): VakitMuhafizAyari[] {
    return ayarlar
        .filter((a) => a.aktif)
        .map((a) => ({ yon: a.yon ?? 'cikisaDogru', seviyeler: a.adimlar }));
}

/** Bir ayarın YAPISAL yükü: adım sayısı, sesli adım, tekrarlı adım, tekrar yoğunluğu, alarm. */
interface YapisalYuk {
    adim: number;
    sesli: number;
    alarm: number;
    tekrarli: number;
    /** Σ 1/herDk — aralık kısalınca artar. */
    yogunluk: number;
}

const yapisalYuk = (a: AdimliAyar): YapisalYuk => {
    const y: YapisalYuk = { adim: 0, sesli: 0, alarm: 0, tekrarli: 0, yogunluk: 0 };
    if (!a.aktif) return y;
    for (const s of a.adimlar) {
        const kapali = !(s.kanallar?.bildirim || s.kanallar?.sesli || s.kanallar?.titresim || s.kanallar?.alarm);
        if (kapali) continue;
        y.adim++;
        if (s.kanallar?.sesli === true) y.sesli++;
        if (s.kanallar?.alarm === true && s.alarmKapsami === 'hepsi') y.alarm++;
        if (s.siklik !== 'birkez') {
            y.tekrarli++;
            y.yogunluk += 1 / Math.max(1, s.siklik.herDk);
        }
    }
    return y;
};

/**
 * Değişiklik bekleyen hatırlatma SAYISINI YAPISAL olarak artırıyor mu? (bildirim sınırı
 * rehberinin ekleme-anı simülasyon kapısı — issue #298; nafilenin `nafileYukuArtiyorMu`
 * genellemesi). Yalnız açma, adım ekleme/açma, sesli kanal, "her uyarıda" alarm,
 * tekrara geçme ya da aralığı kısaltma kapıdan geçer. Salt ZAMAN değişimi (eşik) GEÇMEZ:
 * aşımdaki kullanıcı var olan hatırlatmasının saatini değiştirebilmeli (Fable M4).
 */
export function adimYukuArtiyorMu(eski: AdimliAyar, yeni: AdimliAyar): boolean {
    if (!eski.aktif && yeni.aktif) return true;
    const e = yapisalYuk(eski);
    const y = yapisalYuk(yeni);
    if (y.adim > e.adim || y.sesli > e.sesli || y.tekrarli > e.tekrarli || y.alarm > e.alarm) return true;
    return y.yogunluk > e.yogunluk + 1e-9;
}
