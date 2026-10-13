package com.furkanisikay.namazakisi.alarm

import android.app.Activity
import android.content.Intent
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextClock
import android.widget.TextView
import com.furkanisikay.namazakisi.R
import com.furkanisikay.namazakisi.cekirdek.MuhafizAlarmKurallari

/**
 * Gerçek alarmın TAM EKRANI (issue #74) — kilit ekranının üstünde açılır, ekranı yakar.
 *
 * SES BURADA ÇALINMAZ: ses alarm bildiriminin insistent kanal sesidir
 * ([MuhafizAlarmBildirimi]); ekran açıkken tam ekran yerine heads-up çıksa da ses aynı
 * kalır. Bu etkinlik yalnız büyük, tek bakışta anlaşılır düğmeler sunar ve düğmeler
 * bildirimdekilerle AYNI gövdeyi çağırır ([MuhafizAlarmEylemleri]).
 *
 * Kendini kapatır: alarm başka bir yoldan kalktıysa (bildirimden "Kıldım", saatten
 * "Kıldım", süre doldu) saniyede bir yoklanır — ayrı bir yayın kanalı kurulmaz.
 *
 * Görünüm kodla kurulur (XML yerleşimi yok); renkler `values/alarm_renkleri.xml` (ve gece ikizi)
 * gelir (gece modu kaynakla çözülür).
 */
class MuhafizAlarmActivity : Activity() {

    private val zamanlayici = Handler(Looper.getMainLooper())
    private var hamYuk: String? = null
    private var kimlik: String = ""
    private var baslangicMs: Long = 0L

    private val denetle = object : Runnable {
        override fun run() {
            val bitti = !MuhafizAlarmBildirimi.gosteriliyorMu(this@MuhafizAlarmActivity, kimlik) ||
                MuhafizAlarmKurallari.calmaBittiMi(baslangicMs, System.currentTimeMillis())
            if (bitti) finish() else zamanlayici.postDelayed(this, 1_000L)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        kilitEkranindaGoster()
        if (!yukle(intent)) {
            finish()
            return
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        if (!yukle(intent)) finish()
    }

    override fun onResume() {
        super.onResume()
        zamanlayici.removeCallbacks(denetle)
        zamanlayici.postDelayed(denetle, 1_000L)
    }

    override fun onPause() {
        zamanlayici.removeCallbacks(denetle)
        super.onPause()
    }

    private fun kilitEkranindaGoster() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON)
        }
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    }

    private fun yukle(intent: Intent?): Boolean {
        val ham = intent?.getStringExtra(MuhafizAlarmAlici.EK_YUK) ?: return false
        val yuk = MuhafizAlarmKurallari.yukCoz(ham) ?: return false
        hamYuk = ham
        kimlik = yuk.kimlik
        baslangicMs = intent.getLongExtra(EK_BASLANGIC, System.currentTimeMillis())
        setContentView(arayuz(yuk))
        return true
    }

    private fun dp(deger: Int): Int =
        TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, deger.toFloat(), resources.displayMetrics).toInt()

    private fun renk(kimlik: Int): Int = getColor(kimlik)

    private fun metin(yazi: CharSequence, boyutSp: Float, renkId: Int, kalin: Boolean = false) = TextView(this).apply {
        text = yazi
        setTextSize(TypedValue.COMPLEX_UNIT_SP, boyutSp)
        setTextColor(renk(renkId))
        gravity = Gravity.CENTER
        if (kalin) typeface = Typeface.DEFAULT_BOLD
    }

    private fun dugme(yazi: String, dolu: Boolean, eylem: String) = Button(this).apply {
        text = yazi
        isAllCaps = false
        setTextSize(TypedValue.COMPLEX_UNIT_SP, if (dolu) 20f else 16f)
        typeface = Typeface.DEFAULT_BOLD
        setTextColor(renk(if (dolu) R.color.alarm_birincil_ustu else R.color.alarm_metin))
        background = GradientDrawable().apply {
            cornerRadius = dp(24).toFloat()
            setColor(renk(if (dolu) R.color.alarm_birincil else R.color.alarm_ikincil_zemin))
            if (!dolu) setStroke(dp(1), renk(R.color.alarm_sinir))
        }
        stateListAnimator = null
        minHeight = dp(if (dolu) 64 else 56)
        setOnClickListener { eylemUygula(eylem) }
    }

    private fun eylemUygula(eylem: String) {
        val ham = hamYuk ?: return finish()
        MuhafizAlarmEylemleri.uygula(this, eylem, ham)
        finish()
    }

    private fun arayuz(yuk: MuhafizAlarmKurallari.Yuk): View {
        val kok = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER_HORIZONTAL
            setBackgroundColor(renk(R.color.alarm_zemin))
            setPadding(dp(24), dp(48), dp(24), dp(32))
            setOnApplyWindowInsetsListener { v, ic ->
                // Kenardan kenara (Android 15+): içerik sistem çubuklarının altına girmesin.
                @Suppress("DEPRECATION")
                v.setPadding(dp(24), dp(32) + ic.systemWindowInsetTop, dp(24), dp(24) + ic.systemWindowInsetBottom)
                ic
            }
        }
        val ikon = ImageView(this).apply {
            setImageResource(R.drawable.ic_alarm_muhafiz)
            setColorFilter(renk(R.color.alarm_birincil))
            background = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(renk(R.color.alarm_ikon_zemin))
            }
            setPadding(dp(20), dp(20), dp(20), dp(20))
            importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO
        }
        kok.addView(ikon, LinearLayout.LayoutParams(dp(96), dp(96)).apply { topMargin = dp(24) })
        kok.addView(
            metin(yuk.vakitAdi.ifBlank { getString(R.string.alarm_baslik) }, 34f, R.color.alarm_metin, kalin = true),
            LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply { topMargin = dp(20) },
        )
        val saat = TextClock(this).apply {
            format24Hour = "HH:mm"
            format12Hour = "HH:mm"
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 64f)
            setTextColor(renk(R.color.alarm_metin))
            gravity = Gravity.CENTER
            typeface = Typeface.create("sans-serif-light", Typeface.NORMAL)
        }
        kok.addView(saat, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT))
        kok.addView(
            metin(yuk.baslik, 18f, R.color.alarm_metin, kalin = true),
            LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply { topMargin = dp(16) },
        )
        if (yuk.metin.isNotBlank()) {
            kok.addView(
                metin(yuk.metin, 15f, R.color.alarm_ikincil),
                LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply { topMargin = dp(8) },
            )
        }
        // Boşluk: düğmeler başparmağın eriştiği alta.
        kok.addView(View(this), LinearLayout.LayoutParams(1, 0, 1f))

        kok.addView(
            dugme(getString(R.string.alarm_kildim), dolu = true, eylem = MuhafizAlarmAlici.EYLEM_KILDIM),
            LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT),
        )
        val satir = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        val ertelenir = MuhafizAlarmKurallari.ertelemeDugmesiVarMi(System.currentTimeMillis(), yuk.erteleSinirMs)
        if (ertelenir) {
            satir.addView(
                dugme(getString(R.string.alarm_ertele), dolu = false, eylem = MuhafizAlarmAlici.EYLEM_ERTELE),
                LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply { marginEnd = dp(12) },
            )
        }
        satir.addView(
            dugme(getString(R.string.alarm_kapat), dolu = false, eylem = MuhafizAlarmAlici.EYLEM_KAPAT),
            LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f),
        )
        kok.addView(
            satir,
            LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply { topMargin = dp(12) },
        )
        return kok
    }

    companion object {
        const val EK_BASLANGIC = "baslangicMs"
    }
}
