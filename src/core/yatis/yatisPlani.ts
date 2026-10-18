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
import { yatisSahipliMi } from '../muhafiz/teslimSahipligi';
import { Coordinates, PrayerTimes } from 'adhan';
import { turkiyeHesapParametreleri } from '../vakit/hesapParametreleri';
import type { VakitAdi } from '../types';
import { BILDIRIM_SABITLERI } from '../constants/UygulamaSabitleri';
import { tarihiISOFormatinaCevir } from '../utils/TarihYardimcisi';
import type { YatisAyarlari } from './yatisAyarlari';
import { vakitUyariPlaniOlustur, type UyariPlani } from '../muhafiz/motorAdaptoru';
import { alarmPayinaSigdir, ayniAnaDusenleriBirlestir } from '../hatirlatma/ekPlan';
import { adimAnonsMetni } from '../hatirlatma/anonsYerTutucu';

export type FarzVakit = Exclude<VakitAdi, 'gunes'>;
export const FARZ_VAKITLER: readonly FarzVakit[] = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];

export {
    YATIS_ADIM_KISITLARI,
    YATIS_DAKIKA_ADIM,
    YATIS_ONCE_ADIM_DK,
    YATIS_ONCE_MAX_DK,
    YATIS_ONCE_MIN_DK,
    YATIS_SAATLERI,
    YATIS_TEKRAR_MAX_DK,
    YATIS_TEKRAR_MIN_DK,
    YATIS_VARSAYILAN_AYARLARI,
    YATIS_VARSAYILAN_TEKRAR_DK,
    type YatisAyarlari,
} from './yatisAyarlari';

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
    /**
     * Sesli anons cümlesi (çözülmüş, yer tutucusuz). Yatsı hatırlatması ibadete çağrıdır
     * ("sen" + emir); muhasebe uygulama dilidir (kibar, nötr). Bildirim gövdesinden AYRI:
     * kısa tutulur, liste okunmaz.
     */
    anons: string;
}

export interface YatisPlanKaydi extends YatisIcerigi {
    /** Namaz günü */
    gun: string;
    zaman: Date;
    /** Yatışa kalan dk (kaymadan ÖNCE — kimlik eki bunu taşır). */
    kalanDk: number;
    /**
     * Pencerenin sonu = namaz gününün sonu (yatsı çıkışı / ertesi imsak). Gerçek alarm geç
     * tetikte burada atlar; muhasebedeki vaktin KENDİ çıkışı DEĞİL (o çoktan geçmiş olabilir).
     */
    cikis: Date;
    /** Motorun uyarısı — kanallar, gerçek alarm anı; `anonsMetni` ÇÖZÜLMÜŞ cümledir. */
    uyari: UyariPlani;
}

export interface VakitPenceresi {
    giris: Date;
    cikis: Date;
}

/** `muhafiz_<gün>_vakit_<vakit>_<ek>` */
const vakitKimligi = (gun: string, vakit: FarzVakit, ek: string): string =>
    `${BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ}${gun}${BILDIRIM_SABITLERI.ONEKLEME.VAKIT}${vakit}${ek}`;

/**
 * Bu servisin bildirimi mi? (temizlik bununla süzer) — TEK kural teslim sahipliğindedir
 * (`core/muhafiz/teslimSahipligi.ts`, Kotlin ikiziyle ortak örnek): muhafız turu yatış
 * kimliklerini oradan tanıyıp silmez. Desen tekrar tetiklerinin `_<kalanDk>` ekini de kapsar.
 */
export const yatisKimligiMi = (kimlik: string): boolean => yatisSahipliMi(kimlik);

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
    const params = turkiyeHesapParametreleri();
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
    ayarlar: Pick<YatisAyarlari, 'yatsiHatirlatmasi' | 'muhasebe'>,
    otomatikKaza: OtomatikKazaBilgisi | null = null
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
            anons: 'Yatmadan önce yatsıyı kıl.',
        };
    }

    // 2. Gün sonu muhasebesi (uygulama yönetimi: kibar "siz").
    if (!ayarlar.muhasebe || eksikler.length === 0) return null;

    // Kaza Defteri 2.0: otomatik ekleme açıksa İLERİYE DÖNÜK satır. Tetik anında
    // kayıt henüz yazılmamıştır (gün ertesi imsakta kapanır) → "eklendi" DENMEZ.
    const otoSatiri = otomatikKazaSatiri(gun, kilinanSayi, otomatikKaza);

    if (eksikler.length === 1) {
        const v = eksikler[0];
        const kaza = cikmisMi(v);
        return {
            tur: 'muhasebeTek',
            kimlik: vakitKimligi(gun, v, MUHASEBE_EKI),
            kategori: kaza ? MUHASEBE_KATEGORILERI.TEK : BILDIRIM_SABITLERI.KATEGORI.MUHAFIZ,
            baslik: ozet(eksikler),
            govde: otoSatiri
                ? `Kıldıysanız işaretleyin. ${otoSatiri}`
                : kaza
                  ? 'Kıldıysanız işaretleyin; kılamadıysanız kaza defterinize ekleyin.'
                  : 'Kıldıysanız işaretleyin. Vakit hâlâ sürüyor.',
            data: { tip: 'muhasebe', tarih: gun, vakit: v, kazayaEklenebilir: kaza ? [v] : [] },
            anons: `Bugün ${VAKIT_KUCUK[v]} vakti işaretlenmemiş görünüyor.`,
        };
    }

    return {
        tur: 'muhasebeCoklu',
        kimlik: `${MUHASEBE_ID_ONEKI}${gun}`,
        kategori: MUHASEBE_KATEGORILERI.COKLU,
        baslik: ozet(eksikler),
        govde: otoSatiri
            ? `Kıldıklarınızı işaretlemek için uygulamayı açıp inceleyin. ${otoSatiri}`
            : 'Kıldıklarınızı işaretlemek için uygulamayı açıp inceleyin.',
        data: { tip: 'muhasebe', tarih: gun, kazayaEklenebilir: eksikler.filter(cikmisMi) },
        anons: `Bugün ${eksikler.length} vakit işaretlenmemiş görünüyor.`,
    };
}

/**
 * Ekran örneği (akış önizlemesi, "Telefonunuz şöyle okur"): ayarın hangi içeriği ürettiğini
 * GERÇEK içerik üreticisinden gösterir (ayrı örnek metin yazılmaz — ayrışmasın). Yatsı
 * hatırlatması açıksa yatsı (muhasebe açıksa satırıyla), değilse tek eksikli muhasebe.
 * Sabit sentetik bir günle çalışır (konum gerekmez). İkisi de kapalıysa `null`.
 */
export function yatisOrnekIcerigi(ayarlar: Pick<YatisAyarlari, 'yatsiHatirlatmasi' | 'muhasebe'>): YatisIcerigi | null {
    const t = (gun: number, saat: number, dk = 0) => new Date(2026, 0, gun, saat, dk);
    const vakitler: Record<FarzVakit, VakitPenceresi> = {
        imsak: { giris: t(10, 6, 40), cikis: t(10, 8, 10) },
        ogle: { giris: t(10, 13, 10), cikis: t(10, 15, 40) },
        ikindi: { giris: t(10, 15, 40), cikis: t(10, 18, 0) },
        aksam: { giris: t(10, 18, 0), cikis: t(10, 19, 25) },
        yatsi: { giris: t(10, 19, 25), cikis: t(11, 6, 40) },
    };
    const kilinan: VakitAdi[] = ayarlar.yatsiHatirlatmasi ? ['imsak', 'ikindi', 'aksam'] : ['imsak', 'ikindi', 'aksam', 'yatsi'];
    return yatisIcerigiOlustur('2026-01-10', vakitler, kilinan, t(10, 22, 30).getTime(), ayarlar);
}

/** Otomatik kaza ekleme açıksa muhasebe satırı için gereken bilgi (Kaza Defteri 2.0). */
export interface OtomatikKazaBilgisi {
    /** Açık otomatik aralığın başladığı namaz günü. */
    baslangic: string;
    /** İşaretsiz günler "bana sorun" mu? (Hiç işaret yoksa borç yazılmaz, sorulur.) */
    kayitsizSor: boolean;
}

/**
 * Muhasebe gövdesine eklenecek ileriye dönük cümle; otomatik kapalıysa ya da gün
 * aralık öncesindeyse `null`. Hiç işaretsiz gün "bana sorun" tercihinde deftere
 * YAZILMAZ — o durumda "eklenecek" demek yalan olurdu.
 */
export function otomatikKazaSatiri(
    gun: string,
    kilinanSayi: number,
    oto: OtomatikKazaBilgisi | null
): string | null {
    if (!oto || gun < oto.baslangic) return null;
    if (kilinanSayi === 0 && oto.kayitsizSor) {
        return "İşaretlemezseniz bu gün Kaza Defteri'nde size sorulacak.";
    }
    return 'İşaretlemezseniz namaz günü bitince kazaya eklenecek.';
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
    /** Otomatik kaza ekleme açıksa (Kaza Defteri 2.0); muhasebe metnine satır ekler. */
    otomatikKaza?: OtomatikKazaBilgisi | null;
    /** Android alarm payı (bildirim + anons alarmı, kronolojik). Verilmezse kesilmez. */
    alarmButcesi?: number;
}

function koordinatGecerli(k: { lat: number; lng: number } | null | undefined): k is { lat: number; lng: number } {
    return !!k && Number.isFinite(k.lat) && Number.isFinite(k.lng) && !(k.lat === 0 && k.lng === 0);
}

/** Namaz günü `gun` için yatış anı (saat < 12 → ertesi takvim günü). */
export function yatisAni(gun: Date, ayarlar: Pick<YatisAyarlari, 'saat' | 'dakika'>): Date {
    return yatisTetikAni(gun, { saat: ayarlar.saat, dakika: ayarlar.dakika, onceDk: 0 });
}

const adimlarGecerliMi = (adimlar: unknown): adimlar is YatisAyarlari['adimlar'] =>
    Array.isArray(adimlar) && adimlar.length > 0;

type YatisTetigi = { sira: number; uyari: UyariPlani; zaman: Date };

/**
 * Önümüzdeki `gunSayisi` namaz gününün yatış bildirimleri (kronolojik).
 *
 * AYRI PLAN MOTORU YAZILMAZ: her namaz gününün penceresi (yatışa kadar) muhafızın bir vakti
 * gibi `vakitUyariPlaniOlustur`'a verilir (eşik, sıklık, kanallar, gerçek alarm anı aynı
 * motordan). Kurallar:
 *   - Yatsı girişi KAYMASI (`yatsiHatirlatmaTetigi`) HER tetiğe uygulanır; kaymayla aynı
 *     ana düşen tetikler TEK uyarıda BİRLEŞİR (`ayniAnaDusenleriBirlestir`: kanallar OR,
 *     ses/alarm en güçlü adımdan; kimlik ve sıra öncekinin).
 *   - İÇERİK günde BİR KEZ, (kaymış) İLK tetiğin anında seçilir ve o günün TÜM tetikleri
 *     aynı içeriği (kimlik kökü, kategori, `data`) taşır: tekrar = aynı uyarının yeniden
 *     teslimi. Böylece kimlik kökü sabit kalır — native "Kıldım" (`muhafiz_<gün>_vakit_<v>`
 *     öneki) ve gösterim grubu bütün tekrarları kapsar, "Kıldım hangi vakti işaretler"
 *     kararı saf çekirdekte kalır. Kayıt değişince servis zaten yeniden planlar.
 *   - KİMLİK: günün İLK tetiği (motor sırası) tarihsel kimliği korur; diğerleri `_<kalanDk>`.
 *
 * Konum yoksa plan BOŞTUR (vakitler bilinmeden "yatsı sürüyor" denemez).
 * Ufuk özel günden bağımsız seçilir, sonra özel günler elenir (gün sonu
 * deseni): aralık dışı günlerin bildirimleri birebir aynı kalır.
 */

/**
 * Yatsı hatırlatmasının sesli okuma metni. Yatsı girişine kayan tetik yatış saatini GEÇMİŞ
 * olabilir (yazın erken yatış): o anda "{süre} dakika" anlamını yitirir (0) → metin `{süre}`
 * içeriyorsa otomatik cümle okunur; "Yatmana 0 dakika kaldı" demektense.
 */
export function yatisAdimAnonsu(metin: string | undefined, sureDk: number, otomatik: string): string {
    if (sureDk <= 0 && typeof metin === 'string' && metin.includes('{süre}')) return otomatik;
    return adimAnonsMetni(metin, { vakit: 'Yatsı', sureDk }, () => otomatik);
}

export function yatisPlaniOlustur(g: YatisPlanGirdisi): YatisPlanKaydi[] {
    const { ayarlar, simdi } = g;
    if (!ayarlar.aktif || (!ayarlar.yatsiHatirlatmasi && !ayarlar.muhasebe)) return [];
    if (!adimlarGecerliMi(ayarlar.adimlar)) return [];
    if (!koordinatGecerli(g.koordinat) || !gecerliTarih(simdi) || !(g.gunSayisi > 0)) return [];
    const koordinat = g.koordinat;
    const kilinanlar = g.kilinanlar ?? (() => []);
    const gunAtlanirMi = g.gunAtlanirMi ?? (() => false);

    // Motor çıktısı kalanDk'ya göre AZALAN = kronolojik (çıkış yönü, yatışa yaklaşır).
    const enBuyukEsik = Math.max(...ayarlar.adimlar.map((a) => a.esikDk));
    const adimPlani = vakitUyariPlaniOlustur({ yon: 'cikisaDogru', seviyeler: ayarlar.adimlar }, enBuyukEsik);

    const bugun = gunKaydir(simdi, 0);
    const adaylar: Array<{ gun: string; gunTarih: Date; tetikler: YatisTetigi[] }> = [];
    // k = -1: gece yarısından sonra (imsak öncesi) hâlâ DÜNÜN namaz günü sürüyor.
    for (let k = -1; k <= g.gunSayisi; k++) {
        const gunTarih = gunKaydir(bugun, k);
        const yatis = yatisAni(gunTarih, ayarlar);
        if (!gecerliTarih(yatis)) continue;
        const tetikler = adimPlani
            .map((uyari, sira) => ({ sira, uyari, zaman: new Date(yatis.getTime() - uyari.kalanDk * 60_000) }))
            .filter((t) => t.zaman.getTime() > simdi.getTime());
        if (tetikler.length > 0) adaylar.push({ gun: tarihiISOFormatinaCevir(gunTarih), gunTarih, tetikler });
    }

    const plan: YatisPlanKaydi[] = [];
    const ilkTetikMs = (a: { tetikler: YatisTetigi[] }) => a.tetikler[0].zaman.getTime();
    for (const a of adaylar.sort((x, y) => ilkTetikMs(x) - ilkTetikMs(y)).slice(0, g.gunSayisi)) {
        if (gunAtlanirMi(a.gun)) continue;
        let vakitler: Record<FarzVakit, VakitPenceresi>;
        try {
            vakitler = namazGunuVakitleri(koordinat, a.gunTarih);
        } catch {
            continue;
        }
        const cikis = vakitler.yatsi.cikis;
        const kilinan = kilinanlar(a.gun);
        // Namaz günü ertesi imsakta biter: yatış ondan sonraysa o tetik (ve gün) atlanır.
        // Yatış yatsı girişinden önceyse yatsı hatırlatması yatsı girdikten sonraya kayar.
        const kaymis: YatisTetigi[] = [];
        for (const t of a.tetikler) {
            if (t.zaman.getTime() >= cikis.getTime()) continue;
            const zaman = yatsiHatirlatmaTetigi(t.zaman, vakitler, kilinan, ayarlar);
            // Aynı ana düşen tetik BİRLEŞİR (kanallar OR, ses/alarm en güçlü adımdan) — ilkini
            // tutmak kaymayla tabana yığılan güçlü kanalı (gerçek alarm) düşürürdü.
            const ayni = kaymis.find((k) => k.zaman.getTime() === zaman.getTime());
            if (ayni) ayni.uyari = ayniAnaDusenleriBirlestir(ayni.uyari, t.uyari);
            else kaymis.push({ ...t, zaman });
        }
        if (kaymis.length === 0) continue;
        kaymis.sort((x, y) => x.zaman.getTime() - y.zaman.getTime());
        // İçerik günde BİR KEZ seçilir (tekrarlar aynı içeriği taşır, kimlik kökü sabit), ama
        // İÇERİK ÜRETEN İLK tetikte: yalnız muhasebe açıkken ilk tetikte yatsı henüz girmemiş ve
        // eksik yoksa içerik null olur; ilk tetiğe bakıp günü atlamak sonraki (yatsı girdikten
        // sonraki) hatırlatmaları da sessizce düşürürdü. İçeriksiz erken tetikler kurulmaz.
        let icerik: ReturnType<typeof yatisIcerigiOlustur> = null;
        let baslangic = 0;
        for (; baslangic < kaymis.length; baslangic++) {
            icerik = yatisIcerigiOlustur(a.gun, vakitler, kilinan, kaymis[baslangic].zaman.getTime(), ayarlar, g.otomatikKaza ?? null);
            if (icerik) break;
        }
        if (!icerik) continue;
        const otomatikAnons = icerik.anons;
        // Yatış anı (kaymadan önceki tetik + kalan dk). Kayan tetikte `{süre}` eşik değil,
        // o anda yatışa GERÇEKTEN kalan dakikadır.
        const ilkTetik = a.tetikler[0];
        const yatisMs = ilkTetik.zaman.getTime() + ilkTetik.uyari.kalanDk * 60_000;
        for (const t of kaymis.slice(baslangic)) {
            const sureDk = Math.max(0, Math.round((yatisMs - t.zaman.getTime()) / 60_000));
            plan.push({
                ...icerik,
                kimlik: t.sira === 0 ? icerik.kimlik : `${icerik.kimlik}_${t.uyari.kalanDk}`,
                gun: a.gun,
                zaman: t.zaman,
                kalanDk: t.uyari.kalanDk,
                cikis,
                // Kullanıcının sesli okuma metni YALNIZ yatsı hatırlatmasında okunur: muhasebe
                // (yatsı kılınmışken de gelir) daima otomatik cümledir — "yatsıyı kıl" diye
                // yazılmış bir metin kılınmış yatsıda okunmasın (editör bunu söyler).
                uyari: {
                    ...t.uyari,
                    anonsMetni:
                        icerik.tur === 'yatsi'
                            ? yatisAdimAnonsu(t.uyari.anonsMetni, sureDk, otomatikAnons)
                            : icerik.anons,
                },
            });
        }
    }
    plan.sort((x, y) => x.zaman.getTime() - y.zaman.getTime());
    return alarmPayinaSigdir(plan, g.alarmButcesi);
}
