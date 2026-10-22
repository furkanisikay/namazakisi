package expo.modules.sistemdurumu

import android.app.ActivityManager
import android.app.usage.UsageStatsManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.os.BatteryManager
import android.os.Build
import android.os.PowerManager
import android.util.Log
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Sistem koşulları köprüsü (güç tasarrufu, veri tasarrufu, ağ, şarj, arka plan kısıtı).
 *
 * SALT OKUR, izin istemez (ACCESS_NETWORK_STATE zaten birleşik manifestte). Ham değer
 * döner; YORUM ve KARAR saf JS çekirdeğindedir (`src/core/sistem/sistemDurumu.ts`).
 * Okunamayan alan haritaya hiç yazılmaz → JS "bilinmiyor" sayar.
 *
 * Kaynaklar (developer.android.com):
 *  - PowerManager.isPowerSaveMode / ACTION_POWER_SAVE_MODE_CHANGED / getLocationPowerSaveMode
 *  - ConnectivityManager.getRestrictBackgroundStatus (Veri Tasarrufu) — değişim yayını
 *    ACTION_RESTRICT_BACKGROUND_CHANGED YALNIZ dinamik kayıtlı alıcıya gelir
 *  - ActivityManager.isBackgroundRestricted (kullanıcı "Kısıtlı" yaptı)
 *  - UsageStatsManager.getAppStandbyBucket (RESTRICTED kovası: günde tek alarm)
 *  - BatteryManager.isCharging / BATTERY_PROPERTY_CAPACITY
 *
 * Samsung "Maksimum güç tasarrufu" için herkese açık API YOKTUR; o mod da
 * isPowerSaveMode'u açar (cihazda doğrulanmadı), ayrıca okunmaz.
 *
 * Dinleme yalnız JS dinleyici varken (OnStartObserving/OnStopObserving); her çağrı
 * binder olduğu için durum okuması AsyncFunction'dır.
 */
class ExpoSistemDurumuModule : Module() {

    private var alici: BroadcastReceiver? = null
    private var agGeriCagrisi: ConnectivityManager.NetworkCallback? = null

    @Volatile
    private var sonGonderilen: Map<String, Any?>? = null

    override fun definition() = ModuleDefinition {
        Name("ExpoSistemDurumu")

        Events(OLAY)

        AsyncFunction("durumAl") { durum() }

        OnStartObserving { dinlemeyiBaslat() }

        OnStopObserving { dinlemeyiDurdur() }

        OnDestroy { dinlemeyiDurdur() }
    }

    private fun baglam(): Context? = appContext.reactContext?.applicationContext

    private fun durum(): Map<String, Any?> {
        val c = baglam() ?: return emptyMap()
        val sonuc = mutableMapOf<String, Any?>("platform" to "android")
        guvenli("guc") {
            val pm = c.getSystemService(Context.POWER_SERVICE) as? PowerManager
            if (pm != null) {
                sonuc["gucTasarrufu"] = pm.isPowerSaveMode
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    sonuc["konumGucModu"] = pm.locationPowerSaveMode
                }
            }
        }
        guvenli("arkaPlan") {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                val am = c.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
                if (am != null) sonuc["arkaPlanKisitli"] = am.isBackgroundRestricted
                val us = c.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
                if (us != null) sonuc["beklemeKovasi"] = us.appStandbyBucket
            }
        }
        guvenli("ag") {
            val cm = c.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
            if (cm != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    sonuc["veriTasarrufu"] = cm.restrictBackgroundStatus
                }
                val ag = cm.activeNetwork
                val yetenek = ag?.let { cm.getNetworkCapabilities(it) }
                sonuc["agTuru"] = when {
                    yetenek == null || !yetenek.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) -> "yok"
                    yetenek.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> "wifi"
                    yetenek.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> "ethernet"
                    yetenek.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> "hucresel"
                    else -> "diger"
                }
                if (ag != null) sonuc["olculuAg"] = cm.isActiveNetworkMetered
            }
        }
        guvenli("pil") {
            val bm = c.getSystemService(Context.BATTERY_SERVICE) as? BatteryManager
            if (bm != null) {
                sonuc["sarjda"] = bm.isCharging
                val yuzde = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
                if (yuzde in 0..100) sonuc["pilYuzde"] = yuzde
            }
        }
        return sonuc
    }

    private inline fun guvenli(alan: String, blok: () -> Unit) {
        try {
            blok()
        } catch (e: Exception) {
            Log.w(TAG, "Sistem durumu okunamadi ($alan): ${e.javaClass.simpleName}")
        }
    }

    /** Durum gerçekten değiştiyse JS'e yollar (ağ geri çağrısı sık tekrarlar). */
    private fun yayinla() {
        try {
            val yeni = durum()
            if (yeni == sonGonderilen) return
            sonGonderilen = yeni
            sendEvent(OLAY, yeni)
        } catch (e: Exception) {
            Log.w(TAG, "Sistem durumu olayi gonderilemedi: ${e.javaClass.simpleName}")
        }
    }

    @Synchronized
    private fun dinlemeyiBaslat() {
        val c = baglam() ?: return
        if (alici == null) {
            val yeni = object : BroadcastReceiver() {
                override fun onReceive(context: Context?, intent: Intent?) = yayinla()
            }
            val suzgec = IntentFilter().apply {
                addAction(PowerManager.ACTION_POWER_SAVE_MODE_CHANGED)
                addAction(Intent.ACTION_POWER_CONNECTED)
                addAction(Intent.ACTION_POWER_DISCONNECTED)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    addAction(ConnectivityManager.ACTION_RESTRICT_BACKGROUND_CHANGED)
                }
            }
            try {
                // Sistem yayınları RECEIVER_NOT_EXPORTED ile de teslim edilir; başka
                // uygulamalar bu alıcıya yayın gönderemez.
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    c.registerReceiver(yeni, suzgec, Context.RECEIVER_NOT_EXPORTED)
                } else {
                    c.registerReceiver(yeni, suzgec)
                }
                alici = yeni
            } catch (e: Exception) {
                Log.w(TAG, "Sistem yayinlari dinlenemedi: ${e.javaClass.simpleName}")
            }
        }
        if (agGeriCagrisi == null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            val cm = c.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
            if (cm != null) {
                val geri = object : ConnectivityManager.NetworkCallback() {
                    override fun onAvailable(network: Network) = yayinla()
                    override fun onLost(network: Network) = yayinla()
                    override fun onCapabilitiesChanged(network: Network, caps: NetworkCapabilities) = yayinla()
                }
                try {
                    cm.registerDefaultNetworkCallback(geri)
                    agGeriCagrisi = geri
                } catch (e: Exception) {
                    Log.w(TAG, "Ag degisimi dinlenemedi: ${e.javaClass.simpleName}")
                }
            }
        }
    }

    @Synchronized
    private fun dinlemeyiDurdur() {
        val c = baglam()
        alici?.let { a -> try { c?.unregisterReceiver(a) } catch (e: Exception) { Log.w(TAG, "Dinleyici kaldirilamadi: ${e.javaClass.simpleName}") } }
        alici = null
        agGeriCagrisi?.let { g ->
            try {
                (c?.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager)?.unregisterNetworkCallback(g)
            } catch (e: Exception) { Log.w(TAG, "Dinleyici kaldirilamadi: ${e.javaClass.simpleName}") }
        }
        agGeriCagrisi = null
        sonGonderilen = null
    }

    private companion object {
        const val TAG = "SistemDurumu"
        const val OLAY = "onSistemDurumuDegisti"
    }
}
