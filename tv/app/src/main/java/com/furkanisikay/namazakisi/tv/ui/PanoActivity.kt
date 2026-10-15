package com.furkanisikay.namazakisi.tv.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.furkanisikay.namazakisi.tv.cekirdek.IlListesi
import com.furkanisikay.namazakisi.tv.veri.KonumDeposu

/**
 * TV giriş noktası (LEANBACK_LAUNCHER). İl seçilmemişse il seçimi, seçilmişse pano.
 */
class PanoActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val depo = KonumDeposu(this)
        setContent { PanoTemasi { Uygulama(depo) } }
    }
}

@Composable
private fun Uygulama(depo: KonumDeposu) {
    var plaka by remember { mutableStateOf(depo.seciliPlaka()) }
    var seciliyor by remember { mutableStateOf(false) }
    val il = IlListesi.bul(depo.iller, plaka)

    if (il == null || seciliyor) {
        IlSecimEkrani(
            iller = depo.iller,
            seciliPlaka = il?.plaka,
            onSec = {
                depo.kaydet(it.plaka)
                plaka = it.plaka
                seciliyor = false
            },
            onGeri = if (il != null) ({ seciliyor = false }) else null,
        )
    } else {
        PanoEkrani(il = il, ekraniAcikTut = true, onKonumDegistir = { seciliyor = true })
    }
}
