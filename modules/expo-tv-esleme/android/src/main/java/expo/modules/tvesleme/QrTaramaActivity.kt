package expo.modules.tvesleme

import android.animation.ValueAnimator
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.graphics.Typeface
import android.os.Bundle
import android.util.TypedValue
import android.view.Gravity
import android.view.HapticFeedbackConstants
import android.view.View
import android.view.ViewGroup
import android.view.animation.OvershootInterpolator
import android.widget.FrameLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import com.google.zxing.BarcodeFormat
import com.google.zxing.BinaryBitmap
import com.google.zxing.DecodeHintType
import com.google.zxing.MultiFormatReader
import com.google.zxing.NotFoundException
import com.google.zxing.PlanarYUVLuminanceSource
import com.google.zxing.common.HybridBinarizer
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

/**
 * TV eşleştirme QR tarayıcısı — cihaz içi, Google'a hiçbir şey göndermez.
 *
 * CameraX önizleme + `ImageAnalysis` (yalnız en son kare) + ZXing QR çözücü. Yalnız
 * `namazakisi://` ile başlayan kod kabul edilir; başka bir QR'da tarama SÜRER ve ipucu
 * "Bu kod Namaz Akışı TV'ye ait değil" olur (yanlış kodla ekran kapanmasın).
 *
 * Hareket: tarama sırasında çerçeve DURGUNDUR. Kod tutunca köşeler yeşile döner ve çerçeve
 * bir kez büzülüp yerine oturur (kod "yakalandı"), kısa titreşim; ardından ekran kapanır.
 * Sonuç `EKSTRA_METIN` ile döner; vazgeçilirse `RESULT_CANCELED`.
 */
class QrTaramaActivity : AppCompatActivity() {
    private val analizci = Executors.newSingleThreadExecutor()
    private val bulundu = AtomicBoolean(false)
    private val okuyucu = MultiFormatReader().apply {
        setHints(mapOf(DecodeHintType.POSSIBLE_FORMATS to listOf(BarcodeFormat.QR_CODE)))
    }
    private lateinit var cerceve: TaramaCercevesi
    private lateinit var ipucu: TextView
    private var sonYabanciMs = 0L

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val kok = FrameLayout(this).apply { setBackgroundColor(Color.BLACK) }
        val onizleme = PreviewView(this).apply {
            implementationMode = PreviewView.ImplementationMode.COMPATIBLE
            scaleType = PreviewView.ScaleType.FILL_CENTER
        }
        cerceve = TaramaCercevesi(this)
        ipucu = TextView(this).apply {
            text = "TV ekranındaki kare kodu çerçeveye alın"
            setTextColor(Color.WHITE)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 18f)
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
            setPadding(dp(24), dp(16), dp(24), dp(16))
        }
        val vazgec = TextView(this).apply {
            text = "Vazgeçin"
            setTextColor(Color.WHITE)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 17f)
            gravity = Gravity.CENTER
            minHeight = dp(48)
            minWidth = dp(140)
            setPadding(dp(20), dp(12), dp(20), dp(12))
            background = android.graphics.drawable.GradientDrawable().apply {
                cornerRadius = dp(24).toFloat()
                setColor(0x66000000)
                setStroke(dp(1), 0x99FFFFFF.toInt())
            }
            contentDescription = "Taramadan vazgeçin"
            isClickable = true
            isFocusable = true
            setOnClickListener {
                setResult(Activity.RESULT_CANCELED)
                finish()
            }
        }
        val dolu = ViewGroup.LayoutParams.MATCH_PARENT
        kok.addView(onizleme, FrameLayout.LayoutParams(dolu, dolu))
        kok.addView(cerceve, FrameLayout.LayoutParams(dolu, dolu))
        kok.addView(ipucu, FrameLayout.LayoutParams(dolu, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.TOP).apply { topMargin = dp(64) })
        kok.addView(
            vazgec,
            FrameLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL)
                .apply { bottomMargin = dp(56) },
        )
        setContentView(kok)
        kameraBaslat(onizleme)
    }

    private fun kameraBaslat(onizleme: PreviewView) {
        val gelecek = ProcessCameraProvider.getInstance(this)
        gelecek.addListener({
            try {
                val saglayici = gelecek.get()
                val preview = Preview.Builder().build().also { it.setSurfaceProvider(onizleme.surfaceProvider) }
                val analiz = ImageAnalysis.Builder()
                    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                    .build()
                analiz.setAnalyzer(analizci) { kare -> kareyiCoz(kare) }
                saglayici.unbindAll()
                saglayici.bindToLifecycle(this, CameraSelector.DEFAULT_BACK_CAMERA, preview, analiz)
            } catch (e: Exception) {
                // Kamera yok / meşgul: JS "kodla aktarın" yoluna yönlendirir.
                setResult(Activity.RESULT_FIRST_USER)
                finish()
            }
        }, ContextCompat.getMainExecutor(this))
    }

    private fun kareyiCoz(kare: ImageProxy) {
        try {
            if (bulundu.get()) return
            val duzlem = kare.planes[0]
            val tampon = duzlem.buffer
            val adim = duzlem.rowStride
            val veri = ByteArray(adim * kare.height)
            tampon.rewind()
            tampon.get(veri, 0, minOf(tampon.remaining(), veri.size))
            val kaynak = PlanarYUVLuminanceSource(veri, adim, kare.height, 0, 0, kare.width, kare.height, false)
            val sonuc = try {
                okuyucu.decodeWithState(BinaryBitmap(HybridBinarizer(kaynak)))
            } catch (_: NotFoundException) {
                null
            } finally {
                okuyucu.reset()
            }
            val metin = sonuc?.text ?: return
            if (!metin.trim().lowercase().startsWith("namazakisi://")) {
                val simdi = System.currentTimeMillis()
                if (simdi - sonYabanciMs > 2500) {
                    sonYabanciMs = simdi
                    runOnUiThread {
                        ipucu.text = "Bu kod Namaz Akışı TV'ye ait değil. TV'deki kodu okutun."
                        ipucu.announceForAccessibility(ipucu.text)
                    }
                }
                return
            }
            if (!bulundu.compareAndSet(false, true)) return
            runOnUiThread { yakalandi(metin) }
        } catch (_: Exception) {
            // Tek kare çözülemedi; sonraki kare denenir.
        } finally {
            kare.close()
        }
    }

    private fun yakalandi(metin: String) {
        cerceve.performHapticFeedback(HapticFeedbackConstants.CONFIRM)
        ipucu.text = "Kod okundu"
        val sonuc = Intent().putExtra(EKSTRA_METIN, metin)
        cerceve.yakala(animasyonAcik()) {
            setResult(Activity.RESULT_OK, sonuc)
            finish()
        }
    }

    private fun animasyonAcik(): Boolean = try {
        android.provider.Settings.Global.getFloat(contentResolver, android.provider.Settings.Global.ANIMATOR_DURATION_SCALE, 1f) > 0f
    } catch (_: Exception) {
        true
    }

    override fun onDestroy() {
        super.onDestroy()
        analizci.shutdown()
    }

    private fun dp(d: Int): Int = (d * resources.displayMetrics.density).toInt()

    companion object {
        const val EKSTRA_METIN = "metin"
        const val ISTEK_KODU = 47286

        fun niyet(baglam: Context) = Intent(baglam, QrTaramaActivity::class.java)
    }
}

/**
 * Ortada yuvarlak köşeli kare pencere; dışı karartılır, köşelerde beyaz köşebentler.
 * `yakala`: köşebentler yeşile döner, çerçeve %88'e büzülüp yayla yerine oturur (≈ 450 ms).
 */
private class TaramaCercevesi(baglam: Context) : View(baglam) {
    private val karartma = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0x99000000.toInt() }
    private val kose = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.WHITE
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        strokeWidth = 5f * resources.displayMetrics.density
    }
    private var olcek = 1f
    private val yol = Path()
    private val pencere = RectF()

    fun yakala(animasyon: Boolean, bitti: () -> Unit) {
        kose.color = 0xFF4CAF50.toInt()
        if (!animasyon) {
            invalidate()
            postDelayed(bitti, 250)
            return
        }
        ValueAnimator.ofFloat(0.88f, 1f).apply {
            duration = 420
            interpolator = OvershootInterpolator(2.2f)
            addUpdateListener {
                olcek = it.animatedValue as Float
                invalidate()
            }
            start()
        }
        postDelayed(bitti, 560)
    }

    override fun onDraw(c: Canvas) {
        val kenar = minOf(width, height) * 0.7f * olcek
        val sol = (width - kenar) / 2
        val ust = (height - kenar) / 2
        pencere.set(sol, ust, sol + kenar, ust + kenar)
        val r = 24f * resources.displayMetrics.density
        yol.reset()
        yol.fillType = Path.FillType.EVEN_ODD
        yol.addRect(0f, 0f, width.toFloat(), height.toFloat(), Path.Direction.CW)
        yol.addRoundRect(pencere, r, r, Path.Direction.CW)
        c.drawPath(yol, karartma)
        val l = kenar * 0.16f
        // Dört köşebent.
        c.drawLine(sol, ust + r, sol, ust + l, kose); c.drawLine(sol + r, ust, sol + l, ust, kose)
        c.drawLine(sol + kenar, ust + r, sol + kenar, ust + l, kose); c.drawLine(sol + kenar - r, ust, sol + kenar - l, ust, kose)
        c.drawLine(sol, ust + kenar - r, sol, ust + kenar - l, kose); c.drawLine(sol + r, ust + kenar, sol + l, ust + kenar, kose)
        c.drawLine(sol + kenar, ust + kenar - r, sol + kenar, ust + kenar - l, kose); c.drawLine(sol + kenar - r, ust + kenar, sol + kenar - l, ust + kenar, kose)
        c.drawArc(sol, ust, sol + 2 * r, ust + 2 * r, 180f, 90f, false, kose)
        c.drawArc(sol + kenar - 2 * r, ust, sol + kenar, ust + 2 * r, 270f, 90f, false, kose)
        c.drawArc(sol, ust + kenar - 2 * r, sol + 2 * r, ust + kenar, 90f, 90f, false, kose)
        c.drawArc(sol + kenar - 2 * r, ust + kenar - 2 * r, sol + kenar, ust + kenar, 0f, 90f, false, kose)
    }
}
