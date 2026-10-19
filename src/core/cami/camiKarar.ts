/**
 * Camideyim karar katmanı — SAF (Kotlin ikizi: `cekirdek/CamiKarar.kt`).
 *
 * İKİ AŞAMA (Fable kararı):
 *  1. Telefon 100 m'lik çevrede `bekleme` dakikası kaldığını bildirir (DWELL).
 *  2. Önce VAKİT KAPISI sorulur — kapı dışındaysa konum BİLE ölçülmez (pil).
 *     Kapı içindeyse TEK hassas ölçüm alınır; doğruluk ≤30 m değilse "şüpheli"
 *     → mod AÇILMAZ (yanlışlıkla sessize almaktansa açmamak). Sonra alan testi.
 *
 * Kararı native verir; bu dosya ortak fikstürle (`cami-karar-tablosu.json`)
 * Kotlin'le birebir aynı sonucu verdiğini kanıtlar.
 */
import {
    AZAMI_DOGRULUK_M,
    CAMIDE_AZAMI_DK,
    CAMIDE_CUMA_AZAMI_DK,
    EK_YER_KOTASI,
    FARZ_VAKITLER,
    GEOFENCE_ALAN_PAYI_M,
    GEOFENCE_YARICAPI_M,
    IZLENEN_CAMI_SAYISI,
    KAPI_CUMA_ONCE_DK,
    KAPI_CUMA_SONRA_DK,
    KAPI_ONCE_DK,
    KAPI_SONRA_DK,
    KONUM_TAZELIK_MS,
    YENILEME_BEKLEMESI_MS,
    YENILEME_ICERI_PAY_M,
    YENILEME_MAX_M,
    YENILEME_MIN_M,
    type CamiKaydi,
    type CamiKarari,
    type FarzVakit,
    type IzlenenYer,
    type KapiPenceresi,
    type OlculenKonum,
    type YerKaydi,
} from './camiTipleri';
import { alanDisiUzaklikM, alanYaricapiM, mesafeM } from './geometri';

const DK = 60_000;

/** Bir günün farz vakit girişleri (ms ya da Date). */
export interface GunGirisleri {
    tarih: string;
    cuma: boolean;
    girisler: Record<FarzVakit, number>;
}

/** Vakit kapısı pencereleri: giriş −20…+60 dk; cuma öğlesi −90…+90 dk. */
export function kapiPencereleriniHesapla(gunler: readonly GunGirisleri[]): KapiPenceresi[] {
    const sonuc: KapiPenceresi[] = [];
    for (const gun of gunler) {
        for (const vakit of FARZ_VAKITLER) {
            const giris = gun.girisler[vakit];
            if (!Number.isFinite(giris)) continue;
            const cumaOglesi = gun.cuma && vakit === 'ogle';
            sonuc.push({
                bas: giris - (cumaOglesi ? KAPI_CUMA_ONCE_DK : KAPI_ONCE_DK) * DK,
                son: giris + (cumaOglesi ? KAPI_CUMA_SONRA_DK : KAPI_SONRA_DK) * DK,
                vakit,
                tarih: gun.tarih,
                cuma: cumaOglesi,
            });
        }
    }
    return sonuc.sort((a, b) => a.bas - b.bas);
}

/** Şu an hangi kapı penceresinde? Çakışmada GİRİŞİ en yakın olan (en geç başlayan) kazanır. */
export function kapiPenceresiniBul(simdiMs: number, pencereler: readonly KapiPenceresi[]): KapiPenceresi | null {
    let bulunan: KapiPenceresi | null = null;
    for (const p of pencereler) {
        if (simdiMs >= p.bas && simdiMs <= p.son && (!bulunan || p.bas > bulunan.bas)) bulunan = p;
    }
    return bulunan;
}

export interface KararGirdisi {
    simdiMs: number;
    vakitKapisiAcik: boolean;
    pencereler: readonly KapiPenceresi[];
    /** Kapı geçilmeden ÖLÇÜLMEZ; null = ölçüm alınamadı. */
    konum: OlculenKonum | null;
    /** DWELL olayını üreten (ya da izlenen) adaylar. */
    adaylar: readonly IzlenenYer[];
    haric: readonly string[];
}

/** Aşama 2'nin ilk sorusu — native bu false iken konum İSTEMEZ. */
export function kapiGectiMi(g: Pick<KararGirdisi, 'simdiMs' | 'vakitKapisiAcik' | 'pencereler'>): boolean {
    return !g.vakitKapisiAcik || kapiPenceresiniBul(g.simdiMs, g.pencereler) != null;
}

export function camiKarariVer(g: KararGirdisi): CamiKarari {
    const pencere = kapiPenceresiniBul(g.simdiMs, g.pencereler);
    if (g.vakitKapisiAcik && !pencere) return { sonuc: 'vakitDisi' };
    const zaman = pencere ? { vakit: pencere.vakit, tarih: pencere.tarih, cuma: pencere.cuma } : {};

    if (!g.konum || !Number.isFinite(g.konum.lat) || !Number.isFinite(g.konum.lng)) {
        return { sonuc: 'konumYok', ...zaman };
    }
    if (!(g.konum.dogrulukM >= 0) || g.konum.dogrulukM > AZAMI_DOGRULUK_M) {
        return { sonuc: 'supheli', ...zaman };
    }

    const haric = new Set(g.haric);
    let enYakin: { id: string; uzaklik: number } | null = null;
    for (const yer of g.adaylar) {
        if (haric.has(yer.id)) continue;
        const uzaklik = alanDisiUzaklikM(yer, g.konum.lat, g.konum.lng);
        if (!enYakin || uzaklik < enYakin.uzaklik) enYakin = { id: yer.id, uzaklik };
    }
    if (enYakin && enYakin.uzaklik === 0) return { sonuc: 'camide', yerId: enYakin.id, ...zaman };
    return {
        sonuc: 'disarida',
        ...(enYakin ? { yerId: enYakin.id, mesafeM: Math.round(enYakin.uzaklik) } : {}),
        ...zaman,
    };
}

/** "Camidesiniz" hâlinin bitmesi gereken an (ms) — çıkış olayı gelmese de. */
export function camideBitisMs(girisMs: number, cuma: boolean): number {
    return girisMs + (cuma ? CAMIDE_CUMA_AZAMI_DK : CAMIDE_AZAMI_DK) * DK;
}

/** Yenileme çemberi yarıçapı: K'ıncı caminin uzaklığı −150 m, [500 m, 5 km]. */
export function yenilemeYaricapiM(kinciMesafeM: number | null): number {
    if (kinciMesafeM == null || !Number.isFinite(kinciMesafeM)) return YENILEME_MAX_M;
    return Math.min(YENILEME_MAX_M, Math.max(YENILEME_MIN_M, Math.round(kinciMesafeM - YENILEME_ICERI_PAY_M)));
}

export type YenilemeKarari = 'yenile' | 'bayatKonum' | 'cokSik';

/**
 * Yenileme çemberinden ÇIKIŞ olayında yeniden merkezlenmeli mi? (sıkı döngü dersi)
 * Yalnız TAZE konuma merkezlenir (merkez = bulunduğun nokta ⟹ içindesin ⟹
 * tetiklenemez) ve patlamalar arasında asgari bekleme aranır.
 */
export function yenilemeKarari(
    simdiMs: number,
    sonYenilemeMs: number | null,
    konumZamaniMs: number | null
): YenilemeKarari {
    if (sonYenilemeMs != null && simdiMs - sonYenilemeMs >= 0 && simdiMs - sonYenilemeMs < YENILEME_BEKLEMESI_MS) {
        return 'cokSik';
    }
    if (konumZamaniMs == null || !Number.isFinite(konumZamaniMs)) return 'bayatKonum';
    const yas = simdiMs - konumZamaniMs;
    if (yas < 0 || yas > KONUM_TAZELIK_MS) return 'bayatKonum';
    return 'yenile';
}

/** Telefona bildirilecek geofence yarıçapı (m): büyük alanlı yerde pay bırakılır. */
export function geofenceYaricapiM(yer: Pick<IzlenenYer, 'ozelAlanM' | 'yaricapM' | 'ozelOlcek'>): number {
    return Math.max(GEOFENCE_YARICAPI_M, alanYaricapiM(yer) + GEOFENCE_ALAN_PAYI_M);
}

/**
 * İzlenecek yerleri seçer: en yakın K (hariç tutulanlar atlanır) + favoriler ve
 * kullanıcı yerleri (mesafeden bağımsız, ek kotayla). Kullanıcının alan ayarı
 * `ozelAlanM`, bina sınırı ölçeği `ozelOlcek` olarak işlenir.
 *
 * @param enYakinOsm mesafeye göre sıralı OSM kayıtları (hariç payı için K'dan fazla istenmeli)
 */
export function izlenecekleriSec(
    konum: { lat: number; lng: number },
    enYakinOsm: readonly CamiKaydi[],
    yerler: Readonly<Record<string, YerKaydi>>,
    k: number = IZLENEN_CAMI_SAYISI,
    ekKota: number = EK_YER_KOTASI
): { izlenenler: IzlenenYer[]; kinciMesafeM: number | null } {
    const izlenenler: IzlenenYer[] = [];
    const eklenen = new Set<string>();
    let kinciMesafeM: number | null = null;

    for (const kayit of enYakinOsm) {
        if (izlenenler.length >= k) break;
        const ayar = yerler[kayit.id];
        if (ayar?.durum === 'haric') continue;
        izlenenler.push({
            ...kayit,
            ozelAlanM: ayar?.alanM ?? null,
            // Ölçek yalnız poligonlu kayıtta ve daire seçilmemişken anlamlıdır.
            ozelOlcek: ayar?.alanM == null && kayit.poligon && ayar?.olcek != null ? ayar.olcek : null,
            kaynak: 'osm',
            favori: ayar?.durum === 'favori',
        });
        eklenen.add(kayit.id);
        if (izlenenler.length === k) kinciMesafeM = mesafeM(konum.lat, konum.lng, kayit.lat, kayit.lng);
    }

    const ekler: { yer: IzlenenYer; mesafe: number }[] = [];
    for (const [id, ayar] of Object.entries(yerler)) {
        if (eklenen.has(id) || ayar.durum === 'haric') continue;
        if (!(ayar.kendi || ayar.durum === 'favori')) continue;
        if (typeof ayar.lat !== 'number' || typeof ayar.lng !== 'number') continue;
        ekler.push({
            yer: {
                id,
                ad: ayar.ad ?? '',
                lat: ayar.lat,
                lng: ayar.lng,
                yaricapM: 0,
                poligon: null,
                ozelAlanM: ayar.alanM ?? null,
                kaynak: ayar.kendi ? 'kendi' : 'osm',
                favori: ayar.durum === 'favori',
            },
            mesafe: mesafeM(konum.lat, konum.lng, ayar.lat, ayar.lng),
        });
    }
    ekler.sort((a, b) => a.mesafe - b.mesafe || (a.yer.id < b.yer.id ? -1 : 1));
    for (const e of ekler.slice(0, ekKota)) izlenenler.push(e.yer);

    return { izlenenler, kinciMesafeM };
}
