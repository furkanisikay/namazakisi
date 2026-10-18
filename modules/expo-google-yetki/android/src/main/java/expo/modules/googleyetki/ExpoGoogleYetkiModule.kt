package expo.modules.googleyetki

import android.app.Activity
import android.content.Context
import android.os.SystemClock
import android.util.Log
import com.google.android.gms.auth.api.identity.AuthorizationRequest
import com.google.android.gms.auth.api.identity.AuthorizationResult
import com.google.android.gms.auth.api.identity.ClearTokenRequest
import com.google.android.gms.auth.api.identity.Identity
import com.google.android.gms.auth.api.identity.RevokeAccessRequest
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.common.api.Scope
import expo.modules.googleyetki.cekirdek.YetkiKurallari
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Google Drive yetkisi — Google Identity Services Authorization API (issue #288).
 *
 * NEDEN BU YOL: Google yeni Android OAuth istemcilerinde "Özel URI şeması"nı artık
 * sunmuyor; tarayıcı + özel şema yönlendirmeli PKCE akışı bu istemcilerle çalışmaz.
 * Authorization API istemci kimliği ya da yönlendirme İSTEMEZ: Google, çağıran
 * uygulamanın paket adı + imza SHA-1'ini Cloud projesindeki Android istemcileriyle
 * eşler (Play imza, yükleme ve debug anahtarı için ayrı istemciler).
 *
 * Belirteç YALNIZ ERİŞİM belirtecidir (yenileme belirteci yok): Play hizmetleri onu
 * önbellekler ve `authorize()` kullanıcıya sormadan yeniden verir. Bayat/iptal edilmiş
 * belirteç önbellekte kalabileceği için 401'de önce [belirteciTemizle] çağrılmalıdır,
 * yoksa `authorize()` AYNI belirteci döndürür.
 *
 * İki kip:
 *  - etkileşimli (`baglan`): onay gerekiyorsa sistem onay ekranı açılır
 *    (`startIntentSenderForResult` → [OnActivityResult]).
 *  - etkileşimsiz (arka plan turu, 401 yenilemesi): onay gerekiyorsa ekran AÇILMAZ,
 *    `cozumGerekli` döner (Activity yoktur; izin geri alınmış demektir).
 *
 * HİÇBİR FONKSİYON FIRLATMAZ: sonuç `{ durum: ... }` nesnesidir, hata da bir sonuçtur.
 * Tek-slotlu promise kuralları ses seçicideki derslerle aynı: `@Volatile`, yeniden-giriş
 * reddi, her yolda TAM BİR KEZ çözüm, sonuç çözümü try/catch içinde.
 */
class ExpoGoogleYetkiModule : Module() {

    /**
     * Açık onay ekranının promise'i. `@Volatile`: `yetkiAl` görev dinleyicisinde,
     * [OnActivityResult] ana thread'de yazar/okur; görünürlük garantisi olmadan promise
     * hiç çözülmeyebilir.
     */
    @Volatile
    private var bekleyenYetki: Promise? = null

    /** Slotun dolduğu an (`elapsedRealtime`); yalnız [kilit] altında okunur/yazılır. */
    private var bekleyenZamanMs = 0L
    private val kilit = Any()

    private fun baglam(): Context? =
        appContext.reactContext?.applicationContext ?: appContext.reactContext

    override fun definition() = ModuleDefinition {
        Name("ExpoGoogleYetki")

        /**
         * Google Play hizmetleri kullanılabilir mi? (Huawei / Google'sız cihazda `false`
         * → Drive kartı HİÇ çizilmez.) PackageManager sorgusu; hızlı, senkron.
         */
        Function("playHizmetleriVarMi") {
            val ctx = baglam() ?: return@Function false
            try {
                GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(ctx) ==
                    ConnectionResult.SUCCESS
            } catch (e: Exception) {
                Log.w(ETIKET, "Play hizmetleri sorgulanamadi: ${e.message}")
                false
            }
        }

        /** İstenen kapsamlar için erişim belirteci. Bkz. sınıf belgesi (iki kip). */
        AsyncFunction("yetkiAl") { kapsamlar: List<String>, etkilesimli: Boolean, promise: Promise ->
            val ctx = baglam()
            if (ctx == null) {
                promise.resolve(hata(null, "baglam yok"))
                return@AsyncFunction
            }
            try {
                Identity.getAuthorizationClient(ctx)
                    .authorize(istek(kapsamlar))
                    .addOnSuccessListener { sonuc -> sonucuIsle(sonuc, etkilesimli, promise) }
                    .addOnFailureListener { e -> promise.resolve(hataSonucu(e)) }
            } catch (e: Exception) {
                promise.resolve(hataSonucu(e))
            }
        }

        /** Önbellekteki (bayat/iptal edilmiş) erişim belirtecini Play hizmetlerinden siler. */
        AsyncFunction("belirteciTemizle") { belirtec: String, promise: Promise ->
            val ctx = baglam()
            if (ctx == null || belirtec.isBlank()) {
                promise.resolve(false)
                return@AsyncFunction
            }
            try {
                Identity.getAuthorizationClient(ctx)
                    .clearToken(ClearTokenRequest.builder().setToken(belirtec).build())
                    .addOnSuccessListener { promise.resolve(true) }
                    .addOnFailureListener { e ->
                        Log.w(ETIKET, "Belirtec temizlenemedi: ${e.message}")
                        promise.resolve(false)
                    }
            } catch (e: Exception) {
                Log.w(ETIKET, "Belirtec temizlenemedi: ${e.message}")
                promise.resolve(false)
            }
        }

        /**
         * Uygulamaya verilen kapsam iznini Google tarafında geri alır (bağlantıyı kes).
         * Hesap, etkileşimsiz `authorize()` sonucundan okunur; okunamazsa `false` döner
         * ve JS HTTP iptal uç noktasına düşer.
         */
        AsyncFunction("erisimiGeriAl") { kapsamlar: List<String>, promise: Promise ->
            val ctx = baglam()
            if (ctx == null) {
                promise.resolve(false)
                return@AsyncFunction
            }
            try {
                val istemci = Identity.getAuthorizationClient(ctx)
                istemci.authorize(istek(kapsamlar))
                    .addOnSuccessListener { sonuc ->
                        val hesap = try {
                            sonuc.toGoogleSignInAccount()?.account
                        } catch (e: Exception) {
                            null
                        }
                        if (sonuc.hasResolution() || hesap == null) {
                            promise.resolve(false)
                            return@addOnSuccessListener
                        }
                        try {
                            istemci.revokeAccess(
                                RevokeAccessRequest.builder()
                                    .setAccount(hesap)
                                    .setScopes(kapsamlar.map { Scope(it) })
                                    .build()
                            )
                                .addOnSuccessListener { promise.resolve(true) }
                                .addOnFailureListener { e ->
                                    Log.w(ETIKET, "Erisim geri alinamadi: ${e.message}")
                                    promise.resolve(false)
                                }
                        } catch (e: Exception) {
                            Log.w(ETIKET, "Erisim geri alinamadi: ${e.message}")
                            promise.resolve(false)
                        }
                    }
                    .addOnFailureListener { promise.resolve(false) }
            } catch (e: Exception) {
                Log.w(ETIKET, "Erisim geri alinamadi: ${e.message}")
                promise.resolve(false)
            }
        }

        OnActivityResult { _, payload ->
            if (payload.requestCode != ISTEK_KODU) return@OnActivityResult
            val promise = synchronized(kilit) {
                val p = bekleyenYetki
                bekleyenYetki = null
                p
            } ?: return@OnActivityResult
            // Sonuç çözümü KORUMALI: hata da bir SONUÇTUR. Yakalanmazsa ana thread'de
            // çöker ve promise (zaten null'landı) SAHİPSİZ kalır → JS sonsuza dek bekler.
            try {
                if (payload.resultCode != Activity.RESULT_OK) {
                    promise.resolve(mapOf("durum" to "iptal"))
                    return@OnActivityResult
                }
                val ctx = baglam()
                if (ctx == null) {
                    promise.resolve(hata(null, "baglam yok"))
                    return@OnActivityResult
                }
                val sonuc = Identity.getAuthorizationClient(ctx)
                    .getAuthorizationResultFromIntent(payload.data)
                promise.resolve(belirtecSonucu(sonuc))
            } catch (e: Exception) {
                promise.resolve(hataSonucu(e))
            }
        }
    }

    private fun istek(kapsamlar: List<String>): AuthorizationRequest =
        // `requestOfflineAccess` ÇAĞRILMAZ: web istemci kimliği ister ve yenileme
        // belirteci gerekmez (erişim belirtecini Play hizmetleri tazeler).
        AuthorizationRequest.builder()
            .setRequestedScopes(kapsamlar.map { Scope(it) })
            .build()

    private fun sonucuIsle(sonuc: AuthorizationResult, etkilesimli: Boolean, promise: Promise) {
        try {
            if (!sonuc.hasResolution()) {
                promise.resolve(belirtecSonucu(sonuc))
                return
            }
            val aktivite = appContext.currentActivity
            val niyet = sonuc.pendingIntent
            if (!etkilesimli || aktivite == null || niyet == null) {
                promise.resolve(mapOf("durum" to "cozumGerekli"))
                return
            }
            // YENİDEN-GİRİŞ: tek slot ikinci çağrıyla ezilirse İLK promise asla çözülmez
            // ve üst üste iki onay ekranı açılır. BAYAT SLOT: onay ekranının sonucu hiç
            // gelmezse (süreç öldürülüp geri yüklendi, sistem sonucu yuttu) slot sonsuza
            // dek dolu kalır ve her yeni bağlanma `mesgul` döner → kullanıcı Drive'ı bir
            // daha bağlayamaz. 10 dk'dan eski slot `iptal` ile kapatılıp devralınır
            // (`YetkiKurallari.slotDevralinabilirMi`).
            var bayat: Promise? = null
            val kabul = synchronized(kilit) {
                val simdi = SystemClock.elapsedRealtime()
                val mevcut = bekleyenYetki
                if (!YetkiKurallari.slotDevralinabilirMi(mevcut != null, simdi - bekleyenZamanMs)) {
                    false
                } else {
                    bayat = mevcut
                    bekleyenYetki = promise
                    bekleyenZamanMs = simdi
                    true
                }
            }
            bayat?.let {
                Log.w(ETIKET, "Bayat onay slotu devralindi")
                try {
                    it.resolve(mapOf("durum" to "iptal"))
                } catch (e: Exception) {
                    Log.w(ETIKET, "Bayat promise cozulemedi: ${e.message}")
                }
            }
            if (!kabul) {
                promise.resolve(mapOf("durum" to "mesgul"))
                return
            }
            try {
                aktivite.startIntentSenderForResult(niyet.intentSender, ISTEK_KODU, null, 0, 0, 0)
            } catch (e: Exception) {
                synchronized(kilit) { if (bekleyenYetki === promise) bekleyenYetki = null }
                promise.resolve(hataSonucu(e))
            }
        } catch (e: Exception) {
            promise.resolve(hataSonucu(e))
        }
    }

    private fun belirtecSonucu(sonuc: AuthorizationResult): Map<String, Any> {
        val belirtec = sonuc.accessToken
        if (belirtec.isNullOrBlank()) return hata(null, "belirtec yok")
        // Ayrıntılı onayda kullanıcı kapsamın işaretini kaldırabilir: verilen kapsamlar
        // JS'e gider, JS Drive kapsamı yoksa "reddedildi" sayar.
        val verilen = try {
            sonuc.grantedScopes.toList()
        } catch (e: Exception) {
            emptyList()
        }
        return mapOf("durum" to "izin", "belirtec" to belirtec, "kapsamlar" to verilen)
    }

    private fun hataSonucu(e: Exception): Map<String, Any> {
        val kod = (e as? ApiException)?.statusCode
        // SIGN_IN_REQUIRED → `cozumGerekli` (ekran "Yeniden bağlanın" gösterir); kural saf çekirdekte.
        val durum = YetkiKurallari.durumKodu(kod)
        if (durum != null) return mapOf("durum" to durum)
        Log.w(ETIKET, "Yetki alinamadi (kod=$kod): ${e.message}")
        return hata(kod, e.message)
    }

    private fun hata(kod: Int?, mesaj: String?): Map<String, Any> {
        val sonuc = mutableMapOf<String, Any>("durum" to "hata")
        if (kod != null) sonuc["kod"] = kod
        if (!mesaj.isNullOrBlank()) sonuc["mesaj"] = mesaj
        return sonuc
    }

    companion object {
        private const val ETIKET = "GoogleYetki"

        /** `OnActivityResult` ile eşleşen istek kodu ("GY1"). */
        const val ISTEK_KODU = 0x6731
    }
}
