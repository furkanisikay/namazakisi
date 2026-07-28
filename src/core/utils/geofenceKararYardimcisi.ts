/**
 * Geofence (bölge izleme) karar yardımcısı
 *
 * Konum takibi olay tabanlıdır: OS'u periyodik uyandırmak yerine, kullanıcı
 * kayıtlı çemberden ÇIKINCA tetiklenir. Bu dosya o olayın nasıl karşılanacağına
 * dair SAF kararları barındırır — expo/native bağımlılığı yoktur, doğrudan test
 * edilebilir.
 *
 * NEDEN AYRI DOSYA: Buradaki iki kural, geofencing'e geçişin tek gerçek riskini
 * (aşağıdaki sıkı döngü) kapatır. Servise gömülü kalsalar davranışları ancak
 * native köprü mock'lanarak sınanabilirdi; saf tutulunca nöbetçi test doğrudan
 * kuralı hedefler.
 *
 * SIKI DÖNGÜ RİSKİ (expo-location kaynağından doğrulandı):
 * `GeofencingTaskConsumer.prepareGeofencingRequest` şunu SABİT kodlar ve
 * ayarlanamaz:
 *
 *     .setInitialTrigger(INITIAL_TRIGGER_ENTER or INITIAL_TRIGGER_EXIT)
 *
 * `INITIAL_TRIGGER_EXIT`, bölge eklendiği anda cihaz çemberin DIŞINDAYSA anında
 * bir ÇIKIŞ olayı üretir. Dolayısıyla "çıkış → konum al → yeni merkeze yeniden
 * kaydet" akışında, alınan konum bayat/başarısız olur da çemberi yine eski
 * merkeze kurarsak, hâlâ dışında oluruz → anında yeni çıkış → sonsuz döngü.
 * Her tur reverse-geocode (ağ) + tüm muhafız bildirimlerinin yeniden
 * planlanmasını tetiklerdi.
 *
 * İKİ KATMANLI KORUMA:
 *  1. `konumTazeMi` — yalnızca TAZE bir konuma yeniden merkezlenir. Taze konumda
 *     merkez = bulunduğumuz nokta olduğu için çemberin İÇİNDEYİZDİR; tanım gereği
 *     `INITIAL_TRIGGER_EXIT` tetiklenemez, döngü başlayamaz.
 *  2. `olayIslenebilirMi` — arka arkaya gelen olaylar için asgari bekleme. Taze
 *     zaman damgalı ama konum olarak isabetsiz bir sabitleme (kötü baz istasyonu)
 *     ihtimaline karşı ikinci savunma hattı.
 */

/**
 * Bir konum sabitlemesinin "taze" sayılacağı üst yaş sınırı (ms).
 *
 * expo `getCurrentPositionAsync` önbellekteki son bilinen konumu döndürebilir;
 * bu değer, üstüne yeniden merkezlenmeyecek kadar eski sabitlemeleri eler.
 */
export const KONUM_TAZELIK_SINIRI_MS = 2 * 60 * 1000; // 2 dakika

/**
 * İki geofence olayının işlenmesi arasında beklenen asgari süre (ms).
 *
 * Gerçek bir şehirlerarası yolculukta çıkış olayları dakikalar/saatler arayla
 * gelir; bu pencere meşru olayları elemez, yalnız patlamayı (burst) keser.
 */
export const GEOFENCE_OLAY_BEKLEMESI_MS = 60 * 1000; // 1 dakika

/**
 * Alınan konum sabitlemesi, üstüne yeni bölge kurulacak kadar taze mi?
 *
 * @param konumZamanDamgasiMs Sabitlemenin zaman damgası (`LocationObject.timestamp`)
 * @param simdiMs Şimdiki zaman (ms)
 * @param sinirMs Tazelik üst sınırı (ms)
 * @returns Taze ise true. Geçersiz/gelecek tarihli damga güvenilmez sayılır.
 */
export function konumTazeMi(
    konumZamanDamgasiMs: number | undefined | null,
    simdiMs: number,
    sinirMs: number = KONUM_TAZELIK_SINIRI_MS,
): boolean {
    if (typeof konumZamanDamgasiMs !== 'number' || !Number.isFinite(konumZamanDamgasiMs)) {
        return false;
    }

    const yas = simdiMs - konumZamanDamgasiMs;

    // Negatif yaş = damga gelecekte (saat kayması / bozuk sağlayıcı) → güvenme.
    if (yas < 0) {
        return false;
    }

    return yas <= sinirMs;
}

/**
 * Bu geofence olayı işlenmeli mi, yoksa bekleme penceresi içinde mi geldi?
 *
 * @param sonOlayISO En son işlenen olayın ISO zaman damgası (yoksa null/undefined)
 * @param simdiMs Şimdiki zaman (ms)
 * @param beklemeMs Asgari bekleme penceresi (ms)
 * @returns İşlenmeli ise true. Kayıt yoksa/çözülemezse ilk olay sayılır → true.
 */
export function olayIslenebilirMi(
    sonOlayISO: string | undefined | null,
    simdiMs: number,
    beklemeMs: number = GEOFENCE_OLAY_BEKLEMESI_MS,
): boolean {
    if (!sonOlayISO) {
        return true;
    }

    const sonOlayMs = new Date(sonOlayISO).getTime();

    // Çözülemeyen damga bir kilit sebebi DEĞİLDİR: bozuk tek bir değer
    // takibi kalıcı olarak durdurmamalı.
    if (!Number.isFinite(sonOlayMs)) {
        return true;
    }

    const gecenSure = simdiMs - sonOlayMs;

    // Damga gelecekteyse (saat geri alındı) kilitlenip kalmamak için işle.
    if (gecenSure < 0) {
        return true;
    }

    return gecenSure >= beklemeMs;
}
