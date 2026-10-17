/**
 * Nafile hatırlatma ADIMLARI (issue #273) — SAF: göç, normalize, ekle/sil, yön.
 *
 * Nafile artık muhafızın bir vaktiyle aynı şekli taşır (`{ yon, adimlar }`)
 * ve aynı yetenekleri (kanallar + titreşim + GERÇEK ALARM, bildirim sesi, kapalı
 * adım) — iki kısıtla: en fazla `NAFILE_MAKS_ADIM` adım, ton YOK (her adım
 * 'nazik', `acilKanal: false` — acil kanal DND'yi deler, gönüllü ibadete uygun
 * değil). Kısıtlar NORMALİZE ile zorlanır: diskten ya da yedekten ne gelirse
 * gelsin motor aynı şeyi görür. Normalize kullanıcının seçtiği alanları
 * (alarm, ses, kanal hafızası) KORUMAK zorundadır — atarsa ekrandaki her
 * anahtar yeniden açılışta sessizce geri döner.
 *
 * GÖÇ (eski tek-ofsetli kayıt → tek adım) şekle bakar, bayrağa DEĞİL:
 * `adimlar` dizisi varsa kayıt yenidir; yoksa eski alanlardan (`ofsetDk`,
 * `hedef`/`imsaktanOnceDk`/`uyandirma`) kurulur. Saf ve deterministik olduğu
 * için İDEMPOTENTTİR (göçmüş kayıt tekrar göçmez, aynısı çıkar).
 */
import type { SeviyeAyari, Siklik, UyariKanallari, VakitMuhafizAyari } from '../muhafiz/matrisTipleri';
import type { PencereYonu } from '../muhafiz/pencereTipleri';
import { kronolojikSirala } from '../muhafiz/aktifSeviye';
import { ESIK_MUTLAK_MIN } from '../muhafiz/esikSinirlari';
import {
    adimAlarmSesleri,
    adimCozulemeyenSesleriDusur,
    adimEkle,
    adimEklenebilirMi,
    adimGuncelle,
    adimOzelSesleri,
    adimSil,
    adimlariNormalize as ortakAdimlariNormalize,
    ekAdim,
    sayiKenetle,
    type AdimKisitlari,
} from '../hatirlatma/adimDizisi';
import {
    NAFILE_MAKS_ADIM,
    NAFILE_OFSET_MAX_DK,
    NAFILE_OFSET_MIN_DK,
    NAFILE_TEKRAR_MAX_DK,
    NAFILE_TEKRAR_MIN_DK,
    TEHECCUD_IMSAK_ONCESI_MAX_DK,
    TEHECCUD_IMSAK_ONCESI_MIN_DK,
    type NafileAyarlari,
    type NafileHatirlatmaAyari,
    type TeheccudAyari,
    type TeheccudPenceresi,
} from './nafileTipleri';

const nesneMi = (d: unknown): d is Record<string, unknown> =>
    !!d && typeof d === 'object' && !Array.isArray(d);

const yonNormalize = (ham: unknown, varsayilan: PencereYonu): PencereYonu =>
    ham === 'cikisaDogru' || ham === 'girisindenItibaren' ? ham : varsayilan;

/**
 * Nafilenin adım KISITLARI — ortak adım dizisinin (`core/hatirlatma/adimDizisi.ts`)
 * nafile parametreleri: en fazla 3 adım, tekrar 10–60 dk, eşik motorun mutlak sınırları.
 */
export const NAFILE_ADIM_KISITLARI: AdimKisitlari = {
    maksAdim: NAFILE_MAKS_ADIM,
    tekrarMinDk: NAFILE_TEKRAR_MIN_DK,
    tekrarMaxDk: NAFILE_TEKRAR_MAX_DK,
};

/** Yeni bir nafile adımı — yalnız bildirim, tek atış. */
export function nafileAdimi(esikDk: number, siklik: Siklik = 'birkez', kanallar: UyariKanallari = { bildirim: true }): SeviyeAyari {
    return ekAdim(esikDk, siklik, kanallar);
}

/**
 * Adım dizisini normalize eder: kronolojik sıra, tekil eşik, en fazla 3,
 * en az 1 (boşsa `yedekEsikDk` ile tek adım).
 */
export function adimlariNormalize(ham: unknown, yon: PencereYonu, yedekEsikDk: number): SeviyeAyari[] {
    return ortakAdimlariNormalize(ham, yon, yedekEsikDk, NAFILE_ADIM_KISITLARI);
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
    adimEklenebilirMi(ayar, NAFILE_ADIM_KISITLARI);

/**
 * Yeni adım: muhafızla aynı yer kuralı (`yeniAdimEsigi` — en erken adımın
 * 15 dk öncesi, pencereye sığdırılır), tek atış, yalnız bildirim.
 * Eklenemiyorsa AYNI referans döner.
 */
export function nafileAdimEkle<T extends NafileHatirlatmaAyari>(ayar: T, pencereUzunluguDk?: number): T {
    return adimEkle(ayar, ayar.yon, NAFILE_ADIM_KISITLARI, pencereUzunluguDk);
}

/** Adımı siler — son adım silinmez (kartın anahtarı kapatır). AYNI referans döner. */
export function nafileAdimSil<T extends NafileHatirlatmaAyari>(ayar: T, indeks: number): T {
    return adimSil(ayar, indeks);
}

/**
 * Adımı günceller ve diziyi KRONOLOJİK tutar (eşik değişince sıra değişebilir).
 * Nafile kısıtları (ton/ses/aciliyet) burada da zorlanır: ortak modal bir adımı
 * muhafız alanlarıyla döndürse bile diske nafile dışı bir şey yazılmaz.
 */
export function nafileAdimGuncelle<T extends NafileHatirlatmaAyari>(ayar: T, indeks: number, yeni: SeviyeAyari): T {
    return adimGuncelle(ayar, indeks, yeni, ayar.yon, NAFILE_ADIM_KISITLARI);
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

/**
 * Açık nafilelerin kullandığı BENZERSİZ özel ses URI'leri (SAF) — muhafızın
 * `ozelSesleriTopla` ikizi. Çağıran bunları native'de çözerek doğrular.
 */
export function nafileOzelSesleriniTopla(a: NafileAyarlari): string[] {
    return adimOzelSesleri([a.hatirlatmalar.kusluk, a.hatirlatmalar.evvabin, a.teheccud]);
}

/**
 * ÇÖZÜLEMEYEN özel sesleri varsayılana düşürür (SAF) — muhafızın
 * `cozulemeyenSesleriDusur` ikizi. `content://` cihaza özgüdür: başka cihazdan geri
 * yüklenen yedekte ses çözülmez; kanal (ya da gerçek alarm kanalı) o ölü URI ile
 * kurulursa SESSİZ çalar ve kanal sesi sonradan DEĞİŞTİRİLEMEZ. Plan, nafile kanal
 * listesi ve muhafızın çöp toplamada koruduğu nafile kanal id'leri AYNI doğrulanmış
 * ayardan türemeli, yoksa id'ler ayrışır. Değişiklik yoksa AYNI referans döner.
 */
export function nafileCozulemeyenSesleriDusur(a: NafileAyarlari, cozulemeyen: ReadonlySet<string>): NafileAyarlari {
    if (cozulemeyen.size === 0) return a;
    const kusluk = adimCozulemeyenSesleriDusur(a.hatirlatmalar.kusluk, cozulemeyen);
    const evvabin = adimCozulemeyenSesleriDusur(a.hatirlatmalar.evvabin, cozulemeyen);
    const teheccud = adimCozulemeyenSesleriDusur(a.teheccud, cozulemeyen);
    if (kusluk === a.hatirlatmalar.kusluk && evvabin === a.hatirlatmalar.evvabin && teheccud === a.teheccud) return a;
    return { ...a, hatirlatmalar: { ...a.hatirlatmalar, kusluk, evvabin }, teheccud };
}

/**
 * Nafile adımlarının kullandığı GERÇEK ALARM kanalı sesleri (muhafızın alarm kanal
 * çöp toplaması bunları KORUMALI — `MuhafizKanalServisi`/`alarmKanallariniCikar` deseni).
 * Yalnız açık nafileler ve alarmı açık adımlar.
 */
export function nafileAlarmSesleri(a: NafileAyarlari): string[] {
    return adimAlarmSesleri([a.hatirlatmalar.kusluk, a.hatirlatmalar.evvabin, a.teheccud]);
}

/**
 * Nafilenin bildirim KANALI ihtiyacı (issue #273) — muhafız kanal uzayıyla
 * ortak (`muhafiz` tabanı / titreşimli `muhafiz_<hash>`). Yalnız açık nafileler;
 * uyandırmalı teheccüd kendi `nafile_uyandirma` kanalından gittiği için dahil
 * edilmez. `MuhafizKanalServisi` hem oluştururken hem çöp toplarken bunu okur.
 */
export function nafileKanalAyarlari(a: NafileAyarlari): VakitMuhafizAyari[] {
    const sonuc: VakitMuhafizAyari[] = [];
    for (const g of [a.hatirlatmalar.kusluk, a.hatirlatmalar.evvabin]) {
        if (g.aktif) sonuc.push({ yon: g.yon, seviyeler: g.adimlar });
    }
    if (a.teheccud.aktif && !a.teheccud.uyandirma) {
        sonuc.push({ yon: a.teheccud.yon, seviyeler: a.teheccud.adimlar });
    }
    return sonuc;
}

/** Bir nafilenin YAPISAL yükü: adım sayısı, sesli adım, tekrarlı adım, tekrar yoğunluğu. */
interface YapisalYuk {
    adim: number;
    sesli: number;
    tekrarli: number;
    /** Σ 1/herDk — aralık kısalınca artar. */
    yogunluk: number;
}

const yapisalYuk = (a: NafileHatirlatmaAyari): YapisalYuk => {
    const y: YapisalYuk = { adim: 0, sesli: 0, tekrarli: 0, yogunluk: 0 };
    if (!a.aktif) return y;
    for (const s of a.adimlar) {
        y.adim++;
        if (s.kanallar?.sesli === true) y.sesli++;
        if (s.siklik !== 'birkez') {
            y.tekrarli++;
            y.yogunluk += 1 / Math.max(1, s.siklik.herDk);
        }
    }
    return y;
};

/**
 * Değişiklik bekleyen hatırlatma SAYISINI YAPISAL olarak artırıyor mu?
 * (bildirim sınırı rehberinin ekleme-anı simülasyon kapısı — issue #298/#273)
 *
 * YALNIZ şunlar kapıdan geçer: nafile açma (aktif false→true), günü gününe
 * kurmayı kapatma, adım ekleme, sesli kanal açma (Android'de ayrı anons alarmı),
 * tek atıştan tekrara geçme ya da tekrar aralığını kısaltma, tekrarlı adım
 * varken teheccüd penceresini uzatma (son üçte bir → yatsıdan).
 *
 * Salt ZAMAN değişimleri (eşik, yön, tekrarsız pencere seçimi, uyandırma)
 * kapıdan GEÇMEZ: bir sonraki tetiği geçmişten geleceğe taşıyıp sayıyı +1
 * yapabilirler ve iOS'ta zaten aşımda olan kullanıcı VAR OLAN hatırlatmasının
 * saatini değiştiremez hâle gelirdi (Fable incelemesi M4).
 */
export function nafileYukuArtiyorMu(eski: NafileAyarlari, yeni: NafileAyarlari): boolean {
    if (eski.gunuGununeKur === true && yeni.gunuGununeKur !== true) return true;
    const ciftler: [NafileHatirlatmaAyari, NafileHatirlatmaAyari][] = [
        [eski.hatirlatmalar.kusluk, yeni.hatirlatmalar.kusluk],
        [eski.hatirlatmalar.evvabin, yeni.hatirlatmalar.evvabin],
        [eski.teheccud, yeni.teheccud],
    ];
    for (const [e, y] of ciftler) {
        if (!e.aktif && y.aktif) return true;
        const ey = yapisalYuk(e);
        const yy = yapisalYuk(y);
        if (yy.adim > ey.adim || yy.sesli > ey.sesli || yy.tekrarli > ey.tekrarli) return true;
        if (yy.yogunluk > ey.yogunluk + 1e-9) return true;
    }
    const tekrarliTeheccud = yeni.teheccud.aktif && yeni.teheccud.adimlar.some((s) => s.siklik !== 'birkez');
    return tekrarliTeheccud && eski.teheccud.pencere === 'sonUcteBir' && yeni.teheccud.pencere === 'yatsi';
}
