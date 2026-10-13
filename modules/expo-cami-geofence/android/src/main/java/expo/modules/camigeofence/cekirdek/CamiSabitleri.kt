package expo.modules.camigeofence.cekirdek

/**
 * Camideyim sabitleri — JS ikizi `src/core/cami/camiTipleri.ts`. Birini
 * değiştirirken ötekini de değiştirin; ortak karar tablosu
 * (`cami-karar-tablosu.json`) ayrışmayı iki tarafta da kırar.
 *
 * Bu paket (cekirdek) SAFTIR: android.* import ETMEZ → JVM birim testinde koşar.
 */
object CamiSabitleri {
    /**
     * "Camidesiniz" bildirim başlığının SABİT öneki (issue #278): Samsung Rutinler'in
     * "Bildirim alındığında" koşulu bu anahtar kelimeyle eşleşir. Değiştirmek kurulu
     * rutinleri sessizce bozar — nöbetçi: JS `otomasyonAnahtarKelimeleri.test.ts`
     * (bu dosyayı okur) + `CamiBildirimMetniTest`.
     */
    const val CAMIDESINIZ_BASLIK_ONEKI = "Camidesiniz"

    /** Bildirim başlığı: önek + " · " + cami adı (ad yoksa "Cami"). */
    fun camidesinizBasligi(ad: String): String = "$CAMIDESINIZ_BASLIK_ONEKI · ${ad.ifBlank { "Cami" }}"

    const val GEOFENCE_YARICAPI_M = 100.0
    const val GEOFENCE_ALAN_PAYI_M = 50.0
    const val VARSAYILAN_ALAN_M = 25.0
    const val ALAN_MIN_M = 10.0
    const val ALAN_MAX_M = 150.0
    const val POLIGON_TAMPON_M = 10.0
    const val AZAMI_DOGRULUK_M = 30.0

    const val IZLENEN_CAMI_SAYISI = 25
    const val EK_YER_KOTASI = 40

    const val YENILEME_ICERI_PAY_M = 150.0
    const val YENILEME_MIN_M = 500.0
    const val YENILEME_MAX_M = 5000.0
    const val ARAMA_AZAMI_M = 50_000.0

    const val BEKLEME_VARSAYILAN_DK = 3
    const val BEKLEME_MIN_DK = 2
    const val BEKLEME_MAX_DK = 20

    const val CAMIDE_AZAMI_DK = 90L
    const val CAMIDE_CUMA_AZAMI_DK = 150L

    const val KAPI_ONCE_DK = 20L

    // Güven puanı (Faz 2) — JS: GUVEN_* / HIZ_* / SORU_AZAMI_DK
    const val GUVEN_EZAN_ONCE_DK = 10L
    const val GUVEN_EZAN_SONRA_DK = 40L
    const val HIZ_HAREKETLI_MPS = 1.5
    const val HIZ_DURGUN_MPS = 0.5
    const val GUVEN_OTOMATIK_ESIK = 75
    const val GUVEN_SOR_ESIK = 50
    const val SORU_AZAMI_DK = 30L

    const val KONUM_TAZELIK_MS = 2 * 60 * 1000L
    const val YENILEME_BEKLEMESI_MS = 60 * 1000L

    /** Tek hassas ölçümün tavanı (Fable: DWELL başına tek `getCurrentLocation`, 15 sn). */
    const val OLCUM_ZAMAN_ASIMI_MS = 15_000L

    const val DAKIKA_MS = 60_000L
}
