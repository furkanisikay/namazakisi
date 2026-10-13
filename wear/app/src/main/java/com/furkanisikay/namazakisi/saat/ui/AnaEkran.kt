package com.furkanisikay.namazakisi.saat.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material3.AlertDialog
import androidx.wear.compose.material3.AlertDialogDefaults
import androidx.wear.compose.material3.AppScaffold
import androidx.wear.compose.material3.Button
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.ListHeader
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.ScreenScaffold
import androidx.wear.compose.material3.Text
import androidx.wear.compose.material3.TimeText
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi
import com.furkanisikay.namazakisi.saat.cekirdek.Yuk

/**
 * Ekran metinleri arayüz dilidir: kibar "siz" (AGENTS.md). Dokunma hedefleri
 * ≥48dp (Wear kalite yönergesi; Material3 Button zaten bu yükseklikte).
 */
@Composable
fun AnaEkran(
    yuk: Yuk?,
    bekleyen: Set<String>,
    guncellemeGerekli: Boolean,
    bildirimIzni: Boolean,
    simdi: Long,
    bugun: String,
    onKildim: (tarih: String, vakit: String) -> Unit,
    onTesbihat: () -> Unit,
) {
    val liste = rememberScalingLazyListState()
    var onayBekleyen by remember { mutableStateOf<VakitHesabi.Satir?>(null) }

    MaterialTheme {
        AppScaffold(timeText = { TimeText() }) {
            ScreenScaffold(scrollState = liste) { icBosluk ->
                ScalingLazyColumn(
                    state = liste,
                    contentPadding = icBosluk,
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    if (yuk == null) {
                        item {
                            BilgiMetni(
                                if (guncellemeGerekli) GUNCELLEME_METNI
                                else "Vakitleri görmek için telefonunuzda Namaz Akışı'nı açın."
                            )
                        }
                        // Tesbihat telefon verisine bağlı değildir: yük yokken de açılır.
                        item { TesbihatDugmesi(onTesbihat) }
                        return@ScalingLazyColumn
                    }

                    val siradaki = VakitHesabi.siradaki(yuk, simdi)
                    item {
                        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                            if (siradaki != null) {
                                Text("Sıradaki", style = MaterialTheme.typography.labelSmall)
                                Text(siradaki.ad, style = MaterialTheme.typography.titleLarge)
                                Text(
                                    "${VakitHesabi.saat(siradaki.ms)} · ${VakitHesabi.kalanMetni(siradaki.ms - simdi)}",
                                    style = MaterialTheme.typography.bodySmall,
                                )
                            }
                            Text(yuk.konumAdi, style = MaterialTheme.typography.labelSmall, textAlign = TextAlign.Center)
                        }
                    }
                    if (guncellemeGerekli) {
                        item { BilgiMetni(GUNCELLEME_METNI) }
                    }
                    if (!bildirimIzni) {
                        item {
                            BilgiMetni("Telefonunuz yanınızda değilken de hatırlatma almak için saatin ayarlarından Namaz Akışı bildirimlerine izin verin.")
                        }
                    }
                    item { ListHeader { Text("Bugün") } }
                    items(VakitHesabi.satirlar(yuk, simdi, bugun, bekleyen)) { satir ->
                        VakitSatiri(satir, onSec = { onayBekleyen = satir })
                    }
                    item { TesbihatDugmesi(onTesbihat) }
                }
            }

            val secili = onayBekleyen
            AlertDialog(
                visible = secili != null,
                onDismissRequest = { onayBekleyen = null },
                title = { Text(if (secili != null) "${secili.ad} kılındı mı?" else "") },
                text = {
                    if (yuk != null && VakitHesabi.kerahatMi(yuk, simdi)) {
                        Text("Kerahat vaktindesiniz.", textAlign = TextAlign.Center)
                    }
                },
                confirmButton = {
                    AlertDialogDefaults.ConfirmButton(onClick = {
                        secili?.let { onKildim(it.tarih, it.vakit) }
                        onayBekleyen = null
                    })
                },
                dismissButton = {
                    AlertDialogDefaults.DismissButton(onClick = { onayBekleyen = null })
                },
            )
        }
    }
}

/**
 * Telefon saatin tanımadığı DAHA YENİ bir şema gönderdi → güncellenmesi gereken SAAT
 * uygulamasıdır (eski metin telefonu işaret ediyordu).
 */
private const val GUNCELLEME_METNI = "Saatinizdeki Namaz Akışı'nı güncelleyin."

@Composable
private fun VakitSatiri(satir: VakitHesabi.Satir, onSec: () -> Unit) {
    val durum = when {
        satir.esitleniyor -> "Kıldınız · eşitleniyor"
        satir.kilindi -> "Kıldınız"
        satir.vakit == "gunes" -> "Güneş doğuşu"
        !satir.girdi -> "Henüz girmedi"
        else -> "Dokunarak işaretleyin"
    }
    Button(
        onClick = onSec,
        enabled = satir.isaretlenebilir,
        modifier = Modifier
            .fillMaxWidth()
            .semantics { contentDescription = "${satir.ad}, ${VakitHesabi.saat(satir.ms)}, $durum" },
        colors = if (satir.kilindi) ButtonDefaults.filledTonalButtonColors() else ButtonDefaults.buttonColors(),
        label = { Text(if (satir.kilindi) "✓ ${satir.ad}" else satir.ad) },
        secondaryLabel = { Text("${VakitHesabi.saat(satir.ms)} · $durum") },
    )
}

/** Namaz sonrası tesbihat sayacına giriş (issue #293). */
@Composable
private fun TesbihatDugmesi(onTesbihat: () -> Unit) {
    Button(
        onClick = onTesbihat,
        modifier = Modifier
            .fillMaxWidth()
            .semantics { contentDescription = "Tesbihat sayacını açın" },
        colors = ButtonDefaults.filledTonalButtonColors(),
        label = { Text("Tesbihat") },
        secondaryLabel = { Text("33 · 33 · 33 + 1") },
    )
}

@Composable
private fun BilgiMetni(metin: String) {
    Text(
        metin,
        textAlign = TextAlign.Center,
        style = MaterialTheme.typography.bodyMedium,
        modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp),
    )
}
