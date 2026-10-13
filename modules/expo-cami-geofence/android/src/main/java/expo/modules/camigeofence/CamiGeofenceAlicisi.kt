package expo.modules.camigeofence

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingEvent
import expo.modules.camigeofence.cekirdek.CamiKarar
import expo.modules.camigeofence.cekirdek.GuvenPuani
import expo.modules.camigeofence.cekirdek.IzlemeKipi
import expo.modules.camigeofence.cekirdek.OlculenKonum
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Geofence olaylarını karşılar ve KARARI VERİR — `goAsync()` içinde (AnonsReceiver
 * deseni; Foreground Service YOK). JS çalışmıyor olabilir; her şey diskten okunur.
 *
 * DWELL (bir caminin 100 m çevresinde `bekleme` dakikası):
 *   1. "Camideyim" kapalıysa ya da zaten camideyse → hiçbir şey.
 *   2. VAKİT KAPISI: kapı dışındaysa konum BİLE ölçülmez (pil) → günlüğe "vakitDisi".
 *   3. TEK hassas ölçüm (HIGH_ACCURACY, 15 sn). Doğruluk >30 m → "şüpheli", mod açılmaz.
 *   4. Alan testi (poligon / kullanıcı alanı) → "camide" ya da "disarida" (mesafeyle).
 *   5. (Faz 2) "camide" ise GÜVEN PUANI (zaman, bina içi/tampon, doğruluk, HIZ, bekleme)
 *      + kullanıcının açılış biçimi → otomatik aç / "Camide misiniz?" diye sor / hiçbir şey.
 *      "Hayır" denen (tur, yer) için bir daha sorulmaz; bekleyen soru varken ölçüm yapılmaz.
 * EXIT: camideyken o yerin çevresinden çıkış → hâl biter. Yenileme çemberinden
 *   çıkış → yalnız TAZE konuma yeniden merkezlenir (sıkı döngü koruması).
 */
class CamiGeofenceAlicisi : BroadcastReceiver() {
    companion object {
        private const val ETIKET = "CamiGeofence"
        /** goAsync penceresi: ölçüm 15 sn + kayıt payı; alarm/geofence yayını arka plan kuyruğundan gelir (ANR 60 sn). */
        private const val PENCERE_MS = 25_000L
        private val isci = Executors.newSingleThreadExecutor()
    }

    override fun onReceive(context: Context, intent: Intent) {
        val ctx = context.applicationContext
        val sonuc = goAsync()
        val kapandi = AtomicBoolean(false)
        val kapat = {
            if (kapandi.compareAndSet(false, true)) {
                try { sonuc.finish() } catch (_: Exception) { /* yok sayılır */ }
            }
        }
        Handler(Looper.getMainLooper()).postDelayed({ kapat() }, PENCERE_MS)
        isci.execute {
            try {
                when (intent.action) {
                    CamiDurumu.ACTION_UST_SURE -> { CamiDurumu.bitir(ctx, "sure"); kapat() }
                    CamiIzleyici.ACTION_GEOFENCE -> geofenceOlayi(ctx, intent, kapat)
                    else -> kapat()
                }
            } catch (e: Exception) {
                Log.e(ETIKET, "Olay islenemedi: ${e.message}")
                kapat()
            }
        }
    }

    private fun geofenceOlayi(ctx: Context, intent: Intent, kapat: () -> Unit) {
        val olay = GeofencingEvent.fromIntent(intent)
        if (olay == null || olay.hasError()) {
            CamiGunluk.ekle(ctx, "izlemeHatasi", mapOf("kod" to olay?.errorCode))
            kapat()
            return
        }
        val idler = olay.triggeringGeofences?.map { it.requestId } ?: emptyList()
        when (olay.geofenceTransition) {
            Geofence.GEOFENCE_TRANSITION_DWELL -> dwell(ctx, idler.filter { it.startsWith(CamiIzleyici.CAMI_ONEKI) }, kapat)
            Geofence.GEOFENCE_TRANSITION_EXIT -> {
                val camide = CamiDepo.camide(ctx)
                if (camide != null && idler.contains(CamiIzleyici.CAMI_ONEKI + camide.yerId)) {
                    CamiDurumu.bitir(ctx, "cikis")
                }
                // Sorulan yerden çıkıldıysa soru anlamını yitirdi.
                CamiDepo.soru(ctx)?.takeIf { idler.contains(CamiIzleyici.CAMI_ONEKI + it.yer.id) }?.let {
                    CamiDurumu.soruyuKapat(ctx)
                    CamiGunluk.ekle(ctx, "soruCikis", mapOf("yer" to it.yer.ad))
                }
                if (idler.contains(CamiIzleyici.YENILEME_ID)) yenile(ctx, kapat) else kapat()
            }
            else -> kapat()
        }
    }

    private fun dwell(ctx: Context, idler: List<String>, kapat: () -> Unit) {
        val ayarlar = CamiDepo.ayarlar(ctx)
        // Zaten camideyken ya da bir soru cevap beklerken yeniden ölçülmez.
        if (!ayarlar.aktif || idler.isEmpty() || CamiDepo.camide(ctx) != null || CamiDepo.soru(ctx) != null) {
            kapat()
            return
        }
        val izlenen = CamiDepo.izlenenler(ctx).associateBy { CamiIzleyici.CAMI_ONEKI + it.id }
        val adaylar = idler.mapNotNull { izlenen[it] }
        val ilkAd = adaylar.firstOrNull()?.ad
        val simdi = System.currentTimeMillis()
        val pencereler = CamiDepo.pencereler(ctx)
        CamiGunluk.ekle(ctx, "dwell", mapOf("yer" to ilkAd, "dk" to ayarlar.beklemeDk))

        if (!CamiKarar.kapiGectiMi(simdi, ayarlar.vakitKapisi, pencereler)) {
            CamiGunluk.ekle(ctx, "vakitDisi", mapOf("yer" to ilkAd))
            kapat()
            return
        }
        // Bu vakitte bütün adaylar için "Hayır" denmişse konum bile ölçülmez (pil).
        CamiKarar.kapiPenceresiniBul(simdi, pencereler)?.let { p ->
            if (adaylar.isNotEmpty() && adaylar.all { CamiDepo.reddedildiMi(ctx, CamiDurumu.tur(p.tarih, p.vakit, it.id, simdi), it.id) }) {
                CamiGunluk.ekle(ctx, "reddedilmis", mapOf("yer" to ilkAd))
                kapat()
                return
            }
        }
        val haric = ayarlar.yerler.filterValues { it.durum == "haric" }.keys
        CamiKonumOlcer.olc(ctx) { konum ->
            isci.execute {
                try {
                    val olculen = konum?.let { OlculenKonum(it.latitude, it.longitude, if (it.hasAccuracy()) it.accuracy.toDouble() else Double.MAX_VALUE) }
                    // Tek ölçümün hızı: araçta/yürürken otomatik açma yok (güven puanı tavanı).
                    val hiz = konum?.takeIf { it.hasSpeed() }?.speed?.toDouble()
                    val an = System.currentTimeMillis()
                    val acilis = GuvenPuani.acilisKarari(
                        an, ayarlar.vakitKapisi, pencereler, olculen, hiz, adaylar, haric, ayarlar.beklemeDk, ayarlar.acilisBicimi,
                    )
                    val karar = acilis.karar
                    val yer = adaylar.firstOrNull { it.id == karar.yerId }
                    CamiGunluk.ekle(
                        ctx,
                        "olcum",
                        mapOf(
                            "sonuc" to karar.sonuc,
                            "yer" to (yer?.ad ?: ilkAd),
                            "dogrulukM" to olculen?.dogrulukM?.takeIf { it < 10_000 }?.let { Math.round(it) },
                            "mesafeM" to karar.mesafeM,
                            "vakit" to karar.vakit,
                        ),
                    )
                    val guven = acilis.guven
                    if (karar.sonuc == "camide" && yer != null && guven != null) {
                        val tur = CamiDurumu.tur(karar.tarih, karar.vakit, yer.id, an)
                        if (CamiDepo.reddedildiMi(ctx, tur, yer.id)) {
                            CamiGunluk.ekle(ctx, "reddedilmis", mapOf("yer" to yer.ad))
                        } else {
                            CamiGunluk.ekle(
                                ctx,
                                "guven",
                                mapOf(
                                    "yer" to yer.ad,
                                    "puan" to guven.puan,
                                    "eylem" to acilis.eylem,
                                    "guvenKarari" to guven.karar,
                                    "zaman" to guven.zaman,
                                    "yerSinifi" to guven.yer,
                                    "hareket" to guven.hareket,
                                    "tavan" to guven.tavan,
                                    "bicim" to ayarlar.acilisBicimi,
                                ),
                            )
                            when (acilis.eylem) {
                                GuvenPuani.OTOMATIK -> CamiDurumu.giris(ctx, yer, karar)
                                GuvenPuani.SOR -> CamiDurumu.sor(ctx, yer, karar, CamiKarar.kapiPenceresiniBul(an, pencereler)?.son)
                                else -> Unit
                            }
                        }
                    }
                } catch (e: Exception) {
                    Log.e(ETIKET, "Karar verilemedi: ${e.message}")
                } finally {
                    kapat()
                }
            }
        }
    }

    private fun yenile(ctx: Context, kapat: () -> Unit) {
        val onceki = CamiDepo.yenileme(ctx)?.sonMs
        CamiKonumOlcer.olc(ctx) { konum ->
            isci.execute {
                try {
                    val karar = CamiKarar.yenilemeKarari(System.currentTimeMillis(), onceki?.takeIf { it > 0 }, konum?.time)
                    CamiGunluk.ekle(ctx, "yenileme", mapOf("sonuc" to karar))
                    if (karar == "yenile" && konum != null) {
                        CamiIzleyici.kur(ctx, konum.latitude, konum.longitude, IzlemeKipi.OLAY) { kapat() }
                    } else {
                        // Bayat konumla ASLA yeniden kayıt yapılmaz: 15 dk'lık JS görevi onarır.
                        // Çemberden çıkıldığı BİLİNİYOR → merkez artık "içerdesiniz" demez;
                        // periyodik yol onu bayat koordinatla taşıyabilsin.
                        CamiDepo.yenilemeBayatla(ctx)
                        kapat()
                    }
                } catch (e: Exception) {
                    Log.e(ETIKET, "Yenileme yapilamadi: ${e.message}")
                    kapat()
                }
            }
        }
    }
}
