package expo.modules.countdownnotification

import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.Intent
import android.os.Build
import android.content.Context
import android.util.Log
import expo.modules.countdownnotification.cekirdek.CanliGuncellemeKurallari
import expo.modules.countdownnotification.cekirdek.CanliTaniKurallari
import expo.modules.countdownnotification.cekirdek.CihazKurallari
import android.media.AudioManager

class ExpoCountdownNotificationModule : Module() {

    /**
     * Acik ses secici ekraninin promise'i. Ayni anda yalniz BIR secici acilabilir
     * (kullanici tek ekranla etkilesir); `OnActivityResult` bunu cozup temizler.
     *
     * `@Volatile` SART: `sesSecAsync` modul kuyrugunda (arka plan thread'i),
     * `OnActivityResult` ise ANA thread'de calisir. Gorunurluk garantisi olmadan
     * ana thread bayat bir deger okuyabilir → promise hic cozulmez ve ekran asili
     * kalir. Yeniden-giris de burada engellenir (bkz. `sesSecAsync`).
     */
    @Volatile
    private var bekleyenSecim: Promise? = null

    /** "Kendi dosyanizdan secin" (SAF) promise'i — `bekleyenSecim` ile ayni kurallar. */
    @Volatile
    private var bekleyenDosyaSecimi: Promise? = null

    override fun definition() = ModuleDefinition {
        Name("ExpoCountdownNotification")

        Function("startCountdown") {
            id: String,
            targetTimeMs: Double,
            title: String,
            bodyTemplate: String,
            channelId: String,
            smallIcon: String,
            themeType: String,
            autoDismissAtTarget: Boolean ->

            val context = appContext.reactContext
            if (context != null) {
                // Bildirimi doğrudan göster (Chronometer ile saymaya başlar)
                CountdownNotificationHelper.showCountdownNotification(
                    context, id, targetTimeMs.toLong(), title, bodyTemplate, channelId, smallIcon,
                    themeType, autoDismissAtTarget
                )
                // Süre dolduğunda tetiklenecek AlarmManager
                CountdownNotificationHelper.bitisAlarminiKur(
                    context, id, targetTimeMs.toLong(), title, bodyTemplate, channelId, smallIcon
                )
            }
            Unit
        }

        /**
         * `startCountdown`'ın Android 16 Live Update ikizi (issue #282). Expo
         * `Function` en fazla 8 argüman alır → `autoDismissAtTarget` ve öne çıkarma
         * verisi (ilerleme bölümleri, "Kıldım") tek JSON'da gelir. Öne çıkarma
         * desteklenmiyorsa (API < 36, kullanıcı kapattı, seri teması) helper eski
         * RemoteViews yoluna BİREBİR düşer.
         */
        Function("startCountdownCanli") {
            id: String,
            targetTimeMs: Double,
            title: String,
            bodyTemplate: String,
            channelId: String,
            smallIcon: String,
            themeType: String,
            ekJson: String ->

            val context = appContext.reactContext
            if (context != null) {
                val ek = CanliGuncellemeKurallari.ekYukuCoz(ekJson)
                CountdownNotificationHelper.showCountdownNotification(
                    context, id, targetTimeMs.toLong(), title, bodyTemplate, channelId, smallIcon,
                    themeType, ek.hedefteKaybol, ek
                )
                CountdownNotificationHelper.bitisAlarminiKur(
                    context, id, targetTimeMs.toLong(), title, bodyTemplate, channelId, smallIcon
                )
            }
            Unit
        }

        Function("stopCountdown") { id: String ->
            val context = appContext.reactContext
            if (context != null) {
                // Bildirimi iptal et (öne çıkarılmış ikizin tazelemesi dahil)
                CountdownNotificationHelper.cancelNotification(context, id)
                // Varsa iptal et (AlarmManager)
                CountdownNotificationHelper.bitisAlarminiIptalEt(context, id)
                // Now Bar planındaki ileriki dilimleri de düşür ("Kıldım", yeniden planlama).
                CanliPlan.kimligiDusur(context, id)
            }
            Unit
        }

        // ============================================================
        // NOW BAR / CANLI SAYAÇ PLANI (issue #282 ikinci aşama)
        // ============================================================

        /**
         * Öne çıkarma durumu: "desteklenmiyor" (API < 36), "kapali" (kullanıcı
         * sistemde "Canlı güncellemeler"i kapattı) ya da "acik". Binder çağrısı →
         * AsyncFunction.
         */
        AsyncFunction("canliDurumu") { promise: Promise ->
            val context = appContext.reactContext
            promise.resolve(
                when {
                    context == null || Build.VERSION.SDK_INT < 36 -> "desteklenmiyor"
                    CanliGuncelleme.destekleniyorMu(context) -> "acik"
                    else -> "kapali"
                }
            )
        }

        /**
         * Now Bar / Live Update TANISI (salt okur, JSON). Saha raporu: "saatte görünüyor,
         * telefonda görünmüyor" — ekran ve tanı raporu sistemin bildirimi GERÇEKTEN öne
         * çıkarıp çıkarmadığını (`FLAG_PROMOTED_ONGOING`) görsün. Binder çağrıları →
         * AsyncFunction. Kişisel veri yok (kimlik, sayı, bayrak, zaman).
         */
        AsyncFunction("canliTani") { promise: Promise ->
            val context = appContext.reactContext
            val json = try {
                if (context == null) null else canliTaniJsonu(context)
            } catch (e: Throwable) {
                Log.w("ExpoCountdown", "Canli tani okunamadi", e)
                null
            }
            promise.resolve(json)
        }

        /** JS'in hesapladığı olay listesini saklar, şu anki hâli uygular, zinciri kurar. */
        AsyncFunction("canliPlaniKur") { json: String, promise: Promise ->
            val context = appContext.reactContext
            if (context != null) CanliPlan.kur(context, json)
            promise.resolve(null)
        }

        /**
         * Sistemdeki öne çıkarma ayarını açar (Android 16: uygulamanın "Canlı
         * güncellemeler" sayfası). Yoksa uygulamanın bildirim ayarları, o da yoksa
         * uygulama ayrıntıları. @return açılan ekran ya da null.
         */
        AsyncFunction("canliAyarlariniAc") { promise: Promise ->
            val context: Context? = appContext.currentActivity ?: appContext.reactContext
            promise.resolve(if (context == null) null else canliAyarEkraniniAc(context))
        }

        Function("stopAll") {
            val context = appContext.reactContext
            if (context != null) {
                // Bellek-içi liste süreç ölünce boşalır; öne çıkarılmış sayaçlar
                // diskte de tutulur → ikisinin birleşimi.
                val ids = (CountdownNotificationHelper.getActiveIds() + CanliGuncelleme.kayitliIdler(context)).toSet()
                ids.forEach { id ->
                    CountdownNotificationHelper.cancelNotification(context, id)
                    CountdownNotificationHelper.bitisAlarminiIptalEt(context, id)
                }
            }
            Unit
        }

        // ============================================================
        // SESLI ANONS (muhafiz TTS) — Foreground Service KULLANILMAZ
        // ============================================================

        /**
         * Anons dilini (BCP-47) kaydeder; planli anonslar konusma aninda bunu kullanir.
         * Yazilmadiysa Turkce (eski surumle ayni).
         */
        /** Arayüz dili ("tr", "en", "id"…); widget ve bildirim metinleri bunu okur ([ArayuzDili]). */
        Function("arayuzDiliniAyarla") { kod: String ->
            val context = appContext.reactContext
            if (context != null) ArayuzDili.kaydet(context.applicationContext, kod)
            Unit
        }

        /**
         * Kullanıcının seçtiği vakit adı takımı (JSON) ya da `null` (anahtar silinir, dil
         * tablosu). Widget'lar `arayuzDiliniAyarla`'daki gibi tercih dinleyicisiyle
         * (`ArayuzDiliIzleyici`) yeniden çizilir.
         */
        Function("vakitAdlariniAyarla") { json: String? ->
            val context = appContext.reactContext
            if (context != null) ArayuzDili.vakitAdlariniKaydet(context.applicationContext, json)
            Unit
        }

        /**
         * Arayüzün rakam sistemi ("arab" = Doğu Arap rakamı) ya da `null` (anahtar silinir, Batı
         * rakamı). Yalnız yazar; okuyanlar `ArayuzDili.rakamSifiri` (bu modül) ve uygulama
         * modülündeki `rakamSifiri()` — widget'ı `ArayuzDiliIzleyici` anahtar değişince yeniden çizer.
         */
        Function("rakamSisteminiAyarla") { kod: String? ->
            val context = appContext.reactContext
            if (context != null) ArayuzDili.rakamSisteminiKaydet(context.applicationContext, kod)
            Unit
        }

        Function("anonsDiliniAyarla") { dil: String ->
            val context = appContext.reactContext
            if (context != null) AnonsKonusucu.diliKaydet(context.applicationContext, dil)
            Unit
        }

        /** Verilen zamanda [metin]'i kayitli anons diliyle seslendirecek exact alarm kurar. */
        Function("planlaAnons") { id: String, tetikZamanMs: Double, metin: String ->
            val context = appContext.reactContext
            if (context != null) {
                AnonsZamanlayici.planla(context.applicationContext, id, tetikZamanMs.toLong(), metin)
            }
            Unit
        }

        /** Tek bir anonsu iptal eder (ilgili bildirim iptal edilirken cagrilir). */
        Function("iptalEtAnons") { id: String ->
            val context = appContext.reactContext
            if (context != null) {
                AnonsZamanlayici.iptal(context.applicationContext, id)
            }
            Unit
        }

        /** Planli tum anonslari iptal eder (yeniden planlama oncesi temizlik). */
        Function("iptalEtTumAnonslar") {
            val context = appContext.reactContext
            if (context != null) {
                AnonsZamanlayici.tumunuIptal(context.applicationContext)
            }
            Unit
        }

        /**
         * Kimligi [onek] ile baslayan planli anonslari iptal eder (issue #273).
         * Muhafiz ve nafile anonslari ayni kayitta yasar; biri yeniden
         * planlanirken digerinin anonslari silinmemeli. Iptal edilen sayiyi dondurur.
         */
        Function("iptalEtOnekliAnonslar") { onek: String ->
            val context = appContext.reactContext
            if (context == null || onek.isEmpty()) {
                0
            } else {
                AnonsZamanlayici.eslesenleriIptalEt(context.applicationContext) { it.startsWith(onek) }.size
            }
        }

        /**
         * Bekleyen (gelecekteki) anons alarmi sayisi — bildirim siniri rehberi
         * (issue #298). SharedPreferences okumasi → AsyncFunction (JS thread'ini
         * bloklamasin). Baglam yoksa `null` (bilinmiyor).
         */
        AsyncFunction("bekleyenAnonsSayisi") { promise: Promise ->
            val context = appContext.reactContext
            promise.resolve(context?.let { AnonsZamanlayici.bekleyenSayisi(it.applicationContext) })
        }

        // ============================================================
        // BILDIRIM SESI SECIMI (sistem ses secici + kanal yonetimi)
        // ============================================================

        /**
         * Sistem ses secicisini acar; kullanicinin sectigi sesi
         * `{ uri, ad }` olarak dondurur. Vazgecilirse `null` doner.
         *
         * IZIN GEREKTIRMEZ (RingtoneManager). `RegisterActivityContracts` yerine
         * `OnActivityResult` kullanilir — Expo dokumani birincisi icin Activity
         * yasam dongusu uyumsuzlugu notu dusuyor.
         */
        AsyncFunction("sesSecAsync") { mevcutUri: String?, baslik: String, promise: Promise ->
            val aktivite = appContext.currentActivity
            if (aktivite == null) {
                promise.resolve(null)
                return@AsyncFunction
            }

            // YENIDEN-GIRIS KORUMASI: tek slotlu `bekleyenSecim` ikinci bir cagriyla
            // ezilirse ILK promise asla cozulmez (JS tarafi sonsuza kadar bekler) ve
            // ust uste iki secici acilir. Zaten acik bir secici varken yeni cagri
            // "vazgecildi" (null) ile kapatilir — ekran akisi bozulmaz, ilk secici
            // kullanicinin gordugu ekran olarak kalir.
            if (bekleyenSecim != null) {
                Log.w("CountdownModule", "Ses secici zaten acik; ikinci cagri yok sayildi")
                promise.resolve(null)
                return@AsyncFunction
            }

            try {
                bekleyenSecim = promise
                aktivite.startActivityForResult(
                    SesSecici.seciciIntenti(baslik, mevcutUri),
                    SesSecici.ISTEK_KODU
                )
            } catch (e: Exception) {
                Log.e("CountdownModule", "Ses secici acilamadi: ${e.message}")
                bekleyenSecim = null
                promise.resolve(null)
            }
        }

        /** "Kendi dosyanizdan" yolu bu cihazda var mi? (MediaStore'a izinsiz yazma = API 29+) */
        Function("sesDosyasiDestekleniyor") {
            SesIceAktarici.destekleniyorMu()
        }

        /**
         * Belge secicisini (SAF, audio) acar; secilen dosyayi dogrulayip MediaStore'a
         * (Bildirimler/NamazAkisi) kopyalar ve `{ uri, ad, hata }` dondurur. Vazgecilirse
         * `null`. IZIN GEREKTIRMEZ (bkz. [SesIceAktarici]).
         */
        AsyncFunction("sesDosyasiSecAsync") { promise: Promise ->
            val aktivite = appContext.currentActivity
            if (aktivite == null || !SesIceAktarici.destekleniyorMu()) {
                promise.resolve(null)
                return@AsyncFunction
            }
            if (bekleyenDosyaSecimi != null || bekleyenSecim != null) {
                Log.w("CountdownModule", "Bir secici zaten acik; ikinci cagri yok sayildi")
                promise.resolve(null)
                return@AsyncFunction
            }
            try {
                bekleyenDosyaSecimi = promise
                aktivite.startActivityForResult(SesIceAktarici.seciciIntenti(), SesIceAktarici.ISTEK_KODU)
            } catch (e: Exception) {
                Log.e("CountdownModule", "Belge secici acilamadi: ${e.message}")
                bekleyenDosyaSecimi = null
                promise.resolve(null)
            }
        }

        /**
         * "Vakit girdi" bildirimi icin sese ozgu kanal (`vakit_bildirim_<hash8>`) YOKSA
         * olusturur. Onem/desen taban `vakit_bildirim` ile ayni (bkz. [VakitKanallari]).
         */
        AsyncFunction("vakitKanaliniGarantile") {
            kanalId: String,
            kanalAdi: String,
            aciklama: String,
            sesUri: String,
            promise: Promise ->
            appContext.reactContext?.let { VakitKanallari.garantile(it, kanalId, kanalAdi, aciklama, sesUri) }
            promise.resolve(null)
        }

        /** Kullanilmayan `vakit_bildirim_*` kanallarini siler (taban kanal korunur). */
        AsyncFunction("vakitKanallariniTemizle") { korunacakIdler: List<String>, promise: Promise ->
            appContext.reactContext?.let { VakitKanallari.copleriTopla(it, korunacakIdler) }
            promise.resolve(null)
        }

        /** URI'nin gosterilecek adi; cozulemezse bos string. */
        AsyncFunction("sesAdiAl") { uri: String?, promise: Promise ->
            val context = appContext.reactContext
            promise.resolve(if (context == null) "" else SesSecici.sesAdi(context, uri))
        }

        // ── NEDEN BURADAN ITIBAREN `AsyncFunction` ──────────────────────────────
        // Expo'da `Function` JS THREAD'INDE SENKRON calisir; `AsyncFunction` modul
        // kuyruguna (arka plan thread'i) duser. Asagidaki cagrilarin hepsi AGIR:
        //   - `RingtoneManager.getRingtone()` + `Ringtone.play()/getTitle()` ic
        //     MediaPlayer'i kurar → `setDataSource` + `prepare` SENKRON I/O yapar;
        //     ses bulutta/SD kartta ise gorunur donma (ANR riski) yasanir.
        //   - kanal islemleri `NotificationManager` uzerinden BINDER cagrisidir;
        //     GC ayrica TUM kanallari enumerate eder.
        // JS thread'ini bloklamamak icin hepsi async; cagiran taraf `await`'ler.

        /** Secilen sesi aninda calar (onizleme). */
        AsyncFunction("sesiOnizle") { uri: String?, promise: Promise ->
            appContext.reactContext?.let { SesSecici.onizle(it, uri) }
            promise.resolve(null)
        }

        /** Calan onizlemeyi durdurur. */
        AsyncFunction("onizlemeyiDurdur") { promise: Promise ->
            SesSecici.durdur()
            promise.resolve(null)
        }

        /** Onizleme hala caliyor mu? (JS bitisi bekleyebilsin diye.) */
        AsyncFunction("onizlemeCaliyorMu") { promise: Promise ->
            promise.resolve(SesSecici.caliyorMu())
        }

        /**
         * Hash'li muhafiz kanalini YOKSA olusturur (tembel).
         * Kanal id'si JS tarafinda (ses + titresim) hash'inden uretilir
         * (bkz. sesKimligi.ts); `sesUri` null ise paketlenmis varsayilan ses kurulur.
         */
        AsyncFunction("muhafizKanaliniGarantile") {
            kanalId: String,
            kanalAdi: String,
            aciklama: String,
            sesUri: String?,
            acilMi: Boolean,
            titresim: Boolean,
            promise: Promise ->
            appContext.reactContext?.let {
                MuhafizKanallari.garantile(
                    it, kanalId, kanalAdi, aciklama, sesUri, acilMi, titresim
                )
            }
            promise.resolve(null)
        }

        /** Artik kullanilmayan hash'li muhafiz kanallarini siler (GC). */
        AsyncFunction("muhafizKanallariniTemizle") { korunacakIdler: List<String>, promise: Promise ->
            appContext.reactContext?.let { MuhafizKanallari.copleriTopla(it, korunacakIdler) }
            promise.resolve(null)
        }

        /**
         * Ses secici sonucu. `sesSecAsync` promise'i BURADA cozulur; her sonuc
         * yolunda (secim/iptal/hata) tam olarak BIR kez cozulur ve
         * `bekleyenSecim` temizlenir — aksi halde ekran ikinci acilista asili kalir.
         */
        OnActivityResult { _, payload ->
            if (payload.requestCode == SesIceAktarici.ISTEK_KODU) {
                val promise = bekleyenDosyaSecimi
                bekleyenDosyaSecimi = null
                if (promise != null) {
                    try {
                        val kaynak = payload.data?.data
                        val context = appContext.reactContext
                        if (kaynak == null || context == null) {
                            promise.resolve(null)
                        } else {
                            // Kopyalama I/O'dur: ANA thread'de (burasi) yapilmaz. Gecici
                            // okuma izni etkinlik yasadikca gecerlidir; hemen okunur.
                            Thread {
                                val sonuc = try {
                                    SesIceAktarici.iceAktar(context, kaynak)
                                } catch (e: Exception) {
                                    SesIceAktarici.Sonuc(hata = "yazilamadi")
                                }
                                promise.resolve(sonuc.harita())
                            }.start()
                        }
                    } catch (e: Exception) {
                        Log.e("CountdownModule", "Belge secici sonucu islenemedi: ${e.message}")
                        promise.resolve(null)
                    }
                }
            }
            if (payload.requestCode == SesSecici.ISTEK_KODU) {
                val promise = bekleyenSecim
                bekleyenSecim = null
                if (promise != null) {
                    // SONUC COZUMU KORUMALI: `payload.data` UCUNCU TARAF bir
                    // Activity'den gelir; extras'i unmarshall etmek OEM secicilerinde
                    // `BadParcelableException` firlatabilir (bkz. SesSecici.sonucuCoz).
                    // Burada yakalanmazsa (a) ana thread'de coker, (b) `bekleyenSecim`
                    // zaten null'landigi icin promise SAHIPSIZ kalir ve JS sonsuza
                    // kadar bekler. Hata da bir SONUCTUR: null ile cozulur.
                    try {
                        val uri = SesSecici.sonucuCoz(payload.data)
                        if (uri == null) {
                            promise.resolve(null)
                        } else {
                            val context = appContext.reactContext
                            val uriMetni = uri.toString()
                            promise.resolve(
                                mapOf(
                                    "uri" to uriMetni,
                                    "ad" to (context?.let { SesSecici.sesAdi(it, uriMetni) } ?: "")
                                )
                            )
                        }
                    } catch (e: Exception) {
                        Log.e("CountdownModule", "Ses secici sonucu islenemedi: ${e.message}")
                        promise.resolve(null)
                    }
                }
            }
        }

        /**
         * Uygulama pil optimizasyonundan muaf mi? (Doze ve OEM uyku kisitlari.)
         * Salt okur — REQUEST_IGNORE_BATTERY_OPTIMIZATIONS izni ISTENMEZ (Play riski).
         * `null` = bilinmiyor (eski API / hata): ekran yanlis alarm vermesin.
         */
        AsyncFunction("pilOptimizasyonuMuafMi") { promise: Promise ->
            promise.resolve(appContext.reactContext?.let { PilAyarlari.muafMi(it) })
        }

        /** Uygulama bilgisi (Pil → Kisitlanmamis); olmazsa pil optimizasyonu listesi. Izin istemez. */
        AsyncFunction("pilAyarlariniAc") { promise: Promise ->
            val aktivite = appContext.currentActivity
            promise.resolve(if (aktivite == null) null else PilAyarlari.ac(aktivite))
        }

        /** Cihaz Samsung mu? (Kurulum adimi/metinleri icin.) */
        Function("samsungMu") {
            PilAyarlari.samsungMu()
        }

        /**
         * Android tam surumu (`Build.VERSION.SDK_INT_FULL`: ana x 100000 + alt; QPR2 = 3600001).
         * Alan API 36'da geldi: eski calisma zamaninda statik alan erisimi `NoSuchFieldError`
         * atar → SDK kapisi + `CihazKurallari.tamSurum` icindeki yakalama. Bilinmiyorsa `null`.
         */
        Function("androidTamSurum") {
            if (Build.VERSION.SDK_INT >= CihazKurallari.TAM_SURUM_API) {
                CihazKurallari.tamSurum(Build.VERSION.SDK_INT) { tamSurumOku() }
            } else {
                null
            }
        }

        /**
         * Alarm ses duzeyi (`STREAM_ALARM`). Izin GEREKMEZ. Okunamazsa -1 (JS: bilinmiyor).
         * Teheccud uyandirmasi alarm sesiyle calar; duzey 0 ise duyulmaz.
         */
        AsyncFunction("alarmSesDuzeyi") { promise: Promise ->
            val ses = appContext.reactContext?.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
            val duzey = try {
                ses?.getStreamVolume(AudioManager.STREAM_ALARM) ?: -1
            } catch (_: Throwable) {
                -1
            }
            promise.resolve(duzey)
        }

        /**
         * Cihazda anons dilinin TTS verisi kurulu mu? (Ekran uyari gosterebilsin diye.) Ad
         * geriye uyumluluk icin "tr" kalir; soru kayitli anons dilini sorar.
         * Uc durum: true / false (gercekten yok) / null (bilinmiyor: baglam yok, zaman
         * asimi, hata). JS yalniz `false`ta uyari gosterir.
         */
        AsyncFunction("trDestekleniyorMu") { promise: Promise ->
            val context = appContext.reactContext
            if (context == null) {
                promise.resolve(null)
            } else {
                try {
                    AnonsKonusucu.dilDestekleniyorMu(context.applicationContext) { destekleniyor ->
                        promise.resolve(destekleniyor)
                    }
                } catch (e: Exception) {
                    Log.e("CountdownModule", "TTS dil sorgusu basarisiz: ${e.message}")
                    promise.resolve(null)
                }
            }
        }
    }

    private fun canliTaniJsonu(context: Context): String {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
        val plan = CanliPlan.taniOzeti(context)
        val izleme = (plan.gosterilenler + CanliGuncelleme.kayitliIdler(context)).toSortedSet()
        val aktif = izleme.mapNotNull { id ->
            val bildirimId = CountdownNotificationHelper.generateNotificationId(id)
            val gorunuyor = try {
                nm.activeNotifications.any { it.id == bildirimId }
            } catch (_: Throwable) {
                false
            }
            if (gorunuyor) id to CanliGuncelleme.olc(context, nm, bildirimId) else null
        }
        val izinVar = if (Build.VERSION.SDK_INT >= 36) {
            context.checkSelfPermission("android.permission.POST_PROMOTED_NOTIFICATIONS") ==
                android.content.pm.PackageManager.PERMISSION_GRANTED
        } else {
            null
        }
        return CanliTaniKurallari.taniJsonu(
            sdkInt = Build.VERSION.SDK_INT,
            sdkTam = if (Build.VERSION.SDK_INT >= CihazKurallari.TAM_SURUM_API) {
                CihazKurallari.tamSurum(Build.VERSION.SDK_INT) { tamSurumOku() }
            } else {
                null
            },
            samsung = PilAyarlari.samsungMu(),
            oneUi = CanliTaniKurallari.oneUiSurumu(sistemOzelligi("ro.build.version.oneui")),
            izinVar = izinVar,
            planOlaySayisi = plan.olaySayisi,
            sonrakiAlarmMs = plan.sonrakiAlarmMs,
            sonPlanMs = plan.sonMs,
            gosterilenler = plan.gosterilenler,
            sonGosterim = CanliGuncelleme.sonGosterim(context),
            aktifBildirimler = aktif,
            bayrakOkunabilir = CanliGuncelleme.bayrakOkunabilirMi(),
            // Ölçümler yukarıda (aktif + son gösterim) yazıldıktan SONRA okunur.
            sonOlcum = CanliGuncelleme.sonOlcum(context),
        )
    }

    /** Gizli `android.os.SystemProperties` — yansıma; her hata null (tanı asla fırlatmaz). */
    private fun sistemOzelligi(ad: String): String? = try {
        Class.forName("android.os.SystemProperties")
            .getMethod("get", String::class.java)
            .invoke(null, ad) as? String
    } catch (_: Throwable) {
        null
    }

    /** `canliAyarlariniAc` gövdesi (sıralı yedekler; `resolveActivity` KULLANILMAZ — AGENTS.md). */
    private fun canliAyarEkraniniAc(context: Context): String? {
        val paket = context.packageName
        val adaylar = mutableListOf<Pair<String, Intent>>()
        if (Build.VERSION.SDK_INT >= 36) {
            // Belgelenmiş eylem `Settings.ACTION_MANAGE_APP_PROMOTED_NOTIFICATIONS`
            // (developer.android.com "Live update"); dize değeri tahmin edilmez, YANSIMAYLA
            // okunur (bu SDK'da yoksa atlanır). Eski dize yedek olarak denenmeye devam eder.
            val belgeli = try {
                android.provider.Settings::class.java.getField("ACTION_MANAGE_APP_PROMOTED_NOTIFICATIONS").get(null) as? String
            } catch (_: Throwable) {
                null
            }
            if (belgeli != null) {
                adaylar += "canli" to Intent(belgeli).putExtra("android.provider.extra.APP_PACKAGE", paket)
            }
            adaylar += "canli" to Intent("android.settings.APP_NOTIFICATION_PROMOTION_SETTINGS")
                .putExtra("android.provider.extra.APP_PACKAGE", paket)
        }
        adaylar += "bildirim" to Intent("android.settings.APP_NOTIFICATION_SETTINGS")
            .putExtra("android.provider.extra.APP_PACKAGE", paket)
        adaylar += "uygulama" to Intent(
            "android.settings.APPLICATION_DETAILS_SETTINGS",
            android.net.Uri.fromParts("package", paket, null)
        )
        for ((ad, intent) in adaylar) {
            try {
                context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
                return ad
            } catch (_: android.content.ActivityNotFoundException) {
            } catch (e: Exception) {
                Log.w("ExpoCountdown", "Ayar ekrani acilamadi: $ad", e)
            }
        }
        return null
    }

    @androidx.annotation.RequiresApi(36)
    private fun tamSurumOku(): Int = Build.VERSION.SDK_INT_FULL
}
