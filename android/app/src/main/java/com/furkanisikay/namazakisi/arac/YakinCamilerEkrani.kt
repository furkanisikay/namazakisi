package com.furkanisikay.namazakisi.arac

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.LocationManager
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.text.SpannableString
import android.text.Spanned
import android.util.Log
import androidx.car.app.CarContext
import androidx.car.app.CarToast
import androidx.car.app.Screen
import androidx.car.app.constraints.ConstraintManager
import androidx.car.app.model.Action
import androidx.car.app.model.CarLocation
import androidx.car.app.model.Distance
import androidx.car.app.model.DistanceSpan
import androidx.car.app.model.ItemList
import androidx.car.app.model.Metadata
import androidx.car.app.model.Place
import androidx.car.app.model.PlaceListMapTemplate
import androidx.car.app.model.PlaceMarker
import androidx.car.app.model.Row
import androidx.car.app.model.Template
import androidx.core.content.ContextCompat
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import com.furkanisikay.namazakisi.R
import com.furkanisikay.namazakisi.arayuzDili
import com.furkanisikay.namazakisi.cekirdek.AracKarari
import com.furkanisikay.namazakisi.dildeBaglam
import com.furkanisikay.namazakisi.cekirdek.saatMetni
import com.furkanisikay.namazakisi.rakamSifiri
import com.furkanisikay.namazakisi.rakamla
import com.furkanisikay.namazakisi.widget.WidgetVeriDeposu
import expo.modules.camigeofence.CamiDepo
import expo.modules.camigeofence.CamiVeriKaynagi
import java.util.concurrent.Executors

/**
 * Tek ekran: başlıkta vakit, altında yakındaki camiler (`PlaceListMapTemplate`; haritayı
 * HOST çizer). Görev en fazla iki adımdır (liste → navigasyon), `AC-1`'in beş ekran
 * bütçesinin içindedir.
 *
 * Veri kaynakları yalnız OKUNUR, araç tarafı hiçbir şey yazmaz:
 * - vakit: [WidgetVeriDeposu.anlik] (widget/kutu/asistan ile aynı yük ve karar),
 * - camiler: [CamiVeriKaynagi] (paketli `camiler/tr.bin`, ODbL; Camideyim ile ortak),
 * - konum: cihazın son bilinen konumu (izin VARSA; araçta izin İSTENMEZ, `VI-1`) ya da
 *   Camideyim'in son yenileme merkezi ([CamiDepo.yenileme]) — hangisi tazeyse.
 *
 * Konum + en yakın arama arka plan iş parçacığında yapılır (ilk çağrı veri dosyasını
 * açar; `DR-2/DR-3` 10 sn sınırı ana thread'i bekletmemeyi gerektirir). Başlık dakika
 * başında `invalidate()` ile tazelenir; yalnız ekran görünürken (STARTED) zamanlayıcı
 * kuruludur. Aynı şablon türünün tazelenmesi host'un adım bütçesine sayılmaz.
 */
class YakinCamilerEkrani(carContext: CarContext) : Screen(carContext) {

    private data class CamiSatiri(val ad: String, val lat: Double, val lng: Double, val mesafeM: Double)

    private sealed class Sonuc {
        object Yukleniyor : Sonuc()
        object KonumYok : Sonuc()
        data class Hazir(val konum: AracKarari.KonumAdayi, val camiler: List<CamiSatiri>) : Sonuc()
    }

    @Volatile
    private var sonuc: Sonuc = Sonuc.Yukleniyor
    private var araniyor = false
    private val isci = Executors.newSingleThreadExecutor()
    private val ana = Handler(Looper.getMainLooper())
    private val tazele = object : Runnable {
        override fun run() {
            invalidate()
            ana.postDelayed(this, gecikme())
        }
    }

    init {
        lifecycle.addObserver(object : DefaultLifecycleObserver {
            override fun onStart(owner: LifecycleOwner) {
                // Konum bulunamadıysa ekran her görünür olduğunda yeniden dener (API < 5
                // hostlarda yenileme düğmesi yoktur).
                if (sonuc is Sonuc.KonumYok) yenidenAra()
                ana.removeCallbacks(tazele)
                ana.postDelayed(tazele, gecikme())
            }

            override fun onStop(owner: LifecycleOwner) {
                ana.removeCallbacks(tazele)
            }

            override fun onDestroy(owner: LifecycleOwner) {
                ana.removeCallbacks(tazele)
                isci.shutdownNow()
            }
        })
    }

    private fun gecikme(): Long {
        val simdi = System.currentTimeMillis()
        return (AracKarari.sonrakiTazelemeMs(simdi) - simdi).coerceAtLeast(1_000)
    }

    override fun onGetTemplate(): Template {
        val simdi = System.currentTimeMillis()
        // Araç ekranı metinleri UYGULAMANIN arayüz dilinde (her çizimde okunur: dil değişimi
        // bir sonraki dakika tazelemesinde yansır).
        val dil = carContext.arayuzDili()
        val baslik = try {
            val a = WidgetVeriDeposu.anlik(carContext, simdi)
            // Başlıktaki saat seçilen rakamla (mesafeyi `DistanceSpan` ile araç sistemi çizer).
            AracKarari.baslik(a.durum, a.kildim, simdi, { saatMetni(it) }, dil).rakamla(carContext.rakamSifiri())
        } catch (e: Exception) {
            Log.w(TAG, "vakit okunamadi", e)
            AracKarari.VARSAYILAN_BASLIK
        }

        val s = sonuc
        if (s is Sonuc.Yukleniyor) aramayiBaslat()

        // Konum yokken de AYNI şablon (boş liste + ileti): ayrı bir şablona geçmek host'un
        // adım bütçesini harcardı; başlıktaki yenileme düğmesi (API ≥ 5) aramayı yeniden başlatır.
        val sablon = PlaceListMapTemplate.Builder()
            .setTitle(baslik)
            .setHeaderAction(Action.APP_ICON)
        // Yenileme düğmesi Car API 5 ister (AAR'da @RequiresCarApi(5)); minCarApiLevel 1
        // beyan ettiğimiz için eski hostta koşulsuz vermek şablonu geçersiz kılardı.
        if (carContext.carAppApiLevel >= 5) sablon.setOnContentRefreshListener { yenidenAra() }
        return when (s) {
            is Sonuc.Yukleniyor -> sablon.setLoading(true).build()
            is Sonuc.KonumYok -> sablon
                .setItemList(ItemList.Builder().setNoItemsMessage(AracKarari.konumYokMetni(dil)).build())
                .build()
            is Sonuc.Hazir -> {
                val liste = ItemList.Builder().setNoItemsMessage(AracKarari.camiYokMetni(dil))
                s.camiler.forEach { liste.addItem(satir(it)) }
                sablon
                    .setAnchor(
                        Place.Builder(CarLocation.create(s.konum.lat, s.konum.lng))
                            .setMarker(PlaceMarker.Builder().build())
                            .build(),
                    )
                    .setItemList(liste.build())
                    .build()
            }
        }
    }

    private fun satir(c: CamiSatiri): Row {
        val m = AracKarari.mesafe(c.mesafeM)
        val birim = when (m.birim) {
            AracKarari.Birim.METRE -> Distance.UNIT_METERS
            AracKarari.Birim.KM_ONDALIK -> Distance.UNIT_KILOMETERS_P1
            AracKarari.Birim.KM -> Distance.UNIT_KILOMETERS
        }
        val mesafe = SpannableString(" ").apply {
            setSpan(DistanceSpan.create(Distance.create(m.deger, birim)), 0, 1, Spanned.SPAN_INCLUSIVE_INCLUSIVE)
        }
        return Row.Builder()
            .setTitle(c.ad)
            .addText(mesafe)
            .setMetadata(
                Metadata.Builder()
                    .setPlace(
                        Place.Builder(CarLocation.create(c.lat, c.lng))
                            .setMarker(PlaceMarker.Builder().build())
                            .build(),
                    )
                    .build(),
            )
            .setOnClickListener { yolTarifi(c) }
            .build()
    }

    private fun yolTarifi(c: CamiSatiri) {
        try {
            val adres = AracKarari.navigasyonAdresi(c.lat, c.lng, c.ad)
            carContext.startCarApp(Intent(CarContext.ACTION_NAVIGATE, Uri.parse(adres)))
        } catch (e: Exception) {
            Log.w(TAG, "navigasyon acilamadi", e)
            CarToast.makeText(
                carContext,
                carContext.dildeBaglam().getString(R.string.arac_navigasyon_acilamadi),
                CarToast.LENGTH_LONG,
            ).show()
        }
    }

    private fun yenidenAra() {
        sonuc = Sonuc.Yukleniyor
        araniyor = false
        invalidate()
    }

    private fun aramayiBaslat() {
        if (araniyor) return
        araniyor = true
        val ctx = carContext.applicationContext
        val sinir = AracKarari.camiSayisi(hostSiniri())
        try {
            isci.execute {
                val yeni = try {
                    ara(ctx, sinir)
                } catch (e: Exception) {
                    Log.w(TAG, "cami aramasi basarisiz", e)
                    Sonuc.KonumYok
                }
                ana.post {
                    sonuc = yeni
                    araniyor = false
                    invalidate()
                }
            }
        } catch (e: Exception) {
            // Yürütücü kapanmış (ekran yok edildi): yapacak bir şey yok.
            araniyor = false
        }
    }

    private fun hostSiniri(): Int? = try {
        if (carContext.carAppApiLevel >= 2) {
            carContext.getCarService(ConstraintManager::class.java)
                .getContentLimit(ConstraintManager.CONTENT_LIMIT_TYPE_PLACE_LIST)
        } else {
            null
        }
    } catch (e: Exception) {
        null
    }

    private fun ara(ctx: Context, sinir: Int): Sonuc {
        val konum = AracKarari.konumSec(konumAdaylari(ctx)) ?: return Sonuc.KonumYok
        val adsiz = ctx.dildeBaglam().getString(R.string.arac_adsiz_cami)
        val camiler = CamiVeriKaynagi.al(ctx)
            ?.enYakinlar(konum.lat, konum.lng, sinir)
            ?.map { CamiSatiri(it.kayit.ad.ifBlank { adsiz }, it.kayit.lat, it.kayit.lng, it.mesafeM) }
            ?: emptyList()
        return Sonuc.Hazir(konum, camiler)
    }

    private fun konumAdaylari(ctx: Context): List<AracKarari.KonumAdayi> {
        val adaylar = mutableListOf<AracKarari.KonumAdayi>()
        CamiDepo.yenileme(ctx)?.let { adaylar += AracKarari.KonumAdayi(it.lat, it.lng, it.sonMs) }
        val izinli = listOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
            .any { ContextCompat.checkSelfPermission(ctx, it) == PackageManager.PERMISSION_GRANTED }
        if (!izinli) return adaylar
        val lm = ctx.getSystemService(Context.LOCATION_SERVICE) as? LocationManager ?: return adaylar
        val saglayicilar = mutableListOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER, LocationManager.PASSIVE_PROVIDER)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) saglayicilar += LocationManager.FUSED_PROVIDER
        for (p in saglayicilar) {
            try {
                lm.getLastKnownLocation(p)?.let { adaylar += AracKarari.KonumAdayi(it.latitude, it.longitude, it.time) }
            } catch (_: SecurityException) {
                // İzin bu arada geri alındı: yalnız diğer adaylar kullanılır.
            } catch (_: IllegalArgumentException) {
                // Sağlayıcı bu cihazda yok.
            }
        }
        return adaylar
    }

    private companion object {
        const val TAG = "NamazArac"
    }
}
