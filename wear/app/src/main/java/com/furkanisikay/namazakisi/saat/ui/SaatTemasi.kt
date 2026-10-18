package com.furkanisikay.namazakisi.saat.ui

import android.provider.Settings
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.wear.compose.material3.ColorScheme
import androidx.wear.compose.material3.MaterialTheme
import com.furkanisikay.namazakisi.saat.cekirdek.SaatPaleti

/** Paletteki ARGB değeri → Compose rengi. */
fun renk(argb: Long): Color = Color(argb)

/**
 * Saatin teması: renkler YALNIZ `SaatPaleti`'nden. `dynamicColorScheme` KULLANILMAZ —
 * sistem renkleri uygulamanın kimliğini (eylem yeşili, vakit tonları) siler.
 * Tüm ekranlar çıplak `MaterialTheme {}` yerine bunu sarar.
 */
@Composable
fun SaatTemasi(content: @Composable () -> Unit) {
    val renkler = remember {
        ColorScheme(
            primary = renk(SaatPaleti.EYLEM),
            primaryDim = renk(SaatPaleti.EYLEM),
            primaryContainer = renk(SaatPaleti.YUZEY2),
            onPrimary = renk(SaatPaleti.EYLEM_USTU),
            onPrimaryContainer = renk(SaatPaleti.METIN),
            secondary = renk(SaatPaleti.EYLEM),
            secondaryDim = renk(SaatPaleti.EYLEM),
            secondaryContainer = renk(SaatPaleti.YUZEY2),
            onSecondary = renk(SaatPaleti.EYLEM_USTU),
            onSecondaryContainer = renk(SaatPaleti.METIN),
            tertiary = renk(SaatPaleti.KERAHAT),
            tertiaryDim = renk(SaatPaleti.KERAHAT),
            tertiaryContainer = renk(SaatPaleti.YUZEY2),
            onTertiary = renk(SaatPaleti.ZEMIN),
            onTertiaryContainer = renk(SaatPaleti.METIN),
            surfaceContainerLow = renk(SaatPaleti.YUZEY),
            surfaceContainer = renk(SaatPaleti.YUZEY),
            surfaceContainerHigh = renk(SaatPaleti.YUZEY2),
            onSurface = renk(SaatPaleti.METIN),
            onSurfaceVariant = renk(SaatPaleti.METIN2),
            outline = renk(SaatPaleti.METIN2),
            outlineVariant = renk(SaatPaleti.IZ),
            background = renk(SaatPaleti.ZEMIN),
            onBackground = renk(SaatPaleti.METIN),
            error = renk(SaatPaleti.ACIL),
            errorDim = renk(SaatPaleti.ACIL),
            errorContainer = renk(SaatPaleti.YUZEY2),
            onError = renk(SaatPaleti.ZEMIN),
            onErrorContainer = renk(SaatPaleti.METIN),
        )
    }
    MaterialTheme(colorScheme = renkler, content = content)
}

/**
 * "Animasyonları kaldır" (geliştirici/erişilebilirlik ayarı) açık mı? Açıksa her sahne
 * son karesine atlar (yönerge: hareket anlam taşımalı, zorunlu olmamalı).
 */
@Composable
fun hareketAzaltilmis(): Boolean {
    val baglam = LocalContext.current
    return remember {
        Settings.Global.getFloat(baglam.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f) == 0f
    }
}
