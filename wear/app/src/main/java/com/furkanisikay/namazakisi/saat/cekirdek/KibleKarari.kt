package com.furkanisikay.namazakisi.saat.cekirdek

import kotlin.math.acos
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.roundToInt
import kotlin.math.sin

/**
 * Kıble pusulası kararları (saat yenileme W2) — SAF (android.* import etmez).
 * Sensör, manyetik sapma ve ekran dönüşü `kible/KiblePusulasi`'ndadır; buraya
 * yalnız SAYI girer. Açılar derece, gerçek kuzeye göre saat yönünde.
 */
object KibleKarari {
    /**
     * Hizaya GİRİŞ: telefonla AYNI eşik (`NativePusulaView.KIBLE_HIZALAMA_ESIGI` = 10;
     * `hedef < 10 || hedef > 350`). Telefon ile saat aynı anda "kıble yönündesiniz"
     * demeli.
     */
    const val HIZA_GIRIS_DERECE = 10.0

    /**
     * Hizadan ÇIKIŞ (histerezis): bilek titrerken sapma 10°'nin iki yanında gidip
     * gelir; tek eşikte "hizalı" yazısı yanıp söner ve her girişte titreşim
     * tekrarlanırdı. Çıkış eşiği girişten 5° geniş tutulur.
     */
    const val HIZA_CIKIS_DERECE = 15.0

    /** Saat yüzü yataydan bu kadar saparsa "yere paralel tutun" ipucu. */
    const val EGIM_IPUCU_DERECE = 35.0

    /** Dönme vektörünün tahmini yön hatası (radyan) bunu aşarsa kalibrasyon önerilir (≈ 30°). */
    const val KALIBRASYON_HATA_RAD = 0.5236

    /** Android `SensorManager.SENSOR_STATUS_ACCURACY_LOW` (saf kodda sabit kopyası). */
    const val DOGRULUK_DUSUK = 1

    /** Android `SensorManager.SENSOR_STATUS_UNRELIABLE`. */
    const val DOGRULUK_GUVENILMEZ = 0

    /** Gerçek kuzey = manyetik azimut + manyetik sapma (doğu pozitif). */
    fun gercekYon(manyetikAzimut: Double, sapma: Double): Double = Kible.dereceSar(manyetikAzimut + sapma)

    /** Kıblenin saate göre açısı: 0 = tam önde, 90 = sağda, 270 = solda. */
    fun hedefAcisi(kibleAcisi: Double, yon: Double): Double = Kible.dereceSar(kibleAcisi - yon)

    /** Kıbleden mutlak sapma, [0, 180]. */
    fun sapma(hedef: Double): Double {
        val h = Kible.dereceSar(hedef)
        return if (h > 180.0) 360.0 - h else h
    }

    data class Hiza(val hizali: Boolean, val titret: Boolean)

    /**
     * Titreşimle yönlendirme (saat W3, fikir 6): kıbleye YAKLAŞTIKÇA kısa tıklar
     * sıklaşır; ekrana bakmadan, karanlıkta yön bulunur. Hizadayken null — W2'nin
     * tek onay titreşimi (`hiza.titret`) korunur, hizada sürekli tıklama olmaz.
     * Aralıklar ms; sensör olayı geldikçe `simdi − sonTik >= aralık` ise tıklanır.
     */
    fun yonlendirmeAraligiMs(hedef: Double, hizali: Boolean): Long? {
        if (hizali) return null
        val s = sapma(hedef)
        return when {
            s <= 25.0 -> 250L
            s <= 45.0 -> 450L
            s <= 90.0 -> 800L
            s <= 135.0 -> 1_200L
            else -> 1_600L
        }
    }

    /**
     * Histerezisli hizalama: girişte < 10°, çıkışta > 15°. `titret` yalnız hizaya
     * GİRİŞ anında true — hizadayken tekrar etmez, çıkıp yeniden girmeden titremez.
     */
    fun hiza(oncekiHizali: Boolean, hedef: Double): Hiza {
        val s = sapma(hedef)
        val hizali = if (oncekiHizali) s <= HIZA_CIKIS_DERECE else s < HIZA_GIRIS_DERECE
        return Hiza(hizali, titret = hizali && !oncekiHizali)
    }

    /**
     * Saat yüzünün yataydan sapması (derece). Girdi: dönme matrisinin `R[8]` öğesi
     * (cihaz z ekseninin dünya "yukarı" bileşeni; yüz yukarı yatay = 1).
     */
    fun egim(rz: Double): Double = Math.toDegrees(acos(rz.coerceIn(-1.0, 1.0)))

    fun egimIpucu(egimDerece: Double): Boolean = egimDerece > EGIM_IPUCU_DERECE

    /**
     * Kalibrasyon bandı: sensörün bildirdiği doğruluk düşük/güvenilmez ya da dönme
     * vektörünün tahmini yön hatası (`values[4]`; bilinmiyorsa null ya da negatif) büyük.
     */
    fun kalibrasyonGerekli(dogruluk: Int, tahminiHataRad: Double?): Boolean {
        if (dogruluk == DOGRULUK_GUVENILMEZ || dogruluk == DOGRULUK_DUSUK) return true
        return tahminiHataRad != null && tahminiHataRad >= 0.0 && tahminiHataRad > KALIBRASYON_HATA_RAD
    }

    /**
     * TalkBack metni — 10°'lik ADIMLARLA (her sensör olayında okunmasın; ekran yalnız
     * metin değişince açıklamayı günceller). Kibar "siz".
     */
    fun erisimMetni(hedef: Double, hizali: Boolean): String {
        if (hizali) return "Kıble yönündesiniz"
        val s = sapma(hedef)
        if (s >= 175.0) return "Kıble arkanızda"
        val adim = ((s / 10.0).roundToInt() * 10).coerceAtLeast(10)
        val taraf = if (Kible.dereceSar(hedef) <= 180.0) "sağınızda" else "solunuzda"
        return "Kıble $adim derece $taraf"
    }

    /**
     * Ok dönüşünde EN KISA yol: önceki çizim açısından yeni hedefe en yakın eşdeğer
     * (359 → 1 geçişinde ok 358° geri dönmez, 2° ileri gider). Sonuç sarılmaz.
     */
    fun enKisaYol(onceki: Double, yeni: Double): Double {
        var fark = Kible.dereceSar(yeni) - Kible.dereceSar(onceki)
        if (fark > 180.0) fark -= 360.0
        if (fark < -180.0) fark += 360.0
        return onceki + fark
    }

    /**
     * Açı uzayında düşük geçiren süzgeç: sin/cos ayrı ayrı ortalanır → 359° ile 1°
     * arası sıçrama "180°'den dolaşma" üretmez. `alfa` yeni örneğin ağırlığı.
     */
    class AciSuzgeci(private val alfa: Double = 0.25) {
        private var s = 0.0
        private var c = 0.0
        private var dolu = false

        fun ekle(derece: Double): Double {
            val r = Math.toRadians(derece)
            if (!dolu) {
                s = sin(r)
                c = cos(r)
                dolu = true
            } else {
                s += alfa * (sin(r) - s)
                c += alfa * (cos(r) - c)
            }
            return Kible.dereceSar(Math.toDegrees(atan2(s, c)))
        }

        fun sifirla() {
            dolu = false
        }
    }

    /**
     * UYARLAMALI açı süzgeci (kıble cilası): sabit `alfa` ya titremeyi bırakır (yüksek alfa)
     * ya da bilek dönerken ok geride kalır (düşük alfa). Burada ağırlık, yeni örneğin süzülmüş
     * yönden SAPMASIYLA büyür: < [SAKIN_DERECE] sapma (el titremesi, sensör gürültüsü) neredeyse
     * yok sayılır ([EN_AZ_ALFA]), ≥ [HIZLI_DERECE] sapma (gerçek dönüş) hemen izlenir
     * ([EN_FAZLA_ALFA]); arası doğrusal. Sin/cos uzayında çalışır (359 → 1 dolaşmaz).
     * Ekrandaki yay animasyonu bunun ÜSTÜNE kısa bir yumuşatma ekler; ikisi birlikte ayarlı.
     * Değerler `SENSOR_DELAY_UI` (≈ 15 Hz) içindir: en düşük ağırlıkta son 3° ≈ 0,8 sn'de
     * oturur, hızlı dönüşte gecikme sabit 0,25 alfanın yaklaşık yarısıdır.
     */
    class UyarlamaliAciSuzgeci {
        private var s = 0.0
        private var c = 0.0
        private var dolu = false

        fun ekle(derece: Double): Double {
            val r = Math.toRadians(derece)
            if (!dolu) {
                s = sin(r)
                c = cos(r)
                dolu = true
                return Kible.dereceSar(derece)
            }
            val simdiki = Kible.dereceSar(Math.toDegrees(atan2(s, c)))
            val fark = sapma(derece - simdiki)
            val alfa = alfa(fark)
            s += alfa * (sin(r) - s)
            c += alfa * (cos(r) - c)
            return Kible.dereceSar(Math.toDegrees(atan2(s, c)))
        }

        fun sifirla() {
            dolu = false
        }

        companion object {
            const val SAKIN_DERECE = 2.0
            const val HIZLI_DERECE = 25.0
            const val EN_AZ_ALFA = 0.15
            const val EN_FAZLA_ALFA = 0.6

            /** Sapmaya göre ağırlık (saf, test edilir). */
            fun alfa(sapmaDerece: Double): Double {
                val t = ((sapmaDerece - SAKIN_DERECE) / (HIZLI_DERECE - SAKIN_DERECE)).coerceIn(0.0, 1.0)
                return EN_AZ_ALFA + (EN_FAZLA_ALFA - EN_AZ_ALFA) * t
            }
        }
    }

    /**
     * Ekranın büyük satırı: hangi yöne, ne kadar dönülmeli? ("Sağa 35°", "Sola 120°",
     * arkadaysa "Arkanızda"). 5°'lik adımla (her sensör olayında rakam titremesin).
     * Hizadayken çağıran "Kıble yönündesiniz" yazar.
     */
    fun donusMetni(hedef: Double): String {
        val s = sapma(hedef)
        if (s >= 175.0) return "Arkanızda"
        val adim = ((s / 5.0).roundToInt() * 5).coerceAtLeast(5)
        val taraf = if (Kible.dereceSar(hedef) <= 180.0) "Sağa" else "Sola"
        return "$taraf $adim°"
    }
}
