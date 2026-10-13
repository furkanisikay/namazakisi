package com.furkanisikay.namazakisi.saat.hatirlatma

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.content.edit
import androidx.wear.phone.interactions.notifications.BridgingConfig
import androidx.wear.phone.interactions.notifications.BridgingManager
import com.furkanisikay.namazakisi.saat.cekirdek.AlarmKurucu
import com.furkanisikay.namazakisi.saat.cekirdek.AlarmZinciri
import com.furkanisikay.namazakisi.saat.cekirdek.KopruKarari
import com.furkanisikay.namazakisi.saat.cekirdek.ZincirYoneticisi
import com.furkanisikay.namazakisi.saat.veri.YukDeposu

/**
 * Saatin bağımsız hatırlatma ORKESTRASYONU (issue #280).
 *
 * `tazele` TEK GİRİŞ NOKTASIDIR — yeni yük, saatte/telefonda "Kıldım", uygulama
 * açılışı, BOOT/TIME_SET/TIMEZONE_CHANGED/MY_PACKAGE_REPLACED hepsi buradan geçer:
 * sıradaki alarmı kurar, kılınmış vakitlerin ekrandaki bildirimini kaldırır ve
 * telefon köprüsünün muhafız etiketini dışlama ayarını günceller.
 */
object Hatirlatici {
    private const val TAG = "SaatHatirlatici"

    fun tazele(context: Context) {
        val app = context.applicationContext
        try {
            val depo = YukDeposu(app)
            val yuk = depo.yuk()
            val bekleyen = depo.bekleyenler()
            ZincirYoneticisi(AndroidAlarmKurucu(app)).yenidenKur(yuk, bekleyen, System.currentTimeMillis())
            if (yuk != null) {
                MuhafizBildirimci.kilinmislariKaldir(app) { t, v -> AlarmZinciri.kilinmisMi(yuk, bekleyen, t, v) }
            }
            KopruAyari.uygula(app, KopruKarari.muhafizKoprusuDislansinMi(yuk, MuhafizBildirimci.bildirimIzniVar(app)))
        } catch (e: Exception) {
            Log.w(TAG, "Hatirlatmalar tazelenemedi", e)
        }
    }

    /** Zincirdeki alarm çaldı: gerekiyorsa göster, sonrakini kur. */
    fun tetiklendi(context: Context) {
        val app = context.applicationContext
        val depo = YukDeposu(app)
        val karar = AlarmZinciri.tetiklendi(depo.yuk(), depo.bekleyenler(), System.currentTimeMillis(), depo.sonGosterilenMs)
        karar.goster?.let {
            MuhafizBildirimci.goster(app, it)
            depo.sonGosterilenMs = it.ms
        }
        ZincirYoneticisi(AndroidAlarmKurucu(app)).kur(karar.sonraki)
    }
}

/**
 * Tek istek kodlu `AlarmManager` alarmı: yeniden kurmak öncekinin YERİNE geçer
 * (`FLAG_UPDATE_CURRENT`) → zincirde aynı anda yalnız bir alarm vardır.
 */
class AndroidAlarmKurucu(private val context: Context) : AlarmKurucu {
    private val alarmManager = context.getSystemService(AlarmManager::class.java)

    private fun istek(kimlik: String?): PendingIntent = PendingIntent.getBroadcast(
        context,
        0,
        Intent(context, MuhafizAlarmAlicisi::class.java).putExtra(MuhafizAlarmAlicisi.KIMLIK, kimlik),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    override fun kesinKurulabilirMi(): Boolean =
        Build.VERSION.SDK_INT < Build.VERSION_CODES.S || alarmManager?.canScheduleExactAlarms() == true

    override fun kesinKur(ms: Long, kimlik: String) {
        try {
            alarmManager?.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, ms, istek(kimlik))
        } catch (_: SecurityException) {
            // İzin tam bu arada geri alındı → yaklaşık yedeğe düş.
            yaklasikKur(ms, kimlik)
        }
    }

    override fun yaklasikKur(ms: Long, kimlik: String) {
        alarmManager?.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, ms, istek(kimlik))
    }

    override fun iptal() {
        alarmManager?.cancel(istek(null))
    }
}

/** Zincirdeki alarm. Hızlı iş (prefs + bildirim) → `goAsync` gerekmez. */
class MuhafizAlarmAlicisi : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        Hatirlatici.tetiklendi(context)
    }

    companion object {
        const val KIMLIK = "kimlik"
    }
}

/**
 * Alarmları silen ya da kaydıran sistem olayları: yeniden başlatma (Android tüm
 * alarmları siler), saat/saat dilimi değişimi (mutlak tetikler yeniden hesaplanmaz
 * ama kayan "sıradaki" değişebilir), uygulama güncellemesi.
 */
class YenidenKurAlicisi : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED,
            Intent.ACTION_TIME_CHANGED,
            Intent.ACTION_TIMEZONE_CHANGED,
            Intent.ACTION_MY_PACKAGE_REPLACED,
            -> Hatirlatici.tazele(context)
        }
    }
}

/**
 * Telefon köprüsü ayarı (çift bildirim). Telefon muhafız bildirimlerine
 * `MUHAFIZ_KOPRU_ETIKETI` basar (`android/.../wear/KopruEtiketliBildirimServisi.kt`);
 * saat kendi planını gösterebiliyorsa YALNIZ bu etiket dışlanır — diğer bütün
 * bildirimler köprülenmeye devam eder.
 *
 * `setConfig` bir sistem servisine bağlanır → yalnız karar DEĞİŞİNCE çağrılır.
 * CİHAZDA DOĞRULANACAK: dışlamanın bağlı telefon/saat çiftinde gerçekten tek
 * bildirim bıraktığı.
 */
object KopruAyari {
    /** Telefon tarafı `KopruEtiketliBildirimServisi.MUHAFIZ_KOPRU_ETIKETI` ile AYNI olmalı. */
    const val MUHAFIZ_KOPRU_ETIKETI = "namazakisi_muhafiz"
    private const val PREFS = "saat_kopru"
    private const val SON_KARAR = "dislandi"

    fun uygula(context: Context, dislansin: Boolean) {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        if (prefs.contains(SON_KARAR) && prefs.getBoolean(SON_KARAR, false) == dislansin) return
        try {
            val ayar = BridgingConfig.Builder(context, true).apply {
                if (dislansin) addExcludedTag(MUHAFIZ_KOPRU_ETIKETI)
            }.build()
            BridgingManager.fromContext(context).setConfig(ayar)
            prefs.edit { putBoolean(SON_KARAR, dislansin) }
        } catch (e: Exception) {
            // Wear olmayan cihaz / sistem servisi yok: bir sonraki tazelemede yeniden dener.
            Log.w("SaatKopru", "Kopru ayari uygulanamadi", e)
        }
    }
}
