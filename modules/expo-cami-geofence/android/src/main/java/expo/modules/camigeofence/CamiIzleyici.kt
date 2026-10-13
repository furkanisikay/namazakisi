package expo.modules.camigeofence

import android.Manifest
import android.annotation.SuppressLint
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import androidx.core.content.ContextCompat
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingRequest
import com.google.android.gms.location.LocationServices
import expo.modules.camigeofence.cekirdek.CamiKarar
import expo.modules.camigeofence.cekirdek.CamiSabitleri

/**
 * Geofence kaydı — kendi `PendingIntent`/`BroadcastReceiver`'ımızla.
 *
 * expo-location KULLANILMAZ (Fable kararı): `GeofencingTaskConsumer` DWELL /
 * `setLoiteringDelay` vermez ve `INITIAL_TRIGGER_EXIT`'i sabit kodlar. Mevcut
 * şehir takibi (`KONUM_GEOFENCE_GOREVI`) ayrı bir PendingIntent'tir; buradaki
 * `removeGeofences(pi)` yalnız bizim kayıtlarımızı siler, ona DOKUNMAZ.
 *
 * İki istek kurulur:
 *  1. Camiler (en yakın K + favori + kendi yerler): DWELL | EXIT,
 *     `setLoiteringDelay(bekleme)`, başlangıç tetiği DWELL (içerideyken açılırsa
 *     bekleme dolunca yine algılansın).
 *  2. Yenileme çemberi: yalnız EXIT. Başlangıç tetiği merkezin tazeliğine
 *     bağlıdır — SIKI DÖNGÜ DERSİ: taze sabitlemeye merkezlenince çemberin
 *     İÇİNDEYİZ ve başlangıç tetiği HİÇ verilmez (0); bayat merkezde (açılış,
 *     yeniden başlatma) `INITIAL_TRIGGER_EXIT` verilir ki cihaz o arada
 *     taşındıysa hemen fark edilsin. EXIT yolunda yalnız TAZE konuma yeniden
 *     merkezlenir (`CamiKarar.yenilemeKarari`); taze konum yoksa hiç kayıt
 *     yapılmaz → döngü kurulamaz.
 */
object CamiIzleyici {
    const val ACTION_GEOFENCE = "expo.modules.camigeofence.GEOFENCE"
    const val CAMI_ONEKI = "c:"
    const val YENILEME_ID = "y:yenileme"
    private const val ISTEK_KODU = 7301
    private const val ETIKET = "CamiIzleyici"

    fun pendingIntent(ctx: Context): PendingIntent {
        val bayrak = PendingIntent.FLAG_UPDATE_CURRENT or
            // Konum servisi olay ayrıntılarını intent'e DOLDURUR → S+'da MUTABLE şart.
            (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) PendingIntent.FLAG_MUTABLE else 0)
        return PendingIntent.getBroadcast(
            ctx,
            ISTEK_KODU,
            Intent(ctx, CamiGeofenceAlicisi::class.java).setAction(ACTION_GEOFENCE).setPackage(ctx.packageName),
            bayrak,
        )
    }

    /** "tamam" | "konumYok" | "arkaPlanYok" */
    fun izinDurumu(ctx: Context): String {
        if (!CamiKonumOlcer.izinVarMi(ctx)) return "konumYok"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q &&
            ContextCompat.checkSelfPermission(ctx, Manifest.permission.ACCESS_BACKGROUND_LOCATION) != PackageManager.PERMISSION_GRANTED
        ) return "arkaPlanYok"
        return "tamam"
    }

    /**
     * İzlemeyi [lat],[lng] merkezine göre (yeniden) kurar.
     * @param tazeMerkez merkez taze bir sabitleme mi (yalnız EXIT yolunda true)
     * @param bitti "kuruldu" | "kapali" | "izinYok" | "hata" — tam bir kez
     */
    @SuppressLint("MissingPermission")
    fun kur(ctx: Context, lat: Double, lng: Double, tazeMerkez: Boolean, bitti: (String) -> Unit = {}) {
        val ayarlar = CamiDepo.ayarlar(ctx)
        if (!ayarlar.aktif) {
            kaldir(ctx)
            bitti("kapali")
            return
        }
        val izin = izinDurumu(ctx)
        if (izin != "tamam") {
            CamiGunluk.ekle(ctx, "izinYok", mapOf("izin" to izin))
            bitti("izinYok")
            return
        }
        try {
            val haricSayisi = ayarlar.yerler.values.count { it.durum == "haric" }
            val osm = CamiVeriKaynagi.al(ctx)
                ?.enYakinlar(lat, lng, CamiSabitleri.IZLENEN_CAMI_SAYISI + haricSayisi)
                ?.map { it.kayit }
                ?: emptyList()
            val (izlenenler, kinci) = CamiKarar.izlenecekleriSec(lat, lng, osm, ayarlar.yerler)
            val yaricap = CamiKarar.yenilemeYaricapiM(kinci)
            val bekleme = (ayarlar.beklemeDk * CamiSabitleri.DAKIKA_MS).toInt()

            val camiler = izlenenler.map { yer ->
                Geofence.Builder()
                    .setRequestId(CAMI_ONEKI + yer.id)
                    .setCircularRegion(yer.lat, yer.lng, CamiKarar.geofenceYaricapiM(yer).toFloat())
                    .setExpirationDuration(Geofence.NEVER_EXPIRE)
                    .setTransitionTypes(Geofence.GEOFENCE_TRANSITION_DWELL or Geofence.GEOFENCE_TRANSITION_EXIT)
                    .setLoiteringDelay(bekleme)
                    .build()
            }
            val yenileme = Geofence.Builder()
                .setRequestId(YENILEME_ID)
                .setCircularRegion(lat, lng, yaricap.toFloat())
                .setExpirationDuration(Geofence.NEVER_EXPIRE)
                .setTransitionTypes(Geofence.GEOFENCE_TRANSITION_EXIT)
                .build()

            val onceki = CamiDepo.yenileme(ctx)
            CamiDepo.izlenenleriYaz(ctx, izlenenler)
            CamiDepo.yenilemeYaz(
                ctx,
                // `sonMs` yalnız OLAYDAN merkezlemede ilerler: açılışta kurulan bayat
                // merkezin anında gelen EXIT'i "çok sık" sayılıp yutulmasın.
                CamiDepo.Yenileme(lat, lng, yaricap, if (tazeMerkez) System.currentTimeMillis() else (onceki?.sonMs ?: 0L)),
            )

            val client = LocationServices.getGeofencingClient(ctx)
            val pi = pendingIntent(ctx)
            client.removeGeofences(pi).addOnCompleteListener {
                try {
                    val camiIstegi = if (camiler.isEmpty()) null else GeofencingRequest.Builder()
                        .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_DWELL)
                        .addGeofences(camiler)
                        .build()
                    val yenilemeIstegi = GeofencingRequest.Builder()
                        .setInitialTrigger(if (tazeMerkez) 0 else GeofencingRequest.INITIAL_TRIGGER_EXIT)
                        .addGeofence(yenileme)
                        .build()
                    val sonraki = {
                        client.addGeofences(yenilemeIstegi, pi)
                            .addOnSuccessListener {
                                CamiGunluk.ekle(ctx, "izlemeKuruldu", mapOf("sayi" to izlenenler.size, "yaricapM" to yaricap.toInt()))
                                bitti("kuruldu")
                            }
                            .addOnFailureListener { e -> hata(ctx, e, bitti) }
                    }
                    if (camiIstegi == null) {
                        sonraki()
                    } else {
                        client.addGeofences(camiIstegi, pi)
                            .addOnSuccessListener { sonraki() }
                            .addOnFailureListener { e -> hata(ctx, e, bitti) }
                    }
                } catch (e: Exception) {
                    hata(ctx, e, bitti)
                }
            }
        } catch (e: Exception) {
            hata(ctx, e, bitti)
        }
    }

    private fun hata(ctx: Context, e: Exception, bitti: (String) -> Unit) {
        // Geofence hataları SESSİZDİR (konum kapalı, GMS yok) → günlüğe yaz ki
        // "neden algılanmadı" ekranı söyleyebilsin.
        Log.w(ETIKET, "Geofence kurulamadi: ${e.message}")
        CamiGunluk.ekle(ctx, "izlemeHatasi", mapOf("mesaj" to (e.message ?: "").take(120)))
        bitti("hata")
    }

    /** Yalnız bizim kayıtlarımızı siler (şehir takibine dokunmaz). */
    fun kaldir(ctx: Context) {
        try {
            LocationServices.getGeofencingClient(ctx).removeGeofences(pendingIntent(ctx))
        } catch (_: Exception) {
            // GMS yoksa zaten kayıt da yoktur.
        }
        CamiDepo.izlenenleriYaz(ctx, emptyList())
    }

    /** Son merkeze göre yeniden kur (yeniden başlatma, ayar değişimi). Merkez yoksa no-op. */
    fun sonMerkezeGoreKur(ctx: Context, bitti: (String) -> Unit = {}) {
        val y = CamiDepo.yenileme(ctx)
        if (y == null) {
            bitti("merkezYok")
            return
        }
        kur(ctx, y.lat, y.lng, tazeMerkez = false, bitti = bitti)
    }
}
