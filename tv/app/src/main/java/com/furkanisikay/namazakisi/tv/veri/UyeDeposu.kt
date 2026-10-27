package com.furkanisikay.namazakisi.tv.veri

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Log
import com.furkanisikay.namazakisi.tv.R
import com.furkanisikay.namazakisi.tv.cekirdek.CihazKanali
import com.furkanisikay.namazakisi.tv.cekirdek.CihazYukuCozucu
import com.furkanisikay.namazakisi.tv.cekirdek.UyeDeposuArayuzu
import com.furkanisikay.namazakisi.tv.cekirdek.UyeHali
import org.json.JSONObject
import java.security.KeyStore
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/**
 * Eşleşik üyeler (telefonlar) — TV tarafı. SharedPreferences `namazakisi_cihaz_agi`;
 * `allowBackup=false` (yedeğe girmez, telefon değişince yeniden eşleşilir).
 *
 * Üye anahtarı DÜZ SAKLANMAZ: Android Keystore'daki bir AES anahtarıyla (cihazdan çıkamaz)
 * sarılır. Keystore kullanılamazsa `uyeEkle` false döner ve eşleşme REDDEDİLİR.
 *
 * Konum: en son eşleşen üye "konum sahibi"dir; TV o üyenin konumunu izler. Elle il seçimi ya da
 * kodla konum girişi sahipliği bırakır (`konumSahibiniBirak`).
 */
class UyeDeposu(context: Context, private val konum: KonumDeposu) : UyeDeposuArayuzu {
    private val baglam = context.applicationContext
    private val p = baglam.getSharedPreferences(DOSYA, Context.MODE_PRIVATE)
    private val ana = Handler(Looper.getMainLooper())
    private val acikAnahtarlar = HashMap<String, ByteArray>()

    /** Üye listesi ya da durumu değişince (ana thread). */
    @Volatile var degisti: (() -> Unit)? = null

    val tvKimlik: String by lazy {
        p.getString(K_TV, null) ?: ByteArray(8).also { SecureRandom().nextBytes(it) }
            .joinToString("") { "%02x".format(it.toInt() and 0xff) }
            .also { p.edit().putString(K_TV, it).apply() }
    }

    /** Ayarlar'daki cihaz adı (ör. "Salon TV"); yoksa üretici + model. */
    fun tvAdi(): String = try {
        Settings.Global.getString(baglam.contentResolver, "device_name")
    } catch (e: Exception) {
        null
    }?.takeIf { it.isNotBlank() }?.take(40) ?: "${android.os.Build.MANUFACTURER} TV".replaceFirstChar { it.uppercase() }

    data class UyeOzeti(val uye: String, val ad: String, val sonHaberMs: Long, val durumSayiliyor: Boolean)

    @Synchronized private fun uyeler(): JSONObject = try {
        JSONObject(p.getString(K_UYELER, "{}") ?: "{}")
    } catch (e: Exception) {
        JSONObject()
    }

    @Synchronized private fun yaz(o: JSONObject) {
        p.edit().putString(K_UYELER, o.toString()).commit()
        ana.post { degisti?.invoke() }
    }

    fun uyeVarMi(): Boolean = uyeler().length() > 0

    fun ozetler(): List<UyeOzeti> {
        val o = uyeler()
        return o.keys().asSequence().map { u ->
            val k = o.getJSONObject(u)
            val d = k.optString("son").takeIf { it.isNotEmpty() }?.let { CihazYukuCozucu.coz(it)?.durum }
            UyeOzeti(u, k.optString("ad", baglam.getString(R.string.telefon_varsayilan)), k.optLong("sonHaber", 0), d?.durumumSayilsin == true)
        }.sortedBy { it.ad }.toList()
    }

    fun uyeHalleri(): List<UyeHali> {
        val o = uyeler()
        return o.keys().asSequence().map { u ->
            val k = o.getJSONObject(u)
            val y = k.optString("son").takeIf { it.isNotEmpty() }?.let { CihazYukuCozucu.coz(it) }
            val olay = mutableMapOf<String, MutableSet<String>>()
            k.optJSONObject("olay")?.let { j -> for (g in j.keys()) j.optJSONArray(g)?.let { a -> for (i in 0 until a.length()) olay.getOrPut(g) { mutableSetOf() } += a.optString(i) } }
            UyeHali(u, y?.durum, k.optLong("sonHaber", 0), olay)
        }.toList()
    }

    // ---- UyeDeposuArayuzu ----

    @Synchronized
    override fun anahtar(uye: String): ByteArray? {
        acikAnahtarlar[uye]?.let { return it }
        val sarili = uyeler().optJSONObject(uye)?.optString("k")?.takeIf { it.isNotEmpty() } ?: return null
        return ac(sarili)?.also { acikAnahtarlar[uye] = it }
    }

    @Synchronized override fun sonN(uye: String): Long = uyeler().optJSONObject(uye)?.optLong("n", 0) ?: 0

    @Synchronized
    override fun sonNYaz(uye: String, n: Long) {
        val o = uyeler()
        o.optJSONObject(uye)?.put("n", n) ?: return
        p.edit().putString(K_UYELER, o.toString()).commit()
    }

    @Synchronized
    override fun uyeEkle(uye: String, anahtar: ByteArray, cihazAdi: String): Boolean {
        val sarili = sar(anahtar) ?: return false
        val o = uyeler()
        o.put(uye, JSONObject().put("ad", cihazAdi).put("k", sarili).put("n", 0).put("eklenme", System.currentTimeMillis()))
        yaz(o)
        p.edit().putString(K_KONUM_SAHIBI, uye).apply()
        acikAnahtarlar[uye] = anahtar
        return true
    }

    @Synchronized
    override fun uyeSil(uye: String) {
        val o = uyeler()
        o.remove(uye)
        acikAnahtarlar.remove(uye)
        if (p.getString(K_KONUM_SAHIBI, null) == uye) p.edit().remove(K_KONUM_SAHIBI).apply()
        yaz(o)
    }

    @Synchronized
    override fun mesajYaz(uye: String, yukMetni: String, simdiMs: Long) {
        val o = uyeler()
        val k = o.optJSONObject(uye) ?: return
        val yuk = CihazYukuCozucu.coz(yukMetni) ?: return
        if (yuk.durum != null) k.put("son", yukMetni)
        // Olay günlüğü: kimliğe göre birleşim; yalnız son 2 namaz günü tutulur.
        if (yuk.olaylar.isNotEmpty()) {
            val olay = k.optJSONObject("olay") ?: JSONObject()
            for (e in yuk.olaylar) if (e.tur == "kildim") {
                val dizi = olay.optJSONArray(e.tarih) ?: org.json.JSONArray().also { olay.put(e.tarih, it) }
                if ((0 until dizi.length()).none { dizi.optString(it) == e.vakit }) dizi.put(e.vakit)
            }
            val gunler = olay.keys().asSequence().toList().sortedDescending()
            gunler.drop(2).forEach { olay.remove(it) }
            k.put("olay", olay)
        }
        k.put("sonHaber", simdiMs)
        yaz(o)
        val d = yuk.durum
        if (d?.lat != null && d.lng != null && p.getString(K_KONUM_SAHIBI, null) == uye) {
            val mevcut = konum.telefondanGelen()
            // Yedek ad kayda YAZILIR (veri): o anki cihaz dilinde kalır; telefon adı gönderince değişir.
            val ad = d.ad ?: mevcut?.ad ?: baglam.getString(R.string.telefondaki_konum)
            if (mevcut == null || mevcut.lat != d.lat || mevcut.lng != d.lng || mevcut.ad != ad || mevcut.hesap != d.hesap) {
                konum.telefondanKaydet(ad, d.lat, d.lng, d.hesap)
            }
        }
    }

    fun konumSahibiniBirak() {
        p.edit().remove(K_KONUM_SAHIBI).apply()
    }

    // ---- Keystore sarmalama ----

    private fun sarmaAnahtari(): SecretKey? = try {
        val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        (ks.getKey(TAKMA_AD, null) as SecretKey?) ?: KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore").apply {
            init(
                KeyGenParameterSpec.Builder(TAKMA_AD, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                    .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                    .setKeySize(256)
                    .build(),
            )
        }.generateKey()
    } catch (e: Exception) {
        Log.w("CihazAgi", "Keystore kullanilamiyor: ${e.javaClass.simpleName}")
        null
    }

    private fun sar(duz: ByteArray): String? = try {
        val k = sarmaAnahtari() ?: return null
        val c = Cipher.getInstance("AES/GCM/NoPadding").apply { init(Cipher.ENCRYPT_MODE, k) }
        CihazKanali.b64(c.iv + c.doFinal(duz))
    } catch (e: Exception) {
        Log.w("CihazAgi", "Anahtar sarilamadi: ${e.javaClass.simpleName}")
        null
    }

    private fun ac(sarili: String): ByteArray? = try {
        val b = CihazKanali.b64Coz(sarili) ?: return null
        val k = sarmaAnahtari() ?: return null
        val c = Cipher.getInstance("AES/GCM/NoPadding").apply { init(Cipher.DECRYPT_MODE, k, GCMParameterSpec(128, b.copyOfRange(0, 12))) }
        c.doFinal(b.copyOfRange(12, b.size))
    } catch (e: Exception) {
        null
    }

    private companion object {
        const val DOSYA = "namazakisi_cihaz_agi"
        const val K_TV = "tv_kimlik"
        const val K_UYELER = "uyeler"
        const val K_KONUM_SAHIBI = "konum_sahibi"
        const val TAKMA_AD = "namazakisi_cihaz_agi_sarma"
    }
}
