package com.furkanisikay.namazakisi.tv.ui

import com.furkanisikay.namazakisi.tv.R
import androidx.compose.ui.res.stringResource
import android.view.KeyEvent as AndroidKeyEvent
import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.text.BasicText
import androidx.compose.foundation.text.TextAutoSize
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.onPreviewKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.input.key.nativeKeyCode
import androidx.compose.ui.input.key.key
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.Border
import androidx.tv.material3.LocalContentColor
import androidx.tv.material3.ClickableSurfaceDefaults
import androidx.tv.material3.Surface
import androidx.tv.material3.Text
import com.furkanisikay.namazakisi.tv.cekirdek.EslemeKodu
import com.furkanisikay.namazakisi.tv.cekirdek.Il
import com.furkanisikay.namazakisi.tv.cekirdek.TvRakam
import com.furkanisikay.namazakisi.tv.veri.KonumDeposu
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private const val KUTU_EN = 54
private const val KUTU_ARA = 10
private const val GRUP_ARA = 24

/** Kutunun satır merkezine göre yatay konumu (dp): katlanma sahnesi kutuları buraya çeker. */
private fun kutuMerkezi(i: Int): Float {
    val toplam = 7 * KUTU_EN + 5 * KUTU_ARA + GRUP_ARA
    val sol = i * (KUTU_EN + KUTU_ARA) + (if (i >= 3) GRUP_ARA - KUTU_ARA else 0)
    return sol + KUTU_EN / 2f - toplam / 2f
}

/**
 * Ağsız yedek yol: telefonun gösterdiği 7 haneli konum kodu.
 *
 * Google TV / Chromecast kumandalarında rakam tuşu yoktur → ekranda D-pad'li tuş takımı;
 * rakamlı kumandanın tuşları da doğrudan kabul edilir. Yedinci hane girilince kod hemen
 * denetlenir (Damm: tek hane hatası ve yer değiştirme her zaman yakalanır).
 * - Doğru: kutular kenardan içe sırayla merkeze katlanıp tek karta, kart konum iğnesine
 *   dönüşür; halka bir kez çizilir; ad gelir; pano açılır.
 * - Yanlış: kutular kısa bir sönümlü titreşimle sallanır, kenarları kırmızıya döner;
 *   haneler SİLİNMEZ (yanlış olanı "Sil" ile düzeltebilirsiniz), yön gösteren metin çıkar.
 */
@Composable
fun KodGirisEkrani(
    depo: KonumDeposu,
    onTamam: (Il) -> Unit,
    onGeri: () -> Unit,
) {
    BackHandler(onBack = onGeri)
    val baglam = LocalContext.current
    val animasyon = remember { animasyonAcik(baglam.applicationContext) }
    val yogunluk = LocalDensity.current

    var haneler by remember { mutableStateOf("") }
    var hatali by remember { mutableStateOf(false) }
    var gelen by remember { mutableStateOf<Il?>(null) }

    val titre = remember { Animatable(1f) }
    val katlanma = remember { Animatable(0f) }
    val igne = remember { Animatable(0f) }
    val halka = remember { Animatable(0f) }

    fun ekle(r: Char) {
        if (gelen != null || haneler.length >= EslemeKodu.UZUNLUK) return
        hatali = false
        haneler += r
    }

    fun sil() {
        if (gelen != null) return
        hatali = false
        haneler = haneler.dropLast(1)
    }

    LaunchedEffect(haneler) {
        if (haneler.length != EslemeKodu.UZUNLUK) return@LaunchedEffect
        val konum = EslemeKodu.coz(haneler)
        if (konum == null) {
            hatali = true
            if (animasyon) {
                titre.snapTo(0f)
                titre.animateTo(1f, tween(520))
            }
            return@LaunchedEffect
        }
        val ad = EslemeKodu.konumAdi(depo.iller, konum.first, konum.second)
        // 7 haneli kod Türkiye ızgarasıdır: rakam sistemi Türkiye'ye göre çözülür.
        val rakam = TvRakam("TR")
        depo.telefondanKaydet(ad, konum.first, konum.second, rakam = rakam)
        val il = Il(KonumDeposu.PLAKA_TELEFON, ad, konum.first, konum.second, rakam = rakam)
        gelen = il
        if (!animasyon) {
            katlanma.snapTo(1f); igne.snapTo(1f); halka.snapTo(1f)
            delay(1800)
        } else {
            katlanma.animateTo(1f, tween(620, easing = FastOutSlowInEasing))
            launch { igne.animateTo(1f, spring(dampingRatio = 0.48f, stiffness = Spring.StiffnessMediumLow)) }
            delay(220)
            halka.animateTo(1f, tween(700))
            delay(1500)
        }
        onTamam(il)
    }

    val ilkOdak = remember { FocusRequester() }
    LaunchedEffect(Unit) {
        try {
            ilkOdak.requestFocus()
        } catch (_: IllegalStateException) {
        }
    }

    Row(
        Modifier
            .fillMaxSize()
            .background(Renkler.arkaplan)
            .onPreviewKeyEvent { olay ->
                if (olay.type != KeyEventType.KeyDown) return@onPreviewKeyEvent false
                when (val k = olay.key.nativeKeyCode) {
                    in AndroidKeyEvent.KEYCODE_0..AndroidKeyEvent.KEYCODE_9 -> { ekle('0' + (k - AndroidKeyEvent.KEYCODE_0)); true }
                    in AndroidKeyEvent.KEYCODE_NUMPAD_0..AndroidKeyEvent.KEYCODE_NUMPAD_9 -> { ekle('0' + (k - AndroidKeyEvent.KEYCODE_NUMPAD_0)); true }
                    AndroidKeyEvent.KEYCODE_DEL -> { sil(); true }
                    else -> false
                }
            }
            .padding(horizontal = 56.dp, vertical = 36.dp),
        horizontalArrangement = Arrangement.spacedBy(56.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f).fillMaxHeight(), verticalArrangement = Arrangement.Center) {
            AnimatedContent(
                targetState = gelen,
                transitionSpec = {
                    (fadeIn(tween(320, delayMillis = 140)) + slideInVertically(tween(320, delayMillis = 140)) { it / 6 })
                        .togetherWith(fadeOut(tween(200)))
                },
                label = "kodBaslik",
            ) { il ->
                Column {
                    if (il == null) {
                        Text(stringResource(R.string.kod_baslik), color = Renkler.metin, fontSize = 36.sp, lineHeight = 44.sp, fontWeight = FontWeight.SemiBold)
                        Spacer(Modifier.height(10.dp))
                        Text(
                            stringResource(R.string.kod_yol),
                            color = Renkler.metinIkincil, fontSize = 26.sp, lineHeight = 36.sp,
                        )
                    } else {
                        Text(stringResource(R.string.konumunuz_geldi), color = Renkler.metinIkincil, fontSize = 30.sp)
                        Spacer(Modifier.height(8.dp))
                        Text(il.ad, color = Renkler.metin, fontSize = 60.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
            Spacer(Modifier.height(40.dp))

            // Kutular → katlanınca iğne.
            Box(Modifier.fillMaxWidth().height(150.dp), contentAlignment = Alignment.Center) {
                Row(
                    Modifier.graphicsLayer {
                        translationX = with(yogunluk) { (titreme(titre.value) * 20).dp.toPx() }
                    },
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    for (i in 0 until EslemeKodu.UZUNLUK) {
                        if (i == 3) Spacer(Modifier.width((GRUP_ARA - KUTU_ARA).dp))
                        if (i > 0) Spacer(Modifier.width(KUTU_ARA.dp))
                        // Kenardan içe sıra: en dıştaki kutu önce yola çıkar.
                        val sira = 3 - kotlin.math.abs(i - 3)
                        val yerel = ((katlanma.value - sira * 0.12f) / 0.64f).coerceIn(0f, 1f)
                        HaneKutusu(
                            rakam = haneler.getOrNull(i),
                            aktif = gelen == null && i == haneler.length,
                            hatali = hatali,
                            modifier = Modifier.graphicsLayer {
                                translationX = with(yogunluk) { (-kutuMerkezi(i) * yerel).dp.toPx() }
                                val o = 1f - yerel
                                scaleX = o; scaleY = o
                                alpha = o
                            },
                        )
                    }
                }
                if (igne.value > 0f || halka.value > 0f) {
                    Canvas(Modifier.size(150.dp)) { igneCiz(igne.value, halka.value, Renkler.birincil, Renkler.birincil) }
                }
            }

            Spacer(Modifier.height(18.dp))
            Text(
                when {
                    gelen != null -> stringResource(R.string.konuma_gore_hesaplanacak)
                    hatali -> stringResource(R.string.kod_hatali, stringResource(R.string.kod_sil))
                    else -> stringResource(R.string.kod_rakamli_kumanda)
                },
                color = if (hatali) Renkler.metin else Renkler.metinIkincil,
                fontSize = 24.sp,
                lineHeight = 34.sp,
                modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
            )
        }

        if (gelen == null) {
            TusTakimi(
                ilkOdak = ilkOdak,
                onRakam = ::ekle,
                onSil = ::sil,
                silinebilir = haneler.isNotEmpty(),
                onVazgec = onGeri,
            )
        }
    }
}

@Composable
private fun HaneKutusu(rakam: Char?, aktif: Boolean, hatali: Boolean, modifier: Modifier) {
    val bosHane = stringResource(R.string.kod_bos_hane)
    val kenar = when {
        hatali -> Renkler.hata
        aktif -> Renkler.birincil
        else -> Renkler.sinir
    }
    Box(
        modifier
            .size(width = KUTU_EN.dp, height = 76.dp)
            .background(Renkler.kart, RoundedCornerShape(14.dp))
            .border(BorderStroke(if (aktif || hatali) 3.dp else 1.dp, kenar), RoundedCornerShape(14.dp))
            .semantics { contentDescription = rakam?.toString() ?: bosHane },
        contentAlignment = Alignment.Center,
    ) {
        Text(rakam?.toString() ?: "", color = Renkler.metin, fontSize = 40.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun TusTakimi(
    ilkOdak: FocusRequester,
    onRakam: (Char) -> Unit,
    onSil: () -> Unit,
    silinebilir: Boolean,
    onVazgec: () -> Unit,
) {
    val satirlar = listOf("123", "456", "789")
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        for ((si, satir) in satirlar.withIndex()) {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                for ((ti, r) in satir.withIndex()) {
                    Tus(r.toString(), "$r", { onRakam(r) }, if (si == 0 && ti == 0) Modifier.focusRequester(ilkOdak) else Modifier)
                }
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Tus(stringResource(R.string.kod_sil), stringResource(R.string.kod_sil_aciklama), onSil, Modifier, kucuk = true, etkin = silinebilir)
            Tus("0", "0", { onRakam('0') }, Modifier)
            Tus(stringResource(R.string.kod_geri), stringResource(R.string.vazgecin), onVazgec, Modifier, kucuk = true)
        }
    }
}

@Composable
private fun Tus(
    etiket: String,
    erisim: String,
    onClick: () -> Unit,
    modifier: Modifier,
    kucuk: Boolean = false,
    etkin: Boolean = true,
) {
    Surface(
        onClick = onClick,
        enabled = etkin,
        modifier = modifier.size(88.dp, 72.dp).semantics { contentDescription = erisim },
        shape = ClickableSurfaceDefaults.shape(RoundedCornerShape(16.dp)),
        colors = ClickableSurfaceDefaults.colors(
            containerColor = Renkler.kart,
            contentColor = Renkler.metin,
            focusedContainerColor = Renkler.metin,
            focusedContentColor = Renkler.arkaplan,
            disabledContainerColor = Renkler.kart.copy(alpha = 0.5f),
            disabledContentColor = Renkler.metinIkincil,
        ),
        border = ClickableSurfaceDefaults.border(focusedBorder = Border(BorderStroke(2.dp, Renkler.birincil))),
        scale = ClickableSurfaceDefaults.scale(focusedScale = 1.08f),
    ) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            // Uzun dilde ("Löschen", "Удалить") etiket tek satırda kalır, yazı küçülür.
            val renk = LocalContentColor.current
            BasicText(
                etiket,
                style = TextStyle(fontSize = if (kucuk) 24.sp else 34.sp, fontWeight = FontWeight.SemiBold),
                color = { renk },
                maxLines = 1,
                autoSize = TextAutoSize.StepBased(minFontSize = 14.sp, maxFontSize = if (kucuk) 24.sp else 34.sp),
                modifier = Modifier.padding(horizontal = 6.dp),
            )
        }
    }
}
