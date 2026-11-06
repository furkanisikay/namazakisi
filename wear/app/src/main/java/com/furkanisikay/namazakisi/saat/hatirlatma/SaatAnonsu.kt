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
import com.furkanisikay.namazakisi.saat.cekirdek.AnonsKarari.SesDurumu
import com.furkanisikay.namazakisi.saat.cekirdek.ElSikisma
import java.util.Locale
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicReference

/**
 * Saat hoparlöründen muhafız anonsu (saat W3, fikir 9). Karar SAF `AnonsKarari`'ndadır;
 * burası yalnız donanım yoklaması + TTS.
 *
 * - Önce `FEATURE_AUDIO_OUTPUT`, sonra `TYPE_BUILTIN_SPEAKER` (Google'ın önerdiği sıra).
 * - Paket görünürlüğü: manifestte `TTS_SERVICE` `<queries>` girdisi (Android 11+ için
 *   `TextToSpeech` belgesinin istediği). Yoksa motor görünmeyebilir, `onInit` hata döner ve
 *   saat SESSİZCE hiç konuşmaz. Sonuç `son_durum` olarak yazılır, ana ekran nedeni söyler.
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
    private const val SON_DURUM = "son_durum"

    fun hoparlorVarMi(context: Context): Boolean {
        if (!context.packageManager.hasSystemFeature(PackageManager.FEATURE_AUDIO_OUTPUT)) return false
        val am = context.getSystemService(AudioManager::class.java) ?: return false
        return am.getDevices(AudioManager.GET_DEVICES_OUTPUTS).any { it.type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER }
    }

    /** Son denemede Türkçe ses bulunamadı mı? */
    fun turkceYok(context: Context): Boolean = sonDurum(context) == SesDurumu.TURKCE_YOK

    /**
     * Son konuşma denemesinin sonucu (ana ekranın bilgi satırı). Eski sürümün yazdığı
     * `turkce_yok` bayrağı da okunur: güncellemeden sonra ilk denemeye kadar satır kaybolmasın.
     */
    fun sonDurum(context: Context): SesDurumu {
        val p = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val d = SesDurumu.coz(p.getString(SON_DURUM, null))
        return if (d == SesDurumu.BILINMIYOR && p.getBoolean(TURKCE_YOK, false)) SesDurumu.TURKCE_YOK else d
    }

    private fun durumYaz(app: Context, d: SesDurumu) {
        app.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putString(SON_DURUM, d.kod)
            .putBoolean(TURKCE_YOK, d == SesDurumu.TURKCE_YOK)
            .apply()
    }

    /**
     * @param bitti HER yolda tam bir kez, ana iş parçacığında, denemenin sonucuyla çağrılır
     *   (zaman aşımı `HATA`); sonuç diske de yazılır.
     */
    fun konus(context: Context, metin: String, dil: String = "tr-TR", bitti: (SesDurumu) -> Unit) {
        val app = context.applicationContext
        val tamam = AtomicBoolean(false)
        val ana = Handler(Looper.getMainLooper())
        val tts = AtomicReference<TextToSpeech?>(null)
        val initDurumu = java.util.concurrent.atomic.AtomicInteger(Int.MIN_VALUE)
        val elSikisma = ElSikisma()
        fun bitir(sonuc: SesDurumu) {
            if (!tamam.compareAndSet(false, true)) return
            durumYaz(app, sonuc)
            ana.post {
                try {
                    tts.get()?.shutdown()
                } catch (_: Exception) {
                    // zaten kapalı
                }
                bitti(sonuc)
            }
        }
        fun basla() {
            val t = tts.get()
            if (initDurumu.get() != TextToSpeech.SUCCESS || t == null) {
                // Motor yok ya da bağlanamadı (Android 11+ paket görünürlüğü: manifestteki
                // TTS_SERVICE `<queries>` girdisi olmadan motorlar hiç görünmez).
                Log.w(TAG, "TTS baslatilamadi: onInit=${initDurumu.get()}")
                bitir(SesDurumu.MOTOR_YOK)
                return
            }
            try {
                val sonuc = t.setLanguage(Locale.forLanguageTag(dil))
                val yok = sonuc == TextToSpeech.LANG_MISSING_DATA || sonuc == TextToSpeech.LANG_NOT_SUPPORTED
                if (yok) {
                    bitir(SesDurumu.TURKCE_YOK)
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
                    override fun onDone(utteranceId: String?) = bitir(SesDurumu.KONUSTU)
                    @Deprecated("Deprecated in Java")
                    override fun onError(utteranceId: String?) = bitir(SesDurumu.HATA)
                    override fun onError(utteranceId: String?, errorCode: Int) {
                        Log.w(TAG, "TTS hata kodu $errorCode")
                        bitir(SesDurumu.HATA)
                    }
                })
                if (t.speak(metin, TextToSpeech.QUEUE_FLUSH, null, "saat_anons") != TextToSpeech.SUCCESS) {
                    bitir(SesDurumu.HATA)
                }
            } catch (e: Exception) {
                Log.w(TAG, "TTS konusamadi", e)
                bitir(SesDurumu.HATA)
            }
        }
        ana.postDelayed({ bitir(SesDurumu.HATA) }, ZAMAN_ASIMI_MS)
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
            bitir(SesDurumu.MOTOR_YOK)
        }
    }
}
