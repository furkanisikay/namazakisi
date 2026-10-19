package expo.modules.camigeofence.cekirdek

/**
 * Geofence kaydının NEREYE ve NE ZAMAN yeniden kurulacağı — SAF (JVM testi:
 * IzlemeKarariTest). JS ikizi YOK (karar yalnız native'de).
 *
 * Çözdüğü hata: 15 dk'lık arka plan görevi izlemeyi şehir takibinin koordinatına
 * (BAYAT olabilir) yeniden kuruyordu. Cihaz o koordinatın yenileme çemberi
 * dışındaysa her turda: kayıt → anında EXIT → GPS ölçümü → taze merkez → 15 dk
 * sonra JS bayat merkezi YİNE yazar. Ayrıca her turda cami isteği
 * `INITIAL_TRIGGER_DWELL` ile kurulduğu için caminin yanında oturan kullanıcıda
 * 15 dk'da bir DWELL (+ hassas ölçüm) doğuyordu.
 *
 * Kurallar:
 *  - TAZE merkez (GPS sabitlemesi) yalnız OLAY yolundan gelir.
 *  - Kayıt CANLI iken taze merkez bayat bir koordinatla EZİLMEZ: canlı yenileme
 *    çemberi "hâlâ içeridesiniz" der (çıkılsaydı EXIT gelirdi).
 *  - Bayat yeni merkez mevcut çemberin İÇİNDEYSE kaydırmak gereksizdir.
 *  - PERİYODİK yolda merkez korunuyor ve izlenen küme aynıysa HİÇ dokunulmaz;
 *    kayıt yapılırsa da başlangıç DWELL tetiği verilmez.
 */
enum class IzlemeKipi {
    /** Yenileme çemberinden çıkış + taze GPS sabitlemesi. */
    OLAY,

    /** Ayar değişimi, yeniden başlatma, "cami değil": daima kurar. */
    KURULUM,

    /** 15 dk'lık arka plan görevi / konum değişimi: gerekmedikçe dokunmaz. */
    PERIYODIK,
}

data class YenilemeMerkezi(val lat: Double, val lng: Double, val yaricapM: Double, val taze: Boolean)

data class MerkezSecimi(val lat: Double, val lng: Double, val taze: Boolean, val mevcutKorundu: Boolean)

object IzlemeKarari {

    /**
     * @param mevcut diskteki yenileme merkezi (yoksa null)
     * @param kayitCanli bizim geofence kaydımız hâlâ ayakta mı (PendingIntent + başarı bayrağı)
     */
    fun merkezSec(mevcut: YenilemeMerkezi?, yeniLat: Double, yeniLng: Double, kip: IzlemeKipi, kayitCanli: Boolean): MerkezSecimi {
        if (kip == IzlemeKipi.OLAY || mevcut == null || !kayitCanli) {
            return MerkezSecimi(yeniLat, yeniLng, kip == IzlemeKipi.OLAY, false)
        }
        val icinde = Geometri.mesafeM(mevcut.lat, mevcut.lng, yeniLat, yeniLng) < mevcut.yaricapM
        return if (mevcut.taze || icinde) {
            MerkezSecimi(mevcut.lat, mevcut.lng, mevcut.taze, true)
        } else {
            MerkezSecimi(yeniLat, yeniLng, false, false)
        }
    }

    /**
     * İzlenen kümenin karşılaştırma imzası (sıradan bağımsız): kimlik + geofence yarıçapı
     * (+ varsa bina sınırı ölçeği — ölçeği olmayan yerin imzası eskisiyle birebir aynı).
     */
    fun imza(yerler: List<IzlenenYer>): List<String> =
        yerler.map { y -> "${y.id}|${Math.round(CamiKarar.geofenceYaricapiM(y))}" + (y.ozelOlcek?.let { "|o$it" } ?: "") }.sorted()

    /** true → kayda HİÇ dokunma (yalnız PERİYODİK yolda). */
    fun dokunmaMi(kip: IzlemeKipi, kayitCanli: Boolean, secim: MerkezSecimi, eskiImza: List<String>, yeniImza: List<String>): Boolean =
        kip == IzlemeKipi.PERIYODIK && kayitCanli && secim.mevcutKorundu && eskiImza == yeniImza

    /** Cami isteğine başlangıç DWELL tetiği verilsin mi? Periyodik yolda HAYIR. */
    fun camiBaslangicDwell(kip: IzlemeKipi): Boolean = kip != IzlemeKipi.PERIYODIK

    /**
     * Elle kapatmanın hatırlandığı Namaz modu "tur" kimliği. Vakit kapısı penceresi
     * varsa `cami:<tarih>_<vakit>` (JS `turdanNamaz` ile çözülür). Kapı kapalıyken
     * pencere YOKTUR; eskiden sabit `cami:?_serbest` yazılıyordu ve bir kez elle
     * kapatmak Camideyim'in modu açmasını KALICI susturuyordu → takvim günü + yer
     * kimliği katılır (JS bu biçimi namaza çözmez — bilinçli: vakit bilinmiyor).
     */
    fun camiTuru(tarih: String?, vakit: String?, takvimGunu: String, yerId: String): String =
        if (tarih != null && vakit != null) "cami:${tarih}_$vakit" else "cami:${takvimGunu}_serbest_$yerId"
}
