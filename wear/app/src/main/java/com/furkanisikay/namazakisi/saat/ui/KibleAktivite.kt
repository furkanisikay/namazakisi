package com.furkanisikay.namazakisi.saat.ui

import android.hardware.GeomagneticField
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.Surface
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.furkanisikay.namazakisi.saat.cekirdek.Kible
import com.furkanisikay.namazakisi.saat.cekirdek.KibleKarari
import com.furkanisikay.namazakisi.saat.cekirdek.Konum
import com.furkanisikay.namazakisi.saat.kible.KiblePusulasi
import com.furkanisikay.namazakisi.saat.veri.YukDeposu

/**
 * Kıble pusulası (saat yenileme W2). Konum TELEFONDAN gelir (yükteki yaklaşık
 * `konum`); saat konum sorgulamaz, konum izni İSTEMEZ.
 *
 * Gerçek kuzey = manyetik azimut + `GeomagneticField` sapması (konum değişince bir
 * kez hesaplanır; telefon da `trueHeading` kullanır — sapma atlanırsa iki cihaz
 * Türkiye'de 5–7° farklı yön gösterirdi).
 *
 * Pil: sensör yalnız RESUMED iken dinlenir (`onPause`'da bırakılır). Ambient
 * DESTEKLENMEZ (bilinçli): ekran kısılınca sistem kadrana döner, sensör kapanır.
 * `FLAG_KEEP_SCREEN_ON` yok.
 */
class KibleAktivite : ComponentActivity() {
    private lateinit var pusula: KiblePusulasi
    private val suzgec = KibleKarari.AciSuzgeci()
    private var titresim: Vibrator? = null

    private var konum: Konum? = null
    private var kibleAcisi = 0.0
    private var sapma = 0.0
    private var hizali = false

    private var ekran by mutableStateOf<KibleGorunumu>(KibleGorunumu.Bekleniyor)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        titresim = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            getSystemService(VibratorManager::class.java)?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            getSystemService(Vibrator::class.java)
        }
        pusula = KiblePusulasi(this, ::okumaGeldi)
        setContent { KibleEkrani(ekran) }
    }

    override fun onResume() {
        super.onResume()
        // Konum her dönüşte yeniden okunur: telefon arada yeni yük göndermiş olabilir.
        val yuk = YukDeposu(this).yuk()
        val yeni = yuk?.konum
        ekran = when {
            yuk == null -> KibleGorunumu.YukYok
            yeni == null -> KibleGorunumu.KonumYok
            pusula.kaynak == KiblePusulasi.Kaynak.YOK -> KibleGorunumu.SensorYok(Kible.aci(yeni.lat, yeni.lng), yuk.konumAdi)
            else -> {
                val degisti = yeni != konum
                if (degisti) {
                    konum = yeni
                    kibleAcisi = Kible.aci(yeni.lat, yeni.lng)
                    sapma = GeomagneticField(
                        yeni.lat.toFloat(), yeni.lng.toFloat(), 0f, System.currentTimeMillis(),
                    ).declination.toDouble()
                }
                // Sağ bilek ayarı ekranı 180° çevirir; dönüş her açılışta okunur.
                val donus = display?.rotation ?: Surface.ROTATION_0
                if (pusula.baslat(donus)) {
                    // Konum değişmediyse son (donmuş) yön gösterilmeye devam eder.
                    (ekran as? KibleGorunumu.Pusula)?.takeIf { !degisti }?.copy(konumAdi = yuk.konumAdi)
                        ?: KibleGorunumu.Olculuyor(kibleAcisi, yuk.konumAdi)
                } else {
                    KibleGorunumu.SensorYok(kibleAcisi, yuk.konumAdi)
                }
            }
        }
    }

    override fun onPause() {
        super.onPause()
        // Sensör CPU'yu uyanık tutar: ekran görünmüyorsa dinlenmez. Son yön donar.
        pusula.durdur()
        // Dönüşte eski yön süzgece karışmasın; hizaya ilk girişte yine tek tık gelsin.
        suzgec.sifirla()
        hizali = false
    }

    private fun okumaGeldi(o: KiblePusulasi.Okuma) {
        val konumAdi = when (val e = ekran) {
            is KibleGorunumu.Pusula -> e.konumAdi
            is KibleGorunumu.Olculuyor -> e.konumAdi
            else -> return
        }
        val yon = suzgec.ekle(KibleKarari.gercekYon(o.manyetikAzimut, sapma))
        val hedef = KibleKarari.hedefAcisi(kibleAcisi, yon)
        val hiza = KibleKarari.hiza(hizali, hedef)
        hizali = hiza.hizali
        if (hiza.titret) titret()
        val onceki = ekran as? KibleGorunumu.Pusula
        ekran = KibleGorunumu.Pusula(
            kibleAcisi = kibleAcisi,
            konumAdi = konumAdi,
            // Çizim açıları sarılmaz: 359 → 1 geçişinde ok geri dolaşmasın.
            yonCizim = onceki?.let { KibleKarari.enKisaYol(it.yonCizim, yon) } ?: yon,
            hedefCizim = onceki?.let { KibleKarari.enKisaYol(it.hedefCizim, hedef) } ?: hedef,
            hizali = hiza.hizali,
            erisim = KibleKarari.erisimMetni(hedef, hiza.hizali),
            egimIpucu = KibleKarari.egimIpucu(o.egim),
            kalibrasyon = o.kalibrasyon,
        )
    }

    /** Hizaya GİRİŞTE tek kısa tık; hizadayken tekrar etmez (karar `KibleKarari.hiza`). */
    private fun titret() {
        val v = titresim?.takeIf { it.hasVibrator() } ?: return
        v.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK))
    }
}
