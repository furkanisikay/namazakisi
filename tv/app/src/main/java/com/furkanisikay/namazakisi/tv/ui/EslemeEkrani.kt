package com.furkanisikay.namazakisi.tv.ui

import android.content.pm.ApplicationInfo
import android.util.Log
import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.Text
import com.furkanisikay.namazakisi.tv.cekirdek.Il
import com.furkanisikay.namazakisi.tv.veri.EslemeSunucusu
import com.furkanisikay.namazakisi.tv.veri.KonumDeposu
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private sealed class QrDurumu {
    data class Bekliyor(val metin: String) : QrDurumu()
    data object AgYok : QrDurumu()
}

/**
 * "Vakitleri telefonunuzdan alın": TV'nin ilk ve önerilen kurulum yolu.
 *
 * Sağda QR (TV'nin yerel adresi + tek seferlik anahtar). Telefon kodu okuyunca konumunu
 * bu TV'ye doğrudan yollar; sahne: okunan QR'ın kareleri dıştan içe merkeze katlanır, yolda
 * yeşile döner ve gelen konumun iğnesine dönüşür; halka bir kez çizilir; şehir adı gelir;
 * kısa bir an sonra pano açılır. Bekleme sırasında ekran DURGUNDUR (boşta hareket yok).
 *
 * Ağ yoksa (yerel IPv4 bulunamadı) QR yerine yön gösteren kart: "Kodla girin" ya da il seçimi.
 */
@Composable
fun EslemeEkrani(
    depo: KonumDeposu,
    onTamam: (Il) -> Unit,
    onKodla: () -> Unit,
    onIlSec: () -> Unit,
    onGeri: (() -> Unit)?,
) {
    if (onGeri != null) BackHandler(onBack = onGeri)
    val baglam = LocalContext.current
    val animasyon = remember { animasyonAcik(baglam) }

    var deneme by remember { mutableIntStateOf(0) }
    var durum by remember { mutableStateOf<QrDurumu?>(null) }
    var baglandi by remember { mutableStateOf(false) }
    var gelen by remember { mutableStateOf<Il?>(null) }

    val sunucu = remember {
        EslemeSunucusu(
            kabulEdildi = { ad, lat, lng ->
                depo.telefondanKaydet(ad, lat, lng)
                gelen = Il(KonumDeposu.PLAKA_TELEFON, ad, lat, lng)
            },
            baglandi = { baglandi = true },
        )
    }
    DisposableEffect(deneme) {
        val metin = sunucu.baslat()
        durum = if (metin != null) QrDurumu.Bekliyor(metin) else QrDurumu.AgYok
        // Yalnız hata ayıklanabilir (debug) derlemede: ekran görüntüsü hattı telefonu taklit
        // edip uçtan uca gönderim yapabilsin (`scripts/tv-kare-hatti.sh`). Yayın derlemesinde
        // tek seferlik anahtar loga YAZILMAZ.
        if (metin != null && (baglam.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            Log.d("TvEsleme", "QR $metin")
        }
        onDispose { sunucu.durdur() }
    }

    val ilkOdak = remember { FocusRequester() }
    LaunchedEffect(durum is QrDurumu.AgYok) {
        try {
            ilkOdak.requestFocus()
        } catch (_: IllegalStateException) {
        }
    }

    // --- Başarı sahnesi (tek seferlik) ---
    val katlanma = remember { Animatable(0f) }
    val igne = remember { Animatable(0f) }
    val halka = remember { Animatable(0f) }
    LaunchedEffect(gelen) {
        val il = gelen ?: return@LaunchedEffect
        if (!animasyon) {
            katlanma.snapTo(1f); igne.snapTo(1f); halka.snapTo(1f)
            delay(1800)
        } else {
            launch { katlanma.animateTo(1f, tween(750, easing = LinearEasing)) }
            delay(620)
            launch { igne.animateTo(1f, spring(dampingRatio = 0.48f, stiffness = Spring.StiffnessMediumLow)) }
            delay(260)
            halka.animateTo(1f, tween(700))
            delay(1500)
        }
        onTamam(il)
    }

    Row(
        Modifier
            .fillMaxSize()
            .background(Renkler.arkaplan)
            .padding(horizontal = 56.dp, vertical = 36.dp),
        horizontalArrangement = Arrangement.spacedBy(48.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f).fillMaxHeight(), verticalArrangement = Arrangement.Center) {
            AnimatedContent(
                targetState = gelen,
                transitionSpec = {
                    (fadeIn(tween(320, delayMillis = 140)) + slideInVertically(tween(320, delayMillis = 140)) { it / 6 })
                        .togetherWith(fadeOut(tween(200)))
                },
                label = "baslik",
            ) { il ->
                if (il == null) SolMetin(baglandi) else GeldiMetni(il)
            }
            Spacer(Modifier.height(36.dp))
            if (gelen == null) {
                Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    EslemeDugmesi(
                        "Kodla girin",
                        onKodla,
                        Modifier.focusRequester(ilkOdak),
                        birincil = durum is QrDurumu.AgYok,
                    )
                    EslemeDugmesi("İli kendim seçeyim", onIlSec)
                    if (durum is QrDurumu.AgYok) EslemeDugmesi("Yeniden deneyin", { deneme++ })
                }
            }
        }

        Box(Modifier.width(380.dp), contentAlignment = Alignment.Center) {
            when (val d = durum) {
                is QrDurumu.Bekliyor -> QrKarti(d.metin, katlanma.value, igne.value, halka.value, gelen != null)
                QrDurumu.AgYok -> AgYokKarti()
                null -> Unit
            }
        }
    }
}

@Composable
private fun SolMetin(baglandi: Boolean) {
    Column {
        Text("Vakitleri telefonunuzdan alın", color = Renkler.metin, fontSize = 38.sp, fontWeight = FontWeight.SemiBold, lineHeight = 44.sp)
        Spacer(Modifier.height(10.dp))
        Text(
            "Telefonunuzdaki konum bu ekrana gelir; vakitler ona göre hesaplanır.",
            color = Renkler.metinIkincil, fontSize = 20.sp, lineHeight = 28.sp,
        )
        Spacer(Modifier.height(30.dp))
        Adim(1, "Telefonunuzda Namaz Akışı'nı açın")
        Adim(2, "Ayarlar › Televizyonda gösterin")
        Adim(3, "Telefonun kamerasını sağdaki koda tutun")
        Spacer(Modifier.height(18.dp))
        Text(
            if (baglandi) "Telefonunuz bağlandı, konum geliyor…" else "Telefon ile TV aynı Wi-Fi ağında olmalı.",
            color = if (baglandi) Renkler.metin else Renkler.metinIkincil,
            fontSize = 18.sp,
            modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
        )
    }
}

@Composable
private fun Adim(sira: Int, metin: String) {
    Row(Modifier.padding(vertical = 7.dp), verticalAlignment = Alignment.CenterVertically) {
        Box(
            Modifier.size(38.dp).background(Renkler.kart, CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            Text("$sira", color = Renkler.birincil, fontSize = 19.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(Modifier.width(16.dp))
        Text(metin, color = Renkler.metin, fontSize = 22.sp)
    }
}

@Composable
private fun GeldiMetni(il: Il) {
    Column(Modifier.semantics { liveRegion = LiveRegionMode.Polite }) {
        Text("Konumunuz geldi", color = Renkler.metinIkincil, fontSize = 22.sp)
        Spacer(Modifier.height(8.dp))
        Text(il.ad, color = Renkler.metin, fontSize = 46.sp, fontWeight = FontWeight.SemiBold, lineHeight = 52.sp)
        Spacer(Modifier.height(12.dp))
        Text("Vakitler bu konuma göre hesaplanacak.", color = Renkler.metinIkincil, fontSize = 20.sp)
    }
}

@Composable
private fun QrKarti(metin: String, katlanma: Float, igne: Float, halka: Float, geldi: Boolean) {
    val qr = rememberQr(metin) ?: return
    Box(
        Modifier
            .size(360.dp)
            .background(androidx.compose.ui.graphics.Color.White, RoundedCornerShape(24.dp))
            .padding(26.dp)
            .semantics {
                contentDescription = if (geldi) "Konum alındı" else "Telefonunuzla okutacağınız eşleştirme kodu"
            },
        contentAlignment = Alignment.Center,
    ) {
        Canvas(Modifier.fillMaxSize()) {
            if (katlanma < 1f) qrCiz(qr, katlanma, QR_KOYU, Renkler.birincil)
            if (igne > 0f || halka > 0f) igneCiz(igne, halka, Renkler.birincilKoyu, Renkler.birincil)
        }
    }
}

@Composable
private fun AgYokKarti() {
    Column(
        Modifier
            .size(360.dp)
            .background(Renkler.kart, RoundedCornerShape(24.dp))
            .padding(32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Canvas(Modifier.size(84.dp)) { kopukAgCiz(Renkler.metinIkincil) }
        Spacer(Modifier.height(20.dp))
        Text("TV ağa bağlı değil", color = Renkler.metin, fontSize = 24.sp, fontWeight = FontWeight.SemiBold, textAlign = TextAlign.Center)
        Spacer(Modifier.height(10.dp))
        Text(
            "Telefonunuzdaki 7 haneli kodu girerek ya da ilinizi seçerek devam edebilirsiniz.",
            color = Renkler.metinIkincil, fontSize = 18.sp, lineHeight = 25.sp, textAlign = TextAlign.Center,
        )
    }
}

private val QR_KOYU = androidx.compose.ui.graphics.Color(0xFF121212)

/** Üç yay + bir nokta, üstünden çapraz çizgi: "kablosuz yok". */
private fun androidx.compose.ui.graphics.drawscope.DrawScope.kopukAgCiz(renk: androidx.compose.ui.graphics.Color) {
    val m = androidx.compose.ui.geometry.Offset(size.width / 2, size.height * 0.78f)
    val k = size.minDimension * 0.07f
    for (i in 1..3) {
        val r = size.minDimension * 0.2f * i
        drawArc(
            renk, 225f, 90f, false,
            topLeft = androidx.compose.ui.geometry.Offset(m.x - r, m.y - r),
            size = androidx.compose.ui.geometry.Size(r * 2, r * 2),
            style = androidx.compose.ui.graphics.drawscope.Stroke(k, cap = androidx.compose.ui.graphics.StrokeCap.Round),
        )
    }
    drawCircle(renk, k * 0.9f, m)
    drawLine(
        renk,
        androidx.compose.ui.geometry.Offset(size.width * 0.15f, size.height * 0.12f),
        androidx.compose.ui.geometry.Offset(size.width * 0.85f, size.height * 0.88f),
        k, androidx.compose.ui.graphics.StrokeCap.Round,
    )
}
