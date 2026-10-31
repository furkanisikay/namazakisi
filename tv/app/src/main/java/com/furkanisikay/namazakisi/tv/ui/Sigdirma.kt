package com.furkanisikay.namazakisi.tv.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.layout.Placeable
import androidx.compose.ui.layout.SubcomposeLayout
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Constraints
import androidx.compose.ui.unit.Density
import com.furkanisikay.namazakisi.tv.cekirdek.Sigdirma

/**
 * METİN bloğunu verilen yüksekliğe sığdırır: sığmazsa yazı ölçeği (yalnız `sp`; `dp` ölçüler,
 * simgeler değişmez) [Sigdirma.YAZI_OLCEKLERI] adımlarıyla [enKucukOlcek]'e kadar küçülür.
 * Kesik yarım satır yerine biraz küçük ama TAM metin (Tamilce eşleştirme açıklaması, onay
 * penceresi, kod ekranı başlığı).
 *
 * Kullanım kuralı: kaynağı `Modifier.weight(1f, fill = false)` olan metin bloğu; düğmeler
 * DIŞARIDA kalır (önce onlar ölçülür, tam boy alır). İçerik deneme için birkaç kez
 * alt-kompoze edilir → içine odaklanabilir öğe, `LaunchedEffect` ya da `FocusRequester`
 * KOYMA; yalnız düz metin/simge. Türkçe/İngilizce gibi sığan dilde ölçek 1 kalır (görünüm
 * değişmez). En küçük ölçekte de sığmazsa blok kırpılır (eski davranış).
 */
@Composable
fun YaziyiSigdir(
    modifier: Modifier = Modifier,
    enKucukOlcek: Float = 0.66f,
    icerik: @Composable () -> Unit,
) {
    val yogunluk = LocalDensity.current
    val olcekler = Sigdirma.olcekler(enKucukOlcek)
    SubcomposeLayout(modifier.clipToBounds()) { kisit ->
        val serbest = kisit.copy(minHeight = 0, maxHeight = Constraints.Infinity)
        var secilen: Placeable? = null
        for ((i, olcek) in olcekler.withIndex()) {
            val olculen = subcompose(i) {
                CompositionLocalProvider(LocalDensity provides Density(yogunluk.density, yogunluk.fontScale * olcek)) {
                    Box { icerik() }
                }
            }.first().measure(serbest)
            secilen = olculen
            if (olculen.height <= kisit.maxHeight) break
        }
        val p = secilen!!
        layout(p.width.coerceIn(kisit.minWidth, kisit.maxWidth), p.height.coerceIn(kisit.minHeight, kisit.maxHeight)) {
            p.placeRelative(0, 0)
        }
    }
}
