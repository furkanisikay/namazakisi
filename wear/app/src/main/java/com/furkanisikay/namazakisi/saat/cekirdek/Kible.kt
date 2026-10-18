package com.furkanisikay.namazakisi.saat.cekirdek

import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.floor
import kotlin.math.sin
import kotlin.math.tan

/**
 * Kıble açısı (saat yenileme W2) — SAF, telefonun `adhan` JS `Qibla`'sının İKİZİ.
 *
 * Gerçek kuzeye göre saat yönünde derece, [0, 360). Saate adhan2 bağımlılığı EKLENMEZ;
 * formül adhan 4.4.3 `Qibla.js` + `MathUtils.unwindAngle` ile BİREBİR aynıdır
 * (radyan dönüşümü `d * PI / 180.0` — `Math.toRadians` son basamakta sapabilir).
 * Kilit: `src/test/resources/kible-ornekleri.json` (üretici
 * `scripts/saat/kible-fikstur-uret.js`); Kotlin `KibleTest` 1e-9 ile, jest
 * `kibleParitesi.test.ts` telefonun yolundan yeniden hesaplayarak doğrular.
 */
object Kible {
    /** Kâbe — adhan JS ile aynı koordinat. */
    const val KABE_ENLEM = 21.4225241
    const val KABE_BOYLAM = 39.8261818

    fun aci(enlem: Double, boylam: Double): Double {
        val terim1 = sin(radyan(KABE_BOYLAM) - radyan(boylam))
        val terim2 = cos(radyan(enlem)) * tan(radyan(KABE_ENLEM))
        val terim3 = sin(radyan(enlem)) * cos(radyan(KABE_BOYLAM) - radyan(boylam))
        return dereceSar(derece(atan2(terim1, terim2 - terim3)))
    }

    /** adhan `unwindAngle` = `normalizeToScale(x, 360)`: `x - 360·floor(x/360)`. */
    fun dereceSar(aci: Double): Double = aci - 360.0 * floor(aci / 360.0)

    private fun radyan(d: Double): Double = d * Math.PI / 180.0
    private fun derece(r: Double): Double = r * 180.0 / Math.PI
}
