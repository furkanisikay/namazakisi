/**
 * Cihazlar arası OLAY GÜNLÜĞÜ (karar belgesi `docs/superpowers/specs/2026-10-21-cihazlar-arasi-olay-esitleme.md` §3).
 *
 * Her cihaz yalnız-ekleme bir günlük tutar; olay kimliği `<cihaz>:<seq>`, `seq` cihaz başına
 * KESİN ARTAN. Alıcı olayları kimliğe göre BİRLEŞTİRİR (idempotent): aynı olay iki kez gelse,
 * başka bir cihaz üzerinden dolaşıp gelse (dedikodu) ya da bulut zarfıyla da gelse zararsızdır.
 *
 * Türler ve uygulama (alıcıda, hedefler ENJEKTE edilir — bu modül depolamaya dokunmaz):
 * - `kildim` → ortak "Kıldım" kuyruğu (`kaynak: 'cihaz'`). Birleşim (union): geri alma YOK
 *   (tombstone yok; belgelenmiş bedel — bir cihazda geri alınan namaz diğerinde kılınmış kalır).
 * - `kazaHareket` → Kaza Defteri 2.0 G-Set'i (`hareketleriEkle`); öğe AYNEN taşınır.
 * - `ayar` → son yazan kazanır, sıra HLC ile (duvar saati kayması sırayı bozmasın).
 * ("ertele" türü YOK: muhafız ertelemesi kaldırıldı.)
 *
 * Teslim = EKSİK ARALIK: alıcı "bildiğim en büyük ardışık seq"i (cihaz başına) söyler, gönderen
 * yalnız onun üstünü yollar. Bayt bütçesi kesmesi daima cihaz başına seq sırasıyla yapılır →
 * alıcıdaki "ardışık en büyük" asla delik içermez.
 *
 * Tel biçimi DÜZDÜR (`{id, tur, tarih, vakit, …}`): TV (`cekirdek/CihazYuku.kt`) yalnız
 * `tur == "kildim"` + `tarih` + `vakit` okur, tanımadığı türü ve alanı atlar → TV'ye olay
 * gönderilse de bozulmaz. Saf modül (React Native / expo import ETMEZ).
 */
import type { VakitAdi } from '../types';
import { hlcAl, hlcCoz, hlcIlerlet, hlcKarsilastir, hlcYaz, type Hlc } from './hlc';

export const OLAY_GUNLUGU_SURUMU = 1;
/** Günlükte tutulan en fazla olay (eskiler düşer; etkileri zaten kayıtlara yazılmıştır). */
export const GUNLUK_AZAMI_OLAY = 500;
/** Tek olayın tel biçimindeki azami boyutu (kaza hareketi en büyüğüdür). */
export const OLAY_AZAMI_BAYT = 700;
/** Bir teslim paketindeki olayların toplam bütçesi (alıcı gövdesi ≤ 8 KB; zarf + durum payı). */
export const OLAY_PAKETI_AZAMI_BAYT = 6000;

const CIHAZ = /^[0-9a-f]{16}$/;
const TARIH = /^\d{4}-\d{2}-\d{2}$/;
const AYAR_ANAHTARI = /^[A-Za-z0-9_]{2,48}$/;
const VAKITLER: readonly VakitAdi[] = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];

interface OlayOrtak {
    /** `<cihaz>:<seq>` */
    id: string;
    cihaz: string;
    seq: number;
    hlc: string;
}

export interface KildimOlayi extends OlayOrtak {
    tur: 'kildim';
    /** Namaz günü (YYYY-MM-DD). */
    tarih: string;
    vakit: VakitAdi;
}

export interface KazaHareketOlayi extends OlayOrtak {
    tur: 'kazaHareket';
    /** Kaza Defteri hareketi AYNEN (kimliği kendi içinde; G-Set tekilleştirir). */
    hareket: Record<string, unknown>;
}

export interface AyarOlayi extends OlayOrtak {
    tur: 'ayar';
    anahtar: string;
    deger: unknown;
}

export type GunlukOlayi = KildimOlayi | KazaHareketOlayi | AyarOlayi;

export type OlayTaslagi =
    | { tur: 'kildim'; tarih: string; vakit: VakitAdi }
    | { tur: 'kazaHareket'; hareket: Record<string, unknown> }
    | { tur: 'ayar'; anahtar: string; deger: unknown };

export interface OlayGunlugu {
    surum: number;
    /** Bu cihazın kimliği (16 hex). */
    cihaz: string;
    /** Bu cihazın son verdiği seq. */
    seq: number;
    /** Yerel HLC (dize). */
    hlc: string;
    /** Kendi + alınan olaylar (seq sırasıyla, en fazla `GUNLUK_AZAMI_OLAY`). */
    olaylar: GunlukOlayi[];
    /** Cihaz başına ardışık en büyük seq (alıcının "bildiğim"i; teslimde karşıya söylenir). */
    bilinen: Record<string, number>;
    /** Ayar anahtarı başına uygulanan son HLC (LWW). */
    ayarHlc: Record<string, string>;
}

const bayt = (s: string): number => {
    let n = 0;
    for (const c of s) {
        const k = c.codePointAt(0) ?? 0;
        n += k < 0x80 ? 1 : k < 0x800 ? 2 : k < 0x10000 ? 3 : 4;
    }
    return n;
};

const nesneMi = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);

export function bosGunluk(cihaz: string): OlayGunlugu {
    if (!CIHAZ.test(cihaz)) throw new Error('cihaz kimliği 16 hex olmalı');
    return { surum: OLAY_GUNLUGU_SURUMU, cihaz, seq: 0, hlc: hlcYaz({ ms: 0, sayac: 0, cihaz }), olaylar: [], bilinen: {}, ayarHlc: {} };
}

/** Diskten gelen günlüğü güvenle okur; bozuksa ya da başka cihazınsa `null` (çağıran yenisini kurar). */
export function gunlukNormalize(ham: unknown, cihaz: string): OlayGunlugu | null {
    if (!nesneMi(ham) || ham.cihaz !== cihaz || typeof ham.seq !== 'number' || !Number.isInteger(ham.seq) || ham.seq < 0) return null;
    const hlc = hlcCoz(ham.hlc);
    if (!hlc) return null;
    const olaylar = Array.isArray(ham.olaylar) ? ham.olaylar.map(olayNormalize).filter((o): o is GunlukOlayi => !!o) : [];
    const bilinen: Record<string, number> = {};
    if (nesneMi(ham.bilinen)) {
        for (const [c, s] of Object.entries(ham.bilinen)) if (CIHAZ.test(c) && Number.isInteger(s) && (s as number) >= 0) bilinen[c] = s as number;
    }
    const ayarHlc: Record<string, string> = {};
    if (nesneMi(ham.ayarHlc)) {
        for (const [a, h] of Object.entries(ham.ayarHlc)) if (AYAR_ANAHTARI.test(a) && hlcCoz(h)) ayarHlc[a] = h as string;
    }
    // Kendi seq'imiz geri gidemez: günlükte daha büyüğü varsa onu esas al (kısmi yazım koruması).
    const kendiEnBuyuk = olaylar.filter((o) => o.cihaz === cihaz).reduce((m, o) => Math.max(m, o.seq), 0);
    const seq = Math.max(ham.seq, kendiEnBuyuk);
    return { surum: OLAY_GUNLUGU_SURUMU, cihaz, seq, hlc: hlcYaz(hlc), olaylar, bilinen: { ...bilinen, [cihaz]: seq }, ayarHlc };
}

/** Tek olayı doğrular (kurcalanmış/yabancı veri `null`). */
export function olayNormalize(ham: unknown): GunlukOlayi | null {
    if (!nesneMi(ham)) return null;
    const { cihaz, seq, id } = ham;
    if (typeof cihaz !== 'string' || !CIHAZ.test(cihaz)) return null;
    if (typeof seq !== 'number' || !Number.isInteger(seq) || seq < 1) return null;
    if (id !== `${cihaz}:${seq}`) return null;
    const hlc = hlcCoz(ham.hlc);
    if (!hlc || hlc.cihaz !== cihaz) return null;
    const ortak = { id, cihaz, seq, hlc: hlcYaz(hlc) };
    let olay: GunlukOlayi | null = null;
    if (ham.tur === 'kildim') {
        if (typeof ham.tarih === 'string' && TARIH.test(ham.tarih) && VAKITLER.includes(ham.vakit as VakitAdi)) {
            olay = { ...ortak, tur: 'kildim', tarih: ham.tarih, vakit: ham.vakit as VakitAdi };
        }
    } else if (ham.tur === 'kazaHareket') {
        if (nesneMi(ham.hareket) && typeof ham.hareket.id === 'string') olay = { ...ortak, tur: 'kazaHareket', hareket: ham.hareket };
    } else if (ham.tur === 'ayar') {
        if (typeof ham.anahtar === 'string' && AYAR_ANAHTARI.test(ham.anahtar) && ham.deger !== undefined) {
            olay = { ...ortak, tur: 'ayar', anahtar: ham.anahtar, deger: ham.deger };
        }
    }
    if (!olay) return null;
    return bayt(JSON.stringify(olay)) <= OLAY_AZAMI_BAYT ? olay : null;
}

const sirala = (a: GunlukOlayi, b: GunlukOlayi): number => (a.cihaz === b.cihaz ? a.seq - b.seq : a.cihaz < b.cihaz ? -1 : 1);

/** Günlüğü tavanda tutar: en eski HLC'liler düşer (etkileri kayıtlarda kalır). */
const kirp = (olaylar: GunlukOlayi[]): GunlukOlayi[] => {
    if (olaylar.length <= GUNLUK_AZAMI_OLAY) return olaylar;
    const tutulan = new Set(
        [...olaylar]
            .sort((a, b) => hlcKarsilastir(b.hlc, a.hlc))
            .slice(0, GUNLUK_AZAMI_OLAY)
            .map((o) => o.id),
    );
    return olaylar.filter((o) => tutulan.has(o.id));
};

/** Bu cihazda yeni olay: seq + 1, HLC ilerler. Boyut tavanını aşan taslak `null` olay döner. */
export function olayOlustur(g: OlayGunlugu, taslak: OlayTaslagi, simdiMs: number): { gunluk: OlayGunlugu; olay: GunlukOlayi | null } {
    const hlc = hlcIlerlet(hlcCoz(g.hlc) as Hlc, simdiMs);
    const seq = g.seq + 1;
    const olay = olayNormalize({ ...taslak, id: `${g.cihaz}:${seq}`, cihaz: g.cihaz, seq, hlc: hlcYaz(hlc) });
    if (!olay) return { gunluk: g, olay: null };
    const ayarHlc = olay.tur === 'ayar' ? { ...g.ayarHlc, [olay.anahtar]: olay.hlc } : g.ayarHlc;
    return {
        gunluk: { ...g, seq, hlc: olay.hlc, olaylar: kirp([...g.olaylar, olay].sort(sirala)), bilinen: { ...g.bilinen, [g.cihaz]: seq }, ayarHlc },
        olay,
    };
}

/**
 * Karşı tarafın bilmediği olaylar (kendi + başka cihazlardan aldıklarımız), cihaz başına seq
 * sırasıyla ve bayt bütçesiyle. Bütçe dolunca DURUR (sonraki gruplara geçmez) → her cihazın
 * gönderilen kısmı ardışık kalır.
 */
export function gonderilecekler(g: OlayGunlugu, karsiBilinen: Record<string, number>, butce = OLAY_PAKETI_AZAMI_BAYT): GunlukOlayi[] {
    const sonuc: GunlukOlayi[] = [];
    let kalan = butce;
    for (const o of [...g.olaylar].sort(sirala)) {
        if (o.seq <= (karsiBilinen[o.cihaz] ?? 0)) continue;
        const b = bayt(JSON.stringify(o)) + 1;
        if (b > kalan) break;
        kalan -= b;
        sonuc.push(o);
    }
    return sonuc;
}

/**
 * Gelen olayları günlüğe alır; YALNIZ yeni olanları (uygulanacakları) döner. Kendi olaylarımız,
 * bildiğimiz aralıktakiler ve zaten günlükte olanlar atlanır. `bilinen` ardışık ilerler.
 */
export function gelenleriAl(g: OlayGunlugu, ham: readonly unknown[], simdiMs: number): { gunluk: OlayGunlugu; yeniler: GunlukOlayi[] } {
    const mevcut = new Set(g.olaylar.map((o) => o.id));
    const yeniler: GunlukOlayi[] = [];
    let hlc = hlcCoz(g.hlc) as Hlc;
    for (const h of ham.slice(0, 200)) {
        const o = olayNormalize(h);
        if (!o || o.cihaz === g.cihaz || o.seq <= (g.bilinen[o.cihaz] ?? 0) || mevcut.has(o.id)) continue;
        mevcut.add(o.id);
        yeniler.push(o);
        hlc = hlcAl(hlc, hlcCoz(o.hlc), simdiMs);
    }
    if (yeniler.length === 0) return { gunluk: g, yeniler };
    const olaylar = kirp([...g.olaylar, ...yeniler].sort(sirala));
    const bilinen = { ...g.bilinen };
    const seqler = new Map<string, Set<number>>();
    for (const o of [...g.olaylar, ...yeniler]) {
        if (!seqler.has(o.cihaz)) seqler.set(o.cihaz, new Set());
        seqler.get(o.cihaz)!.add(o.seq);
    }
    for (const c of new Set(yeniler.map((o) => o.cihaz))) {
        let s = bilinen[c] ?? 0;
        const kume = seqler.get(c)!;
        while (kume.has(s + 1)) s += 1;
        bilinen[c] = s;
    }
    return { gunluk: { ...g, hlc: hlcYaz(hlc), olaylar, bilinen }, yeniler: yeniler.sort(sirala) };
}

/** LWW: gelen ayar ancak uygulanmış son HLC'den BÜYÜKSE yazılır. */
export const ayarKazanirMi = (mevcutHlc: string | undefined, gelenHlc: string): boolean => !mevcutHlc || hlcKarsilastir(gelenHlc, mevcutHlc) > 0;

export interface OlayHedefleri {
    /** Ortak Kıldım kuyruğuna (`kaynak: 'cihaz'`). İdempotent olmalı. */
    kildim(tarih: string, vakit: VakitAdi): Promise<void>;
    /** Kaza Defteri G-Set'ine (`hareketleriEkle`). */
    kazaHareketleri(hareketler: Record<string, unknown>[]): Promise<void>;
    /** Beyaz listede değilse hedef YOK SAYMALI (çekirdek anahtarı yalnız biçimce doğrular). */
    ayar(anahtar: string, deger: unknown): Promise<void>;
}

/**
 * Yeni olayları hedeflere uygular. Ayar için LWW kararı burada (aynı anahtarın paketteki en
 * büyük HLC'lisi yazılır); güncellenmiş `ayarHlc` döner. Bir hedef fırlatırsa diğerleri yine
 * denenir; hata çağırana raporlanır (`hatalar`).
 */
export async function olaylariUygula(
    yeniler: readonly GunlukOlayi[],
    hedef: OlayHedefleri,
    ayarHlc: Record<string, string>,
): Promise<{ ayarHlc: Record<string, string>; hatalar: number }> {
    let hatalar = 0;
    const dene = async (is: () => Promise<void>) => {
        try {
            await is();
        } catch {
            hatalar += 1;
        }
    };
    for (const o of yeniler) if (o.tur === 'kildim') await dene(() => hedef.kildim(o.tarih, o.vakit));
    const kaza = yeniler.filter((o): o is KazaHareketOlayi => o.tur === 'kazaHareket').map((o) => o.hareket);
    if (kaza.length > 0) await dene(() => hedef.kazaHareketleri(kaza));
    const yeniHlc = { ...ayarHlc };
    const ayarlar = new Map<string, AyarOlayi>();
    for (const o of yeniler) {
        if (o.tur !== 'ayar') continue;
        const onceki = ayarlar.get(o.anahtar);
        if (!onceki || hlcKarsilastir(o.hlc, onceki.hlc) > 0) ayarlar.set(o.anahtar, o);
    }
    for (const o of ayarlar.values()) {
        if (!ayarKazanirMi(yeniHlc[o.anahtar], o.hlc)) continue;
        let tamam = true;
        await dene(async () => {
            try {
                await hedef.ayar(o.anahtar, o.deger);
            } catch (e) {
                tamam = false;
                throw e;
            }
        });
        if (tamam) yeniHlc[o.anahtar] = o.hlc;
    }
    return { ayarHlc: yeniHlc, hatalar };
}

/** Bulut zarfı / yedek için: iki olay kümesinin kimliğe göre birleşimi (sıralı, tavanlı). */
export function olaylariBirlestir(a: readonly unknown[], b: readonly unknown[]): GunlukOlayi[] {
    const m = new Map<string, GunlukOlayi>();
    for (const h of [...a, ...b]) {
        const o = olayNormalize(h);
        if (o && !m.has(o.id)) m.set(o.id, o);
    }
    return kirp([...m.values()].sort(sirala));
}
