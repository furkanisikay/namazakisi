package expo.modules.camigeofence

import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * "Camidesiniz" hâlini uygulamanın otomasyon eklentisine bildirir (issue #278).
 *
 * Modüller birbirini import etmez → PAKET-KAPSAMLI açık yayın (`setPackage`), alıcı
 * uygulamadaki dışa kapalı `otomasyon/OtomasyonCamiAlici` (sayaç modülü →
 * `SayacKildimAlici` deseni). Eylem adı ve ek anahtarları iki yerde SABİTTİR:
 * `OtomasyonOlaylari.CAMI_DURUMU_EYLEMI` ile aynı kalmalı.
 *
 * Konuma bağlı bir bilgi olduğu için ÖRTÜK yayın yapılmaz: başka uygulamalar duymaz;
 * dışarıya ancak kullanıcının izin verdiği otomasyon uygulaması (güven listesi +
 * gizli belirteç) sorgu ile öğrenir.
 */
internal object CamiOtomasyonYayini {
    const val EYLEM = "com.furkanisikay.namazakisi.CAMI_DURUMU"

    fun yay(ctx: Context, c: CamiDepo.Camide?) {
        try {
            val i = Intent(EYLEM).setPackage(ctx.packageName).putExtra("camide", c != null)
            if (c != null) {
                i.putExtra("ad", c.ad)
                    .putExtra("vakit", c.vakit)
                    .putExtra("tarih", c.tarih)
                    .putExtra("bitisMs", c.bitisMs)
            }
            ctx.sendBroadcast(i)
        } catch (e: Exception) {
            Log.w("CamiOtomasyonYayini", "Otomasyon yayini gonderilemedi", e)
        }
    }
}
