package com.furkanisikay.namazakisi.tv.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.furkanisikay.namazakisi.tv.cekirdek.Il
import com.furkanisikay.namazakisi.tv.veri.KonumDeposu

/**
 * TV giriş noktası (LEANBACK_LAUNCHER).
 *
 * Konum yoksa önerilen yol "Vakitleri telefonunuzdan alın" (QR); oradan kodla giriş ve
 * elle il seçimi açılır. Panodaki "Konumu değiştirin" de aynı ekrana döner.
 */
class PanoActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val depo = KonumDeposu(this)
        setContent { PanoTemasi { Uygulama(depo) } }
    }
}

private enum class Ekran { Pano, Esleme, Kod, Il }

@Composable
private fun Uygulama(depo: KonumDeposu) {
    var konum by remember { mutableStateOf<Il?>(depo.seciliIl()) }
    var ekran by remember { mutableStateOf(if (konum == null) Ekran.Esleme else Ekran.Pano) }
    val il = konum
    val tamam: (Il) -> Unit = {
        konum = it
        ekran = Ekran.Pano
    }

    when {
        il != null && ekran == Ekran.Pano ->
            PanoEkrani(il = il, ekraniAcikTut = true, onKonumDegistir = { ekran = Ekran.Esleme })
        ekran == Ekran.Kod -> KodGirisEkrani(depo = depo, onTamam = tamam, onGeri = { ekran = Ekran.Esleme })
        ekran == Ekran.Il -> IlSecimEkrani(
            iller = depo.iller,
            seciliPlaka = depo.seciliPlaka(),
            onSec = {
                depo.kaydet(it.plaka)
                tamam(it)
            },
            onGeri = { ekran = Ekran.Esleme },
        )
        else -> EslemeEkrani(
            depo = depo,
            onTamam = tamam,
            onKodla = { ekran = Ekran.Kod },
            onIlSec = { ekran = Ekran.Il },
            // İlk kurulumda null → geri tuşu uygulamadan çıkar.
            onGeri = if (il != null) ({ ekran = Ekran.Pano }) else null,
        )
    }
}
