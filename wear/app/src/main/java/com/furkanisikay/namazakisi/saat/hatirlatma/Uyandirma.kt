package com.furkanisikay.namazakisi.saat.hatirlatma

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.edit
import com.furkanisikay.namazakisi.saat.R
import com.furkanisikay.namazakisi.saat.cekirdek.TelefonKomutu
import com.furkanisikay.namazakisi.saat.cekirdek.UyandirmaKaydi
import com.furkanisikay.namazakisi.saat.cekirdek.UyandirmaZinciri
import com.furkanisikay.namazakisi.saat.cekirdek.Yuk
import com.furkanisikay.namazakisi.saat.telefon.TelefonIstemcisi
import com.furkanisikay.namazakisi.saat.ui.UyandirmaAktivite
import com.furkanisikay.namazakisi.saat.veri.Senkron
import com.furkanisikay.namazakisi.saat.veri.YukDeposu
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeoutOrNull
import org.json.JSONObject

/**
 * Saat-yerel uyandırma durumu (saat W3, fikir 2): kapatılan kimlikler ve son çalınan anlar.
 * Yükte artık olmayan kimlikler her okumada ayıklanır (sınırsız büyümez).
 *
 * ERTELE YOK (sahip kararı 2026-10-19): güncelleme öncesinden kalan erteleme anahtarları
 * (`ertelenen`, `ertelenen_kayit`) OKUNMAZ ve ilk `ayikla`'da (her tazeleme) SİLİNİR.
 */
class UyandirmaDeposu(context: Context) {
    private val prefs = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun durum(yuk: Yuk?): UyandirmaZinciri.Durum {
        val gecerli = yuk?.uyandirma?.mapTo(HashSet()) { it.id } ?: HashSet()
        return UyandirmaZinciri.Durum(
            kapatilan = (prefs.getStringSet(KAPATILAN, emptySet()) ?: emptySet()).filterTo(HashSet()) { it in gecerli },
            calinan = harita(CALINAN).filterKeys { it in gecerli },
        )
    }

    fun kapat(id: String) = synchronized(KILIT) {
        prefs.edit { putStringSet(KAPATILAN, (prefs.getStringSet(KAPATILAN, emptySet()) ?: emptySet()) + id) }
    }

    fun calindi(id: String, ms: Long) = synchronized(KILIT) { yaz(CALINAN, harita(CALINAN) + (id to ms)) }

    /** Yükte artık olmayan kimlikleri at (tazelemede); eski erteleme anahtarlarını SİL (göç). */
    fun ayikla(yuk: Yuk?) = synchronized(KILIT) {
        val d = durum(yuk)
        prefs.edit {
            putStringSet(KAPATILAN, d.kapatilan)
            putString(CALINAN, JSONObject(d.calinan as Map<*, *>).toString())
            remove(ESKI_ERTELENEN)
            remove(ESKI_ERTELENEN_KAYIT)
        }
    }

    private fun harita(anahtar: String): Map<String, Long> = try {
        val o = JSONObject(prefs.getString(anahtar, "{}") ?: "{}")
        o.keys().asSequence().associateWith { o.getLong(it) }
    } catch (_: Exception) {
        emptyMap()
    }

    private fun yaz(anahtar: String, h: Map<String, Long>) = prefs.edit { putString(anahtar, JSONObject(h as Map<*, *>).toString()) }

    companion object {
        private val KILIT = Any()
        private const val PREFS = "saat_uyandirma"
        private const val KAPATILAN = "kapatilan"
        /** Göç: güncelleme öncesi erteleme anahtarları (yalnız silinir). */
        private const val ESKI_ERTELENEN = "ertelenen"
        private const val ESKI_ERTELENEN_KAYIT = "ertelenen_kayit"
        private const val CALINAN = "calinan"
    }
}

/**
 * Bilekte sessiz uyandırma bildirimi (saat W3, fikir 2). AYRI kanal `saat_uyandirma`:
 * kanal deseni oluşturulduktan sonra değişmez (muhafız kanal dersi) → yeni kimlik, SESSİZ
 * (yanınızda uyuyan uyanmasın), uzun titreşim deseni + `FLAG_INSISTENT` (kapatılana dek
 * tekrar), en fazla `CALMA_SURESI_MS` (`setTimeoutAfter`) — sonra telefonun yedeği esas.
 *
 * Tam ekran amacı (`setFullScreenIntent`) KULLANILMAZ: `USE_FULL_SCREEN_INTENT` izni ister
 * ve görev "yeni izin ekleme" diyor; Wear OS yüksek önemli bildirimi zaten ekranı kaplayan
 * kart olarak gösterir, dokunuş `UyandirmaAktivite`'yi açar. Cihazda DOĞRULANMADI.
 */
object UyandirmaBildirimi {
    const val KANAL = "saat_uyandirma"
    private const val BILDIRIM_NO = 4806
    private val DESEN = longArrayOf(0, 900, 400, 900, 400, 900, 1500)

    fun etiket(id: String) = "uyandirma_$id"

    fun cal(context: Context, kayit: UyandirmaKaydi) {
        if (!MuhafizBildirimci.bildirimIzniVar(context)) return
        kanaliGarantile(context)
        val ac = PendingIntent.getActivity(
            context, kayit.id.hashCode(),
            Intent(context, UyandirmaAktivite::class.java).putExtra(UyandirmaAlicisi.ID, kayit.id),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val b = NotificationCompat.Builder(context, KANAL)
            .setSmallIcon(R.drawable.ic_vakit)
            .setContentTitle(kayit.baslik)
            .setContentText(kayit.govde)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setSilent(false)
            .setLocalOnly(true)
            .setTimeoutAfter(UyandirmaZinciri.CALMA_SURESI_MS)
            .setContentIntent(ac)
            .addAction(0, "Kapat", eylem(context, kayit.id, UyandirmaAlicisi.KAPAT))
            .addAction(0, "Kıldım", eylem(context, kayit.id, UyandirmaAlicisi.KILDIM))
        val n = b.build().apply { flags = flags or Notification.FLAG_INSISTENT }
        try {
            NotificationManagerCompat.from(context).notify(etiket(kayit.id), BILDIRIM_NO, n)
        } catch (_: SecurityException) {
            // İzin geri alındı: telefonun yedeği çalar.
        }
    }

    fun kaldir(context: Context, id: String) = NotificationManagerCompat.from(context).cancel(etiket(id), BILDIRIM_NO)

    private fun eylem(context: Context, id: String, islem: String): PendingIntent = PendingIntent.getBroadcast(
        context,
        (id + islem).hashCode(),
        Intent(context, UyandirmaAlicisi::class.java).setAction(islem).putExtra(UyandirmaAlicisi.ID, id),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    private fun kanaliGarantile(context: Context) {
        val nm = context.getSystemService(NotificationManager::class.java) ?: return
        if (nm.getNotificationChannel(KANAL) != null) return
        nm.createNotificationChannel(
            NotificationChannel(KANAL, context.getString(R.string.uyandirma_kanal_adi), NotificationManager.IMPORTANCE_HIGH).apply {
                description = context.getString(R.string.uyandirma_kanal_aciklama)
                setSound(null, null)
                enableVibration(true)
                vibrationPattern = DESEN
            }
        )
    }
}

/**
 * Uyandırma düğmeleri: Kapat / Kıldım (ERTELE YOK, 2026-10-19). Saat-yerel durumu yazar, zinciri
 * tazeler ve telefona "kapandı" der (telefon yedeğini iptal eder; teheccüdde "Kıldım"ı
 * nafile yolundan işler — FARZ YAZMAZ). Sabahın "Kıldım"ı olağan farz kuyruğundan gider.
 * Telefona ulaşılamazsa yedek çalar (bilinçli: kimse uyanmadan kalmasın).
 */
class UyandirmaAlicisi : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val id = intent.getStringExtra(ID) ?: return
        val islem = intent.action ?: return
        val app = context.applicationContext
        val sonuc = goAsync()
        CoroutineScope(SupervisorJob() + Dispatchers.IO).launch {
            try {
                withTimeoutOrNull(9_000L) { isle(app, id, islem) }
            } catch (e: Exception) {
                Log.w("Uyandirma", "Uyandirma eylemi islenemedi", e)
            } finally {
                sonuc.finish()
            }
        }
    }

    private suspend fun isle(app: Context, id: String, islem: String) {
        val depo = UyandirmaDeposu(app)
        val yuk = YukDeposu(app).yuk()
        val kayit = yuk?.uyandirma?.firstOrNull { it.id == id }
        UyandirmaBildirimi.kaldir(app, id)
        if (islem == ESKI_ERTELE) {
            // GÖÇ (ertele YOK): güncelleme öncesi gösterilmiş bildirimdeki "10 dk ertele".
            // Saatte susturuldu ama kişi uyandığını onaylamadı → telefona HİÇBİR ŞEY
            // gönderilmez, telefon yedeği planlandığı gibi çalar; saatte de yeniden çalmaz
            // (aynı an `calinan`da).
            Hatirlatici.tazele(app)
            return
        }
        val simdi = System.currentTimeMillis()
        val sonMs = kayit?.sonMs ?: (simdi + 60 * 60_000L)
        val telefonIslemi = when (islem) {
            KILDIM -> {
                // Teheccüd: o gecenin TÜM teheccüd uyandırmaları (tekrarlar dahil) susar.
                val kapsam = if (kayit != null) UyandirmaZinciri.kildimKapsami(yuk, kayit) else setOf(id)
                kapsam.forEach { depo.kapat(it); if (it != id) UyandirmaBildirimi.kaldir(app, it) }
                // Sabah = FARZ: olağan kalıcı kuyruk (telefon uzaktaysa bağlanınca iletir).
                if (kayit != null && !kayit.nafile) Senkron.kildimGonder(app, kayit.tarih, "imsak")
                if (kayit?.nafile == true) {
                    // Telefon nafileyi BİR KEZ kılınmış sayar; diğer tekrarların yedekleri de gitsin.
                    kapsam.filter { it != id }.forEach {
                        TelefonIstemcisi.gonder(app, TelefonKomutu.UYANDIRMA_KAPANDI_YOLU, TelefonKomutu.uyandirmaKapandi(it, "kapat", sonMs))
                    }
                    "kildim"
                } else {
                    "kapat"
                }
            }
            else -> {
                depo.kapat(id)
                "kapat"
            }
        }
        Hatirlatici.tazele(app)
        TelefonIstemcisi.gonder(
            app,
            TelefonKomutu.UYANDIRMA_KAPANDI_YOLU,
            TelefonKomutu.uyandirmaKapandi(id, telefonIslemi, sonMs),
        )
    }

    companion object {
        const val ID = "id"
        const val KAPAT = "com.furkanisikay.namazakisi.saat.UYANDIRMA_KAPAT"
        /** Göç: güncelleme öncesi bildirimin "10 dk ertele" eylemi (yalnız yakalanır). */
        const val ESKI_ERTELE = "com.furkanisikay.namazakisi.saat.UYANDIRMA_ERTELE"
        const val KILDIM = "com.furkanisikay.namazakisi.saat.UYANDIRMA_KILDIM"
    }
}
