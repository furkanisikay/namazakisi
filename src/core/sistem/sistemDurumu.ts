/**
 * Sistem koşulları (güç tasarrufu, veri tasarrufu, ağ, şarj, arka plan kısıtı) —
 * SAF çekirdek: native köprünün ham sözlüğünü doğrular ve "algıla → uyarla →
 * gerekirse kibarca bilgilendir" kararlarını verir. React/native import ETMEZ.
 *
 * TEMEL KURAL: HATIRLATMA GÜVENİLİRLİĞİNE DOKUNULMAZ. Bu modülü bildirim/alarm/anons
 * planlayan hiçbir servis içe aktarmaz (nöbetçi: `sistemPolitikasiSiniri.test.ts`).
 * Uyarlananlar yalnız ertelenebilir işlerdir: dekoratif animasyon, tek seferlik konum
 * ölçümünün doğruluğu, eşitleme, güncelleme kontrolü.
 *
 * "Bilinmiyor" (`null`) hiçbir zaman kısıt sayılmaz: köprüsüz eski build'de ya da
 * okunamayan alanda uygulama bugünkü gibi davranır (yanlış alarm, hiç uyarmamaktan kötü).
 */

export type AgTuru = 'wifi' | 'ethernet' | 'hucresel' | 'diger' | 'yok';

/**
 * Android Veri Tasarrufu (`getRestrictBackgroundStatus`) / iOS Düşük Veri Modu
 * (`NWPath.isConstrained`). `muaf`: Veri Tasarrufu açık ama kullanıcı bu uygulamaya
 * sınırsız veri izni vermiş (yalnız Android).
 */
export type VeriTasarrufu = 'kapali' | 'acik' | 'muaf';

/** Android uygulama bekleme kovası (`UsageStatsManager.getAppStandbyBucket`, API 28). */
export type BeklemeKovasi = 'aktif' | 'calismaSeti' | 'sik' | 'nadir' | 'kisitli' | 'diger';

/** iOS "Arka Planda Uygulama Yenileme" (`UIApplication.backgroundRefreshStatus`). */
export type ArkaPlanYenileme = 'acik' | 'kapali' | 'kisitli';

export interface SistemDurumu {
  platform: 'android' | 'ios' | null;
  /** Android Pil Tasarrufu / iOS Düşük Güç Modu. */
  gucTasarrufu: boolean | null;
  veriTasarrufu: VeriTasarrufu | null;
  /** Ölçülen (kotalı) ağ: Android `isActiveNetworkMetered`, iOS `isExpensive`. */
  olculuAg: boolean | null;
  agTuru: AgTuru | null;
  sarjda: boolean | null;
  pilYuzde: number | null;
  /** Android: kullanıcı uygulamayı "Kısıtlı" yaptı (`isBackgroundRestricted`). */
  arkaPlanKisitli: boolean | null;
  beklemeKovasi: BeklemeKovasi | null;
  /** iOS: arka planda yenileme. */
  arkaPlanYenileme: ArkaPlanYenileme | null;
}

export const BILINMEYEN_SISTEM_DURUMU: SistemDurumu = Object.freeze({
  platform: null,
  gucTasarrufu: null,
  veriTasarrufu: null,
  olculuAg: null,
  agTuru: null,
  sarjda: null,
  pilYuzde: null,
  arkaPlanKisitli: null,
  beklemeKovasi: null,
  arkaPlanYenileme: null,
});

const mantiksal = (x: unknown): boolean | null => (typeof x === 'boolean' ? x : null);

const birinden = <T extends string>(x: unknown, liste: readonly T[]): T | null =>
  typeof x === 'string' && (liste as readonly string[]).includes(x) ? (x as T) : null;

/** Android `RESTRICT_BACKGROUND_STATUS_*` (1 kapalı, 2 muaf, 3 açık) ya da iOS dizesi. */
function veriTasarrufuCoz(x: unknown): VeriTasarrufu | null {
  if (x === 1) return 'kapali';
  if (x === 2) return 'muaf';
  if (x === 3) return 'acik';
  return birinden(x, ['kapali', 'acik', 'muaf'] as const);
}

/** `UsageStatsManager.STANDBY_BUCKET_*` (10, 20, 30, 40, 45). Muaf (5) ve bilinmeyen → 'diger'. */
function kovaCoz(x: unknown): BeklemeKovasi | null {
  if (typeof x !== 'number' || !Number.isFinite(x)) return null;
  switch (x) {
    case 10:
      return 'aktif';
    case 20:
      return 'calismaSeti';
    case 30:
      return 'sik';
    case 40:
      return 'nadir';
    case 45:
      return 'kisitli';
    default:
      return 'diger';
  }
}

/** Native ham sözlüğünü doğrular; tanınmayan/eksik her alan `null` olur. Asla fırlatmaz. */
export function sistemDurumunuCoz(ham: unknown): SistemDurumu {
  if (!ham || typeof ham !== 'object') return { ...BILINMEYEN_SISTEM_DURUMU };
  const h = ham as Record<string, unknown>;
  const yuzde = typeof h.pilYuzde === 'number' && h.pilYuzde >= 0 && h.pilYuzde <= 100 ? Math.round(h.pilYuzde) : null;
  return {
    platform: birinden(h.platform, ['android', 'ios'] as const),
    gucTasarrufu: mantiksal(h.gucTasarrufu),
    veriTasarrufu: veriTasarrufuCoz(h.veriTasarrufu),
    olculuAg: mantiksal(h.olculuAg),
    agTuru: birinden(h.agTuru, ['wifi', 'ethernet', 'hucresel', 'diger', 'yok'] as const),
    sarjda: mantiksal(h.sarjda),
    pilYuzde: yuzde,
    arkaPlanKisitli: mantiksal(h.arkaPlanKisitli),
    beklemeKovasi: kovaCoz(h.beklemeKovasi),
    arkaPlanYenileme: birinden(h.arkaPlanYenileme, ['acik', 'kapali', 'kisitli'] as const),
  };
}

/** İki durum aynı mı? (Abonelere gereksiz yayın yapılmasın.) */
export function sistemDurumuEsitMi(a: SistemDurumu, b: SistemDurumu): boolean {
  return (Object.keys(a) as (keyof SistemDurumu)[]).every((k) => a[k] === b[k]);
}

// ---------------------------------------------------------------------------
// Politika
// ---------------------------------------------------------------------------

/** Wi-Fi ya da kablolu ve ölçülmeyen ağ. Ağ bilinmiyorsa `null`. */
export function sinirsizAgMi(d: SistemDurumu): boolean | null {
  if (d.agTuru === null) return null;
  if (d.agTuru !== 'wifi' && d.agTuru !== 'ethernet') return false;
  return d.olculuAg !== true;
}

/** Kullanıcı açıkça veri kısıtı istemiş mi? (Android Veri Tasarrufu / iOS Düşük Veri Modu). */
export function veriKisitliMi(d: SistemDurumu): boolean {
  return d.veriTasarrufu === 'acik';
}

/**
 * Dekoratif döngü/animasyonlar azaltılsın mı? Güç tasarrufu açıkken EVET (şarjdayken
 * de: kullanıcı modu bilerek açık tutuyor). Bilgi taşıyan canlı içerik (geri sayım)
 * bu kararın DIŞINDADIR (`dongu.ts > useEkranCanli`).
 */
export function dekoratifHareketAzaltilsinMi(d: SistemDurumu): boolean {
  return d.gucTasarrufu === true;
}

/** expo-location `Accuracy.Balanced` (≈100 m; şehir/geofence merkezi için yeterli). */
export const DENGELI_KONUM_DOGRULUGU = 3;

/**
 * Tek seferlik konum ölçümünün doğruluğu: güç tasarrufunda en fazla "dengeli" (GPS
 * yerine ağ/Wi-Fi konumu). Konum takibi geofence ile olay tabanlıdır; burada yalnız
 * çıkışta alınan TEK ölçüm hafifletilir — şehir değişimini yakalamak için yeterli.
 */
export function konumDogrulugunuSinirla(istenen: number, d: SistemDurumu): number {
  return d.gucTasarrufu === true ? Math.min(istenen, DENGELI_KONUM_DOGRULUGU) : istenen;
}

/** Otomatik (GitHub) güncelleme kontrolünün en fazla bu kadar ertelenmesine izin verilir. */
export const GUNCELLEME_ERTELEME_TAVANI_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Otomatik güncelleme kontrolü ölçülen ağda / veri tasarrufunda Wi-Fi'ye ertelensin mi?
 * Elle kontrol (`zorla`) ve hiç kontrol yapılmamış cihaz ERTELENMEZ; son kontrol bir
 * haftadan eskiyse de yapılır (güvenlik güncellemesi kaçmasın).
 */
export function guncellemeKontroluErtelensinMi(arg: {
  sistem: SistemDurumu;
  zorla: boolean;
  sonKontrolMs: number | null;
  simdiMs: number;
}): boolean {
  if (arg.zorla || arg.sonKontrolMs === null) return false;
  if (arg.simdiMs - arg.sonKontrolMs >= GUNCELLEME_ERTELEME_TAVANI_MS) return false;
  return veriKisitliMi(arg.sistem) || (arg.sistem.olculuAg === true && sinirsizAgMi(arg.sistem) === false);
}

/**
 * Android'in uygulamayı ARKA PLANDA kısıtladığı durum: kullanıcı "Kısıtlı" yaptı ya da
 * uygulama RESTRICTED bekleme kovasında (günde tek alarm, ağ kapalı). Hatırlatmalar
 * gecikebilir → kurulum sağlığı uyarır. Bilinmiyorsa `false`.
 */
export function arkaPlanKisitlanmisMi(d: SistemDurumu): boolean {
  return d.arkaPlanKisitli === true || d.beklemeKovasi === 'kisitli';
}

/** Ayarlar'daki durum çipi. */
export interface SistemCipi {
  ikon: string;
  metin: string;
  ton: 'bilgi' | 'uyari';
  /** Dokununca pil rehberi açılsın mı? */
  pilRehberi: boolean;
}

/**
 * Ayarlar'daki tek satırlık durum çipi (yoksa `null`). `pilMuaf`: Android pil
 * optimizasyonu muafiyeti (`null` = bilinmiyor). "Etkilenmez" yalnız gerçekten doğru
 * olduğunda söylenir: iOS'ta yerel bildirimler Düşük Güç Modu'ndan etkilenmez;
 * Android'de ancak uygulama pil kısıtından muafsa ve arka planda kısıtlı değilse.
 */
export function sistemCipi(d: SistemDurumu, pilMuaf: boolean | null): SistemCipi | null {
  if (d.gucTasarrufu === true) {
    if (d.platform === 'ios') {
      return {
        ikon: 'battery-quarter',
        metin: 'Düşük Güç Modu açık — hatırlatmalar etkilenmez',
        ton: 'bilgi',
        pilRehberi: false,
      };
    }
    if (pilMuaf === true && !arkaPlanKisitlanmisMi(d)) {
      return {
        ikon: 'battery-quarter',
        metin: 'Güç tasarrufu açık — hatırlatmalar etkilenmez',
        ton: 'bilgi',
        pilRehberi: false,
      };
    }
    return {
      ikon: 'battery-quarter',
      metin: 'Güç tasarrufu açık — hatırlatmalar gecikebilir',
      ton: 'uyari',
      pilRehberi: pilMuaf === false || arkaPlanKisitlanmisMi(d),
    };
  }
  if (veriKisitliMi(d)) {
    return {
      ikon: 'tachometer-alt',
      metin: d.platform === 'ios'
        ? 'Düşük Veri Modu açık — hatırlatmalar etkilenmez'
        : 'Veri tasarrufu açık — hatırlatmalar etkilenmez',
      ton: 'bilgi',
      pilRehberi: false,
    };
  }
  return null;
}
