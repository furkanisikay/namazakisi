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
import androidx.compose.foundation.focusable
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
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
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathMeasure
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.rotary.onRotaryScrollEvent
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.CustomAccessibilityAction
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.customActions
import androidx.compose.ui.semantics.liveRegion
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
import com.furkanisikay.namazakisi.saat.R
import com.furkanisikay.namazakisi.saat.cekirdek.AnaEkranKarari
import com.furkanisikay.namazakisi.saat.cekirdek.SaatPaleti
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
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
 *    kuyruk yolu değişmez) → düğme 180 ms daralır → 300 ms onay işareti çizilir, dairenin
 *    dışına bir halka BİR KEZ yayılıp söner (520 ms), yay
 *    yeşile döner → 450 ms sonra katman kapanır. Toplam ≈ 1,1 sn.
 *  - Kerahat vaktinde soru altında uyarı satırı: UYARIR, ENGELLEMEZ (telefon kuralı #82).
 *  - Vazgeç: küçük düğme, geri tuşu (`BackHandler`) ya da sağa kaydırma (elle; sistemin
 *    pencere düzeyindeki kaydırması önce yakalarsa aktivite kapanır — kayıt yazılmaz).
 *  - "Animasyonları kaldır" açıksa dönüşüm atlanır, katman kısa bir beklemeyle kapanır.
 *  - `onOnayla` dokunuş anında yeniden doğrular ve `false` dönebilir (katman açıkken vakit
 *    değişti, telefon işaretledi): o zaman başarı ÇİZİLMEZ — `Reject` titreşimi, kısa
 *    "Vakit değişti" metni, katman kapanır.
 */
@Composable
fun KildimOnayi(
    ad: String,
    vakitRengi: Long,
    kalanOran: Float,
    kerahat: Boolean,
    onOnayla: () -> Boolean,
    onKapat: () -> Unit,
) {
    val azalt = hareketAzaltilmis()
    val titresim = LocalHapticFeedback.current
    val dil = stringResource(R.string.dil_kodu)
    val panoBasligi = stringResource(R.string.kildim_onayi)
    val vazgecinEtiketi = stringResource(R.string.vazgecin)
    val kildimEtiketi = stringResource(R.string.kildim)
    var onaylandi by remember { mutableStateOf(false) }
    var reddedildi by remember { mutableStateOf(false) }
    var surukleme by remember { mutableFloatStateOf(0f) }
    val kapat by rememberUpdatedState(onKapat)
    val genislikDp = LocalConfiguration.current.screenWidthDp

    val bitti = onaylandi || reddedildi
    BackHandler(enabled = !bitti) { kapat() }

    // Taç olayları odaklı öğeye gider: katman açıkken arkadaki liste kaymasın.
    val odak = remember { FocusRequester() }
    LaunchedEffect(Unit) { odak.requestFocus() }

    // Sonuç: aynı katmanda dönüşüm, sonra kapanış.
    val tik = remember { Animatable(0f) }
    // Tek seferlik vurgu: daire oturunca dışına bir halka bir kez yayılıp söner.
    val halka = remember { Animatable(0f) }
    LaunchedEffect(onaylandi) {
        if (!onaylandi) return@LaunchedEffect
        if (azalt) {
            tik.snapTo(1f)
            delay(KABUL_GOSTERIM_MS)
        } else {
            delay(180)
            launch { halka.animateTo(1f, tween(HALKA_MS, easing = CubicBezierEasing(0.2f, 0f, 0f, 1f))) }
            tik.animateTo(1f, tween(300, easing = LinearEasing))
            // "Allah kabul etsin" okunabilsin diye kısa bekleme (sahne yine ~1,5 sn'de biter).
            delay(KABUL_GOSTERIM_MS)
        }
        kapat()
    }
    LaunchedEffect(reddedildi) {
        if (!reddedildi) return@LaunchedEffect
        delay(RED_GOSTERIM_MS)
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
            .pointerInput(bitti) {
                if (bitti) return@pointerInput
                detectHorizontalDragGestures(
                    onDragEnd = {
                        if (surukleme > size.width * KAPATMA_ORANI) kapat()
                        surukleme = 0f
                    },
                    onDragCancel = { surukleme = 0f },
                ) { _, fark -> surukleme = (surukleme + fark).coerceAtLeast(0f) }
            }
            .offset { IntOffset(surukleme.roundToInt(), 0) }
            .onRotaryScrollEvent { true }
            .focusRequester(odak)
            .focusable()
            .semantics {
                paneTitle = panoBasligi
                customActions = listOf(CustomAccessibilityAction(vazgecinEtiketi) { kapat(); true })
            },
    ) {
        Canvas(Modifier.fillMaxSize().clearAndSetSemantics { }) {
            vakitYayiCiz(kalanOran, yayRengi, renk(SaatPaleti.IZ), 5.dp, noktaGoster = false)
        }
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            // Güvenli sütun: yuvarlak ekranda soru tek satıra yayılıp dairenin kenarında
            // kırpılıyordu, kare ekranda tepedeki yaya değiyordu. Soru İKİ sabit satırdır
            // ("Öğle namazını" / "kıldınız mı?"), her satır kendini sütuna sığdırır.
            // Kare saatte yay ekranın kenarına yakın: soru biraz aşağıda ve daha dar sütunda
            // durmazsa ilk satır tepedeki yaya değiyordu (kare koşusunda görüldü).
            modifier = Modifier
                .fillMaxWidth(guvenliGenislikOrani(yuvarlakOran = 0.66f, kareOran = 0.42f))
                .padding(bottom = if (LocalConfiguration.current.isScreenRound) 50.dp else 22.dp),
        ) {
            if (reddedildi) {
                Text(
                    AnaEkranKarari.vakitDegisti(dil),
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold,
                    textAlign = TextAlign.Center,
                    color = renk(SaatPaleti.METIN),
                    maxLines = 2,
                    // Ret metni ekran okuyucuya kendiliğinden okunur.
                    modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
                )
            } else if (onaylandi) {
                // Onaylanınca soru duaya döner (sahip isteği); canlı bölge ekran okuyucuya okutur.
                Text(
                    AnaEkranKarari.kabulDuasi(dil),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    textAlign = TextAlign.Center,
                    color = renk(SaatPaleti.METIN),
                    maxLines = 2,
                    modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
                )
            } else {
                val (ilk, ikinci) = AnaEkranKarari.onaySorusuSatirlari(ad, dil)
                val soru = AnaEkranKarari.onaySorusu(ad, dil)
                val boy = MaterialTheme.typography.titleMedium.fontSize
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.clearAndSetSemantics { contentDescription = soru },
                ) {
                    SigdirilanMetin(ilk, enFazla = boy, renk = renk(SaatPaleti.METIN), agirlik = FontWeight.SemiBold, modifier = Modifier.fillMaxWidth())
                    SigdirilanMetin(ikinci, enFazla = boy, renk = renk(SaatPaleti.METIN), agirlik = FontWeight.SemiBold, modifier = Modifier.fillMaxWidth())
                }
            }
            if (kerahat && !reddedildi) {
                Text(
                    stringResource(R.string.kerahat_vaktindesiniz),
                    style = MaterialTheme.typography.labelSmall,
                    textAlign = TextAlign.Center,
                    color = renk(SaatPaleti.KERAHAT),
                )
            }
            Spacer(Modifier.height(6.dp))
            if (!bitti) {
                CompactButton(
                    onClick = kapat,
                    colors = ButtonDefaults.filledTonalButtonColors(),
                    label = { Text(stringResource(R.string.vazgec)) },
                )
            }
        }
        Box(Modifier.align(Alignment.BottomCenter)) {
            // Reddedildiyse düğme alanı boş kalır (bilgi metni yukarıda).
            if (!bitti) {
                EdgeButton(
                    onClick = {
                        if (onOnayla()) {
                            titresim.performHapticFeedback(HapticFeedbackType.Confirm)
                            onaylandi = true
                        } else {
                            titresim.performHapticFeedback(HapticFeedbackType.Reject)
                            reddedildi = true
                        }
                    },
                    buttonSize = EdgeButtonSize.Medium,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = renk(SaatPaleti.EYLEM),
                        contentColor = renk(SaatPaleti.EYLEM_USTU),
                    ),
                    modifier = Modifier.semantics { contentDescription = kildimEtiketi },
                ) {
                    Text(kildimEtiketi, fontWeight = FontWeight.Bold)
                }
            } else if (onaylandi) {
                OnayIsareti(dugmeGenislik, tik.value, halka.value)
            }
        }
    }
}

/** Daralmış düğme: yeşil daire + çizilen onay işareti (dekoratif; sonuç ana ekranda okunur). */
@Composable
private fun OnayIsareti(genislik: Dp, ilerleme: Float, halka: Float) {
    val aciklama = stringResource(R.string.kilindi_dua, AnaEkranKarari.kabulDuasi(stringResource(R.string.dil_kodu)))
    val yesil = renk(SaatPaleti.EYLEM)
    val ust = renk(SaatPaleti.EYLEM_USTU)
    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier
            .padding(bottom = 14.dp)
            .size(width = genislik, height = 56.dp)
            .drawBehind {
                // 0 ve 1'de çizilmez: halka yalnız sahne sürerken vardır (boşta sıfır çizim).
                if (halka > 0f && halka < 1f) {
                    drawCircle(
                        yesil.copy(alpha = 1f - halka),
                        radius = size.minDimension / 2f + 22.dp.toPx() * halka,
                        style = Stroke(width = 3.dp.toPx() * (1f - halka * 0.5f)),
                    )
                }
            }
            .background(yesil, CircleShape)
            .clearAndSetSemantics { contentDescription = aciklama },
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
private const val RED_GOSTERIM_MS = 1600L
private const val KABUL_GOSTERIM_MS = 900L
private const val HALKA_MS = 520
