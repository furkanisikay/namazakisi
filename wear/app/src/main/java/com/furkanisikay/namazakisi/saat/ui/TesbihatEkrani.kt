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
import androidx.compose.foundation.layout.padding
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
import androidx.wear.compose.material3.Button
import androidx.wear.compose.material3.CompactButton
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import androidx.wear.compose.material3.TimeText
import android.os.SystemClock
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
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
 * taç/çerçeve dönüşü de sayar. Kenarda o fazın ilerleme halkası, ortada faz adı ve
 * büyük rakam. Uzun basış = "baştan başla" (onaylı). Arayüz dili kibar "siz".
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
        "Tesbihat tamamlandı, ${Tesbihat.TOPLAM} / ${Tesbihat.TOPLAM}"
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
                        if (!durum.tamamMi && tac.olay(olay.verticalScrollPixels, olay.uptimeMillis)) onSay()
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
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp),
    ) {
        if (durum.faz == Tesbihat.Faz.TEHLIL) {
            // Yüzü tamamlayan tek söz: rakam yerine metnin kendisi okunur.
            Text(
                Tesbihat.TEHLIL_METNI,
                style = MaterialTheme.typography.bodySmall,
                textAlign = TextAlign.Center,
                maxLines = 6,
            )
        } else {
            Text(durum.faz.ad, style = MaterialTheme.typography.titleMedium, textAlign = TextAlign.Center)
            Text(
                durum.fazSayisi.toString(),
                style = RAKAM,
                fontSize = sabitBoyut(0.24f),
                fontWeight = FontWeight.SemiBold,
                color = renk(SaatPaleti.METIN),
            )
        }
        // Fazın hedefi; toplam 100 halkadan okunur (üç yay).
        Text(
            if (durum.faz == Tesbihat.Faz.TEHLIL) "${durum.toplam} / ${Tesbihat.TOPLAM}" else "/ ${durum.faz.hedef}",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(6.dp))
        CompactButton(
            onClick = onGeriAl,
            enabled = durum.toplam > 0,
            modifier = Modifier.semantics { contentDescription = "Son sayımı geri alın" },
            label = { Text("Geri al") },
        )
    }
}

@Composable
private fun TamamIcerigi(onYenidenBasla: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp),
    ) {
        Text("Tamamlandı", style = MaterialTheme.typography.titleLarge, textAlign = TextAlign.Center)
        Text(
            Tesbihat.Faz.TEHLIL.ad,
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.primary,
            textAlign = TextAlign.Center,
        )
        Text(
            Tesbihat.KAYNAK,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(8.dp))
        Button(onClick = onYenidenBasla, label = { Text("Yeniden başlayın") })
    }
}

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
