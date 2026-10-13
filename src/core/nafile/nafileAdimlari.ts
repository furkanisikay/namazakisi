/**
 * Nafile hatırlatma ADIMLARI (issue #273) — SAF: göç, normalize, ekle/sil, yön.
 *
 * Nafile artık muhafızın bir vaktiyle aynı şekli taşır (`{ yon, adimlar }`),
 * ama üç kısıtla: en fazla `NAFILE_MAKS_ADIM` adım, ton YOK (her adım 'nazik',
 * `acilKanal: false` — acil kanal DND'yi deler, gönüllü ibadete uygun değil),
 * ses seçimi YOK (`bildirimSesi` daima varsayılan). Bu üç kısıt NORMALİZE ile
 * zorlanır: diskten ya da yedekten ne gelirse gelsin motor aynı şeyi görür.
 *
 * GÖÇ (eski tek-ofsetli kayıt → tek adım) şekle bakar, bayrağa DEĞİL:
 * `adimlar` dizisi varsa kayıt yenidir; yoksa eski alanlardan (`ofsetDk`,
 * `hedef`/`imsaktanOnceDk`/`uyandirma`) kurulur. Saf ve deterministik olduğu
 * için İDEMPOTENTTİR (göçmüş kayıt tekrar göçmez, aynısı çıkar).
 */
import type { SeviyeAyari, Siklik, UyariKanallari } from '../muhafiz/matrisTipleri';
import { VARSAYILAN_SES } from '../muhafiz/matrisTipleri';
import type { PencereYonu } from '../muhafiz/pencereTipleri';
import { kronolojikSirala } from '../muhafiz/aktifSeviye';
import { ESIK_GUVENLIK_TAVANI, ESIK_MUTLAK_MIN } from '../muhafiz/esikSinirlari';
import { yeniAdimEsigi } from '../muhafiz/adimDuzenleme';
import {
    NAFILE_MAKS_ADIM,
    NAFILE_OFSET_MAX_DK,
    NAFILE_OFSET_MIN_DK,
    NAFILE_TEKRAR_MAX_DK,
    NAFILE_TEKRAR_MIN_DK,
    TEHECCUD_IMSAK_ONCESI_MAX_DK,
    TEHECCUD_IMSAK_ONCESI_MIN_DK,
    type NafileHatirlatmaAyari,
    type TeheccudAyari,
    type TeheccudPenceresi,
} from './nafileTipleri';

const nesneMi = (d: unknown): d is Record<string, unknown> =>
    !!d && typeof d === 'object' && !Array.isArray(d);

const sayiKenetle = (deger: unknown, min: number, max: number, varsayilan: number): number => {
    if (typeof deger !== 'number' || !Number.isFinite(deger)) return varsayilan;
    return Math.min(max, Math.max(min, Math.round(deger)));
};

const yonNormalize = (ham: unknown, varsayilan: PencereYonu): PencereYonu =>
    ham === 'cikisaDogru' || ham === 'girisindenItibaren' ? ham : varsayilan;

/** Yeni bir nafile adımı — yalnız bildirim, tek atış. */
export function nafileAdimi(esikDk: number, siklik: Siklik = 'birkez', kanallar: UyariKanallari = { bildirim: true }): SeviyeAyari {
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

const kanallarNormalize = (ham: unknown): UyariKanallari => {
    if (!nesneMi(ham)) return { bildirim: true };
    const k: UyariKanallari = {};
    if (ham.bildirim === true) k.bildirim = true;
    if (ham.sesli === true) k.sesli = true;
    if (ham.titresim === true) k.titresim = true;
    // Nafilede "kapalı adım" yoktur (kartın kendi anahtarı ve "Sil" var):
    // bildirim de sesli de yoksa adım bildirime düşer, yoksa hiç konuşmazdı.
    if (!k.bildirim && !k.sesli) k.bildirim = true;
    return k;
};

const siklikNormalize = (ham: unknown): Siklik => {
    if (nesneMi(ham) && typeof ham.herDk === 'number' && Number.isFinite(ham.herDk)) {
        return { herDk: sayiKenetle(ham.herDk, NAFILE_TEKRAR_MIN_DK, NAFILE_TEKRAR_MAX_DK, NAFILE_TEKRAR_MIN_DK) };
    }
    return 'birkez';
};

/** Tek bir adımı nafile kısıtlarına çeker; çözülemezse `null`. */
const adimNormalize = (ham: unknown): SeviyeAyari | null => {
    if (!nesneMi(ham) || typeof ham.esikDk !== 'number' || !Number.isFinite(ham.esikDk)) return null;
    return nafileAdimi(
        sayiKenetle(ham.esikDk, ESIK_MUTLAK_MIN, ESIK_GUVENLIK_TAVANI, ESIK_MUTLAK_MIN),
        siklikNormalize(ham.siklik),
        kanallarNormalize(ham.kanallar)
    );
};

/**
 * Adım dizisini normalize eder: kronolojik sıra, tekil eşik, en fazla 3,
 * en az 1 (boşsa `yedekEsikDk` ile tek adım).
 */
export function adimlariNormalize(ham: unknown, yon: PencereYonu, yedekEsikDk: number): SeviyeAyari[] {
    const adimlar = Array.isArray(ham)
        ? ham.map(adimNormalize).filter((a): a is SeviyeAyari => a !== null)
        : [];
    const tekil: SeviyeAyari[] = [];
    for (const a of kronolojikSirala(adimlar, yon)) {
        if (!tekil.some((t) => t.esikDk === a.esikDk)) tekil.push(a);
    }
    const sonuc = tekil.slice(0, NAFILE_MAKS_ADIM);
    return sonuc.length > 0 ? sonuc : [nafileAdimi(yedekEsikDk)];
}

/**
 * Gündüz nafilesi (kuşluk / evvâbîn). Eski kayıt (`ofsetDk`) → giriş yönlü
 * tek adım (`esikDk = ofsetDk`, tek atış, yalnız bildirim): motor zamanı
 * `pencere başı + ofset` olarak üretir — eski planla BİREBİR (nöbetçi test).
 */
export function gunduzNafileNormalize(ham: unknown, varsayilan: NafileHatirlatmaAyari): NafileHatirlatmaAyari {
    if (!nesneMi(ham)) return { ...varsayilan, adimlar: varsayilan.adimlar.map((a) => ({ ...a })) };
    const aktif = ham.aktif === true;
    if (!Array.isArray(ham.adimlar) && 'ofsetDk' in ham) {
        const ofset = sayiKenetle(ham.ofsetDk, NAFILE_OFSET_MIN_DK, NAFILE_OFSET_MAX_DK, varsayilan.adimlar[0].esikDk);
        return { aktif, yon: 'girisindenItibaren', adimlar: [nafileAdimi(ofset)] };
    }
    const yon = yonNormalize(ham.yon, varsayilan.yon);
    return { aktif, yon, adimlar: adimlariNormalize(ham.adimlar, yon, varsayilan.adimlar[0].esikDk) };
}

/** Eski uyandırmanın "3 dk sonra bir kez daha" hatırlatması — göçte ikinci adım olur. */
export const ESKI_UYANDIRMA_TEKRAR_DK = 3;

/**
 * Teheccüd. Eski kayıt (`hedef`) şöyle göçer:
 * - `sonUcteBir` → pencere son üçte bir, giriş yönü, eşik 1 dk (motorun alt
 *   sınırı `olcuDk >= 1`; eski hatırlatma TAM son üçte bir anındaydı → yeni
 *   plan en fazla 1 dk sonradır, metin birebir aynı).
 * - `imsaktanOnce` → pencere yatsıdan, ÇIKIŞ yönü, eşik = eski dakika
 *   (zaman `imsak − N`: birebir).
 * - `uyandirma` açıksa eski "3 dk sonra ikinci hatırlatma" ayrı bir adım olur
 *   (göçten sonra kullanıcı onu silebilir; uyandırma artık yalnız KANALI belirler).
 */
export function teheccudNormalize(ham: unknown, varsayilan: TeheccudAyari): TeheccudAyari {
    if (!nesneMi(ham)) return { ...varsayilan, adimlar: varsayilan.adimlar.map((a) => ({ ...a })) };
    const aktif = ham.aktif === true;
    const uyandirma = ham.uyandirma === true;

    if (!Array.isArray(ham.adimlar) && ('hedef' in ham || 'imsaktanOnceDk' in ham)) {
        if (ham.hedef === 'imsaktanOnce') {
            const dk = sayiKenetle(ham.imsaktanOnceDk, TEHECCUD_IMSAK_ONCESI_MIN_DK, TEHECCUD_IMSAK_ONCESI_MAX_DK, 60);
            const adimlar = [nafileAdimi(dk)];
            if (uyandirma && dk - ESKI_UYANDIRMA_TEKRAR_DK >= ESIK_MUTLAK_MIN) {
                adimlar.push(nafileAdimi(dk - ESKI_UYANDIRMA_TEKRAR_DK));
            }
            return { aktif, yon: 'cikisaDogru', adimlar, pencere: 'yatsi', uyandirma };
        }
        const adimlar = [nafileAdimi(ESIK_MUTLAK_MIN)];
        if (uyandirma) adimlar.push(nafileAdimi(ESIK_MUTLAK_MIN + ESKI_UYANDIRMA_TEKRAR_DK));
        return { aktif, yon: 'girisindenItibaren', adimlar, pencere: 'sonUcteBir', uyandirma };
    }

    const yon = yonNormalize(ham.yon, varsayilan.yon);
    const pencere: TeheccudPenceresi = ham.pencere === 'yatsi' ? 'yatsi' : 'sonUcteBir';
    return {
        aktif,
        yon,
        adimlar: adimlariNormalize(ham.adimlar, yon, varsayilan.adimlar[0].esikDk),
        pencere,
        uyandirma,
    };
}

/** Bir adım daha eklenebilir mi? */
export const nafileAdimEklenebilirMi = (ayar: NafileHatirlatmaAyari): boolean =>
    ayar.adimlar.length < NAFILE_MAKS_ADIM;

/**
 * Yeni adım: muhafızla aynı yer kuralı (`yeniAdimEsigi` — en erken adımın
 * 15 dk öncesi, pencereye sığdırılır), tek atış, yalnız bildirim.
 * Eklenemiyorsa AYNI referans döner.
 */
export function nafileAdimEkle<T extends NafileHatirlatmaAyari>(ayar: T, pencereUzunluguDk?: number): T {
    if (!nafileAdimEklenebilirMi(ayar)) return ayar;
    const esik = yeniAdimEsigi(ayar.adimlar, ayar.yon, pencereUzunluguDk);
    if (esik === null) return ayar;
    return { ...ayar, adimlar: kronolojikSirala([...ayar.adimlar, nafileAdimi(esik)], ayar.yon) };
}

/** Adımı siler — son adım silinmez (kartın anahtarı kapatır). AYNI referans döner. */
export function nafileAdimSil<T extends NafileHatirlatmaAyari>(ayar: T, indeks: number): T {
    if (ayar.adimlar.length <= 1 || indeks < 0 || indeks >= ayar.adimlar.length) return ayar;
    return { ...ayar, adimlar: ayar.adimlar.filter((_, i) => i !== indeks) };
}

/**
 * Adımı günceller ve diziyi KRONOLOJİK tutar (eşik değişince sıra değişebilir).
 * Nafile kısıtları (ton/ses/aciliyet) burada da zorlanır: ortak modal bir adımı
 * muhafız alanlarıyla döndürse bile diske nafile dışı bir şey yazılmaz.
 */
export function nafileAdimGuncelle<T extends NafileHatirlatmaAyari>(ayar: T, indeks: number, yeni: SeviyeAyari): T {
    if (indeks < 0 || indeks >= ayar.adimlar.length) return ayar;
    const temiz = adimNormalize(yeni);
    if (!temiz) return ayar;
    const adimlar = ayar.adimlar.map((a, i) => (i === indeks ? temiz : a));
    return { ...ayar, adimlar: adimlariNormalize(adimlar, ayar.yon, temiz.esikDk) };
}

/**
 * Yön değişimi: eşik DEĞERLERİ korunur ("5 dk" girişte "girişten 5 dk sonra",
 * çıkışta "çıkmasına 5 dk kala" olur — prototip davranışı), dizi yeni yöne göre
 * KRONOLOJİK yeniden sıralanır. Zaman şeridi farkı hemen gösterir. Aynı yönse
 * AYNI referans döner.
 */
export function nafileYonunuDegistir<T extends NafileHatirlatmaAyari>(ayar: T, yon: PencereYonu): T {
    if (ayar.yon === yon) return ayar;
    return { ...ayar, yon, adimlar: kronolojikSirala(ayar.adimlar, yon) };
}
