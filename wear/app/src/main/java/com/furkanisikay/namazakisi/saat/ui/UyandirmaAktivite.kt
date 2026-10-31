package com.furkanisikay.namazakisi.saat.ui

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material3.AppScaffold
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.CompactButton
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.ScreenScaffold
import androidx.wear.compose.material3.Text
import androidx.wear.compose.foundation.rememberActiveFocusRequester
import androidx.wear.compose.foundation.rotary.RotaryScrollableDefaults
import androidx.wear.compose.foundation.rotary.rotaryScrollable
import androidx.compose.ui.res.stringResource
import com.furkanisikay.namazakisi.saat.R
import com.furkanisikay.namazakisi.saat.cekirdek.SaatPaleti
import com.furkanisikay.namazakisi.saat.hatirlatma.UyandirmaAlicisi
import com.furkanisikay.namazakisi.saat.veri.YukDeposu

/**
 * Sessiz uyandırma ekranı (saat W3, fikir 2) — bildirime dokununca açılır, kilit
 * ekranının üstünde ve ekranı uyandırarak. İki büyük düğme: Kıldım / Kapat (ERTELE YOK,
 * sahip kararı 2026-10-19). Düğme işi `UyandirmaAlicisi`'ne
 * devreder (tek gövde) ve ekran kapanır. Uyandırma metni ibadete çağrıdır ("sen" + emir
 * kipi telefonda üretilir); düğmeler arayüz dilidir.
 */
class UyandirmaAktivite : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setShowWhenLocked(true)
        setTurnScreenOn(true)
        val id = intent.getStringExtra(UyandirmaAlicisi.ID)
        val kayit = YukDeposu(this).yuk()?.uyandirma?.firstOrNull { it.id == id }
        if (id == null || kayit == null) {
            finish()
            return
        }
        fun gonder(islem: String) {
            sendBroadcast(Intent(this, UyandirmaAlicisi::class.java).setAction(islem).putExtra(UyandirmaAlicisi.ID, id))
            finish()
        }
        setContent {
            SaatTemasi {
                // Sistem saati (AppScaffold'un TimeText'i) tepede: içerik ekrana sığmazsa (kare
                // saat, 384 px) ortalanmış başlık saatin ALTINA biniyordu. Kural: içerik
                // ScreenScaffold'un dikey payı içinde ortalanır (sığan ekranda görünüm aynı);
                // sığmazsa saatin altından başlar ve kaydırılır (taç ya da parmak), saat de
                // kaydırınca çekilir.
                val kaydirma = rememberScrollState()
                AppScaffold {
                    ScreenScaffold(scrollState = kaydirma) { icBosluk ->
                        BoxWithConstraints(Modifier.fillMaxSize()) {
                            UyandirmaIcerigi(
                                kayit.baslik,
                                kayit.govde,
                                onKildim = { gonder(UyandirmaAlicisi.KILDIM) },
                                onKapat = { gonder(UyandirmaAlicisi.KAPAT) },
                                // Yalnız DİKEY pay (üst = alt → sığan ekranda merkez aynı); yan pay eskisi gibi 20 dp.
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .rotaryScrollable(RotaryScrollableDefaults.behavior(kaydirma), rememberActiveFocusRequester())
                                    .verticalScroll(kaydirma)
                                    .heightIn(min = maxHeight)
                                    .padding(top = icBosluk.calculateTopPadding(), bottom = icBosluk.calculateBottomPadding())
                                    .padding(horizontal = 20.dp),
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun UyandirmaIcerigi(
    baslik: String,
    govde: String,
    onKildim: () -> Unit,
    onKapat: () -> Unit,
    modifier: Modifier,
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(6.dp, Alignment.CenterVertically),
        modifier = modifier,
    ) {
        Text(yerelRakam(baslik), style = MaterialTheme.typography.titleMedium, textAlign = TextAlign.Center, maxLines = 2)
        Text(
            yerelRakam(govde),
            style = MaterialTheme.typography.bodySmall,
            color = renk(SaatPaleti.METIN2),
            textAlign = TextAlign.Center,
            maxLines = 3,
        )
        val kildimAciklama = stringResource(R.string.uyandirma_kildim_aciklama)
        val kapatAciklama = stringResource(R.string.uyandirma_kapat_aciklama)
        CompactButton(
            onClick = onKildim,
            colors = ButtonDefaults.buttonColors(),
            modifier = Modifier.semantics { contentDescription = kildimAciklama },
            label = { Text(stringResource(R.string.kildim)) },
        )
        CompactButton(
            onClick = onKapat,
            colors = ButtonDefaults.filledTonalButtonColors(),
            modifier = Modifier.semantics { contentDescription = kapatAciklama },
            label = { Text(stringResource(R.string.kapat)) },
        )
    }
}
