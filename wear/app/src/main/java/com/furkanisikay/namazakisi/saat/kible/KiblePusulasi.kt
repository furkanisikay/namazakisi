package com.furkanisikay.namazakisi.saat.kible

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.view.Surface
import com.furkanisikay.namazakisi.saat.cekirdek.Kible
import com.furkanisikay.namazakisi.saat.cekirdek.KibleKarari

/**
 * Saatin kendi pusulası (saat yenileme W2). İZİN GEREKMEZ (gövde sensörü değil).
 *
 * Sensör zinciri (ilk bulunan kullanılır):
 *  1. `TYPE_ROTATION_VECTOR` — jiroskoplu füzyon, en yumuşak;
 *  2. `TYPE_GEOMAGNETIC_ROTATION_VECTOR` — jiroskopsuz, düşük güç;
 *  3. `TYPE_ACCELEROMETER` + `TYPE_MAGNETIC_FIELD` — `getRotationMatrix`;
 *  hiçbiri yoksa `kaynak == YOK` → ekran "pusula sensörü bulunmuyor" der.
 *
 * Dönme matrisi ekranın dönüşüne göre `remapCoordinateSystem` ile çevrilir: Wear OS'ta
 * "sağ bilek" ayarı ekranı 180° çevirir; çevrilmeseydi ok tam ters yönü gösterirdi.
 * Çıktı MANYETİK azimuttur; gerçek kuzeye çeviri (sapma) çağırandadır.
 *
 * Pil: kayıt yalnız `baslat` ile (aktivite RESUMED), `durdur` ile (onPause) silinir.
 */
class KiblePusulasi(
    context: Context,
    private val dinleyici: (Okuma) -> Unit,
) : SensorEventListener {

    enum class Kaynak { DONME_VEKTORU, JEOMANYETIK_VEKTOR, IVME_MANYETIK, YOK }

    data class Okuma(
        /** Manyetik kuzeye göre saatin baktığı yön (derece, saat yönünde). */
        val manyetikAzimut: Double,
        /** Saat yüzünün yataydan sapması (derece). */
        val egim: Double,
        /** Kalibrasyon bandı gösterilmeli mi. */
        val kalibrasyon: Boolean,
    )

    private val yonetici = context.getSystemService(SensorManager::class.java)
    private val donme = yonetici?.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
    private val jeomanyetik = yonetici?.getDefaultSensor(Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR)
    private val ivme = yonetici?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    private val manyetik = yonetici?.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)

    val kaynak: Kaynak = when {
        donme != null -> Kaynak.DONME_VEKTORU
        jeomanyetik != null -> Kaynak.JEOMANYETIK_VEKTOR
        ivme != null && manyetik != null -> Kaynak.IVME_MANYETIK
        else -> Kaynak.YOK
    }

    private val ham = FloatArray(9)
    private val cevrilmis = FloatArray(9)
    private val yonelim = FloatArray(3)
    private val yercekimi = FloatArray(3)
    private val alan = FloatArray(3)
    private var yercekimiVar = false
    private var alanVar = false
    private var dogruluk = SensorManager.SENSOR_STATUS_ACCURACY_HIGH
    private var ekranDonusu = Surface.ROTATION_0
    private var kayitli = false

    /** Kayıt; `false` = sensör yok ya da kayıt reddedildi. */
    fun baslat(donus: Int): Boolean {
        val y = yonetici ?: return false
        ekranDonusu = donus
        if (kayitli) return true
        val sensorler = when (kaynak) {
            Kaynak.DONME_VEKTORU -> listOfNotNull(donme)
            Kaynak.JEOMANYETIK_VEKTOR -> listOfNotNull(jeomanyetik)
            Kaynak.IVME_MANYETIK -> listOfNotNull(ivme, manyetik)
            Kaynak.YOK -> return false
        }
        dogruluk = SensorManager.SENSOR_STATUS_ACCURACY_HIGH
        yercekimiVar = false
        alanVar = false
        kayitli = sensorler.all { y.registerListener(this, it, SensorManager.SENSOR_DELAY_UI) }
        if (!kayitli) y.unregisterListener(this)
        return kayitli
    }

    fun durdur() {
        if (!kayitli) return
        yonetici?.unregisterListener(this)
        kayitli = false
    }

    override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {
        // İvme sensörünün doğruluğu yönü bozmaz; yalnız yön veren sensörünki sayılır.
        if (sensor.type != Sensor.TYPE_ACCELEROMETER) dogruluk = accuracy
    }

    override fun onSensorChanged(olay: SensorEvent) {
        var tahminiHata: Double? = null
        when (olay.sensor.type) {
            Sensor.TYPE_ROTATION_VECTOR, Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR -> {
                SensorManager.getRotationMatrixFromVector(ham, olay.values)
                dogruluk = olay.accuracy
                // values[4]: tahmini yön hatası (radyan), -1 = bilinmiyor; her cihaz vermez.
                if (olay.values.size >= 5) tahminiHata = olay.values[4].toDouble()
            }
            Sensor.TYPE_ACCELEROMETER -> {
                olay.values.copyInto(yercekimi, endIndex = 3)
                yercekimiVar = true
                if (!alanVar) return
                if (!SensorManager.getRotationMatrix(ham, null, yercekimi, alan)) return
            }
            Sensor.TYPE_MAGNETIC_FIELD -> {
                olay.values.copyInto(alan, endIndex = 3)
                alanVar = true
                dogruluk = olay.accuracy
                if (!yercekimiVar) return
                if (!SensorManager.getRotationMatrix(ham, null, yercekimi, alan)) return
            }
            else -> return
        }
        val (x, y) = when (ekranDonusu) {
            Surface.ROTATION_90 -> SensorManager.AXIS_Y to SensorManager.AXIS_MINUS_X
            Surface.ROTATION_180 -> SensorManager.AXIS_MINUS_X to SensorManager.AXIS_MINUS_Y
            Surface.ROTATION_270 -> SensorManager.AXIS_MINUS_Y to SensorManager.AXIS_X
            else -> SensorManager.AXIS_X to SensorManager.AXIS_Y
        }
        if (!SensorManager.remapCoordinateSystem(ham, x, y, cevrilmis)) return
        SensorManager.getOrientation(cevrilmis, yonelim)
        val azimut = Kible.dereceSar(Math.toDegrees(yonelim[0].toDouble()))
        dinleyici(
            Okuma(
                manyetikAzimut = azimut,
                egim = KibleKarari.egim(cevrilmis[8].toDouble()),
                kalibrasyon = KibleKarari.kalibrasyonGerekli(dogruluk, tahminiHata),
            ),
        )
    }
}
