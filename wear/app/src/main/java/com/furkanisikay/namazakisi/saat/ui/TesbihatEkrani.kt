package com.furkanisikay.namazakisi.saat.ui

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.input.rotary.onRotaryScrollEvent
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material3.AlertDialog
import androidx.wear.compose.material3.AlertDialogDefaults
import androidx.wear.compose.material3.AppScaffold
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.CompactButton
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import androidx.wear.compose.material3.TimeText
import android.os.SystemClock
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.size
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathMeasure
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.foundation.Canvas
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.text.font.FontWeight
import com.furkanisikay.namazakisi.saat.cekirdek.SaatPaleti
import com.furkanisikay.namazakisi.saat.cekirdek.TesbihatYaylari
import kotlinx.coroutines.launch
import kotlin.math.PI
import kotlin.math.min
import kotlin.math.sin
import com.furkanisikay.namazakisi.saat.cekirdek.TacBiriktirici
import com.furkanisikay.namazakisi.saat.cekirdek.Tesbihat

/**
 * Tesbihat sayacı ekranı (issue #293). Ekranın TAMAMI tek dokunma hedefidir (+1);
 * taç/çerçeve saat yönünde çevrilince sayar, ters yönde son sayımı geri alır. Kenarda
 * o fazın ilerleme halkası, ortada faz adı ve büyük rakam. Uzun basış = "baştan başla"
 * (onaylı). Arayüz dili kibar "siz".
 *
 * Taşma kuralı: halkanın içindeki her metin `guvenliGenislikOrani()` sütununda, tek satır
 * (tehlil hariç) + üç nokta; boyu `sinirliBoyut` (yazı ölçeği en fazla 1,15×) ya da
 * `sabitBoyut`. 454 yuvarlak / 384 kare ekranda ve 2× yazı ölçeğinde de kenara taşmaz.
 *
 * Taç dönüşü ancak ekran AÇIKKEN gelir (Wear OS ekran kapalıyken rotary olayını
 * uygulamaya iletmez); ekran uyanınca sayım diskten kaldığı yerden sürer.
 */
@OptIn(ExperimentalFoundationApi::class)
@Composable
fun TesbihatEkrani(
    durum: Tesbihat.Durum,
    tacEsigi: Float,
    onSay: () -> Unit,
    onGeriAl: () -> Unit,
    onSifirla: () -> Unit,
) {
    val odak = remember { FocusRequester() }
    val tac = remember(tacEsigi) { TacBiriktirici(tacEsigi) }
    var sifirlamaOnayi by remember { mutableStateOf(false) }
    // Rotary olayları odaklı öğeye gelir.
    LaunchedEffect(Unit) { odak.requestFocus() }

    val aciklama = if (durum.tamamMi) {
        "Tesbihat tamamlandı, ${Tesbihat.TOPLAM} / ${Tesbihat.TOPLAM}. ${Tesbihat.KAYNAK}"
    } else {
        "${durum.faz.ad}, ${durum.fazSayisi} / ${durum.faz.hedef}. Toplam ${durum.toplam} / ${Tesbihat.TOPLAM}"
    }

    SaatTemasi {
        AppScaffold(timeText = { TimeText() }) {
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .fillMaxSize()
                    .onRotaryScrollEvent { olay ->
                        // Saat yönü sayar, ters yön son sayımı geri alır (tamamken de: 100 → 99).
                        when (tac.olay(olay.verticalScrollPixels, olay.uptimeMillis)) {
                            TacBiriktirici.Adim.SAY -> if (!durum.tamamMi) onSay()
                            TacBiriktirici.Adim.GERI_AL -> if (durum.toplam > 0) onGeriAl()
                            TacBiriktirici.Adim.YOK -> Unit
                        }
                        true
                    }
                    .focusRequester(odak)
                    .focusable()
                    .combinedClickable(
                        enabled = !durum.tamamMi,
                        onClickLabel = "Sayın",
                        onLongClickLabel = "Baştan başlayın",
                        onLongClick = { if (durum.toplam > 0) sifirlamaOnayi = true },
                        onClick = onSay,
                    )
                    .semantics {
                        contentDescription = aciklama
                        liveRegion = LiveRegionMode.Polite
                    },
            ) {
                TesbihatHalkasi(durum)
                if (durum.tamamMi) {
                    TamamIcerigi(onYenidenBasla = onSifirla)
                } else {
                    SayimIcerigi(durum, onGeriAl)
                }
            }

            AlertDialog(
                visible = sifirlamaOnayi,
                onDismissRequest = { sifirlamaOnayi = false },
                title = { Text("Baştan başlansın mı?", textAlign = TextAlign.Center) },
                text = { Text("Sayım sıfırlanır.", textAlign = TextAlign.Center) },
                confirmButton = {
                    AlertDialogDefaults.ConfirmButton(onClick = {
                        sifirlamaOnayi = false
                        onSifirla()
                    })
                },
                dismissButton = {
                    AlertDialogDefaults.DismissButton(onClick = { sifirlamaOnayi = false })
                },
            )
        }
    }
}

@Composable
private fun SayimIcerigi(durum: Tesbihat.Durum, onGeriAl: () -> Unit) {
    val azalt = hareketAzaltilmis()
    // Sayım "vuruşu": rakam bir kez hafifçe büyüyüp yaylanarak yerine oturur (olay tetikli;
    // hızlı çevirmede — önceki sayımdan < 120 ms — atlanır, boşta hareket yok).
    val vurus = remember { Animatable(1f) }
    // Açılış anıyla başlar: ilk kompozisyon "hızlı" sayılır, ekran açılırken rakam vurmaz.
    val sonVurus = remember { longArrayOf(SystemClock.uptimeMillis()) }
    LaunchedEffect(durum.toplam) {
        val an = SystemClock.uptimeMillis()
        val hizli = azalt || an - sonVurus[0] < ILERLEME_MS
        sonVurus[0] = an
        if (hizli) {
            vurus.snapTo(1f)
        } else {
            vurus.snapTo(VURUS_OLCEGI)
            vurus.animateTo(1f, spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium))
        }
    }
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.fillMaxWidth(guvenliGenislikOrani()),
    ) {
        if (durum.faz == Tesbihat.Faz.TEHLIL) {
            // Yüzü tamamlayan tek söz: rakam yerine metnin kendisi okunur. Boyu yazı ölçeğinden
            // bağımsız (uzun metin; büyük ölçekte yuvarlak ekranın kenarına taşıyordu).
            Text(
                Tesbihat.TEHLIL_METNI,
                fontSize = sabitBoyut(0.052f),
                lineHeight = sabitBoyut(0.064f),
                textAlign = TextAlign.Center,
                color = renk(SaatPaleti.METIN),
                maxLines = 5,
                overflow = TextOverflow.Ellipsis,
            )
        } else {
            Text(
                durum.faz.ad,
                fontSize = sinirliBoyut(0.075f),
                fontWeight = FontWeight.Medium,
                color = renk(SaatPaleti.METIN),
                textAlign = TextAlign.Center,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                durum.fazSayisi.toString(),
                style = RAKAM,
                fontSize = sabitBoyut(0.24f),
                fontWeight = FontWeight.SemiBold,
                color = renk(SaatPaleti.METIN),
                maxLines = 1,
                modifier = Modifier.graphicsLayer {
                    scaleX = vurus.value
                    scaleY = vurus.value
                },
            )
        }
        // Fazın hedefi; toplam 100 halkadan okunur (üç yay).
        Text(
            if (durum.faz == Tesbihat.Faz.TEHLIL) "${durum.toplam} / ${Tesbihat.TOPLAM}" else "/ ${durum.faz.hedef}",
            fontSize = sinirliBoyut(0.052f),
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            maxLines = 1,
        )
        Spacer(Modifier.height(4.dp))
        CompactButton(
            onClick = onGeriAl,
            enabled = durum.toplam > 0,
            colors = ButtonDefaults.filledTonalButtonColors(),
            modifier = Modifier.semantics { contentDescription = "Son sayımı geri alın" },
            label = { Text("Geri al", maxLines = 1, overflow = TextOverflow.Ellipsis) },
        )
    }
}

/**
 * Bitiş ekranı: ortada onay işareti çizilir (300 ms) ve dışına bir halka bir kez yayılıp
 * söner (520 ms) — "Kıldım" onayıyla aynı dil. Metin kısa ve tek satırlık: eski düzende
 * başlık + tehlil adı + kaynak + geniş düğme 384 dp kare ekranda / büyük yazı ölçeğinde
 * taşıyordu. Kaynak ekran okuyucu açıklamasında da okunur.
 */
@Composable
private fun TamamIcerigi(onYenidenBasla: () -> Unit) {
    val azalt = hareketAzaltilmis()
    val tik = remember { Animatable(if (azalt) 1f else 0f) }
    val halka = remember { Animatable(if (azalt) 1f else 0f) }
    LaunchedEffect(Unit) {
        if (azalt) return@LaunchedEffect
        launch { halka.animateTo(1f, tween(BITIS_HALKA_MS, easing = CubicBezierEasing(0.2f, 0f, 0f, 1f))) }
        tik.animateTo(1f, tween(BITIS_TIK_MS, easing = LinearEasing))
    }
    val yesil = renk(SaatPaleti.EYLEM)
    val ust = renk(SaatPaleti.EYLEM_USTU)
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.fillMaxWidth(guvenliGenislikOrani()),
    ) {
        Canvas(Modifier.size(44.dp).clearAndSetSemantics { }) {
            val h = halka.value
            // 0 ve 1'de çizilmez: halka yalnız sahne sürerken vardır (boşta sıfır çizim).
            if (h > 0f && h < 1f) {
                drawCircle(
                    yesil.copy(alpha = 1f - h),
                    radius = size.minDimension / 2f + 16.dp.toPx() * h,
                    style = Stroke(width = 3.dp.toPx() * (1f - h * 0.5f)),
                )
            }
            drawCircle(yesil)
            val yol = Path().apply {
                moveTo(size.width * 0.27f, size.height * 0.53f)
                lineTo(size.width * 0.44f, size.height * 0.69f)
                lineTo(size.width * 0.74f, size.height * 0.34f)
            }
            val olcu = PathMeasure().apply { setPath(yol, false) }
            val parca = Path()
            olcu.getSegment(0f, olcu.length * tik.value, parca, true)
            drawPath(parca, ust, style = Stroke(width = 3.5.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round))
        }
        Spacer(Modifier.height(4.dp))
        Text(
            "Tamamlandı",
            fontSize = sinirliBoyut(0.085f),
            fontWeight = FontWeight.SemiBold,
            color = renk(SaatPaleti.METIN),
            textAlign = TextAlign.Center,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
        Text(
            Tesbihat.KAYNAK,
            fontSize = sinirliBoyut(0.048f),
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
        Spacer(Modifier.height(6.dp))
        CompactButton(
            onClick = onYenidenBasla,
            colors = ButtonDefaults.buttonColors(containerColor = yesil, contentColor = ust),
            modifier = Modifier.semantics { contentDescription = "Tesbihata yeniden başlayın" },
            label = { Text("Yeniden başla", fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis) },
        )
    }
}

private const val VURUS_OLCEGI = 1.12f
private const val BITIS_TIK_MS = 300
private const val BITIS_HALKA_MS = 520

/** Üç yayın her biri 300°'lik çerçevede (ana ekran yayıyla aynı; tepe sistem saatine). */
private const val YAY_ARASI = 8f
private const val YAY_UZUNLUGU = (YAY_TARAMA - YAY_ARASI * (TesbihatYaylari.YAY_SAYISI - 1)) / TesbihatYaylari.YAY_SAYISI
private const val ILERLEME_MS = 120
private const val PARLAMA_MS = 300

/**
 * Üç yay: her çentikte biten kısım 120 ms'de ilerler; hızlı çevirmede (bir öncekinden
 * < 120 ms) animasyon atlanır, sayı anında yazılır. 33/66/99'da biten yay, 100'de üçü
 * 300 ms bir kez parlar (titreşimi `TesbihatHissi` verir). Dekoratiftir — sayı ve faz
 * ekranın tek düğümlü açıklamasında okunur.
 */
@Composable
private fun TesbihatHalkasi(durum: Tesbihat.Durum) {
    val azalt = hareketAzaltilmis()
    val hedefler = TesbihatYaylari.doluluk(durum)
    val doluluk = remember { List(TesbihatYaylari.YAY_SAYISI) { Animatable(hedefler[it]) } }
    val parlama = remember { Animatable(0f) }
    var parlayan by remember { mutableStateOf<Int?>(null) }
    val parlamaSahibi = remember { arrayOfNulls<Any>(1) }
    val son = remember { longArrayOf(0L, durum.toplam.toLong()) }
    LaunchedEffect(durum.toplam) {
        val an = SystemClock.uptimeMillis()
        val hizli = azalt || an - son[0] < ILERLEME_MS
        val biten = TesbihatYaylari.parlayan(son[1].toInt(), durum.toplam)
        son[0] = an
        son[1] = durum.toplam.toLong()
        hedefler.forEachIndexed { i, h ->
            launch { if (hizli) doluluk[i].snapTo(h) else doluluk[i].animateTo(h, tween(ILERLEME_MS)) }
        }
        if (biten != null && !azalt) {
            // Hızlı çevirmede bir sonraki sayım bu effect'i iptal eder: `finally` olmadan
            // `parlayan` kalır ve yay kalın donardı. Kalınlık `parlayan == null` iken
            // kullanılmaz; değer de sonraki parlamanın başında sıfırlanır. Sahiplik
            // belirteci: iptal edilen eski parlamanın `finally`'si, yerine başlamış YENİ
            // parlamayı silmesin.
            val bu = Any()
            parlamaSahibi[0] = bu
            try {
                parlayan = biten
                parlama.snapTo(0f)
                parlama.animateTo(1f, tween(PARLAMA_MS))
            } finally {
                if (parlamaSahibi[0] === bu) parlayan = null
            }
        }
    }
    val iz = renk(SaatPaleti.IZ)
    val dolu = renk(SaatPaleti.EYLEM)
    Canvas(Modifier.fillMaxSize().clearAndSetSemantics { }) {
        val k = 6.dp.toPx()
        val pay = 5.dp.toPx() + k * 2.2f
        val cap = min(size.width, size.height) - pay * 2
        if (cap <= 0f) return@Canvas
        val solUst = Offset((size.width - cap) / 2, (size.height - cap) / 2)
        val boyut = Size(cap, cap)
        for (i in 0 until TesbihatYaylari.YAY_SAYISI) {
            val bas = YAY_BASLANGIC + i * (YAY_UZUNLUGU + YAY_ARASI)
            val p = parlayan
            val parliyor = p != null && (p == i || p == TesbihatYaylari.HEPSI)
            val kalinlik = if (parliyor) k * (1f + 0.6f * sin(PI.toFloat() * parlama.value)) else k
            drawArc(iz, bas, YAY_UZUNLUGU, false, solUst, boyut, style = Stroke(k, cap = StrokeCap.Round))
            val oran = doluluk[i].value
            if (oran > 0f) {
                drawArc(dolu, bas, YAY_UZUNLUGU * oran, false, solUst, boyut, style = Stroke(kalinlik, cap = StrokeCap.Round))
            }
        }
    }
}
