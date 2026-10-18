package com.furkanisikay.namazakisi.saat.ui

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.CompactButton
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import com.furkanisikay.namazakisi.saat.cekirdek.AnaEkranKarari
import com.furkanisikay.namazakisi.saat.cekirdek.GunDurumu
import com.furkanisikay.namazakisi.saat.cekirdek.SaatPaleti
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.sin

/**
 * Yay geometrisi: iz tepeden 30° sağda başlar (vakit GİRER), saat yönünde 300° döner,
 * tepeden 30° solda biter (vakit ÇIKAR). Tepedeki 60°'lik boşluk sistem saatine
 * (`TimeText`) ayrılır. Parlak kısım KALAN süredir; yay saat yönünde boşalır.
 * Compose açıları: 0° = saat 3, artı = saat yönü.
 */
const val YAY_BASLANGIC = -60f
const val YAY_TARAMA = 300f

/**
 * @param kalanOran yayın parlak kısmı [0,1]
 * @param bant kerahat bandının yaydaki konumu (giriş = 0, çıkış = 1), yayın DIŞINDA kesikli
 * @param noktaGoster "şimdi" noktası (ambient'te çizilmez)
 */
fun DrawScope.vakitYayiCiz(
    kalanOran: Float,
    renk: Color,
    iz: Color,
    kalinlik: Dp,
    bant: ClosedFloatingPointRange<Float>? = null,
    bantRengi: Color = Color.Transparent,
    noktaGoster: Boolean = true,
    kenarPay: Dp = 5.dp,
) {
    val k = kalinlik.toPx()
    val pay = kenarPay.toPx() + k * 2.2f
    val cap = min(size.width, size.height) - pay * 2
    if (cap <= 0f) return
    val solUst = Offset((size.width - cap) / 2, (size.height - cap) / 2)
    val boyut = Size(cap, cap)
    val cizgi = Stroke(width = k, cap = StrokeCap.Round)
    drawArc(iz, YAY_BASLANGIC, YAY_TARAMA, useCenter = false, topLeft = solUst, size = boyut, style = cizgi)
    val oran = kalanOran.coerceIn(0f, 1f)
    val simdiAci = YAY_BASLANGIC + YAY_TARAMA * (1f - oran)
    if (oran > 0f) {
        drawArc(renk, simdiAci, YAY_TARAMA * oran, useCenter = false, topLeft = solUst, size = boyut, style = cizgi)
    }
    if (bant != null && bantRengi != Color.Transparent) {
        val dis = k * 1.8f
        val bantBoyut = Size(cap + dis * 2, cap + dis * 2)
        val bantSolUst = Offset(solUst.x - dis, solUst.y - dis)
        drawArc(
            bantRengi,
            YAY_BASLANGIC + YAY_TARAMA * bant.start,
            YAY_TARAMA * (bant.endInclusive - bant.start),
            useCenter = false,
            topLeft = bantSolUst,
            size = bantBoyut,
            style = Stroke(width = k * 0.45f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(k * 0.9f, k * 0.6f))),
        )
    }
    if (noktaGoster) {
        val r = cap / 2
        val aci = Math.toRadians(simdiAci.toDouble())
        val merkez = Offset(solUst.x + r + (r * cos(aci)).toFloat(), solUst.y + r + (r * sin(aci)).toFloat())
        drawCircle(Color.Black, radius = k * 0.95f, center = merkez)
        drawCircle(renk, radius = k * 0.95f, center = merkez, style = Stroke(width = k * 0.5f))
    }
}

/** Ekran genişliğine göre sabit ölçekli yazı boyu: yazı ölçeği büyüse de rakam taşmaz (A9). */
@Composable
fun sabitBoyut(oran: Float): androidx.compose.ui.unit.TextUnit {
    val genislik = LocalConfiguration.current.screenWidthDp
    val yogunluk = LocalDensity.current
    return (genislik * oran / yogunluk.fontScale).sp
}

/** Rakamlar sabit genişlikli (saniye değişince satır oynamasın). */
val RAKAM = TextStyle(fontFeatureSettings = "tnum")

/**
 * Ana ekranın ilk, tam ekran öğesi: vakit yayı + sayaç + "Kıldım" + gün noktaları.
 *
 * Erişilebilirlik: metin kümesi TEK düğümdür (`Gorunum.aciklama`, dakika çözünürlüklü);
 * saniye ayrı düğüm değildir, `liveRegion` YOK → TalkBack her saniye okumaz. Yay
 * dekoratiftir. "Kıldım" kendi açıklamasıyla ayrı düğümdür.
 */
@Composable
fun VakitSayaci(
    g: AnaEkranKarari.Gorunum,
    saniyeGoster: Boolean,
    onKildim: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val azalt = hareketAzaltilmis()
    // Açılışta 600 ms, vakit değişince 450 ms yeniden çizim (olay tetikli; boşta hareket yok).
    val ilkAcilis = remember { booleanArrayOf(true) }
    val cizim = remember(g.sayilan.hedef) { Animatable(if (azalt) 1f else 0f) }
    LaunchedEffect(g.sayilan.hedef) {
        if (!azalt) cizim.animateTo(1f, tween(if (ilkAcilis[0]) 600 else 450))
        ilkAcilis[0] = false
    }
    val renk by animateColorAsState(renk(g.renk), tween(if (azalt) 0 else 450), label = "vakitRengi")
    val kerahat = renk(SaatPaleti.KERAHAT)
    val iz = renk(SaatPaleti.IZ)

    Box(contentAlignment = Alignment.Center, modifier = modifier) {
        Canvas(Modifier.fillMaxSize()) {
            vakitYayiCiz(
                kalanOran = g.kalanOran * cizim.value,
                renk = renk,
                iz = iz,
                kalinlik = 5.dp,
                bant = g.kerahatBandi,
                bantRengi = kerahat,
            )
        }
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(horizontal = 28.dp),
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.clearAndSetSemantics { contentDescription = g.aciklama },
            ) {
                Text(
                    g.adSatiri,
                    color = renk,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    textAlign = TextAlign.Center,
                    maxLines = 1,
                )
                Row(verticalAlignment = Alignment.Bottom) {
                    Text(
                        g.sayac.ana,
                        style = RAKAM,
                        fontSize = sabitBoyut(0.20f),
                        fontWeight = FontWeight.SemiBold,
                        color = renk(SaatPaleti.METIN),
                        maxLines = 1,
                    )
                    if (saniyeGoster) {
                        Text(
                            g.sayac.saniye,
                            style = RAKAM,
                            fontSize = sabitBoyut(0.085f),
                            fontWeight = FontWeight.Medium,
                            color = if (g.acil) renk else renk(SaatPaleti.METIN2),
                            maxLines = 1,
                            modifier = Modifier.padding(bottom = 5.dp, start = 1.dp),
                        )
                    }
                }
                Text(
                    g.altYazi,
                    style = MaterialTheme.typography.labelSmall,
                    color = renk(SaatPaleti.METIN2),
                    maxLines = 1,
                )
            }
            Spacer(Modifier.height(4.dp))
            KildimDugmesi(g, onKildim)
            if (g.noktalar.isNotEmpty()) {
                Spacer(Modifier.height(4.dp))
                GunNoktalari(g.noktalar, g.aktifNokta, renk)
            }
        }
    }
}

@Composable
private fun KildimDugmesi(g: AnaEkranKarari.Gorunum, onKildim: () -> Unit) {
    when (g.dugme) {
        AnaEkranKarari.Dugme.ISARETLE -> CompactButton(
            onClick = onKildim,
            colors = ButtonDefaults.buttonColors(
                containerColor = renk(SaatPaleti.EYLEM),
                contentColor = renk(SaatPaleti.EYLEM_USTU),
            ),
            modifier = Modifier.semantics { contentDescription = AnaEkranKarari.dugmeAciklamasi(g.sayilan.ad) },
            label = { Text("Kıldım", fontWeight = FontWeight.Bold) },
        )
        AnaEkranKarari.Dugme.KILINDI, AnaEkranKarari.Dugme.ESITLENIYOR -> Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .height(32.dp)
                .background(renk(SaatPaleti.YUZEY2), RoundedCornerShape(16.dp))
                .padding(horizontal = 12.dp)
                // Durum zaten sayaç açıklamasında ("kılındı") okunur; ikinci kez okunmasın.
                .clearAndSetSemantics { },
        ) {
            Text(
                if (g.dugme == AnaEkranKarari.Dugme.ESITLENIYOR) "✓ Kılındı · eşitleniyor" else "✓ Kılındı",
                color = renk(SaatPaleti.EYLEM),
                style = MaterialTheme.typography.labelMedium,
                maxLines = 1,
            )
        }
        AnaEkranKarari.Dugme.YOK -> Unit
    }
}

/** Beş farz: kılınan dolu yeşil, şu anki vakit tonunda halka, diğerleri sönük. */
@Composable
private fun GunNoktalari(haller: List<GunDurumu.Hal>, aktif: Int?, aktifRenk: Color) {
    Row(horizontalArrangement = Arrangement.spacedBy(5.dp), modifier = Modifier.clearAndSetSemantics { }) {
        haller.forEachIndexed { i, hal ->
            val m = Modifier.size(7.dp)
            when {
                hal == GunDurumu.Hal.KILINDI -> Box(m.background(renk(SaatPaleti.EYLEM), CircleShape))
                i == aktif -> Box(
                    m.drawBehind {
                        drawCircle(aktifRenk, radius = size.minDimension / 2 - 1.dp.toPx(), style = Stroke(1.5.dp.toPx()))
                    }
                )
                else -> Box(m.background(renk(SaatPaleti.IZ), CircleShape))
            }
        }
    }
}
