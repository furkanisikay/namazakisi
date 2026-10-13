package expo.modules.camigeofence

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import org.json.JSONObject

/**
 * Camideyim bildirim düğmeleri: "Modu kapat", "Burası cami değil", "Kıldım".
 * Hepsi JS'siz çalışır; yalnız "Kıldım" kaydı JS'e kuyrukla devredilir.
 */
class CamiEylemAlicisi : BroadcastReceiver() {
    companion object {
        const val MODU_KAPAT = "expo.modules.camigeofence.MODU_KAPAT"
        const val CAMI_DEGIL = "expo.modules.camigeofence.CAMI_DEGIL"
        const val KILDIM = "expo.modules.camigeofence.KILDIM"
        const val EK_YER = "yerId"
        const val EK_AD = "ad"
        const val EK_VAKIT = "vakit"
        const val EK_TARIH = "tarih"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val ctx = context.applicationContext
        try {
            when (intent.action) {
                MODU_KAPAT -> {
                    // Elle kapatma: bu turda yeniden açılmaz. Camide hâli sürer
                    // (muhafız sessiz kalır), yalnız mod kapanır.
                    NamazModu.tumunuKapat(ctx, kullanici = true)
                    CamiGunluk.ekle(ctx, "modElleKapatildi")
                    CamiDepo.camide(ctx)?.let { c ->
                        val y = c.copy(modAcildi = false)
                        CamiDepo.camideYaz(ctx, y, CamiDepo.ayarlar(ctx).sessiz)
                        CamiBildirimleri.camidesiniz(ctx, y, CamiDepo.ayarlar(ctx).sessiz)
                    }
                    CamiOlaylari.yay("namazModu")
                }
                CAMI_DEGIL -> {
                    val yerId = intent.getStringExtra(EK_YER) ?: return
                    val ad = intent.getStringExtra(EK_AD)
                    CamiDepo.yerGuncelle(ctx, yerId) { mevcut ->
                        JSONObject(mevcut.toString()).put("durum", "haric").apply { if (ad != null && !has("ad")) put("ad", ad) }
                    }
                    CamiGunluk.ekle(ctx, "haricTutuldu", mapOf("yer" to ad))
                    CamiDurumu.bitir(ctx, "haric")
                    val sonuc = goAsync()
                    CamiIzleyici.sonMerkezeGoreKur(ctx) {
                        try { sonuc.finish() } catch (_: Exception) { /* yok */ }
                    }
                }
                KILDIM -> {
                    val tarih = intent.getStringExtra(EK_TARIH)
                    val vakit = intent.getStringExtra(EK_VAKIT)
                    CamiBildirimleri.kapat(ctx, CamiBildirimleri.ID_SORU)
                    // Kılındı → bu turun işi bitti; aynı pencerede plan yeniden açmasın.
                    if (NamazModu.ayarlar(ctx).kildimKapat) NamazModu.tumunuKapat(ctx, kullanici = true)
                    if (tarih != null && vakit != null && CamiKildimKuyrugu.ekle(ctx, tarih, vakit)) {
                        CamiGunluk.ekle(ctx, "kildim", mapOf("vakit" to vakit))
                        jsUyandir(ctx)
                    }
                }
            }
        } catch (e: Exception) {
            Log.e("CamiEylem", "Eylem islenemedi: ${e.message}")
        }
    }

    private fun jsUyandir(ctx: Context) {
        if (CamiOlaylari.dinleyici != null) {
            CamiOlaylari.yay("kildim")
            return
        }
        try {
            // Bildirim eylemi geçici izin listesine alınır; yine de reddedilirse
            // kuyruk korunur (ön plana geliş / 15 dk görevi boşaltır).
            ctx.startService(Intent(ctx, CamiKildimGorevServisi::class.java))
        } catch (e: Exception) {
            Log.i("CamiEylem", "Headless gorev baslatilamadi, kuyrukta bekleyecek")
        }
    }
}
