package com.furkanisikay.namazakisi.saat.ui

import androidx.activity.compose.BackHandler
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathMeasure
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.CustomAccessibilityAction
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.customActions
import androidx.compose.ui.semantics.paneTitle
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.CompactButton
import androidx.wear.compose.material3.EdgeButton
import androidx.wear.compose.material3.EdgeButtonSize
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import com.furkanisikay.namazakisi.saat.cekirdek.AnaEkranKarari
import com.furkanisikay.namazakisi.saat.cekirdek.SaatPaleti
import kotlinx.coroutines.delay
import kotlin.math.roundToInt

/**
 * "Kıldım" onayı — ana ekranın üstünde AYNI katman (yeniden tasarım A4).
 *
 * `AlertDialog` KULLANILMAZ: ayrı, opak bir pencere açar; "düğme onay işaretine dönüşür,
 * arkadaki yay yeşile döner" sürekliliği ancak aynı katmanda kurulabilir. Bu yüzden yay
 * katmanın kendi zemininde yeniden çizilir; onay düğmesi alt kenara yaslı `EdgeButton`.
 *
 *  - İlk dokunuş bu katmanı açar (ana ekran düğmesi ya da liste satırı).
 *  - İkinci dokunuş: titreşim (`Confirm`) + `onOnayla` HEMEN (iyimser bekleyen yazılır,
 *    kuyruk yolu değişmez) → düğme 180 ms daralır → 300 ms onay işareti çizilir, yay
 *    yeşile döner → 450 ms sonra katman kapanır. Toplam ≈ 1,1 sn.
 *  - Kerahat vaktinde soru altında uyarı satırı: UYARIR, ENGELLEMEZ (telefon kuralı #82).
 *  - Vazgeç: küçük düğme, geri tuşu (`BackHandler`) ya da sağa kaydırma (elle; sistemin
 *    pencere düzeyindeki kaydırması önce yakalarsa aktivite kapanır — kayıt yazılmaz).
 *  - "Animasyonları kaldır" açıksa dönüşüm atlanır, katman kısa bir beklemeyle kapanır.
 */
@Composable
fun KildimOnayi(
    ad: String,
    vakitRengi: Long,
    kalanOran: Float,
    kerahat: Boolean,
    onOnayla: () -> Unit,
    onKapat: () -> Unit,
) {
    val azalt = hareketAzaltilmis()
    val titresim = LocalHapticFeedback.current
    var onaylandi by remember { mutableStateOf(false) }
    var surukleme by remember { mutableFloatStateOf(0f) }
    val kapat by rememberUpdatedState(onKapat)
    val genislikDp = LocalConfiguration.current.screenWidthDp

    BackHandler(enabled = !onaylandi) { kapat() }

    // Sonuç: aynı katmanda dönüşüm, sonra kapanış.
    val tik = remember { Animatable(0f) }
    LaunchedEffect(onaylandi) {
        if (!onaylandi) return@LaunchedEffect
        if (azalt) {
            tik.snapTo(1f)
            delay(400)
        } else {
            delay(180)
            tik.animateTo(1f, tween(300, easing = LinearEasing))
            delay(450)
        }
        kapat()
    }
    val yayRengi by animateColorAsState(
        renk(if (onaylandi) SaatPaleti.EYLEM else vakitRengi),
        tween(if (azalt) 0 else 300),
        label = "onayYayi",
    )
    val dugmeGenislik by animateDpAsState(
        if (onaylandi) 56.dp else (genislikDp * 0.62f).dp,
        tween(if (azalt) 0 else 180, easing = CubicBezierEasing(0.3f, 0f, 0.2f, 1f)),
        label = "dugmeDaralmasi",
    )

    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier
            .fillMaxSize()
            .background(renk(SaatPaleti.ZEMIN))
            .pointerInput(onaylandi) {
                if (onaylandi) return@pointerInput
                detectHorizontalDragGestures(
                    onDragEnd = {
                        if (surukleme > size.width * KAPATMA_ORANI) kapat()
                        surukleme = 0f
                    },
                    onDragCancel = { surukleme = 0f },
                ) { _, fark -> surukleme = (surukleme + fark).coerceAtLeast(0f) }
            }
            .offset { IntOffset(surukleme.roundToInt(), 0) }
            .semantics {
                paneTitle = "Kıldım onayı"
                customActions = listOf(CustomAccessibilityAction("Vazgeçin") { kapat(); true })
            },
    ) {
        Canvas(Modifier.fillMaxSize().clearAndSetSemantics { }) {
            vakitYayiCiz(kalanOran, yayRengi, renk(SaatPaleti.IZ), 5.dp, noktaGoster = false)
        }
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(start = 30.dp, end = 30.dp, bottom = 56.dp),
        ) {
            Text(
                AnaEkranKarari.onaySorusu(ad),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                textAlign = TextAlign.Center,
                color = renk(SaatPaleti.METIN),
            )
            if (kerahat) {
                Text(
                    "Kerahat vaktindesiniz.",
                    style = MaterialTheme.typography.labelSmall,
                    textAlign = TextAlign.Center,
                    color = renk(SaatPaleti.KERAHAT),
                )
            }
            Spacer(Modifier.height(6.dp))
            if (!onaylandi) {
                CompactButton(
                    onClick = kapat,
                    colors = ButtonDefaults.filledTonalButtonColors(),
                    label = { Text("Vazgeç") },
                )
            }
        }
        Box(Modifier.align(Alignment.BottomCenter)) {
            if (!onaylandi) {
                EdgeButton(
                    onClick = {
                        titresim.performHapticFeedback(HapticFeedbackType.Confirm)
                        onaylandi = true
                        onOnayla()
                    },
                    buttonSize = EdgeButtonSize.Medium,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = renk(SaatPaleti.EYLEM),
                        contentColor = renk(SaatPaleti.EYLEM_USTU),
                    ),
                    modifier = Modifier.semantics { contentDescription = "Kıldım" },
                ) {
                    Text("Kıldım", fontWeight = FontWeight.Bold)
                }
            } else {
                OnayIsareti(dugmeGenislik, tik.value)
            }
        }
    }
}

/** Daralmış düğme: yeşil daire + çizilen onay işareti (dekoratif; sonuç ana ekranda okunur). */
@Composable
private fun OnayIsareti(genislik: Dp, ilerleme: Float) {
    val yesil = renk(SaatPaleti.EYLEM)
    val ust = renk(SaatPaleti.EYLEM_USTU)
    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier
            .padding(bottom = 14.dp)
            .size(width = genislik, height = 56.dp)
            .background(yesil, CircleShape)
            .clearAndSetSemantics { contentDescription = "Kılındı" },
    ) {
        Canvas(Modifier.size(26.dp)) {
            val yol = Path().apply {
                moveTo(size.width * 0.12f, size.height * 0.55f)
                lineTo(size.width * 0.40f, size.height * 0.80f)
                lineTo(size.width * 0.88f, size.height * 0.22f)
            }
            val olcu = PathMeasure().apply { setPath(yol, false) }
            val parca = Path()
            olcu.getSegment(0f, olcu.length * ilerleme, parca, true)
            drawPath(parca, ust, style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round))
        }
    }
}

private const val KAPATMA_ORANI = 0.3f
