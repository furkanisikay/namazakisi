/**
 * Şehir geofence'inden çıkışta konum değişimi TÜKETİCİLERE YAYILMALI MI? (denetim D-14)
 *
 * `konumDegistiUygula` konuma bağlı ~17 tüketicinin hepsini yeniden planlar (muhafız,
 * vakit bildirimi, sayaçlar, cuma, nafile, widget, saat…) — hepsi sil-kur. Oysa bölge
 * yarıçapı (dengeli 5 km, hassas 2 km) kadar bir kayma vakitleri yalnız ~13 sn oynatır:
 * işe gidip gelen kullanıcıda günde 10+ tam yeniden planlama, hiçbir saati değiştirmeden.
 *
 * KURAL (ihtiyatlı): yayma ancak şu İKİSİ birden doğruysa ATLANIR:
 *   1. Bugünün 6 vakti + yarının imsağı (muhafız yarının imsağını da planlar) iki
 *      koordinatta da 1 dakikadan AZ farklı — yuvarlanmamış adhan saatleriyle.
 *   2. Yer adı (il + ilçe) iki tarafta da BİLİNİYOR ve aynı. Adlardan biri çözülemediyse
 *      karar verilemez → yayılır (değişim bildirimi ve ekrandaki konum adı da buna bağlı).
 *
 * Bilinen bedel: adhan saatleri dakikaya yuvarlar; 13 sn'lik kayma bir saati yuvarlama
 * sınırından geçirirse o vakitteki bildirim en fazla 1 dk eski saatte kalır — ta ki bir
 * sonraki tam planlamaya (15 dk turu, açılış) kadar. Muhafız turu bunu zaten yakalar:
 * parmak izi yuvarlanmış vakit saatlerinden kurulur (`core/muhafiz/planParmakIzi.ts`).
 *
 * SAF: zaman ve vakit hesaplayıcısı enjekte edilebilir.
 */
import { Coordinates, PrayerTimes, Rounding } from 'adhan';
import { turkiyeHesapParametreleri } from '../vakit/hesapParametreleri';

export interface YaymaKoordinati {
    lat: number;
    lng: number;
}

export interface YaymaAdresi {
    il?: string | null;
    ilce?: string | null;
}

/** Bir koordinat için karşılaştırılacak vakit anları (ms) — sıra iki çağrıda AYNI olmalı. */
export type YaymaVakitHesaplayici = (koordinat: YaymaKoordinati, simdi: Date) => number[];

/** Vakitlerin "değişmedi" sayıldığı azami fark. */
export const YAYMA_VAKIT_TOLERANSI_MS = 60 * 1000;

/** Bugünün 6 vakti + yarının imsağı, YUVARLANMAMIŞ (dakika yuvarlaması kaymayı gizlemesin). */
export const varsayilanYaymaVakitleri: YaymaVakitHesaplayici = (koordinat, simdi) => {
    const params = turkiyeHesapParametreleri();
    params.rounding = Rounding.None;
    const koord = new Coordinates(koordinat.lat, koordinat.lng);
    const yarin = new Date(simdi);
    yarin.setDate(yarin.getDate() + 1);
    const bugun = new PrayerTimes(koord, simdi, params);
    const ertesi = new PrayerTimes(koord, yarin, params);
    return [bugun.fajr, bugun.sunrise, bugun.dhuhr, bugun.asr, bugun.maghrib, bugun.isha, ertesi.fajr].map((d) =>
        d.getTime()
    );
};

const adBilinir = (a: YaymaAdresi | null | undefined): a is YaymaAdresi =>
    !!a && typeof a.il === 'string' && a.il.trim().length > 0;

const ayniAdMi = (eski: YaymaAdresi | null | undefined, yeni: YaymaAdresi | null | undefined): boolean =>
    adBilinir(eski) &&
    adBilinir(yeni) &&
    eski.il!.trim() === yeni.il!.trim() &&
    (eski.ilce ?? '').trim() === (yeni.ilce ?? '').trim();

export interface YaymaKarariGirdisi {
    eski: YaymaKoordinati;
    yeni: YaymaKoordinati;
    eskiAdres: YaymaAdresi | null | undefined;
    yeniAdres: YaymaAdresi | null | undefined;
    simdi: Date;
    vakitHesapla?: YaymaVakitHesaplayici;
}

/** `true` → `konumDegistiUygula` çağrılmalı; `false` → yalnız koordinat + damga yazılır. */
export function konumYaymasiGerekliMi(girdi: YaymaKarariGirdisi): boolean {
    if (!ayniAdMi(girdi.eskiAdres, girdi.yeniAdres)) return true;
    const hesapla = girdi.vakitHesapla ?? varsayilanYaymaVakitleri;
    let eski: number[];
    let yeni: number[];
    try {
        eski = hesapla(girdi.eski, girdi.simdi);
        yeni = hesapla(girdi.yeni, girdi.simdi);
    } catch {
        return true;
    }
    if (eski.length === 0 || eski.length !== yeni.length) return true;
    return eski.some((e, i) => !Number.isFinite(e) || !Number.isFinite(yeni[i]) || Math.abs(e - yeni[i]) >= YAYMA_VAKIT_TOLERANSI_MS);
}
