package com.furkanisikay.namazakisi.saat.ui

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalConfiguration
import com.furkanisikay.namazakisi.saat.cekirdek.rakamlariYerellestir
import com.furkanisikay.namazakisi.saat.cekirdek.yerelSifir

/*
 * Çizim kenarındaki TEK rakam yardımcısı (kural ve gerekçe: `cekirdek/Rakam.kt`).
 * Yerel ayar `configuration.locales[0]`: kaynak dizgesindeki `%d`'yi biçimleyen ve sistem
 * saatinin izlediği yerel ayarla aynı → ar-SA'da bütün sayılar ٠-٩, Batı rakamlı yerel
 * ayarda metin aynen döner. Sesli okuma (TTS) metnine UYGULANMAZ; ekran okuyucu açıklaması
 * (contentDescription) görünmediği için dokunulmaz.
 */

/** Compose: cihaz yerel ayarının sıfır rakamı (yerel ayar değişince yeniden okunur). */
@Composable
fun sifirRakami(): Char {
    val yerel = LocalConfiguration.current.locales[0]
    return remember(yerel) { yerelSifir(yerel) }
}

/** Compose: görünen metindeki rakamları cihaz yerel ayarının rakamına çevirir. */
@Composable
fun yerelRakam(metin: String): String = rakamlariYerellestir(metin, sifirRakami())

/** Tile / komplikasyon / bildirim: cihaz yerel ayarının sıfır rakamı. */
fun Context.yerelSifirRakami(): Char = yerelSifir(resources.configuration.locales[0])

/** Tile / komplikasyon / bildirim: görünen metindeki rakamları yerel rakama çevirir. */
fun Context.yerelRakamla(metin: String): String = rakamlariYerellestir(metin, yerelSifirRakami())
