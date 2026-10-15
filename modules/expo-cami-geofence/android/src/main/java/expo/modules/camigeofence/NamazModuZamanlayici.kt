package expo.modules.camigeofence

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/**
 * Namaz modunun ZAMANA bağlı tetikleri (cuma hutbesi, vakit girişi).
 *
 * Pencereleri JS hesaplar (`src/core/namazModu/namazModuPlani.ts`, adhan ile) ve
 * buraya yazar; native yalnız sıradaki geçişe TEK bir alarm kurar (zincir) —
 * alarm bütçesini yemez (muhafız 360'a kadar kullanır, AGENTS.md). Plan
 * diskte durduğu için yeniden başlatmada [yenidenKur] zinciri sürdürür.
 */
object NamazModuZamanlayici {
    const val ACTION_PLAN = "expo.modules.camigeofence.NAMAZ_MODU_PLAN"
    private const val DOSYA = "namazakisi_namaz_modu_plan"
    private const val PLAN = "plan"
    private const val KAYNAK = "plan"
    private const val ISTEK_KODU = 7311

    data class Pencere(val bas: Long, val son: Long, val tur: String)

    private fun prefs(ctx: Context) = ctx.getSharedPreferences(DOSYA, Context.MODE_PRIVATE)

    fun planiYaz(ctx: Context, dizi: JSONArray) {
        prefs(ctx).edit().putString(PLAN, dizi.toString()).apply()
        uygula(ctx)
    }

    private fun plan(ctx: Context): List<Pencere> = try {
        val a = JSONArray(prefs(ctx).getString(PLAN, "[]") ?: "[]")
        (0 until a.length()).mapNotNull { i ->
            val o: JSONObject = a.optJSONObject(i) ?: return@mapNotNull null
            try { Pencere(o.getLong("bas"), o.getLong("son"), o.getString("tur")) } catch (_: Exception) { null }
        }.filter { it.son > it.bas }
    } catch (_: Exception) {
        emptyList()
    }

    /** Şu anki pencereye göre modu aç/kapa ve sıradaki geçişe alarm kur. */
    fun uygula(ctx: Context) {
        val simdi = System.currentTimeMillis()
        val p = plan(ctx)
        val aktif = p.filter { simdi >= it.bas && simdi < it.son }.maxByOrNull { it.bas }
        if (aktif != null && NamazModu.ayarlar(ctx).etkin) {
            // Bitiş = pencerenin sonu: zincir alarmı silinse bile (force-stop, OEM
            // uyku kısıtı) kaynak `son`'da kendiliğinden geçersizleşir.
            NamazModu.ac(ctx, KAYNAK, aktif.tur, aktif.son)
        } else {
            NamazModu.kapat(ctx, KAYNAK)
            NamazModu.suresiGecenleriTemizle(ctx)
        }
        val pi = PlanliAlarm.pendingIntent(ctx, NamazModuAlicisi::class.java, ACTION_PLAN, ISTEK_KODU)
        val sonraki = p.flatMap { listOf(it.bas, it.son) }.filter { it > simdi }.minOrNull()
        if (sonraki == null) PlanliAlarm.iptal(ctx, pi) else PlanliAlarm.kur(ctx, sonraki + 1_000, pi)
    }

    fun yenidenKur(ctx: Context) = uygula(ctx)
}
