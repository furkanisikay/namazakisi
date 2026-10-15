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
import expo.modules.camigeofence.cekirdek.IzlemeKarari
import expo.modules.camigeofence.cekirdek.IzlemeKipi
import expo.modules.camigeofence.cekirdek.YenilemeMerkezi

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
 *
 * 15 dk'lık görev (PERİYODİK) bayat şehir koordinatı gönderir: kayıt canlıyken
 * taze merkezi EZMEZ, değişiklik yoksa hiç dokunmaz, kurarsa başlangıç DWELL'i
 * vermez (`IzlemeKarari`).
 */
object CamiIzleyici {
    const val ACTION_GEOFENCE = "expo.modules.camigeofence.GEOFENCE"
    const val CAMI_ONEKI = "c:"
    const val YENILEME_ID = "y:yenileme"
    private const val ISTEK_KODU = 7301
    private const val ETIKET = "CamiIzleyici"
    /** "Yalnız seçtiklerim": favorilerin OSM kaydını bulmak için taranan en yakın kayıt sayısı. */
    private const val SECILEN_ARAMA_SAYISI = 150

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
     * Bizim geofence kaydımız hâlâ ayakta mı? Son kayıt başarılıydı VE PendingIntent
     * yaşıyor (force-stop uygulamanın PendingIntent'lerini ve geofence'lerini siler,
     * yeniden başlatma da öyle). Emin olunamayan durumda false → yeniden kurulur.
     */
    private fun kayitCanliMi(ctx: Context): Boolean {
        if (!CamiDepo.kayitBasarili(ctx)) return false
        val bayrak = PendingIntent.FLAG_NO_CREATE or
            (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) PendingIntent.FLAG_MUTABLE else 0)
        return try {
            PendingIntent.getBroadcast(
                ctx,
                ISTEK_KODU,
                Intent(ctx, CamiGeofenceAlicisi::class.java).setAction(ACTION_GEOFENCE).setPackage(ctx.packageName),
                bayrak,
            ) != null
        } catch (_: Exception) {
            false
        }
    }

    /**
     * İzlemeyi [lat],[lng]'ye göre (yeniden) kurar. Merkezi ve "hiç dokunma"
     * kararını SAF `IzlemeKarari` verir: kayıt canlıyken taze merkez bayat bir
     * koordinatla ezilmez, PERİYODİK yolda değişiklik yoksa hiçbir şey yapılmaz ve
     * başlangıç DWELL tetiği verilmez (yanında oturulan camide 15 dk'da bir DWELL).
     * @param kip OLAY (taze GPS), KURULUM (ayar/boot/"cami değil"), PERIYODIK (15 dk / konum değişimi)
     * @param bitti "kuruldu" | "degismedi" | "kapali" | "izinYok" | "hata" — tam bir kez
     */
    @SuppressLint("MissingPermission")
    fun kur(ctx: Context, lat: Double, lng: Double, kip: IzlemeKipi, bitti: (String) -> Unit = {}) {
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
            val onceki = CamiDepo.yenileme(ctx)
            val kayitCanli = kayitCanliMi(ctx)
            val secim = IzlemeKarari.merkezSec(
                onceki?.let { YenilemeMerkezi(it.lat, it.lng, it.yaricapM, it.taze) },
                lat,
                lng,
                kip,
                kayitCanli,
            )
            val mLat = secim.lat
            val mLng = secim.lng
            // Faz 2 izleme kapsamı: "Yalnız seçtiklerim" → yalnız favoriler + eklenen
            // yerler izlenir. Yakındaki favoriler yine OSM kaydından (bina poligonuyla)
            // gelsin diye geniş bir en-yakın sorgusu FAVORİLERE süzülür; uzaktakiler ek
            // kotadan (kayıtlı konumla) girer. K dolmadığı için yenileme çemberi en geniştir.
            val yalnizSecilenler = ayarlar.izlemeKapsami == "secilenler"
            val haricSayisi = ayarlar.yerler.values.count { it.durum == "haric" }
            val veri = CamiVeriKaynagi.al(ctx)
            val osm = if (yalnizSecilenler) {
                veri?.enYakinlar(mLat, mLng, SECILEN_ARAMA_SAYISI)
                    ?.map { it.kayit }
                    ?.filter { ayarlar.yerler[it.id]?.durum == "favori" }
                    ?: emptyList()
            } else {
                veri?.enYakinlar(mLat, mLng, CamiSabitleri.IZLENEN_CAMI_SAYISI + haricSayisi)
                    ?.map { it.kayit }
                    ?: emptyList()
            }
            val (izlenenler, kinci) = CamiKarar.izlenecekleriSec(mLat, mLng, osm, ayarlar.yerler)
            val yenilemeKinci = if (yalnizSecilenler) null else kinci
            if (IzlemeKarari.dokunmaMi(kip, kayitCanli, secim, IzlemeKarari.imza(CamiDepo.izlenenler(ctx)), IzlemeKarari.imza(izlenenler))) {
                bitti("degismedi")
                return
            }
            val yaricap = CamiKarar.yenilemeYaricapiM(yenilemeKinci)
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
                .setCircularRegion(mLat, mLng, yaricap.toFloat())
                .setExpirationDuration(Geofence.NEVER_EXPIRE)
                .setTransitionTypes(Geofence.GEOFENCE_TRANSITION_EXIT)
                .build()

            val olay = kip == IzlemeKipi.OLAY
            CamiDepo.kayitBasariliYaz(ctx, false)
            CamiDepo.izlenenleriYaz(ctx, izlenenler)
            CamiDepo.yenilemeYaz(
                ctx,
                // `sonMs` yalnız OLAYDAN merkezlemede ilerler: açılışta kurulan bayat
                // merkezin anında gelen EXIT'i "çok sık" sayılıp yutulmasın.
                CamiDepo.Yenileme(mLat, mLng, yaricap, if (olay) System.currentTimeMillis() else (onceki?.sonMs ?: 0L), secim.taze),
            )

            val client = LocationServices.getGeofencingClient(ctx)
            val pi = pendingIntent(ctx)
            client.removeGeofences(pi).addOnCompleteListener {
                try {
                    val camiIstegi = if (camiler.isEmpty()) null else GeofencingRequest.Builder()
                        // Periyodik yolda başlangıç DWELL'i YOK: caminin yanında oturan
                        // kullanıcıda her turda DWELL + hassas ölçüm doğardı.
                        .setInitialTrigger(if (IzlemeKarari.camiBaslangicDwell(kip)) GeofencingRequest.INITIAL_TRIGGER_DWELL else 0)
                        .addGeofences(camiler)
                        .build()
                    val yenilemeIstegi = GeofencingRequest.Builder()
                        // Taze sabitlemede çemberin İÇİNDEYİZ → tetik yok (sıkı döngü
                        // dersi). Diğer her yolda EXIT: içerideysek sessiz, dışarıdaysak
                        // hemen fark edilir (korunan taze merkez için de güvenli).
                        .setInitialTrigger(if (olay) 0 else GeofencingRequest.INITIAL_TRIGGER_EXIT)
                        .addGeofence(yenileme)
                        .build()
                    val sonraki = {
                        client.addGeofences(yenilemeIstegi, pi)
                            .addOnSuccessListener {
                                CamiDepo.kayitBasariliYaz(ctx, true)
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
        CamiDepo.kayitBasariliYaz(ctx, false)
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
        CamiDepo.kayitBasariliYaz(ctx, false)
        CamiDepo.izlenenleriYaz(ctx, emptyList())
    }

    /** Son merkeze göre yeniden kur (yeniden başlatma, ayar değişimi). Merkez yoksa no-op. */
    fun sonMerkezeGoreKur(ctx: Context, bitti: (String) -> Unit = {}) {
        val y = CamiDepo.yenileme(ctx)
        if (y == null) {
            bitti("merkezYok")
            return
        }
        kur(ctx, y.lat, y.lng, IzlemeKipi.KURULUM, bitti)
    }
}
