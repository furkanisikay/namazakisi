/**
 * MUHAFIZ PLAN PARMAK İZİ + "atla" kapısı (denetim 2026-10-21, D-02).
 *
 * 15 dk arka plan görevi her turda muhafızın TÜM planını silip yeniden kuruyordu: tur
 * başına onlarca `cancel` + `schedule` (Android'de her biri AlarmManager çağrısı + expo
 * bildirim deposunun tüm XML'inin yeniden yazımı), Doze'da günde 40–96 tur. Oysa plan,
 * girdileri değişmedikçe aynıdır — saat ilerledikçe yalnız geçmiş tetikler düşer.
 *
 * KAPI İHTİYATLIDIR; tur YALNIZ hepsi doğruysa atlanır:
 *   1. Önceki TAM kurulumun kaydı var, eksiksiz (her teslim sonucunu bildirdi, hata yok)
 *      ve alarm bütçesi dolmamıştı (kesilen uzak tetikler sonraki turda kurulmalı).
 *   2. Parmak izi aynı: sürüm, platform, aktif, ham matris, GÜNÜN vakit pencereleri
 *      (yuvarlanmış adhan saatleri — gün dönümünü, gece yarısı dalını ve konumu yakalar),
 *      kılınanlar, özel gün, saat iş bölümü, gece sessizliği, teslim bağlamı (camide,
 *      alarm izni). Matris doğrulaması (`hazirla`'nın ses çözümü) kapıya GİREMEZ —
 *      çağırmadan bilinemez ve `hazirla` yıkıcıdır → yaş tavanıyla telafi edilir.
 *   3. Kayıt `AZAMI_YAS_MS`'ten genç ve saat geri alınmamış.
 *   4. Cihazda kurulum SAĞLAM: kayıttaki gelecek bildirimlerin hepsi bekleyen listede,
 *      listede kayıtta olmayan muhafız kimliği YOK; sesli okuma ve gerçek alarm kayıt
 *      defterleri en az beklenen kadar öğe taşıyor (tek yönlü: toplam sayılar başka
 *      sahiplerin öğelerini de içerir — yalnız "silinmiş mi" sorusu sorulur).
 *
 * SAF: React/expo import etmez; zaman ve cihaz durumu parametredir.
 */
import { kararliOzet } from '../utils/kararliOzet';

export const MUHAFIZ_PLAN_KAYDI_SURUMU = 1;

/** Tam kurulum bu kadar eskiyse girdiler aynı olsa da yeniden kurulur (doğrulanamayan durum için). */
export const PLAN_KAYDI_AZAMI_YAS_MS = 6 * 60 * 60 * 1000;

/** Bu kadar yakın tetik "tam şimdi çalmış olabilir" sayılır; eksikliği kurulumu bozuk saymaz. */
export const PLAN_TETIK_PAYI_MS = 90 * 1000;

export interface ParmakIziVakti {
    vakit: string;
    tarih: string;
    giris: Date;
    cikis: Date;
    yarininImsagi?: true;
}

export interface MuhafizPlanParmakIziGirdisi {
    surum: string;
    platform: string;
    aktif: boolean;
    matris: unknown;
    vakitler: readonly ParmakIziVakti[];
    /** Tarih → kılınan vakitler (sıra önemsiz; kanonikleştirilir). */
    kilinanlar: Record<string, readonly string[]>;
    /** Plan içindeki vakit tarihleri için özel gün kapısının sonucu. */
    ozelGunler: Record<string, boolean>;
    saatAyarlari?: unknown;
    geceSessizligi?: unknown;
    /** Teslimcinin bildirdiği bağlam (camide bitişi, alarm izni…). */
    teslimBaglami: string;
}

/** Girdilerden kararlı parmak izi. ZAMAN girmez (vakit pencereleri gün değişince değişir). */
export function muhafizPlanParmakIzi(g: MuhafizPlanParmakIziGirdisi): string {
    const kilinanlar: Record<string, string[]> = {};
    for (const tarih of Object.keys(g.kilinanlar)) {
        const liste = [...new Set(g.kilinanlar[tarih] ?? [])].sort();
        if (liste.length > 0) kilinanlar[tarih] = liste;
    }
    return kararliOzet({
        s: MUHAFIZ_PLAN_KAYDI_SURUMU,
        surum: g.surum,
        platform: g.platform,
        aktif: g.aktif,
        matris: g.matris,
        vakitler: g.vakitler.map((v) => ({
            v: v.vakit,
            t: v.tarih,
            g: v.giris.getTime(),
            c: v.cikis.getTime(),
            y: v.yarininImsagi === true,
        })),
        kilinanlar,
        ozelGunler: g.ozelGunler,
        saat: g.saatAyarlari ?? null,
        gece: g.geceSessizligi ?? null,
        teslim: g.teslimBaglami,
    });
}

/** Bir teslim adayının cihazda neye dönüştüğü (kayıt için). */
export interface PlanKaydiOgesi {
    id: string;
    zamanMs: number;
    bildirim?: true;
    anons?: true;
    alarm?: true;
}

export interface MuhafizPlanKaydi {
    s: typeof MUHAFIZ_PLAN_KAYDI_SURUMU;
    parmakIzi: string;
    kurulumMs: number;
    /** Teslimci bir adayın sonucunu bildirmedi ya da teslim hata verdi → kayıt güvenilmez. */
    eksik: boolean;
    /** Alarm bütçesi doldu (uzak tetikler kesildi) → sonraki tur kurmalı. */
    butceDoldu: boolean;
    ogeler: PlanKaydiOgesi[];
    /** `hazirla`'nın döndürdüğü DOĞRULANMIŞ matris (atlanan turda saate aynı matris gider). */
    dogrulanmisMatris?: unknown;
}

/** Diskten gelen ham kaydı katı doğrular; şüpheli her şey `null` (= kur). */
export function muhafizPlanKaydiniCoz(ham: string | null | undefined): MuhafizPlanKaydi | null {
    if (!ham) return null;
    let k: unknown;
    try {
        k = JSON.parse(ham);
    } catch {
        return null;
    }
    const r = k as Partial<MuhafizPlanKaydi> | null;
    if (
        !r ||
        typeof r !== 'object' ||
        r.s !== MUHAFIZ_PLAN_KAYDI_SURUMU ||
        typeof r.parmakIzi !== 'string' ||
        typeof r.kurulumMs !== 'number' ||
        !Number.isFinite(r.kurulumMs) ||
        typeof r.eksik !== 'boolean' ||
        typeof r.butceDoldu !== 'boolean' ||
        !Array.isArray(r.ogeler)
    ) {
        return null;
    }
    for (const o of r.ogeler) {
        if (!o || typeof o.id !== 'string' || typeof o.zamanMs !== 'number' || !Number.isFinite(o.zamanMs)) return null;
    }
    return r as MuhafizPlanKaydi;
}

export type PlanAtlamaNedeni =
    | 'atla'
    | 'kayitYok'
    | 'eksikKayit'
    | 'butceDoldu'
    | 'girdiDegisti'
    | 'saatGeriAlindi'
    | 'yasAsti'
    | 'bildirimEksik'
    | 'yabanciKimlik'
    | 'anonsEksik'
    | 'alarmEksik';

export interface PlanAtlamaGirdisi {
    kayit: MuhafizPlanKaydi | null;
    parmakIzi: string;
    simdiMs: number;
    /** Bekleyen listedeki muhafız SAHİPLİ kimlikler (plan + eski `_ertele` artıkları). */
    kuruluKimlikler: readonly string[];
    /** Sesli okuma kayıt defterindeki TOPLAM öğe (null = okunamadı). */
    bekleyenAnonsSayisi: number | null;
    /** Gerçek alarm kayıt defterindeki TOPLAM öğe (null = okunamadı). */
    bekleyenAlarmSayisi: number | null;
    azamiYasMs?: number;
}

export interface PlanAtlamaKarari {
    atla: boolean;
    neden: PlanAtlamaNedeni;
}

const hayir = (neden: Exclude<PlanAtlamaNedeni, 'atla'>): PlanAtlamaKarari => ({ atla: false, neden });

export function muhafizPlaniAtlanabilirMi(g: PlanAtlamaGirdisi): PlanAtlamaKarari {
    const { kayit, simdiMs } = g;
    if (!kayit) return hayir('kayitYok');
    if (kayit.eksik) return hayir('eksikKayit');
    if (kayit.butceDoldu) return hayir('butceDoldu');
    if (kayit.parmakIzi !== g.parmakIzi) return hayir('girdiDegisti');
    if (simdiMs < kayit.kurulumMs) return hayir('saatGeriAlindi');
    if (simdiMs - kayit.kurulumMs >= (g.azamiYasMs ?? PLAN_KAYDI_AZAMI_YAS_MS)) return hayir('yasAsti');

    const esik = simdiMs + PLAN_TETIK_PAYI_MS;
    const kurulu = new Set(g.kuruluKimlikler);
    const kayitliBildirimler = new Set<string>();
    let beklenenAnons = 0;
    let beklenenAlarm = 0;
    for (const o of kayit.ogeler) {
        if (o.bildirim) kayitliBildirimler.add(o.id);
        if (o.zamanMs <= esik) continue;
        if (o.bildirim && !kurulu.has(o.id)) return hayir('bildirimEksik');
        if (o.anons) beklenenAnons++;
        if (o.alarm) beklenenAlarm++;
    }
    for (const id of kurulu) {
        if (!kayitliBildirimler.has(id)) return hayir('yabanciKimlik');
    }
    if (beklenenAnons > 0 && (g.bekleyenAnonsSayisi === null || g.bekleyenAnonsSayisi < beklenenAnons)) {
        return hayir('anonsEksik');
    }
    if (beklenenAlarm > 0 && (g.bekleyenAlarmSayisi === null || g.bekleyenAlarmSayisi < beklenenAlarm)) {
        return hayir('alarmEksik');
    }
    return { atla: true, neden: 'atla' };
}
