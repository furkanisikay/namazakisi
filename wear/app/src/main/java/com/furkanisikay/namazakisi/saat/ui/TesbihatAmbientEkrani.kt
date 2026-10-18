package com.furkanisikay.namazakisi.saat.ui

import android.os.Build
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
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
import com.furkanisikay.namazakisi.saat.cekirdek.SaatPaleti
import com.furkanisikay.namazakisi.saat.cekirdek.Tesbihat
import com.furkanisikay.namazakisi.saat.cekirdek.TesbihatAmbient

/**
 * Tesbihat sayacının always-on (ambient) görünümü (issue #293). Düşük güç kuralları:
 * siyah zemin (ekranın çok büyük kısmı kapalı piksel), ince yazı, ilerleme halkası
 * ve dolu yüzey YOK, renk yalnız beyaz/gri. Düşük bitli ekranda gri de kullanılmaz
 * (iki tonlu panel griyi titreterek çizer). Burn-in kaydırması saf çekirdekten gelir
 * (`TesbihatAmbient.kaydirma`); Wear OS 6+ sistemi kendisi kaydırır.
 *
 * Saat de gösterilir: always-on uygulaması kadranın yerini aldığı için saati o çizer.
 */
@Composable
fun TesbihatAmbientEkrani(durum: Tesbihat.Durum, ambient: AmbientDurumu) {
    val icerik = TesbihatAmbient.icerik(durum)
    val kaydirma = TesbihatAmbient.kaydirma(ambient.adim, ambient.burnInKorumasi, Build.VERSION.SDK_INT)
    val ikincil = if (ambient.dusukBit) Color.White else renk(SaatPaleti.AMBIENT_IKINCIL)
    val iz = if (ambient.dusukBit) Color.White else renk(SaatPaleti.AMBIENT_IZ)

    SaatTemasi {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black)
                .semantics { contentDescription = icerik.aciklama },
        ) {
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier.fillMaxSize().offset(kaydirma.xDp.dp, kaydirma.yDp.dp),
            ) {
                TimeText()
                // Dolgu yok: yalnız üç yayın ince izi (nerede kalındığı rakamda).
                Canvas(Modifier.fillMaxSize()) {
                    vakitYayiCiz(kalanOran = 0f, renk = iz, iz = iz, kalinlik = 1.dp, noktaGoster = false)
                }
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 28.dp),
                ) {
                    Text(
                        icerik.baslik,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Light,
                        color = Color.White,
                        textAlign = TextAlign.Center,
                        maxLines = 2,
                    )
                    icerik.sayi?.let {
                        // Dış hatlı rakam: yanan piksel az (düşük güç).
                        Text(
                            it,
                            style = RAKAM.copy(drawStyle = Stroke(width = 2f)),
                            fontSize = sabitBoyut(0.24f),
                            fontWeight = FontWeight.Medium,
                            color = renk(SaatPaleti.AMBIENT_METIN),
                        )
                    }
                    Text(
                        icerik.alt,
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Light,
                        color = ikincil,
                    )
                }
            }
        }
    }
}
