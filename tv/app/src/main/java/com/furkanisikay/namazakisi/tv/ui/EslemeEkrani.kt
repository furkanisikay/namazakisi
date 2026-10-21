package com.furkanisikay.namazakisi.tv.ui

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
import com.furkanisikay.namazakisi.tv.veri.KonumDeposu
import com.furkanisikay.namazakisi.tv.veri.TvSunucusu
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private sealed class QrDurumu {
    data class Bekliyor(val metin: String) : QrDurumu()
    data object AgYok : QrDurumu()
}

/** Eşleştirmenin aşaması (ekranın sol metni bundan çizilir). */
private enum class Asama { QR, ONAY_SORULUYOR, EKLENIYOR, EKLENDI, SAKLANAMADI }

/**
 * "Telefonunuzu ekleyin" (eşleştirme v2, tasarım §4.1): TV'nin ilk ve önerilen kurulum yolu.
 *
 * Sağda QR — yalnız GEÇİCİ eşleştirme sırrı (kalıcı anahtar QR'da yok). Telefon okur, kendi
 * ekranında "Şu TV'ye bağlanıyorsunuz: <ad>" onayını alır, TV'ye şifreli istek yollar. TV
 * kumandayla "Bu telefonu ekleyelim mi?" sorar; onayda üyeye ÖZEL anahtar üretilir (Keystore
 * ile sarılı saklanır) ve telefona sırla şifreli gider. Telefonun ilk eşitlemesi konumu getirir.
 * Sahne: QR kareleri dıştan içe katlanıp yeşile döner ve konum iğnesine dönüşür; halka bir kez.
 * Her başarılı eşleşmede sır yenilenir (yeni QR). Boşta ekran DURGUNDUR.
 *
 * `onTamam(null)`: telefon konum göndermediyse il seçimine gidilir.
 */
@Composable
fun EslemeEkrani(
    sunucu: TvSunucusu,
    konum: KonumDeposu,
    onTamam: (Il?) -> Unit,
    onKodla: () -> Unit,
    onIlSec: () -> Unit,
    onGeri: (() -> Unit)?,
) {
    if (onGeri != null) BackHandler(onBack = onGeri)
    val baglam = LocalContext.current
    val animasyon = remember { animasyonAcik(baglam) }
    val mantik = sunucu.mantik

    var deneme by remember { mutableIntStateOf(0) }
    var durum by remember { mutableStateOf<QrDurumu?>(null) }
    var asama by remember { mutableStateOf(Asama.QR) }
    var cihazAdi by remember { mutableStateOf<String?>(null) }
    var olaySayaci by remember { mutableIntStateOf(0) }
    var gelen by remember { mutableStateOf<Il?>(null) }

    DisposableEffect(deneme) {
        val sir = mantik.eslesmeyiAc()
        val metin = sunucu.qrMetni(sir)
        durum = if (metin != null) QrDurumu.Bekliyor(metin) else QrDurumu.AgYok
        sunucu.olay = { olaySayaci++ }
        onDispose {
            sunucu.olay = null
            mantik.eslesmeyiKapat()
            if (!sunucu.depo.uyeVarMi()) sunucu.kapat()
        }
    }

    // Sunucudan gelen her olayda (istek, onay teslimi, ilk eşitleme) aşamayı yeniden değerlendir.
    LaunchedEffect(olaySayaci) {
        val bekleyen = mantik.onayBekleyen
        if (asama == Asama.QR && bekleyen != null) {
            cihazAdi = bekleyen
            asama = Asama.ONAY_SORULUYOR
        }
        if (asama == Asama.EKLENIYOR && mantik.onayTeslimEdildi) asama = Asama.EKLENDI
        if (asama == Asama.EKLENDI && gelen == null) konum.telefondanGelen()?.let { gelen = it }
    }

    // Eklendi: ilk eşitleme (konum) en çok 8 sn beklenir, sonra sahne + pano.
    LaunchedEffect(asama) {
        if (asama != Asama.EKLENDI) return@LaunchedEffect
        repeat(16) {
            if (gelen != null) return@repeat
            delay(500)
            konum.telefondanGelen()?.let { gelen = it }
        }
        if (gelen == null) {
            mantik.oturumuYenile()
            onTamam(konum.seciliIl())
        }
    }

    val ilkOdak = remember { FocusRequester() }
    LaunchedEffect(durum is QrDurumu.AgYok, asama) {
        if (asama != Asama.QR) return@LaunchedEffect
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
            launch { katlanma.animateTo(1f, tween(950, easing = LinearEasing)) }
            delay(800)
            launch { igne.animateTo(1f, spring(dampingRatio = 0.48f, stiffness = Spring.StiffnessMediumLow)) }
            delay(260)
            halka.animateTo(1f, tween(700))
            delay(1500)
        }
        mantik.oturumuYenile()
        onTamam(il)
    }

    Box(Modifier.fillMaxSize().background(Renkler.arkaplan)) {
        Row(
            Modifier.fillMaxSize().padding(horizontal = 56.dp, vertical = 36.dp),
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
                    if (il == null) SolMetin(asama, cihazAdi) else GeldiMetni(il, cihazAdi)
                }
                Spacer(Modifier.height(36.dp))
                if (gelen == null && asama == Asama.QR) {
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

        if (asama == Asama.ONAY_SORULUYOR) {
            OnayDiyalogu(
                cihazAdi = cihazAdi ?: "Telefon",
                onEvet = {
                    asama = if (mantik.karar(true) != null) Asama.EKLENIYOR else Asama.SAKLANAMADI
                    olaySayaci++
                },
                onHayir = {
                    mantik.karar(false)
                    asama = Asama.QR
                    deneme++
                },
            )
        }
    }
}

@Composable
private fun SolMetin(asama: Asama, cihazAdi: String?) {
    Column {
        when (asama) {
            Asama.EKLENIYOR, Asama.EKLENDI -> {
                Text("${cihazAdi ?: "Telefon"} ekleniyor", color = Renkler.metin, fontSize = 44.sp, fontWeight = FontWeight.SemiBold, lineHeight = 52.sp)
                Spacer(Modifier.height(10.dp))
                Text(
                    "Telefonunuz konumunu ve durumunu gönderiyor…",
                    color = Renkler.metinIkincil, fontSize = 26.sp, lineHeight = 36.sp,
                    modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
                )
            }
            Asama.SAKLANAMADI -> {
                Text("Eşleşme tamamlanamadı", color = Renkler.metin, fontSize = 44.sp, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(10.dp))
                Text(
                    "Bu TV, bağlantı anahtarını güvenli saklayamıyor. Konumu kodla girebilir ya da ilinizi seçebilirsiniz.",
                    color = Renkler.metinIkincil, fontSize = 26.sp, lineHeight = 36.sp,
                    modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
                )
            }
            else -> {
                Text("Telefonunuzu ekleyin", color = Renkler.metin, fontSize = 44.sp, fontWeight = FontWeight.SemiBold, lineHeight = 52.sp)
                Spacer(Modifier.height(10.dp))
                Text(
                    "Vakitler sizin konumunuza göre hesaplanır; kıldığınız namazlar TV'de görünür.",
                    color = Renkler.metinIkincil, fontSize = 26.sp, lineHeight = 36.sp,
                )
                Spacer(Modifier.height(30.dp))
                Adim(1, "Telefonunuzda Namaz Akışı'nı açın")
                Adim(2, "Ayarlar › Cihazlarım › TV ekleyin")
                Adim(3, "Telefonun kamerasını sağdaki koda tutun")
                Spacer(Modifier.height(18.dp))
                Text("Telefon ile TV aynı Wi-Fi ağında olmalı.", color = Renkler.metinIkincil, fontSize = 24.sp)
            }
        }
    }
}

/** Kumanda onayı: odak "Ekleyin"de; geri tuşu = hayır. */
@Composable
private fun OnayDiyalogu(cihazAdi: String, onEvet: () -> Unit, onHayir: () -> Unit) {
    BackHandler(onBack = onHayir)
    val odak = remember { FocusRequester() }
    LaunchedEffect(Unit) {
        try {
            odak.requestFocus()
        } catch (_: IllegalStateException) {
        }
    }
    Box(Modifier.fillMaxSize().background(Renkler.arkaplan.copy(alpha = 0.96f)), contentAlignment = Alignment.Center) {
        Column(
            Modifier.width(780.dp).background(Renkler.kart, RoundedCornerShape(36.dp)).padding(horizontal = 56.dp, vertical = 48.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Box(Modifier.size(104.dp).background(Renkler.birincil.copy(alpha = 0.16f), CircleShape), contentAlignment = Alignment.Center) {
                TelefonSimgesi(Renkler.birincil, Modifier.size(56.dp))
            }
            Spacer(Modifier.height(20.dp))
            Text("Bu telefonu ekleyelim mi?", color = Renkler.metin, fontSize = 44.sp, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(16.dp))
            Text(cihazAdi, color = Renkler.birincil, fontSize = 36.sp, fontWeight = FontWeight.SemiBold, textAlign = TextAlign.Center)
            Spacer(Modifier.height(16.dp))
            Text(
                "Eklenen telefon bu TV'ye konumunu ve kıldığı namazları gönderebilir.",
                color = Renkler.metinIkincil, fontSize = 26.sp, textAlign = TextAlign.Center, lineHeight = 36.sp,
            )
            Spacer(Modifier.height(40.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(28.dp)) {
                EslemeDugmesi("Ekleyin", onEvet, Modifier.focusRequester(odak), birincil = true, buyuk = true)
                EslemeDugmesi("Hayır", onHayir, buyuk = true)
            }
        }
    }
}

@Composable
private fun Adim(sira: Int, metin: String) {
    Row(Modifier.padding(vertical = 7.dp), verticalAlignment = Alignment.CenterVertically) {
        Box(
            Modifier.size(48.dp).background(Renkler.kart, CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            Text("$sira", color = Renkler.birincil, fontSize = 24.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(Modifier.width(16.dp))
        Text(metin, color = Renkler.metin, fontSize = 28.sp)
    }
}

@Composable
private fun GeldiMetni(il: Il, cihazAdi: String?) {
    Column(Modifier.semantics { liveRegion = LiveRegionMode.Polite }) {
        Text(if (cihazAdi != null) "$cihazAdi eklendi" else "Konumunuz geldi", color = Renkler.metinIkincil, fontSize = 30.sp)
        Spacer(Modifier.height(8.dp))
        Text(il.ad, color = Renkler.metin, fontSize = 64.sp, fontWeight = FontWeight.SemiBold, lineHeight = 72.sp)
        Spacer(Modifier.height(12.dp))
        Text("Vakitler bu konuma göre hesaplanacak.", color = Renkler.metinIkincil, fontSize = 28.sp)
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
            color = Renkler.metinIkincil, fontSize = 24.sp, lineHeight = 32.sp, textAlign = TextAlign.Center,
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
