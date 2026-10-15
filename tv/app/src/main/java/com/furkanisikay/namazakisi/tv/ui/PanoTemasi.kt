package com.furkanisikay.namazakisi.tv.ui

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.tv.material3.MaterialTheme
import androidx.tv.material3.darkColorScheme

/**
 * Telefonun KOYU tema tokenları (`src/core/theme/temalar.ts > koyuTema` + varsayılan
 * yeşil palet). TV'de tema seçimi yok; pano daima koyudur (oturma odasında parlak
 * zemin göz yorar, OLED'de de güç tüketir).
 *
 * Kontrast: metin (#FFFFFF) ve ikincil metin (#B0B0B0) koyu zeminde ≥ 9:1; aktif vakit
 * satırı beyaz metni `birincilKoyu` (#388E3C, ~4.6:1) üzerinde taşır — `birincil`
 * (#4CAF50) beyazla 2.8:1'de kalır, METİN ZEMİNİ olarak kullanılmaz. `uyari`
 * (sarı-amber) yalnız dekoratiftir (kerahat şeridi/noktası); metin daima tema metnidir.
 */
object Renkler {
    val arkaplan = Color(0xFF121212)
    val kart = Color(0xFF1E1E1E)
    val metin = Color(0xFFFFFFFF)
    val metinIkincil = Color(0xFFB0B0B0)
    val sinir = Color(0xFF333333)
    val birincil = Color(0xFF4CAF50)
    val birincilKoyu = Color(0xFF388E3C)
    val uyari = Color(0xFFFFCA28)
}

@Composable
fun PanoTemasi(icerik: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = Renkler.birincil,
            onPrimary = Renkler.arkaplan,
            background = Renkler.arkaplan,
            onBackground = Renkler.metin,
            surface = Renkler.kart,
            onSurface = Renkler.metin,
            surfaceVariant = Renkler.sinir,
            onSurfaceVariant = Renkler.metinIkincil,
            inverseSurface = Renkler.metin,
            inverseOnSurface = Renkler.arkaplan,
            border = Renkler.sinir,
        ),
        content = icerik,
    )
}
