package com.furkanisikay.namazakisi.saat.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.wear.compose.material3.Icon
import com.furkanisikay.namazakisi.saat.R
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.CompactButton
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import com.furkanisikay.namazakisi.saat.cekirdek.SaatPaleti

/**
 * Camideyim satırı (saat W3, fikir 5): başlık + yer adı + bir/iki düğme. Arayüz dili
 * kibar "siz". Düğmeler istek sürerken kilitli (çift komut gitmesin).
 *
 * @param dugmeler (etiket, erişilebilirlik açıklaması, eylem)
 */
@Composable
fun CamiSatiri(
    baslik: String,
    alt: String,
    dugmeler: List<Triple<String, String, () -> Unit>>,
    kilitli: Boolean,
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 4.dp),
    ) {
        Text(
            yerelRakam(baslik),
            style = MaterialTheme.typography.titleSmall,
            color = renk(SaatPaleti.EYLEM),
            textAlign = TextAlign.Center,
            modifier = Modifier.semantics { heading() },
        )
        if (alt.isNotEmpty()) {
            Text(yerelRakam(alt), style = MaterialTheme.typography.labelSmall, color = renk(SaatPaleti.METIN2), textAlign = TextAlign.Center, maxLines = 2)
        }
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.padding(top = 4.dp)) {
            for ((etiket, aciklama, eylem) in dugmeler) {
                CompactButton(
                    onClick = eylem,
                    enabled = !kilitli,
                    colors = ButtonDefaults.filledTonalButtonColors(),
                    modifier = Modifier.semantics { contentDescription = aciklama },
                    label = { Text(etiket) },
                )
            }
        }
    }
}

/**
 * Namaz modu düğmesi (saat W3, fikir 1). Açıkken bitiş saati yazılır (hal eki YOK:
 * "bitiş 13:40"). Telefondaki modu açar/kapatır; bilekteki Rahatsız Etmeyin'e
 * dokunmaz (Samsung eşitlemesi kullanıcının ayarıdır).
 */
@Composable
fun NamazModuSatiri(acikBitis: String?, kilitli: Boolean, onDokun: () -> Unit) {
    val aciklama = if (acikBitis != null) {
        stringResource(R.string.namaz_modu_acik_aciklama, acikBitis)
    } else {
        stringResource(R.string.namaz_modu_ac_aciklama)
    }
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
        CompactButton(
            onClick = onDokun,
            enabled = !kilitli,
            colors = if (acikBitis != null) ButtonDefaults.buttonColors() else ButtonDefaults.filledTonalButtonColors(),
            modifier = Modifier.semantics { contentDescription = aciklama },
            // Cami simgesi: düğme metni okunmadan da "namaz modu" diye tanınır (dekoratif).
            icon = {
                Icon(
                    painterResource(R.drawable.ic_cami),
                    contentDescription = null,
                    modifier = Modifier.size(18.dp),
                )
            },
            label = {
                Text(stringResource(if (acikBitis != null) R.string.namaz_modu_kapatin else R.string.namaz_modu_acin))
            },
        )
        if (acikBitis != null) {
            Text(yerelRakam(stringResource(R.string.namaz_modu_acik_bitis, acikBitis)), style = MaterialTheme.typography.labelSmall, color = renk(SaatPaleti.METIN2))
        }
    }
}
