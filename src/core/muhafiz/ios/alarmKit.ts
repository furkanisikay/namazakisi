/**
 * iOS GERÇEK ALARM — AlarmKit (iOS 26, issue #74) — SAF kurallar.
 *
 * `react-native`/`expo-*` IMPORT ETMEZ (ios/ saflık nöbetçisi). Native taraf
 * `modules/expo-muhafiz-alarmkit` (JS köprüsü + Foundation çekirdeği) ve ana hedefteki
 * `targets/muhafiz-alarmkit/` (AlarmKit çağrıları + App Intents) içindedir.
 *
 * İKİZ: Swift `modules/expo-muhafiz-alarmkit/ios/AlarmKurallari.swift`. İkisi de
 * `modules/expo-muhafiz-alarmkit/test/alarmkit-ornek.json` fikstürünü kabul eder
 * (JS testi üretir ve karşılaştırır, Swift testi `test/main.swift` doğrular). Bir kural
 * değişirse İKİSİNİ ve fikstürü birlikte güncelle.
 *
 * ---------------------------------------------------------------------------
 * KİMLİK: AlarmKit alarmı bir `UUID` ister; bizim kimliğimiz bildirimle AYNI
 * `muhafizBildirimIdOlustur` dizesidir (iptal zinciri simetrik kalsın). UUID kimlikten
 * DETERMİNİSTİK türetilir: aynı tetik yeniden planlanınca aynı UUID çıkar (çift alarm
 * imkânsız) ve eşleme kaybolsa bile kimlikten yeniden hesaplanabilir. Biçim RFC 9562
 * UUIDv8 ("özel"): 4 × FNV-1a 32 (girdi `"<i>|<kimlik>"`, UTF-16 kod birimleri —
 * kimlikler ASCII'dir) → 128 bit, sürüm nibble'ı 8, varyant `10xx`. Kriptografik DEĞİL;
 * yalnız kararlı ve çakışmaya dayanıklı bir eşleme.
 */
import type { VakitAdi } from '../../types';

/** AlarmKit izin/destek durumu — Swift `NamazAlarmPlanlayici.durum()` ile AYNI dizeler. */
export type AlarmKitDurumu = 'desteklenmiyor' | 'belirsiz' | 'izinli' | 'reddedildi';

export const ALARMKIT_DURUMLARI: readonly AlarmKitDurumu[] = ['desteklenmiyor', 'belirsiz', 'izinli', 'reddedildi'];

/** Ham köprü değerini güvenli duruma çevirir; bilinmeyen değer "desteklenmiyor"dur. */
export function alarmKitDurumunuCoz(ham: unknown): AlarmKitDurumu {
    return typeof ham === 'string' && (ALARMKIT_DURUMLARI as readonly string[]).includes(ham)
        ? (ham as AlarmKitDurumu)
        : 'desteklenmiyor';
}

function fnv1a32(girdi: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < girdi.length; i++) {
        h ^= girdi.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}

/** Kimlikten deterministik UUID (küçük harf, `8-4-4-4-12`). */
export function alarmKitUuid(kimlik: string): string {
    let hex = '';
    for (let i = 0; i < 4; i++) hex += fnv1a32(`${i}|${kimlik}`).toString(16).padStart(8, '0');
    const dizi = hex.split('');
    dizi[12] = '8';
    dizi[16] = ((parseInt(dizi[16], 16) & 0x3) | 0x8).toString(16);
    const h = dizi.join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const VAKIT_KIMLIGI = /^muhafiz_\d{4}-\d{2}-\d{2}_vakit_[a-z]+(?:_|$)/;
const NAFILE_KIMLIGI = /^nafile_\d{4}-\d{2}-\d{2}_(kusluk|evvabin|teheccud)_[^_]+$/;

/**
 * Alarmın TÜRÜ kimlikten (ortak hatırlatma yüzeyleri, plan §4.2) — Swift
 * `AlarmKurallari.alarmTuru`, ortak fikstür `alarmkit-ornek.json > turler`:
 * muhafız uzayı (plan, yatış) → `vakit`; nafile → `nafile`; geri kalan
 * (cuma, camiye gitme, takvim, çoklu muhasebe) → `bilgi`. Bilgi alarmında İKİNCİL DÜĞME
 * YOKTUR (yalnız sistemin "Durdur"u): vakit girmeden çalar, "Kıldım" FARZ'ı yazardı.
 *
 * Vakit ve nafile alarmında ikincil düğme daima "Kıldım"dır (Swift `NamazAlarmPlanlayici`).
 * ERTELE YOK (sahip kararı 2026-10-19, eski #289): erteleyen kişi unutur, son dakikada
 * abdest/mescit yetişmez. Durdurmak namazı KILINDI SAYMAZ (yalnız susturur).
 */
export function alarmKitTuru(kimlik: string): 'vakit' | 'nafile' | 'bilgi' {
    if (VAKIT_KIMLIGI.test(kimlik)) return 'vakit';
    if (NAFILE_KIMLIGI.test(kimlik)) return 'nafile';
    return 'bilgi';
}

/** Native `planla`ya giden yük — Swift `AlarmKaydi` ile AYNI alanlar. */
export interface AlarmKitYuku {
    kimlik: string;
    tetikMs: number;
    baslik: string;
    /** Muhafız vakti (`imsak`, `ogle`…) — "Kıldım" kuyruğunun KAYIT vakit kodu. */
    vakit: string;
    /** Vaktin ait olduğu namaz günü (YYYY-MM-DD) — kimlikle aynı. */
    tarih: string;
    cikisMs: number;
}

export interface AlarmKitYukuGirdisi {
    kimlik: string;
    tetikMs: number;
    baslik: string;
    vakit: VakitAdi;
    tarih: string;
    /** Vaktin çıkışı (ms); bilinmiyorsa 0 yazılır. */
    cikisMs?: number | null;
}

/** Teslimden native yükü kurar. */
export function alarmKitYukuOlustur(g: AlarmKitYukuGirdisi): AlarmKitYuku {
    const cikisMs = typeof g.cikisMs === 'number' && Number.isFinite(g.cikisMs) ? g.cikisMs : null;
    return {
        kimlik: g.kimlik,
        tetikMs: g.tetikMs,
        baslik: g.baslik,
        vakit: g.vakit,
        tarih: g.tarih,
        cikisMs: cikisMs ?? 0,
    };
}

/** Native kayıt listesinin bir öğesi (yalnız sistemde HÂLÂ kurulu alarmlar). */
export interface AlarmKitKaydi {
    kimlik: string;
    tetikMs: number;
    /** O an ÇALIYOR mu (AlarmKit `alerting`)? Yalnız `true` iken yazılır. */
    caliyor?: true;
}

/** Ham köprü listesini doğrular (bozuk öğe sessizce düşer). */
export function alarmKitKayitlariniCoz(ham: unknown): AlarmKitKaydi[] {
    let dizi: unknown = ham;
    if (typeof ham === 'string') {
        try {
            dizi = JSON.parse(ham);
        } catch {
            return [];
        }
    }
    if (!Array.isArray(dizi)) return [];
    const sonuc: AlarmKitKaydi[] = [];
    for (const o of dizi) {
        if (!o || typeof o !== 'object') continue;
        const { kimlik, tetikMs, caliyor } = o as { kimlik?: unknown; tetikMs?: unknown; caliyor?: unknown };
        if (typeof kimlik !== 'string' || typeof tetikMs !== 'number' || !Number.isFinite(tetikMs)) continue;
        sonuc.push(caliyor === true ? { kimlik, tetikMs, caliyor: true } : { kimlik, tetikMs });
    }
    return sonuc;
}

/**
 * İptal edilecek alarm kimlikleri. PLANLAMA turu (`calaniDurdur === false`: yeniden
 * planlama, muhafız kapatma) o an ÇALAN alarma DOKUNMAZ — Android
 * kuralının ikizi ("planlama turu çalan alarmı susturmaz"); 15 dk'lık arka plan turu ya
 * da ekrandaki bir ayar değişikliği kullanıcının uyanmak için kurduğu alarmı
 * kesmemeli. Yalnız "Kıldım" (`true`) çalanı da susturur. Swift ikizi
 * `AlarmKurallari.iptalSecimi` (ortak fikstür `alarmkit-ornek.json > iptalSecimi`);
 * native taraf iptal anında aynı kuralı GÜNCEL durumla bir kez daha uygular (okuma ile
 * iptal arasında çalmaya başlayan alarm).
 */
export function alarmKitIptalSecimi(
    kayitlar: readonly AlarmKitKaydi[],
    secici: (kimlik: string) => boolean,
    calaniDurdur: boolean
): string[] {
    return kayitlar.filter((k) => secici(k.kimlik) && (calaniDurdur || k.caliyor !== true)).map((k) => k.kimlik);
}
