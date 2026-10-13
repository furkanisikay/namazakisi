package com.furkanisikay.namazakisi.otomasyon

import android.content.Context
import com.furkanisikay.namazakisi.cekirdek.CamideDurumu
import com.furkanisikay.namazakisi.cekirdek.KildimGuvenKurallari
import com.furkanisikay.namazakisi.cekirdek.OtomasyonKurallari
import com.furkanisikay.namazakisi.cekirdek.OtomasyonOlayKaydi
import com.furkanisikay.namazakisi.cekirdek.OtomasyonOlayi
import com.furkanisikay.namazakisi.kildim.KildimGuvenDeposu
import org.json.JSONArray
import org.json.JSONObject
import java.security.SecureRandom

/**
 * Otomasyon eklentisinin (issue #278) kalıcı durumu — native SharedPreferences.
 *
 * - Paket başına GİZLİ BELİRTEÇ: eklenti paketine yazılır, yayın gelince karşılaştırılır.
 *   Cihaza özgüdür; `allowBackup=false` + yedeklemeye girmez (taşınan otomasyon yeni
 *   cihazda bir kez yeniden düzenlenmeli — bilinçli).
 * - Koşul kullanan paketler: REQUEST_QUERY YALNIZ onlara (`setPackage`) gönderilir —
 *   "camidesiniz" gibi konuma bağlı bir olay örtük yayınla her uygulamaya sızmasın.
 *   Bayrak = güven listesinde hâlâ "izin" olan en az bir koşul paketi; yoksa widget'ın
 *   sınır alarmı otomasyon için kurulmaz.
 * - Gönderilmiş olaylar (mesaj kimliğiyle, kısa ömürlü) ve son "girdi/çıkıyor" kimlikleri.
 * - "Camidesiniz" hâli (Camideyim modülünün paket-kapsamlı yayınından).
 */
object OtomasyonDeposu {
    private const val PREFS = "namazakisi_otomasyon"
    private const val BELIRTECLER = "belirtecler"
    private const val KOSUL_PAKETLERI = "kosul_paketleri"
    private const val OLAYLAR = "olaylar"
    private const val SON_GIRDI = "son_girdi"
    private const val SON_CIKIYOR = "son_cikiyor"
    private const val CAMIDE = "camide"

    private val rastgele = SecureRandom()

    private fun prefs(ctx: Context) = ctx.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    private fun nesne(ctx: Context, anahtar: String): JSONObject = try {
        JSONObject(prefs(ctx).getString(anahtar, null) ?: "{}")
    } catch (_: Exception) {
        JSONObject()
    }

    // --- Belirteç ---

    @Synchronized
    fun belirtec(ctx: Context, paket: String): String? =
        nesne(ctx, BELIRTECLER).optString(paket).takeIf { OtomasyonKurallari.belirtecBicimiGecerliMi(it) }

    /** Varsa mevcut belirteç (aynı uygulamanın eski eklenti paketleri bozulmasın), yoksa yenisi. */
    @Synchronized
    fun belirtecAl(ctx: Context, paket: String): String {
        belirtec(ctx, paket)?.let { return it }
        val bayt = ByteArray(OtomasyonKurallari.BELIRTEC_UZUNLUGU / 2).also { rastgele.nextBytes(it) }
        val yeni = bayt.joinToString("") { "%02x".format(it.toInt() and 0xff) }
        val o = nesne(ctx, BELIRTECLER).put(paket, yeni)
        prefs(ctx).edit().putString(BELIRTECLER, o.toString()).commit()
        return yeni
    }

    // --- Koşul paketleri ---

    @Synchronized
    fun kosulPaketiEkle(ctx: Context, paket: String) {
        val d = kosulPaketleriHam(ctx)
        if (paket in d) return
        prefs(ctx).edit().putString(KOSUL_PAKETLERI, JSONArray(d + paket).toString()).commit()
    }

    private fun kosulPaketleriHam(ctx: Context): List<String> = try {
        val d = JSONArray(prefs(ctx).getString(KOSUL_PAKETLERI, null) ?: "[]")
        (0 until d.length()).mapNotNull { d.optString(it).takeIf { p -> KildimGuvenKurallari.paketGecerliMi(p) } }
    } catch (_: Exception) {
        emptyList()
    }

    /** Hâlâ izinli olan koşul paketleri (engellenen/kaldırılan uygulamaya olay gönderilmez). */
    fun kosulPaketleri(ctx: Context): List<String> {
        val guven = KildimGuvenDeposu.tumu(ctx)
        return kosulPaketleriHam(ctx).filter { guven[it]?.karar == KildimGuvenKurallari.Karar.IZIN }
    }

    fun kosulKullaniliyor(ctx: Context): Boolean = try {
        kosulPaketleri(ctx).isNotEmpty()
    } catch (_: Exception) {
        false
    }

    // --- Olaylar ---

    @Synchronized
    fun olayEkle(ctx: Context, olay: OtomasyonOlayi, vakit: String?, tarih: String?, kalanDk: Int? = null, camiAdi: String? = null): OtomasyonOlayKaydi {
        val simdi = System.currentTimeMillis()
        // Pozitif, sıfırdan farklı rastgele kimlik — tahmin edilemesin (sahte sorgu koruması).
        val kayit = OtomasyonOlayKaydi((rastgele.nextInt(Int.MAX_VALUE - 1) + 1), olay, vakit, tarih, simdi, kalanDk, camiAdi)
        val yeni = OtomasyonKurallari.olaylariBuda(olaylar(ctx) + kayit, simdi)
        val d = JSONArray()
        yeni.forEach {
            d.put(
                JSONObject().put("m", it.mesajId).put("o", it.olay.kod).put("v", it.vakit ?: JSONObject.NULL)
                    .put("t", it.tarih ?: JSONObject.NULL).put("z", it.zamanMs)
                    .put("k", it.kalanDk ?: JSONObject.NULL).put("c", it.camiAdi ?: JSONObject.NULL)
            )
        }
        prefs(ctx).edit().putString(OLAYLAR, d.toString()).commit()
        return kayit
    }

    fun olayBul(ctx: Context, mesajId: Int): OtomasyonOlayKaydi? = olaylar(ctx).firstOrNull { it.mesajId == mesajId }

    private fun olaylar(ctx: Context): List<OtomasyonOlayKaydi> = try {
        val d = JSONArray(prefs(ctx).getString(OLAYLAR, null) ?: "[]")
        (0 until d.length()).mapNotNull { i ->
            val o = d.optJSONObject(i) ?: return@mapNotNull null
            val olay = OtomasyonOlayi.koddan(o.optString("o")) ?: return@mapNotNull null
            OtomasyonOlayKaydi(
                mesajId = o.optInt("m"),
                olay = olay,
                vakit = o.opt("v") as? String,
                tarih = o.opt("t") as? String,
                zamanMs = o.optLong("z"),
                kalanDk = (o.opt("k") as? Number)?.toInt(),
                camiAdi = o.opt("c") as? String,
            )
        }
    } catch (_: Exception) {
        emptyList()
    }

    // --- Son kimlikler ---

    fun sonGirdi(ctx: Context): String? = prefs(ctx).getString(SON_GIRDI, null)
    fun sonGirdiYaz(ctx: Context, kimlik: String) { prefs(ctx).edit().putString(SON_GIRDI, kimlik).commit() }
    fun sonCikiyor(ctx: Context): String? = prefs(ctx).getString(SON_CIKIYOR, null)
    fun sonCikiyorYaz(ctx: Context, kimlik: String) { prefs(ctx).edit().putString(SON_CIKIYOR, kimlik).commit() }

    // --- Camide ---

    fun camide(ctx: Context): CamideDurumu? = try {
        prefs(ctx).getString(CAMIDE, null)?.let {
            val o = JSONObject(it)
            CamideDurumu(o.optString("ad"), o.opt("v") as? String, o.opt("t") as? String, o.optLong("b"))
        }
    } catch (_: Exception) {
        null
    }

    fun camideYaz(ctx: Context, c: CamideDurumu?) {
        val e = prefs(ctx).edit()
        if (c == null) e.remove(CAMIDE) else e.putString(
            CAMIDE,
            JSONObject().put("ad", c.ad).put("v", c.vakit ?: JSONObject.NULL).put("t", c.tarih ?: JSONObject.NULL).put("b", c.bitisMs).toString(),
        )
        e.commit()
    }
}
