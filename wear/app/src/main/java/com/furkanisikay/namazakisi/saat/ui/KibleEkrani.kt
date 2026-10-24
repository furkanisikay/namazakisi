package com.furkanisikay.namazakisi.saat.ui

import androidx.compose.animation.Crossfade
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.AnimationSpec
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.snap
import androidx.compose.animation.core.spring
import androidx.compose.runtime.getValue
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.text.style.TextOverflow
import com.furkanisikay.namazakisi.saat.cekirdek.Kible
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.semantics.semantics
import androidx.wear.compose.material3.AppScaffold
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.CompactButton
import androidx.wear.compose.material3.FilledTonalIconButton
import androidx.wear.compose.material3.Icon
import androidx.wear.compose.material3.IconButtonDefaults
import androidx.compose.foundation.layout.size
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import com.furkanisikay.namazakisi.saat.R
import androidx.wear.compose.material3.Text
import androidx.wear.compose.material3.TimeText
import com.furkanisikay.namazakisi.saat.cekirdek.SaatPaleti
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sin

/** Kıble ekranının durumları — her biri tek bir net mesaj ya da pusula. */
sealed interface KibleGorunumu {
    data object Bekleniyor : KibleGorunumu
    /** Telefondan hiç veri gelmedi. */
    data object YukYok : KibleGorunumu
    /** Telefon konum göndermedi (konum kapalı ya da eski telefon sürümü). */
    data object KonumYok : KibleGorunumu
    /** Saatte pusula sensörü yok: açı yine yazılır (kuzeye göre derece yalan değildir). */
    data class SensorYok(val kibleAcisi: Double, val konumAdi: String) : KibleGorunumu
    data class Olculuyor(val kibleAcisi: Double, val konumAdi: String) : KibleGorunumu
    data class Pusula(
        val kibleAcisi: Double,
        val konumAdi: String,
        /** Saatin baktığı gerçek yön (çizim için sarılmamış). */
        val yonCizim: Double,
        /** Kıblenin saate göre açısı (çizim için sarılmamış). */
        val hedefCizim: Double,
        val hizali: Boolean,
        /** TalkBack — 10°'lik adımlarla değişir. */
        val erisim: String,
        /** Büyük satır: "Sağa 35°" (5°'lik adım, `KibleKarari.donusMetni`). */
        val donus: String,
        val egimIpucu: Boolean,
        val kalibrasyon: Boolean,
    ) : KibleGorunumu
}

/*
 * Ekran metinleri SÖZLEŞMEDİR: kare hattı (`scripts/saat-kare-hatti.sh`, `08-kible`)
 * içerik açıklamasından "sensörü bulunmuyor" ile sensörsüz emülatörü ayırt eder
 * (`R.string.kible_sensor_yok`, Türkçe metin değişmedi; hat Türkçe cihaz dilinde koşmalı).
 */

/**
 * Kıble pusulası: kenarda dönen kadran (5°'lik çentikler, K/D/G/B), üstte saatin baktığı
 * yönü gösteren sabit işaret, halkada Kâbe ve baktığınız yönden Kâbe'ye en kısa yolu
 * gösteren altın yay; ortada "Sağa 35°". Kâbe işarete gelince (hizada) halka yeşile döner,
 * hâle yayılır, Kâbe bir kez oturur ve ortada "Kıble yönündesiniz" yazar (titreşim aynı
 * an, bir kez). Açılar yumuşak süzülür (uyarlamalı süzgeç + kısa yay). Kibar "siz".
 */
@Composable
fun KibleEkrani(
    g: KibleGorunumu,
    /** Titreşimle yönlendirme (saat W3, fikir 6) açık mı? */
    yonlendirme: Boolean = false,
    onYonlendirme: (() -> Unit)? = null,
    /** "Telefonda açın" (saat W3, fikir 4) — ayrıntılı kıble/harita telefonda. */
    onTelefondaAc: (() -> Unit)? = null,
) {
    SaatTemasi {
        AppScaffold(timeText = { TimeText() }) {
            Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                when (g) {
                    KibleGorunumu.Bekleniyor -> Mesaj(stringResource(R.string.kible_olculuyor))
                    KibleGorunumu.YukYok -> Mesaj(stringResource(R.string.kible_yuk_yok))
                    KibleGorunumu.KonumYok -> Mesaj(stringResource(R.string.kible_konum_yok))
                    is KibleGorunumu.SensorYok -> Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Mesaj(
                            stringResource(R.string.kible_sensor_yok),
                            alt = stringResource(R.string.kible_kuzeyden, derece(g.kibleAcisi)) + "\n" + g.konumAdi,
                        )
                        if (onTelefondaAc != null) {
                            val aciklama = stringResource(R.string.kible_telefonda_ac)
                            CompactButton(
                                onClick = onTelefondaAc,
                                colors = ButtonDefaults.filledTonalButtonColors(),
                                modifier = Modifier.padding(top = 6.dp).semantics { contentDescription = aciklama },
                                label = { Text(stringResource(R.string.telefonda_acin)) },
                            )
                        }
                    }
                    is KibleGorunumu.Olculuyor -> {
                        Halka(yonCizim = 0.0, hedefCizim = null, hizali = false)
                        Mesaj(
                            stringResource(R.string.kible_olculuyor),
                            alt = stringResource(R.string.kible_derece, derece(g.kibleAcisi)) + "\n" + g.konumAdi,
                        )
                    }
                    is KibleGorunumu.Pusula -> PusulaIcerigi(g, yonlendirme, onYonlendirme)
                }
            }
        }
    }
}

@Composable
private fun PusulaIcerigi(g: KibleGorunumu.Pusula, yonlendirme: Boolean, onYonlendirme: (() -> Unit)?) {
    val azalt = hareketAzaltilmis()
    // Sensör ≈ 15 Hz gelir; her örnekte açı sıçramasın diye çizim açıları kısa, aşmasız bir
    // yayla hedefe süzülür (uyarlamalı süzgecin ÜSTÜNE ≈ 100 ms). Değerler sarılmamış
    // (`enKisaYol`) olduğu için 359 → 1 geçişinde yay dolaşmaz. Azaltılmış harekette anında.
    val yay: AnimationSpec<Float> = if (azalt) snap() else spring(dampingRatio = Spring.DampingRatioNoBouncy, stiffness = Spring.StiffnessMediumLow)
    val yon by animateFloatAsState(g.yonCizim.toFloat(), yay, label = "kibleYon")
    val hedef by animateFloatAsState(g.hedefCizim.toFloat(), yay, label = "kibleHedef")
    // Hizada iç zemine yeşil hâle yumuşakça gelir/gider (olay tetikli, 300 ms; sonra durağan).
    val hale by animateFloatAsState(if (g.hizali) 1f else 0f, if (azalt) snap() else tween(300), label = "kibleHale")
    val aciklama = stringResource(R.string.kible_erisim, g.erisim, derece(g.kibleAcisi), g.konumAdi)
    val hizaliMetni = stringResource(R.string.kible_hizali)
    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier.fillMaxSize(),
    ) {
        Halka(
            yonCizim = yon.toDouble(),
            hedefCizim = hedef.toDouble(),
            hizali = g.hizali,
            vurgu = hizaVurgusu(g.hizali),
            kabeOturma = kabeOturmasi(g.hizali),
            hale = hale,
        )
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.fillMaxWidth(guvenliGenislikOrani(yuvarlakOran = 0.58f, kareOran = 0.64f)),
        ) {
            // Metinler TEK düğüm; açıklama yalnız 10°'lik adımda değişir (liveRegion YOK). Titreşim
            // düğmesi bu düğümün DIŞINDA kalır (ekran okuyucu onu ayrıca bulup dokunabilsin).
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth().clearAndSetSemantics {
                    contentDescription = aciklama
                },
            ) {
                Crossfade(targetState = g.hizali, animationSpec = tween(if (azalt) 0 else 250), label = "kibleBaslik") { hizali ->
                    Text(
                        if (hizali) hizaliMetni else g.donus,
                        style = RAKAM,
                        fontSize = sinirliBoyut(if (hizali) 0.068f else 0.095f),
                        fontWeight = FontWeight.SemiBold,
                        color = renk(if (hizali) SaatPaleti.EYLEM else SaatPaleti.METIN),
                        textAlign = TextAlign.Center,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
                Text(
                    stringResource(R.string.kible_derece, derece(g.kibleAcisi)),
                    fontSize = sinirliBoyut(0.05f),
                    color = renk(SaatPaleti.METIN),
                    textAlign = TextAlign.Center,
                    maxLines = 1,
                )
                Text(
                    g.konumAdi,
                    fontSize = sinirliBoyut(0.042f),
                    color = renk(SaatPaleti.METIN2),
                    textAlign = TextAlign.Center,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                // Uyarılar tek satırda, öncelik sırasıyla: kalibrasyon yönü bozar, eğim azaltır.
                val ipucu = when {
                    g.kalibrasyon -> stringResource(R.string.kible_kalibrasyon)
                    g.egimIpucu -> stringResource(R.string.kible_egim)
                    else -> null
                }
                if (ipucu != null) {
                    Text(
                        ipucu,
                        fontSize = sinirliBoyut(0.044f),
                        color = renk(SaatPaleti.KERAHAT),
                        textAlign = TextAlign.Center,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.padding(top = 2.dp),
                    )
                }
            }
            if (onYonlendirme != null) TitresimDugmesi(yonlendirme, onYonlendirme)
        }
    }
}

/**
 * Titreşimle yönlendirme: kalıcı metin hapı DEĞİL (alt kenarda Kâbe işaretinin üstüne
 * biniyordu), orta sütunda küçük ikon düğmesi. Açık/kapalı simgeden (dalgalı / çizili)
 * ve ekran okuyucu açıklamasından okunur.
 */
@Composable
private fun TitresimDugmesi(acik: Boolean, onDokun: () -> Unit) {
    val aciklama = stringResource(if (acik) R.string.kible_titresim_acik else R.string.kible_titresim_kapali)
    FilledTonalIconButton(
        onClick = onDokun,
        modifier = Modifier
            .padding(top = 4.dp)
            .size(IconButtonDefaults.SmallButtonSize)
            .semantics { contentDescription = aciklama },
    ) {
        Icon(
            painterResource(if (acik) R.drawable.ic_titresim else R.drawable.ic_titresim_kapali),
            contentDescription = null,
            modifier = Modifier.size(IconButtonDefaults.SmallIconSize),
        )
    }
}

@Composable
private fun Mesaj(metin: String, alt: String? = null) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.fillMaxWidth(guvenliGenislikOrani()),
    ) {
        Text(
            metin,
            fontSize = sinirliBoyut(0.058f),
            color = renk(SaatPaleti.METIN),
            textAlign = TextAlign.Center,
            maxLines = 5,
            overflow = TextOverflow.Ellipsis,
        )
        if (alt != null) {
            Text(
                alt,
                fontSize = sinirliBoyut(0.046f),
                color = renk(SaatPaleti.METIN2),
                textAlign = TextAlign.Center,
                maxLines = 3,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.padding(top = 6.dp),
            )
        }
    }
}

/**
 * Pusula kadranı (dekoratif — anlam `PusulaIcerigi`'nin tek erişim düğümünde):
 *  - Dünya sabit katman `-yon` kadar döner: 5°'de bir çentik, 30°'de uzun çentik, ana
 *    yönlerde K/D/G/B harfleri (harfler dik kalır), kuzeyde üçgen.
 *  - Üstte sabit "baktığınız yön" işareti (aşağı bakan üçgen).
 *  - Halka izinde, baktığınız yönden Kâbe'ye EN KISA yoldan altın bir yay: hangi yöne ve ne
 *    kadar döneceğiniz bakışta okunur; hizaya geldikçe kısalır, hizada halka yeşile döner.
 *  - Kâbe işareti: siyah küp, altın kenar ve kuşak (kiswe); hizada yeşil olur ve bir kez
 *    yaylanarak "oturur".
 * Yuvarlak ve kare ekranda çember ekranın kısa kenarına sığar (kenar payı sabit).
 */
@Composable
private fun Halka(
    yonCizim: Double,
    hedefCizim: Double?,
    hizali: Boolean,
    vurgu: Float = 0f,
    kabeOturma: Float = 1f,
    hale: Float = 0f,
) {
    val ikincil = renk(SaatPaleti.METIN2)
    val metin = renk(SaatPaleti.METIN)
    val eylem = renk(SaatPaleti.EYLEM)
    val altin = renk(SaatPaleti.KERAHAT)
    val kabeGovde = renk(SaatPaleti.KABE)
    val olcucu = rememberTextMeasurer()
    val harfStili = TextStyle(fontSize = sabitBoyut(0.045f), fontWeight = FontWeight.SemiBold)
    // Yön harfleri sözlükten (JS `kible.harf`: K/D/G/B ↔ N/E/S/W); dil değişince yeniden ölçülür.
    val yonHarfleri = listOf(
        stringResource(R.string.kible_harf_kuzey),
        stringResource(R.string.kible_harf_dogu),
        stringResource(R.string.kible_harf_guney),
        stringResource(R.string.kible_harf_bati),
    )
    val harfler = remember(harfStili, yonHarfleri) { yonHarfleri.map { olcucu.measure(it, harfStili) } }
    Canvas(Modifier.fillMaxSize().padding(4.dp)) {
        val r = min(size.width, size.height) / 2f
        val merkez = center
        val kalinlik = 6.dp.toPx()
        val izYaricap = r - kalinlik / 2f

        // Hizada iç zemine yumuşak yeşil hâle (radyal; dekoratif, metin rengi değişmez).
        if (hale > 0f) {
            drawCircle(
                Brush.radialGradient(
                    listOf(eylem.copy(alpha = 0.28f * hale), eylem.copy(alpha = 0f)),
                    center = merkez,
                    radius = r,
                ),
                radius = r - kalinlik,
                center = merkez,
            )
        }
        // İz: hizadayken yeşile yakın ton.
        // İz koyu yeşil-siyah (`IZ`) idi ve siyah zeminde neredeyse görünmüyordu: ikincil metin
        // tonunun yarı saydamı daha okunur, altın yay ve Kâbe yine öne çıkar.
        drawCircle(if (hizali) eylem.copy(alpha = 0.5f) else ikincil.copy(alpha = 0.32f), radius = izYaricap, style = Stroke(kalinlik))
        // Hizaya giriş vurgusu: yeşil halka bir kez dolup içe doğru söner (0 ve 1'de çizim yok).
        if (vurgu > 0f && vurgu < 1f) {
            val kalin = kalinlik * (1f + 2f * (1f - vurgu))
            drawCircle(eylem.copy(alpha = 1f - vurgu), radius = r - kalin / 2f, style = Stroke(kalin))
        }

        // Baktığınız yönden Kâbe'ye en kısa yol (işaretli derece: + sağ, − sol).
        if (hedefCizim != null && !hizali) {
            val h = Kible.dereceSar(hedefCizim)
            val isaretli = if (h > 180.0) h - 360.0 else h
            drawArc(
                altin.copy(alpha = 0.9f),
                startAngle = -90f,
                sweepAngle = isaretli.toFloat(),
                useCenter = false,
                topLeft = Offset(merkez.x - izYaricap, merkez.y - izYaricap),
                size = Size(izYaricap * 2, izYaricap * 2),
                style = Stroke(kalinlik * 0.55f, cap = StrokeCap.Round),
            )
        }

        // Dünya sabit işaretler (kadran). Çentikler `rotate` ile, harfler dik çizilir.
        val icKenar = r - kalinlik - 2.dp.toPx()
        rotate(-yonCizim.toFloat(), merkez) {
            for (i in 0 until 72) {
                val aci = Math.toRadians(i * 5.0)
                val uzun = i % 6 == 0
                val boy = if (uzun) 7.dp.toPx() else 3.dp.toPx()
                drawLine(
                    if (uzun) metin.copy(alpha = 0.85f) else ikincil.copy(alpha = 0.8f),
                    nokta(merkez, icKenar - boy, aci),
                    nokta(merkez, icKenar, aci),
                    strokeWidth = (if (uzun) 1.5.dp else 1.dp).toPx(),
                    cap = StrokeCap.Round,
                )
            }
            ucgen(merkez, icKenar - 8.dp.toPx(), 0.0, 5.dp.toPx(), metin)
        }
        val harfYaricap = icKenar - 21.dp.toPx()
        harfler.forEachIndexed { i, sonuc ->
            if (i == 0) return@forEachIndexed // Kuzey zaten üçgenle işaretli; "K" üçgenin altında.
            val aci = Math.toRadians(i * 90.0 - yonCizim)
            val yer = nokta(merkez, harfYaricap, aci)
            drawText(
                sonuc,
                color = ikincil,
                topLeft = Offset(yer.x - sonuc.size.width / 2f, yer.y - sonuc.size.height / 2f),
            )
        }
        val kAci = Math.toRadians(-yonCizim)
        val kYer = nokta(merkez, harfYaricap - 2.dp.toPx(), kAci)
        drawText(
            harfler[0],
            color = metin,
            topLeft = Offset(kYer.x - harfler[0].size.width / 2f, kYer.y - harfler[0].size.height / 2f),
        )

        // Baktığınız yön: üstte sabit, aşağı bakan üçgen (halkanın dışına taşmaz).
        val ust = Offset(merkez.x, merkez.y - r + kalinlik + 1.dp.toPx())
        val yari = 6.dp.toPx()
        drawPath(
            Path().apply {
                moveTo(ust.x - yari, merkez.y - r)
                lineTo(ust.x + yari, merkez.y - r)
                lineTo(ust.x, ust.y + 4.dp.toPx())
                close()
            },
            if (hizali) eylem else metin,
        )

        if (hedefCizim != null) {
            // Kâbe: antrasit dolu küp + ince açık kenar + dolu altın kuşak + küçük kapı;
            // halkanın içinde, kıble açısında.
            val aci = Math.toRadians(hedefCizim)
            val vurguRengi = if (hizali) eylem else altin
            val kenar = 10.dp.toPx() * kabeOturma
            // Merkez halkanın içinde: küp dönse de (köşegen = kenar·√2) ekran kenarına değmez.
            val yer = nokta(merkez, r - kalinlik - 2.dp.toPx() - 10.dp.toPx() * 1.45f, aci)
            rotate(hedefCizim.toFloat(), yer) {
                val sol = Offset(yer.x - kenar, yer.y - kenar)
                val boyut = Size(kenar * 2, kenar * 2)
                drawRect(kabeGovde, topLeft = sol, size = boyut)
                drawRect(
                    if (hizali) eylem else metin.copy(alpha = 0.6f),
                    topLeft = sol,
                    size = boyut,
                    style = Stroke(1.dp.toPx()),
                )
                // Kuşak (kiswe şeridi): üst üçte birde, DOLU bant.
                drawRect(
                    vurguRengi,
                    topLeft = Offset(sol.x, yer.y - kenar * 0.52f),
                    size = Size(kenar * 2, kenar * 0.32f),
                )
                // Kapı: alt kenarda, ortanın biraz sağında küçük altın dikdörtgen.
                drawRect(
                    vurguRengi,
                    topLeft = Offset(yer.x + kenar * 0.12f, yer.y + kenar * 0.28f),
                    size = Size(kenar * 0.42f, kenar * 0.72f),
                )
            }
        }
    }
}

/**
 * Hizaya GİRİŞTE tek seferlik vurgu (titreşimle aynı an): 0→1, 700 ms, sonra sus.
 * Hizadan çıkışta hiçbir şey oynamaz; azaltılmış harekette hiç oynamaz (metin + renk
 * zaten "Kıble yönündesiniz" der — bilgi yalnız hareketle verilmez).
 */
@Composable
private fun hizaVurgusu(hizali: Boolean): Float {
    val azalt = hareketAzaltilmis()
    val vurgu = remember { Animatable(0f) }
    LaunchedEffect(hizali) {
        if (hizali && !azalt) {
            vurgu.snapTo(0f)
            vurgu.animateTo(1f, tween(HIZA_VURGU_MS, easing = FastOutSlowInEasing))
        } else {
            vurgu.snapTo(0f)
        }
    }
    return vurgu.value
}

/** Hizaya girişte Kâbe işareti bir kez büyüyüp yaylanarak oturur (ölçek 1,35 → 1); çıkışta yok. */
@Composable
private fun kabeOturmasi(hizali: Boolean): Float {
    val azalt = hareketAzaltilmis()
    val olcek = remember { Animatable(1f) }
    LaunchedEffect(hizali) {
        if (hizali && !azalt) {
            olcek.snapTo(KABE_OTURMA_OLCEGI)
            olcek.animateTo(1f, spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMediumLow))
        } else {
            olcek.snapTo(1f)
        }
    }
    return olcek.value
}

private const val HIZA_VURGU_MS = 700
private const val KABE_OTURMA_OLCEGI = 1.35f

/** Merkezden `yaricap` uzaklıkta, kuzeyden saat yönünde `aci` (radyan) noktası. */
private fun nokta(merkez: Offset, yaricap: Float, aci: Double): Offset =
    Offset(merkez.x + yaricap * sin(aci).toFloat(), merkez.y - yaricap * cos(aci).toFloat())

/** Dışa bakan üçgen: tepe `yaricap`'ta, `aciDerece` yönünde. */
private fun DrawScope.ucgen(merkez: Offset, yaricap: Float, aciDerece: Double, boy: Float, renk: Color) {
    val a = Math.toRadians(aciDerece)
    val tepe = nokta(merkez, yaricap, a)
    val tabanMerkez = nokta(merkez, yaricap - boy * 1.4f, a)
    val dik = Offset(cos(a).toFloat(), sin(a).toFloat())
    val yol = Path().apply {
        moveTo(tepe.x, tepe.y)
        lineTo(tabanMerkez.x + dik.x * boy, tabanMerkez.y + dik.y * boy)
        lineTo(tabanMerkez.x - dik.x * boy, tabanMerkez.y - dik.y * boy)
        close()
    }
    drawPath(yol, renk)
}

private fun derece(aci: Double): Int = aci.roundToInt() % 360
