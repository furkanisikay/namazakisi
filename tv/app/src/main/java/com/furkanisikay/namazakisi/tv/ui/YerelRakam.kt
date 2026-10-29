package com.furkanisikay.namazakisi.tv.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.res.stringResource
import com.furkanisikay.namazakisi.tv.R
import com.furkanisikay.namazakisi.tv.cekirdek.Il
import com.furkanisikay.namazakisi.tv.cekirdek.RakamKarari
import com.furkanisikay.namazakisi.tv.cekirdek.TvRakam
import com.furkanisikay.namazakisi.tv.cekirdek.rakamlariYerellestir
import com.furkanisikay.namazakisi.tv.veri.KonumDeposu

/** Panonun rakam dizisinin sıfırı ('0' = Batı). Kök `RakamSaglayici` kurar. */
val LocalRakamSifiri = staticCompositionLocalOf { '0' }

/**
 * Rakam sistemini konumdan çözüp alt ağaca verir. Ülke: telefondan gelen konumda telefonun
 * gönderdiği ülke; elle seçilen il Türkiye; ülkesi bilinmeyen telefon konumunda cihazın bölgesi.
 */
@Composable
fun RakamSaglayici(il: Il?, icerik: @Composable () -> Unit) {
    val dil = stringResource(R.string.dil_kodu)
    val cihazUlkesi = LocalConfiguration.current.locales[0].country.takeIf { it.length == 2 }
    val tercih = when {
        il == null -> TvRakam(cihazUlkesi)
        il.plaka != KonumDeposu.PLAKA_TELEFON -> TvRakam("TR")
        else -> il.rakam?.let { if (it.ulke == null) it.copy(ulke = cihazUlkesi) else it } ?: TvRakam(cihazUlkesi)
    }
    val sifir = RakamKarari.sifir(RakamKarari.sistem(dil, tercih))
    CompositionLocalProvider(LocalRakamSifiri provides sifir, content = icerik)
}

/** Görünen metnin rakamlarını panonun sistemine çevirir (çizim kenarı; çekirdek Batı üretir). */
@Composable
@ReadOnlyComposable
fun String.yerelRakam(): String = rakamlariYerellestir(this, LocalRakamSifiri.current)
