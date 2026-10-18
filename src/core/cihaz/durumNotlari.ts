/**
 * Cihaz durumu → kullanıcıya gösterilecek TEK satır (ya da hiçbir şey) — SAF.
 *
 * `alarmNotlari` deseninin genelleştirilmiş hâli. İlke ("ölçebildiğini sorma"):
 *   - koşul sağlanıyor → `null` (söylenecek bir şey yok),
 *   - sağlanmıyor ve düzeltilebilir → `{ tip, metin, eylem }` (sebep + tek düğme),
 *   - bu cihazda olmayan bir yetenek → `null` (ekran o seçeneği soluk gösterir; satır yazmaz),
 *   - durum okunamadı (`null`) → `null` (SUS — yanlış uyarı, hiç uyarmamaktan kötüdür).
 *
 * Metinler kibar "siz", teknik terimsiz; tek cümle. Eylem anahtarı presentation
 * katmanında (`durumEylemleri`) gerçek sistem çağrısına eşlenir — çekirdek native'e
 * bağımlı olmaz.
 */
import type { IsletimSistemiSurumu } from './surum';
import type { AlarmKitDurumu } from '../muhafiz/ios/alarmKit';

/** Okunan izin durumu: `null` = bilinmiyor. */
export type IzinDurumu = 'verildi' | 'sorulabilir' | 'reddedildi';

export type CanliGuncellemeDurumu = 'acik' | 'kapali' | 'desteklenmiyor';

/** Android Wear OS eşli saat durumu: `yok` = Play Hizmetleri/Wear API yok. */
export type EsliSaatDurumu = 'esli' | 'esliDegil' | 'yok';

/**
 * Tüm cihaz/sistem durumunun tek nesnesi. Her alan `null` olabilir (bilinmiyor).
 * `useCihazDurumu` doldurur; saf yardımcılar (`durumNotu`) yalnız bunu okur.
 */
export interface CihazDurumu {
    surum: IsletimSistemiSurumu | null;
    samsung: boolean | null;
    bildirimIzni: IzinDurumu | null;
    konumIzni: IzinDurumu | null;
    takvimIzni: IzinDurumu | null;
    tamAlarm: boolean | null;
    tamEkran: boolean | null;
    pilMuaf: boolean | null;
    dndErisimi: boolean | null;
    alarmKit: AlarmKitDurumu | null;
    canliGuncelleme: CanliGuncellemeDurumu | null;
    turkceTts: boolean | null;
    esliSaat: EsliSaatDurumu | null;
    /** Android alarm ses düzeyi 0'dan büyük mü (STREAM_ALARM). */
    alarmSesiAcik: boolean | null;
    /** Ana ekrana en az bir uygulama widget'ı eklenmiş mi. */
    widgetEkli: boolean | null;
    /** Cihazda menteşe algılayıcısı var mı (katlanabilir). */
    mentese: boolean | null;
}

export const BOS_CIHAZ_DURUMU: CihazDurumu = {
    surum: null,
    samsung: null,
    bildirimIzni: null,
    konumIzni: null,
    takvimIzni: null,
    tamAlarm: null,
    tamEkran: null,
    pilMuaf: null,
    dndErisimi: null,
    alarmKit: null,
    canliGuncelleme: null,
    turkceTts: null,
    esliSaat: null,
    alarmSesiAcik: null,
    widgetEkli: null,
    mentese: null,
};

/** Satırın tek düğmesinin yaptığı iş; gerçek çağrı `presentation/servisler/durumEylemleri`. */
export type DurumEylemi =
    | 'bildirimIzni'
    | 'konumIzni'
    | 'takvimIzni'
    | 'tamAlarm'
    | 'tamEkran'
    | 'pil'
    | 'dnd'
    | 'uygulamaAyarlari'
    | 'ttsIndir'
    | 'alarmIzni'
    | 'sesAyarlari'
    | 'canliGuncellemeAyari';

export interface DurumNotu {
    tip: 'uyari' | 'bilgi';
    metin: string;
    eylem?: DurumEylemi;
    /** Düğme metni; verilmezse eylemin varsayılan etiketi. */
    eylemEtiketi?: string;
}

/** Varsayılan düğme etiketleri (1–3 kelime, sonucu söyleyen fiil). */
export const EYLEM_ETIKETLERI: Record<DurumEylemi, string> = {
    bildirimIzni: 'İzin verin',
    konumIzni: 'İzin verin',
    takvimIzni: 'İzin verin',
    tamAlarm: 'Açın',
    tamEkran: 'Açın',
    pil: 'Ayarlayın',
    dnd: 'Erişim verin',
    uygulamaAyarlari: 'Ayarları açın',
    ttsIndir: 'Türkçe sesi indirin',
    alarmIzni: 'İzin verin',
    sesAyarlari: 'Ses ayarları',
    canliGuncellemeAyari: 'Ayarları açın',
};

export type DurumKosulu =
    | 'bildirimIzni'
    | 'konumIzni'
    | 'takvimIzni'
    | 'tamAlarm'
    | 'tamEkran'
    | 'pil'
    | 'dndErisimi'
    | 'turkceTts'
    | 'alarmSesi'
    | 'canliGuncelleme';

/**
 * İzin satırı: kalıcı red → uygulama ayarları; tekrar sorulabilir → izin isteği.
 * `verildi` ve bilinmiyor → `null`.
 */
function izinNotu(durum: IzinDurumu | null, metin: string, istekEylemi: DurumEylemi): DurumNotu | null {
    if (durum === 'sorulabilir') return { tip: 'uyari', metin, eylem: istekEylemi };
    if (durum === 'reddedildi') return { tip: 'uyari', metin, eylem: 'uygulamaAyarlari' };
    return null;
}

/**
 * Tek koşulun satırı. Android'e özgü koşullar iOS'ta (ve tersi) daima `null`.
 */
export function durumNotu(kosul: DurumKosulu, d: CihazDurumu): DurumNotu | null {
    const android = d.surum?.platform === 'android';
    switch (kosul) {
        case 'bildirimIzni':
            return izinNotu(d.bildirimIzni, 'Bildirim izni kapalı; hatırlatmalar gelmez.', 'bildirimIzni');
        case 'konumIzni':
            return izinNotu(d.konumIzni, 'Konum izni kapalı; yönü bulmak için konumunuz gerekiyor.', 'konumIzni');
        case 'takvimIzni':
            return izinNotu(d.takvimIzni, 'Takvim izni kapalı.', 'takvimIzni');
        case 'tamAlarm':
            return android && d.tamAlarm === false
                ? { tip: 'uyari', metin: 'Tam saatinde alarm izni kapalı; hatırlatmalar gecikebilir.', eylem: 'tamAlarm' }
                : null;
        case 'tamEkran':
            return android && d.tamEkran === false
                ? { tip: 'uyari', metin: 'Kilit ekranında tam ekran açılma izni kapalı.', eylem: 'tamEkran' }
                : null;
        case 'pil':
            return android && d.pilMuaf === false
                ? { tip: 'uyari', metin: 'Pil kısıtlaması hatırlatmaları geciktirebilir.', eylem: 'pil' }
                : null;
        case 'dndErisimi':
            return android && d.dndErisimi === false
                ? { tip: 'uyari', metin: 'Rahatsız Etmeyin açıkken bu bildirim susar.', eylem: 'dnd' }
                : null;
        case 'turkceTts':
            if (d.turkceTts !== false) return null;
            return android
                ? { tip: 'uyari', metin: 'Türkçe konuşma paketi bulunamadı; sesli okuma duyulmayabilir.', eylem: 'ttsIndir' }
                : {
                      tip: 'uyari',
                      // Tam menü yolu iOS sürümüne göre değişir (Seslendirme / Konuşulan İçerik…)
                      // → yol yazılmaz, yalnız bölüm adı.
                      metin: 'Türkçe konuşma paketi bulunamadı; sesli okuma duyulmayabilir. Erişilebilirlik ayarlarından Türkçe ses indirin.',
                  };
        case 'alarmSesi':
            return android && d.alarmSesiAcik === false
                ? { tip: 'uyari', metin: 'Alarm ses düzeyiniz kapalı; uyandırma duyulmaz.', eylem: 'sesAyarlari' }
                : null;
        case 'canliGuncelleme':
            return android && d.canliGuncelleme === 'kapali'
                ? { tip: 'uyari', metin: 'Canlı güncellemeler kapalı; sayaç durum çubuğunda görünmez.', eylem: 'canliGuncellemeAyari' }
                : null;
        default:
            return null;
    }
}

/** Birden çok koşulun satırları (sırası korunur, `null`lar atılır). */
export function durumNotlari(kosullar: readonly DurumKosulu[], d: CihazDurumu): DurumNotu[] {
    const sonuc: DurumNotu[] = [];
    for (const k of kosullar) {
        const not = durumNotu(k, d);
        if (not) sonuc.push(not);
    }
    return sonuc;
}

/**
 * Durum çubuğunda canlı sayacın görünebileceği yerin adı: Samsung'da "Now Bar",
 * diğerlerinde "durum çubuğu" (Now Bar yalnız Samsung'da var). Samsung bilinmiyorsa
 * genel ad.
 */
export function canliYuzeyAdi(samsung: boolean | null): string {
    return samsung === true ? "durum çubuğunda ve Now Bar'da" : 'durum çubuğunda';
}
