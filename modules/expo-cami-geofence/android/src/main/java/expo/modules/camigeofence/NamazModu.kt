package expo.modules.camigeofence

import android.app.AutomaticZenRule
import android.app.NotificationManager
import android.content.ComponentName
import android.content.Context
import android.net.Uri
import android.os.Build
import android.service.notification.Condition
import android.util.Log
import org.json.JSONObject

/**
 * Uygulamaya ait TEK "Namaz" modu (issue #277).
 *
 * Telefonun namazda NE yapacağını kullanıcı SİSTEM ekranında (Ayarlar → Modlar)
 * seçer; uygulama yalnız NE ZAMAN açılacağını söyler. Muhafız hiçbir zaman
 * susturulmaz — modun sessizliği sistem politikasıdır.
 *
 * Sürüm katmanları:
 *  - API 35+: `AutomaticZenRule.Builder` (TYPE_OTHER, tetik açıklaması, renklenebilir
 *    ikon, elle açılabilir, ayar ekranı). Kullanıcının mod ekranında kendi
 *    özelleştirdiği alanları EZMEYİZ (kural bir kez kurulur, güncellenmez).
 *  - API 29–34: `addAutomaticZenRule` + `setAutomaticZenRuleState`.
 *  - API 24–28: `setInterruptionFilter(PRIORITY)` ve kapanışta eski filtreye dönüş.
 * Hepsi bildirim politikası erişimi ister (`ACCESS_NOTIFICATION_POLICY`); yoksa
 * hiçbir şey çökmez, "erisimYok" döner ve ekran rehber gösterir.
 *
 * KAYNAKLAR: mod birden çok sebeple açık olabilir (camide + cuma hutbesi). Her
 * kaynak kendi "tur" kimliğiyle kaydolur; hepsi kapanınca mod kapanır.
 * KULLANICI ELLE KAPATTIYSA o turda yeniden AÇILMAZ (Fable kararı): API 35+'da
 * `ACTION_AUTOMATIC_ZEN_RULE_STATUS_CHANGED` (DEACTIVATED) ile, daha eskide bir
 * sonraki açma denemesinde "biz açtık ama sistemde kapalı" farkıyla anlaşılır.
 */
object NamazModu {
    private const val DOSYA = "namazakisi_namaz_modu"
    private const val ETIKET = "NamazModu"
    private const val KURAL_ID = "kural_id"
    private const val AYARLAR = "ayarlar"
    private const val KAYNAKLAR = "kaynaklar"
    private const val KAPATILAN = "kullanici_kapatti"
    private const val BIZ_ACTIK = "biz_actik"
    private const val ONCEKI_FILTRE = "onceki_filtre"
    private const val AZAMI_KAPATILAN = 30

    private fun prefs(ctx: Context) = ctx.getSharedPreferences(DOSYA, Context.MODE_PRIVATE)
    private fun nm(ctx: Context) = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    fun kosulUri(ctx: Context): Uri = Uri.Builder().scheme("condition").authority(ctx.packageName).appendPath("namaz").build()

    /** "kural" (29+) | "filtre" (24–28) */
    fun destek(): String = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) "kural" else "filtre"

    fun erisimVarMi(ctx: Context): Boolean = try {
        nm(ctx).isNotificationPolicyAccessGranted
    } catch (_: Exception) {
        false
    }

    // ------------------------------------------------------------------ ayarlar
    data class Ayarlar(val etkin: Boolean, val cuma: Boolean, val vakit: Boolean, val vakitSureDk: Int, val kildimKapat: Boolean)

    fun ayarlarHam(ctx: Context): JSONObject {
        val o = try { prefs(ctx).getString(AYARLAR, null)?.let { JSONObject(it) } } catch (_: Exception) { null } ?: JSONObject()
        return JSONObject()
            .put("etkin", o.optBoolean("etkin", false))
            .put("cuma", o.optBoolean("cuma", true))
            .put("vakit", o.optBoolean("vakit", false))
            .put("vakitSureDk", o.optInt("vakitSureDk", 20).coerceIn(10, 40))
            .put("kildimKapat", o.optBoolean("kildimKapat", true))
    }

    fun ayarlar(ctx: Context): Ayarlar = ayarlarHam(ctx).let {
        Ayarlar(it.getBoolean("etkin"), it.getBoolean("cuma"), it.getBoolean("vakit"), it.getInt("vakitSureDk"), it.getBoolean("kildimKapat"))
    }

    /**
     * Ayarı yazar; etkinleşince kuralı kurar, kapanınca kaldırır.
     * @return "tamam" | "erisimYok" | "hata"
     */
    fun ayarlariYaz(ctx: Context, ham: JSONObject): String {
        val onceki = ayarlar(ctx).etkin
        prefs(ctx).edit().putString(AYARLAR, ham.toString()).apply()
        val yeni = ayarlar(ctx)
        prefs(ctx).edit().putString(AYARLAR, ayarlarHam(ctx).toString()).apply()
        return when {
            yeni.etkin -> kuraliGarantile(ctx)
            onceki -> { kuraliKaldir(ctx); "tamam" }
            else -> "tamam"
        }
    }

    // ------------------------------------------------------------------ kural
    fun kuralId(ctx: Context): String? = prefs(ctx).getString(KURAL_ID, null)

    /** Kural yoksa kurar. @return "tamam" | "erisimYok" | "hata" */
    fun kuraliGarantile(ctx: Context): String {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return if (erisimVarMi(ctx)) "tamam" else "erisimYok"
        val mevcut = kuralId(ctx)
        if (mevcut != null) {
            val var_ = try { nm(ctx).getAutomaticZenRule(mevcut) != null } catch (_: Exception) { false }
            if (var_) return "tamam"
        }
        return try {
            val ad = "Namaz"
            val ayarEkrani = ctx.packageManager.getLaunchIntentForPackage(ctx.packageName)?.component
                ?: ComponentName(ctx.packageName, "${ctx.packageName}.MainActivity")
            val kural = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM) {
                AutomaticZenRule.Builder(ad, kosulUri(ctx))
                    .setType(AutomaticZenRule.TYPE_OTHER)
                    .setTriggerDescription("Cuma hutbesinde, camideyken ya da vakit girince Namaz Akışı açar")
                    .setIconResId(R.drawable.ic_namaz_modu)
                    .setManualInvocationAllowed(true)
                    .setConfigurationActivity(ayarEkrani)
                    .setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_PRIORITY)
                    .setEnabled(true)
                    .build()
            } else {
                AutomaticZenRule(ad, null, ayarEkrani, kosulUri(ctx), null, NotificationManager.INTERRUPTION_FILTER_PRIORITY, true)
            }
            val id = nm(ctx).addAutomaticZenRule(kural)
            prefs(ctx).edit().putString(KURAL_ID, id).apply()
            "tamam"
        } catch (e: SecurityException) {
            "erisimYok"
        } catch (e: Exception) {
            Log.w(ETIKET, "Kural kurulamadi: ${e.message}")
            "hata"
        }
    }

    fun kuraliKaldir(ctx: Context) {
        tumunuKapat(ctx, kullanici = false)
        val id = kuralId(ctx) ?: return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            try { nm(ctx).removeAutomaticZenRule(id) } catch (_: Exception) { /* zaten yok */ }
        }
        prefs(ctx).edit().remove(KURAL_ID).apply()
    }

    // ------------------------------------------------------------------ kaynaklar
    private fun kaynaklar(ctx: Context): JSONObject =
        try { JSONObject(prefs(ctx).getString(KAYNAKLAR, "{}") ?: "{}") } catch (_: Exception) { JSONObject() }

    private fun kaynaklariYaz(ctx: Context, o: JSONObject) = prefs(ctx).edit().putString(KAYNAKLAR, o.toString()).apply()

    private fun kapatilanlar(ctx: Context): MutableList<String> =
        (prefs(ctx).getString(KAPATILAN, "") ?: "").split('\n').filter { it.isNotEmpty() }.toMutableList()

    private fun kapatilanEkle(ctx: Context, turlar: Collection<String>) {
        val l = kapatilanlar(ctx)
        turlar.forEach { if (it !in l) l.add(it) }
        prefs(ctx).edit().putString(KAPATILAN, l.takeLast(AZAMI_KAPATILAN).joinToString("\n")).apply()
    }

    fun aktifMi(ctx: Context): Boolean = kaynaklar(ctx).length() > 0

    /** Etkin kaynakların tur kimlikleri (JS "kıldım" kontrolü için). */
    fun aktifTurlar(ctx: Context): List<String> {
        val k = kaynaklar(ctx)
        return k.keys().asSequence().map { k.optString(it) }.toList()
    }

    /**
     * [kaynak] ("cami" | "plan") [tur] için modu açar.
     * @return "acildi" | "kapali" | "kullaniciKapatti" | "erisimYok" | "hata"
     */
    @Synchronized
    fun ac(ctx: Context, kaynak: String, tur: String): String {
        if (!ayarlar(ctx).etkin) return "kapali"
        kullaniciKapatmasiniYakala(ctx)
        if (tur in kapatilanlar(ctx)) return "kullaniciKapatti"
        val kural = kuraliGarantile(ctx)
        if (kural != "tamam") return kural
        val k = kaynaklar(ctx).put(kaynak, tur)
        kaynaklariYaz(ctx, k)
        return if (sistemeUygula(ctx, true)) "acildi" else "hata"
    }

    @Synchronized
    fun kapat(ctx: Context, kaynak: String) {
        val k = kaynaklar(ctx)
        if (!k.has(kaynak)) return
        k.remove(kaynak)
        kaynaklariYaz(ctx, k)
        if (k.length() == 0) sistemeUygula(ctx, false)
    }

    /** Tüm kaynakları kapatır. [kullanici] true ise turlar "elle kapatıldı" sayılır. */
    @Synchronized
    fun tumunuKapat(ctx: Context, kullanici: Boolean) {
        val k = kaynaklar(ctx)
        if (kullanici) kapatilanEkle(ctx, k.keys().asSequence().map { k.optString(it) }.toList())
        kaynaklariYaz(ctx, JSONObject())
        if (prefs(ctx).getBoolean(BIZ_ACTIK, false)) sistemeUygula(ctx, false)
    }

    /** Kullanıcı modu sistemden kapattı (API 35+ yayını ya da elle). */
    @Synchronized
    fun kullaniciKapatti(ctx: Context) {
        val k = kaynaklar(ctx)
        kapatilanEkle(ctx, k.keys().asSequence().map { k.optString(it) }.toList())
        kaynaklariYaz(ctx, JSONObject())
        prefs(ctx).edit().putBoolean(BIZ_ACTIK, false).apply()
        CamiGunluk.ekle(ctx, "modElleKapatildi")
    }

    /** Kural kullanıcı tarafından silindi: özelliği kapat (yeniden zorla kurma). */
    fun kuralSilindi(ctx: Context) {
        prefs(ctx).edit().remove(KURAL_ID).putBoolean(BIZ_ACTIK, false).apply()
        kaynaklariYaz(ctx, JSONObject())
        prefs(ctx).edit().putString(AYARLAR, ayarlarHam(ctx).put("etkin", false).toString()).apply()
    }

    /**
     * API 35 öncesinde kapatma yayını yok: "biz açık bıraktık ama sistemde
     * kapalı" ise kullanıcı kapatmıştır.
     */
    private fun kullaniciKapatmasiniYakala(ctx: Context) {
        if (!prefs(ctx).getBoolean(BIZ_ACTIK, false)) return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM) return
        val sistemdeAcik = try { nm(ctx).currentInterruptionFilter != NotificationManager.INTERRUPTION_FILTER_ALL } catch (_: Exception) { true }
        if (!sistemdeAcik) kullaniciKapatti(ctx)
    }

    private fun sistemeUygula(ctx: Context, acik: Boolean): Boolean {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val id = kuralId(ctx) ?: return false
                val durum = if (acik) Condition.STATE_TRUE else Condition.STATE_FALSE
                val kosul = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM) {
                    Condition(kosulUri(ctx), "Namaz", durum, Condition.SOURCE_CONTEXT)
                } else {
                    Condition(kosulUri(ctx), "Namaz", durum)
                }
                nm(ctx).setAutomaticZenRuleState(id, kosul)
            } else {
                val n = nm(ctx)
                if (!n.isNotificationPolicyAccessGranted) return false
                if (acik) {
                    if (!prefs(ctx).getBoolean(BIZ_ACTIK, false)) {
                        prefs(ctx).edit().putInt(ONCEKI_FILTRE, n.currentInterruptionFilter).apply()
                    }
                    n.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_PRIORITY)
                } else if (n.currentInterruptionFilter == NotificationManager.INTERRUPTION_FILTER_PRIORITY) {
                    // Yalnız bizim kurduğumuz hâl duruyorsa geri al; kullanıcı başka
                    // bir şey seçtiyse ona dokunma.
                    n.setInterruptionFilter(prefs(ctx).getInt(ONCEKI_FILTRE, NotificationManager.INTERRUPTION_FILTER_ALL))
                }
            }
            prefs(ctx).edit().putBoolean(BIZ_ACTIK, acik).apply()
            true
        } catch (e: Exception) {
            Log.w(ETIKET, "Mod durumu uygulanamadi: ${e.message}")
            false
        }
    }

    fun durumJson(ctx: Context): JSONObject = JSONObject()
        .put("destek", destek())
        .put("erisim", erisimVarMi(ctx))
        .put("kuralVar", kuralId(ctx) != null)
        .put("aktif", aktifMi(ctx))
        .put("ayarlar", ayarlarHam(ctx))
}
