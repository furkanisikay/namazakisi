package expo.modules.camigeofence

import android.content.Context
import expo.modules.camigeofence.cekirdek.CamiSabitleri
import expo.modules.camigeofence.cekirdek.IzlenenYer
import expo.modules.camigeofence.cekirdek.KapiPenceresi
import expo.modules.camigeofence.cekirdek.YerKaydi
import org.json.JSONArray
import org.json.JSONObject

/**
 * Camideyim'in TEK doğru kaynağı: SharedPreferences.
 *
 * Neden native: karar uygulama süreci ölüyken (`goAsync()`) verilir ve JS'in
 * AsyncStorage'ını okuyamaz. JS ayarları buradan okur/buraya yazar
 * (`ExpoCamiGeofenceModule`); "Burası cami değil" gibi bildirimden gelen
 * değişiklikler de burada kalıcılaşır → iki kopya ayrışamaz.
 *
 * Okuma ASLA fırlatmaz: bozuk kayıt varsayılana düşer (AGENTS.md "sessiz sonsuz
 * spinner" dersi).
 */
object CamiDepo {
    private const val DOSYA = "namazakisi_cami"
    private const val AYARLAR = "ayarlar"
    private const val PENCERELER = "pencereler"
    private const val IZLENENLER = "izlenenler"
    private const val YENILEME = "yenileme"
    private const val CAMIDE = "camide"
    private const val KAYIT_BASARILI = "kayit_basarili"
    private const val SORU = "soru"
    private const val REDDEDILENLER = "reddedilenler"
    private const val REDDEDILEN_AZAMI = 30

    /**
     * Başka modülün (`expo-countdown-notification` → `AnonsReceiver`) okuduğu
     * ayrı dosya: camideyken sesli anons KONUŞMAZ. Ad ve anahtar o tarafta da
     * sabittir — değiştirirseniz ikisini birlikte değiştirin.
     */
    const val SESSIZ_DOSYA = "namazakisi_cami_durum"
    const val SESSIZ_BITIS_ANAHTARI = "sessiz_bitis_ms"

    private fun prefs(ctx: Context) = ctx.getSharedPreferences(DOSYA, Context.MODE_PRIVATE)

    private fun jsonOku(ctx: Context, anahtar: String): JSONObject? = try {
        prefs(ctx).getString(anahtar, null)?.let { JSONObject(it) }
    } catch (_: Exception) {
        null
    }

    // ------------------------------------------------------------------ ayarlar
    data class Ayarlar(
        val aktif: Boolean,
        val beklemeDk: Int,
        val vakitKapisi: Boolean,
        val namazModu: Boolean,
        val sessiz: Boolean,
        val kildimSor: Boolean,
        /** "yakindakiler" | "secilenler" (favori + eklenen yerler) */
        val izlemeKapsami: String,
        /** "akilli" | "otomatik" | "sorarak" */
        val acilisBicimi: String,
        val yerler: Map<String, YerKaydi>,
    )

    fun ayarlarHam(ctx: Context): JSONObject = normalize(jsonOku(ctx, AYARLAR))

    fun ayarlar(ctx: Context): Ayarlar {
        val o = ayarlarHam(ctx)
        return Ayarlar(
            aktif = o.getBoolean("aktif"),
            beklemeDk = o.getInt("beklemeDk"),
            vakitKapisi = o.getBoolean("vakitKapisi"),
            namazModu = o.getBoolean("namazModu"),
            sessiz = o.getBoolean("sessiz"),
            kildimSor = o.getBoolean("kildimSor"),
            izlemeKapsami = o.getString("izlemeKapsami"),
            acilisBicimi = o.getString("acilisBicimi"),
            yerler = YerKaydi.haritaCoz(o.optJSONObject("yerler")),
        )
    }

    /** JS'ten gelen ham JSON'u doğrulayıp yazar; geçerli hâlini döndürür. */
    fun ayarlariYaz(ctx: Context, ham: JSONObject): JSONObject {
        val n = normalize(ham)
        prefs(ctx).edit().putString(AYARLAR, n.toString()).apply()
        return n
    }

    fun yerGuncelle(ctx: Context, id: String, guncelle: (JSONObject) -> JSONObject?) {
        synchronized(this) {
            val o = ayarlarHam(ctx)
            val yerler = o.optJSONObject("yerler") ?: JSONObject()
            val yeni = guncelle(yerler.optJSONObject(id) ?: JSONObject().put("durum", "normal"))
            if (yeni == null) yerler.remove(id) else yerler.put(id, yeni)
            o.put("yerler", yerler)
            ayarlariYaz(ctx, o)
        }
    }

    private fun normalize(o: JSONObject?): JSONObject {
        val k = o ?: JSONObject()
        val bekleme = k.optInt("beklemeDk", CamiSabitleri.BEKLEME_VARSAYILAN_DK)
            .coerceIn(CamiSabitleri.BEKLEME_MIN_DK, CamiSabitleri.BEKLEME_MAX_DK)
        val yerler = JSONObject()
        k.optJSONObject("yerler")?.let { ham ->
            for (id in ham.keys()) {
                val y = ham.optJSONObject(id) ?: continue
                if (id.length > 80) continue
                val durum = y.optString("durum", "normal").let { if (it == "favori" || it == "haric") it else "normal" }
                val temiz = JSONObject().put("durum", durum)
                if (y.has("alanM") && !y.isNull("alanM")) {
                    temiz.put("alanM", y.optDouble("alanM", CamiSabitleri.VARSAYILAN_ALAN_M).coerceIn(CamiSabitleri.ALAN_MIN_M, CamiSabitleri.ALAN_MAX_M))
                }
                if (y.has("ad")) temiz.put("ad", y.optString("ad").take(120))
                val lat = y.optDouble("lat", Double.NaN)
                val lng = y.optDouble("lng", Double.NaN)
                if (!lat.isNaN() && !lng.isNaN() && lat in -90.0..90.0 && lng in -180.0..180.0) {
                    temiz.put("lat", lat).put("lng", lng)
                }
                if (y.optBoolean("kendi", false)) temiz.put("kendi", true)
                yerler.put(id, temiz)
            }
        }
        return JSONObject()
            .put("aktif", k.optBoolean("aktif", false))
            .put("beklemeDk", bekleme)
            .put("vakitKapisi", k.optBoolean("vakitKapisi", true))
            .put("namazModu", k.optBoolean("namazModu", true))
            .put("sessiz", k.optBoolean("sessiz", true))
            .put("kildimSor", k.optBoolean("kildimSor", true))
            .put("izlemeKapsami", if (k.optString("izlemeKapsami") == "secilenler") "secilenler" else "yakindakiler")
            .put("acilisBicimi", k.optString("acilisBicimi").let { if (it == "otomatik" || it == "sorarak") it else "akilli" })
            .put("yerler", yerler)
    }

    // ---------------------------------------------------------- vakit kapısı
    fun pencereleriYaz(ctx: Context, dizi: JSONArray) {
        prefs(ctx).edit().putString(PENCERELER, dizi.toString()).apply()
    }

    fun pencereler(ctx: Context): List<KapiPenceresi> = try {
        KapiPenceresi.listeCoz(prefs(ctx).getString(PENCERELER, null)?.let { JSONArray(it) })
    } catch (_: Exception) {
        emptyList()
    }

    // ---------------------------------------------------------- izlenenler
    fun izlenenleriYaz(ctx: Context, liste: List<IzlenenYer>) {
        val a = JSONArray()
        liste.forEach { a.put(it.json()) }
        prefs(ctx).edit().putString(IZLENENLER, a.toString()).apply()
    }

    fun izlenenler(ctx: Context): List<IzlenenYer> = try {
        val a = prefs(ctx).getString(IZLENENLER, null)?.let { JSONArray(it) } ?: JSONArray()
        (0 until a.length()).mapNotNull { a.optJSONObject(it)?.let(IzlenenYer::coz) }
    } catch (_: Exception) {
        emptyList()
    }

    // ---------------------------------------------------------- yenileme çemberi
    /**
     * @param taze merkez bir TAZE GPS sabitlemesi mi (yalnız OLAY yolu yazar). Kayıt
     *   canlı kaldıkça bayat bir koordinatla ezilmez (`IzlemeKarari.merkezSec`);
     *   çemberden çıkılıp taze konum alınamazsa [yenilemeBayatla] düşürür.
     */
    data class Yenileme(val lat: Double, val lng: Double, val yaricapM: Double, val sonMs: Long, val taze: Boolean = false)

    fun yenilemeYaz(ctx: Context, y: Yenileme?) {
        val e = prefs(ctx).edit()
        if (y == null) e.remove(YENILEME) else e.putString(
            YENILEME,
            JSONObject().put("lat", y.lat).put("lng", y.lng).put("yaricapM", y.yaricapM).put("sonMs", y.sonMs)
                .put("taze", y.taze).toString(),
        )
        e.apply()
    }

    fun yenileme(ctx: Context): Yenileme? = jsonOku(ctx, YENILEME)?.let {
        try {
            Yenileme(it.getDouble("lat"), it.getDouble("lng"), it.getDouble("yaricapM"), it.getLong("sonMs"), it.optBoolean("taze", false))
        } catch (_: Exception) {
            null
        }
    }

    /** Çemberden çıkıldı ama taze konum alınamadı: merkez artık "hâlâ içerdesiniz" demez. */
    fun yenilemeBayatla(ctx: Context) {
        yenileme(ctx)?.takeIf { it.taze }?.let { yenilemeYaz(ctx, it.copy(taze = false)) }
    }

    // ---------------------------------------------------------- kayıt canlılığı
    /** Son geofence kaydı BAŞARIYLA tamamlandı mı (hata / kaldırmada false). */
    fun kayitBasariliYaz(ctx: Context, basarili: Boolean) {
        prefs(ctx).edit().putBoolean(KAYIT_BASARILI, basarili).apply()
    }

    fun kayitBasarili(ctx: Context): Boolean = prefs(ctx).getBoolean(KAYIT_BASARILI, false)

    // ---------------------------------------------------------- "Camide misiniz?" sorusu
    /**
     * Güven puanı SOR dediğinde bekleyen soru (Faz 2). Kullanıcı "Namaz modunu aç"
     * derse aynı yer ve vakitle `CamiDurumu.giris` çağrılır; soru [bitisMs]'den sonra
     * ya da o yerden çıkılınca düşer.
     */
    data class Soru(
        val yer: IzlenenYer,
        val vakit: String?,
        val tarih: String?,
        val cuma: Boolean,
        val tur: String,
        val zamanMs: Long,
        val bitisMs: Long,
    ) {
        fun json(): JSONObject = JSONObject().put("yer", yer.json())
            .put("vakit", vakit ?: JSONObject.NULL).put("tarih", tarih ?: JSONObject.NULL)
            .put("cuma", cuma).put("tur", tur).put("zamanMs", zamanMs).put("bitisMs", bitisMs)
    }

    fun soruYaz(ctx: Context, s: Soru?) {
        val e = prefs(ctx).edit()
        if (s == null) e.remove(SORU) else e.putString(SORU, s.json().toString())
        e.apply()
        SaatDurumYayini.yay(ctx)
    }

    /** Geçerli (süresi dolmamış) bekleyen soru; süresi dolmuşsa siler ve null döner. */
    fun soru(ctx: Context): Soru? {
        val s = jsonOku(ctx, SORU)?.let {
            try {
                Soru(
                    IzlenenYer.coz(it.getJSONObject("yer")) ?: return@let null,
                    if (it.isNull("vakit")) null else it.getString("vakit"),
                    if (it.isNull("tarih")) null else it.getString("tarih"),
                    it.optBoolean("cuma", false), it.getString("tur"), it.getLong("zamanMs"), it.getLong("bitisMs"),
                )
            } catch (_: Exception) {
                null
            }
        }
        if (s == null || s.bitisMs <= System.currentTimeMillis()) {
            if (prefs(ctx).contains(SORU)) soruYaz(ctx, null)
            return null
        }
        return s
    }

    /** "Hayır" denen (tur, yer) çiftleri: o turda o yer için bir daha sorulmaz/açılmaz. */
    private fun reddedilenAnahtari(tur: String, yerId: String) = "$tur|$yerId"

    fun reddedildiMi(ctx: Context, tur: String, yerId: String): Boolean = try {
        val a = JSONArray(prefs(ctx).getString(REDDEDILENLER, "[]"))
        val k = reddedilenAnahtari(tur, yerId)
        (0 until a.length()).any { a.optString(it) == k }
    } catch (_: Exception) {
        false
    }

    @Synchronized
    fun reddedilenEkle(ctx: Context, tur: String, yerId: String) {
        val eski = try { JSONArray(prefs(ctx).getString(REDDEDILENLER, "[]")) } catch (_: Exception) { JSONArray() }
        val k = reddedilenAnahtari(tur, yerId)
        val liste = (0 until eski.length()).map { eski.optString(it) }.filter { it.isNotEmpty() && it != k } + k
        val yeni = JSONArray()
        liste.takeLast(REDDEDILEN_AZAMI).forEach { yeni.put(it) }
        prefs(ctx).edit().putString(REDDEDILENLER, yeni.toString()).apply()
    }

    // ---------------------------------------------------------- camide hâli
    data class Camide(
        val yerId: String,
        val ad: String,
        val vakit: String?,
        val tarih: String?,
        val cuma: Boolean,
        val girisMs: Long,
        val bitisMs: Long,
        val modAcildi: Boolean,
    ) {
        fun json(): JSONObject = JSONObject().put("yerId", yerId).put("ad", ad)
            .put("vakit", vakit ?: JSONObject.NULL).put("tarih", tarih ?: JSONObject.NULL)
            .put("cuma", cuma).put("girisMs", girisMs).put("bitisMs", bitisMs).put("modAcildi", modAcildi)
    }

    fun camide(ctx: Context): Camide? = jsonOku(ctx, CAMIDE)?.let {
        try {
            Camide(
                it.getString("yerId"), it.optString("ad", ""),
                if (it.isNull("vakit")) null else it.getString("vakit"),
                if (it.isNull("tarih")) null else it.getString("tarih"),
                it.optBoolean("cuma", false), it.getLong("girisMs"), it.getLong("bitisMs"), it.optBoolean("modAcildi", false),
            )
        } catch (_: Exception) {
            null
        }
    }

    fun camideYaz(ctx: Context, c: Camide?, sessiz: Boolean) {
        val e = prefs(ctx).edit()
        if (c == null) e.remove(CAMIDE) else e.putString(CAMIDE, c.json().toString())
        e.apply()
        val s = ctx.getSharedPreferences(SESSIZ_DOSYA, Context.MODE_PRIVATE).edit()
        if (c != null && sessiz) s.putLong(SESSIZ_BITIS_ANAHTARI, c.bitisMs) else s.remove(SESSIZ_BITIS_ANAHTARI)
        s.apply()
        SaatDurumYayini.yay(ctx)
    }

    /** Muhafız sessizliğinin bittiği an (ms) ya da 0. JS teslimcisi okur. */
    fun sessizBitisMs(ctx: Context): Long {
        val bitis = ctx.getSharedPreferences(SESSIZ_DOSYA, Context.MODE_PRIVATE).getLong(SESSIZ_BITIS_ANAHTARI, 0L)
        return if (bitis > System.currentTimeMillis()) bitis else 0L
    }
}
