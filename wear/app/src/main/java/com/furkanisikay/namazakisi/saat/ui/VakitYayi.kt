package com.furkanisikay.namazakisi.saat.ui

import androidx.compose.animation.Crossfade
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.CompactButton
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import com.furkanisikay.namazakisi.saat.R
import com.furkanisikay.namazakisi.saat.cekirdek.AnaEkranKarari
import com.furkanisikay.namazakisi.saat.cekirdek.GunDurumu
import com.furkanisikay.namazakisi.saat.cekirdek.SaatPaleti
import com.furkanisikay.namazakisi.saat.cekirdek.rakamlariYerellestir
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.sin

/**
 * Yay geometrisi: iz tepeden 30° sağda başlar (vakit GİRER), saat yönünde 300° döner,
 * tepeden 30° solda biter (vakit ÇIKAR). Tepedeki 60°'lik boşluk sistem saatine
 * (`TimeText`) ayrılır. Parlak kısım KALAN süredir; yay saat yönünde boşalır.
 * Compose açıları: 0° = saat 3, artı = saat yönü.
 */
const val YAY_BASLANGIC = -60f
const val YAY_TARAMA = 300f

/**
 * @param kalanOran yayın parlak kısmı [0,1]
 * @param bant kerahat bandının yaydaki konumu (giriş = 0, çıkış = 1), yayın DIŞINDA kesikli
 * @param noktaGoster "şimdi" noktası (ambient'te çizilmez)
 */
fun DrawScope.vakitYayiCiz(
    kalanOran: Float,
    renk: Color,
    iz: Color,
    kalinlik: Dp,
    bant: ClosedFloatingPointRange<Float>? = null,
    bantRengi: Color = Color.Transparent,
    noktaGoster: Boolean = true,
    kenarPay: Dp = 5.dp,
) {
    val k = kalinlik.toPx()
    val pay = kenarPay.toPx() + k * 2.2f
    val cap = min(size.width, size.height) - pay * 2
    if (cap <= 0f) return
    val solUst = Offset((size.width - cap) / 2, (size.height - cap) / 2)
    val boyut = Size(cap, cap)
    val cizgi = Stroke(width = k, cap = StrokeCap.Round)
    drawArc(iz, YAY_BASLANGIC, YAY_TARAMA, useCenter = false, topLeft = solUst, size = boyut, style = cizgi)
    val oran = kalanOran.coerceIn(0f, 1f)
    val simdiAci = YAY_BASLANGIC + YAY_TARAMA * (1f - oran)
    if (oran > 0f) {
        drawArc(renk, simdiAci, YAY_TARAMA * oran, useCenter = false, topLeft = solUst, size = boyut, style = cizgi)
    }
    if (bant != null && bantRengi != Color.Transparent) {
        val dis = k * 1.8f
        val bantBoyut = Size(cap + dis * 2, cap + dis * 2)
        val bantSolUst = Offset(solUst.x - dis, solUst.y - dis)
        drawArc(
            bantRengi,
            YAY_BASLANGIC + YAY_TARAMA * bant.start,
            YAY_TARAMA * (bant.endInclusive - bant.start),
            useCenter = false,
            topLeft = bantSolUst,
            size = bantBoyut,
            style = Stroke(width = k * 0.45f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(k * 0.9f, k * 0.6f))),
        )
    }
    if (noktaGoster) {
        val r = cap / 2
        val aci = Math.toRadians(simdiAci.toDouble())
        val merkez = Offset(solUst.x + r + (r * cos(aci)).toFloat(), solUst.y + r + (r * sin(aci)).toFloat())
        drawCircle(Color.Black, radius = k * 0.95f, center = merkez)
        drawCircle(renk, radius = k * 0.95f, center = merkez, style = Stroke(width = k * 0.5f))
    }
}

/** Ekran genişliğine göre sabit ölçekli yazı boyu: yazı ölçeği büyüse de rakam taşmaz (A9). */
@Composable
fun sabitBoyut(oran: Float): androidx.compose.ui.unit.TextUnit {
    val genislik = LocalConfiguration.current.screenWidthDp
    val yogunluk = LocalDensity.current
    return (genislik * oran / yogunluk.fontScale).sp
}

/**
 * Ekran genişliğine göre yazı boyu, kullanıcının yazı ölçeğine [enFazlaOlcek]'e kadar
 * uyar (ör. 1.15×): büyük yazı tercihi bir ölçüde işler ama 1.3–2.0 ölçekte metin yuvarlak
 * ekranın kenarına taşmaz. Rakam gibi tamamen sabit boy için [sabitBoyut].
 */
@Composable
fun sinirliBoyut(oran: Float, enFazlaOlcek: Float = YAZI_OLCEGI_TAVANI): androidx.compose.ui.unit.TextUnit {
    val genislik = LocalConfiguration.current.screenWidthDp
    val olcek = LocalDensity.current.fontScale
    return (genislik * oran * min(olcek, enFazlaOlcek) / olcek).sp
}

const val YAZI_OLCEGI_TAVANI = 1.15f

/**
 * Metin sütununun ekran genişliğine oranı (güvenli bölge): yuvarlak ekranda dairenin iç
 * karesi ≈ %71 (köşeye yazılan harfi daire keser), kare ekranda kenar payı yeter.
 */
@Composable
fun guvenliGenislikOrani(yuvarlakOran: Float = 0.70f, kareOran: Float = 0.84f): Float =
    if (LocalConfiguration.current.isScreenRound) yuvarlakOran else kareOran

/** Rakamlar sabit genişlikli (saniye değişince satır oynamasın). */
val RAKAM = TextStyle(fontFeatureSettings = "tnum")

/**
 * Ana ekranın ilk, tam ekran öğesi: vakit yayı + sayaç + "Kıldım" + gün noktaları.
 *
 * Erişilebilirlik: metin kümesi TEK düğümdür (`Gorunum.aciklama`, dakika çözünürlüklü);
 * saniye ayrı düğüm değildir, `liveRegion` YOK → TalkBack her saniye okumaz. Yay
 * dekoratiftir. "Kıldım" kendi açıklamasıyla ayrı düğümdür.
 */
@Composable
fun VakitSayaci(
    g: AnaEkranKarari.Gorunum,
    saniyeGoster: Boolean,
    onKildim: () -> Unit,
    modifier: Modifier = Modifier,
    /** Üstünde "Kıldım" onay katmanı açık mı? (nokta dolma vuruşu katman kapanınca oynar) */
    ortuluMu: Boolean = false,
) {
    val azalt = hareketAzaltilmis()
    // Açılışta 600 ms, vakit değişince 450 ms yeniden çizim (olay tetikli; boşta hareket yok).
    val ilkAcilis = remember { booleanArrayOf(true) }
    val cizim = remember(g.sayilan.hedef) { Animatable(if (azalt) 1f else 0f) }
    LaunchedEffect(g.sayilan.hedef) {
        if (!azalt) cizim.animateTo(1f, tween(if (ilkAcilis[0]) 600 else 450))
        ilkAcilis[0] = false
    }
    val renk by animateColorAsState(renk(g.renk), tween(if (azalt) 0 else 450), label = "vakitRengi")
    val kerahat = renk(SaatPaleti.KERAHAT)
    val iz = renk(SaatPaleti.IZ)

    Box(contentAlignment = Alignment.Center, modifier = modifier) {
        Canvas(Modifier.fillMaxSize()) {
            vakitYayiCiz(
                kalanOran = g.kalanOran * cizim.value,
                renk = renk,
                iz = iz,
                kalinlik = 5.dp,
                bant = g.kerahatBandi,
                bantRengi = kerahat,
            )
        }
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(horizontal = 28.dp),
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.clearAndSetSemantics { contentDescription = g.aciklama },
            ) {
                // Vakit değişince (ya da son dakikalar başlayınca) ad yumuşakça yer değiştirir;
                // olay tetikli, 300 ms, boşta hareket yok. Azaltılmış harekette anında.
                Crossfade(targetState = g.adSatiri, animationSpec = tween(if (azalt) 0 else 300), label = "vakitAdi") { ad ->
                    Text(
                        yerelRakam(ad),
                        color = renk,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold,
                        textAlign = TextAlign.Center,
                        maxLines = 1,
                    )
                }
                SureGosterimi(
                    sayac = g.sayac,
                    saniyeGoster = saniyeGoster,
                    rakamRengi = renk(SaatPaleti.METIN),
                    birimRengi = renk(SaatPaleti.METIN2),
                    saniyeRengi = if (g.acil) renk else renk(SaatPaleti.METIN2),
                )
                Text(
                    yerelRakam(g.altYazi),
                    style = MaterialTheme.typography.labelSmall,
                    color = renk(SaatPaleti.METIN2),
                    maxLines = 1,
                )
            }
            Spacer(Modifier.height(4.dp))
            // "Kıldım" → "✓ Kılındı" dönüşümü de aynı yumuşak geçişle (onay katmanı kapanınca).
            Crossfade(targetState = g.dugme, animationSpec = tween(if (azalt) 0 else 300), label = "kildimDugmesi") { d ->
                KildimDugmesi(d, g, onKildim)
            }
            if (g.noktalar.isNotEmpty()) {
                Spacer(Modifier.height(4.dp))
                GunNoktalari(g.noktalar, g.aktifNokta, renk, ortuluMu)
            }
        }
    }
}

/**
 * Birimli iri süre: "1 sa 16 dk" / "16 dk 42 sn". Rakam iri, birim küçük ve ikincil;
 * saniye parçası daha küçük (etkileşimli kipte). Dört haneli sürede ("10 sa 59 dk") rakam
 * küçülür ki yuvarlak ekranın güvenli sütununa sığsın. Boylar `sabitBoyut`: yazı ölçeği
 * büyüse de rakam taşmaz.
 */
@Composable
fun SureGosterimi(
    sayac: AnaEkranKarari.Sayac,
    saniyeGoster: Boolean,
    rakamRengi: Color,
    birimRengi: Color,
    saniyeRengi: Color,
    rakamStili: TextStyle = RAKAM,
    rakamAgirligi: FontWeight = FontWeight.SemiBold,
    birimAgirligi: FontWeight = FontWeight.Normal,
) {
    val rakamBoyu = sabitBoyut(if (sayac.haneSayisi(saniyeGoster) >= 4) 0.165f else 0.20f)
    val birimBoyu = sabitBoyut(0.072f)
    val sifir = sifirRakami()
    Row(verticalAlignment = Alignment.Bottom) {
        sayac.gorunur(saniyeGoster).forEachIndexed { i, p ->
            if (i > 0) Spacer(Modifier.width(5.dp))
            Text(
                rakamlariYerellestir(p.sayi, sifir),
                style = rakamStili,
                fontSize = if (p.saniye) sabitBoyut(0.09f) else rakamBoyu,
                fontWeight = if (p.saniye) FontWeight.Medium else rakamAgirligi,
                color = if (p.saniye) saniyeRengi else rakamRengi,
                maxLines = 1,
            )
            Text(
                p.birim,
                fontSize = birimBoyu,
                fontWeight = birimAgirligi,
                color = if (p.saniye) saniyeRengi else birimRengi,
                maxLines = 1,
                modifier = Modifier.padding(start = 2.dp, bottom = if (p.saniye) 3.dp else 6.dp),
            )
        }
    }
}

@Composable
private fun KildimDugmesi(dugme: AnaEkranKarari.Dugme, g: AnaEkranKarari.Gorunum, onKildim: () -> Unit) {
    val dil = stringResource(R.string.dil_kodu)
    val aciklama = AnaEkranKarari.dugmeAciklamasi(g.sayilan.ad(dil), dil)
    when (dugme) {
        AnaEkranKarari.Dugme.ISARETLE -> CompactButton(
            onClick = onKildim,
            colors = ButtonDefaults.buttonColors(
                containerColor = renk(SaatPaleti.EYLEM),
                contentColor = renk(SaatPaleti.EYLEM_USTU),
            ),
            modifier = Modifier.semantics { contentDescription = aciklama },
            label = { Text(stringResource(R.string.kildim), fontWeight = FontWeight.Bold) },
        )
        AnaEkranKarari.Dugme.KILINDI, AnaEkranKarari.Dugme.ESITLENIYOR -> Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .height(32.dp)
                .background(renk(SaatPaleti.YUZEY2), RoundedCornerShape(16.dp))
                .padding(horizontal = 12.dp)
                // Durum zaten sayaç açıklamasında ("kılındı") okunur; ikinci kez okunmasın.
                .clearAndSetSemantics { },
        ) {
            // Telefon onayı beklenirken metin AYNI, yalnız soluk: "✓ Kılındı · eşitleniyor"
            // yuvarlak ekranda kenara taşıp "Kılındı ·" diye kesiliyordu (kayıtta görüldü).
            Text(
                stringResource(R.string.kilindi_isareti),
                color = renk(SaatPaleti.EYLEM).copy(alpha = if (dugme == AnaEkranKarari.Dugme.ESITLENIYOR) 0.6f else 1f),
                style = MaterialTheme.typography.labelMedium,
                maxLines = 1,
            )
        }
        AnaEkranKarari.Dugme.YOK -> Unit
    }
}

/**
 * Beş farz: kılınan dolu yeşil, şu anki vakit tonunda halka, diğerleri sönük.
 * Bir nokta KILINDI'ya geçince bir kez yaylanarak dolar (ölçek 1,7 → 1, olay tetikli;
 * ekran açılışında zaten kılınmış noktalar oynamaz, boşta hareket yok). Kılınmışlık
 * "Kıldım" onay katmanının ALTINDA yazılır → vuruş katman kapanana kadar bekletilir,
 * yoksa kimse görmeden oynayıp biterdi.
 */
@Composable
private fun GunNoktalari(haller: List<GunDurumu.Hal>, aktif: Int?, aktifRenk: Color, ortuluMu: Boolean) {
    val azalt = hareketAzaltilmis()
    Row(horizontalArrangement = Arrangement.spacedBy(5.dp), modifier = Modifier.clearAndSetSemantics { }) {
        haller.forEachIndexed { i, hal ->
            val dolu = hal == GunDurumu.Hal.KILINDI
            val olcek = remember(i) { Animatable(1f) }
            // [0] önceki dolu hali, [1] oynatılmayı bekleyen vuruş var mı
            val iz = remember(i) { booleanArrayOf(dolu, false) }
            if (dolu && !iz[0]) iz[1] = true
            if (!dolu) iz[1] = false
            iz[0] = dolu
            LaunchedEffect(dolu, ortuluMu) {
                if (!iz[1] || ortuluMu) return@LaunchedEffect
                iz[1] = false
                if (azalt) return@LaunchedEffect
                olcek.snapTo(NOKTA_DOLMA_OLCEGI)
                olcek.animateTo(1f, spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMediumLow))
            }
            val m = Modifier.size(7.dp).graphicsLayer {
                scaleX = olcek.value
                scaleY = olcek.value
            }
            when {
                hal == GunDurumu.Hal.KILINDI -> Box(m.background(renk(SaatPaleti.EYLEM), CircleShape))
                i == aktif -> Box(
                    m.drawBehind {
                        drawCircle(aktifRenk, radius = size.minDimension / 2 - 1.dp.toPx(), style = Stroke(1.5.dp.toPx()))
                    }
                )
                else -> Box(m.background(renk(SaatPaleti.IZ), CircleShape))
            }
        }
    }
}

private const val NOKTA_DOLMA_OLCEGI = 1.7f

/**
 * Tek satır, KENDİNİ SIĞDIRAN metin: verilen genişliğe sığana dek [enFazla]'dan [enAz]'a
 * 0,5 sp adımlarla küçülür (Wear Compose 1.6.2'de `autoSize` yok). Yuvarlak/kare ekranda
 * halkaya değen uzun adlar için ("Elhamdülillâh", "İkindi namazını"): sabit boy taşar,
 * üç nokta ise adı keserdi. Ölçüm genişlik/metin değişince bir kez yapılır (her çizimde değil).
 */
@Composable
fun SigdirilanMetin(
    metin: String,
    enFazla: androidx.compose.ui.unit.TextUnit,
    renk: Color,
    modifier: Modifier = Modifier,
    enAz: androidx.compose.ui.unit.TextUnit = (enFazla.value * 0.6f).sp,
    agirlik: FontWeight = FontWeight.Medium,
    ortala: Boolean = true,
    stil: TextStyle = TextStyle.Default,
) {
    androidx.compose.foundation.layout.BoxWithConstraints(
        modifier,
        contentAlignment = if (ortala) Alignment.Center else Alignment.CenterStart,
    ) {
        val olcer = androidx.compose.ui.text.rememberTextMeasurer()
        val genislik = constraints.maxWidth
        // Ölçülen metin çizilen metindir: rakamlar yerel ayarın rakamıyla (ar-SA'da ٠-٩).
        val yazi = yerelRakam(metin)
        val boy = remember(yazi, genislik, enFazla, agirlik) {
            var b = enFazla.value
            while (b > enAz.value &&
                olcer.measure(
                    yazi,
                    stil.merge(TextStyle(fontSize = b.sp, fontWeight = agirlik)),
                    maxLines = 1,
                    softWrap = false,
                ).size.width > genislik
            ) {
                b -= 0.5f
            }
            b.sp
        }
        Text(
            yazi,
            style = stil,
            fontSize = boy,
            fontWeight = agirlik,
            color = renk,
            textAlign = if (ortala) TextAlign.Center else TextAlign.Start,
            maxLines = 1,
            softWrap = false,
            overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis,
        )
    }
}
