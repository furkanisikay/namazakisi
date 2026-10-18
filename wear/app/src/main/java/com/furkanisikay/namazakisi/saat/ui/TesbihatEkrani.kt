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
import androidx.wear.compose.material3.CircularProgressIndicator
import androidx.wear.compose.material3.CircularProgressIndicatorDefaults
import androidx.wear.compose.material3.CompactButton
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import androidx.wear.compose.material3.TimeText
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
                CircularProgressIndicator(
                    progress = { durum.fazIlerlemesi },
                    modifier = Modifier.fillMaxSize().padding(CircularProgressIndicatorDefaults.FullScreenPadding),
                )
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
                style = MaterialTheme.typography.numeralLarge,
                color = MaterialTheme.colorScheme.primary,
            )
        }
        Text(
            "${durum.toplam} / ${Tesbihat.TOPLAM}",
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
            "33 · 33 · 33 + 1",
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.primary,
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
