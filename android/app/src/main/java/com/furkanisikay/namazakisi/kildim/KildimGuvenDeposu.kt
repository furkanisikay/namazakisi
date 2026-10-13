package com.furkanisikay.namazakisi.kildim

import android.content.Context
import com.furkanisikay.namazakisi.cekirdek.KildimGuvenKurallari
import com.furkanisikay.namazakisi.cekirdek.KildimGuvenKurallari.Karar
import com.furkanisikay.namazakisi.cekirdek.KildimGuvenKurallari.Kayit

/**
 * "Kıldım" güven listesinin kalıcı deposu (issue #299) — paket başına karar.
 *
 * NATIVE SharedPreferences'ta durur (AsyncStorage DEĞİL): kısayol etkinliği uygulamayı
 * hiç açmadan, JS ayağa kalkmadan karar vermek zorunda. Ayarlar sayfası köprüden
 * (`KildimGuvenModulu`) okur/yazar. Cihaza özgüdür (paket adları ve kullanıcının o
 * cihazdaki otomasyonları) → yedeklemeye GİRMEZ. Biçim ve kurallar SAF
 * `KildimGuvenKurallari`'ndadır (JVM testli).
 */
object KildimGuvenDeposu {
    private const val PREFS = "namazakisi_kildim_guven"
    private const val ANAHTAR = "kararlar"

    @Synchronized
    fun tumu(context: Context): Map<String, Kayit> =
        KildimGuvenKurallari.jsondanOku(prefs(context).getString(ANAHTAR, null))

    fun karar(context: Context, paket: String?): Karar? = paket?.let { tumu(context)[it]?.karar }

    @Synchronized
    fun kaydet(context: Context, paket: String, karar: Karar, ad: String) {
        if (!KildimGuvenKurallari.paketGecerliMi(paket)) return
        yaz(context, KildimGuvenKurallari.kaydet(tumu(context), Kayit(paket, karar, ad.ifBlank { paket }, System.currentTimeMillis())))
    }

    /** Var olan kaydın kararını değiştirir (ad korunur). Kayıt yoksa hiçbir şey yapmaz. */
    @Synchronized
    fun kararDegistir(context: Context, paket: String, karar: Karar): Boolean {
        val mevcut = tumu(context)[paket] ?: return false
        yaz(context, KildimGuvenKurallari.kaydet(tumu(context), mevcut.copy(karar = karar, zamanMs = System.currentTimeMillis())))
        return true
    }

    @Synchronized
    fun kaldir(context: Context, paket: String) {
        yaz(context, KildimGuvenKurallari.kaldir(tumu(context), paket))
    }

    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    private fun yaz(context: Context, liste: Map<String, Kayit>) {
        // commit (senkron): kısayol etkinliği hemen ardından kapanır.
        prefs(context).edit().putString(ANAHTAR, KildimGuvenKurallari.jsonaYaz(liste)).commit()
    }
}
