package com.furkanisikay.namazakisi.kildim

import android.content.Context
import com.furkanisikay.namazakisi.cekirdek.NafileKildimKurallari
import org.json.JSONArray
import org.json.JSONObject

/**
 * Nafile "Kıldım"larının KALICI kuyruğu (issue #273, #299 deseni).
 *
 * Farz kuyruğundan (`KildimKuyrugu`) BİLEREK ayrı: o kuyruğun her öğesi JS'te farz
 * kaydı yazar; nafile kaydı ise HİÇ yazılmaz. Buradaki öğe yalnız JS'in `NAFILE_KILINAN`
 * susturma hafızasını yazması içindir (`NafileHatirlatmaServisi.kildimIsle`) — native
 * iptaller zaten yapıldı, hafıza bir sonraki planlamanın o nafileyi yeniden kurmasını
 * önler. JS kuyruğu farz kuyruğuyla AYNI üç yoldan boşaltır (`KildimKuyruguServisi`).
 *
 * Kurallar SAF `NafileKildimKurallari`'ndadır (JVM testli).
 */
object NafileKildimKuyrugu {
    private const val PREFS = "namazakisi_nafile"
    private const val ANAHTAR = "kildim_kuyrugu"

    /** @return öğe geçerliyse (yeni ya da zaten kuyrukta) true. */
    @Synchronized
    fun ekle(context: Context, n: NafileKildimKurallari.Nafile): Boolean {
        val mevcut = oku(context)
        val yeni = NafileKildimKurallari.ekle(mevcut, n.tarih, n.tur) ?: return false
        return yeni === mevcut || yaz(context, yeni)
    }

    @Synchronized
    fun tumu(context: Context): String = jsonaCevir(oku(context)).toString()

    /** Bu nafile kuyrukta bekliyor mu? (Gerçek alarm tetikte çalmasın — farz M1 ikizi.) */
    @Synchronized
    fun bekliyorMu(context: Context, n: NafileKildimKurallari.Nafile): Boolean =
        oku(context).any { it.id == NafileKildimKurallari.kimlik(n) }

    @Synchronized
    fun tamamlandi(context: Context, id: String) {
        yaz(context, NafileKildimKurallari.tamamlandi(oku(context), id))
    }

    @Synchronized
    fun basarisiz(context: Context, id: String) {
        yaz(context, NafileKildimKurallari.basarisiz(oku(context), id))
    }

    private fun oku(context: Context): List<NafileKildimKurallari.Oge> = try {
        val ham = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(ANAHTAR, "[]") ?: "[]"
        val dizi = JSONArray(ham)
        (0 until dizi.length()).mapNotNull { i ->
            val o = dizi.optJSONObject(i) ?: return@mapNotNull null
            val tarih = o.optString("tarih")
            val tur = o.optString("tur")
            if (!NafileKildimKurallari.gecerliMi(tarih, tur)) return@mapNotNull null
            NafileKildimKurallari.Oge(o.optString("id"), tarih, tur, o.optInt("deneme", 0))
        }
    } catch (_: Exception) {
        emptyList()
    }

    private fun jsonaCevir(liste: List<NafileKildimKurallari.Oge>): JSONArray = JSONArray().apply {
        liste.forEach {
            put(
                JSONObject()
                    .put("id", it.id)
                    .put("tarih", it.tarih)
                    .put("tur", it.tur)
                    .put("deneme", it.deneme)
            )
        }
    }

    /** commit (senkron): yanıt alıcısı kısa ömürlüdür, JS öğeyi hemen okuyabilmeli. */
    private fun yaz(context: Context, liste: List<NafileKildimKurallari.Oge>): Boolean =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putString(ANAHTAR, jsonaCevir(liste).toString()).commit()
}
