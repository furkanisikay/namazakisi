package com.furkanisikay.namazakisi.tv.ui

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.style.LineBreak
import androidx.compose.ui.text.style.LineHeightStyle
import androidx.compose.ui.unit.em
import androidx.tv.material3.MaterialTheme
import androidx.tv.material3.Typography
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
    /** Koyu tema `durum.hata`. Yalnız dekoratif (kod kutusu kenarı); hata METNİ tema metnidir. */
    val hata = Color(0xFFEF5350)
}

/**
 * Yazı ölçeği: tv-material'in bütün stilleri sabit `sp` satır yüksekliği taşır (`bodyLarge`
 * 16/24 sp) ve `Text`'e yalnız `fontSize` verilince bu satır yüksekliği KALIR → 32 sp başlık
 * iki satıra kırılınca satırlar 24 sp arayla üst üste biniyordu (Ge'ez, Yoruba ton işaretleri;
 * 2026-10-30). Satır yüksekliği yazı boyuna göre (`em`) ve `Mode.Minimum`: yazı tipinin kendi
 * satır boyu daha büyükse o kullanılır. Tek satırlık metin değişmez (`Trim.Both`).
 *
 * Satır kırılması ifade birimiyle (`WordBreak.Phrase`, platformda `lineBreakWordStyle=phrase`,
 * API 33+; altında yok sayılır): Korecede satır hece ortasından ("네트/워크", "있/습니다")
 * kırılıyordu (2026-10-31 kare denetimi). Boşluklu Latin metinde etkisi yoktur. Tayca
 * ("เครือ/ข่าย") ICU sözlük kırılmasıdır, phrase onu kapsamaz.
 */
private fun TextStyle.satirGuvenli() = copy(
    lineBreak = LineBreak(
        strategy = LineBreak.Strategy.Simple,
        strictness = LineBreak.Strictness.Normal,
        wordBreak = LineBreak.WordBreak.Phrase,
    ),
    lineHeight = 1.3.em,
    lineHeightStyle = LineHeightStyle(
        alignment = LineHeightStyle.Alignment.Proportional,
        trim = LineHeightStyle.Trim.Both,
        mode = LineHeightStyle.Mode.Minimum,
    ),
)

private val YAZI = Typography().let { t ->
    Typography(
        displayLarge = t.displayLarge.satirGuvenli(),
        displayMedium = t.displayMedium.satirGuvenli(),
        displaySmall = t.displaySmall.satirGuvenli(),
        headlineLarge = t.headlineLarge.satirGuvenli(),
        headlineMedium = t.headlineMedium.satirGuvenli(),
        headlineSmall = t.headlineSmall.satirGuvenli(),
        titleLarge = t.titleLarge.satirGuvenli(),
        titleMedium = t.titleMedium.satirGuvenli(),
        titleSmall = t.titleSmall.satirGuvenli(),
        bodyLarge = t.bodyLarge.satirGuvenli(),
        bodyMedium = t.bodyMedium.satirGuvenli(),
        bodySmall = t.bodySmall.satirGuvenli(),
        labelLarge = t.labelLarge.satirGuvenli(),
        labelMedium = t.labelMedium.satirGuvenli(),
        labelSmall = t.labelSmall.satirGuvenli(),
    )
}

@Composable
fun PanoTemasi(icerik: @Composable () -> Unit) {
    MaterialTheme(
        typography = YAZI,
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
