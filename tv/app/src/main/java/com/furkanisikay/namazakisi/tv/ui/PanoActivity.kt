package com.furkanisikay.namazakisi.tv.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.furkanisikay.namazakisi.tv.cekirdek.Il
import com.furkanisikay.namazakisi.tv.cekirdek.UyeHali
import com.furkanisikay.namazakisi.tv.veri.KonumDeposu
import com.furkanisikay.namazakisi.tv.veri.TvSunucusu
import com.furkanisikay.namazakisi.tv.veri.UyeDeposu

/**
 * TV giriş noktası (LEANBACK_LAUNCHER).
 *
 * Konum yoksa önerilen yol "Telefonunuzu ekleyin" (QR v2 eşleştirme); oradan kodla giriş ve
 * elle il seçimi açılır. Panodaki "Ayarlar": telefon ekleme, konum ve eşleşik telefonlar.
 *
 * Cihaz ağı sunucusu YALNIZ uygulama görünürken açıktır (onStart/onStop) ve yalnız eşleşik
 * üye varsa (ya da eşleştirme ekranı açıksa): pil ve saldırı yüzeyi.
 */
class PanoActivity : ComponentActivity() {
    private lateinit var sunucu: TvSunucusu

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val konum = KonumDeposu(this)
        val uyeler = UyeDeposu(this, konum)
        sunucu = TvSunucusu(this, uyeler)
        setContent { PanoTemasi { Uygulama(konum, sunucu) } }
    }

    override fun onStart() {
        super.onStart()
        if (sunucu.depo.uyeVarMi()) sunucu.ac()
    }

    override fun onStop() {
        sunucu.kapat()
        super.onStop()
    }
}

private enum class Ekran { Pano, Esleme, Kod, Il, Ayarlar }

@Composable
private fun Uygulama(depo: KonumDeposu, sunucu: TvSunucusu) {
    var konum by remember { mutableStateOf<Il?>(depo.seciliIl()) }
    var ekran by remember { mutableStateOf(if (konum == null) Ekran.Esleme else Ekran.Pano) }
    var uyeler by remember { mutableStateOf<List<UyeHali>>(sunucu.depo.uyeHalleri()) }
    var uyeOzetleri by remember { mutableStateOf(sunucu.depo.ozetler()) }
    DisposableEffect(Unit) {
        sunucu.depo.degisti = {
            uyeler = sunucu.depo.uyeHalleri()
            uyeOzetleri = sunucu.depo.ozetler()
            // Konum sahibi üye yeni konum gönderdiyse pano onu izler.
            depo.seciliIl()?.let { if (it != konum) konum = it }
        }
        onDispose { sunucu.depo.degisti = null }
    }
    val il = konum
    val tamam: (Il?) -> Unit = {
        if (it == null) {
            ekran = Ekran.Il
        } else {
            konum = it
            ekran = Ekran.Pano
        }
    }

    when {
        il != null && ekran == Ekran.Pano ->
            PanoEkrani(il = il, ekraniAcikTut = true, uyeler = uyeler, onAyarlar = { ekran = Ekran.Ayarlar })
        ekran == Ekran.Ayarlar -> TvAyarlarEkrani(
            uyeler = uyeOzetleri,
            konumAdi = il?.ad,
            onTelefonEkle = { ekran = Ekran.Esleme },
            onKodla = { ekran = Ekran.Kod },
            onIlSec = { ekran = Ekran.Il },
            onKaldir = { sunucu.depo.uyeSil(it) },
            onGeri = { ekran = if (il != null) Ekran.Pano else Ekran.Esleme },
        )
        ekran == Ekran.Kod -> KodGirisEkrani(
            depo = depo,
            onTamam = {
                sunucu.depo.konumSahibiniBirak()
                tamam(it)
            },
            onGeri = { ekran = if (il != null) Ekran.Ayarlar else Ekran.Esleme },
        )
        ekran == Ekran.Il -> IlSecimEkrani(
            iller = depo.iller,
            seciliPlaka = depo.seciliPlaka(),
            onSec = {
                depo.kaydet(it.plaka)
                sunucu.depo.konumSahibiniBirak()
                tamam(it)
            },
            onGeri = { ekran = if (il != null) Ekran.Ayarlar else Ekran.Esleme },
        )
        else -> EslemeEkrani(
            sunucu = sunucu,
            konum = depo,
            onTamam = tamam,
            onKodla = { ekran = Ekran.Kod },
            onIlSec = { ekran = Ekran.Il },
            // İlk kurulumda null → geri tuşu uygulamadan çıkar.
            onGeri = if (il != null) ({ ekran = Ekran.Ayarlar }) else null,
        )
    }
}
