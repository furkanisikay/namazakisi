package com.furkanisikay.namazakisi.alarm

import android.app.Activity
import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
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
import com.furkanisikay.namazakisi.arayuzDili
import com.furkanisikay.namazakisi.cekirdek.Rakam
import com.furkanisikay.namazakisi.cekirdek.rakamlariEsitle
import com.furkanisikay.namazakisi.dildeBaglam
import com.furkanisikay.namazakisi.rakamSifiri
import com.furkanisikay.namazakisi.rakamla
import com.furkanisikay.namazakisi.cekirdek.MuhafizAlarmKurallari
import com.furkanisikay.namazakisi.cekirdek.MuhafizAlarmKurallari.KildimYolu

/**
 * Gerçek alarmın TAM EKRANI (issue #74) — kilit ekranının üstünde açılır, ekranı yakar.
 *
 * SES BURADA ÇALINMAZ: ses alarm bildiriminin insistent kanal sesidir
 * ([MuhafizAlarmBildirimi]); ekran açıkken tam ekran yerine heads-up çıksa da ses aynı
 * kalır. Bu etkinlik yalnız büyük, tek bakışta anlaşılır düğmeler sunar ve düğmeler
 * bildirimdekilerle AYNI gövdeyi çağırır ([MuhafizAlarmEylemleri]).
 *
 * DÜĞMELER ANA THREAD'DE AĞIR İŞ YAPMAZ (M3): ses hemen kesilir (bildirim kaldırılır,
 * susturma alarmı iptal), asıl iş açık bileşenli yayınla [MuhafizAlarmAlici]'ya devredilir
 * (`goAsync` + arka plan iş parçacığı) ve etkinlik kapanır.
 *
 * KİLİT EKRANINDA "KILDIM" KAYIT YAZMAZ (M4 — #295 `KilitEkraniKarari`): kilitliyken önce
 * kilit açtırılır (API 26+ `requestDismissKeyguard`), yalnız başarıda işaretlenir; daha
 * eski sürümde kilitliyken düğme gizlenir. "Kapat" kayıt değildir, kilitliyken
 * de çalışır. Kilit açma iptal edilirse alarm yine susar ve aynı içerik sessiz bildirim
 * olarak kalır (oradaki "Kıldım" da kilit açtırır) — kişi işaretlemeyi kaybetmez.
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

    /** Kilit açma ekranı açıkken alarm bildirimi bilerek kaldırılmıştır → yoklama kapatmasın. */
    private var kilitBekleniyor = false

    private val denetle = object : Runnable {
        override fun run() {
            if (kilitBekleniyor) return
            val bitti = !MuhafizAlarmBildirimi.gosteriliyorMu(this@MuhafizAlarmActivity, kimlik) ||
                MuhafizAlarmKurallari.calmaBittiMi(baslangicMs, System.currentTimeMillis())
            if (bitti) finish() else zamanlayici.postDelayed(this, 1_000L)
        }
    }

    /** Düğmeler ("Kıldım", "Kapat") UYGULAMANIN arayüz dilinde; başlık/metin yükten (JS etkin dilde yazar). */
    override fun attachBaseContext(newBase: Context) {
        super.attachBaseContext(newBase.dildeBaglam())
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
        if (!kilitBekleniyor) zamanlayici.postDelayed(denetle, 1_000L)
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

    private fun kilitliMi(): Boolean = try {
        (getSystemService(KEYGUARD_SERVICE) as? KeyguardManager)?.isKeyguardLocked == true
    } catch (_: Exception) {
        // Bilinmiyorsa güvenli taraf: kilitli say (kayıt kilit açtırılarak yazılır).
        true
    }

    private fun kildimYolu(): KildimYolu =
        MuhafizAlarmKurallari.kildimYolu(kilitliMi(), Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)

    private fun eylemUygula(eylem: String) {
        val ham = hamYuk ?: return finish()
        if (kilitBekleniyor) return
        if (eylem == MuhafizAlarmAlici.EYLEM_KILDIM) {
            when (kildimYolu()) {
                KildimYolu.DOGRUDAN -> Unit
                KildimYolu.KILIDI_AC -> {
                    kilidiAcipIsaretle(ham)
                    return
                }
                // Düğme zaten çizilmez; yine de dokunuş gelirse kayıt yazılmaz.
                KildimYolu.GIZLE -> return
            }
        }
        sesiKes()
        yayinla(eylem, ham)
        finish()
    }

    /** Ses ANINDA kesilir: insistent ses ancak bildirim kalkınca durur. */
    private fun sesiKes() {
        MuhafizAlarmBildirimi.kaldir(this, kimlik)
        MuhafizAlarmAlici.susturmayiIptalEt(this, kimlik)
    }

    /** Asıl iş alıcıda (`goAsync` + arka plan): bildirim düğmeleriyle AYNI gövde. */
    private fun yayinla(eylem: String, ham: String) {
        try {
            sendBroadcast(MuhafizAlarmBildirimi.eylemNiyeti(this, eylem, kimlik, ham))
        } catch (e: Exception) {
            Log.w("MuhafizAlarm", "Alarm eylemi gonderilemedi: $eylem", e)
        }
    }

    private fun kilidiAcipIsaretle(ham: String) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val km = getSystemService(KEYGUARD_SERVICE) as? KeyguardManager ?: return
        // Kişi PIN girerken alarm bağırmaya devam etmesin.
        sesiKes()
        kilitBekleniyor = true
        zamanlayici.removeCallbacks(denetle)
        try {
            km.requestDismissKeyguard(
                this,
                object : KeyguardManager.KeyguardDismissCallback() {
                    override fun onDismissSucceeded() {
                        yayinla(MuhafizAlarmAlici.EYLEM_KILDIM, ham)
                        finish()
                    }

                    override fun onDismissCancelled() = kilitAcilmadi(ham)

                    override fun onDismissError() = kilitAcilmadi(ham)
                },
            )
        } catch (e: Exception) {
            Log.w("MuhafizAlarm", "Kilit acma istenemedi", e)
            kilitAcilmadi(ham)
        }
    }

    /** Kayıt YAZILMADI; alarm sustu → aynı içerik sessiz bildirim olarak kalsın. */
    private fun kilitAcilmadi(ham: String) {
        kilitBekleniyor = false
        MuhafizAlarmKurallari.yukCoz(ham)?.let { MuhafizAlarmBildirimi.normalGoster(this, it, ham, sessiz = true) }
        finish()
    }

    private fun arayuz(yuk: MuhafizAlarmKurallari.Yuk): View {
        // Görünen metin seçilen rakamla (Arapçada "arab" → ٠-٩); yük ve kimlik aynen kalır.
        val sifir = rakamSifiri()
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
            metin(yuk.vakitAdi.ifBlank { getString(R.string.alarm_baslik) }.rakamla(sifir), 34f, R.color.alarm_metin, kalin = true),
            LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply { topMargin = dp(20) },
        )
        // TextClock cihaz yerel ayarıyla yazar; yerel rakamlı arayüzde (Arapça, Bengalce, Farsça, Peştuca, Soranî) seçilen rakama eşitlenir.
        val saat = RakamliSaat(this, if (Rakam.yerelRakamli(arayuzDili())) sifir else null).apply {
            format24Hour = "HH:mm"
            format12Hour = "HH:mm"
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 64f)
            setTextColor(renk(R.color.alarm_metin))
            gravity = Gravity.CENTER
            typeface = Typeface.create("sans-serif-light", Typeface.NORMAL)
        }
        kok.addView(saat, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT))
        kok.addView(
            metin(yuk.baslik.rakamla(sifir), 18f, R.color.alarm_metin, kalin = true),
            LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply { topMargin = dp(16) },
        )
        if (yuk.metin.isNotBlank()) {
            kok.addView(
                metin(yuk.metin.rakamla(sifir), 15f, R.color.alarm_ikincil),
                LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply { topMargin = dp(8) },
            )
        }
        // Boşluk: düğmeler başparmağın eriştiği alta.
        kok.addView(View(this), LinearLayout.LayoutParams(1, 0, 1f))

        val kildimVar = MuhafizAlarmKurallari.kildimDugmesiVarMi(yuk) && kildimYolu() != KildimYolu.GIZLE
        if (kildimVar) {
            kok.addView(
                dugme(getString(R.string.alarm_kildim), dolu = true, eylem = MuhafizAlarmAlici.EYLEM_KILDIM),
                LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT),
            )
        }
        // ERTELE YOK (sahip kararı 2026-10-19, eski #289): yalnız "Kıldım" ve "Kapat".
        val satir = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        satir.addView(
            dugme(getString(R.string.alarm_kapat), dolu = false, eylem = MuhafizAlarmAlici.EYLEM_KAPAT),
            LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f),
        )
        kok.addView(
            satir,
            LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply {
                if (kildimVar) topMargin = dp(12)
            },
        )
        return kok
    }

    companion object {
        const val EK_BASLANGIC = "baslangicMs"
    }
}

/**
 * Seçilen rakamla çizen saat. `TextClock` biçimi `Locale.getDefault()` (CİHAZ yerel ayarı)
 * ile yapar, uygulamanın arayüz dilini görmez: ar-SA / bn-BD cihazda Batı seçene yerel, tr
 * cihazda yerel rakam seçene Batı rakamı yazardı. [sifir] null → dokunulmaz (yerel rakamsız
 * arayüz: cihazın biçimi birebir). Üst sınıf kurucusu da `setText` çağırır; o an alan henüz null'dır.
 */
private class RakamliSaat(context: Context, private val sifir: Char?) : TextClock(context) {
    override fun setText(text: CharSequence?, type: TextView.BufferType?) {
        val s = sifir
        super.setText(if (s == null || text == null) text else rakamlariEsitle(text.toString(), s), type)
    }
}
