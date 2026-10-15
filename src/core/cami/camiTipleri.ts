/**
 * Camideyim (issue #297) — ortak tipler ve sabitler.
 *
 * KARAR KOTLIN'DE VERİLİR (`modules/expo-cami-geofence`, `goAsync()` içinde) —
 * uygulama süreci ölüyken de çalışmak zorunda. Bu klasör AYNI kuralların JS
 * ikizidir: ayar ekranı/önizleme ve sözleşme testleri için. İki taraf ortak
 * fikstürlerle sınanır (`modules/expo-cami-geofence/android/src/test/resources/`):
 * biri değişip diğeri değişmezse bir taraf kırılır (wear `ornek-yuk.json` deseni).
 *
 * Buradaki sayıların Kotlin karşılıkları `cekirdek/CamiSabitleri.kt`'dedir —
 * birini değiştirirken ötekini de değiştirin.
 */

/** Telefonun ilk uyandığı çevre (m). Android geofence'i 100 m altında güvenilir değil. */
export const GEOFENCE_YARICAPI_M = 100;
/** Algılama alanı büyük olan yerde geofence alanı bu kadar pay bırakır (m). */
export const GEOFENCE_ALAN_PAYI_M = 50;

/** Node (nokta) kayıtlarının varsayılan alanı (m). */
export const VARSAYILAN_ALAN_M = 25;
/** Kullanıcının seçebileceği alan sınırları (m) ve adımı. */
export const ALAN_MIN_M = 10;
export const ALAN_MAX_M = 150;
export const ALAN_ADIM_M = 5;
/** "Bulunduğum yeri ekle" ile eklenen yerin başlangıç alanı (m). */
export const KULLANICI_YERI_ALAN_M = 20;
/** Bina poligonunun dışına taşan avlu/giriş için tolerans (m). */
export const POLIGON_TAMPON_M = 10;

/** Hassas ölçümün kabul edildiği en kaba doğruluk (m). Daha kabası "şüpheli" → mod AÇILMAZ. */
export const AZAMI_DOGRULUK_M = 30;

/** Aynı anda izlenen en yakın OSM camisi sayısı. */
export const IZLENEN_CAMI_SAYISI = 25;
/** Favori + kullanıcı yerleri için ek kota (100 geofence sınırı: 1 şehir + 25 + 40 + 1 yenileme). */
export const EK_YER_KOTASI = 40;

/** Yenileme çemberi: K'ıncı caminin uzaklığından bu kadar içeride (m). */
export const YENILEME_ICERI_PAY_M = 150;
export const YENILEME_MIN_M = 500;
export const YENILEME_MAX_M = 5000;
/** En yakın sorgunun en uzak arama mesafesi (m). */
export const ARAMA_AZAMI_M = 50_000;

/** DWELL bekleme süresi (dk). */
export const BEKLEME_VARSAYILAN_DK = 3;
export const BEKLEME_MIN_DK = 2;
export const BEKLEME_MAX_DK = 20;

/** Vakit kapısı: girişten önce/sonra (dk). Cuma öğlesi daha geniş (hutbe + cemaat). */
export const KAPI_ONCE_DK = 20;
export const KAPI_SONRA_DK = 60;
export const KAPI_CUMA_ONCE_DK = 90;
export const KAPI_CUMA_SONRA_DK = 90;

/** "Camidesiniz" hâlinin üst süresi (dk): çıkış olayı gelmese de mod kapanır. */
export const CAMIDE_AZAMI_DK = 90;
export const CAMIDE_CUMA_AZAMI_DK = 150;

/**
 * GÜVEN PUANI (Faz 2) — "camide" kararından SONRA, modun otomatik mi açılacağını,
 * sorulacağını mı yoksa hiçbir şey yapılmayacağını mı belirler (`guvenPuani.ts`).
 * Kotlin ikizi `CamiSabitleri.kt`; ortak fikstür `guven-puani-tablosu.json`.
 */
/** Ezan girişine yakınlık penceresi (dk): girişten 10 dk önce → 40 dk sonra "yüksek". */
export const GUVEN_EZAN_ONCE_DK = 10;
export const GUVEN_EZAN_SONRA_DK = 40;
/** Ölçülen hız (m/s): üstü araç/yürüyüş → otomatik açma YOK. */
export const HIZ_HAREKETLI_MPS = 1.5;
/** Altı "duruyor" sayılır (küçük artı puan). */
export const HIZ_DURGUN_MPS = 0.5;
/** Karar eşikleri: puan ≥ OTOMATIK → aç, ≥ SOR → sor, altı → hiçbir şey. */
export const GUVEN_OTOMATIK_ESIK = 75;
export const GUVEN_SOR_ESIK = 50;
/** "Camide misiniz?" sorusunun en uzun geçerliliği (dk) — vakit penceresi daha erken biterse o. */
export const SORU_AZAMI_DK = 30;

/** Yenileme çemberinin taze konum sınırı ve patlama koruması (şehir takibiyle AYNI değerler). */
export const KONUM_TAZELIK_MS = 2 * 60 * 1000;
export const YENILEME_BEKLEMESI_MS = 60 * 1000;

export type FarzVakit = 'imsak' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';
export const FARZ_VAKITLER: readonly FarzVakit[] = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];

/** [enlem, boylam] çifti. */
export type LatLng = readonly [number, number];

/** Veri dosyasından okunmuş bir kayıt (OSM). */
export interface CamiKaydi {
    /** Kalıcı kimlik: `osm:<n|w|r><id>` */
    id: string;
    ad: string;
    lat: number;
    lng: number;
    /** 0 = varsayılan (node) */
    yaricapM: number;
    /** Basitleştirilmiş dış sınır (≤12 köşe) ya da null */
    poligon: LatLng[] | null;
}

/**
 * İzlenen (geofence'i kurulan) yer — karar fonksiyonunun girdisi.
 * Kullanıcının alan ayarı burada `ozelAlanM` olarak gelir ve poligonu ezer.
 */
export interface IzlenenYer {
    id: string;
    ad: string;
    lat: number;
    lng: number;
    yaricapM: number;
    poligon: LatLng[] | null;
    ozelAlanM: number | null;
    kaynak: 'osm' | 'kendi';
    favori: boolean;
}

export type YerDurumu = 'normal' | 'favori' | 'haric';

/**
 * Kullanıcının bir yere dair ayarı. Favori ve kendi yerler mesafeden bağımsız
 * izlendiği için konum/ad anlık görüntüsü de saklanır.
 */
export interface YerKaydi {
    durum: YerDurumu;
    alanM?: number;
    ad?: string;
    lat?: number;
    lng?: number;
    /** Kullanıcının eklediği yer (mescit, iş yeri…) */
    kendi?: boolean;
}

/** Vakit kapısı penceresi (ms). */
export interface KapiPenceresi {
    bas: number;
    son: number;
    vakit: FarzVakit;
    /** Vaktin ait olduğu gün (YYYY-MM-DD) — "Kıldım" bu güne yazılır. */
    tarih: string;
    cuma: boolean;
}

export interface OlculenKonum {
    lat: number;
    lng: number;
    dogrulukM: number;
}

export type KararSonucu = 'camide' | 'vakitDisi' | 'konumYok' | 'supheli' | 'disarida';

export interface CamiKarari {
    sonuc: KararSonucu;
    yerId?: string;
    vakit?: FarzVakit;
    tarih?: string;
    cuma?: boolean;
    /** En yakın adayın alanına uzaklığı (m) — "neden algılanmadı" açıklaması için. */
    mesafeM?: number;
}
