/**
 * YATIŞ HATIRLATMASI + GÜN SONU MUHASEBESİ — SAF plan (issue #290).
 *
 * Yatsının 5–11 saatlik penceresinde muhafızın "çıkışa kala" uyarısı sabaha
 * (04:30 gibi) düşer; asıl kayıp uykuya dalmaktır. Kullanıcı her zamanki yatış
 * saatini girer, yatıştan X dk önce TEK bildirim gider:
 *   1. yatsı kılınmadıysa → yatsı hatırlatması ("sen" + emir; ibadete çağrı)
 *      [+ muhasebe açıksa "Bugün 3/5 · öğle, ikindi işaretlenmemiş" satırı];
 *   2. değilse ve başka eksik varsa → gün sonu muhasebesi (uygulama yönetimi,
 *      kibar "siz"): tek eksik → "Kıldım" (+ vakti çıkmışsa "Kazaya ekle"),
 *      birden fazla eksik → yalnız uygulamayı açan "İnceleyin";
 *   3. hepsi kılındıysa → bildirim yok.
 *
 * "GÜN" NAMAZ GÜNÜDÜR (AGENTS.md: seri günü ertesi imsakta biter): 00:30'da
 * yatan kişinin bildirimi DÜNÜN namaz gününe aittir. Yatış saati 12'den
 * küçükse ertesi takvim gününe kurulur; tetik ertesi imsaktan sonraya düşerse
 * o gün atlanır (namaz günü bitmiştir).
 *
 * KİMLİK UZAYI: tek vakte bağlı bildirimler `muhafiz_<gün>_vakit_<vakit>_<ek>`
 * taşır → bildirimdeki "Kıldım" Android'de NATIVE işlenir (issue #299,
 * `BildirimKildimKurallari` kimlikten vakit çözer) ve vaktin kılınması (her
 * yoldan) bu bildirimi de iptal eder. Çoklu muhasebe vakte bağlı değildir →
 * `muhasebe_<gün>`. Muhafız plan temizliği yalnız `_seviye_` kimliklerine
 * dokunur (`muhafizPlanKimligiMi`).
 *
 * İÇERİK BAYATLIĞI: içerik planlama anındaki kılınmışlıktan üretilir; kayıt
 * değişince servis yeniden planlar (`LocalNamazServisi` adlı yuva `yatis`).
 * Gelecek günlerde henüz hiçbir şey kılınmadığı için "0/5" ile kurulur ve o
 * gün işaretleme yapıldıkça tazelenir.
 *
 * SAF: `simdi` enjekte edilir; adhan core'da zaten kullanılıyor.
 */
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import type { VakitAdi } from '../types';
import { BILDIRIM_SABITLERI } from '../constants/UygulamaSabitleri';
import { tarihiISOFormatinaCevir } from '../utils/TarihYardimcisi';

export type FarzVakit = Exclude<VakitAdi, 'gunes'>;
export const FARZ_VAKITLER: readonly FarzVakit[] = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];

export interface YatisAyarlari {
    /** Özelliğin ana anahtarı — VARSAYILAN KAPALI. */
    aktif: boolean;
    /** Her zamanki yatış saati (0–23) ve dakikası. */
    saat: number;
    dakika: number;
    /** Yatıştan kaç dk önce. */
    onceDk: number;
    /** Yatsı kılınmadıysa hatırlat. */
    yatsiHatirlatmasi: boolean;
    /** Gün sonu muhasebesi (eksik vakitler). */
    muhasebe: boolean;
}

export const YATIS_VARSAYILAN_AYARLARI: YatisAyarlari = {
    aktif: false,
    saat: 23,
    dakika: 0,
    onceDk: 30,
    yatsiHatirlatmasi: true,
    muhasebe: true,
};

export const YATIS_ONCE_MIN_DK = 5;
export const YATIS_ONCE_MAX_DK = 120;
export const YATIS_ONCE_ADIM_DK = 5;
export const YATIS_DAKIKA_ADIM = 5;

/**
 * Seçilebilir yatış saatleri: 20:00 – 02:55. Daha geç saat TR yazında imsağı
 * (~03:15) geçebilir; o anda "yatsıyı kıl" demek yanlıştır (vakit çıkmıştır).
 */
export const YATIS_SAATLERI: readonly number[] = [20, 21, 22, 23, 0, 1, 2];

/**
 * Yatış tetiği yatsı GİRİŞİNDEN önceyse (yazın 20:30 yatış, yatsı ~22:00) yatsı
 * hatırlatması yatsı girdikten bu kadar sonraya çekilir. Aksi halde tetik anında
 * yatsı "girmemiş" sayılır: hatırlatma hiç tutmaz, muhasebe de yatsıyı saymaz.
 */
export const YATIS_YATSI_GIRIS_PAYI_DK = 5;

/** Kaç namaz günü ileri planlanır — gün sonu seri hatırlatmasıyla AYNI gerekçe (iOS 64 bütçesi). */
export const YATIS_PLAN_GUN_SAYISI = { android: 7, ios: 3 } as const;

export const MUHASEBE_KATEGORILERI = {
    /** "Kıldım" + "Kazaya ekle" */
    TEK: 'muhasebe_tek_category',
    /** "İnceleyin" (uygulamayı açar) */
    COKLU: 'muhasebe_coklu_category',
} as const;

const MUHASEBE_ID_ONEKI = 'muhasebe_';
const YATIS_EKI = '_yatis';
const MUHASEBE_EKI = '_muhasebe';

const VAKIT_KUCUK: Record<FarzVakit, string> = {
    imsak: 'sabah',
    ogle: 'öğle',
    ikindi: 'ikindi',
    aksam: 'akşam',
    yatsi: 'yatsı',
};

export type YatisBildirimTuru = 'yatsi' | 'muhasebeTek' | 'muhasebeCoklu';

export interface YatisBildirimVerisi {
    tip: 'yatis' | 'muhasebe';
    /** Namaz günü (YYYY-MM-DD) — "Kıldım" bu güne yazar. */
    tarih: string;
    /** Tek vakte bağlı bildirimde vakit ("Kıldım" bunu işaretler). */
    vakit?: FarzVakit;
    /** Vakti çıkmış, kazaya eklenebilecek eksikler. */
    kazayaEklenebilir: FarzVakit[];
    [anahtar: string]: unknown;
}

export interface YatisIcerigi {
    tur: YatisBildirimTuru;
    kimlik: string;
    kategori: string;
    baslik: string;
    govde: string;
    data: YatisBildirimVerisi;
}

export interface YatisPlanKaydi extends YatisIcerigi {
    /** Namaz günü */
    gun: string;
    zaman: Date;
}

export interface VakitPenceresi {
    giris: Date;
    cikis: Date;
}

/** `muhafiz_<gün>_vakit_<vakit>_<ek>` */
const vakitKimligi = (gun: string, vakit: FarzVakit, ek: string): string =>
    `${BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ}${gun}${BILDIRIM_SABITLERI.ONEKLEME.VAKIT}${vakit}${ek}`;

const YATIS_KIMLIK_DESENI = /^muhafiz_\d{4}-\d{2}-\d{2}_vakit_[a-z]+_(yatis|muhasebe)$/;

/** Bu servisin bildirimi mi? (temizlik bununla süzer) */
export const yatisKimligiMi = (kimlik: string): boolean =>
    YATIS_KIMLIK_DESENI.test(kimlik) || kimlik.startsWith(MUHASEBE_ID_ONEKI);

const gecerliTarih = (t: unknown): t is Date => t instanceof Date && Number.isFinite(t.getTime());

/** Takvim günü + `gun` (yerel, gün başı). */
const gunKaydir = (taban: Date, gun: number): Date =>
    new Date(taban.getFullYear(), taban.getMonth(), taban.getDate() + gun);

/**
 * Namaz günü `gun` için tetik anı. Yatış saati < 12 → ertesi takvim günü
 * (gece yarısından sonra yatan kişi hâlâ o namaz günündedir).
 */
export function yatisTetikAni(gun: Date, ayarlar: Pick<YatisAyarlari, 'saat' | 'dakika' | 'onceDk'>): Date {
    const hedefGun = ayarlar.saat < 12 ? gunKaydir(gun, 1) : gunKaydir(gun, 0);
    const yatis = new Date(hedefGun.getFullYear(), hedefGun.getMonth(), hedefGun.getDate(), ayarlar.saat, ayarlar.dakika);
    return new Date(yatis.getTime() - ayarlar.onceDk * 60_000);
}

/** Namaz günü `gun`ün beş vaktinin pencereleri (yatsı ertesi imsakta biter). */
export function namazGunuVakitleri(koordinat: { lat: number; lng: number }, gun: Date): Record<FarzVakit, VakitPenceresi> {
    const konum = new Coordinates(koordinat.lat, koordinat.lng);
    const params = CalculationMethod.Turkey();
    const b = new PrayerTimes(konum, gunKaydir(gun, 0), params);
    const y = new PrayerTimes(konum, gunKaydir(gun, 1), params);
    return {
        imsak: { giris: b.fajr, cikis: b.sunrise },
        ogle: { giris: b.dhuhr, cikis: b.asr },
        ikindi: { giris: b.asr, cikis: b.maghrib },
        aksam: { giris: b.maghrib, cikis: b.isha },
        yatsi: { giris: b.isha, cikis: y.fajr },
    };
}

/**
 * Yatsı hatırlatmasının ETKİN tetiği: `max(yatış tetiği, yatsı girişi + pay)`,
 * yatsı çıkışını geçmeden. Yalnız yatsı hatırlatması açıkken ve yatsı kılınmamışken
 * kayar — yalnız muhasebe açıkken kullanıcının seçtiği saat korunur (ekran bunu
 * bilgi satırıyla söyler: `yatsiOncesiTetikBilgisi`).
 */
export function yatsiHatirlatmaTetigi(
    tetik: Date,
    vakitler: Record<FarzVakit, VakitPenceresi>,
    kilinan: readonly VakitAdi[],
    ayarlar: Pick<YatisAyarlari, 'yatsiHatirlatmasi'>
): Date {
    if (!ayarlar.yatsiHatirlatmasi || kilinan.includes('yatsi')) return tetik;
    const enErken = vakitler.yatsi.giris.getTime() + YATIS_YATSI_GIRIS_PAYI_DK * 60_000;
    if (tetik.getTime() >= enErken || enErken >= vakitler.yatsi.cikis.getTime()) return tetik;
    return new Date(enErken);
}

/**
 * Ekran için: bugünün namaz gününde hatırlatma saati yatsı girişinden önce mi?
 * Öyleyse yatsı girişini döndürür (bilgi satırı "yatsı vaktinden (22:04) önce"
 * der), değilse/konum yoksa `null`. `simdi` enjekte edilir.
 */
export function yatsiOncesiTetikBilgisi(
    koordinat: { lat: number; lng: number } | null | undefined,
    ayarlar: Pick<YatisAyarlari, 'saat' | 'dakika' | 'onceDk'>,
    simdi: Date
): { yatsiGiris: Date } | null {
    if (!koordinatGecerli(koordinat) || !gecerliTarih(simdi)) return null;
    try {
        const gun = gunKaydir(simdi, 0);
        const yatsiGiris = namazGunuVakitleri(koordinat, gun).yatsi.giris;
        return yatisTetikAni(gun, ayarlar).getTime() < yatsiGiris.getTime() ? { yatsiGiris } : null;
    } catch {
        return null;
    }
}

const adListesi = (vakitler: readonly FarzVakit[]): string => vakitler.map((v) => VAKIT_KUCUK[v]).join(', ');

/**
 * Bir namaz gününün bildirim içeriği (ya da `null` = bildirim yok).
 *
 * @param kilinan O namaz gününde kılınmış vakitler.
 * @param tetikMs Bildirimin gösterileceği an — "eksik" yalnız o ana kadar
 *   GİRMİŞ vakitlerdir; "kazaya eklenebilir" yalnız o ana kadar ÇIKMIŞ olanlar.
 */
export function yatisIcerigiOlustur(
    gun: string,
    vakitler: Record<FarzVakit, VakitPenceresi>,
    kilinan: readonly VakitAdi[],
    tetikMs: number,
    ayarlar: Pick<YatisAyarlari, 'yatsiHatirlatmasi' | 'muhasebe'>
): YatisIcerigi | null {
    const kilindi = new Set(kilinan);
    const kilinanSayi = FARZ_VAKITLER.filter((v) => kilindi.has(v)).length;
    const girmis = FARZ_VAKITLER.filter((v) => vakitler[v].giris.getTime() <= tetikMs);
    const eksikler = girmis.filter((v) => !kilindi.has(v));
    const cikmisMi = (v: FarzVakit) => vakitler[v].cikis.getTime() <= tetikMs;
    const ozet = (liste: readonly FarzVakit[]) => `Bugün ${kilinanSayi}/5 · ${adListesi(liste)} işaretlenmemiş`;

    // 1. Yatsı hatırlatması (ibadete çağrı: "sen" + emir kipi).
    if (ayarlar.yatsiHatirlatmasi && eksikler.includes('yatsi') && !cikmisMi('yatsi')) {
        const digerleri = eksikler.filter((v) => v !== 'yatsi');
        const satir = ayarlar.muhasebe && digerleri.length > 0 ? `\n${ozet(digerleri)}.` : '';
        return {
            tur: 'yatsi',
            kimlik: vakitKimligi(gun, 'yatsi', YATIS_EKI),
            kategori: BILDIRIM_SABITLERI.KATEGORI.MUHAFIZ,
            // Önden okunur (issue #287): vakit adı başta, ikon sonda.
            baslik: 'Yatsı · yatmadan önce kıl 🌙',
            govde: `Yatsı vakti hâlâ sürüyor; uykuya dalmadan namaza dur.${satir}`,
            data: { tip: 'yatis', tarih: gun, vakit: 'yatsi', kazayaEklenebilir: [] },
        };
    }

    // 2. Gün sonu muhasebesi (uygulama yönetimi: kibar "siz").
    if (!ayarlar.muhasebe || eksikler.length === 0) return null;

    if (eksikler.length === 1) {
        const v = eksikler[0];
        const kaza = cikmisMi(v);
        return {
            tur: 'muhasebeTek',
            kimlik: vakitKimligi(gun, v, MUHASEBE_EKI),
            kategori: kaza ? MUHASEBE_KATEGORILERI.TEK : BILDIRIM_SABITLERI.KATEGORI.MUHAFIZ,
            baslik: ozet(eksikler),
            govde: kaza
                ? 'Kıldıysanız işaretleyin; kılamadıysanız kaza defterinize ekleyin.'
                : 'Kıldıysanız işaretleyin. Vakit hâlâ sürüyor.',
            data: { tip: 'muhasebe', tarih: gun, vakit: v, kazayaEklenebilir: kaza ? [v] : [] },
        };
    }

    return {
        tur: 'muhasebeCoklu',
        kimlik: `${MUHASEBE_ID_ONEKI}${gun}`,
        kategori: MUHASEBE_KATEGORILERI.COKLU,
        baslik: ozet(eksikler),
        govde: 'Kıldıklarınızı işaretlemek için uygulamayı açıp inceleyin.',
        data: { tip: 'muhasebe', tarih: gun, kazayaEklenebilir: eksikler.filter(cikmisMi) },
    };
}

export interface YatisPlanGirdisi {
    koordinat: { lat: number; lng: number } | null;
    ayarlar: YatisAyarlari;
    simdi: Date;
    gunSayisi: number;
    /** Namaz günü (ISO) → kılınmış vakitler. Gelecek günler boş döner. */
    kilinanlar?: (gun: string) => readonly VakitAdi[];
    /** Özel gün kapısı (issue #272) — namaz gününe uygulanır. */
    gunAtlanirMi?: (gun: string) => boolean;
}

function koordinatGecerli(k: { lat: number; lng: number } | null | undefined): k is { lat: number; lng: number } {
    return !!k && Number.isFinite(k.lat) && Number.isFinite(k.lng) && !(k.lat === 0 && k.lng === 0);
}

/**
 * Önümüzdeki `gunSayisi` namaz gününün yatış bildirimleri (kronolojik).
 *
 * Konum yoksa plan BOŞTUR (vakitler bilinmeden "yatsı sürüyor" denemez).
 * Ufuk özel günden bağımsız seçilir, sonra özel günler elenir (gün sonu
 * deseni): aralık dışı günlerin bildirimleri birebir aynı kalır.
 */
export function yatisPlaniOlustur(g: YatisPlanGirdisi): YatisPlanKaydi[] {
    const { ayarlar, simdi } = g;
    if (!ayarlar.aktif || (!ayarlar.yatsiHatirlatmasi && !ayarlar.muhasebe)) return [];
    if (!koordinatGecerli(g.koordinat) || !gecerliTarih(simdi) || !(g.gunSayisi > 0)) return [];
    const koordinat = g.koordinat;
    const kilinanlar = g.kilinanlar ?? (() => []);
    const gunAtlanirMi = g.gunAtlanirMi ?? (() => false);

    const bugun = gunKaydir(simdi, 0);
    const adaylar: Array<{ gun: string; gunTarih: Date; zaman: Date }> = [];
    // k = -1: gece yarısından sonra (imsak öncesi) hâlâ DÜNÜN namaz günü sürüyor.
    for (let k = -1; k <= g.gunSayisi; k++) {
        const gunTarih = gunKaydir(bugun, k);
        const zaman = yatisTetikAni(gunTarih, ayarlar);
        if (!gecerliTarih(zaman) || zaman.getTime() <= simdi.getTime()) continue;
        adaylar.push({ gun: tarihiISOFormatinaCevir(gunTarih), gunTarih, zaman });
    }

    const plan: YatisPlanKaydi[] = [];
    for (const a of adaylar.sort((x, y) => x.zaman.getTime() - y.zaman.getTime()).slice(0, g.gunSayisi)) {
        if (gunAtlanirMi(a.gun)) continue;
        let vakitler: Record<FarzVakit, VakitPenceresi>;
        try {
            vakitler = namazGunuVakitleri(koordinat, a.gunTarih);
        } catch {
            continue;
        }
        // Namaz günü ertesi imsakta biter: yatış ondan sonraysa o gün atlanır.
        if (a.zaman.getTime() >= vakitler.yatsi.cikis.getTime()) continue;
        const kilinan = kilinanlar(a.gun);
        // Yatış yatsı girişinden önceyse yatsı hatırlatması yatsı girdikten sonraya kayar.
        const zaman = yatsiHatirlatmaTetigi(a.zaman, vakitler, kilinan, ayarlar);
        const icerik = yatisIcerigiOlustur(a.gun, vakitler, kilinan, zaman.getTime(), ayarlar);
        if (icerik) plan.push({ ...icerik, gun: a.gun, zaman });
    }
    return plan;
}
