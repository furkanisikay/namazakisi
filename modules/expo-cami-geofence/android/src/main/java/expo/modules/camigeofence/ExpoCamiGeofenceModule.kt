package expo.modules.camigeofence

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import android.util.Log
import expo.modules.camigeofence.cekirdek.CamiSabitleri
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONArray
import org.json.JSONObject

/**
 * Camideyim (#297) + Namaz modu (#277) JS köprüsü. Karar native'dedir; JS ayar
 * okur/yazar, vakit pencerelerini ve mod planını gönderir, günlüğü okur.
 *
 * Tüm çağrılar `AsyncFunction` (modül kuyruğu): SharedPreferences, varlık okuma,
 * binder çağrıları JS thread'ini bloklamasın (AGENTS.md ANR dersi). Karmaşık
 * veriler JSON dizesi olarak taşınır (sözleşme JS tarafında `src/index.ts`).
 */
class ExpoCamiGeofenceModule : Module() {

    private fun ctx(): Context? = appContext.reactContext?.applicationContext

    private fun ekraniAc(intent: Intent): Boolean {
        val aktivite = appContext.currentActivity
        return try {
            if (aktivite != null) {
                aktivite.startActivity(intent)
            } else {
                val c = ctx() ?: return false
                c.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            }
            true
        } catch (_: ActivityNotFoundException) {
            false
        } catch (e: SecurityException) {
            Log.w("CamiGeofence", "Ayar ekrani acilamadi: ${e.message}")
            false
        }
    }

    override fun definition() = ModuleDefinition {
        Name("ExpoCamiGeofence")

        Events("onCamiOlayi")

        OnCreate {
            CamiOlaylari.dinleyici = { tur -> sendEvent("onCamiOlayi", mapOf("tur" to tur)) }
        }

        OnDestroy {
            CamiOlaylari.dinleyici = null
        }

        // ------------------------------------------------------------ Camideyim
        AsyncFunction("durumAl") { promise: Promise ->
            val c = ctx()
            if (c == null) {
                promise.resolve("{}")
                return@AsyncFunction
            }
            val veri = CamiVeriKaynagi.al(c)
            promise.resolve(
                JSONObject()
                    .put("veriVar", veri != null)
                    .put("kayitSayisi", veri?.kayitSayisi ?: 0)
                    .put("veriZamani", veri?.veriZamani ?: 0)
                    .put("izin", CamiIzleyici.izinDurumu(c))
                    .put("izlenenSayisi", CamiDepo.izlenenler(c).size)
                    .put("camide", CamiDepo.camide(c)?.json() ?: JSONObject.NULL)
                    .put("sessizBitisMs", CamiDepo.sessizBitisMs(c))
                    .put("namazModu", NamazModu.durumJson(c))
                    .toString()
            )
        }

        /**
         * Muhafız sessizliğinin bittiği an (ms) ya da 0 — muhafız teslimcisi her
         * planlama turunda sorar (camideyken acil kanal kullanılmaz). Hafif:
         * cami verisine dokunmaz.
         */
        AsyncFunction("sessizBitisMs") { promise: Promise ->
            promise.resolve(ctx()?.let { CamiDepo.sessizBitisMs(it).toDouble() } ?: 0.0)
        }

        AsyncFunction("ayarlariAl") { promise: Promise ->
            promise.resolve(ctx()?.let { CamiDepo.ayarlarHam(it).toString() } ?: "{}")
        }

        /** Ayarı yazar, izlemeyi [lat],[lng]'ye göre yeniden kurar (konum yoksa son merkez). */
        AsyncFunction("ayarlariYaz") { json: String, lat: Double?, lng: Double?, promise: Promise ->
            val c = ctx()
            if (c == null) {
                promise.resolve("hata")
                return@AsyncFunction
            }
            val yazilan = try { CamiDepo.ayarlariYaz(c, JSONObject(json)) } catch (_: Exception) { null }
            if (yazilan == null) {
                promise.resolve("hata")
                return@AsyncFunction
            }
            if (!yazilan.getBoolean("aktif")) {
                CamiIzleyici.kaldir(c)
                CamiDurumu.bitir(c, "kapatildi")
                promise.resolve("kapali")
                return@AsyncFunction
            }
            val bitti: (String) -> Unit = { promise.resolve(it) }
            if (lat != null && lng != null) CamiIzleyici.kur(c, lat, lng, tazeMerkez = false, bitti = bitti)
            else CamiIzleyici.sonMerkezeGoreKur(c, bitti)
        }

        /** Vakit kapısı pencereleri (JS hesaplar: giriş −20/+60, cuma −90/+90). */
        AsyncFunction("pencereleriYaz") { json: String, promise: Promise ->
            ctx()?.let { c -> try { CamiDepo.pencereleriYaz(c, JSONArray(json)) } catch (_: Exception) { /* bozuk yok sayılır */ } }
            promise.resolve(null)
        }

        /** İzlemeyi yeni bir merkeze göre tazele (konum değişimi, 15 dk görevi). */
        AsyncFunction("izlemeyiTazele") { lat: Double, lng: Double, promise: Promise ->
            val c = ctx()
            if (c == null || !CamiDepo.ayarlar(c).aktif) {
                promise.resolve("kapali")
                return@AsyncFunction
            }
            CamiIzleyici.kur(c, lat, lng, tazeMerkez = false) { promise.resolve(it) }
        }

        /** Yakındaki camiler (ayar ekranı listesi) — en yakın [k], mesafe sıralı. */
        AsyncFunction("yakinCamiler") { lat: Double, lng: Double, k: Int, promise: Promise ->
            val c = ctx()
            val veri = c?.let { CamiVeriKaynagi.al(it) }
            val a = JSONArray()
            veri?.enYakinlar(lat, lng, k.coerceIn(1, 100), CamiSabitleri.ARAMA_AZAMI_M)?.forEach { e ->
                val k_ = e.kayit
                a.put(
                    JSONObject().put("id", k_.id).put("ad", k_.ad).put("lat", k_.lat).put("lng", k_.lng)
                        .put("yaricapM", k_.yaricapM).put("poligonVar", k_.poligon != null).put("mesafeM", e.mesafeM)
                )
            }
            promise.resolve(a.toString())
        }

        AsyncFunction("gunlukAl") { promise: Promise ->
            promise.resolve(ctx()?.let { CamiGunluk.tumu(it) } ?: "[]")
        }

        AsyncFunction("gunluguTemizle") { promise: Promise ->
            ctx()?.let { CamiGunluk.temizle(it) }
            promise.resolve(null)
        }

        /** Camide hâlini kullanıcı uygulamadan bitirir. */
        AsyncFunction("camidenCik") { promise: Promise ->
            ctx()?.let { CamiDurumu.bitir(it, "kapatildi") }
            promise.resolve(null)
        }

        AsyncFunction("kildimBekleyenleriAl") { promise: Promise ->
            promise.resolve(ctx()?.let { CamiKildimKuyrugu.tumu(it) } ?: "[]")
        }

        AsyncFunction("kildimTamamlandi") { id: String, promise: Promise ->
            ctx()?.let { CamiKildimKuyrugu.tamamlandi(it, id) }
            promise.resolve(null)
        }

        AsyncFunction("kildimBasarisiz") { id: String, promise: Promise ->
            ctx()?.let { CamiKildimKuyrugu.basarisiz(it, id) }
            promise.resolve(null)
        }

        // ------------------------------------------------------------ Namaz modu
        AsyncFunction("namazModuDurumu") { promise: Promise ->
            promise.resolve(ctx()?.let { NamazModu.durumJson(it).toString() } ?: "{}")
        }

        /** @return "tamam" | "erisimYok" | "hata" */
        AsyncFunction("namazModuAyarlariniYaz") { json: String, promise: Promise ->
            val c = ctx()
            if (c == null) {
                promise.resolve("hata")
                return@AsyncFunction
            }
            val sonuc = try { NamazModu.ayarlariYaz(c, JSONObject(json)) } catch (_: Exception) { "hata" }
            NamazModuZamanlayici.uygula(c)
            promise.resolve(sonuc)
        }

        /** Zamana bağlı pencereler [{bas, son, tur}] — JS hesaplar. */
        AsyncFunction("namazModuPlaniniYaz") { json: String, promise: Promise ->
            ctx()?.let { c -> try { NamazModuZamanlayici.planiYaz(c, JSONArray(json)) } catch (_: Exception) { /* bozuk */ } }
            promise.resolve(null)
        }

        /** "Kıldım" (uygulama içi / bildirim) → bu turun modu kapanır (ayar açıksa). */
        AsyncFunction("namazModuKildim") { promise: Promise ->
            ctx()?.let { c -> if (NamazModu.ayarlar(c).kildimKapat && NamazModu.aktifMi(c)) NamazModu.tumunuKapat(c, kullanici = true) }
            promise.resolve(null)
        }

        AsyncFunction("namazModuAktifTurlari") { promise: Promise ->
            promise.resolve(ctx()?.let { JSONArray(NamazModu.aktifTurlar(it)).toString() } ?: "[]")
        }

        /** Rahatsız Etmeyin erişimi ekranı (izin İSTENMEZ, ekran açılır). */
        AsyncFunction("erisimAyariniAc") { promise: Promise ->
            promise.resolve(ekraniAc(Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS)))
        }

        /** Modun kendi ayar ekranı (API 35+), yoksa genel Rahatsız Etmeyin ekranı. */
        AsyncFunction("modAyarlariniAc") { promise: Promise ->
            val c = ctx()
            val id = c?.let { NamazModu.kuralId(it) }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM && id != null &&
                ekraniAc(Intent(Settings.ACTION_AUTOMATIC_ZEN_RULE_SETTINGS).putExtra(Settings.EXTRA_AUTOMATIC_ZEN_RULE_ID, id))
            ) {
                promise.resolve(true)
                return@AsyncFunction
            }
            promise.resolve(ekraniAc(Intent("android.settings.ZEN_MODE_SETTINGS")))
        }
    }
}
