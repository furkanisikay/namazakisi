package com.furkanisikay.namazakisi.saat.hatirlatma

import android.content.Context
import android.content.pm.PackageManager
import android.media.AudioAttributes
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import com.furkanisikay.namazakisi.saat.cekirdek.ElSikisma
import java.util.Locale
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicReference

/**
 * Saat hoparlöründen muhafız anonsu (saat W3, fikir 9). Karar SAF `AnonsKarari`'ndadır;
 * burası yalnız donanım yoklaması + TTS.
 *
 * - Önce `FEATURE_AUDIO_OUTPUT`, sonra `TYPE_BUILTIN_SPEAKER` (Google'ın önerdiği sıra).
 * - `Locale.forLanguageTag("tr-TR")` (JDK21'de `Locale(…)` kurucusu kullanımdan kalktı);
 *   Türkçe ses yoksa sessizce vazgeçilir (bildirim zaten titreşti) ve bir bayrak yazılır —
 *   ana ekran bunu kibarca söyler.
 * - `USAGE_ALARM` + `CONTENT_TYPE_SPEECH`: telefondaki anonsla aynı (namaz uygulaması
 *   beklentisi). `bitti` HER yolda tam bir kez çağrılır (14 sn tavan — telefondaki
 *   `AnonsReceiver` ile aynı: alarm yayını ARKA PLAN kuyruğundan gelir, ANR eşiği 60 sn;
 *   9 sn TTS'in soğuk başlamasıyla ilk anonsu kesebiliyordu).
 * - Kısa `PARTIAL_WAKE_LOCK` ALINMAZ: `WAKE_LOCK` izni saatin bilinçli izin kümesinde yok
 *   (yeni izin eklenmez). Pencereyi `goAsync` yayınının kendi uyanıklık kilidi taşır.
 * - TTS kurucusu ile `onInit` YARIŞI: `onInit` ana iş parçacığında, kurucu dönmeden de
 *   gelebilir → geri çağrı yakalanan değişkeni OKUMAZ; "kurucu döndü" ve "onInit geldi"
 *   olaylarından İKİNCİSİ konuşmayı başlatır (sayaç ile el sıkışma).
 */
object SaatAnonsu {
    private const val TAG = "SaatAnonsu"
    private const val ZAMAN_ASIMI_MS = ElSikisma.ANONS_ZAMAN_ASIMI_MS
    private const val PREFS = "saat_anons"
    private const val TURKCE_YOK = "turkce_yok"

    fun hoparlorVarMi(context: Context): Boolean {
        if (!context.packageManager.hasSystemFeature(PackageManager.FEATURE_AUDIO_OUTPUT)) return false
        val am = context.getSystemService(AudioManager::class.java) ?: return false
        return am.getDevices(AudioManager.GET_DEVICES_OUTPUTS).any { it.type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER }
    }

    /** Son denemede Türkçe ses bulunamadı mı? (ekrandaki bilgi satırı) */
    fun turkceYok(context: Context): Boolean =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean(TURKCE_YOK, false)

    fun konus(context: Context, metin: String, bitti: () -> Unit) {
        val app = context.applicationContext
        val tamam = AtomicBoolean(false)
        val ana = Handler(Looper.getMainLooper())
        val tts = AtomicReference<TextToSpeech?>(null)
        val initDurumu = java.util.concurrent.atomic.AtomicInteger(Int.MIN_VALUE)
        val elSikisma = ElSikisma()
        fun bitir() {
            if (!tamam.compareAndSet(false, true)) return
            ana.post {
                try {
                    tts.get()?.shutdown()
                } catch (_: Exception) {
                    // zaten kapalı
                }
                bitti()
            }
        }
        fun basla() {
            val t = tts.get()
            if (initDurumu.get() != TextToSpeech.SUCCESS || t == null) {
                bitir()
                return
            }
            try {
                val dil = t.setLanguage(Locale.forLanguageTag("tr-TR"))
                val yok = dil == TextToSpeech.LANG_MISSING_DATA || dil == TextToSpeech.LANG_NOT_SUPPORTED
                app.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean(TURKCE_YOK, yok).apply()
                if (yok) {
                    bitir()
                    return
                }
                t.setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                        .build(),
                )
                t.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                    override fun onStart(utteranceId: String?) = Unit
                    override fun onDone(utteranceId: String?) = bitir()
                    @Deprecated("Deprecated in Java")
                    override fun onError(utteranceId: String?) = bitir()
                    override fun onError(utteranceId: String?, errorCode: Int) = bitir()
                })
                if (t.speak(metin, TextToSpeech.QUEUE_FLUSH, null, "saat_anons") != TextToSpeech.SUCCESS) bitir()
            } catch (e: Exception) {
                Log.w(TAG, "TTS konusamadi", e)
                bitir()
            }
        }
        ana.postDelayed({ bitir() }, ZAMAN_ASIMI_MS)
        try {
            val yeni = TextToSpeech(app) { durum ->
                initDurumu.set(durum)
                // Kurucu henüz dönmediyse (tts null) konuşmayı kurucu tarafı başlatır.
                if (elSikisma.isaretle()) basla()
            }
            tts.set(yeni)
            if (elSikisma.isaretle()) ana.post { basla() }
        } catch (e: Exception) {
            Log.w(TAG, "TTS baslatilamadi", e)
            bitir()
        }
    }
}
