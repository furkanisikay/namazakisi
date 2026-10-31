package com.furkanisikay.namazakisi.tv.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.layout.Layout
import androidx.compose.ui.layout.Placeable
import androidx.compose.ui.layout.SubcomposeLayout
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Constraints
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
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

/**
 * İKİ çocuk: etiket (ilk) ve düğme (ikinci). Etiketin doğal tek satır genişliği düğmeyle yan
 * yana sığarsa `Row` gibi dizilir (etiket solda, düğme sağda, dikeyde ortalı — sığan dilde
 * görünüm eskisiyle aynı); sığmazsa düğme etiketin altına, sağa yaslı iner ve etiket tüm
 * genişliği alır (kural [Sigdirma.yanYanaSigar]). `Row` + `weight` uzun düğmenin yanında
 * etikete kalan birkaç piksele "ഇ…" basıyordu.
 *
 * Etiket iç ölçümle (max intrinsic) ölçülür → içine SubcomposeLayout (BoxWithConstraints,
 * [YaziyiSigdir]) KOYMA.
 */
@Composable
fun YanYanaYaDaAltAlta(
    modifier: Modifier = Modifier,
    satirArasi: Dp = 0.dp,
    icerik: @Composable () -> Unit,
) {
    Layout(icerik, modifier.fillMaxWidth()) { olculenler, kisit ->
        require(olculenler.size == 2) { "YanYanaYaDaAltAlta iki çocuk ister" }
        val (etiket, dugme) = olculenler
        val genislik = kisit.maxWidth
        val serbest = kisit.copy(minWidth = 0, minHeight = 0)
        val d = dugme.measure(serbest)
        val dogal = etiket.maxIntrinsicWidth(d.height)
        if (Sigdirma.yanYanaSigar(dogal, d.width, genislik)) {
            val e = etiket.measure(serbest.copy(maxWidth = (genislik - d.width).coerceAtLeast(0)))
            val boy = maxOf(e.height, d.height)
            layout(genislik, boy) {
                e.placeRelative(0, (boy - e.height) / 2)
                d.placeRelative(genislik - d.width, (boy - d.height) / 2)
            }
        } else {
            val e = etiket.measure(serbest)
            val ara = satirArasi.roundToPx()
            layout(genislik, e.height + ara + d.height) {
                e.placeRelative(0, 0)
                d.placeRelative(genislik - d.width, e.height + ara)
            }
        }
    }
}
