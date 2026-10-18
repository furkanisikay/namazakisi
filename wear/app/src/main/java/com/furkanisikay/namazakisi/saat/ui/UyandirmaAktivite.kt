package com.furkanisikay.namazakisi.saat.ui

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
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
import androidx.wear.compose.material3.Text
import com.furkanisikay.namazakisi.saat.cekirdek.SaatPaleti
import com.furkanisikay.namazakisi.saat.cekirdek.UyandirmaZinciri
import com.furkanisikay.namazakisi.saat.hatirlatma.UyandirmaAlicisi
import com.furkanisikay.namazakisi.saat.hatirlatma.UyandirmaDeposu
import com.furkanisikay.namazakisi.saat.veri.YukDeposu

/**
 * Sessiz uyandırma ekranı (saat W3, fikir 2) — bildirime dokununca açılır, kilit
 * ekranının üstünde ve ekranı uyandırarak. Üç büyük düğme: Kıldım / 10 dk ertele / Kapat
 * (ertele yalnız pencerenin sonuna yeterli zaman varsa). Düğme işi `UyandirmaAlicisi`'ne
 * devreder (tek gövde) ve ekran kapanır. Uyandırma metni ibadete çağrıdır ("sen" + emir
 * kipi telefonda üretilir); düğmeler arayüz dilidir.
 */
class UyandirmaAktivite : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setShowWhenLocked(true)
        setTurnScreenOn(true)
        val id = intent.getStringExtra(UyandirmaAlicisi.ID)
        val yuk = YukDeposu(this).yuk()
        // Ertelenen kayıt yeni yükte olmayabilir → saklanan kopyadan (inceleme bulgusu 1).
        val kayit = yuk?.uyandirma?.firstOrNull { it.id == id }
            ?: id?.let { UyandirmaDeposu(this).durum(yuk).ertelenenKayitlar[it] }
        if (id == null || kayit == null) {
            finish()
            return
        }
        val erteleVar = UyandirmaZinciri.erteleHedefi(kayit, System.currentTimeMillis()) != null
        fun gonder(islem: String) {
            sendBroadcast(Intent(this, UyandirmaAlicisi::class.java).setAction(islem).putExtra(UyandirmaAlicisi.ID, id))
            finish()
        }
        setContent {
            SaatTemasi {
                AppScaffold {
                    Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp),
                        ) {
                            Text(kayit.baslik, style = MaterialTheme.typography.titleMedium, textAlign = TextAlign.Center, maxLines = 2)
                            Text(
                                kayit.govde,
                                style = MaterialTheme.typography.bodySmall,
                                color = renk(SaatPaleti.METIN2),
                                textAlign = TextAlign.Center,
                                maxLines = 3,
                            )
                            CompactButton(
                                onClick = { gonder(UyandirmaAlicisi.KILDIM) },
                                colors = ButtonDefaults.buttonColors(),
                                modifier = Modifier.semantics { contentDescription = "Kıldım. Uyandırmayı kapatır" },
                                label = { Text("Kıldım") },
                            )
                            if (erteleVar) {
                                CompactButton(
                                    onClick = { gonder(UyandirmaAlicisi.ERTELE) },
                                    colors = ButtonDefaults.filledTonalButtonColors(),
                                    modifier = Modifier.semantics { contentDescription = "10 dakika ertele" },
                                    label = { Text("10 dk ertele") },
                                )
                            }
                            CompactButton(
                                onClick = { gonder(UyandirmaAlicisi.KAPAT) },
                                colors = ButtonDefaults.filledTonalButtonColors(),
                                modifier = Modifier.semantics { contentDescription = "Uyandırmayı kapat" },
                                label = { Text("Kapat") },
                            )
                        }
                    }
                }
            }
        }
    }
}
