package expo.modules.countdownnotification

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import java.util.Locale
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Metni Turkce TTS ile seslendirir.
 *
 * Kurallar:
 * - Ses akisi `USAGE_ALARM` + `CONTENT_TYPE_SPEECH` -> sessiz mod/DND asilir
 *   (namaz uygulamasi beklentisi; vakit cikiyor uyarisi kacmamali).
 * - Audio focus `AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK` -> muzik kisilir, konusma
 *   biter, muzik geri gelir. Android 8+ `AudioFocusRequest` nesnesi kullanilir ve
 *   AYNI nesneyle birakilir.
 * - Turkce dil verisi yoksa SESSIZCE vazgecilir (bildirim zaten cikiyor).
 * - Cagiran taraf `BroadcastReceiver.goAsync()` penceresinde oldugu icin
 *   [AZAMI_SURE_MS] zaman asimi ile pencere HER DURUMDA kapatilir.
 */
object AnonsKonusucu {
    private const val ETIKET = "AnonsKonusucu"
    private const val SOYLEM_ID = "muhafiz_anons"

    /** goAsync penceresi ~10 sn; guvenli tarafta 9 sn'de kapat. */
    private const val AZAMI_SURE_MS = 9_000L

    /** TTS motorunun baglanmasi icin beklenen azami sure (dil sorgusu). */
    private const val SORGU_ZAMAN_ASIMI_MS = 5_000L

    private fun sesOzellikleri(): AudioAttributes =
        AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
            .build()

    /**
     * [metin]'i seslendirir; is bitince (veya hata/zaman asiminda) [bittiginde] cagrilir.
     * [bittiginde] TAM OLARAK BIR KEZ cagrilir.
     */
    fun konus(context: Context, metin: String, bittiginde: () -> Unit) {
        val uygulama = context.applicationContext
        val isleyici = Handler(Looper.getMainLooper())
        val bitti = AtomicBoolean(false)

        if (metin.isBlank()) {
            bittiginde()
            return
        }

        val sesYoneticisi = uygulama.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
        val ozellikler = sesOzellikleri()
        val odakDinleyicisi = AudioManager.OnAudioFocusChangeListener { /* kisa anons: odak degisimine tepki yok */ }
        var odakIstegi: AudioFocusRequest? = null
        var motor: TextToSpeech? = null

        // Cihaz uyanik kalsin: alarm wakelock'u onReceive donunce garanti degil,
        // konusma ise goAsync penceresinde devam ediyor.
        val uyandirmaKilidi = try {
            (uygulama.getSystemService(Context.POWER_SERVICE) as? PowerManager)
                ?.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "NamazAkisi:muhafizAnons")
                ?.apply {
                    setReferenceCounted(false)
                    acquire(AZAMI_SURE_MS + 1_000L)
                }
        } catch (e: Exception) {
            Log.w(ETIKET, "Wakelock alinamadi: ${e.message}")
            null
        }

        fun temizle() {
            if (!bitti.compareAndSet(false, true)) return
            // TTS geri cagrilari binder thread'inden gelir -> temizligi ana thread'e al.
            isleyici.post {
                try { motor?.stop() } catch (_: Exception) { /* yok sayilir */ }
                try { motor?.shutdown() } catch (_: Exception) { /* yok sayilir */ }
                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        odakIstegi?.let { sesYoneticisi?.abandonAudioFocusRequest(it) }
                    } else {
                        @Suppress("DEPRECATION")
                        sesYoneticisi?.abandonAudioFocus(odakDinleyicisi)
                    }
                } catch (_: Exception) { /* yok sayilir */ }
                try {
                    if (uyandirmaKilidi?.isHeld == true) uyandirmaKilidi.release()
                } catch (_: Exception) { /* yok sayilir */ }
                isleyici.removeCallbacksAndMessages(null)
                bittiginde()
            }
        }

        isleyici.postDelayed({ temizle() }, AZAMI_SURE_MS)

        motor = TextToSpeech(uygulama) { durum ->
            if (durum != TextToSpeech.SUCCESS) {
                Log.w(ETIKET, "TTS motoru baslatilamadi (durum=$durum); anons atlandi")
                temizle()
                return@TextToSpeech
            }
            val aktifMotor = motor
            if (aktifMotor == null) {
                temizle()
                return@TextToSpeech
            }
            try {
                val dilSonucu = aktifMotor.setLanguage(Locale.forLanguageTag("tr-TR"))
                if (dilSonucu == TextToSpeech.LANG_MISSING_DATA || dilSonucu == TextToSpeech.LANG_NOT_SUPPORTED) {
                    Log.w(ETIKET, "Turkce TTS verisi yok (sonuc=$dilSonucu); anons atlandi")
                    temizle()
                    return@TextToSpeech
                }

                aktifMotor.setAudioAttributes(ozellikler)

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    val istek = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                        .setAudioAttributes(ozellikler)
                        .setOnAudioFocusChangeListener(odakDinleyicisi)
                        .build()
                    odakIstegi = istek
                    sesYoneticisi?.requestAudioFocus(istek)
                } else {
                    @Suppress("DEPRECATION")
                    sesYoneticisi?.requestAudioFocus(
                        odakDinleyicisi,
                        AudioManager.STREAM_ALARM,
                        AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK
                    )
                }

                aktifMotor.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                    override fun onStart(utteranceId: String?) { /* islem yok */ }
                    override fun onDone(utteranceId: String?) = temizle()
                    @Deprecated("Ust siniftaki eski imza; yeni imza asagida")
                    override fun onError(utteranceId: String?) = temizle()
                    override fun onError(utteranceId: String?, errorCode: Int) = temizle()
                })

                val parametreler = Bundle().apply {
                    putInt(TextToSpeech.Engine.KEY_PARAM_STREAM, AudioManager.STREAM_ALARM)
                    putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, SOYLEM_ID)
                }
                val sonuc = aktifMotor.speak(metin, TextToSpeech.QUEUE_FLUSH, parametreler, SOYLEM_ID)
                if (sonuc != TextToSpeech.SUCCESS) {
                    Log.w(ETIKET, "TTS speak basarisiz (sonuc=$sonuc)")
                    temizle()
                }
            } catch (e: Exception) {
                Log.e(ETIKET, "Anons okunamadi: ${e.message}")
                temizle()
            }
        }
    }

    /**
     * Cihazda Turkce TTS verisi kurulu mu? JS tarafi bunu sorup ekranda uyari
     * gosterebilsin diye. Hata/zaman asiminda `false` doner (asla firlatmaz).
     */
    fun turkceDestekleniyorMu(context: Context, sonucaVar: (Boolean) -> Unit) {
        val uygulama = context.applicationContext
        val isleyici = Handler(Looper.getMainLooper())
        val bitti = AtomicBoolean(false)
        var motor: TextToSpeech? = null

        fun bildir(deger: Boolean) {
            if (!bitti.compareAndSet(false, true)) return
            isleyici.post {
                try { motor?.shutdown() } catch (_: Exception) { /* yok sayilir */ }
                isleyici.removeCallbacksAndMessages(null)
                sonucaVar(deger)
            }
        }

        isleyici.postDelayed({ bildir(false) }, SORGU_ZAMAN_ASIMI_MS)

        try {
            motor = TextToSpeech(uygulama) { durum ->
                if (durum != TextToSpeech.SUCCESS) {
                    bildir(false)
                    return@TextToSpeech
                }
                val kod = try {
                    motor?.isLanguageAvailable(Locale.forLanguageTag("tr-TR")) ?: TextToSpeech.LANG_NOT_SUPPORTED
                } catch (e: Exception) {
                    Log.w(ETIKET, "Dil sorgusu basarisiz: ${e.message}")
                    TextToSpeech.LANG_NOT_SUPPORTED
                }
                bildir(kod >= TextToSpeech.LANG_AVAILABLE)
            }
        } catch (e: Exception) {
            Log.e(ETIKET, "TTS motoru olusturulamadi: ${e.message}")
            bildir(false)
        }
    }
}
