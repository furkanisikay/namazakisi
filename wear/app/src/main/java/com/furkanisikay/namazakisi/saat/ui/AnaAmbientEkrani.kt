package com.furkanisikay.namazakisi.saat.ui

import android.os.Build
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import androidx.wear.compose.material3.TimeText
import com.furkanisikay.namazakisi.saat.cekirdek.AmbientKaydirma
import com.furkanisikay.namazakisi.saat.cekirdek.AnaEkranKarari
import com.furkanisikay.namazakisi.saat.cekirdek.SaatPaleti

/**
 * Ana ekranın always-on (ambient) görünümü. Düşük güç kuralları (tesbihatla aynı):
 * siyah zemin, renk YOK (acil/kerahat dahil), dolgu YOK — yalnız ince yay izi, dış
 * hatlı rakam ve gri yazı; saniye yok. Zamanı `onUpdateAmbient` (≈ dakikada bir)
 * ilerletir. Burn-in kaydırması `AmbientKaydirma`'dan; API 36+'da sistem kaydırır.
 * Düşük bitli ekranda gri de kullanılmaz (iki tonlu panel griyi titreterek çizer).
 *
 * Etkileşimli ağaç ambient'te kompozisyondan ÇIKAR (AnaAktivite); dokunuş gelmez.
 */
@Composable
fun AnaAmbientEkrani(g: AnaEkranKarari.Gorunum?, bilgi: String, ambient: AmbientDurumu) {
    val kaydirma = AmbientKaydirma.kaydirma(ambient.adim, ambient.burnInKorumasi, Build.VERSION.SDK_INT)
    val ana = renk(SaatPaleti.AMBIENT_METIN)
    val ikincil = if (ambient.dusukBit) Color.White else renk(SaatPaleti.AMBIENT_IKINCIL)
    val iz = if (ambient.dusukBit) Color.White else renk(SaatPaleti.AMBIENT_IZ)

    SaatTemasi {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black)
                .semantics { contentDescription = g?.aciklama ?: bilgi },
        ) {
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier.fillMaxSize().offset(kaydirma.xDp.dp, kaydirma.yDp.dp),
            ) {
                TimeText()
                if (g == null) {
                    Text(
                        bilgi,
                        color = ikincil,
                        textAlign = TextAlign.Center,
                        style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier.padding(horizontal = 28.dp),
                    )
                    return@Box
                }
                // Yalnız ince iz: parlak kısım, şimdi noktası ve kerahat bandı çizilmez.
                Canvas(Modifier.fillMaxSize()) {
                    vakitYayiCiz(kalanOran = 0f, renk = iz, iz = iz, kalinlik = 1.dp, noktaGoster = false)
                }
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                    modifier = Modifier.padding(horizontal = 28.dp),
                ) {
                    Text(
                        g.sayilan.ad,
                        color = ikincil,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Light,
                        maxLines = 1,
                    )
                    // Ambient: saniye yok, rakamlar yalnız kontur (piksel ışığı az).
                    SureGosterimi(
                        sayac = g.sayac,
                        saniyeGoster = false,
                        rakamRengi = ana,
                        birimRengi = ikincil,
                        saniyeRengi = ikincil,
                        rakamStili = RAKAM.copy(drawStyle = Stroke(width = 2f)),
                        rakamAgirligi = FontWeight.Medium,
                    )
                    Text(
                        g.altYazi,
                        color = ikincil,
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Light,
                        maxLines = 1,
                    )
                }
            }
        }
    }
}
